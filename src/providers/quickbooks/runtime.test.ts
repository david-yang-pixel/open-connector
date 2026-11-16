import type { ResolvedCredential } from "../../core/types.ts";
import type { ProviderFetch } from "../provider-runtime.ts";
import type { QuickbooksContext } from "./runtime.ts";

import { describe, expect, it } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import { credentialValidators, quickbooksActionHandlers } from "./executors.ts";

interface RecordedRequest {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body?: string;
  formData?: FormData;
}

type Responder = (request: RecordedRequest) => Response;

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

function createContext(respond: Responder, overrides: Partial<QuickbooksContext> = {}) {
  const requests: RecordedRequest[] = [];
  const fetcher: ProviderFetch = async (input, init) => {
    const request: RecordedRequest = {
      url: new URL(String(input)),
      method: init?.method ?? "GET",
      headers: Object.fromEntries(
        Object.entries(init?.headers ?? {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
      ),
      body: init?.body === undefined || init.body instanceof FormData ? undefined : String(init.body),
      formData: init?.body instanceof FormData ? init.body : undefined,
    };
    requests.push(request);
    return respond(request);
  };
  const context: QuickbooksContext = {
    accessToken: "access-token",
    tokenType: "Bearer",
    realmId: "9130",
    baseUrl: "https://quickbooks.api.intuit.com",
    fetcher,
    ...overrides,
  };
  return { context, requests };
}

const handlers = quickbooksActionHandlers;

describe("QuickBooks errors", () => {
  const faultBody = (code: string, message: string, detail: string) => ({
    Fault: { Error: [{ Message: message, Detail: detail, code }], type: "ValidationFault" },
  });

  it("maps a Fault to a message with the code and intuit_tid", async () => {
    const { context } = createContext(() =>
      jsonResponse(faultBody("2020", "Required param missing", "Customer.DisplayName"), {
        status: 400,
        headers: { intuit_tid: "tid-1" },
      }),
    );
    const error = await handlers.create_customer!({ display_name: "X" }, context).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ProviderRequestError);
    expect((error as ProviderRequestError).status).toBe(400);
    expect((error as ProviderRequestError).message).toBe(
      "Required param missing: Customer.DisplayName (code 2020) [intuit_tid tid-1]",
    );
    expect((error as ProviderRequestError).details).toMatchObject({ intuitTid: "tid-1" });
  });

  it("tells the caller to re-fetch on a stale SyncToken", async () => {
    const { context } = createContext(() =>
      jsonResponse(faultBody("5010", "Stale Object Error", "Stale object"), { status: 400 }),
    );
    await expect(handlers.update_customer!({ id: "5", sync_token: "1" }, context)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining("Re-fetch the entity"),
    });
  });

  it("treats a Fault inside a 200 response as an error", async () => {
    const { context } = createContext(() => jsonResponse(faultBody("4000", "Query error", "bad")));
    await expect(handlers.list_customers!({}, context)).rejects.toMatchObject({ status: 400 });
  });

  it("passes 401 through for execution and reports 429 and 5xx", async () => {
    const status = (code: number) =>
      createContext(() => jsonResponse(faultBody("100", "m", "d"), { status: code }), {}).context;
    await expect(handlers.get_account!({ id: "1" }, status(401))).rejects.toMatchObject({ status: 401 });
    await expect(handlers.get_account!({ id: "1" }, status(429))).rejects.toMatchObject({
      status: 429,
      message: expect.stringContaining("about 60 seconds"),
    });
    await expect(handlers.get_account!({ id: "1" }, status(503))).rejects.toMatchObject({ status: 502 });
  });

  it("survives a non-JSON error page", async () => {
    const { context } = createContext(() => new Response("<html>bad gateway</html>", { status: 502 }));
    await expect(handlers.get_account!({ id: "1" }, context)).rejects.toMatchObject({
      status: 502,
      message: "QuickBooks request failed (HTTP 502)",
    });
  });
});

describe("QuickBooks credential validation", () => {
  const companyInfo = jsonResponse({ CompanyInfo: { CompanyName: "Acme Books", Id: "9130" } });
  const oauthCredential: Extract<ResolvedCredential, { authType: "oauth2" }> = {
    authType: "oauth2",
    accessToken: "oauth-token",
    tokenType: "Bearer",
    providerSecret: { realmId: "9130", environment: "sandbox" },
    profile: { accountId: "oauth2", displayName: "OAuth Credential", grantedScopes: [] },
    metadata: {},
  };

  it("identifies an OAuth connection by company and uses the sandbox host", async () => {
    const { context, requests } = createContext(() => companyInfo.clone());
    const result = await credentialValidators.oauth2!(oauthCredential, { fetcher: context.fetcher });
    expect(result).toEqual({ profile: { accountId: "9130", displayName: "Acme Books" } });
    expect(requests[0]!.url.origin).toBe("https://sandbox-quickbooks.api.intuit.com");
    expect(requests[0]!.url.pathname).toBe("/v3/company/9130/companyinfo/9130");
    expect(requests[0]!.headers.authorization).toBe("Bearer oauth-token");
  });

  it("preserves an unknown upstream 401 without forcing credential recovery during validation", async () => {
    const { context } = createContext(() => jsonResponse({}, { status: 401 }));
    await expect(credentialValidators.oauth2!(oauthCredential, { fetcher: context.fetcher })).rejects.toMatchObject({
      status: 401,
      code: "provider_error",
    });
  });

  it("rejects a connection without a company and an unknown environment", async () => {
    const { context } = createContext(() => companyInfo.clone());
    await expect(
      credentialValidators.oauth2!({ ...oauthCredential, providerSecret: {} }, { fetcher: context.fetcher }),
    ).rejects.toMatchObject({ status: 401 });
    await expect(
      credentialValidators.oauth2!(
        { ...oauthCredential, providerSecret: { realmId: "1", environment: "staging" } },
        { fetcher: context.fetcher },
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
