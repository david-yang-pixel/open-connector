import type { ProviderDefinition } from "../../core/types.ts";

import { indexedActions } from "./actions.ts";

const service = "indexed";

export const provider: ProviderDefinition = {
  service,
  displayName: "Indexed",
  categories: ["Data", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "idx_...",
      description:
        "Indexed API key sent in the X-API-Key header. Every plan can create a key at https://indexed.vc/developers/keys. The free plan needs no credit card.",
    },
  ],
  homepageUrl: "https://indexed.vc",
  actions: indexedActions,
};
