import type { ProviderDefinition } from "../../core/types.ts";

import { solarwindsServiceDeskActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "solarwinds_service_desk",
  displayName: "SolarWinds Service Desk",
  homepageUrl: "https://www.solarwinds.com/service-desk",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      description:
        "Ask an administrator to generate a token on your user setup page. Instructions: https://documentation.solarwinds.com/en/success_center/swsd/content/completeguidetoswsd/token-authentication-for-api-integration.htm. The token is sent in X-Samanage-Authorization.",
      extraFields: [
        {
          key: "region",
          label: "Region",
          required: false,
          placeholder: "us",
          description:
            "Account region: us (default), eu, or au (Asia Pacific/Japan). Use the region where your SolarWinds Service Desk account is hosted.",
          inputType: "text",
          secret: false,
        },
      ],
    },
  ],
  actions: solarwindsServiceDeskActions,
};
