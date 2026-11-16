import type { ProviderDefinition } from "../../core/types.ts";

import { mktindexActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "mktindex",
  displayName: "Moojing Market Intelligence",
  description: "Query Moojing market, brand, category, product, and shop intelligence.",
  categories: ["Data", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "MOOJING_API_KEY",
      description:
        "Moojing API key sent with the MOOJING-APIKEY header. Apply for or manage API access at https://service.moojing.com/.",
    },
  ],
  homepageUrl: "https://www.mktindex.com/",
  actions: mktindexActions,
};
