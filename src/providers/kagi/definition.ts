import type { ProviderDefinition } from "../../core/types.ts";

import { kagiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "kagi",
  displayName: "Kagi Universal Summarizer",
  homepageUrl: "https://kagi.com/summarizer/",
  categories: ["AI", "Documents & Content"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get a Kagi API key at https://kagi.com/settings/api and add API credits. Summarizer requests use Authorization: Bot <key>. The key is checked by Kagi on first execution; connecting only checks that it is nonempty.",
    },
  ],
  actions: kagiActions,
};
