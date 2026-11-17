import type { ProviderDefinition } from "../../core/types.ts";

import { vaquillActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "vaquill",
  displayName: "Vaquill",
  homepageUrl: "https://www.vaquill.ai",
  categories: ["Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "vq_key_...",
      description:
        "Create a key under API Keys at https://app.vaquill.ai/settings. Connecting verifies the key with the free balance endpoint without running a paid search.",
      extraFields: [],
    },
  ],
  actions: vaquillActions,
};
