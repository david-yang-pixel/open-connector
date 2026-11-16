import type { ProviderDefinition } from "../../core/types.ts";

import { appgrowingMcpActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "appgrowing_mcp",
  displayName: "AppGrowing Global MCP",
  homepageUrl: "https://appgrowing.net/",
  categories: ["Marketing", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk_...",
      description:
        "Copy your API key from Personal Center → Enterprise → Overview at https://appgrowing-global.youcloud.com/dashboard?finance=/team/info. Connecting checks only that the key is nonempty; business calls verify access and consume AppGrowing credits. Setup: https://docs.appgrowing.net/mcp/installation/.",
    },
  ],
  actions: appgrowingMcpActions,
};
