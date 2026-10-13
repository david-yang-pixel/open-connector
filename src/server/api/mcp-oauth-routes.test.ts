import { createHash, randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { createCatalogStore } from "../../catalog-store.ts";
import { ProviderLoader } from "../../providers/provider-loader.ts";
import { createConnectApp } from "../connect-app.ts";
import { TransitFileService } from "../files/transit-files.ts";
import { PlainTextSecretCodec } from "../secrets/secret-codec-core.ts";
import { SqliteRuntimeDatabase } from "../storage/sqlite-runtime-store.ts";

const origin = "https://connect.example.com";
const adminToken = "admin-secret";
const chatGptCallback = "https://chatgpt.com/connector_platform_oauth_redirect";
const databases: SqliteRuntimeDatabase[] = [];

afterEach(() => {
  for (const database of databases.splice(0)) database.close();
});

interface SetupOptions {
  mcpOAuth?: boolean;
  adminToken?: string;
  publicOrigin?: string;
}

async function setup(options: SetupOptions = {}) {
  const database = new SqliteRuntimeDatabase(":memory:");
  databases.push(database);
  const { app, runtimeAuthConfigured } = await createConnectApp({
    catalog: createCatalogStore([]),
    runtimeDatabase: database,
    providerLoader: new ProviderLoader({}),
    transitFiles: new TransitFileService({
      rootDir: ".tmp/mcp-oauth-tests",
      publicOrigin: origin,
      ttlSeconds: 60,
      maxBytes: 1024,
    }),
    publicOrigin: options.publicOrigin ?? origin,
    secretCodec: new PlainTextSecretCodec(),
    adminToken: "adminToken" in options ? options.adminToken : adminToken,
    mcpOAuth: options.mcpOAuth ?? true,
  });
  const admin = (path: string, body?: unknown) =>
    app.request(path, {
      method: body === undefined ? "GET" : "POST",
      headers: { authorization: `Bearer ${adminToken}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return { app, admin, runtimeAuthConfigured };
}

type TestApp = Awaited<ReturnType<typeof setup>>["app"];

function pkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url") };
}

async function register(app: TestApp, metadata: Record<string, unknown> = {}): Promise<Response> {
  return app.request("/oauth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_name: "ChatGPT",
      redirect_uris: [chatGptCallback],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      ...metadata,
    }),
  });
}

function authorizePath(clientId: string, challenge: string, extra: Record<string, string> = {}): string {
  const query = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: chatGptCallback,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: "chatgpt-state",
    scope: "mcp",
    resource: `${origin}/mcp`,
    ...extra,
  });
  return `/oauth/authorize?${query}`;
}

async function requestToken(app: TestApp, form: Record<string, string>, authorization?: string): Promise<Response> {
  return app.request("/oauth/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...(authorization ? { authorization } : {}),
    },
    body: new URLSearchParams(form).toString(),
  });
}

async function listTools(app: TestApp, token?: string): Promise<Response> {
  return app.request("/mcp", {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
  });
}

/** Register, authorize and approve like ChatGPT and the administrator would, returning the callback URL. */
async function approveChatGpt(setupResult: Awaited<ReturnType<typeof setup>>, approval: Record<string, unknown>) {
  const { app, admin } = setupResult;
  const client = (await (await register(app)).json()) as { client_id: string; client_secret: string };
  const { verifier, challenge } = pkce();
  const authorize = await app.request(authorizePath(client.client_id, challenge));
  const requestId = new URL(authorize.headers.get("location")!).searchParams.get("request")!;
  const approved = (await (await admin(`/api/mcp-oauth/requests/${requestId}/approve`, approval)).json()) as {
    redirectUrl: string;
  };
  const code = new URL(approved.redirectUrl).searchParams.get("code")!;
  return { client, verifier, requestId, code, redirectUrl: approved.redirectUrl };
}

describe("MCP OAuth for ChatGPT custom connectors", () => {
  it("completes discovery, registration, consent and token exchange, issuing a runtime token", async () => {
    const context = await setup();
    const { app, admin, runtimeAuthConfigured } = context;
    expect(runtimeAuthConfigured).toBe(true);

    const challenge = await listTools(app);
    expect(challenge.status).toBe(401);
    expect(challenge.headers.get("www-authenticate")).toBe(
      `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="mcp"`,
    );

    await expect((await app.request("/.well-known/oauth-protected-resource/mcp")).json()).resolves.toEqual({
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
      scopes_supported: ["mcp"],
      bearer_methods_supported: ["header"],
    });
    await expect((await app.request("/.well-known/oauth-authorization-server")).json()).resolves.toMatchObject({
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      code_challenge_methods_supported: ["S256"],
      authorization_response_iss_parameter_supported: true,
    });

    const registration = await register(app);
    expect(registration.status).toBe(201);
    const client = (await registration.json()) as Record<string, unknown>;
    expect(client).toMatchObject({
      client_name: "ChatGPT",
      redirect_uris: [chatGptCallback],
      grant_types: ["authorization_code"],
      token_endpoint_auth_method: "client_secret_post",
      client_secret_expires_at: 0,
    });
    expect(client.client_secret).toMatch(/^ocs_/);

    const { verifier, challenge: codeChallenge } = pkce();
    const authorize = await app.request(authorizePath(client.client_id as string, codeChallenge));
    expect(authorize.status).toBe(302);
    const consentUrl = new URL(authorize.headers.get("location")!);
    expect(`${consentUrl.origin}${consentUrl.pathname}`).toBe(`${origin}/authorize`);
    const requestId = consentUrl.searchParams.get("request")!;

    expect((await app.request(`/api/mcp-oauth/requests/${requestId}`)).status).toBe(401);
    await expect((await admin(`/api/mcp-oauth/requests/${requestId}`)).json()).resolves.toMatchObject({
      id: requestId,
      clientId: client.client_id,
      clientName: "ChatGPT",
      redirectUri: chatGptCallback,
    });

    const approval = await admin(`/api/mcp-oauth/requests/${requestId}/approve`, {
      name: "ChatGPT",
      allowedActions: ["github.*"],
      blockedActions: ["github.delete_repository"],
    });
    expect(approval.status).toBe(200);
    const callback = new URL(((await approval.json()) as { redirectUrl: string }).redirectUrl);
    expect(`${callback.origin}${callback.pathname}`).toBe(chatGptCallback);
    expect(callback.searchParams.get("state")).toBe("chatgpt-state");
    expect(callback.searchParams.get("iss")).toBe(origin);
    expect((await admin(`/api/mcp-oauth/requests/${requestId}`)).status).toBe(404);

    const token = await requestToken(app, {
      grant_type: "authorization_code",
      code: callback.searchParams.get("code")!,
      redirect_uri: chatGptCallback,
      code_verifier: verifier,
      client_id: client.client_id as string,
      client_secret: client.client_secret as string,
      resource: `${origin}/mcp`,
    });
    expect(token.status).toBe(200);
    expect(token.headers.get("cache-control")).toBe("no-store");
    const issued = (await token.json()) as Record<string, string>;
    expect(issued).toEqual({ access_token: expect.stringMatching(/^oct_/), token_type: "Bearer", scope: "mcp" });

    expect((await listTools(app, issued.access_token)).status).toBe(200);
    await expect((await admin("/api/runtime-tokens")).json()).resolves.toEqual([
      expect.objectContaining({
        name: "ChatGPT",
        allowedActions: ["github.*"],
        blockedActions: ["github.delete_repository"],
      }),
    ]);
  });

  it("revokes the issued token when an authorization code is replayed", async () => {
    const context = await setup();
    const { client, verifier, code } = await approveChatGpt(context, { name: "ChatGPT" });
    const form = {
      grant_type: "authorization_code",
      code,
      redirect_uri: chatGptCallback,
      code_verifier: verifier,
    };
    const basic = `Basic ${Buffer.from(`${client.client_id}:${client.client_secret}`).toString("base64")}`;
    const issued = (await (await requestToken(context.app, form, basic)).json()) as { access_token: string };
    expect((await listTools(context.app, issued.access_token)).status).toBe(200);

    const replay = await requestToken(context.app, form, basic);
    expect(replay.status).toBe(400);
    await expect(replay.json()).resolves.toMatchObject({ error: "invalid_grant" });
    const rejected = await listTools(context.app, issued.access_token);
    expect(rejected.status).toBe(401);
    expect(rejected.headers.get("www-authenticate")).toContain('error="invalid_token"');
  });

  it("rejects token requests with a wrong client secret or PKCE verifier", async () => {
    const context = await setup();
    const { client, verifier, code } = await approveChatGpt(context, { name: "ChatGPT" });
    const form = {
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      client_id: client.client_id,
    };

    const wrongSecret = await requestToken(context.app, { ...form, client_secret: "ocs_wrong" });
    expect(wrongSecret.status).toBe(401);
    expect(wrongSecret.headers.get("www-authenticate")).toContain("Basic");
    await expect(wrongSecret.json()).resolves.toMatchObject({ error: "invalid_client" });

    const wrongVerifier = await requestToken(context.app, {
      ...form,
      client_secret: client.client_secret,
      code_verifier: pkce().verifier,
    });
    expect(wrongVerifier.status).toBe(400);
    await expect(wrongVerifier.json()).resolves.toMatchObject({ error: "invalid_grant" });

    const unsupported = await requestToken(context.app, { ...form, grant_type: "refresh_token" });
    await expect(unsupported.json()).resolves.toMatchObject({ error: "unsupported_grant_type" });
  });

  it("issues tokens to public clients that rely on PKCE alone", async () => {
    const context = await setup();
    const client = (await (await register(context.app, { token_endpoint_auth_method: "none" })).json()) as {
      client_id: string;
      client_secret?: string;
    };
    expect(client.client_secret).toBeUndefined();
    const { verifier, challenge } = pkce();
    const authorize = await context.app.request(authorizePath(client.client_id, challenge));
    const requestId = new URL(authorize.headers.get("location")!).searchParams.get("request")!;
    const approved = (await (
      await context.admin(`/api/mcp-oauth/requests/${requestId}/approve`, { name: "Public" })
    ).json()) as { redirectUrl: string };
    const token = await requestToken(context.app, {
      grant_type: "authorization_code",
      code: new URL(approved.redirectUrl).searchParams.get("code")!,
      code_verifier: verifier,
      client_id: client.client_id,
    });
    expect(token.status).toBe(200);
  });

  it("only registers ChatGPT connector callbacks", async () => {
    const { app } = await setup();
    const rejected = await register(app, { redirect_uris: ["https://attacker.example.com/callback"] });
    expect(rejected.status).toBe(400);
    await expect(rejected.json()).resolves.toMatchObject({ error: "invalid_redirect_uri" });
    expect((await register(app, { redirect_uris: ["https://chatgpt.com/connector/oauth/abc123"] })).status).toBe(201);
    expect((await register(app, { redirect_uris: ["https://chatgpt.com/connector/oauth/"] })).status).toBe(400);
    expect((await register(app, { grant_types: ["client_credentials"] })).status).toBe(400);
  });

  it("answers invalid authorization requests in place or on the verified callback", async () => {
    const { app } = await setup();
    const unknown = await app.request(authorizePath("unknown-client", pkce().challenge));
    expect(unknown.status).toBe(400);
    expect(unknown.headers.get("location")).toBeNull();
    await expect(unknown.json()).resolves.toMatchObject({ error: "invalid_client" });

    const client = (await (await register(app)).json()) as { client_id: string };
    const mismatched = await app.request(
      authorizePath(client.client_id, pkce().challenge, { redirect_uri: "https://chatgpt.com/other" }),
    );
    expect(mismatched.status).toBe(400);
    expect(mismatched.headers.get("location")).toBeNull();

    const withoutPkce = await app.request(
      authorizePath(client.client_id, pkce().challenge, { code_challenge_method: "plain" }),
    );
    expect(withoutPkce.status).toBe(302);
    const callback = new URL(withoutPkce.headers.get("location")!);
    expect(`${callback.origin}${callback.pathname}`).toBe(chatGptCallback);
    expect(callback.searchParams.get("error")).toBe("invalid_request");
    expect(callback.searchParams.get("state")).toBe("chatgpt-state");
    expect(callback.searchParams.get("iss")).toBe(origin);

    const wrongResource = await app.request(
      authorizePath(client.client_id, pkce().challenge, { resource: "https://other.example.com/mcp" }),
    );
    expect(new URL(wrongResource.headers.get("location")!).searchParams.get("error")).toBe("invalid_target");
  });

  it("returns access_denied to ChatGPT when the administrator denies the request", async () => {
    const { app, admin } = await setup();
    const client = (await (await register(app)).json()) as { client_id: string };
    const authorize = await app.request(authorizePath(client.client_id, pkce().challenge));
    const requestId = new URL(authorize.headers.get("location")!).searchParams.get("request")!;
    const denied = (await (await admin(`/api/mcp-oauth/requests/${requestId}/deny`, {})).json()) as {
      redirectUrl: string;
    };
    const callback = new URL(denied.redirectUrl);
    expect(callback.searchParams.get("error")).toBe("access_denied");
    expect(callback.searchParams.get("state")).toBe("chatgpt-state");
    expect((await admin(`/api/mcp-oauth/requests/${requestId}/approve`, { name: "Late" })).status).toBe(404);
  });

  it("requires a token name on approval", async () => {
    const { app, admin } = await setup();
    const client = (await (await register(app)).json()) as { client_id: string };
    const authorize = await app.request(authorizePath(client.client_id, pkce().challenge));
    const requestId = new URL(authorize.headers.get("location")!).searchParams.get("request")!;
    expect((await admin(`/api/mcp-oauth/requests/${requestId}/approve`, {})).status).toBe(400);
    expect((await admin(`/api/mcp-oauth/requests/${requestId}`)).status).toBe(200);
  });

  it("keeps the endpoints and the MCP challenge off unless enabled", async () => {
    const { app, runtimeAuthConfigured } = await setup({ mcpOAuth: false });
    expect(runtimeAuthConfigured).toBe(false);
    expect((await app.request("/.well-known/oauth-authorization-server")).status).toBe(404);
    expect((await app.request("/.well-known/oauth-protected-resource/mcp")).status).toBe(404);
    expect((await register(app)).status).toBe(404);
    const open = await listTools(app);
    expect(open.status).toBe(200);
    expect(open.headers.get("www-authenticate")).toBeNull();
  });

  it("refuses to start without an administrator token or with a plain HTTP public origin", async () => {
    await expect(setup({ adminToken: undefined })).rejects.toThrow("OOMOL_CONNECT_ADMIN_TOKEN");
    await expect(setup({ publicOrigin: "http://connect.example.com" })).rejects.toThrow("HTTPS");
    await expect(setup({ publicOrigin: "http://localhost:3000" })).resolves.toBeDefined();
  });
});
