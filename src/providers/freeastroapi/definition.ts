import type { ProviderDefinition } from "../../core/types.ts";

import { freeastroapiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "freeastroapi",
  displayName: "FreeAstroAPI",
  homepageUrl: "https://www.freeastroapi.com/",
  iconUrl: "https://www.freeastroapi.com/favicon.svg",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "FREE_ASTRO_API_KEY",
      description:
        "FreeAstroAPI key sent in the x-api-key header. Obtain it from the API Key section of your dashboard: https://www.freeastroapi.com/dashboard",
    },
  ],
  actions: freeastroapiActions,
};
