import type { ProviderDefinition } from "../../core/types.ts";

import { rakurakuSeisanActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "rakuraku_seisan",
  displayName: "Rakuraku Seisan",
  categories: ["Finance"],
  homepageUrl: "https://www.rakus.co.jp/rakurakucloud/seisan/",
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      description:
        "Requires the paid API integration option. Generate a token under Administration > System settings > Other > API token. Credentials are verified on the first API request. Allow the connector server through IP restrictions; client certificate authentication is not supported. https://success-navi.rakurakucloud.jp/seisan/manual/detail/1236",
      extraFields: [
        {
          key: "baseUrl",
          label: "Company URL",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "https://rs.example.jp/companya/",
          description: "Company HTTPS URL including its account path, without a login page suffix.",
        },
      ],
    },
  ],
  actions: rakurakuSeisanActions,
};
