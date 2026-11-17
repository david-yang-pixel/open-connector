import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "crtsh";

const certificateSchema = s.looseRequiredObject("crt.sh certificate record.", {
  id: s.integer("crt.sh certificate ID."),
  issuer_ca_id: s.integer("ID of the issuing certificate authority."),
  issuer_name: s.string("Distinguished name of the issuing certificate authority."),
  common_name: s.string("Common name of the certificate."),
  name_value: s.string("Subject Alternative Names covered by the certificate, one per line."),
  not_before: s.string("Certificate validity start timestamp."),
  not_after: s.string("Certificate validity end timestamp."),
  serial_number: s.string("Certificate serial number."),
});

const searchCertificatesSchema = s.looseRequiredObject("crt.sh certificate search result.", {
  certificates: s.array("Matching certificate records, up to the requested limit.", certificateSchema),
  returned: s.integer("Number of certificate records returned."),
  total_matches: s.integer(
    "Total number of matching certificate records returned by crt.sh, before the limit is applied.",
  ),
});

export const crtshActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "search_certificates",
    operationType: "read",
    description:
      "Search Certificate Transparency logs via crt.sh for certificates matching a domain. Use % as a wildcard for subdomain enumeration, for example %.example.com. Free and needs no API key; results are capped by the limit parameter because popular domains can match a very large number of certificates.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Certificate search input.", {
      domain: s.nonEmptyString(
        "The domain to search, such as example.com. Use % as a wildcard, e.g. %.example.com enumerates subdomains.",
      ),
      limit: s.optional(s.integer("Maximum number of certificate records to return.", { minimum: 1, maximum: 1000 })),
    }),
    outputSchema: searchCertificatesSchema,
  }),
];
