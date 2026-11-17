import type { ProviderDefinition } from "../../core/types.ts";

import { fxbaogaoActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "fxbaogao",
  displayName: "Fxbaogao",
  homepageUrl: "https://www.fxbaogao.com/",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk-...",
      description:
        "Get your API key at https://www.fxbaogao.com/user/userInfo with an Advanced VIP subscription. Connecting checks only that a key is provided; API access is verified when you run an action.",
    },
  ],
  actions: fxbaogaoActions,
};
