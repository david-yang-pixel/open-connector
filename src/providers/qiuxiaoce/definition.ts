import type { ProviderDefinition } from "../../core/types.ts";

import { qiuxiaoceActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "qiuxiaoce",
  displayName: "QiuXiaoCe",
  homepageUrl: "https://www.qiuxiaoce.com/",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_API_KEY",
      description:
        "Sign in at https://www.qiuxiaoce.com/data-account/ and copy your API key. Data queries consume prepaid credits; checking the balance is free.",
    },
  ],
  actions: qiuxiaoceActions,
};
