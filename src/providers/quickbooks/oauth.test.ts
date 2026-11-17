import type { OAuthCodeExchangeInput } from "../../oauth/oauth-token.ts";

import { afterEach, describe, expect, it, vi } from "vitest";
import { oauth } from "./oauth.ts";

const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

function clientConfig(extra: Record<string, string> = {}): OAuthCodeExchangeInput["clientConfig"] {
  return { service: "quickbooks", clientId: "client-id", clientSecret: "client-secret", extra, secretExtra: {} };
}

function exchangeInput(overrides: Partial<OAuthCodeExchangeInput> = {}): OAuthCodeExchangeInput {
  return {
    code: "auth-code",
    callbackParameters: { realmId: "9130", state: "s" },
    clientConfig: clientConfig(),
    redirectUri: "http://localhost:3000/oauth/callback",
    tokenUrl,
    fetcher: fetch,
    createError: (message) => new Error(message),
    ...overrides,
  };
}

function stubTokenEndpoint(): { requests: Array<{ url: string; init: RequestInit }> } {
  const requests: Array<{ url: string; init: RequestInit }> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ url: String(input), init: init ?? {} });
      return new Response(
        JSON.stringify({ access_token: "access", refresh_token: "refresh-1", token_type: "bearer", expires_in: 3600 }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }),
  );
  return { requests };
}

describe("QuickBooks OAuth code exchange", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores the realmId from the callback next to the tokens", async () => {
    const { requests } = stubTokenEndpoint();
    const result = await oauth.exchangeCode!(exchangeInput());
    expect(result).toMatchObject({
      accessToken: "access",
      refreshToken: "refresh-1",
      providerSecret: { realmId: "9130", environment: "production" },
    });
    const headers = new Headers(requests[0]!.init.headers);
    expect(headers.get("authorization")).toBe(`Basic ${Buffer.from("client-id:client-secret").toString("base64")}`);
    const body = new URLSearchParams(String(requests[0]!.init.body));
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("auth-code");
    expect(body.has("realmId")).toBe(false);
    expect(Array.from(body.keys()).sort()).toEqual(["code", "grant_type", "redirect_uri"]);
  });

  it("records the sandbox environment from the OAuth client configuration", async () => {
    stubTokenEndpoint();
    const result = await oauth.exchangeCode!(exchangeInput({ clientConfig: clientConfig({ environment: "Sandbox" }) }));
    expect(result.providerSecret).toMatchObject({ environment: "sandbox" });
  });

  it("fails before any token request when the callback has no realmId", async () => {
    const { requests } = stubTokenEndpoint();
    await expect(oauth.exchangeCode!(exchangeInput({ callbackParameters: { state: "s" } }))).rejects.toThrow("realmId");
    expect(requests).toHaveLength(0);
  });

  it("rejects an unknown environment", async () => {
    stubTokenEndpoint();
    await expect(
      oauth.exchangeCode!(exchangeInput({ clientConfig: clientConfig({ environment: "staging" }) })),
    ).rejects.toThrow("production or sandbox");
  });
});

describe("QuickBooks OAuth refresh", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes with Basic authentication only and returns the rotated refresh token", async () => {
    const { requests } = stubTokenEndpoint();
    const result = await oauth.refreshAccessToken!({
      refreshToken: "refresh-0",
      clientConfig: clientConfig(),
      metadata: {},
      fetcher: fetch,
      createError: (message) => new Error(message),
    });
    expect(result).toMatchObject({ accessToken: "access", refreshToken: "refresh-1" });
    expect(result.providerSecret).toBeUndefined();
    expect(requests[0]!.url).toBe(tokenUrl);
    const headers = new Headers(requests[0]!.init.headers);
    expect(headers.get("authorization")).toBe(`Basic ${Buffer.from("client-id:client-secret").toString("base64")}`);
    expect(Array.from(new URLSearchParams(String(requests[0]!.init.body)).keys()).sort()).toEqual([
      "grant_type",
      "refresh_token",
    ]);
  });
});
