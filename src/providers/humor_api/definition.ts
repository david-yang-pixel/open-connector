import type { ProviderDefinition } from "../../core/types.ts";

import { humorApiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "humor_api",
  displayName: "Humor API",
  homepageUrl: "https://humorapi.com",
  categories: ["Design & Media"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Get your Humor API key from https://humorapi.com/console. The key is sent in the x-api-key header. Connecting checks only that the key is non-empty; API calls verify access and use your quota.",
    },
  ],
  actions: humorApiActions,
};
