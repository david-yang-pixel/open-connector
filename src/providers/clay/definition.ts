import type { ProviderDefinition } from "../../core/types.ts";

import { clayActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "clay",
  displayName: "Clay",
  homepageUrl: "https://www.clay.com/",
  categories: ["Marketing", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Clay API key",
      description:
        "Create a Clay API key in Settings → Account → API keys (beta): https://app.clay.com/workspaces/~/settings/account?accountTab=api-keys-beta. Requests send it in the clay-api-key header.",
    },
  ],
  actions: clayActions,
};
