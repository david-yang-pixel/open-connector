import type { ProviderDefinition } from "../../core/types.ts";

import { kickofflabsActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "kickofflabs",
  displayName: "KickoffLabs",
  homepageUrl: "https://kickofflabs.com/",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Find your KickoffLabs API key under Dashboard > Setup > All Settings > API Access. Setup instructions: https://support.kickofflabs.com/developer/leads-api/",
    },
  ],
  actions: kickofflabsActions,
};
