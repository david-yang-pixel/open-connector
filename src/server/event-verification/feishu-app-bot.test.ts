import { describe, expect, it } from "vitest";
import { verifyFeishuEventRequest } from "./feishu-app-bot.ts";

const appId = "cli_fixture";
const verificationToken = "fixture-verification-token";
const encryptKey = "fixture-encrypt-key";
const timestamp = "1700000000";
const nowEpochSeconds = Number(timestamp);
const nonce = "fixture-nonce";

async function signatureFor(body: Uint8Array, at = timestamp): Promise<string> {
  const prefix = new TextEncoder().encode(at + nonce + encryptKey);
  const signed = new Uint8Array(prefix.length + body.length);
  signed.set(prefix);
  signed.set(body, prefix.length);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", signed));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verify(body: object, overrides: Partial<Parameters<typeof verifyFeishuEventRequest>[0]> = {}) {
  const rawBody = new TextEncoder().encode(JSON.stringify(body));
  return verifyFeishuEventRequest({
    rawBody,
    timestamp,
    nonce,
    signature: await signatureFor(rawBody),
    appId,
    verificationToken,
    encryptKey,
    nowEpochSeconds,
    ...overrides,
  });
}

async function encryptedBody(value: object): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(encryptKey)),
    "AES-CBC",
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, new TextEncoder().encode(JSON.stringify(value))),
  );
  const combined = new Uint8Array(iv.length + encrypted.length);
  combined.set(iv);
  combined.set(encrypted, iv.length);
  return new TextEncoder().encode(JSON.stringify({ encrypt: btoa(String.fromCharCode(...combined)) }));
}

function eventEnvelope(overrides: { appId?: string; token?: string } = {}) {
  return {
    schema: "2.0",
    header: {
      event_id: "evt-1",
      token: overrides.token ?? verificationToken,
      event_type: "im.message.receive_v1",
      tenant_key: "tenant-1",
      app_id: overrides.appId ?? appId,
    },
    event: {
      sender: { sender_id: { open_id: "ou-user" }, sender_type: "user" },
      message: {
        message_id: "om-1",
        chat_id: "oc-chat",
        chat_type: "p2p",
        message_type: "text",
        content: JSON.stringify({ text: "hello" }),
      },
    },
  };
}

describe("Feishu inbound event verification", () => {
  it("accepts a signed event for the configured app", async () => {
    const body = eventEnvelope();

    const result = await verify(body);

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error("expected a valid Feishu event");
    expect(result).toMatchObject({ appId, tenantKey: "tenant-1", signatureVerified: true });
    expect(result.payload).toMatchObject({ schema: "2.0" });
    expect(result.payload?.header).not.toHaveProperty("token");
    expect(JSON.stringify(result)).not.toContain(verificationToken);
  });

  it("verifies the encrypted request bytes and returns the decrypted event without tokens", async () => {
    const body = { ...eventEnvelope(), token: verificationToken };
    body.event.message.content = JSON.stringify({ text: "你好，飞书" });
    const rawBody = await encryptedBody(body);
    const signature = await signatureFor(rawBody);

    const result = await verify(body, { rawBody, signature });

    expect(result).toEqual({
      valid: true,
      appId,
      tenantKey: "tenant-1",
      signatureVerified: true,
      payload: {
        schema: body.schema,
        header: {
          event_id: "evt-1",
          event_type: "im.message.receive_v1",
          tenant_key: "tenant-1",
          app_id: appId,
        },
        event: body.event,
      },
    });
    expect(JSON.stringify(result)).not.toContain(verificationToken);

    const reserialized = new TextEncoder().encode(
      JSON.stringify(JSON.parse(new TextDecoder().decode(rawBody)), null, 2),
    );
    await expect(verify(body, { rawBody: reserialized, signature })).resolves.toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it("decrypts and accepts a URL verification challenge", async () => {
    const rawBody = await encryptedBody({
      type: "url_verification",
      token: verificationToken,
      challenge: "challenge-1",
    });

    const result = await verifyFeishuEventRequest({
      rawBody,
      timestamp: "",
      nonce: "",
      signature: "",
      appId,
      verificationToken,
      encryptKey,
      nowEpochSeconds,
    });

    expect(result).toEqual({
      valid: true,
      appId,
      tenantKey: "",
      challenge: "challenge-1",
      signatureVerified: false,
    });
  });

  it.each(["", "   ", 123, null])(
    "rejects a present but malformed encrypt field instead of reading plaintext (%j)",
    async (encrypt) => {
      const body = { type: "url_verification", token: verificationToken, challenge: "challenge-1", encrypt };

      await expect(verify(body, { timestamp: "", nonce: "", signature: "" })).resolves.toEqual({
        valid: false,
        reason: "payload",
      });
    },
  );

  it("rejects a token mismatch", async () => {
    await expect(verify(eventEnvelope({ token: "wrong" }))).resolves.toEqual({ valid: false, reason: "token" });
  });

  it("rejects an app mismatch", async () => {
    await expect(verify(eventEnvelope({ appId: "other-app" }))).resolves.toEqual({ valid: false, reason: "app" });
  });

  it("rejects an invalid signature", async () => {
    await expect(verify(eventEnvelope(), { signature: "00" })).resolves.toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it("rejects an unsigned regular event while allowing unsigned URL verification", async () => {
    await expect(verify(eventEnvelope(), { timestamp: "", nonce: "", signature: "" })).resolves.toEqual({
      valid: false,
      reason: "signature",
    });
  });

  it("rejects an expired timestamp", async () => {
    const body = eventEnvelope();
    const rawBody = new TextEncoder().encode(JSON.stringify(body));

    await expect(
      verifyFeishuEventRequest({
        rawBody,
        timestamp: "1600000000",
        nonce,
        signature: await signatureFor(rawBody, "1600000000"),
        appId,
        verificationToken,
        encryptKey,
        nowEpochSeconds,
      }),
    ).resolves.toEqual({ valid: false, reason: "timestamp" });
  });
});
