import type { ProviderDefinition } from "../../core/types.ts";

import { typesafeAiActions } from "./actions.ts";

const service = "typesafe_ai";

export const provider: ProviderDefinition = {
  service,
  displayName: "TypeSafe AI",
  description: "List TypeSafe models and run typed Choice, Score, and Noul evaluations.",
  categories: ["AI", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "TYPESAFE_API_KEY",
      description:
        "TypeSafe API key sent as a Bearer token. Create or view keys in the official TypeSafe console: https://console.typesafe.ai/keys.",
      extraFields: [],
    },
  ],
  homepageUrl: "https://typesafe.ai",
  actions: typesafeAiActions,
};
