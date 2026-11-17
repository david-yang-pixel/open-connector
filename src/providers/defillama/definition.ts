import type { ProviderDefinition } from "../../core/types.ts";

import { defillamaActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "defillama",
  displayName: "DeFiLlama",
  homepageUrl: "https://defillama.com",
  categories: ["Finance", "Data"],
  authTypes: ["no_auth", "api_key"],
  auth: [
    { type: "no_auth" },
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get an API plan key at https://defillama.com/subscription. Connecting checks remaining API credits. Free endpoints also support connections without a key.",
      extraFields: [],
    },
  ],
  actions: defillamaActions,
};
