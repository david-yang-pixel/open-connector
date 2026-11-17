import type { ProviderDefinition } from "../../core/types.ts";

import { growsurfActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "growsurf",
  displayName: "GrowSurf",
  homepageUrl: "https://growsurf.com/",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Create an API key at https://app.growsurf.com/settings#api-keys with access to your programs and the operations you need, including team read access for connection validation. REST API access requires an eligible GrowSurf plan.",
    },
  ],
  actions: growsurfActions,
};
