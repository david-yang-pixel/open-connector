import type { ProviderDefinition } from "../../core/types.ts";

import { baixiaoActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "baixiao",
  displayName: "Baixiao AI",
  description: "Use Baixiao AI knowledge, document, research, and productivity tools.",
  categories: ["AI", "Data & Analytics", "Documents & Content", "Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "MCP Key",
      placeholder: "Paste your Baixiao MCP key",
      description:
        "The key sent to Baixiao MCP as an Authorization bearer token. Sign in and generate a key at https://chat.know-pa.cn/settings/mcp.",
    },
  ],
  homepageUrl: "https://www.know-pa.cn/",
  actions: baixiaoActions,
};
