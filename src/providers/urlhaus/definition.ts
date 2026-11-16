import type { ProviderDefinition } from "../../core/types.ts";

import { urlhausActions } from "./actions.ts";

const service = "urlhaus";

/** URLhaus provider backed by the abuse.ch URLhaus API, which requires a free Auth-Key. */
export const provider: ProviderDefinition = {
  service,
  displayName: "URLhaus",
  description:
    "Look up URLs against the URLhaus malware URL database to check whether a URL is known to distribute malware. Requires a free abuse.ch Auth-Key, sent as the Auth-Key request header.",
  categories: ["Security", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Auth-Key",
      placeholder: "URLHAUS_AUTH_KEY",
      description:
        "abuse.ch Auth-Key sent as the Auth-Key request header. Get a free key at the abuse.ch Authentication Portal (https://auth.abuse.ch).",
      extraFields: [],
    },
  ],
  homepageUrl: "https://urlhaus.abuse.ch",
  actions: urlhausActions,
};
