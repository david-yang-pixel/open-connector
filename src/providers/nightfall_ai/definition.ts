import type { ProviderDefinition } from "../../core/types.ts";

import { nightfallAiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "nightfall_ai",
  displayName: "Nightfall AI",
  homepageUrl: "https://www.nightfall.ai/",
  categories: ["Security & Identity", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "NF-...",
      description:
        "Create a key under Developer APIs → Overview → Create key at https://app.nightfall.ai/developer-platform. Copy it when created; it cannot be recovered later. Connecting checks only that the key is non-empty; the first API call verifies access.",
    },
  ],
  actions: nightfallAiActions,
};
