import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "greynoise";

const communityLookupSchema = s.looseRequiredObject("GreyNoise Community IP lookup result.", {
  ip: s.string("The IPv4 address that was looked up."),
  noise: s.boolean("Whether the IP was observed scanning the internet in the last 90 days."),
  riot: s.boolean("Whether the IP is a known-benign service, such as a public DNS resolver or CDN."),
  classification: s.optional(s.stringEnum("GreyNoise classification of the IP.", ["benign", "malicious", "unknown"])),
  name: s.optional(s.nullable(s.string("Actor or service name, when GreyNoise attributes the IP."))),
  link: s.optional(s.nullable(s.string("Link to the GreyNoise Visualizer page for this IP."))),
  last_seen: s.optional(s.nullable(s.string("Date the IP was last observed, in YYYY-MM-DD format."))),
  message: s.string("Status message, for example why an IP was not observed."),
});

export const greynoiseActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "lookup_ip",
    operationType: "read",
    description:
      "Look up an IPv4 address in the GreyNoise Community dataset. Returns whether the IP is internet background noise, whether it is a known-benign service, and its classification. The Community endpoint is free, needs no API key, and is throttled per source IP.",
    requiredScopes: [],
    inputSchema: s.requiredObject("IP lookup input.", {
      ip: s.nonEmptyString("The IPv4 address to look up, such as 8.8.8.8."),
    }),
    outputSchema: communityLookupSchema,
  }),
];
