import type { ProviderDefinition } from "../../core/types.ts";

import { mumbleActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "mumble",
  displayName: "Mumble",
  description: "Manage Mumble contacts, campaigns, messages, and account data.",
  categories: ["Communication", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "MUMBLE_API_KEY",
      description:
        "Mumble API key sent in the Mumble-Api-Key header. Generate or view it in your Mumble account Technical Settings: https://app.mumble.co.il",
    },
  ],
  homepageUrl: "https://mumble.co.il/",
  actions: mumbleActions,
};
