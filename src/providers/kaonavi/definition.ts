import type { ProviderDefinition } from "../../core/types.ts";

import { kaonaviActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "kaonavi",
  displayName: "Kaonavi",
  homepageUrl: "https://www.kaonavi.jp/",
  categories: ["Productivity"],
  authTypes: ["custom_credential"],
  auth: [
    {
      type: "custom_credential",
      fields: [
        {
          key: "consumerKey",
          label: "Consumer Key",
          inputType: "text",
          secret: false,
          required: true,
          description:
            "Find the Consumer Key under Administrator Functions > Public API v2 Information > Authentication Information. Enable the required resource operations: https://developer.kaonavi.jp/api/v2.0/index.html",
        },
        {
          key: "consumerSecret",
          label: "Consumer Secret",
          inputType: "password",
          secret: true,
          required: true,
          description:
            "Copy the paired Consumer Secret from Public API v2 Information. Temporary tokens are obtained automatically: https://developer.kaonavi.jp/api/v2.0/index.html",
        },
      ],
    },
  ],
  actions: kaonaviActions,
};
