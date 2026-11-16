import type { ProviderDefinition } from "../../core/types.ts";

import { runcrateActions } from "./actions.ts";

/** Runcrate's OpenAI-compatible inference API for open-weight models. */
export const provider: ProviderDefinition = {
  service: "runcrate",
  displayName: "Runcrate",
  categories: ["AI", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "rc_live_...",
      description:
        "Create an API key at https://www.runcrate.ai/dashboard/api-keys. Requests use Bearer authentication; inference is billed per token.",
      extraFields: [],
    },
  ],
  homepageUrl: "https://www.runcrate.ai",
  actions: runcrateActions,
};
