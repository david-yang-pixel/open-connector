import type { ProviderDefinition } from "../../core/types.ts";

import { baizhiMcpActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "baizhi_mcp",
  displayName: "Baizhi Cloud Agent Toolkit",
  description: "Search and read public webpages through Baizhi Cloud's hosted MCP service.",
  homepageUrl: "https://baizhi.cloud/landing/agent-toolkit",
  categories: ["Search", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Baizhi Cloud API Key",
      placeholder: "Paste your Baizhi Cloud API Key",
      description:
        "Create your own scoped key at https://agent-toolkit.app.baizhi.cloud/ and paste the key without the Bearer prefix. The hosted service is separate from its open-source integration files; web tools may consume service credits.",
    },
  ],
  actions: baizhiMcpActions,
};
