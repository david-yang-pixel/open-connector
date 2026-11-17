import type { ProviderDefinition } from "../../core/types.ts";

import { cnbActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "cnb",
  displayName: "CNB",
  homepageUrl: "https://cnb.cool/",
  categories: ["Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Access Token",
      description:
        "Create a personal access token at https://cnb.cool/profile/token with the repository and action permissions you need. Connecting checks only that the token is nonempty; CNB validates it on execution. Listing your repositories requires account-engage:r; private repositories need explicit token access.",
    },
  ],
  actions: cnbActions,
};
