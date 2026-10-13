import type { TokenPolicy } from "../../core/action-policy.ts";
import type { JsonRequestBody } from "../api/http-utils.ts";
import type { McpOAuthClient, McpOAuthClientAuthMethod, McpOAuthStore } from "../storage/mcp-oauth-store.ts";
import type { RuntimeTokenService } from "../storage/runtime-token-service.ts";

import { Buffer } from "node:buffer";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { optionalRawString, optionalString } from "../../core/cast.ts";

/** The only scope this authorization server grants: calling the /mcp endpoint with the approved token policy. */
const mcpScope = "mcp";
const requestTtlMs = 10 * 60_000;
const codeTtlMs = 60_000;
/** Consumed codes outlive their expiry this long so a replay can still revoke the token they issued. */
const statePurgeDelayMs = 60 * 60_000;
const staleClientMs = 24 * 60 * 60_000;
const maxClients = 1_000;
const maxRedirectUris = 5;
const maxClientNameLength = 100;
const maxStateLength = 1_024;
const clientAuthMethods: McpOAuthClientAuthMethod[] = ["none", "client_secret_basic", "client_secret_post"];
/**
 * ChatGPT's connector callbacks. ChatGPT uses the stable URI when the authorization server returns `iss`, and a
 * per-connector callback URI otherwise. Restricting registration to these keeps authorization codes from being
 * delivered anywhere but ChatGPT.
 */
const chatGptRedirectUri = "https://chatgpt.com/connector_platform_oauth_redirect";
const chatGptRedirectUriPrefix = "https://chatgpt.com/connector/oauth/";

/** An OAuth protocol error, serialized as `{ error, error_description }` per RFC 6749 section 5.2. */
export class McpOAuthError extends Error {
  readonly error: string;
  readonly status: 400 | 401 | 503;

  constructor(error: string, message: string, status: 400 | 401 | 503 = 400) {
    super(message);
    this.error = error;
    this.status = status;
  }
}

export interface McpOAuthServiceOptions {
  store: McpOAuthStore;
  runtimeTokens: RuntimeTokenService;
  /** Public origin of this runtime; the issuer and the base of every advertised endpoint. */
  publicOrigin: string;
}

/** Where `/oauth/authorize` sends the browser next. */
export type McpOAuthAuthorizeResult = { type: "redirect"; location: string } | { type: "error"; error: McpOAuthError };

/** A pending authorization request as shown to the administrator on the consent page. */
export interface McpOAuthAuthorizationRequestSummary {
  id: string;
  clientId: string;
  clientName: string;
  redirectUri: string;
  createdAt: string;
  expiresAt: string;
}

export interface McpOAuthApproval {
  requestId: string;
  /** Name of the runtime token created for this client, as on the console's token form. */
  tokenName: string;
  policy: TokenPolicy;
}

/** Credentials presented to the token endpoint, before the client is authenticated. */
export interface McpOAuthTokenRequest {
  form: URLSearchParams;
  authorization: string | undefined;
}

export interface McpOAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  scope: string;
}

interface PendingAuthorization {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string | undefined;
  createdAt: string;
  expiresAt: string;
}

interface AuthorizationCode {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  tokenName: string;
  policy: TokenPolicy;
}

/**
 * Authorization server for the /mcp endpoint, built for ChatGPT custom connectors.
 *
 * ChatGPT registers itself dynamically, sends the administrator to the console consent page, and exchanges the
 * approved authorization code for an ordinary runtime token. The token carries the policy chosen on the consent page,
 * appears with the console's other runtime tokens, and stays valid until it is revoked there.
 */
export class McpOAuthService {
  private readonly store: McpOAuthStore;
  private readonly runtimeTokens: RuntimeTokenService;
  private readonly origin: string;

  constructor(options: McpOAuthServiceOptions) {
    this.store = options.store;
    this.runtimeTokens = options.runtimeTokens;
    this.origin = options.publicOrigin.replace(/\/+$/, "");
  }

  /** The protected resource identifier: the /mcp endpoint URL. */
  get resource(): string {
    return `${this.origin}/mcp`;
  }

  /** RFC 9728 metadata URL advertised in the /mcp `WWW-Authenticate` challenge. */
  get resourceMetadataUrl(): string {
    return `${this.origin}/.well-known/oauth-protected-resource/mcp`;
  }

  /** RFC 9728 protected resource metadata. */
  protectedResourceMetadata(): Record<string, unknown> {
    return {
      resource: this.resource,
      authorization_servers: [this.origin],
      scopes_supported: [mcpScope],
      bearer_methods_supported: ["header"],
    };
  }

