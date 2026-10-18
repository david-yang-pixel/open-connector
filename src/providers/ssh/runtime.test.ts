import type { SshDependencies } from "./runtime.ts";
import type { AddressInfo, TcpNetConnectOpts } from "node:net";
import type { ServerChannel } from "ssh2";

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { connect } from "node:net";
import { Server, utils } from "ssh2";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import { sshOutputByteLimit } from "./actions.ts";
import { readSshCredential, runSshCommand, validateSshCredential } from "./runtime.ts";

const hostKey = utils.generateKeyPairSync("ed25519");
const userKey = utils.generateKeyPairSync("ed25519");
const hostKeyFingerprint = `SHA256:${createHash("sha256")
  .update(parsePublicKey(hostKey.public).getPublicSSH())
  .digest("base64")
  .replace(/=+$/, "")}`;

const passwordValues = { host: "ssh.example.com", username: "deploy", password: "secret" };

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
let serverPort: number;

beforeAll(async () => {
  const userPublicKey = parsePublicKey(userKey.public);
  server = new Server({ hostKeys: [hostKey.private] }, (client) => {
    client.on("authentication", (context) => {
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
      context.reject();
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
  serverPort = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function localServer(): SshDependencies & { connectSocket: ReturnType<typeof vi.fn> } {
  return {
    lookup: async () => [{ address: "93.184.216.34", family: 4 }],
    connectSocket: vi.fn((_options: TcpNetConnectOpts) => connect({ host: "127.0.0.1", port: serverPort })),
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

describe("ssh runtime", () => {
  it("returns the exit code and both output streams of a command", async () => {
    const dependencies = localServer();

    const result = await runSshCommand(
      { command: "report" },
      { credential: readSshCredential(passwordValues), dependencies },
    );

    expect(result).toEqual({
      exitCode: 3,
      signal: null,
      stdout: "hello\n",
      stderr: "warning\n",
      stdoutTruncated: false,
      stderrTruncated: false,
    });
    expect(dependencies.connectSocket).toHaveBeenCalledWith(
      expect.objectContaining({ host: "ssh.example.com", port: 22 }),
    );
  });

  it("reports the signal that ended a command", async () => {
    const result = await runSshCommand(
      { command: "killed" },
      { credential: readSshCredential(passwordValues), dependencies: localServer() },
    );

    expect(result).toMatchObject({ exitCode: null, signal: "SIGKILL" });
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
      username: "deploy",
      privateKey: userKey.private.replaceAll("\n", "\\n"),
    });

    const result = await runSshCommand({ command: "report" }, { credential, dependencies: localServer() });

    expect(result.exitCode).toBe(3);
  });

  it("records the host key on validation and refuses a different one later", async () => {
    const validation = await validateSshCredential(passwordValues, undefined, localServer());

    expect(validation.profile).toEqual({
      accountId: "deploy@ssh.example.com",
      displayName: "deploy@ssh.example.com",
      grantedScopes: [],
    });
    expect(validation.metadata).toEqual({ hostKeyFingerprint });

    const otherKey = `SHA256:${"A".repeat(43)}`;
    const error = await rejectionOf(
      runSshCommand(
        { command: "report" },
        {
          credential: readSshCredential(passwordValues, { hostKeyFingerprint: otherKey }),
          dependencies: localServer(),
        },
      ),
    );
    expect(error.status).toBe(502);
    expect(error.message).toContain(`presented ${hostKeyFingerprint}`);
  });

  it("prefers a configured fingerprint over the recorded one", async () => {
    const credential = readSshCredential(
      { ...passwordValues, hostKeyFingerprint: hostKeyFingerprint.replace("SHA256:", "sha256:") + "=" },
      { hostKeyFingerprint: `SHA256:${"A".repeat(43)}` },
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
    expect(dependencies.connectSocket).not.toHaveBeenCalled();
  });

  it("rejects credentials that cannot identify a server or log in", () => {
    expect(() => readSshCredential({ host: "ssh.example.com", username: "deploy" })).toThrow(
      "Provide either a password or a private key.",
    );
    expect(() => readSshCredential({ ...passwordValues, host: "deploy@ssh.example.com" })).toThrow(
      "host must be a hostname or IPv4 address",
    );
    expect(() => readSshCredential({ ...passwordValues, port: "70000" })).toThrow("port must be between 1 and 65535.");
    expect(() => readSshCredential({ ...passwordValues, hostKeyFingerprint: "aa:bb:cc" })).toThrow(
      "hostKeyFingerprint must be a SHA256 fingerprint",
    );
  });
});
