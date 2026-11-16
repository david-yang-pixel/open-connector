import type { ProviderDefinition } from "../../core/types.ts";

import { kenjoActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "kenjo",
  displayName: "Kenjo",
  homepageUrl: "https://www.kenjo.io/",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Request API activation from Kenjo Customer Success, then generate a key as an admin under Settings > Integrations > API: https://kenjo.readme.io/reference/generate-the-api-key.",
      extraFields: [
        {
          key: "environment",
          label: "Environment",
          required: false,
          placeholder: "production",
          description:
            "Use production (default) or sandbox to match the environment activated for your API key: https://kenjo.readme.io/reference/post_auth-login.",
          inputType: "text",
          secret: false,
        },
      ],
    },
  ],
  actions: kenjoActions,
};
