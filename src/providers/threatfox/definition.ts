import type { ProviderDefinition } from "../../core/types.ts";

import { threatfoxActions } from "./actions.ts";

const service = "threatfox";

/** ThreatFox provider backed by the abuse.ch ThreatFox API, which requires a free Auth-Key. */
export const provider: ProviderDefinition = {
  service,
  displayName: "ThreatFox",
  description:
    "Look up indicators of compromise (IP address, domain, URL, or file hash) against the ThreatFox IOC database to check whether an IOC is associated with malware activity. Requires a free abuse.ch Auth-Key, sent as the Auth-Key request header.",
  categories: ["Security", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Auth-Key",
      placeholder: "THREATFOX_AUTH_KEY",
      description:
        "abuse.ch Auth-Key sent as the Auth-Key request header. Get a free key at the abuse.ch Authentication Portal (https://auth.abuse.ch).",
      extraFields: [],
    },
  ],
  homepageUrl: "https://threatfox.abuse.ch",
  actions: threatfoxActions,
};
