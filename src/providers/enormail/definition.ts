import type { ProviderDefinition } from "../../core/types.ts";

import { enormailActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "enormail",
  displayName: "Enormail",
  homepageUrl: "https://enormail.eu",
  iconUrl: "https://enormail.eu/icon.svg",
  categories: ["Communication", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "ENORMAIL_API_KEY",
      description:
        "Create an API key in your Enormail account at https://app.enormail.eu/account/api. The key authenticates requests using HTTP Basic authentication.",
    },
  ],
  actions: enormailActions,
};
