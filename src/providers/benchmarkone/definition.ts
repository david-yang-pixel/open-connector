import type { ProviderDefinition } from "../../core/types.ts";

import { benchmarkoneActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "benchmarkone",
  displayName: "BenchmarkONE",
  description: "Manage BenchmarkONE contacts, companies, tasks, and marketing records.",
  categories: ["Marketing", "Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "BENCHMARKONE_API_KEY",
      description:
        "BenchmarkONE API key passed as the api_key query parameter. Generate it under Account Settings > Data > API: https://help.benchmarkone.com/en/articles/2383067-api-documentation-for-advanced-users",
    },
  ],
  homepageUrl: "https://www.benchmarkone.com/",
  actions: benchmarkoneActions,
};
