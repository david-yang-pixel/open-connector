import type { ProviderDefinition } from "../../core/types.ts";

import { ftshareActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "ftshare",
  displayName: "FTShare",
  homepageUrl: "https://ftai.chat/ftshare",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Sign in to FTShare and obtain your API key at https://ftai.chat/me/profile. Available datasets and request quotas depend on your subscription.",
    },
  ],
  actions: ftshareActions,
};
