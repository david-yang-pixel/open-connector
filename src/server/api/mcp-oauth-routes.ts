import type { RuntimeLogger } from "../../core/types.ts";
import type { McpOAuthService } from "../mcp-oauth/mcp-oauth-service.ts";
import type { Context } from "hono";

import { Hono } from "hono";
import { optionalString } from "../../core/cast.ts";
import { McpOAuthError } from "../mcp-oauth/mcp-oauth-service.ts";
import { HttpRequestError, jsonError, readJsonBody, readRequestText } from "./http-utils.ts";
import { policyRequestMaxBytes, readTokenPolicy } from "./policy-input.ts";

const registrationMaxBytes = 16 * 1024;
const tokenRequestMaxBytes = 16 * 1024;

interface McpOAuthRoutesOptions {
  mcpOAuth: McpOAuthService;
  logger?: RuntimeLogger;
}

/**
 * OAuth discovery, registration, authorization and token endpoints for /mcp, plus the console consent API.
 * The public endpoints answer in RFC 6749 error format; `/api/mcp-oauth/*` requires the administrator.
 */
export function createMcpOAuthRoutes({ mcpOAuth, logger }: McpOAuthRoutesOptions): Hono {
  const app = new Hono();
  /**
   * A client only shows its own summary of a rejection, so the reason is logged too: it names, for one, the redirect
   * URI a client tried to register, which the operator needs in order to allow it.
   */
  const writeOAuthError = (context: Context, error: McpOAuthError): Response => {
    logger?.warn(
      { path: context.req.path, errorCode: error.error, reason: error.message },
      "mcp oauth request rejected",
    );
    if (error.status === 401) {
      context.header("WWW-Authenticate", 'Basic realm="OpenConnector"');
    }
    context.header("Cache-Control", "no-store");
    return context.json({ error: error.error, error_description: error.message }, error.status);
  };
  app.onError((error, context) => {
    if (error instanceof McpOAuthError) {
      return writeOAuthError(context, error);
    }
    if (error instanceof HttpRequestError && context.req.path.startsWith("/oauth/")) {
      return writeOAuthError(context, new McpOAuthError("invalid_request", error.message));
    }
    throw error;
  });

  const protectedResourceMetadata = (context: Context): Response => context.json(mcpOAuth.protectedResourceMetadata());
  app.get("/.well-known/oauth-protected-resource", protectedResourceMetadata);
  app.get("/.well-known/oauth-protected-resource/mcp", protectedResourceMetadata);
  app.get("/.well-known/oauth-authorization-server", (context) => context.json(mcpOAuth.authorizationServerMetadata()));

  app.post("/oauth/register", async (context) => {
    const body = await readJsonBody(context, registrationMaxBytes);
    return context.json(await mcpOAuth.registerClient(body), 201);
  });
  app.get("/oauth/authorize", async (context) => {
    const result = await mcpOAuth.authorize(new URL(context.req.url).searchParams);
    return result.type === "redirect" ? context.redirect(result.location, 302) : writeOAuthError(context, result.error);
  });
  app.post("/oauth/token", async (context) => {
    const response = await mcpOAuth.exchangeToken({
      form: new URLSearchParams(await readRequestText(context, tokenRequestMaxBytes)),
      authorization: context.req.header("authorization"),
    });
    return context.json(response, 200, { "Cache-Control": "no-store", Pragma: "no-cache" });
  });

  app.get("/api/mcp-oauth/requests/:id", async (context) => {
    const request = await mcpOAuth.getAuthorizationRequest(context.req.param("id"));
    return request ? context.json(request) : requestNotFound(context);
  });
  app.post("/api/mcp-oauth/requests/:id/approve", async (context) => {
    const body = await readJsonBody(context, policyRequestMaxBytes);
    const tokenName = optionalString(body.name);
    if (!tokenName) {
      return jsonError(context, 400, "invalid_input", "name is required.");
    }
    const redirectUrl = await mcpOAuth.approve({
      requestId: context.req.param("id"),
      tokenName,
      policy: readTokenPolicy(body, true),
    });
    return redirectUrl ? context.json({ redirectUrl }) : requestNotFound(context);
  });
  app.post("/api/mcp-oauth/requests/:id/deny", async (context) => {
    const redirectUrl = await mcpOAuth.deny(context.req.param("id"));
    return redirectUrl ? context.json({ redirectUrl }) : requestNotFound(context);
  });
  return app;
}

function requestNotFound(context: Context): Response {
  return jsonError(
    context,
    404,
    "authorization_request_not_found",
    "The authorization request does not exist, has expired, or was already answered.",
  );
}
