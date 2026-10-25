import type { SshDependencies } from "./runtime.ts";
import type { AddressInfo } from "node:net";
import type { ServerChannel } from "ssh2";

import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { connect, createServer } from "node:net";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { Server, utils } from "ssh2";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import { sshOutputByteLimit } from "./actions.ts";
import { readSshCredential, runSshCommand, validateSshCredential } from "./runtime.ts";

const hasOpenSshClient = spawnSync("ssh", ["-V"]).status === 0;
const sshdPath = "/usr/sbin/sshd";
const hasOpenSshServer = hasOpenSshClient && spawnSync(sshdPath, ["-V"]).error === undefined;

const hostKey = utils.generateKeyPairSync("ed25519");
const userKey = utils.generateKeyPairSync("ed25519");
const hostKeyBlob = parsePublicKey(hostKey.public).getPublicSSH();
const hostKeyFingerprint = `SHA256:${createHash("sha256").update(hostKeyBlob).digest("base64").replace(/=+$/, "")}`;
const otherFingerprint = `SHA256:${"A".repeat(43)}`;
const gatewayUsername = "ibssh_token123";

const commands: Record<string, (channel: ServerChannel) => void> = {
  report(channel) {
    channel.write("hello\n");
    channel.stderr.write("warning\n");
    channel.exit(3);
    channel.end();
  },
  flood(channel) {
    channel.write(Buffer.alloc(sshOutputByteLimit + 10, "a"));
    channel.exit(0);
    channel.end();
  },
  killed(channel) {
    channel.exit("KILL");
    channel.end();
  },
  hang() {},
};

let server: Server;
let passwordValues: Record<string, string>;

