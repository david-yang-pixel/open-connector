import type {
  OAuthAccessTokenRefreshInput,
  OAuthClientRegistration,
  OAuthClientRegistrationInput,
  OAuthCodeExchangeInput,
  OAuthTokenResult,
  ProviderOAuthRuntime,
} from "../../oauth/oauth-token.ts";
import type { FetchLike } from "@modelcontextprotocol/client";

import {
  discoverOAuthServerInfo,
  extractWWWAuthenticateParams,
  registerClient,
  resourceUrlFromServerUrl,
  selectClientAuthMethod,
} from "@modelcontextprotocol/client";
import { requiredString } from "../../core/cast.ts";
import { assertPublicHttpUrl } from "../../core/request.ts";
import { requestAuthorizationCodeToken, requestRefreshToken } from "../../oauth/oauth-token.ts";
import { providerFetch, providerUserAgent, ProviderRequestError, runProviderRequest } from "../provider-runtime.ts";

type TokenEndpointAuthMethod = "client_secret_basic" | "client_secret_post" | "none";

const registeredClientName = "Open Connector";

/**
 * MCP authorization (2025-06-18 and later): discover the authorization server from the MCP
 * server's protected resource metadata, register a client per connection, and bind every token
 * request to the MCP server with the RFC 8707 `resource` parameter.
 */
export const oauth: ProviderOAuthRuntime = {
  async registerClient(input) {
    try {
      return await registerCustomMcpClient(input);
    } catch (error) {
      if (error instanceof ProviderRequestError) throw input.createError(error.message);
      throw error;
    }
  },
  exchangeCode(input: OAuthCodeExchangeInput): Promise<OAuthTokenResult> {
    const extra = input.clientConfig.extra;
    const extraFields = resourceFields(extra);
    if (input.codeVerifier) extraFields.code_verifier = input.codeVerifier;
    return requestAuthorizationCodeToken({
      code: input.code,
      clientId: input.clientConfig.clientId,
      clientSecret: input.clientConfig.clientSecret,
      redirectUri: input.redirectUri,
      tokenEndpointAuthMethod: readTokenEndpointAuthMethod(extra),
      tokenUrl: input.tokenUrl,
      extraFields,
      signal: input.signal,
      createError: input.createError,
    });
  },
  refreshAccessToken(input: OAuthAccessTokenRefreshInput): Promise<OAuthTokenResult> {
    const extra = input.clientConfig.extra;
    return requestRefreshToken({
      refreshToken: input.refreshToken,
      clientId: input.clientConfig.clientId,
      clientSecret: input.clientConfig.clientSecret,
      tokenEndpointAuthMethod: readTokenEndpointAuthMethod(extra),
      tokenUrl: requiredString(extra.tokenEndpoint, "tokenEndpoint", input.createError),
      extraFields: resourceFields(extra),
      createError: input.createError,
    });
  },
};

