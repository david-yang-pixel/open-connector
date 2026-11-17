import type { ProviderDefinition } from "../../core/types.ts";

import { zhiliaobiaoxunActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "zhiliaobiaoxun",
  displayName: "Zhiliao Biaoxun",
  homepageUrl: "https://www.zhiliaobiaoxun.com/",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "zlbx_...",
      description:
        "Sign in at https://ai.zhiliaobiaoxun.com/ and copy an API key from your personal center. Data queries consume provider credits; checking your balance is free.",
    },
  ],
  actions: zhiliaobiaoxunActions,
};
