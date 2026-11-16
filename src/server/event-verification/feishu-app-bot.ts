import type { JsonValue } from "../../triggers/common/types.ts";
import type { ChannelEventVerifier } from "./contract.ts";

import { optionalString } from "../../core/cast.ts";
import { isJsonObject } from "../../triggers/common/json.ts";
import { sameSecret } from "../../triggers/signature.ts";
import {
  decryptFeishuEnvelope,
  feishuRequestSignature,
  isFeishuCiphertext,
} from "../../triggers/sources/feishu-envelope.ts";

const decoder = new TextDecoder("utf-8", { fatal: true });
const signatureMaximumSkewSeconds = 300;

interface FeishuAppCredential {
  appId: string;
  verificationToken: string;
  encryptKey: string;
}

const rejectionMessages = {
  payload: "Invalid Feishu event payload.",
  signature: "Invalid Feishu event verification token or signature.",
  app: "The Feishu event app_id does not match the selected connection.",
  timestamp: "The Feishu request timestamp is expired or invalid.",
};

/** Feishu App Bot events, verified with the app credentials on the selected connection. */
export const feishuAppBotEventVerifier: ChannelEventVerifier<FeishuAppCredential> = {
  credentialScope: "connection",
  messages: {
    notConfigured: "Connect a Feishu App Bot with appId, verificationToken and encryptKey first.",
    bodyTooLarge: "Feishu request body exceeds 64 KiB.",
  },
  readCredential({ connectionValues }) {
    const appId = optionalString(connectionValues?.appId);
    const verificationToken = optionalString(connectionValues?.verificationToken);
    const encryptKey = optionalString(connectionValues?.encryptKey);
    return appId && verificationToken && encryptKey ? { appId, verificationToken, encryptKey } : undefined;
  },
  async verify(request, credential) {
    const result = await verifyFeishuEventRequest({
      rawBody: request.rawBody,
      timestamp: request.headers.get("x-lark-request-timestamp") ?? "",
      nonce: request.headers.get("x-lark-request-nonce") ?? "",
      signature: request.headers.get("x-lark-signature") ?? "",
      ...credential,
      nowEpochSeconds: Math.floor(request.now / 1000),
    });
    if (result.valid) return { verified: true, result };
    const reason = result.reason === "token" ? "signature" : result.reason;
    return { verified: false, reason, message: rejectionMessages[reason] };
  },
};

export interface FeishuEventVerificationInput {
  /** Raw Feishu request body; signatures must use these exact bytes. */
  rawBody: Uint8Array;
  /** X-Lark-Request-Timestamp header. */
  timestamp: string;
  /** X-Lark-Request-Nonce header. */
  nonce: string;
  /** X-Lark-Signature header. */
  signature: string;
  /** Feishu app_id stored on the selected feishu_app_bot connection. */
  appId: string;
  /** Feishu Verification Token stored on the selected connection. */
  verificationToken: string;
  /** Feishu Encrypt Key stored on the selected connection. */
  encryptKey: string;
  /** Current Unix time in seconds. */
  nowEpochSeconds: number;
}

export type FeishuEventVerificationResult =
  | {
      valid: true;
      appId: string;
      tenantKey: string;
      challenge?: string;
      payload?: Record<string, JsonValue>;
      signatureVerified: boolean;
    }
  | {
      valid: false;
      reason: "payload" | "token" | "app" | "timestamp" | "signature";
    };

/**
 * Verifies and decrypts one Feishu event request using credentials held by a
 * feishu_app_bot connection. The returned payload is the trusted, decrypted
 * Feishu envelope and can be parsed without exposing app credentials to callers.
 */
export async function verifyFeishuEventRequest(
  input: FeishuEventVerificationInput,
): Promise<FeishuEventVerificationResult> {
  let envelope: Record<string, JsonValue>;
  try {
    const parsed: unknown = JSON.parse(decoder.decode(input.rawBody));
    if (!isJsonObject(parsed)) return { valid: false, reason: "payload" };
    envelope = parsed;
  } catch {
    return { valid: false, reason: "payload" };
  }

  const decrypted = await decryptIfNeeded(envelope, input.encryptKey);
  if (!decrypted) return { valid: false, reason: "payload" };

  const signature = await verifySignatureIfPresent(input.rawBody, input, input.encryptKey);
  if (signature === "timestamp" || signature === "signature") return { valid: false, reason: signature };

  const type = optionalString(decrypted.type);
  if (type === "url_verification") {
    if (!sameSecret(optionalString(decrypted.token), input.verificationToken)) return { valid: false, reason: "token" };
    const challenge = optionalString(decrypted.challenge);
    if (!challenge || challenge.length > 1024) return { valid: false, reason: "payload" };
    return {
      valid: true,
      appId: input.appId,
      tenantKey: "",
      challenge,
      signatureVerified: signature === "verified",
    };
  }

  if (signature !== "verified") return { valid: false, reason: "signature" };
  if (decrypted.schema != "2.0") return { valid: false, reason: "payload" };
  const header = isJsonObject(decrypted.header) ? decrypted.header : undefined;
  if (!header || !sameSecret(optionalString(header.token), input.verificationToken))
    return { valid: false, reason: "token" };
  const appId = optionalString(header.app_id) ?? optionalString(decrypted.app_id);
  if (!appId || !sameSecret(appId, input.appId)) return { valid: false, reason: "app" };
  const tenantKey = optionalString(header.tenant_key) ?? "";
  if (!tenantKey || tenantKey.length > 256) return { valid: false, reason: "payload" };
  const eventType = optionalString(header.event_type);
  const eventId = optionalString(header.event_id);
  if (!eventType || !eventId || !isJsonObject(decrypted.event)) return { valid: false, reason: "payload" };

  const { token: _token, header: _header, ...payload } = decrypted;
  const { token: _headerToken, ...safeHeader } = header;
  return {
    valid: true,
    appId,
    tenantKey,
    payload: { ...payload, header: safeHeader },
    signatureVerified: signature === "verified",
  };
}

async function decryptIfNeeded(
  envelope: Record<string, JsonValue>,
  encryptKey: string,
): Promise<Record<string, JsonValue> | undefined> {
  // Plaintext mode applies only when `encrypt` is absent; a present but malformed value is rejected.
  if (!Object.hasOwn(envelope, "encrypt")) return envelope;
  const encrypted = envelope.encrypt;
  if (!encryptKey || !isFeishuCiphertext(encrypted)) return undefined;
  try {
    return await decryptFeishuEnvelope(encrypted, encryptKey);
  } catch {
    return undefined;
  }
}

async function verifySignatureIfPresent(
  rawBody: Uint8Array,
  input: FeishuEventVerificationInput,
  encryptKey: string,
): Promise<"absent" | "verified" | "timestamp" | "signature"> {
  const values = [input.timestamp, input.nonce, input.signature];
  if (values.every((value) => value.trim() === "")) return "absent";
  if (values.some((value) => value.trim() === "")) return "signature";
  if (!/^\d{10,13}$/.test(input.timestamp)) return "timestamp";
  const timestampSeconds = input.timestamp.length >= 13 ? Number(input.timestamp) / 1000 : Number(input.timestamp);
  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(input.nowEpochSeconds - timestampSeconds) > signatureMaximumSkewSeconds
  )
    return "timestamp";
  const expected = await feishuRequestSignature(input.timestamp, input.nonce, encryptKey, rawBody);
  return sameSecret(input.signature, expected) ? "verified" : "signature";
}
