import type { ProviderDefinition } from "../../core/types.ts";

import { sansanActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "sansan",
  displayName: "Sansan",
  categories: ["Productivity", "Marketing"],
  homepageUrl: "https://jp.sansan.com",
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "SANSAN_API_KEY",
      description:
        "Create an API key under User name > Settings > API Key, or Administrator settings > External service integration > API. The key inherits its owner's permissions: https://jp-help.sansan.com/hc/ja/articles/206511517.",
    },
  ],
  actions: sansanActions,
};
