import type { ProviderDefinition } from "../../core/types.ts";

import { octenActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "octen",
  displayName: "Octen",
  homepageUrl: "https://octen.ai",
  categories: ["AI", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Octen API key",
      description:
        "Create a key at https://octen.ai/platform/api-keys. Sent in x-api-key. Connecting performs a small text embedding request and may consume credits. Video search requires beta access.",
      extraFields: [],
    },
  ],
  actions: octenActions,
};