  /** RFC 8414 authorization server metadata. */
  authorizationServerMetadata(): Record<string, unknown> {
    return {
      issuer: this.origin,
      authorization_endpoint: `${this.origin}/oauth/authorize`,
      token_endpoint: `${this.origin}/oauth/token`,
      registration_endpoint: `${this.origin}/oauth/register`,
      scopes_supported: [mcpScope],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: clientAuthMethods,
      authorization_response_iss_parameter_supported: true,
    };
  }

  /** RFC 7591 dynamic client registration. Only ChatGPT connector callbacks are accepted as redirect URIs. */
  async registerClient(body: JsonRequestBody): Promise<Record<string, unknown>> {
    const redirectUris = readRedirectUris(body.redirect_uris);
    const tokenEndpointAuthMethod = readClientAuthMethod(body.token_endpoint_auth_method);
    assertSupportedValues(body.grant_types, "grant_types", "authorization_code");
    assertSupportedValues(body.response_types, "response_types", "code");
    const clientName = optionalString(body.client_name) ?? "MCP client";
    if (clientName.length > maxClientNameLength) {
      throw new McpOAuthError(
        "invalid_client_metadata",
        `client_name must not exceed ${maxClientNameLength} characters.`,
      );
    }

    const now = new Date();
    const clientSecret =
      tokenEndpointAuthMethod === "none" ? undefined : `ocs_${randomBytes(32).toString("base64url")}`;
    const client: McpOAuthClient = {
      clientId: randomUUID(),
      clientName,
      redirectUris,
      tokenEndpointAuthMethod,
      clientSecretHash: clientSecret ? sha256Base64Url(clientSecret) : null,
      createdAt: now.toISOString(),
      lastUsedAt: null,
    };
    const registered = await this.store.registerClient({
      client,
      staleBefore: new Date(now.getTime() - staleClientMs).toISOString(),
      maxClients,
    });
    if (!registered) {
      throw new McpOAuthError("temporarily_unavailable", "Too many OAuth clients are registered.", 503);
    }

    const response: Record<string, unknown> = {
      client_id: client.clientId,
      client_id_issued_at: Math.floor(now.getTime() / 1000),
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: client.tokenEndpointAuthMethod,
      scope: mcpScope,
    };
    if (clientSecret) {
      response.client_secret = clientSecret;
      response.client_secret_expires_at = 0;
    }
    return response;
  }

  /**
   * Validate an authorization request and park it for the administrator. Errors before the client and redirect URI
   * are verified are shown in place, never redirected, so this endpoint cannot be used as an open redirector.
   */
  async authorize(query: URLSearchParams): Promise<McpOAuthAuthorizeResult> {
    const client = await this.store.getClient(query.get("client_id") ?? "");
    if (!client) {
      return { type: "error", error: new McpOAuthError("invalid_client", "Unknown OAuth client.") };
    }
    const redirectUri =
      query.get("redirect_uri") ?? (client.redirectUris.length === 1 ? client.redirectUris[0] : undefined);
    if (!redirectUri || !client.redirectUris.includes(redirectUri)) {
      return {
        type: "error",
        error: new McpOAuthError("invalid_request", "redirect_uri does not match a registered redirect URI."),
      };
    }

    const state = query.get("state") ?? undefined;
    const fail = (error: string, description: string): McpOAuthAuthorizeResult => ({
      type: "redirect",
      location: this.callbackUrl(redirectUri, { error, error_description: description, state }),
    });
    if (state !== undefined && state.length > maxStateLength) {
      return fail("invalid_request", `state must not exceed ${maxStateLength} characters.`);
    }
    if (query.get("response_type") !== "code") {
      return fail("unsupported_response_type", "Only the authorization code flow is supported.");
    }
    const codeChallenge = query.get("code_challenge") ?? "";
    if (query.get("code_challenge_method") !== "S256" || !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)) {
      return fail("invalid_request", "PKCE with an S256 code_challenge is required.");
    }
    if (!this.isAcceptedResource(query.get("resource"))) {
      return fail("invalid_target", `resource must be ${this.resource}.`);
    }

