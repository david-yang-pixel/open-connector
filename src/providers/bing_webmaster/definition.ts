import type { ProviderDefinition } from "../../core/types.ts";

import { bingWebmasterActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "bing_webmaster",
  displayName: "Bing Webmaster Tools",
  description: "Inspect sites, search performance, crawl data, and URL submissions in Bing Webmaster Tools.",
  categories: ["Marketing", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "BING_WEBMASTER_API_KEY",
      description:
        "Sign in at https://www.bing.com/webmasters/, then open Settings > API Access > API Key > Generate API Key. The key belongs to your user and covers your verified sites. Setup guide: https://learn.microsoft.com/en-us/bingwebmaster/getting-access",
    },
  ],
  homepageUrl: "https://www.bing.com/webmasters/",
  actions: bingWebmasterActions,
};
