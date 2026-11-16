import type { ProviderDefinition } from "../../core/types.ts";

import { tradebeeActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "tradebee",
  displayName: "Tradebee",
  homepageUrl: "https://www.tradebee.cn/",
  categories: ["Cross-border E-commerce"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Create an API key at https://open.tradew.com/developer/secret to access your Tradebee site. Copy it when created; it is shown only once.",
    },
  ],
  actions: tradebeeActions,
};
