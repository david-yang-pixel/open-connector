import type { GuardedFetchDnsLookup } from "../../core/guarded-fetch.ts";
import type { CredentialValidationResult } from "../../core/types.ts";
import type { OpenSshCommandResult, OpenSshLogin, SshHostKey } from "./openssh.ts";

import { optionalIntegerLike, optionalString } from "../../core/cast.ts";
import { resolveGuardedEgressTarget } from "../../core/guarded-fetch.ts";
import { isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import {
  providerInputError,
  ProviderRequestError,
  requiredInputString,
  runProviderRequest,
} from "../provider-runtime.ts";
import { sshDefaultTimeoutSeconds } from "./actions.ts";
import { OpenSshError, readSshHostKey, runSshCommandWithOpenSsh, scanSshHostKey, verifySshLogin } from "./openssh.ts";

const defaultSshPort = 22;

/** Whether a connection is being saved or used; it decides how credential failures are reported. */
type SshPhase = "validate" | "execute";

/**
 * How the account logs in. `none` sends neither a password nor a key, for
 * servers such as access gateways whose username already carries the token.
 */
type SshAuthMethod = "password" | "privateKey" | "none";

interface SshCredential {
  host: string;
  port: number;
  username: string;
  authMethod: SshAuthMethod | undefined;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  /** SHA256 fingerprint the server host key must match; unset trusts the key presented on first use. */
  hostKeyFingerprint?: string;
  /** Host key recorded when the connection was saved, as a known_hosts `<type> <base64>` line. */
  hostKey?: string;
}

/** Replaceable DNS lookup and client settings, so tests can reach a local server through the egress guard. */
export interface SshDependencies {
  lookup?: GuardedFetchDnsLookup;
  /** The OpenSSH client executable. Defaults to `ssh` on PATH. */
  sshPath?: string;
  /** Maps the screened address to the one ssh actually dials. */
  dialAddress?: (address: string) => string;
}

export interface SshActionContext {
  credential: SshCredential;
  signal?: AbortSignal;
  dependencies?: SshDependencies;
}

interface SshSessionOptions {
  credential: SshCredential;
  phase: SshPhase;
  signal: AbortSignal;
  dependencies: SshDependencies;
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
  const authMethod = readSshAuthMethod(values.authMethod);
  const password = optionalString(values.password);
  const privateKey = optionalString(values.privateKey)?.replaceAll("\\n", "\n");
  if (authMethod === "none" && (password || privateKey)) {
    throw providerInputError("authMethod none logs in without a password or private key; leave both empty.");
  }
  if (authMethod === "password" && !password) {
    throw providerInputError("authMethod password needs a password.");
  }
  if (authMethod === "privateKey" && !privateKey) {
    throw providerInputError("authMethod privateKey needs a private key.");
  }
  if (authMethod === undefined && !password && !privateKey) {
    throw providerInputError(
      "Provide either a password or a private key, or set authMethod to none for a server that needs neither.",
    );
  }
  const configuredFingerprint = optionalString(values.hostKeyFingerprint);
  return {
    host: readSshHost(values.host),
    port: readSshPort(values.port),
    username: requiredInputString(values.username, "username"),
    authMethod,
    password: authMethod === "privateKey" ? undefined : password,
    privateKey: authMethod === "password" ? undefined : privateKey,
    passphrase: authMethod === "password" ? undefined : optionalString(values.passphrase),
    hostKeyFingerprint: configuredFingerprint
      ? normalizeHostKeyFingerprint(configuredFingerprint)
      : optionalString(metadata.hostKeyFingerprint),
    hostKey: optionalString(metadata.hostKey),
  };
}

/**
 * Run one command in a fresh SSH session and collect its exit status and
 * bounded output. The timeout covers connecting as well as the command.
 */
export async function runSshCommand(
  input: Record<string, unknown>,
  context: SshActionContext,
): Promise<OpenSshCommandResult> {
  const command = requiredInputString(input.command, "command");
  const timeoutSeconds =
    optionalIntegerLike(input.timeoutSeconds, "timeoutSeconds", providerInputError) ?? sshDefaultTimeoutSeconds;
  return runProviderRequest({ signal: context.signal, label: "SSH", timeoutMs: timeoutSeconds * 1000 }, (signal) =>
    withSshLogin(
      { credential: context.credential, phase: "execute", signal, dependencies: context.dependencies ?? {} },
      (login, hostKey) => runSshCommandWithOpenSsh(login, hostKey, command, signal),
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
  const hostKey = await runProviderRequest({ signal, label: "SSH" }, (requestSignal) =>
    withSshLogin({ credential, phase: "validate", signal: requestSignal, dependencies }, async (login, trusted) => {
      await verifySshLogin(login, trusted, requestSignal);
      return trusted;
    }),
  );
  const account = `${credential.username}@${credential.host}${credential.port === defaultSshPort ? "" : `:${credential.port}`}`;
  return {
    profile: { accountId: account, displayName: account, grantedScopes: [] },
    grantedScopes: [],
    metadata: { hostKeyFingerprint: hostKey.fingerprint, hostKey: hostKey.line },
  };
}

/**
 * Screen the host with the egress guard, settle which host key to trust, and
 * hand both to `use`. The OpenSSH client dials the screened address and
 * accepts only that key, so neither DNS nor the server can redirect the login.
 */
async function withSshLogin<T>(
  options: SshSessionOptions,
  use: (login: OpenSshLogin, hostKey: SshHostKey) => Promise<T>,
): Promise<T> {
  const { credential, signal, dependencies } = options;
  if (process.platform === "win32") {
    throw new ProviderRequestError(
      501,
      "The SSH provider drives the OpenSSH client through POSIX shell helpers and is not available on Windows.",
    );
  }
  signal.throwIfAborted();
  const target = await resolveGuardedEgressTarget(`https://${credential.host}`, {
    fieldName: "host",
    createError: providerInputError,
    createResolutionError: (message) => new ProviderRequestError(options.phase === "validate" ? 400 : 502, message),
    allowPrivateNetwork: isPrivateNetworkAccessAllowed(),
    lookup: dependencies.lookup,
  });
  const address = (target.addresses.find((entry) => entry.family === 4) ?? target.addresses[0])?.address;
  if (address === undefined) {
    throw new ProviderRequestError(502, "host could not be resolved for validation");
  }
  const login: OpenSshLogin = {
    sshPath: dependencies.sshPath ?? "ssh",
    address: dependencies.dialAddress?.(address) ?? address,
    host: credential.host,
    port: credential.port,
    username: credential.username,
    password: credential.password,
    privateKey: credential.privateKey,
    passphrase: credential.passphrase,
  };
  try {
    return await use(login, await trustedHostKey(login, options));
  } catch (error) {
    throw toSshError(error, options);
  }
}

/**
 * Use the host key recorded at save time when it still matches the pinned
 * fingerprint; otherwise read the key the server presents and check it
 * against the fingerprint before any credential is sent.
 */
async function trustedHostKey(login: OpenSshLogin, options: SshSessionOptions): Promise<SshHostKey> {
  const { credential, phase, signal } = options;
  const expected = credential.hostKeyFingerprint;
  const recorded = credential.hostKey ? readSshHostKey(credential.hostKey) : undefined;
  if (recorded && (expected === undefined || recorded.fingerprint === expected)) {
    return recorded;
  }
  const presented = await scanSshHostKey(login, signal);
  if (expected !== undefined && presented.fingerprint !== expected) {
    throw new ProviderRequestError(
      phase === "validate" ? 400 : 502,
      `SSH host key mismatch: ${credential.host} presented ${presented.fingerprint}, but the connection expects ${expected}. If the server key was changed on purpose, update the connection.`,
    );
  }
  return presented;
}

function toSshError(error: unknown, options: SshSessionOptions): unknown {
  if (!(error instanceof OpenSshError)) {
    return error;
  }
  const { credential, phase } = options;
  switch (error.kind) {
    case "authentication":
      return new ProviderRequestError(
        phase === "validate" ? 400 : 401,
        credential.authMethod === "none"
          ? `SSH authentication failed for ${credential.username}@${credential.host}. The server did not accept a login without a password or private key; check the username.`
          : `SSH authentication failed for ${credential.username}@${credential.host}. Check the password or private key.`,
      );
    case "private-key":
      return providerInputError(error.message);
    case "host-key":
      return new ProviderRequestError(
        phase === "validate" ? 400 : 502,
        `SSH host key verification failed for ${credential.host}: ${error.message}. If the server key was changed on purpose, update the connection.`,
      );
    case "client-missing":
    case "connection":
      return error;
  }
}

function readSshAuthMethod(value: unknown): SshAuthMethod | undefined {
  const method = optionalString(value)?.toLowerCase();
  switch (method) {
    case undefined:
      return undefined;
    case "password":
      return "password";
    case "privatekey":
      return "privateKey";
    case "none":
      return "none";
    default:
      throw providerInputError("authMethod must be password, privateKey, or none.");
  }
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
