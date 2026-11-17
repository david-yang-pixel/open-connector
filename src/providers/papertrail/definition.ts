import type { ProviderDefinition } from "../../core/types.ts";

import { papertrailActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "papertrail",
  displayName: "Papertrail",
  description: "Search Papertrail logs and manage saved searches.",
  categories: ["Developer Tools", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "PAPERTRAIL_API_TOKEN",
      description:
        "Papertrail API token sent in the X-Papertrail-Token header. Find or regenerate it in your Papertrail profile: https://papertrailapp.com/account/profile",
    },
  ],
  homepageUrl: "https://www.papertrail.com",
  actions: papertrailActions,
};
