import type { ProviderDefinition } from "../../core/types.ts";

import { bainiuActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "bainiu",
  displayName: "Bainiu",
  homepageUrl: "https://api.bainiudata.com/",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Client Key",
      placeholder: "Your Bainiu Client Key",
      description:
        "Copy Client Key from your personal center at https://api.bainiudata.com/. Connecting checks required fields only; credentials and permissions are verified on your first API request. Queries may consume provider credits.",
      extraFields: [
        {
          key: "clientId",
          label: "Client ID",
          required: true,
          description:
            "Copy Client ID from your personal center at https://api.bainiudata.com/. Used with Client Key to sign requests.",
          inputType: "password",
          secret: true,
        },
      ],
    },
  ],
  actions: bainiuActions,
};
