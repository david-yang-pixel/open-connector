import type { ProviderDefinition } from "../../core/types.ts";

import { exploriumActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "explorium",
  displayName: "Explorium",
  homepageUrl: "https://www.explorium.ai/",
  categories: ["Marketing", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Copy your company API key from https://admin.explorium.ai/ under Access & Authentication > Getting Your API Key. The key authenticates Explorium AgentSource requests, which may consume credits.",
    },
  ],
  actions: exploriumActions,
};
