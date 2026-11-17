import type { ProviderDefinition } from "../../core/types.ts";

import { issueBadgeActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "issue_badge",
  displayName: "IssueBadge",
  homepageUrl: "https://issuebadge.com",
  categories: ["Productivity", "Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "IssueBadge API key used for Bearer authentication. Sign in and open Settings → Developer to generate a key: https://issuebadge.com/features/integrations/rest-api",
    },
  ],
  actions: issueBadgeActions,
};
