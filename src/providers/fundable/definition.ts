import type { ProviderDefinition } from "../../core/types.ts";

import { fundableActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "fundable",
  displayName: "Fundable",
  homepageUrl: "https://www.tryfundable.ai",
  categories: ["Data", "Finance"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "vg_...",
      description:
        "Fundable API key for funding, company, investor, and people data. Create and manage your key at https://www.tryfundable.ai/api-access/; it is sent using Bearer authentication.",
      extraFields: [],
    },
  ],
  actions: fundableActions,
};
