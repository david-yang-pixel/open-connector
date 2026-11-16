import { importPKCS8, SignJWT } from "jose";
import { sha256Hex } from "../../core/aws-sigv4.ts";
import { base64Bytes, optionalRecord, optionalString, stringRecord } from "../../core/cast.ts";
import {
  providerInputError,
  ProviderRequestError,
  requiredInputString,
  runProviderRequest,
} from "../provider-runtime.ts";
import { githubRequestJson } from "./runtime-shared.ts";

/**
 * GitHub App installation credentials.
 *
 * A GitHub App authenticates in two steps: the App's private key signs a short
 * RS256 JWT that identifies the App, and that JWT is exchanged for an
 * installation access token scoped to one installation (an account that
 * installed the App and the repositories it selected). Installation tokens are
 * what the REST API accepts on repository endpoints; they expire after one hour
 * and cannot be refreshed, only minted again.
 *
 * The stored credential therefore holds the three inputs of that exchange —
 * `appId`, `installationId`, `privateKey` — and the runtime mints tokens on
 * demand, reusing one across calls until shortly before it expires.
 */

/** GitHub refuses an App JWT older than ten minutes; nine leaves room for clock skew. */
const appJwtLifetimeSeconds = 9 * 60;
/** Issued-at is backdated so a runtime clock slightly ahead of GitHub's still validates. */
const appJwtClockSkewSeconds = 60;
/** A cached installation token is replaced this long before GitHub expires it. */
const installationTokenRenewalMarginMs = 5 * 60 * 1000;

const pkcs8Marker = "-----BEGIN PRIVATE KEY-----";
const pkcs1Marker = "-----BEGIN RSA PRIVATE KEY-----";

export interface GitHubAppInstallationCredential {
  appId: string;
  installationId: string;
  /** PKCS#8 PEM, converted from the PKCS#1 PEM GitHub downloads when needed. */
  privateKey: string;
}

interface GitHubInstallationToken {
  token: string;
  /** ISO timestamp from GitHub; tokens live one hour. */
  expiresAt: string;
  permissions: Record<string, string>;
  repositorySelection: string | undefined;
}

interface GitHubAppInstallation {
  id: number;
  /** Numeric App ID the installation belongs to. */
  app_id?: number;
  account: Record<string, unknown>;
  permissions: Record<string, string>;
  repository_selection: string;
  [key: string]: unknown;
}

export function readGitHubAppInstallationCredential(values: Record<string, string>): GitHubAppInstallationCredential {
  const appId = requiredInputString(values.appId, "appId").trim();
  // Legacy client IDs use an Iv1. prefix.
  if (!/^[A-Za-z0-9.]+$/u.test(appId)) {
    throw providerInputError(
      "appId must be the GitHub App's numeric App ID or its client ID, both shown on the App's settings page",
    );
  }
  const installationId = requiredInputString(values.installationId, "installationId").trim();
  if (!/^\d+$/u.test(installationId)) {
    throw new ProviderRequestError(
      400,
      "installationId must be the numeric installation id from the installation's settings URL or the post-install redirect",
    );
  }
  return { appId, installationId, privateKey: normalizePrivateKey(values.privateKey) };
}

/**
 * Accept the key as GitHub downloads it (PKCS#1, `BEGIN RSA PRIVATE KEY`) or
 * already converted to PKCS#8, with literal or escaped line breaks.
 */
function normalizePrivateKey(value: unknown): string {
  const pem = requiredInputString(value, "privateKey").replaceAll("\\n", "\n").trim();
  if (pem.includes(pkcs8Marker)) {
    return pem;
  }
  if (pem.includes(pkcs1Marker)) {
    return pkcs1ToPkcs8Pem(pem);
  }
  throw new ProviderRequestError(
    400,
    "privateKey must be the PEM contents of the GitHub App private key (.pem) file, starting with -----BEGIN RSA PRIVATE KEY-----",
  );
}

/**
 * Wrap a PKCS#1 RSAPrivateKey in the PKCS#8 PrivateKeyInfo structure WebCrypto
 * imports. The wrapper is fixed for RSA: version 0, the rsaEncryption algorithm
 * identifier with a NULL parameter, then the PKCS#1 DER as an OCTET STRING.
 */
