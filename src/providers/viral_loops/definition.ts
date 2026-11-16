import type { ProviderDefinition } from "../../core/types.ts";

import { viralLoopsActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "viral_loops",
  displayName: "Viral Loops",
  homepageUrl: "https://viral-loops.com",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Secret API Token",
      description:
        "Copy the campaign's secret API token from the Installation step of its campaign wizard at https://app.viral-loops.com. Setup guide: https://documentation.viral-loops.com/en/articles/8930538-universal-template-installation-instructions. Each connection accesses one campaign; use the secret token, not the public campaign ID.",
    },
  ],
  actions: viralLoopsActions,
};
