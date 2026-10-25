import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sshOutputByteLimit } from "./actions.ts";

/** Where an OpenSSH run stopped; the caller decides how each kind is reported. */
export type OpenSshFailureKind = "client-missing" | "connection" | "host-key" | "private-key" | "authentication";

/** A failure the OpenSSH client reported before the remote command could run. */
export class OpenSshError extends Error {
  readonly kind: OpenSshFailureKind;

  constructor(kind: OpenSshFailureKind, message: string) {
    super(message);
    this.name = "OpenSshError";
    this.kind = kind;
  }
}

/** One login to one server, with the address already screened by the egress guard. */
export interface OpenSshLogin {
  /** The OpenSSH client executable. */
  sshPath: string;
  /** The screened IP address ssh dials, so the hostname is never resolved a second time. */
  address: string;
  /** The hostname the server host key is recorded under. */
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

/** A plain public host key, in the form known_hosts lines and `ssh-keygen -l` fingerprints use. */
export interface SshHostKey {
  /** `<type> <base64>`, as in a known_hosts line. */
  line: string;
  /** SHA256 fingerprint of the key, as `SHA256:<base64>` without padding. */
  fingerprint: string;
}

export interface OpenSshCommandResult {
  /** The command's exit status, or null when it was ended by a signal. */
  exitCode: number | null;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
}

interface OpenSshProcessOptions {
  login: OpenSshLogin;
  args: string[];
  env: Record<string, string>;
  signal: AbortSignal;
  /** Ends the client early, once its diagnostics show that it got far enough. */
  stopWhen?: (diagnostics: string) => boolean;
}

interface OpenSshProcessResult {
  stdout: BoundedOutput;
  stderr: BoundedOutput;
}

const certificateSuffix = "-cert-v01@openssh.com";

/** Length-prefixed fields after the type name in each plain public key format. */
const publicKeyFieldCounts: Record<string, number> = {
  "ssh-ed25519": 1,
  "ssh-rsa": 2,
  "ssh-dss": 4,
  "ecdsa-sha2-nistp256": 2,
  "ecdsa-sha2-nistp384": 2,
  "ecdsa-sha2-nistp521": 2,
  "sk-ssh-ed25519@openssh.com": 2,
  "sk-ecdsa-sha2-nistp256@openssh.com": 3,
};

/**
 * Connect without logging in and return the host key the server presents.
 * A host certificate is reduced to the plain key it certifies, which is what
 * OpenSSH matches against a known_hosts entry when no trusted CA signs it.
 * The client stops at host key verification, before it sends any credential.
 */
export async function scanSshHostKey(login: OpenSshLogin, signal: AbortSignal): Promise<SshHostKey> {
  return withWorkspace(async (workspace) => {
    const presentedPath = join(workspace, "presented-host-key");
    const recorderPath = join(workspace, "record-host-key.sh");
    await writeFile(recorderPath, `[ "$1" = HOSTNAME ] && printf '%s\\n' "$2" > '${presentedPath}'\nexit 0\n`, {
      mode: 0o600,
    });
    const logPath = join(workspace, "ssh.log");
    await runOpenSsh({
      login,
      args: [
        ...connectionOptions(login, logPath),
        ...noAuthenticationOptions(),
        "-o",
        "BatchMode=yes",
        "-o",
        "UserKnownHostsFile=/dev/null",
        "-o",
        `KnownHostsCommand=/bin/sh ${recorderPath} %I %K`,
        "-N",
        "--",
        login.address,
      ],
      env: {},
      signal,
    });
    const presented = await readOptionalFile(presentedPath);
    if (!presented?.trim()) {
      throw failureFromLog(await readLog(logPath), "the server did not present a host key");
    }
    return plainHostKey(Buffer.from(presented.trim(), "base64"));
  });
}

/** Log in with the trusted host key and end the session without running anything. */
export async function verifySshLogin(login: OpenSshLogin, hostKey: SshHostKey, signal: AbortSignal): Promise<void> {
  await withWorkspace(async (workspace) => {
    // Diagnostics go to stderr here, so the session can be ended as soon as the login succeeds.
    const result = await runOpenSsh({
      login,
      args: [...(await loginOptions(login, hostKey, workspace, undefined)), "-N", "--", login.address],
      env: await askpassEnvironment(login, workspace),
      signal,
      stopWhen: hasAuthenticated,
    });
    const diagnostics = result.stderr.text();
    if (!hasAuthenticated(diagnostics)) {
      throw failureFromLog(diagnostics, "the SSH client exited before logging in");
    }
  });
}

function hasAuthenticated(diagnostics: string): boolean {
  return /^(Authenticated to |debug1: Authentication succeeded)/m.test(diagnostics);
}

/** Log in with the trusted host key, run one command, and collect its exit status and bounded output. */
export async function runSshCommandWithOpenSsh(
  login: OpenSshLogin,
  hostKey: SshHostKey,
  command: string,
  signal: AbortSignal,
): Promise<OpenSshCommandResult> {
  return withWorkspace(async (workspace) => {
    // The remote command owns stderr, so the client's diagnostics go to a log file.
    const logPath = join(workspace, "ssh.log");
    const result = await runOpenSsh({
      login,
      args: [...(await loginOptions(login, hostKey, workspace, logPath)), "-T", "--", login.address, command],
      env: await askpassEnvironment(login, workspace),
      signal,
    });
    const log = await readLog(logPath);
    const status = /^debug1: Exit status (-?\d+)$/m.exec(log);
    const exitCode = status ? Number(status[1]) : -1;
    if (exitCode < 0 && !/rtype exit-signal /.test(log)) {
      throw failureFromLog(log, "the server closed the connection before the command finished");
    }
    return {
      exitCode: exitCode < 0 ? null : exitCode,
      stdout: result.stdout.text(),
      stderr: result.stderr.text(),
      stdoutTruncated: result.stdout.truncated,
      stderrTruncated: result.stderr.truncated,
    };
  });
}

/** Read a host key recorded earlier as a known_hosts style `<type> <base64>` line. */
export function readSshHostKey(line: string): SshHostKey | undefined {
  const [type, encoded] = line.trim().split(/\s+/);
  if (!type || !encoded || type.endsWith(certificateSuffix) || !(type in publicKeyFieldCounts)) {
    return undefined;
  }
  try {
    const hostKey = plainHostKey(Buffer.from(encoded, "base64"));
    return hostKey.line === `${type} ${encoded}` ? hostKey : undefined;
  } catch {
    return undefined;
  }
}

/** Reduce a public key or certificate blob in SSH wire format to the plain key it carries. */
function plainHostKey(blob: Buffer): SshHostKey {
  const reader = new WireReader(blob);
  const type = reader.readString().toString("latin1");
  const isCertificate = type.endsWith(certificateSuffix);
  const plainType = isCertificate ? certificateKeyType(type) : type;
  const fieldCount = publicKeyFieldCounts[plainType];
  if (fieldCount === undefined) {
    throw new OpenSshError("connection", `the server presented an unsupported host key type ${type}`);
  }
  if (isCertificate) {
    reader.readString(); // nonce
  }
  const fields = Array.from({ length: fieldCount }, () => reader.readString());
  const typeName = Buffer.from(plainType, "latin1");
  const plainBlob = Buffer.concat([typeName, ...fields].flatMap((field) => [lengthPrefix(field.length), field]));
  return {
    line: `${plainType} ${plainBlob.toString("base64")}`,
    fingerprint: `SHA256:${createHash("sha256").update(plainBlob).digest("base64").replace(/=+$/, "")}`,
  };
}

function certificateKeyType(type: string): string {
  const base = type.slice(0, -certificateSuffix.length);
  return base.startsWith("sk-") ? `${base}@openssh.com` : base;
}

function lengthPrefix(length: number): Buffer {
  const prefix = Buffer.alloc(4);
  prefix.writeUInt32BE(length);
  return prefix;
}

/** Reads the length-prefixed strings of the SSH wire format. */
class WireReader {
  private readonly data: Buffer;
  private offset = 0;

