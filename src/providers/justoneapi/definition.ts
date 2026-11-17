import type { ProviderDefinition } from "../../core/types.ts";

import { justoneapiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "justoneapi",
  displayName: "Just One API",
  homepageUrl: "https://justoneapi.com/",
  categories: ["Data & Analytics", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      description:
        "Sign up and obtain your API token at https://dashboard.justoneapi.com/en. Connection checks the token format only; the first API call verifies its validity.",
    },
  ],
  actions: justoneapiActions,
};
