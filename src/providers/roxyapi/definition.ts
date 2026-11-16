import type { ProviderDefinition } from "../../core/types.ts";

import { roxyapiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "roxyapi",
  displayName: "RoxyAPI",
  homepageUrl: "https://roxyapi.com/",
  iconUrl: "https://roxyapi.com/favicon.svg",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Secret API Key",
      placeholder: "sk_live_...",
      description:
        "RoxyAPI server-side secret key. Create or copy it from the API Keys tab at https://roxyapi.com/account?tab=keys. New customers can activate a plan at https://roxyapi.com/pricing. Secret keys are shown only briefly after creation; use an sk_ key, not a publishable pk_ browser key.",
    },
  ],
  actions: roxyapiActions,
};