beforeAll(async () => {
  const userPublicKey = parsePublicKey(userKey.public);
  server = new Server({ hostKeys: [hostKey.private] }, (client) => {
    client.on("authentication", (context) => {
      if (context.method === "none" && context.username === gatewayUsername) {
        context.accept();
        return;
      }
      if (context.method === "password" && context.username === "deploy" && context.password === "secret") {
        context.accept();
        return;
      }
      if (
        context.method === "publickey" &&
        context.username === "deploy" &&
        context.key.data.equals(userPublicKey.getPublicSSH()) &&
        (!context.signature || userPublicKey.verify(context.blob!, context.signature, context.hashAlgo))
      ) {
        context.accept();
        return;
      }
      context.reject(["password", "publickey"]);
    });
    client.on("ready", () => {
      client.on("session", (acceptSession) => {
        acceptSession().on("exec", (acceptExec, _reject, info) => {
          commands[info.command]?.(acceptExec());
        });
      });
    });
    client.on("error", () => undefined);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  passwordValues = { host: "ssh.example.com", port: String(port), username: "deploy", password: "secret" };
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

/** Resolve every host to a public address, then dial the local test server instead. */
function localServer(): SshDependencies & { dialAddress: ReturnType<typeof vi.fn> } {
  return {
    lookup: async () => [{ address: "93.184.216.34", family: 4 }],
    dialAddress: vi.fn((_address: string) => "127.0.0.1"),
  };
}

function parsePublicKey(key: string) {
  const parsed = utils.parseKey(key);
  if (parsed instanceof Error) {
    throw parsed;
  }
  return parsed;
}

async function rejectionOf(promise: Promise<unknown>): Promise<ProviderRequestError> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(ProviderRequestError);
  return error as ProviderRequestError;
}

describe("ssh credential", () => {
  it("rejects credentials that cannot identify a server or log in", () => {
    const values = { host: "ssh.example.com", username: "deploy", password: "secret" };

    expect(() => readSshCredential({ host: "ssh.example.com", username: "deploy" })).toThrow(
      "Provide either a password or a private key, or set authMethod to none",
    );
    expect(() => readSshCredential({ ...values, host: "deploy@ssh.example.com" })).toThrow(
      "host must be a hostname or IPv4 address",
    );
    expect(() => readSshCredential({ ...values, port: "70000" })).toThrow("port must be between 1 and 65535.");
    expect(() => readSshCredential({ ...values, hostKeyFingerprint: "aa:bb:cc" })).toThrow(
      "hostKeyFingerprint must be a SHA256 fingerprint",
    );
    expect(() => readSshCredential({ ...values, authMethod: "token" })).toThrow(
      "authMethod must be password, privateKey, or none.",
    );
    expect(() => readSshCredential({ ...values, authMethod: "none" })).toThrow("leave both empty");
    expect(() => readSshCredential({ ...values, authMethod: "privateKey" })).toThrow(
      "authMethod privateKey needs a private key.",
    );
  });

  it("accepts a login with neither a password nor a private key when authMethod is none", () => {
    const credential = readSshCredential({ host: "gw.example.com", username: gatewayUsername, authMethod: "None" });

    expect(credential).toMatchObject({ authMethod: "none", password: undefined, privateKey: undefined });
  });

  it("keeps only the secret the chosen method uses", () => {
    const credential = readSshCredential({
      host: "ssh.example.com",
      username: "deploy",
      authMethod: "password",
      password: "secret",
      privateKey: "unused",
    });

    expect(credential).toMatchObject({ password: "secret", privateKey: undefined });
  });
});

describe.skipIf(!hasOpenSshClient)("ssh runtime", () => {
  it("returns the exit code and both output streams of a command", async () => {
    const dependencies = localServer();

    const result = await runSshCommand(
      { command: "report" },
      { credential: readSshCredential(passwordValues), dependencies },
    );

    expect(result).toEqual({
      exitCode: 3,
      stdout: "hello\n",
      stderr: "warning\n",
      stdoutTruncated: false,
      stderrTruncated: false,
    });
    expect(dependencies.dialAddress).toHaveBeenCalledWith("93.184.216.34");
  });

  it("reports no exit code for a command ended by a signal", async () => {
    const result = await runSshCommand(
      { command: "killed" },
      { credential: readSshCredential(passwordValues), dependencies: localServer() },
    );

    expect(result.exitCode).toBeNull();
  });

  it("cuts output at the byte limit and flags it", async () => {
    const result = await runSshCommand(
      { command: "flood" },
      { credential: readSshCredential(passwordValues), dependencies: localServer() },
    );

    expect(result.stdout).toHaveLength(sshOutputByteLimit);
    expect(result.stdoutTruncated).toBe(true);
    expect(result.stderrTruncated).toBe(false);
  });

  it("logs in with a private key whose line breaks were escaped", async () => {
    const credential = readSshCredential({
      host: "ssh.example.com",
      port: passwordValues.port!,
      username: "deploy",
      privateKey: userKey.private.replaceAll("\n", "\\n"),
    });

    const result = await runSshCommand({ command: "report" }, { credential, dependencies: localServer() });

    expect(result.exitCode).toBe(3);
  });

  it("logs in with the username alone when authMethod is none", async () => {
    const values = {
      host: "gw.example.com",
      port: passwordValues.port!,
      username: gatewayUsername,
      authMethod: "none",
    };

    const validation = await validateSshCredential(values, undefined, localServer());
    const result = await runSshCommand(
      { command: "report" },
      { credential: readSshCredential(values, validation.metadata), dependencies: localServer() },
    );

    expect(result.exitCode).toBe(3);
  });

  it("explains a refused login without a password or private key", async () => {
    const values = { host: "gw.example.com", port: passwordValues.port!, username: "deploy", authMethod: "none" };

    const error = await rejectionOf(validateSshCredential(values, undefined, localServer()));

    expect(error.status).toBe(400);
    expect(error.message).toContain("did not accept a login without a password or private key");
  });

  it("records the host key on validation and refuses a different one later", async () => {
    const validation = await validateSshCredential(passwordValues, undefined, localServer());
    const account = `deploy@ssh.example.com:${passwordValues.port}`;

    expect(validation.profile).toEqual({ accountId: account, displayName: account, grantedScopes: [] });
    expect(validation.metadata).toEqual({
      hostKeyFingerprint,
      hostKey: `ssh-ed25519 ${hostKeyBlob.toString("base64")}`,
    });

    const error = await rejectionOf(
      runSshCommand(
        { command: "report" },
        {
          credential: readSshCredential(passwordValues, { hostKeyFingerprint: otherFingerprint }),
          dependencies: localServer(),
        },
      ),
    );
    expect(error.status).toBe(502);
    expect(error.message).toContain(`presented ${hostKeyFingerprint}`);
  });

  it("checks connections saved with only a fingerprint against the key the server presents", async () => {
    const result = await runSshCommand(
      { command: "report" },
      { credential: readSshCredential(passwordValues, { hostKeyFingerprint }), dependencies: localServer() },
    );

    expect(result.exitCode).toBe(3);
  });

  it("prefers a configured fingerprint over the recorded one", async () => {
    const credential = readSshCredential(
      { ...passwordValues, hostKeyFingerprint: hostKeyFingerprint.replace("SHA256:", "sha256:") + "=" },
      { hostKeyFingerprint: otherFingerprint },
    );

    const result = await runSshCommand({ command: "report" }, { credential, dependencies: localServer() });

    expect(result.exitCode).toBe(3);
  });

  it("asks to reconnect when the password stops working, but reports a field error while saving", async () => {
    const values = { ...passwordValues, password: "wrong" };

    const executeError = await rejectionOf(
      runSshCommand({ command: "report" }, { credential: readSshCredential(values), dependencies: localServer() }),
    );
    const validateError = await rejectionOf(validateSshCredential(values, undefined, localServer()));

    expect(executeError.status).toBe(401);
    expect(validateError.status).toBe(400);
    expect(validateError.message).toBe(
      "SSH authentication failed for deploy@ssh.example.com. Check the password or private key.",
    );
  });

  it("reports a private key the client cannot load as a field error", async () => {
    const values = { host: "ssh.example.com", port: passwordValues.port!, username: "deploy", privateKey: "junk" };

    const error = await rejectionOf(validateSshCredential(values, undefined, localServer()));

    expect(error.status).toBe(400);
    expect(error.message).toMatch(/^privateKey could not be loaded: /);
  });

  it("stops a command that outlives its timeout", async () => {
    const error = await rejectionOf(
      runSshCommand(
        { command: "hang", timeoutSeconds: 1 },
        { credential: readSshCredential(passwordValues), dependencies: localServer() },
      ),
    );

    expect(error.status).toBe(504);
  });

  it("refuses a host that resolves to a private address before connecting", async () => {
    const dependencies = { ...localServer(), lookup: async () => [{ address: "10.0.0.5", family: 4 }] };

    const error = await rejectionOf(validateSshCredential(passwordValues, undefined, dependencies));

    expect(error.status).toBe(400);
    expect(dependencies.dialAddress).not.toHaveBeenCalled();
  });

  it("reports a missing OpenSSH client", async () => {
    const error = await rejectionOf(
      validateSshCredential(passwordValues, undefined, { ...localServer(), sshPath: "/nonexistent/ssh" }),
    );

    expect(error.status).toBe(502);
    expect(error.message).toContain("OpenSSH client (/nonexistent/ssh) is not installed");
  });
});

describe.skipIf(!hasOpenSshServer)("ssh runtime against an OpenSSH server with a host certificate", () => {
  let workspace: string;
  let sshd: ReturnType<typeof spawn>;
  let values: Record<string, string>;
  let certifiedKeyFingerprint: string;

  beforeAll(async () => {
    workspace = await mkdtemp(join(tmpdir(), "open-connector-sshd-test-"));
    const keygen = (...args: string[]): void => {
      const result = spawnSync("ssh-keygen", ["-q", ...args], { cwd: workspace });
      expect(result.status, result.stderr?.toString()).toBe(0);
    };
    keygen("-t", "ed25519", "-N", "", "-f", "ca");
    keygen("-t", "ed25519", "-N", "", "-f", "host");
    keygen("-s", "ca", "-I", "gateway", "-h", "-n", "gw.example.com", "-V", "-5m:+1h", "host.pub");
    keygen("-t", "ed25519", "-N", "", "-f", "user");
    const fingerprint = spawnSync("ssh-keygen", ["-lf", "host-cert.pub"], { cwd: workspace }).stdout.toString();
    certifiedKeyFingerprint = fingerprint.split(" ")[1]!;

    const port = await freePort();
    await writeFile(
      join(workspace, "sshd_config"),
      [
        `Port ${port}`,
        "ListenAddress 127.0.0.1",
        `HostKey ${join(workspace, "host")}`,
        `HostCertificate ${join(workspace, "host-cert.pub")}`,
        // Offer only the certificate, as access gateways such as Instabox do.
        "HostKeyAlgorithms ssh-ed25519-cert-v01@openssh.com",
        `AuthorizedKeysFile ${join(workspace, "user.pub")}`,
        "PasswordAuthentication no",
        "KbdInteractiveAuthentication no",
        "UsePAM no",
        "StrictModes no",
        `PidFile ${join(workspace, "sshd.pid")}`,
        "",
      ].join("\n"),
    );
    sshd = spawn(sshdPath, ["-D", "-e", "-f", join(workspace, "sshd_config")], { stdio: "ignore" });
    await waitForPort(port);
    values = {
      host: "gw.example.com",
      port: String(port),
      username: userInfo().username,
      privateKey: await readFile(join(workspace, "user"), "utf8"),
    };
  });

  afterAll(async () => {
    sshd?.kill();
    await rm(workspace, { recursive: true, force: true });
  });

  it("pins the certified key and runs commands", async () => {
    const validation = await validateSshCredential(values, undefined, localServer());

    expect(validation.metadata).toMatchObject({ hostKeyFingerprint: certifiedKeyFingerprint });
    expect(validation.metadata?.hostKey).toMatch(/^ssh-ed25519 /);

    const result = await runSshCommand(
      { command: "echo certified; exit 5" },
      { credential: readSshCredential(values, validation.metadata), dependencies: localServer() },
    );
    expect(result).toMatchObject({ exitCode: 5, stdout: "certified\n" });
  });

  it("refuses a certificate whose key does not match the configured fingerprint", async () => {
    const error = await rejectionOf(
      validateSshCredential({ ...values, hostKeyFingerprint: otherFingerprint }, undefined, localServer()),
    );

    expect(error.status).toBe(400);
    expect(error.message).toContain(`presented ${certifiedKeyFingerprint}`);
  });
});

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const { port } = probe.address() as AddressInfo;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

async function waitForPort(port: number): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const connected = await new Promise<boolean>((resolve) => {
      const socket = connect({ host: "127.0.0.1", port }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => resolve(false));
    });
    if (connected) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`sshd did not start listening on port ${port}`);
}
