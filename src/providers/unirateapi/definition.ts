import type { ProviderDefinition } from "../../core/types.ts";

import { unirateapiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "unirateapi",
  displayName: "UniRateAPI",
  homepageUrl: "https://unirateapi.com/",
  categories: ["Finance", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Register at https://unirateapi.com/register and get your API key from your account dashboard. Requests send it in the api_key query parameter.",
    },
  ],
  actions: unirateapiActions,
};
