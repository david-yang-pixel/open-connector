import type { ProviderDefinition } from "../../core/types.ts";

import { tinyfishActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "tinyfish",
  displayName: "TinyFish",
  homepageUrl: "https://tinyfish.ai",
  categories: ["AI", "Data", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create a TinyFish API key at https://agent.tinyfish.ai/api-keys. Search and Fetch have daily free allowances; Agent and Browser use your wallet or legacy plan credits.",
      extraFields: [],
    },
  ],
  actions: tinyfishActions,
};
