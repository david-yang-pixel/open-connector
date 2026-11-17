import { describe, expect, it } from "vitest";
import { receiveFeishuEvent } from "./feishu-events.ts";

const source = { appId: "cli_fixture", verificationToken: "fixture-token", encryptKey: "fixture-encrypt-key" };
const timestamp = "1700000000";
const now = Number(timestamp) * 1000;
const nonce = "fixture-nonce";

async function encrypted(value: object): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source.encryptKey)),
    "AES-CBC",
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, new TextEncoder().encode(JSON.stringify(value))),
  );
  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv);
  combined.set(cipher, iv.length);
  return new TextEncoder().encode(JSON.stringify({ encrypt: Buffer.from(combined).toString("base64") }));
}

async function signedHeaders(body: Uint8Array, at = timestamp, signature?: string): Promise<Headers> {
  const prefix = new TextEncoder().encode(at + nonce + source.encryptKey);
  const signed = new Uint8Array(prefix.length + body.length);
  signed.set(prefix);
  signed.set(body, prefix.length);
  const digest = Buffer.from(await crypto.subtle.digest("SHA-256", signed)).toString("hex");
  return new Headers({
    "x-lark-request-timestamp": at,
    "x-lark-request-nonce": nonce,
    "x-lark-signature": signature ?? digest,
  });
}

function messageEvent(overrides: { appId?: string; token?: string; eventType?: string } = {}) {
  return {
    schema: "2.0",
    header: {
      event_id: "evt-1",
      token: overrides.token ?? source.verificationToken,
      event_type: overrides.eventType ?? "im.message.receive_v1",
      tenant_key: "tenant-1",
      app_id: overrides.appId ?? source.appId,
      create_time: "1700000000000",
    },
    event: { message: { message_id: "om-1", chat_id: "oc-chat" }, token: "inner-token" },
  };
}

describe("Feishu trigger source receive", () => {
  it("returns an encrypted URL verification challenge without signing headers", async () => {
    const body = await encrypted({ type: "url_verification", token: source.verificationToken, challenge: "c-1" });

    await expect(receiveFeishuEvent(body, new Headers(), source, now)).resolves.toEqual({ challenge: "c-1" });
  });

  it("normalizes a signed encrypted message event", async () => {
    const body = await encrypted(messageEvent());

    await expect(receiveFeishuEvent(body, await signedHeaders(body), source, now)).resolves.toEqual({
      event: {
        id: "im.message.receive_v1:om-1",
        type: "im.message.receive_v1",
        appId: source.appId,
        tenantKey: "tenant-1",
        occurredAt: "1700000000000",
        body: { message: { message_id: "om-1", chat_id: "oc-chat" } },
      },
    });
  });

  it("requires an encrypted envelope", async () => {
    const body = new TextEncoder().encode(JSON.stringify(messageEvent()));

    await expect(receiveFeishuEvent(body, await signedHeaders(body), source, now)).rejects.toThrow(
      "An encrypted Feishu envelope is required.",
    );
  });

  it("accepts signatures up to 24 hours old and rejects older ones", async () => {
    const body = await encrypted(messageEvent());
    const at = (offsetSeconds: number) => String(Number(timestamp) - offsetSeconds);

    await expect(
      receiveFeishuEvent(body, await signedHeaders(body, at(23 * 3600)), source, now),
    ).resolves.toHaveProperty("event");
    await expect(receiveFeishuEvent(body, await signedHeaders(body, at(25 * 3600)), source, now)).rejects.toThrow(
      "Invalid Feishu request identity.",
    );
  });

  it("rejects a forged signature, a wrong token and a foreign app", async () => {
    const body = await encrypted(messageEvent());
    await expect(
      receiveFeishuEvent(body, await signedHeaders(body, timestamp, "0".repeat(64)), source, now),
    ).rejects.toThrow("Invalid Feishu signature.");

    const wrongToken = await encrypted(messageEvent({ token: "other" }));
    await expect(receiveFeishuEvent(wrongToken, await signedHeaders(wrongToken), source, now)).rejects.toThrow(
      "Invalid Feishu verification token.",
    );

    const foreign = await encrypted(messageEvent({ appId: "cli_other" }));
    await expect(receiveFeishuEvent(foreign, await signedHeaders(foreign), source, now)).rejects.toThrow(
      "Feishu event source does not match.",
    );
  });

  it("rejects synchronous card callbacks", async () => {
    const body = await encrypted(messageEvent({ eventType: "card.action.trigger" }));

    await expect(receiveFeishuEvent(body, await signedHeaders(body), source, now)).rejects.toThrow(
      "This callback is not an asynchronous business event.",
    );
  });
});
