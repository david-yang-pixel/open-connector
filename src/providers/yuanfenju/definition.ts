import type { ProviderDefinition } from "../../core/types.ts";

import { yuanfenjuActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "yuanfenju",
  displayName: "Yuanfenju",
  homepageUrl: "https://yuanfenju.com/",
  iconUrl: "https://yuanfenju.com/Public/img/favicon.ico",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Development API Key",
      placeholder: "YUANFENJU_API_KEY",
      description:
        "Yuanfenju development API key. Register or sign in at https://portal.yuanfenju.com/ and copy the Development Key from your merchant account. Calls use your account's plan and quota; tarot readings require paid membership.",
    },
  ],
  actions: yuanfenjuActions,
};
