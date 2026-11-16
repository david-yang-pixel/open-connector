import type { ProviderDefinition } from "../../core/types.ts";

import { ploidActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "ploid",
  displayName: "Ploid",
  homepageUrl: "https://ploid.com",
  categories: ["Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Ploid API key",
      description:
        "Create a key at https://app.ploid.com/workspace/settings?section=api-keys. Include account:read for connection verification, and the scopes required by your actions. Sent as a Bearer token. Paid operations use your workspace balance and key budgets.",
      extraFields: [],
    },
  ],
  actions: ploidActions,
};
