import type { ResolvedCredential } from "../../core/types.ts";
import type { ProviderFetch } from "../provider-runtime.ts";

import { describe, expect, it } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import { credentialValidators } from "./executors.ts";

interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

function createFetcher(routes: Record<string, unknown | ((request: RecordedRequest) => unknown)>): {
  fetcher: ProviderFetch;
  requests: RecordedRequest[];
} {
  const requests: RecordedRequest[] = [];
  const fetcher: ProviderFetch = async (input, init) => {
    const url = String(input);
    const request: RecordedRequest = {
      url,
      method: init?.method ?? "GET",
      headers: Object.fromEntries(
        Object.entries(init?.headers ?? {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
      ),
    };
    if (init?.body) {
      request.body = JSON.parse(String(init.body));
    }
    requests.push(request);
    const pathname = url.split("?")[0];
    const route = routes[pathname];
    if (route === undefined) {
      return new Response(JSON.stringify({ error: `no route for ${pathname}` }), { status: 404 });
    }
    const payload = typeof route === "function" ? route(request) : route;
    return new Response(JSON.stringify(payload), { status: 200 });
  };
  return { fetcher, requests };
}

const accessToken = "test-access-token";
const oauthCredential: Extract<ResolvedCredential, { authType: "oauth2" }> = {
  authType: "oauth2",
  accessToken,
  tokenType: "Bearer",
  profile: { accountId: "oauth2", displayName: "OAuth Credential", grantedScopes: [] },
  metadata: {},
};
const userinfoFixture = {
  sub: "f7a1382e-c791-4cae-93be-1b912c6a7c6e",
  xero_userid: "f7a1382e-c791-4cae-93be-1b912c6a7c6e",
  name: "Ada Lovelace",
  preferred_username: "ada@example.com",
  email: "ada@example.com",
};

describe("credentialValidators", () => {
  it("accepts a valid identity when no organisation is connected", async () => {
    const { fetcher, requests } = createFetcher({
      "https://identity.xero.com/connect/userinfo": userinfoFixture,
      "https://api.xero.com/connections": [],
    });
    await expect(credentialValidators.oauth2!(oauthCredential, { fetcher })).resolves.toEqual({
      profile: { accountId: "f7a1382e-c791-4cae-93be-1b912c6a7c6e", displayName: "Ada Lovelace" },
      metadata: { validationEndpoint: "https://identity.xero.com/connect/userinfo" },
    });
    expect(requests.map((request) => request.url)).toEqual(["https://identity.xero.com/connect/userinfo"]);
  });

  it("rejects userinfo payloads that are missing an identity", async () => {
    const { fetcher } = createFetcher({
      "https://identity.xero.com/connect/userinfo": { name: "Ada Lovelace", email: "ada@example.com" },
    });
    await expect(credentialValidators.oauth2!(oauthCredential, { fetcher })).rejects.toEqual(
      new ProviderRequestError(502, "Xero userinfo response is missing sub"),
    );
  });

  it("rejects unauthorized userinfo responses", async () => {
    const fetcher: ProviderFetch = async () => Response.json({ error: "invalid_token" }, { status: 401 });
    await expect(credentialValidators.oauth2!(oauthCredential, { fetcher })).rejects.toMatchObject({
      status: 400,
      message: "invalid_token",
    });
  });
});
