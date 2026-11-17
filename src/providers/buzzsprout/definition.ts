import type { ProviderDefinition } from "../../core/types.ts";

import { buzzsproutActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "buzzsprout",
  displayName: "Buzzsprout",
  description: "Inspect Buzzsprout podcasts, episodes, and listener statistics.",
  categories: ["Design & Media", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "BUZZSPROUT_API_TOKEN",
      description:
        "Buzzsprout API token sent with the Authorization header. Get or reset it under Profile > API: https://www.buzzsprout.com/admin/profile/api.",
    },
  ],
  homepageUrl: "https://www.buzzsprout.com",
  actions: buzzsproutActions,
};
