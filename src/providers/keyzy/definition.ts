import type { ProviderDefinition } from "../../core/types.ts";

import { keyzyActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "keyzy",
  displayName: "KEYZY",
  homepageUrl: "https://www.keyzy.io/",
  categories: ["Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "KEYZY_API_KEY",
      description:
        "Create a key on the KEYZY App Keys page. Connection checks fields locally; the first API operation verifies permissions. Setup: https://www.keyzy.io/docs/getting-started/setting-up-for-sale/",
      extraFields: [
        {
          key: "appId",
          inputType: "text",
          label: "App ID",
          placeholder: "KEYZY_APP_ID",
          required: true,
          secret: false,
          description:
            "The App ID paired with your API key, available on the KEYZY App Keys page: https://www.keyzy.io/docs/dashboard/app-keys/",
        },
      ],
    },
  ],
  actions: keyzyActions,
};
