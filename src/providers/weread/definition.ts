import type { ProviderDefinition } from "../../core/types.ts";

import { wereadActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "weread",
  displayName: "WeRead",
  homepageUrl: "https://weread.qq.com/",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "wrk-xxxxxxxx",
      description:
        "Get an API key linked to your WeRead account at https://weread.qq.com/r/weread-skills. The key provides Bearer-authenticated access to your reading data.",
    },
  ],
  actions: wereadActions,
};
