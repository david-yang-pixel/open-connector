import type { ProviderDefinition } from "../../core/types.ts";

import { amazingMarvinActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "amazing_marvin",
  displayName: "Amazing Marvin",
  homepageUrl: "https://amazingmarvin.com/",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      description:
        "Get the API Token from https://app.amazingmarvin.com/pre?api (Features > API settings). Use API_TOKEN, not FULL_ACCESS_TOKEN. Requests send it in X-API-Token.",
    },
  ],
  actions: amazingMarvinActions,
};
