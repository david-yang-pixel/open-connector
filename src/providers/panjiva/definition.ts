import type { ProviderDefinition } from "../../core/types.ts";

import { panjivaActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "panjiva",
  displayName: "Panjiva",
  description: "Query Panjiva trade, company, shipment, and analytics data.",
  categories: ["Data & Analytics", "Cross-border E-commerce"],
  authTypes: ["custom_credential"],
  auth: [
    {
      type: "custom_credential",
      fields: [
        {
          key: "clientId",
          label: "Client ID",
          required: true,
          secret: false,
          inputType: "text",
          description:
            "Copy the client ID from myPanjiva > API Settings. See https://panjiva.com/api-guide/authentication.",
        },
        {
          key: "clientSecret",
          label: "Client Secret",
          required: true,
          secret: true,
          inputType: "password",
          description:
            "Copy the client secret paired with the client ID from myPanjiva > API Settings. See https://panjiva.com/api-guide/authentication.",
        },
      ],
    },
  ],
  homepageUrl: "https://panjiva.com/",
  actions: panjivaActions,
};