export function pkcs1ToPkcs8Pem(pkcs1Pem: string): string {
  const base64 = pkcs1Pem.replace(pkcs1Marker, "").replace("-----END RSA PRIVATE KEY-----", "").replace(/\s+/gu, "");
  const pkcs1 = base64ToBytes(base64);
  const algorithm = Uint8Array.from([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  const version = Uint8Array.from([0x02, 0x01, 0x00]);
  const keyOctets = derTlv(0x04, pkcs1);
  const body = concatBytes(version, algorithm, keyOctets);
  const pkcs8 = derTlv(0x30, body);
  const lines = bytesToBase64(pkcs8).match(/.{1,64}/gu) ?? [];
  return `${pkcs8Marker}\n${lines.join("\n")}\n-----END PRIVATE KEY-----`;
}

function derTlv(tag: number, value: Uint8Array): Uint8Array {
  return concatBytes(Uint8Array.from([tag]), derLength(value.byteLength), value);
}

function derLength(length: number): Uint8Array {
  if (length < 0x80) {
    return Uint8Array.from([length]);
  }
  const bytes: number[] = [];
  for (let remaining = length; remaining > 0; remaining = Math.floor(remaining / 0x100)) {
    bytes.unshift(remaining % 0x100);
  }
  return Uint8Array.from([0x80 | bytes.length, ...bytes]);
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

function base64ToBytes(base64: string): Uint8Array {
  return base64Bytes(
    base64,
    "privateKey",
    () => new ProviderRequestError(400, "privateKey is not a valid PEM: its body is not base64"),
  );
}

/**
 * Encode DER bytes for a PEM body. These are key bytes assembled one at a
 * time, so the binary string is Latin-1 by construction; the `btoa` fallback
 * is the same shape the provider source guard allowlists for gitea and
 * pi_hole, and it never sees a credential string.
 */
function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** Sign the App JWT GitHub's App endpoints and the token mint take as bearer. */
export async function signGitHubAppJwt(credential: GitHubAppInstallationCredential): Promise<string> {
  let signingKey: CryptoKey;
  try {
    signingKey = await importPKCS8(credential.privateKey, "RS256");
  } catch {
    throw new ProviderRequestError(
      400,
      "privateKey must be an RSA private key in PEM format, as downloaded from the GitHub App's settings page",
    );
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(credential.appId)
    .setIssuedAt(now - appJwtClockSkewSeconds)
    .setExpirationTime(now - appJwtClockSkewSeconds + appJwtLifetimeSeconds)
    .sign(signingKey);
}

/** Describe the installation the credential names, authenticated as the App. */
export async function fetchGitHubAppInstallation(
  credential: GitHubAppInstallationCredential,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<GitHubAppInstallation> {
  return runProviderRequest({ label: "GitHub installation", signal }, async (signal) =>
    githubRequestJson<GitHubAppInstallation>({
      path: `/app/installations/${encodeURIComponent(credential.installationId)}`,
      accessToken: await signGitHubAppJwt(credential),
      fetcher,
      signal,
    }),
  );
}

/** Mint an installation access token with the App's full granted permissions. */
export async function mintGitHubInstallationToken(
  credential: GitHubAppInstallationCredential,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<GitHubInstallationToken> {
  return runProviderRequest({ label: "GitHub installation token", signal }, async (signal) => {
    const minted = await githubRequestJson<Record<string, unknown>>({
      method: "POST",
      path: `/app/installations/${encodeURIComponent(credential.installationId)}/access_tokens`,
      body: {},
      accessToken: await signGitHubAppJwt(credential),
      fetcher,
      signal,
    });
    const token = optionalString(minted.token);
    const expiresAt = optionalString(minted.expires_at);
    if (!token || !expiresAt) {
      throw new ProviderRequestError(500, "GitHub returned an installation token without a token or expiry", 502);
    }
    return {
      token,
      expiresAt,
      permissions: stringRecord(optionalRecord(minted.permissions) ?? {}),
      repositorySelection: optionalString(minted.repository_selection),
    };
  });
}

/**
 * Installation tokens shared across action runs in this process, keyed by App,
 * installation and private-key digest. A token is reused until five minutes before GitHub expires
 * it; a failed mint evicts itself so the next run retries instead of inheriting
 * the rejection.
 */
const installationTokens = new Map<string, Promise<GitHubInstallationToken>>();

export function clearGitHubInstallationTokenCache(): void {
  installationTokens.clear();
}

function cachedInstallationToken(
  credential: GitHubAppInstallationCredential,
  fetcher: typeof fetch,
): Promise<GitHubInstallationToken> {
  const key = `${credential.appId}:${credential.installationId}:${sha256Hex(credential.privateKey)}`;
  const cached = installationTokens.get(key);
  if (!cached) {
    return refreshInstallationToken(key, credential, fetcher);
  }
  // No rejection handler, deliberately. A caller that joined an in-flight mint
  // is told that the mint failed; the eviction in `refreshInstallationToken`
  // has already made the NEXT call start over, so retrying here would turn one
  // failure into a burst of one retry per waiting caller.
  return cached.then((token) => {
    if (isFresh(token)) {
      return token;
    }
    // Stale. Another caller may already have started the replacement while
    // this one was waiting on the old promise; join it rather than minting a
    // second token for the same installation.
    const latest = installationTokens.get(key);
    return latest && latest !== cached ? latest : refreshInstallationToken(key, credential, fetcher);
  });
}

function refreshInstallationToken(
  key: string,
  credential: GitHubAppInstallationCredential,
  fetcher: typeof fetch,
): Promise<GitHubInstallationToken> {
  const current = installationTokens.get(key);
  const minting = mintGitHubInstallationToken(credential, fetcher);
  installationTokens.set(key, minting);
  void minting.catch(() => {
    if (installationTokens.get(key) === minting) {
      if (current) {
        installationTokens.set(key, current);
      } else {
        installationTokens.delete(key);
      }
    }
  });
  return minting;
}

function isFresh(token: GitHubInstallationToken): boolean {
  const expiresAt = Date.parse(token.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt - Date.now() > installationTokenRenewalMarginMs;
}

/** Resolve installation tokens without letting one caller cancel a shared mint. */
export function createGitHubInstallationTokenResolver(
  values: Record<string, string>,
  fetcher: typeof fetch,
): (signal?: AbortSignal) => Promise<string> {
  const credential = readGitHubAppInstallationCredential(values);
  return async (signal) => {
    signal?.throwIfAborted();
    const pending = cachedInstallationToken(credential, fetcher);
    if (!signal) return (await pending).token;
    return new Promise<string>((resolve, reject) => {
      const abort = (): void => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
      void pending.then(
        (token) => {
          signal.removeEventListener("abort", abort);
          resolve(token.token);
        },
        (error: unknown) => {
          signal.removeEventListener("abort", abort);
          reject(error);
        },
      );
    });
  };
}
