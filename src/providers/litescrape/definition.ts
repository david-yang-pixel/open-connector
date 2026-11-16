import type { ProviderDefinition } from "../../core/types.ts";

import { litescrapeActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "litescrape",
  displayName: "Litescrape",
  homepageUrl: "https://litescrape.com",
  categories: ["Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get your API key at https://litescrape.com/dashboard. Connecting checks key status and remaining calls without running a paid search.",
      extraFields: [],
    },
  ],
  actions: litescrapeActions,
};
