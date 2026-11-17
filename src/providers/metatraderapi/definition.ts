import type { ProviderDefinition } from "../../core/types.ts";

import { metatraderapiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "metatraderapi",
  displayName: "MetaTraderAPI",
  description: "Inspect MetaTrader accounts and market data through MetaTraderAPI.",
  categories: ["Finance", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "METATRADERAPI_API_KEY",
      description:
        "MetaTraderAPI API key sent as a Bearer token. Sign up at https://metatraderapi.cloud/accounts/signup/, then generate and copy a key from the API Keys section of the MetaTraderAPI dashboard.",
    },
  ],
  homepageUrl: "https://metatraderapi.cloud/",
  actions: metatraderapiActions,
};
