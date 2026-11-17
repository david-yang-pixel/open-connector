import type { ProviderDefinition } from "../../core/types.ts";

import { greipActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "greip",
  displayName: "Greip",
  homepageUrl: "https://greip.io",
  categories: ["Security & Identity", "Maps & Location"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get your API key from https://dashboard.greip.io/home. Requests use Authorization: Bearer <API key>.",
    },
  ],
  actions: greipActions,
};