    const now = new Date();
    const id = randomUUID();
    const pending: PendingAuthorization = {
      clientId: client.clientId,
      redirectUri,
      codeChallenge,
      state,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + requestTtlMs).toISOString(),
    };
    await this.store.putState({
      id: requestStateId(id),
      value: JSON.stringify(pending),
      expiresAt: pending.expiresAt,
      purgeBefore: new Date(now.getTime() - statePurgeDelayMs).toISOString(),
    });
    return { type: "redirect", location: `${this.origin}/authorize?request=${encodeURIComponent(id)}` };
  }

  /** Read a pending request for the consent page without consuming it. */
  async getAuthorizationRequest(id: string): Promise<McpOAuthAuthorizationRequestSummary | undefined> {
    const value = await this.store.readState(requestStateId(id), new Date().toISOString());
    if (!value) return undefined;
    const pending = JSON.parse(value) as PendingAuthorization;
    const client = await this.store.getClient(pending.clientId);
    if (!client) return undefined;
    return {
      id,
      clientId: client.clientId,
      clientName: client.clientName,
      redirectUri: pending.redirectUri,
      createdAt: pending.createdAt,
      expiresAt: pending.expiresAt,
    };
  }

  /** Approve a pending request and return the client callback URL carrying a single-use authorization code. */
  async approve(approval: McpOAuthApproval): Promise<string | undefined> {
    const pending = await this.consumeRequest(approval.requestId);
    if (!pending) return undefined;

    const code = randomBytes(32).toString("base64url");
    const now = new Date();
    const authorizationCode: AuthorizationCode = {
      clientId: pending.clientId,
      redirectUri: pending.redirectUri,
      codeChallenge: pending.codeChallenge,
      tokenName: approval.tokenName,
      policy: approval.policy,
    };
    await this.store.putState({
      id: codeStateId(code),
      value: JSON.stringify(authorizationCode),
      expiresAt: new Date(now.getTime() + codeTtlMs).toISOString(),
      purgeBefore: new Date(now.getTime() - statePurgeDelayMs).toISOString(),
    });
    return this.callbackUrl(pending.redirectUri, { code, state: pending.state });
  }

  /** Deny a pending request and return the client callback URL carrying `access_denied`. */
  async deny(requestId: string): Promise<string | undefined> {
    const pending = await this.consumeRequest(requestId);
    if (!pending) return undefined;
    return this.callbackUrl(pending.redirectUri, {
      error: "access_denied",
      error_description: "The administrator denied the request.",
      state: pending.state,
    });
  }

  /** Exchange an authorization code for a new runtime token. */
  async exchangeToken(request: McpOAuthTokenRequest): Promise<McpOAuthTokenResponse> {
    const { form } = request;
    if (form.get("grant_type") !== "authorization_code") {
      throw new McpOAuthError("unsupported_grant_type", "Only the authorization_code grant is supported.");
    }
    const client = await this.authenticateClient(request);
    const code = form.get("code");
    const codeVerifier = form.get("code_verifier");
    if (!code || !codeVerifier) {
      throw new McpOAuthError("invalid_request", "code and code_verifier are required.");
    }

    const stateId = codeStateId(code);
    const value = await this.store.consumeState(stateId, new Date().toISOString());
    if (!value) {
      // RFC 9700 section 4.2.4: a replayed code revokes the token it already issued.
      const issuedTokenId = await this.store.readIssuedTokenId(stateId);
      if (issuedTokenId) await this.runtimeTokens.revokeToken(issuedTokenId);
      throw new McpOAuthError("invalid_grant", "The authorization code is invalid, expired, or already used.");
    }
    const authorizationCode = JSON.parse(value) as AuthorizationCode;
    const redirectUri = form.get("redirect_uri");
    if (authorizationCode.clientId !== client.clientId) {
      throw new McpOAuthError("invalid_grant", "The authorization code was issued to another client.");
    }
    if (redirectUri !== null && redirectUri !== authorizationCode.redirectUri) {
      throw new McpOAuthError("invalid_grant", "redirect_uri does not match the authorization request.");
    }
    if (
      !/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier) ||
      sha256Base64Url(codeVerifier) !== authorizationCode.codeChallenge
    ) {
      throw new McpOAuthError("invalid_grant", "code_verifier does not match the code_challenge.");
    }
    if (!this.isAcceptedResource(form.get("resource"))) {
      throw new McpOAuthError("invalid_target", `resource must be ${this.resource}.`);
    }

    const created = await this.runtimeTokens.createToken(authorizationCode.tokenName, authorizationCode.policy);
    await this.store.recordIssuedToken(stateId, created.record.id);
    await this.store.markClientUsed(client.clientId, new Date().toISOString());
    return { access_token: created.token, token_type: "Bearer", scope: mcpScope };
  }

  private async consumeRequest(id: string): Promise<PendingAuthorization | undefined> {
    const value = await this.store.consumeState(requestStateId(id), new Date().toISOString());
    return value ? (JSON.parse(value) as PendingAuthorization) : undefined;
  }

  /**
   * Authenticate the client with HTTP Basic or form credentials (RFC 6749 section 2.3.1). A client registered with a
   * secret must present it, by either method; a public client is identified by `client_id` and bound by PKCE.
   */
  private async authenticateClient(request: McpOAuthTokenRequest): Promise<McpOAuthClient> {
    const basic = readBasicCredentials(request.authorization);
    const clientId = basic?.clientId ?? request.form.get("client_id");
    const clientSecret = basic?.clientSecret ?? request.form.get("client_secret");
    const client = clientId ? await this.store.getClient(clientId) : undefined;
    if (!client) {
      throw new McpOAuthError("invalid_client", "Client authentication failed.", 401);
    }
    if (
      client.clientSecretHash &&
      (!clientSecret || !equalHashes(sha256Base64Url(clientSecret), client.clientSecretHash))
    ) {
      throw new McpOAuthError("invalid_client", "Client authentication failed.", 401);
    }
    return client;
  }

  /**
   * RFC 8707 resource indicator. The issued token is an ordinary runtime token, so the origin itself is accepted as
   * well as the /mcp endpoint, with or without a trailing slash.
   */
  private isAcceptedResource(resource: string | null): boolean {
    if (resource === null) return true;
    const normalized = resource.replace(/\/+$/, "");
    return normalized === this.resource || normalized === this.origin;
  }

  /** Append response parameters, including RFC 9207 `iss`, which ChatGPT verifies before redeeming the code. */
  private callbackUrl(redirectUri: string, params: Record<string, string | undefined>): string {
    const url = new URL(redirectUri);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
    url.searchParams.set("iss", this.origin);
    return url.toString();
  }
}

