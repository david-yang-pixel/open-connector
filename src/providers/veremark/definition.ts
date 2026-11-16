import type { ProviderDefinition } from "../../core/types.ts";

import { veremarkActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "veremark",
  displayName: "Veremark",
  description: "Manage Veremark background-check candidates and screening workflows.",
  categories: ["Security & Identity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "VEREMARK_API_TOKEN",
      description:
        "Veremark API token sent in the Authorization header. Request a token from your Veremark account manager: https://help.veremark.com/how-do-i-obtain-an-api-key-for-testing-and-who-should-i-contact-to-ensure-the-engineering-team-receives-it",
    },
  ],
  homepageUrl: "https://www.veremark.com/",
  actions: veremarkActions,
};
