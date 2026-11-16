import type { ProviderDefinition } from "../../core/types.ts";

import { cronlyticActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "cronlytic",
  displayName: "Cronlytic",
  homepageUrl: "https://www.cronlytic.com",
  categories: ["Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "CRONLYTIC_API_KEY",
      description:
        "Generate an API key in the API Keys section of https://www.cronlytic.com/dashboard to manage scheduled HTTP jobs.",
      extraFields: [
        {
          key: "userId",
          secret: false,
          inputType: "text",
          label: "User ID",
          required: true,
          description:
            "Copy the User ID alongside your API key in the API Keys section of https://www.cronlytic.com/dashboard.",
        },
      ],
    },
  ],
  actions: cronlyticActions,
};
