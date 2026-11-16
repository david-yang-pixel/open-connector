import type { ProviderDefinition } from "../../core/types.ts";

import { allratestodayActions } from "./actions.ts";

const service = "allratestoday";

/** AllRatesToday provider backed by the keyless open endpoint, which serves ECB reference rates. */
export const provider: ProviderDefinition = {
  service,
  displayName: "AllRatesToday",
  description:
    "Get daily European Central Bank reference exchange rates for 30 currencies through the AllRatesToday open endpoint, and convert amounts between them. Free, including commercial use, and needs no API key; wherever rates are displayed, a visible, followable link to allratestoday.com is required.",
  categories: ["Finance", "Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://allratestoday.com",
  actions: allratestodayActions,
};
