import type {
  CredentialValidationResult,
  CredentialValidators,
  ExecutionContext,
  ProviderExecutors,
  ResolvedCredential,
} from "../../core/types.ts";
import type { ProviderActionHandlers, ProviderRuntimeHandler } from "../provider-runtime.ts";
import type { CustomMcpContext } from "./runtime.ts";

import { isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import { readOAuthClientConfigMetadata } from "../../oauth/oauth-client-config-service.ts";
import { createProviderFetch, defineProviderExecutors, ProviderRequestError } from "../provider-runtime.ts";
import { oauth } from "./oauth.ts";
import {
  callCustomMcpTool,
  createCustomMcpContext,
  listCustomMcpTools,
  validateCustomMcpCredential,
} from "./runtime.ts";

const service = "custom_mcp";

export const customMcpActionHandlers: ProviderActionHandlers<"custom_mcp", ProviderRuntimeHandler<CustomMcpContext>> = {
  async list_tools(_input, context) {
    return { tools: await listCustomMcpTools(context) };
  },
  call_tool(input, context) {
    return callCustomMcpTool(context, input);
  },
};

export const executors: ProviderExecutors = defineProviderExecutors<CustomMcpContext>({
  service,
  handlers: customMcpActionHandlers,
  async createContext(context: ExecutionContext, fetcher: typeof fetch): Promise<CustomMcpContext> {
    return createCustomMcpContext(readConnectionValues(await context.getCredential(service)), fetcher, context);
  },
  fallbackMessage: "Custom MCP request failed",
  allowPrivateNetwork: isPrivateNetworkAccessAllowed,
});

export const credentialValidators: CredentialValidators = {
  async customCredential(input, { fetcher, signal }): Promise<CredentialValidationResult> {
    return validateCustomMcpCredential(input.values, createGuardedFetcher(fetcher), signal);
  },
  async oauth2(input, { fetcher, signal }): Promise<CredentialValidationResult> {
    return validateCustomMcpCredential(readConnectionValues(input), createGuardedFetcher(fetcher), signal);
  },
};

export { oauth };

/**
 * Token connections store every setting as credential values. OAuth connections keep the MCP
 * server URL with the per-connection OAuth client registered for it, and send the access token,
 * which the connection service refreshes before it expires.
 */
function readConnectionValues(credential: ResolvedCredential | undefined): Record<string, string> {
  if (credential?.authType === "custom_credential") return credential.values;
  if (credential?.authType === "oauth2") {
    const serverUrl = readOAuthClientConfigMetadata(service, credential.metadata)?.extra.serverUrl;
    if (serverUrl) return { serverUrl, authorizationToken: credential.accessToken };
  }
  throw new ProviderRequestError(401, `Configure ${service} credentials first.`);
}

function createGuardedFetcher(fetcher: typeof fetch): typeof fetch {
  return createProviderFetch({ fetch: fetcher, allowPrivateNetwork: isPrivateNetworkAccessAllowed });
}
