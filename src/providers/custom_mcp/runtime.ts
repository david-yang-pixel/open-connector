import type { CredentialValidationResult } from "../../core/types.ts";
import type { Client } from "@modelcontextprotocol/client";

import { ProtocolError, SdkHttpError, UnauthorizedError } from "@modelcontextprotocol/client";
import { createHash } from "node:crypto";
import { optionalRecord, optionalString, requiredString } from "../../core/cast.ts";
import { assertPublicHttpUrl, isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import { withMcpClient } from "../mcp-client.ts";
import { providerInputError, providerUserAgent, ProviderRequestError } from "../provider-runtime.ts";

const requestTimeoutMs = 60_000;

export interface CustomMcpContext {
  endpoint: URL;
  authorizationToken?: string;
  fetcher: typeof fetch;
  signal?: AbortSignal;
}

export function createCustomMcpContext(
  values: Record<string, string>,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): CustomMcpContext {
  return {
    endpoint: normalizeCustomMcpEndpoint(values.serverUrl),
    authorizationToken: optionalString(values.authorizationToken),
    fetcher,
    signal,
  };
}

export async function validateCustomMcpCredential(
  values: Record<string, string>,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<CredentialValidationResult> {
  const context = createCustomMcpContext(values, fetcher, signal);
  const tools = await listCustomMcpTools(context);
  const endpointHash = createHash("sha256").update(context.endpoint.origin).digest("hex").slice(0, 16);
  return {
    profile: {
      accountId: `custom_mcp:${endpointHash}`,
      displayName: `Custom MCP (${context.endpoint.host})`,
    },
    grantedScopes: [],
    metadata: {
      mcpEndpoint: context.endpoint.toString(),
      discoveredToolCount: tools.length,
    },
  };
}

export async function listCustomMcpTools(context: CustomMcpContext): Promise<Array<Record<string, unknown>>> {
  return withCustomMcpClient(context, async (client) => {
    const result = await client.listTools({}, { timeout: requestTimeoutMs, signal: context.signal });
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    }));
  });
}

export async function callCustomMcpTool(
  context: CustomMcpContext,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const toolName = requiredString(input.toolName, "toolName", providerInputError);
  const args = optionalRecord(input.arguments) ?? {};
  return withCustomMcpClient(context, async (client) => {
    const result = await client.callTool(
      { name: toolName, arguments: args },
      { timeout: requestTimeoutMs, signal: context.signal },
    );
    if (!("toolResult" in result) && result.isError) {
      throw new ProviderRequestError(502, `Custom MCP tool ${toolName} returned an error`, result);
    }
    return { result };
  });
}

export function normalizeCustomMcpEndpoint(value: unknown): URL {
  const allowPrivateNetwork = isPrivateNetworkAccessAllowed();
  const url = assertPublicHttpUrl(requiredString(value, "serverUrl", providerInputError), {
    fieldName: "serverUrl",
    createError: providerInputError,
    allowPrivateNetwork,
  });
  if (url.username || url.password) throw providerInputError("serverUrl must not include credentials");
  if (url.protocol === "http:" && !allowPrivateNetwork) {
    throw providerInputError("http serverUrl values require private-network access to be enabled");
  }
  url.hash = "";
  return url;
}

async function withCustomMcpClient<T>(context: CustomMcpContext, run: (client: Client) => Promise<T>): Promise<T> {
  const headers: Record<string, string> = {
    "user-agent": providerUserAgent,
  };
  if (context.authorizationToken) {
    const token = context.authorizationToken.startsWith("Bearer ")
      ? context.authorizationToken
      : `Bearer ${context.authorizationToken}`;
    headers["authorization"] = token;
  }

  const isSse = context.endpoint.pathname.endsWith("/sse");
  const primaryTransport = isSse ? "sse" : "streamable_http";
  try {
    return await withMcpClient(
      {
        endpoint: context.endpoint,
        transport: primaryTransport,
        fetcher: context.fetcher,
        headers,
        signal: context.signal,
        mapError: mapCustomMcpError,
      },
      run,
    );
  } catch (error: any) {
    if (!isSse) {
      try {
        return await withMcpClient(
          {
            endpoint: context.endpoint,
            transport: "sse",
            fetcher: context.fetcher,
            headers,
            signal: context.signal,
            mapError: mapCustomMcpError,
          },
          run,
        );
      } catch (sseErr: any) {
        // Fallback failed as well
      }
    }
    throw mapCustomMcpError(error);
  }
}

function mapCustomMcpError(error: unknown): ProviderRequestError {
  if (error instanceof ProviderRequestError) return error;
  if (error instanceof UnauthorizedError) {
    return new ProviderRequestError(401, "Custom MCP credential is invalid or unauthorized", error);
  }
  if (error instanceof Error && error.message.includes("Invalid URL: undefined")) {
    return new ProviderRequestError(
      401,
      "Custom MCP server authentication failed (HTTP 401 unauthorized). Please verify the auth token.",
      error,
    );
  }
  if (error instanceof SdkHttpError) {
    const status = error.status;
    return new ProviderRequestError(
      status === 401 || status === 403 ? 401 : status && status >= 400 && status < 500 ? 400 : 502,
      `Custom MCP request failed: ${error.message}`,
      error,
    );
  }
  if (error instanceof ProtocolError) {
    return new ProviderRequestError(502, `Custom MCP request failed: ${error.message}`, error);
  }
  return new ProviderRequestError(
    502,
    error instanceof Error ? `Custom MCP request failed: ${error.message}` : "Custom MCP request failed",
    error,
  );
}
