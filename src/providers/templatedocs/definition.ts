import type { ProviderDefinition } from "../../core/types.ts";

import { templatedocsActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "templatedocs",
  displayName: "TemplateDocs",
  description: "Create documents from TemplateDocs templates and inspect generation jobs.",
  categories: ["Productivity", "Design & Media"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "TEMPLATEDOCS_API_KEY",
      description:
        "TemplateDocs organization API key sent as a Bearer token. Create or manage keys at https://templatedocs.io/settings/api-keys; setup details are at https://templatedocs.io/docs/api/auth.",
    },
  ],
  homepageUrl: "https://templatedocs.io",
  actions: templatedocsActions,
};
