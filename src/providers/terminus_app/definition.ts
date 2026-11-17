import type { ProviderDefinition } from "../../core/types.ts";

import { terminusAppActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "terminus_app",
  displayName: "Terminus App",
  description: "Manage Terminus App short links, projects, tags, and analytics.",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Terminus App API key used as the HTTP Basic username. Create and copy it from Account Settings > API Keys: https://app.terminusapp.com/account/api_keys",
    },
  ],
  homepageUrl: "https://www.terminusapp.com/",
  actions: terminusAppActions,
};
