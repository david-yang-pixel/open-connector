import type { ProviderDefinition } from "../../core/types.ts";

import { crtshActions } from "./actions.ts";

const service = "crtsh";

/** crt.sh provider backed by the public Certificate Transparency search, which needs no API key. */
export const provider: ProviderDefinition = {
  service,
  displayName: "crt.sh",
  description:
    "Search Certificate Transparency logs through crt.sh to enumerate certificates and discover subdomains for a domain. Free, needs no API key, and supports % wildcards for subdomain enumeration.",
  categories: ["Security", "Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://crt.sh",
  actions: crtshActions,
};
