import type { ProviderDefinition } from "../../core/types.ts";

import { cloroActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "cloro",
  displayName: "Cloro",
  homepageUrl: "https://cloro.dev",
  categories: ["AI", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create a workspace API key at https://dashboard.cloro.dev/api-keys. Connecting checks your credit balance without running a paid search.",
      extraFields: [],
    },
  ],
  actions: cloroActions,
};
