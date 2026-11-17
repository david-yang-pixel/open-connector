import type { ProviderDefinition } from "../../core/types.ts";

import { chaportActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "chaport",
  displayName: "Chaport",
  homepageUrl: "https://www.chaport.com/",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Access Token",
      placeholder: "CHAPORT_ACCESS_TOKEN",
      description:
        "Chaport access token. Generate or copy it in Settings > API at https://app.chaport.com/. REST API access requires a paid plan.",
    },
  ],
  actions: chaportActions,
};
