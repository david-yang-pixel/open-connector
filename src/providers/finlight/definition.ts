import type { ProviderDefinition } from "../../core/types.ts";

import { finlightActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "finlight",
  displayName: "Finlight",
  homepageUrl: "https://finlight.me/",
  categories: ["Finance", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get your Finlight API key from the API Keys section at https://app.finlight.me. Requests authenticate with the X-API-KEY header.",
    },
  ],
  actions: finlightActions,
};
