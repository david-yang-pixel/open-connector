import type { ProviderDefinition } from "../../core/types.ts";

import { qqmusicActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "qqmusic",
  displayName: "QQ Music",
  homepageUrl: "https://y.qq.com/",
  categories: ["Design & Media"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "qmk-xxxxxxxx",
      description:
        "Get an account-linked API key at https://y.qq.com/n/ryqq_v2/qqmusic_skills. For personal music queries and experiences only.",
    },
  ],
  actions: qqmusicActions,
};
