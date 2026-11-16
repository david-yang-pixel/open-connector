import type { JsonValue } from "../common/types.ts";

import { optionalRawString } from "../../core/cast.ts";
import { isJsonObject } from "../common/json.ts";
import { sameSecret } from "../signature.ts";
import { decryptFeishuEnvelope, feishuRequestSignature, isFeishuCiphertext } from "./feishu-envelope.ts";

const decoder = new TextDecoder("utf-8", { fatal: true });
/** Feishu retries failed deliveries for hours; until retry re-signing is confirmed, the source accepts a day of skew. */
const signatureMaximumAgeMs = 86_400_000;

export interface FeishuEvent {
  readonly id: string;
  readonly type: string;
  readonly appId: string;
  readonly tenantKey: string;
  readonly occurredAt: string | null;
  readonly body: Readonly<Record<string, JsonValue>>;
}

export async function receiveFeishuEvent(
  rawBody: Uint8Array,
  headers: Headers,
  source: { readonly appId: string; readonly verificationToken: string; readonly encryptKey: string },
  now: number,
): Promise<{ readonly challenge: string } | { readonly event: FeishuEvent }> {
  const envelope: unknown = JSON.parse(decoder.decode(rawBody));
  if (!isJsonObject(envelope) || !isFeishuCiphertext(envelope.encrypt)) {
    throw new TypeError("An encrypted Feishu envelope is required.");
  }
  const value = await decryptFeishuEnvelope(envelope.encrypt, source.encryptKey);
  const header = isJsonObject(value.header) ? value.header : undefined;
  if (!sameSecret(optionalRawString(header?.token ?? value.token), source.verificationToken))
    throw new TypeError("Invalid Feishu verification token.");
  if (value.type == "url_verification") {
    if (typeof value.challenge != "string" || value.challenge.length == 0 || value.challenge.length > 1024)
      throw new TypeError("Invalid challenge.");
    return { challenge: value.challenge };
  }
  const timestamp = headers.get("x-lark-request-timestamp") ?? "";
  const nonce = headers.get("x-lark-request-nonce") ?? "";
  const signature = headers.get("x-lark-signature") ?? "";
  if (
    !/^\d{10}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp) * 1000) > signatureMaximumAgeMs ||
    nonce.length == 0 ||
    nonce.length > 256
  ) {
    throw new TypeError("Invalid Feishu request identity.");
  }
  const expected = await feishuRequestSignature(timestamp, nonce, source.encryptKey, rawBody);
  if (!sameSecret(signature, expected)) throw new TypeError("Invalid Feishu signature.");
  const body = value.event;
  if (!isJsonObject(body)) throw new TypeError("Missing Feishu event body.");
  if (value.schema != null && value.schema != "2.0") throw new TypeError("Unsupported Feishu event schema.");
  const type = header?.event_type ?? body.type;
  const appId = header?.app_id ?? body.app_id ?? value.app_id;
  const tenantKey = header?.tenant_key ?? body.tenant_key ?? value.tenant_key;
  let id = header?.event_id ?? value.uuid;
  if (type == "im.message.receive_v1" && isJsonObject(body.message)) id = body.message.message_id;
  if (
    typeof id != "string" ||
    id.length == 0 ||
    id.length > 256 ||
    typeof type != "string" ||
    !/^[a-z][a-z0-9_.]{0,127}$/.test(type)
  ) {
    throw new TypeError("Missing Feishu event identity.");
  }
  if (appId != source.appId) throw new TypeError("Feishu event source does not match.");
  if (typeof tenantKey != "string" || tenantKey.length == 0 || tenantKey.length > 256)
    throw new TypeError("Invalid Feishu event tenant.");
  if (type == "card.action.trigger" || type == "app_ticket")
    throw new TypeError("This callback is not an asynchronous business event.");
  const { token: _token, ...business } = body;
  const occurredAt = header?.create_time ?? value.ts;
  return {
    event: {
      id: `${type}:${id}`,
      type,
      appId: source.appId,
      tenantKey,
      occurredAt: typeof occurredAt == "string" ? occurredAt : null,
      body: business,
    },
  };
}

export function matchesFeishuEvent(
  config: Readonly<Record<string, JsonValue>>,
  event: Pick<FeishuEvent, "type" | "body">,
): boolean {
  if (!Array.isArray(config.eventTypes) || !config.eventTypes.includes(event.type)) return false;
  const chatIds = config.chatIds;
  if (Array.isArray(chatIds) && chatIds.length > 0) {
    const chatId = isJsonObject(event.body.message) ? event.body.message.chat_id : event.body.chat_id;
    if (typeof chatId != "string" || !chatIds.includes(chatId)) return false;
  }
  const resource = config.resource;
  if (isJsonObject(resource)) {
    const id =
      resource.kind == "document"
        ? event.body.file_token
        : resource.kind == "calendar"
          ? event.body.calendar_id
          : event.body.approval_code;
    if (id != resource.id) return false;
  }
  return true;
}
