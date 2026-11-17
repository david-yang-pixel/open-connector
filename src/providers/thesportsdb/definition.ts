import type { ProviderDefinition } from "../../core/types.ts";

import { thesportsdbActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "thesportsdb",
  displayName: "TheSportsDB",
  homepageUrl: "https://www.thesportsdb.com/",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Premium API Key",
      description:
        "Upgrade to Premium and copy the API key from your TheSportsDB user profile: https://www.thesportsdb.com/docs_api. V2 requires a Premium key, sent in the X-API-KEY header; the free V1 key is not supported.",
    },
  ],
  actions: thesportsdbActions,
};
