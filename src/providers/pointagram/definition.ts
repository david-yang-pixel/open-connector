import type { ProviderDefinition } from "../../core/types.ts";

import { pointagramActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "pointagram",
  displayName: "Pointagram",
  homepageUrl: "https://www.pointagram.com/",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "POINTAGRAM_API_KEY",
      description:
        "In Pointagram, open Settings > Integrations, add a Custom Integration, select Create Credentials and Show Key, then save. See https://www.pointagram.com/custom-api-2-0-gamification/.",
      extraFields: [
        {
          key: "apiUser",
          label: "Login email",
          required: true,
          placeholder: "you@example.com",
          description:
            "Your Pointagram login email, sent as Api-User. Use the account associated with the custom integration: https://app.pointagram.com/.",
          inputType: "text",
          secret: false,
        },
      ],
    },
  ],
  actions: pointagramActions,
};
