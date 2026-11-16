import type { ProviderDefinition } from "../../core/types.ts";

import { surfActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "surf",
  displayName: "Surf",
  homepageUrl: "https://asksurf.ai",
  categories: ["Finance", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk-...",
      description:
        "Sign in at https://agents.asksurf.ai and select Generate API Key in the Dashboard. Surf uses the key for market data and AI research; both share your account credit balance.",
      extraFields: [],
    },
  ],
  actions: surfActions,
};
