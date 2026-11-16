import type { ProviderDefinition } from "../../core/types.ts";

import { fengshuiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "fengshui",
  displayName: "Feng Shui API",
  homepageUrl: "https://fengshui-api.com/",
  iconUrl: "https://fengshui-api.com/favicon.svg",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "fsk_…",
      description:
        "Get a free API key at https://fengshui-api.com/account without signing up. Save it when shown; lost keys cannot be recovered. Each key currently allows 1,000 requests per hour.",
    },
  ],
  actions: fengshuiActions,
};
