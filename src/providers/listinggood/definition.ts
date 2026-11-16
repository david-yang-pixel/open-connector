import type { ProviderDefinition } from "../../core/types.ts";

import { listinggoodActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "listinggood",
  displayName: "ListingGood",
  homepageUrl: "https://listinggood.com",
  categories: ["AI", "Cross-border E-commerce"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Sign in at https://listinggood.com/developers and copy your account API key. Connecting checks only that the key is nonempty; ListingGood validates it when an authenticated action runs. Generation uses your account credits.",
    },
  ],
  actions: listinggoodActions,
};
