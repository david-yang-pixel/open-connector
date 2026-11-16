import { afterEach, describe, expect, it, vi } from "vitest";
import { oauth } from "./oauth.ts";

interface RecordedRequest {
  url: string;
  method: string;
  body?: string;
}

const serverUrl = "https://mcp.example.com/v1/mcp";
const resourceMetadataUrl = "https://mcp.example.com/.well-known/oauth-protected-resource/v1/mcp";
const redirectUri = "https://connect.example.com/oauth/callback";

function createError(message: string): Error {
  return new Error(message);
}

function authorizationServerMetadata(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    issuer: "https://auth.example.com",
    authorization_endpoint: "https://auth.example.com/oauth/authorize",
    token_endpoint: "https://auth.example.com/oauth/token",
    registration_endpoint: "https://auth.example.com/oauth/register",
    response_types_supported: ["code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    ...overrides,
  };
}

function stubMcpAuthorizationServer(
  options: { resource?: string; metadata?: Record<string, unknown>; registration?: Record<string, unknown> } = {},
): RecordedRequest[] {
  const requests: RecordedRequest[] = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = init?.method ?? "GET";
    requests.push({ url, method, body: typeof init?.body === "string" ? init.body : undefined });
    if (url === serverUrl) {
      return new Response("unauthorized", {
        status: 401,
        headers: {
          "www-authenticate": `Bearer resource_metadata="${resourceMetadataUrl}", scope="tools:read tools:write"`,
        },
      });
    }
    if (url === resourceMetadataUrl) {
      return Response.json({
        resource: options.resource ?? serverUrl,
        authorization_servers: ["https://auth.example.com"],
        scopes_supported: ["tools:read"],
      });
    }
    if (url === "https://auth.example.com/.well-known/oauth-authorization-server") {
      return Response.json(options.metadata ?? authorizationServerMetadata());
    }
    if (url === "https://auth.example.com/oauth/register") {
      return Response.json(
        {
          client_id: "registered-client",
          redirect_uris: [redirectUri],
          token_endpoint_auth_method: "none",
          ...options.registration,
        },
        { status: 201 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  return requests;
}

describe("custom MCP OAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("discovers the authorization server from the 401 challenge and registers a client", async () => {
    const requests = stubMcpAuthorizationServer();

    const registration = await oauth.registerClient!({
      service: "custom_mcp",
      values: { serverUrl },
      redirectUri,
      createError,
    });

    expect(registration).toEqual({
      clientId: "registered-client",
      clientSecret: "",
      extra: {
        serverUrl,
        resource: serverUrl,
        authorizationServer: "https://auth.example.com",
        authorizationEndpoint: "https://auth.example.com/oauth/authorize",
        tokenEndpoint: "https://auth.example.com/oauth/token",
        tokenEndpointAuthMethod: "none",
      },
      authorizationParams: { resource: serverUrl, scope: "tools:read tools:write" },
    });
    const registrationRequest = requests.find((request) => request.url === "https://auth.example.com/oauth/register");
    expect(JSON.parse(registrationRequest?.body ?? "{}")).toMatchObject({
      client_name: "Open Connector",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "none",
      scope: "tools:read tools:write",
    });
  });

  it("rejects a protected resource that does not cover the MCP server URL", async () => {
    stubMcpAuthorizationServer({ resource: "https://api.example.com/" });

    await expect(
      oauth.registerClient!({ service: "custom_mcp", values: { serverUrl }, redirectUri, createError }),
    ).rejects.toThrow("does not match its URL");
  });

  it("explains when the authorization server has no dynamic client registration", async () => {
    stubMcpAuthorizationServer({ metadata: authorizationServerMetadata({ registration_endpoint: undefined }) });

    await expect(
      oauth.registerClient!({ service: "custom_mcp", values: { serverUrl }, redirectUri, createError }),
    ).rejects.toThrow("does not support dynamic client registration");
  });

  it("requires an https server URL before any network request", async () => {
    const requests = stubMcpAuthorizationServer();

    await expect(
      oauth.registerClient!({
        service: "custom_mcp",
        values: { serverUrl: "http://mcp.example.com/mcp" },
        redirectUri,
        createError,
      }),
    ).rejects.toThrow("OAuth requires an https MCP server URL.");
    expect(requests).toEqual([]);
  });

  it("binds code exchange and refresh to the MCP resource with the registered auth method", async () => {
    const bodies: URLSearchParams[] = [];
    const headers: Headers[] = [];
    vi.stubGlobal("fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(new URLSearchParams(String(init?.body)));
      headers.push(new Headers(init?.headers));
      return Response.json({ access_token: "access-token", refresh_token: "refresh-token", token_type: "Bearer" });
    });
    const clientConfig = {
      service: "custom_mcp",
      clientId: "registered-client",
      clientSecret: "registered-secret",
      extra: {
        resource: serverUrl,
        tokenEndpoint: "https://auth.example.com/oauth/token",
        tokenEndpointAuthMethod: "client_secret_post",
      },
      secretExtra: {},
    };

    await oauth.exchangeCode!({
      code: "authorization-code",
      codeVerifier: "verifier",
      clientConfig,
      redirectUri,
      tokenUrl: "https://auth.example.com/oauth/token",
      fetcher: fetch,
      createError,
    });
    await oauth.refreshAccessToken!({ refreshToken: "refresh-token", clientConfig, fetcher: fetch, createError });

    expect(Object.fromEntries(bodies[0]!)).toEqual({
      grant_type: "authorization_code",
      code: "authorization-code",
      redirect_uri: redirectUri,
      resource: serverUrl,
      code_verifier: "verifier",
      client_id: "registered-client",
      client_secret: "registered-secret",
    });
    expect(Object.fromEntries(bodies[1]!)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "refresh-token",
      resource: serverUrl,
      client_id: "registered-client",
      client_secret: "registered-secret",
    });
    expect(headers[1]!.get("authorization")).toBeNull();
  });
});
