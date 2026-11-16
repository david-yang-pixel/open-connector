import type { ProviderDefinition } from "../../core/types.ts";

import { planlyActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "planly",
  displayName: "Planly",
  homepageUrl: "https://planly.com",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Planly API key",
      description:
        "Create your Planly API key in Settings > Security: https://app.planly.com/settings/account/security",
    },
  ],
  actions: planlyActions,
};
