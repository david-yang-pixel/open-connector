import type { ProviderDefinition } from "../../core/types.ts";

import { eastmoneyMiaoxiangActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "eastmoney_miaoxiang",
  displayName: "Eastmoney Miaoxiang",
  homepageUrl: "https://ai.eastmoney.com/",
  categories: ["Finance", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Skills API Key",
      description:
        "Get a Miaoxiang Skills API key at https://marketing.dfcfs.com/views/finskillshub/. Use the Skills key (MX_APIKEY), not the separate MCP key (EM_API_KEY). Connecting checks only that the key is nonempty; Eastmoney validates it on first execution.",
    },
  ],
  actions: eastmoneyMiaoxiangActions,
};
