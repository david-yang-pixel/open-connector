import type { ProviderDefinition } from "../../core/types.ts";

import { quantDataActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "quant_data",
  displayName: "Quant Data",
  description: "Query Quant Data options, market, flow, and analytics data.",
  categories: ["Finance", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "qd_...",
      description:
        "Quant Data API key sent as a Bearer credential. Create and manage keys in the Quant Data dashboard: https://v3.quantdata.us.",
    },
  ],
  homepageUrl: "https://quantdata.us/",
  actions: quantDataActions,
};
