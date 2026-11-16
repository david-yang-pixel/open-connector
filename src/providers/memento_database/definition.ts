import type { ProviderDefinition } from "../../core/types.ts";

import { mementoDatabaseActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "memento_database",
  displayName: "Memento Database",
  homepageUrl: "https://mementodatabase.com/",
  categories: ["Data & Analytics", "Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Access Token",
      placeholder: "MEMENTO_CLOUD_TOKEN",
      description:
        "Create a Memento Cloud token in the desktop app under Account > Access Tokens. It is sent as the token query parameter. Official instructions: https://mementodatabase.com/changelog.html",
    },
  ],
  actions: mementoDatabaseActions,
};