/** Whether a redirect URI is one of ChatGPT's connector OAuth callbacks. */
function isChatGptRedirectUri(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.hash || url.username || url.password) return false;
  return (
    value === chatGptRedirectUri ||
    (value.startsWith(chatGptRedirectUriPrefix) && value.length > chatGptRedirectUriPrefix.length)
  );
}

function readRedirectUris(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > maxRedirectUris ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new McpOAuthError(
      "invalid_redirect_uri",
      `redirect_uris must be a non-empty array of at most ${maxRedirectUris} URIs.`,
    );
  }
  const uris = [...new Set(value as string[])];
  const rejected = uris.find((uri) => !isChatGptRedirectUri(uri));
  if (rejected !== undefined) {
    throw new McpOAuthError(
      "invalid_redirect_uri",
      `Only ChatGPT connector callbacks are accepted as redirect URIs: ${rejected}.`,
    );
  }
  return uris;
}

function readClientAuthMethod(value: unknown): McpOAuthClientAuthMethod {
  // RFC 7591 section 2: an omitted token_endpoint_auth_method means client_secret_basic.
  const method = value === undefined ? "client_secret_basic" : optionalRawString(value);
  const supported = clientAuthMethods.find((candidate) => candidate === method);
  if (!supported) {
    throw new McpOAuthError(
      "invalid_client_metadata",
      `token_endpoint_auth_method must be one of ${clientAuthMethods.join(", ")}.`,
    );
  }
  return supported;
}

/** Optional metadata arrays must at least include the one value this server supports. */
function assertSupportedValues(value: unknown, field: string, required: string): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || !value.includes(required)) {
    throw new McpOAuthError("invalid_client_metadata", `${field} must include ${required}.`);
  }
}

function readBasicCredentials(
  authorization: string | undefined,
): { clientId: string; clientSecret: string } | undefined {
  const match = /^basic\s+(\S+)$/i.exec(authorization?.trim() ?? "");
  if (!match) return undefined;
  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator < 0) return undefined;
  try {
    // RFC 6749 section 2.3.1 form-encodes both parts before Basic encoding.
    return {
      clientId: decodeURIComponent(decoded.slice(0, separator).replaceAll("+", " ")),
      clientSecret: decodeURIComponent(decoded.slice(separator + 1).replaceAll("+", " ")),
    };
  } catch {
    return undefined;
  }
}

function requestStateId(id: string): string {
  return `request:${id}`;
}

/** Codes are stored only as hashes, so a database read never yields a redeemable code. */
function codeStateId(code: string): string {
  return `code:${sha256Base64Url(code)}`;
}

function sha256Base64Url(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}

function equalHashes(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
