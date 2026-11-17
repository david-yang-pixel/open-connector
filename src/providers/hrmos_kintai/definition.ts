import type { ProviderDefinition } from "../../core/types.ts";

import { hrmosKintaiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "hrmos_kintai",
  displayName: "HRMOS Kintai",
  homepageUrl: "https://www.ieyasu.co/",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Secret Key (API Key)",
      description:
        "A paid HRMOS Kintai plan is required. Generate a Secret Key in System Management > System Settings > API KEY. Keys expire after three months; generate a new key and update this connection before expiry. If the section is missing, contact HRMOS support. Guide: https://atdguide.hrmos.co/hc/ja/articles/58758614047769",
      extraFields: [
        {
          key: "companyUrl",
          label: "Company login URL or slug",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "https://ieyasu.co/your-company",
          description:
            "Enter your HRMOS Kintai company login URL or its final company slug. Find the login URL under System Management > Company > Login Information. Guide: https://ieyasu.co/docs/api.html",
        },
      ],
    },
  ],
  actions: hrmosKintaiActions,
};
