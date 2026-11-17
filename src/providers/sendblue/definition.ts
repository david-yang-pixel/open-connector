import type { ProviderDefinition } from "../../core/types.ts";

import { sendblueActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "sendblue",
  displayName: "Sendblue",
  homepageUrl: "https://www.sendblue.com/",
  categories: ["Communication", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key ID",
      description:
        "Get your Sendblue API Key ID under Settings > API Settings in your dashboard: https://support.sendblue.com/articles/5028862923-how-to-access-sendblue-s-api-settings",
      extraFields: [
        {
          key: "apiSecret",
          inputType: "password",
          label: "API Secret",
          required: true,
          secret: true,
          description:
            "Copy the API Secret paired with your API Key ID from Sendblue Settings > API Settings: https://support.sendblue.com/articles/5028862923-how-to-access-sendblue-s-api-settings",
        },
      ],
    },
  ],
  actions: sendblueActions,
};
