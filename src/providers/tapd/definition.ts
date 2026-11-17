import type { ProviderDefinition } from "../../core/types.ts";

import { tapdActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "tapd",
  displayName: "TAPD",
  homepageUrl: "https://www.tapd.cn/",
  categories: ["Productivity", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Password",
      placeholder: "TAPD_API_PASSWORD",
      description:
        "TAPD enterprise API credentials. A company administrator can obtain them in Company management > Open integration > API account management. See https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html",
      extraFields: [
        {
          key: "apiUser",
          inputType: "text",
          secret: false,
          label: "API User",
          required: true,
          placeholder: "TAPD_API_USER",
          description:
            "TAPD enterprise API credentials. A company administrator can obtain them in Company management > Open integration > API account management. See https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/API%E9%85%8D%E7%BD%AE%E6%8C%87%E5%BC%95.html",
        },
      ],
    },
  ],
  actions: tapdActions,
};
