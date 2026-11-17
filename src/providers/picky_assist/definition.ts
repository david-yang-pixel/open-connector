import type { ProviderDefinition } from "../../core/types.ts";

import { pickyAssistActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "picky_assist",
  displayName: "Picky Assist",
  homepageUrl: "https://pickyassist.com/",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      description:
        "Picky Assist V4 project API token. Create a token under Settings > Developers > API: https://app.pickyassist.com/settings/developers/api. Your plan must include API access.",
    },
  ],
  actions: pickyAssistActions,
};
