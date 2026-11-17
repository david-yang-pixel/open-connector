import type { ProviderDefinition } from "../../core/types.ts";

import { assuredPlatformActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "assured_platform",
  displayName: "Assured Platform",
  description: "Manage Assured Platform residents, communities, and operational records.",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "ASSURED_PLATFORM_API_KEY",
      description:
        "Assured Platform account API key sent with the x-api-key header. Request a key from Assured Support at support@withassured.com; see https://developers.withassured.com/.",
    },
  ],
  homepageUrl: "https://www.withassured.com",
  actions: assuredPlatformActions,
};
