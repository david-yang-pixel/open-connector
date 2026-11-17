import type { BilibiliActionContext } from "./runtime.ts";

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import {
  bilibiliFormRequest,
  createBilibiliSignedHeaders,
  readBilibiliEnvelopeData,
  requestBilibiliOAuthToken,
} from "./runtime.ts";

const signingInput = {
  clientId: "test-client-id",
  appSecret: "test-app-secret",
  accessToken: "test-access-token",
};

describe("createBilibiliSignedHeaders", () => {
  it("produces the full signature version 2.0 header set", () => {
    const headers = createBilibiliSignedHeaders(signingInput);
    expect(headers["accept"]).toBe("application/json");
    expect(headers["access-token"]).toBe("test-access-token");
    expect(headers["x-bili-accesskeyid"]).toBe("test-client-id");
    expect(headers["x-bili-signature-method"]).toBe("HMAC-SHA256");
    expect(headers["x-bili-signature-version"]).toBe("2.0");
    expect(headers["x-bili-signature-nonce"]).toBeTruthy();
    expect(Number(headers["x-bili-timestamp"])).toBeGreaterThan(0);
    expect(headers["authorization"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("signs the MD5 of the exact request body string", () => {
    const headers = createBilibiliSignedHeaders({ ...signingInput, body: '{"name":"test.mp4","utype":"0"}' });
    expect(headers["x-bili-content-md5"]).toBe("18323d990354c0c0d63340f0a67ce8e4");
  });

  it("signs the MD5 of an empty string when there is no body", () => {
    const headers = createBilibiliSignedHeaders(signingInput);
    expect(headers["x-bili-content-md5"]).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("builds the HMAC over the sorted header lines with the trailing newline trimmed", () => {
    const headers = createBilibiliSignedHeaders({ ...signingInput, body: '{"a":1}' });
    const canonical = [
      `x-bili-accesskeyid:${headers["x-bili-accesskeyid"]}`,
      `x-bili-content-md5:${headers["x-bili-content-md5"]}`,
      `x-bili-signature-method:${headers["x-bili-signature-method"]}`,
      `x-bili-signature-nonce:${headers["x-bili-signature-nonce"]}`,
      `x-bili-signature-version:${headers["x-bili-signature-version"]}`,
      `x-bili-timestamp:${headers["x-bili-timestamp"]}`,
    ].join("\n");
    // Bilibili's official demos sign the joined lines with the last "\n" trimmed.
    const expected = createHmac("sha256", signingInput.appSecret).update(canonical).digest("hex");
    expect(headers["authorization"]).toBe(expected);

    const withTrailingNewline = createHmac("sha256", signingInput.appSecret)
      .update(canonical + "\n")
      .digest("hex");
    expect(headers["authorization"]).not.toBe(withTrailingNewline);
  });
});

describe("readBilibiliEnvelopeData", () => {
  it("returns the data field when the code is 0", () => {
    expect(readBilibiliEnvelopeData({ code: 0, message: "0", data: { resource_id: "BV1" } }, "test")).toEqual({
      resource_id: "BV1",
    });
  });

  it("maps code -101 to a 401 authorization failure", () => {
    try {
      readBilibiliEnvelopeData({ code: -101, message: "账号未登录" }, "test");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderRequestError);
      expect((error as ProviderRequestError).status).toBe(401);
    }
  });

  it("maps documented credential, permission, rate-limit and input codes to their statuses", () => {
    const cases: [number, number][] = [
      [127001, 401],
      [127002, 401],
      [127011, 403],
      [123001, 403],
      [127306, 429],
      [4000, 400],
      [123015, 400],
      [129005, 400],
    ];
    for (const [code, status] of cases) {
      try {
        readBilibiliEnvelopeData({ code, message: "x" }, "test");
        expect.unreachable();
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderRequestError);
        expect((error as ProviderRequestError).status).toBe(status);
        expect((error as ProviderRequestError).message).toContain(String(code));
      }
    }
  });

  it("maps other non-zero codes to a 502 provider error with the message", () => {
    try {
      readBilibiliEnvelopeData({ code: 21010, message: "title too long" }, "archive submit");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderRequestError);
      expect((error as ProviderRequestError).status).toBe(502);
      expect((error as ProviderRequestError).message).toContain("21010");
      expect((error as ProviderRequestError).message).toContain("title too long");
    }
  });

  it("rejects non-envelope payloads", () => {
    expect(() => readBilibiliEnvelopeData("not json object", "test")).toThrowError();
  });
});

describe("requestBilibiliOAuthToken", () => {
  function tokenFetcher(payload: unknown) {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetcher = async (url: unknown, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify(payload), { status: 200 });
    };
    return { calls, fetcher: fetcher as typeof fetch };
  }

  it("sends the fields in the URL query of a POST request", async () => {
    const { calls, fetcher } = tokenFetcher({
      code: 0,
      data: { access_token: "access", refresh_token: "refresh", expires_in: 1760000000, scopes: ["ARC_BASE"] },
    });
    await requestBilibiliOAuthToken({
      url: "https://api.bilibili.com/x/account-oauth2/v1/token",
      fields: { client_id: "cid", client_secret: "secret", grant_type: "authorization_code", code: "the-code" },
      fetcher,
      createError: (message) => new Error(message),
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.init?.method).toBe("POST");
    const url = new URL(calls[0]!.url);
    expect(url.searchParams.get("client_id")).toBe("cid");
    expect(url.searchParams.get("client_secret")).toBe("secret");
    expect(url.searchParams.get("grant_type")).toBe("authorization_code");
    expect(url.searchParams.get("code")).toBe("the-code");
  });

  it("treats expires_in as an absolute UTC timestamp", async () => {
    const { fetcher } = tokenFetcher({
      code: 0,
      data: { access_token: "access", refresh_token: "refresh", expires_in: 1760000000 },
    });
    const result = await requestBilibiliOAuthToken({
      url: "https://api.bilibili.com/x/account-oauth2/v1/token",
      fields: {},
      fetcher,
      createError: (message) => new Error(message),
    });
    expect(result.expiresAt).toBe(new Date(1760000000 * 1000).toISOString());
    expect(result.accessToken).toBe("access");
    expect(result.refreshToken).toBe("refresh");
    expect(result.metadata.scopes).toBeUndefined();
  });

  it("surfaces the envelope message when the code is not 0", async () => {
    const { fetcher } = tokenFetcher({ code: -400, message: "invalid code" });
    await expect(
      requestBilibiliOAuthToken({
        url: "https://api.bilibili.com/x/account-oauth2/v1/token",
        fields: {},
        fetcher,
        createError: (message) => new Error(message),
      }),
    ).rejects.toThrow("invalid code");
  });

  it("maps a transport failure to the createError message", async () => {
    const fetcher = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    await expect(
      requestBilibiliOAuthToken({
        url: "https://api.bilibili.com/x/account-oauth2/v1/token",
        fields: {},
        fetcher,
        createError: (message) => new Error(message),
      }),
    ).rejects.toThrow("Bilibili OAuth token request failed without an HTTP response.");
  });

  it("maps a parent abort to a cancellation message", async () => {
    const fetcher = (async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    }) as typeof fetch;
    await expect(
      requestBilibiliOAuthToken({
        url: "https://api.bilibili.com/x/account-oauth2/v1/token",
        fields: {},
        fetcher,
        signal: AbortSignal.abort(),
        createError: (message) => new Error(message),
      }),
    ).rejects.toThrow("Bilibili OAuth token request was cancelled.");
  });
});

describe("bilibiliFormRequest", () => {
  function formContext() {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetcher = async (url: unknown, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ code: 0, message: "0", data: { id: 42 } }), { status: 200 });
    };
    const context: BilibiliActionContext = { ...signingInput, fetcher: fetcher as typeof fetch };
    return { calls, context };
  }

  it("posts form fields and signs them as an empty body", async () => {
    const { calls, context } = formContext();
    const data = await bilibiliFormRequest(context, {
      path: "/article/delete",
      fields: { ids: "5678,123", unused: undefined },
      label: "test form",
    });
    expect(data).toEqual({ id: 42 });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://member.bilibili.com/arcopen/fn/article/delete");
    const init = calls[0]!.init!;
    expect(init.method).toBe("POST");
    const form = init.body as FormData;
    expect(form.get("ids")).toBe("5678,123");
    expect(form.get("unused")).toBeNull();

    const headers = new Headers(init.headers);
    expect(headers.get("x-bili-content-md5")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    // The signer must not set a content type; fetch derives the multipart boundary itself.
    expect(headers.get("content-type")).toBeNull();
  });

  it("rejects when the envelope code is not 0", async () => {
    const { context } = formContext();
    await expect(
      bilibiliFormRequest(context, { path: "/article/delete", fields: {}, label: "test form" }),
    ).resolves.toEqual({ id: 42 });
    context.fetcher = (async () =>
      new Response(JSON.stringify({ code: 22015, message: "no permission" }), { status: 200 })) as typeof fetch;
    await expect(
      bilibiliFormRequest(context, { path: "/article/delete", fields: {}, label: "test form" }),
    ).rejects.toBeInstanceOf(ProviderRequestError);
  });
});
