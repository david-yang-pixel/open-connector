import type { ProviderDefinition } from "../../core/types.ts";

import { contextdevActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "contextdev",
  displayName: "Context.dev",
  homepageUrl: "https://context.dev",
  categories: ["Data", "AI"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create a secret API key at https://context.dev/dashboard/api-keys. Use Full access or include logs:read for the free connection check, plus the permissions needed by your actions.",
      extraFields: [],
    },
  ],
  actions: contextdevActions,
};
