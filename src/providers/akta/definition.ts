import type { ProviderDefinition } from "../../core/types.ts";

import { aktaActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "akta",
  displayName: "Akta",
  homepageUrl: "https://akta.pro",
  categories: ["Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "wk_...",
      description:
        "Sign in at https://playground.akta.pro/signup and create a key under API Keys. The key is sent in x-api-key. Connecting performs a free company search; data availability depends on your Akta plan.",
      extraFields: [],
    },
  ],
  actions: aktaActions,
};
