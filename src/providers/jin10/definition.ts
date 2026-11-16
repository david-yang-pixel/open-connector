import type { ProviderDefinition } from "../../core/types.ts";

import { jin10Actions } from "./actions.ts";

const service = "jin10";

/**
 * Jin10 provider backed by the Jin10 Streamable HTTP MCP API.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "Jin10",
  categories: ["Finance", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk-...",
      description:
        "Jin10 MCP API key used as a Bearer token for https://mcp.jin10.com/mcp. Sign in, activate, and copy your MCP Token from the Jin10 Intelligent Open Platform: https://mcp.jin10.com/app/.",
    },
  ],
  homepageUrl: "https://www.jin10.com",
  actions: jin10Actions,
};