  constructor(data: Buffer) {
    this.data = data;
  }

  readString(): Buffer {
    if (this.offset + 4 > this.data.length) {
      throw new OpenSshError("connection", "the server presented a malformed host key");
    }
    const length = this.data.readUInt32BE(this.offset);
    const start = this.offset + 4;
    if (start + length > this.data.length) {
      throw new OpenSshError("connection", "the server presented a malformed host key");
    }
    this.offset = start + length;
    return this.data.subarray(start, this.offset);
  }
}

/**
 * Options shared by every run. `-F /dev/null` keeps the runtime account's
 * ssh_config out of the connection, so no proxy, forwarding, agent, or
 * multiplexing setting from the host applies.
 */
function connectionOptions(login: OpenSshLogin, logPath: string | undefined): string[] {
  return [
    "-F",
    "/dev/null",
    ...(logPath ? ["-E", logPath] : []),
    "-o",
    "LogLevel=DEBUG1",
    "-o",
    "StrictHostKeyChecking=yes",
    "-o",
    "GlobalKnownHostsFile=/dev/null",
    "-o",
    `HostKeyAlias=${login.host}`,
    "-o",
    "CheckHostIP=no",
    "-o",
    "UpdateHostKeys=no",
    "-o",
    "IdentityAgent=none",
    "-o",
    "IdentitiesOnly=yes",
    "-o",
    "KbdInteractiveAuthentication=no",
    "-o",
    "HostbasedAuthentication=no",
    "-o",
    "GSSAPIAuthentication=no",
    "-o",
    "ClearAllForwardings=yes",
    "-o",
    "ControlPath=none",
    "-o",
    "NumberOfPasswordPrompts=1",
    "-p",
    String(login.port),
    "-l",
    login.username,
  ];
}

function noAuthenticationOptions(): string[] {
  return ["-o", "IdentityFile=none", "-o", "PubkeyAuthentication=no", "-o", "PasswordAuthentication=no"];
}

/**
 * Login options trusting exactly `hostKey`. With neither a password nor a
 * private key, only the SSH `none` method is left, which servers use when
 * the username itself carries the access token.
 */
async function loginOptions(
  login: OpenSshLogin,
  hostKey: SshHostKey,
  workspace: string,
  logPath: string | undefined,
): Promise<string[]> {
  const knownHostsPath = join(workspace, "known_hosts");
  await writeFile(knownHostsPath, `${login.host} ${hostKey.line}\n`, { mode: 0o600 });
  let keyPath: string | undefined;
  if (login.privateKey) {
    keyPath = join(workspace, "identity");
    await writeFile(keyPath, login.privateKey.endsWith("\n") ? login.privateKey : `${login.privateKey}\n`, {
      mode: 0o600,
    });
  }
  return [
    ...connectionOptions(login, logPath),
    "-o",
    `UserKnownHostsFile=${knownHostsPath}`,
    "-o",
    `IdentityFile=${keyPath ?? "none"}`,
    "-o",
    `PubkeyAuthentication=${keyPath ? "yes" : "no"}`,
    "-o",
    `PasswordAuthentication=${login.password ? "yes" : "no"}`,
  ];
}

/**
 * Hand the password and key passphrase to ssh through an askpass helper, so
 * neither appears on a command line. Secrets travel in the helper's
 * environment, which only the runtime account can read.
 */
async function askpassEnvironment(login: OpenSshLogin, workspace: string): Promise<Record<string, string>> {
  if (!login.password && !login.passphrase) {
    return { SSH_ASKPASS_REQUIRE: "never" };
  }
  const askpassPath = join(workspace, "askpass.sh");
  await writeFile(
    askpassPath,
    [
      "#!/bin/sh",
      'case "$1" in',
      `  "Enter passphrase for key"*) printf '%s\\n' "$OPEN_CONNECTOR_SSH_PASSPHRASE" ;;`,
      `  *) printf '%s\\n' "$OPEN_CONNECTOR_SSH_PASSWORD" ;;`,
      "esac",
      "",
    ].join("\n"),
    { mode: 0o700 },
  );
  return {
    SSH_ASKPASS: askpassPath,
    SSH_ASKPASS_REQUIRE: "force",
    OPEN_CONNECTOR_SSH_PASSWORD: login.password ?? "",
    OPEN_CONNECTOR_SSH_PASSPHRASE: login.passphrase ?? "",
  };
}

function runOpenSsh(options: OpenSshProcessOptions): Promise<OpenSshProcessResult> {
  const { signal } = options;
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const child = spawn(options.login.sshPath, options.args, {
      env: { PATH: process.env.PATH ?? "/usr/bin:/bin", ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = new BoundedOutput();
    const stderr = new BoundedOutput();
    const onAbort = (): void => {
      child.kill("SIGKILL");
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    child.stdout.on("data", (chunk: Buffer) => stdout.append(chunk));
    child.stderr.on("data", (chunk: Buffer) => {
      stderr.append(chunk);
      if (options.stopWhen?.(stderr.text())) {
        child.kill("SIGTERM");
      }
    });
    child.once("error", (error: NodeJS.ErrnoException) => {
      signal.removeEventListener("abort", onAbort);
      reject(
        error.code === "ENOENT"
          ? new OpenSshError(
              "client-missing",
              `the OpenSSH client (${options.login.sshPath}) is not installed on the machine running Open Connector`,
            )
          : error,
      );
    });
    child.once("close", () => {
      signal.removeEventListener("abort", onAbort);
      resolve({ stdout, stderr });
    });
  });
}

/** Classify the client's own messages, ignoring debug lines. */
function failureFromLog(log: string, fallbackMessage: string): OpenSshError {
  const messages = log
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("debug"));
  const keyError = messages.map((line) => /^Load key "[^"]*": (.+)$/.exec(line)?.[1]).find(Boolean);
  if (keyError) {
    return new OpenSshError("private-key", `privateKey could not be loaded: ${keyError}`);
  }
  if (messages.some((line) => /Permission denied|Too many authentication failures/.test(line))) {
    return new OpenSshError("authentication", "the server rejected the login");
  }
  if (messages.some((line) => /Host key verification failed|REMOTE HOST IDENTIFICATION HAS CHANGED/.test(line))) {
    return new OpenSshError("host-key", "the server host key does not match the trusted key");
  }
  const lastMessage = messages
    .filter((line) => !/^(Authenticated to |Transferred: |Bytes per second: )/.test(line))
    .at(-1);
  return new OpenSshError("connection", lastMessage ?? fallbackMessage);
}

async function withWorkspace<T>(use: (workspace: string) => Promise<T>): Promise<T> {
  const workspace = await mkdtemp(join(tmpdir(), "open-connector-ssh-"));
  try {
    return await use(workspace);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function readOptionalFile(path: string): Promise<string | undefined> {
  return readFile(path, "utf8").catch(() => undefined);
}

async function readLog(path: string): Promise<string> {
  return (await readOptionalFile(path)) ?? "";
}

/** Keeps the first {@link sshOutputByteLimit} bytes of a stream and remembers whether more arrived. */
class BoundedOutput {
  private readonly chunks: Buffer[] = [];
  private size = 0;
  truncated = false;

  append(chunk: Buffer): void {
    const room = sshOutputByteLimit - this.size;
    if (chunk.length > room) {
      this.truncated = true;
    }
    if (room > 0) {
      const kept = chunk.subarray(0, room);
      this.chunks.push(kept);
      this.size += kept.length;
    }
  }

  text(): string {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}
