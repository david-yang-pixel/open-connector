import type { ProviderDefinition } from "../../core/types.ts";

import { simpletextingActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "simpletexting",
  displayName: "SimpleTexting",
  homepageUrl: "https://simpletexting.com/",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "YOUR_API_TOKEN",
      description:
        "Copy your SimpleTexting API token from Integrations > API & Webhooks at https://app2.simpletexting.com/integrations/webhooks. It authenticates requests to your SimpleTexting account. API access requires approval from SimpleTexting.",
    },
  ],
  actions: simpletextingActions,
};
