import type { ProviderDefinition } from "../../core/types.ts";

import { xingpanActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "xingpan",
  displayName: "Xingpan API",
  homepageUrl: "https://xingpan.vip/",
  iconUrl: "https://www.xingpan.vip/static/module/index/default/images/logo_load.png",
  categories: ["Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "XINGPAN_ACCESS_TOKEN",
      description:
        "Xingpan access_token for chart calculations. See https://www.xingpan.vip/astrology/Apiinterface for the limited test token; contact official WeChat xingpanvip to obtain a production token and confirm access and quotas.",
    },
  ],
  actions: xingpanActions,
};
