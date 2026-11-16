import type { ProviderDefinition } from "../../core/types.ts";

import { kolspriteMcpActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "kolsprite_mcp",
  displayName: "KOLSprite MCP",
  homepageUrl: "https://www.kolsprite.com",
  categories: ["E-commerce", "Data", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "MCP Key",
      placeholder: "Paste your KOLSprite MCP Key",
      description:
        "Follow https://o.kolsprite.com/doc/api.html#mcp-config to contact the administrator, enable MCP access, and obtain your secret-key. MCP Keys and HTTP API Keys are separate and cannot be used interchangeably.",
      extraFields: [],
    },
  ],
  actions: kolspriteMcpActions,
};
