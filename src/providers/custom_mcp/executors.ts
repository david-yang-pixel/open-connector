import type {
  CredentialValidationResult,
  CredentialValidators,
  ExecutionContext,
  ProviderExecutors,
} from "../../core/types.ts";
import type { ProviderActionHandlers, ProviderRuntimeHandler } from "../provider-runtime.ts";
import type { CustomMcpContext } from "./runtime.ts";

import { isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import { createProviderFetch, defineProviderExecutors, requireCustomCredential } from "../provider-runtime.ts";
import { callCustomMcpTool, createCustomMcpContext, listCustomMcpTools, validateCustomMcpCredential } from "./runtime.ts";

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
    const credential = await requireCustomCredential(context, service);
    return createCustomMcpContext(credential.values, fetcher, context.signal);
  },
  fallbackMessage: "Custom MCP request failed",
  allowPrivateNetwork: isPrivateNetworkAccessAllowed,
  skipDnsValidation: true,
});

export const credentialValidators: CredentialValidators = {
  async customCredential(input, { fetcher, signal }): Promise<CredentialValidationResult> {
    const guardedFetcher = createProviderFetch({
      fetch: fetcher,
      allowPrivateNetwork: isPrivateNetworkAccessAllowed,
      skipDnsValidation: true,
    });
    return validateCustomMcpCredential(input.values, guardedFetcher, signal);
  },
};