async function registerCustomMcpClient(input: OAuthClientRegistrationInput): Promise<OAuthClientRegistration> {
  const serverUrl = assertPublicHttpUrl(requiredString(input.values.serverUrl, "serverUrl", input.createError), {
    fieldName: "serverUrl",
    createError: input.createError,
  });
  if (serverUrl.protocol !== "https:") throw input.createError("OAuth requires an https MCP server URL.");
  if (serverUrl.username || serverUrl.password) throw input.createError("serverUrl must not include credentials.");
  serverUrl.hash = "";

  return runProviderRequest({ label: "Custom MCP OAuth discovery", signal: input.signal }, async (signal) => {
    const fetchFn: FetchLike = (url, init) => providerFetch(url, { ...init, signal });
    const challenge = await probeAuthorizationChallenge(serverUrl, fetchFn);
    const info = await discoverOAuthServerInfo(serverUrl, {
      resourceMetadataUrl: challenge.resourceMetadataUrl,
      fetchFn,
    });
    const metadata = info.authorizationServerMetadata;
    const challengeMethods = metadata?.code_challenge_methods_supported;
    if (challengeMethods && !challengeMethods.includes("S256")) {
      throw input.createError("The MCP authorization server does not support PKCE S256.");
    }
    if (metadata && !metadata.registration_endpoint) {
      throw input.createError(
        "The MCP authorization server does not support dynamic client registration. Use an access token instead.",
      );
    }

    const scope = challenge.scope ?? info.resourceMetadata?.scopes_supported?.join(" ") ?? undefined;
    const client = await registerClient(info.authorizationServerUrl, {
      metadata,
      clientMetadata: {
        client_name: registeredClientName,
        redirect_uris: [input.redirectUri],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      },
      scope,
      fetchFn,
    });
    const resource = resolveResource(serverUrl, info.resourceMetadata?.resource, input.createError);
    const authorizationParams: Record<string, string> = { resource };
    if (scope) authorizationParams.scope = scope;
    return {
      clientId: client.client_id,
      clientSecret: client.client_secret ?? "",
      extra: {
        serverUrl: serverUrl.toString(),
        resource,
        authorizationServer: info.authorizationServerUrl,
        // Servers implementing the 2025-03-26 spec without metadata use these default paths.
        authorizationEndpoint:
          metadata?.authorization_endpoint ?? new URL("/authorize", info.authorizationServerUrl).toString(),
        tokenEndpoint: metadata?.token_endpoint ?? new URL("/token", info.authorizationServerUrl).toString(),
        tokenEndpointAuthMethod: selectClientAuthMethod(client, metadata?.token_endpoint_auth_methods_supported ?? []),
      },
      authorizationParams,
    };
  });
}

interface AuthorizationChallenge {
  resourceMetadataUrl?: URL;
  scope?: string;
}

/**
 * Send an unauthenticated initialize request; a 401 `WWW-Authenticate` header may name the
 * protected resource metadata URL and the scopes the server wants. Any other outcome falls back
 * to well-known discovery.
 */
async function probeAuthorizationChallenge(serverUrl: URL, fetchFn: FetchLike): Promise<AuthorizationChallenge> {
  let response: Response;
  try {
    response = await fetchFn(serverUrl, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
        "user-agent": providerUserAgent,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: registeredClientName, version: "1.0.0" },
        },
      }),
    });
  } catch {
    return {};
  }
  await response.body?.cancel().catch(() => undefined);
  if (response.status !== 401) return {};
  const { resourceMetadataUrl, scope } = extractWWWAuthenticateParams(response);
  return { resourceMetadataUrl, scope };
}

/**
 * The token audience is the MCP server. A protected resource metadata `resource` is accepted only
 * when it covers the configured server URL, so a server cannot have tokens minted for another API.
 */
function resolveResource(
  serverUrl: URL,
  advertised: string | undefined,
  createError: (message: string) => Error,
): string {
  const fallback = resourceUrlFromServerUrl(serverUrl).toString();
  if (!advertised) return fallback;
  let resource: URL;
  try {
    resource = new URL(advertised);
  } catch {
    throw createError("The MCP server advertised an invalid OAuth resource.");
  }
  const resourcePath = resource.pathname.endsWith("/") ? resource.pathname : `${resource.pathname}/`;
  const serverPath = serverUrl.pathname.endsWith("/") ? serverUrl.pathname : `${serverUrl.pathname}/`;
  if (resource.origin !== serverUrl.origin || !serverPath.startsWith(resourcePath)) {
    throw createError(`The MCP server advertised OAuth resource ${advertised}, which does not match its URL.`);
  }
  return advertised;
}

function resourceFields(extra: Record<string, string>): Record<string, string> {
  const fields: Record<string, string> = {};
  if (extra.resource) fields.resource = extra.resource;
  return fields;
}

function readTokenEndpointAuthMethod(extra: Record<string, string>): TokenEndpointAuthMethod {
  const method = extra.tokenEndpointAuthMethod;
  return method === "client_secret_basic" || method === "client_secret_post" ? method : "none";
}
