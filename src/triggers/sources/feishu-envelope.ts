import type { JsonValue } from "../common/types.ts";

import { isJsonObject } from "../common/json.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

/**
 * Feishu event protocol primitives shared by the Trigger source and the channel
 * event verifier. Callers keep their own acceptance policy (timestamp window,
 * whether plaintext envelopes are allowed, which callbacks are business events);
 * only the wire format lives here, so the two paths cannot drift on it.
 */

/** Whether an `encrypt` value has the base64 shape Feishu sends. */
export function isFeishuCiphertext(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

/**
 * Decrypts a Feishu `encrypt` value: AES-256-CBC keyed by SHA-256(encryptKey),
 * with the IV as the first 16 bytes. Throws on malformed ciphertext or a
 * decrypted value that is not a JSON object.
 */
export async function decryptFeishuEnvelope(encrypted: string, encryptKey: string): Promise<Record<string, JsonValue>> {
  const bytes = Uint8Array.from(atob(encrypted), (character) => character.charCodeAt(0));
  if (bytes.length < 32 || bytes.length % 16 != 0) throw new TypeError("Invalid encrypted Feishu envelope.");
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", encoder.encode(encryptKey)),
    "AES-CBC",
    false,
    ["decrypt"],
  );
  const value: unknown = JSON.parse(
    decoder.decode(await crypto.subtle.decrypt({ name: "AES-CBC", iv: bytes.slice(0, 16) }, key, bytes.slice(16))),
  );
  if (!isJsonObject(value)) throw new TypeError("Invalid Feishu event.");
  return value;
}

/** Expected X-Lark-Signature: hex SHA-256 over timestamp + nonce + encryptKey + the raw request bytes. */
export async function feishuRequestSignature(
  timestamp: string,
  nonce: string,
  encryptKey: string,
  rawBody: Uint8Array,
): Promise<string> {
  const prefix = encoder.encode(timestamp + nonce + encryptKey);
  const signed = new Uint8Array(prefix.length + rawBody.length);
  signed.set(prefix);
  signed.set(rawBody, prefix.length);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", signed));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
