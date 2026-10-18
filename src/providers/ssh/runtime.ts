import type { GuardedFetchDnsLookup } from "../../core/guarded-fetch.ts";
import type { CredentialValidationResult } from "../../core/types.ts";
import type { Socket, TcpNetConnectOpts } from "node:net";
import type { ClientChannel } from "ssh2";

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { connect as connectSocket } from "node:net";
import { Client } from "ssh2";
import { optionalIntegerLike, optionalString } from "../../core/cast.ts";
import { createPinnedLookup, resolveGuardedEgressTarget } from "../../core/guarded-fetch.ts";
import { isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import {
  providerInputError,
  ProviderRequestError,
  requiredInputString,
  runProviderRequest,
} from "../provider-runtime.ts";
import { sshDefaultTimeoutSeconds, sshOutputByteLimit } from "./actions.ts";

const defaultSshPort = 22;

/** Whether a connection is being saved or used; it decides how credential failures are reported. */
type SshPhase = "validate" | "execute";

interface SshCredential {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  /** SHA256 fingerprint the server host key must match; unset trusts any key. */
  hostKeyFingerprint?: string;
}

/** Replaceable DNS and TCP primitives, so tests can reach a local server through the egress guard. */
export interface SshDependencies {
  lookup?: GuardedFetchDnsLookup;
  connectSocket?: (options: TcpNetConnectOpts) => Socket;
}

export interface SshActionContext {
  credential: SshCredential;
  signal?: AbortSignal;
  dependencies?: SshDependencies;
}

interface SshCommandResult {
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
}

interface SshSessionOptions {
  credential: SshCredential;
  phase: SshPhase;
  signal: AbortSignal;
  dependencies: SshDependencies;
}

interface SshSession {
  client: Client;
  /** SHA256 fingerprint of the host key the server presented during the handshake. */
  hostKeyFingerprint: string;
}

/**
 * Read the stored credential fields. `metadata` carries the host key recorded
 * when the connection was saved, which pins the server whenever the user left
 * the fingerprint field empty.
 */
export function readSshCredential(
  values: Record<string, string>,
  metadata: Record<string, unknown> = {},
): SshCredential {
  const password = optionalString(values.password);
  const privateKey = optionalString(values.privateKey)?.replaceAll("\\n", "\n");
  if (!password && !privateKey) {
    throw providerInputError("Provide either a password or a private key.");
  }
  const configuredFingerprint = optionalString(values.hostKeyFingerprint);
  return {
    host: readSshHost(values.host),
    port: readSshPort(values.port),
    username: requiredInputString(values.username, "username"),
    password,
    privateKey,
    passphrase: optionalString(values.passphrase),
    hostKeyFingerprint: configuredFingerprint
      ? normalizeHostKeyFingerprint(configuredFingerprint)
      : optionalString(metadata.hostKeyFingerprint),
  };
}

/**
 * Run one command in a fresh SSH session and collect its exit status and
 * bounded output. The timeout covers connecting as well as the command.
 */
export async function runSshCommand(
  input: Record<string, unknown>,
  context: SshActionContext,
): Promise<SshCommandResult> {
  const command = requiredInputString(input.command, "command");
  const timeoutSeconds =
    optionalIntegerLike(input.timeoutSeconds, "timeoutSeconds", providerInputError) ?? sshDefaultTimeoutSeconds;
  return runProviderRequest({ signal: context.signal, label: "SSH", timeoutMs: timeoutSeconds * 1000 }, (signal) =>
    withSshSession(
      { credential: context.credential, phase: "execute", signal, dependencies: context.dependencies ?? {} },
      (session) => execCommand(session.client, command),
    ),
  );
}

/**
 * Log in once to prove the credential works, and record the host key the
 * server presented so later commands refuse a different server.
 */
export async function validateSshCredential(
  values: Record<string, string>,
  signal: AbortSignal | undefined,
  dependencies: SshDependencies = {},
): Promise<CredentialValidationResult> {
  const credential = readSshCredential(values);
  const hostKeyFingerprint = await runProviderRequest({ signal, label: "SSH" }, (requestSignal) =>
    withSshSession(
      { credential, phase: "validate", signal: requestSignal, dependencies },
      async (session) => session.hostKeyFingerprint,
    ),
  );
  const account = `${credential.username}@${credential.host}${credential.port === defaultSshPort ? "" : `:${credential.port}`}`;
  return {
    profile: { accountId: account, displayName: account, grantedScopes: [] },
    grantedScopes: [],
    metadata: { hostKeyFingerprint },
  };
}

async function withSshSession<T>(options: SshSessionOptions, use: (session: SshSession) => Promise<T>): Promise<T> {
  const { credential, signal, dependencies } = options;
  signal.throwIfAborted();
  const target = await resolveGuardedEgressTarget(`https://${credential.host}`, {
    fieldName: "host",
    createError: providerInputError,
    createResolutionError: (message) => new ProviderRequestError(options.phase === "validate" ? 400 : 502, message),
    allowPrivateNetwork: isPrivateNetworkAccessAllowed(),
    lookup: dependencies.lookup,
  });
  if (target.addresses.length === 0) {
    throw new ProviderRequestError(502, "host could not be resolved for validation");
  }
  signal.throwIfAborted();

  const socket = (dependencies.connectSocket ?? connectSocket)({
    host: target.url.hostname,
    port: credential.port,
    lookup: createPinnedLookup(target.addresses),
    autoSelectFamily: true,
  });
  const client = new Client();
  let presentedFingerprint: string | undefined;
  let stopWatching = (): void => {};
  // Settles only on failure: an abort, a connection error, or the server
  // closing the connection while the session is still in use.
  const failure = new Promise<never>((_resolve, reject) => {
    const onAbort = (): void => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    client.on("error", reject);
    client.on("close", () => reject(new Error("the server closed the connection")));
    stopWatching = () => signal.removeEventListener("abort", onAbort);
  });
  failure.catch(() => undefined);

  try {
    const ready = new Promise<void>((resolve) => client.once("ready", resolve));
    client.connect({
      sock: socket,
      username: credential.username,
      password: credential.password,
      privateKey: credential.privateKey,
      passphrase: credential.passphrase,
      hostVerifier: (key: Buffer): boolean => {
        presentedFingerprint = fingerprintHostKey(key);
        return credential.hostKeyFingerprint === undefined || presentedFingerprint === credential.hostKeyFingerprint;
      },
    });
    await Promise.race([ready, failure]);
    return await Promise.race([use({ client, hostKeyFingerprint: presentedFingerprint! }), failure]);
  } catch (error) {
    throw toSshError(error, options, presentedFingerprint);
  } finally {
    stopWatching();
    client.end();
    socket.destroy();
  }
}

function execCommand(client: Client, command: string): Promise<SshCommandResult> {
  return new Promise((resolve, reject) => {
    client.exec(command, (error: Error | undefined, channel: ClientChannel) => {
      if (error) {
        reject(error);
        return;
      }
      const stdout = new BoundedOutput();
      const stderr = new BoundedOutput();
      let exitCode: number | null = null;
      let exitSignal: string | null = null;
      channel.on("data", (chunk: Buffer) => stdout.append(chunk));
      channel.stderr.on("data", (chunk: Buffer) => stderr.append(chunk));
      channel.on("exit", (code: number | null, signalName?: string) => {
        exitCode = code;
        exitSignal = signalName ?? null;
      });
      channel.once("close", () =>
        resolve({
          exitCode,
          signal: exitSignal,
          stdout: stdout.text(),
          stderr: stderr.text(),
          stdoutTruncated: stdout.truncated,
          stderrTruncated: stderr.truncated,
        }),
      );
      // Commands that read stdin see end-of-file instead of waiting for input.
      channel.end();
    });
  });
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

function toSshError(error: unknown, options: SshSessionOptions, presentedFingerprint: string | undefined): unknown {
  if (!(error instanceof Error) || error instanceof ProviderRequestError) {
    return error;
  }
  const { credential, phase } = options;
  const expectedFingerprint = credential.hostKeyFingerprint;
  if (expectedFingerprint && presentedFingerprint && presentedFingerprint !== expectedFingerprint) {
    return new ProviderRequestError(
      phase === "validate" ? 400 : 502,
      `SSH host key mismatch: ${credential.host} presented ${presentedFingerprint}, but the connection expects ${expectedFingerprint}. If the server key was changed on purpose, update the connection.`,
    );
  }
  if ((error as { level?: unknown }).level === "client-authentication") {
    return new ProviderRequestError(
      phase === "validate" ? 400 : 401,
      `SSH authentication failed for ${credential.username}@${credential.host}. Check the password or private key.`,
    );
  }
  if (error.message.startsWith("Cannot parse privateKey")) {
    return providerInputError(error.message);
  }
  return error;
}

function readSshHost(value: unknown): string {
  const host = requiredInputString(value, "host");
  if (!/^[A-Za-z0-9.-]+$/.test(host)) {
    throw providerInputError("host must be a hostname or IPv4 address, without a scheme, user, port, or path.");
  }
  return host.toLowerCase();
}

function readSshPort(value: unknown): number {
  const port = optionalIntegerLike(value, "port", providerInputError) ?? defaultSshPort;
  if (port < 1 || port > 65_535) {
    throw providerInputError("port must be between 1 and 65535.");
  }
  return port;
}

/** Accept `SHA256:<base64>` as printed by ssh-keygen, with or without the prefix and padding. */
function normalizeHostKeyFingerprint(value: string): string {
  const digest = value.replace(/^sha256:/i, "").replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]{43}$/.test(digest)) {
    throw providerInputError("hostKeyFingerprint must be a SHA256 fingerprint such as SHA256:AbC...");
  }
  return `SHA256:${digest}`;
}

function fingerprintHostKey(key: Buffer): string {
  return `SHA256:${createHash("sha256").update(key).digest("base64").replace(/=+$/, "")}`;
}
