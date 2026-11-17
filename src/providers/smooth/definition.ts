import type { ProviderDefinition } from "../../core/types.ts";

import { smoothActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "smooth",
  displayName: "Smooth",
  homepageUrl: "https://smooth.sh",
  categories: ["AI", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Get your Smooth API key at https://app.smooth.sh. Connecting checks only that the key is nonempty; Smooth validates it when actions run. Browser tasks use account credits.",
    },
  ],
  actions: smoothActions,
};
