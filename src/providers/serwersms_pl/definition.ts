import type { ProviderDefinition } from "../../core/types.ts";

import { serwersmsPlActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "serwersms_pl",
  displayName: "SerwerSMS.pl",
  homepageUrl: "https://serwersms.pl/",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "SERWERSMS_API_TOKEN",
      description:
        "Create an API token in the Customer Panel at https://panel.serwersms.pl/ under Ustawienia interfejsów → HTTPS API → Tokeny API. The token is sent using Bearer authentication.",
    },
  ],
  actions: serwersmsPlActions,
};
