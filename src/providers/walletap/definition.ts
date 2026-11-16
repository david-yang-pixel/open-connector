import type { ProviderDefinition } from "../../core/types.ts";

import { walletapActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "walletap",
  displayName: "Walletap",
  description: "Manage Walletap passes, customers, campaigns, and related records.",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "wt_live_...",
      description:
        "Walletap API key sent in the X-API-Key header. Create or copy one from Settings > API keys: https://app.walletap.com/settings.",
    },
  ],
  homepageUrl: "https://www.walletap.io/",
  actions: walletapActions,
};
