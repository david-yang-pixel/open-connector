import type { ProviderDefinition } from "../../core/types.ts";

import { orbitActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "orbit",
  displayName: "Orbit",
  homepageUrl: "https://orbitsearch.com",
  categories: ["Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk_orb_...",
      description:
        "Create a key at https://developer.orbitsearch.com/dashboard/keys with search:read for connection verification (a population price quote, without starting a search). Add profile:read for profiles, watchers:write for monitoring, and webhooks:write for webhook management. Sent as a Bearer token.",
      extraFields: [],
    },
  ],
  actions: orbitActions,
};
