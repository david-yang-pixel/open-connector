import type { ProviderDefinition } from "../../core/types.ts";

import { tianapiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "tianapi",
  displayName: "TianAPI",
  homepageUrl: "https://www.tianapi.com/",
  iconUrl: "https://www.tianapi.com/favicon.ico",
  categories: ["Data & Analytics", "Social"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "YOUR_TIANAPI_KEY",
      description:
        "Sign in at https://www.tianapi.com/login.html and copy your key from Console > Data Management > My Key. Enable the Account Information API at https://www.tianapi.com/apiview/96 before connecting: validation makes one billable account query, using its free quota first, then TianDou credits. Enable each business API you want to use separately.",
    },
  ],
  actions: tianapiActions,
};
