import type { ProviderDefinition } from "../../core/types.ts";

import { validemailActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "validemail",
  displayName: "ValidEmail",
  homepageUrl: "https://www.validemail.net/",
  categories: ["Marketing", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Copy your ValidEmail API key from the dashboard at https://www.validemail.net/Main after signing in. The key authenticates email verification and credit balance requests.",
    },
  ],
  actions: validemailActions,
};
