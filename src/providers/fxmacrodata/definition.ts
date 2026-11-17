import type { ProviderDefinition } from "../../core/types.ts";

import { fxmacrodataActions } from "./actions.ts";

const service = "fxmacrodata";

export const provider: ProviderDefinition = {
  service,
  displayName: "FXMacroData",
  categories: ["Finance", "Data"],
  authTypes: ["no_auth", "api_key"],
  auth: [
    { type: "no_auth" },
    {
      type: "api_key",
      label: "API Key",
      placeholder: "FXMACRODATA_API_KEY",
      description:
        "FXMacroData API key sent in the X-API-Key header. USD releases, the USD release calendar and the indicator catalogue work without a key; other currencies, FX rates and COT positioning need one. Get a key at https://fxmacrodata.com/subscribe?utm_source=github&utm_medium=referral&utm_campaign=open-connector&utm_content=subscribe.",
    },
  ],
  homepageUrl: "https://fxmacrodata.com",
  actions: fxmacrodataActions,
};
