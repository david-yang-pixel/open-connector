import type { ProviderDefinition } from "../../core/types.ts";

import { magicHourActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "magichour",
  displayName: "Magic Hour",
  homepageUrl: "https://magichour.ai",
  categories: ["AI", "Design & Media"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Magic Hour API key",
      description:
        "Create an API key in the Magic Hour Developer Hub at https://magichour.ai/developer?tab=api-keys. The key authorizes media generation and editing; requests use your account credits.",
      extraFields: [],
    },
  ],
  actions: magicHourActions,
};
