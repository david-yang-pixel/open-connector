import type { ProviderDefinition } from "../../core/types.ts";

import { wbiztoolActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "wbiztool",
  displayName: "Wbiztool",
  homepageUrl: "https://wbiztool.com/",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create an API key for the selected workspace under Settings → API Keys: https://wbiztool.com/settings/#api-keys. Use its API Client ID with this key.",
      extraFields: [
        {
          key: "clientId",
          inputType: "text",
          label: "API Client ID",
          required: true,
          secret: false,
          description:
            "Copy the numeric API Client ID from the API Overview card in the same workspace: https://wbiztool.com/settings/#api-keys.",
        },
      ],
    },
  ],
  actions: wbiztoolActions,
};
