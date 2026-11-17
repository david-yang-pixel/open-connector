import type { ProviderDefinition } from "../../core/types.ts";

import { flotiqActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "flotiq",
  displayName: "Flotiq",
  homepageUrl: "https://flotiq.com/",
  categories: ["Documents & Content", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "FLOTIQ_API_KEY",
      description:
        "Get an application or scoped key from the API Keys view in the Flotiq panel: https://flotiq.com/docs/API/ Use a read-write key or grant the content-type operations you need. Sent as X-AUTH-TOKEN.",
    },
  ],
  actions: flotiqActions,
};
