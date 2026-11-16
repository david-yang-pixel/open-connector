import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const mode = s.stringEnum("Environment; test returns simulated data, live is the default.", ["live", "test"]);
const countryFields = {
  countryCode: s.string("ISO country code."),
  countryName: s.string("Country name."),
};
const ipData = s.object(
  "IP geolocation and optional enrichment modules.",
  {
    ip: s.string("The queried IP address."),
    ipType: s.string("IP address version."),
    ...countryFields,
    cityName: s.string("City name."),
    latitude: s.string("Latitude coordinate."),
    longitude: s.string("Longitude coordinate."),
    asn: s.looseObject("Autonomous system details.", {}),
    security: s.looseObject("Proxy, Tor, hosting and other security signals.", {}),
    currency: s.looseObject("Currency details.", {}),
    timezone: s.looseObject("Timezone details.", {}),
    location: s.looseObject("Additional location details.", {}),
  },
  {
    required: ["ip"],
    additionalProperties: true,
  },
);
function envelope(data: JsonSchema) {
  return s.object(
    "Greip response with the original data and response metadata.",
    {
      data,
      status: s.string("Response status."),
      executionTime: s.number("Processing time in milliseconds."),
    },
    {
      required: ["data", "status"],
      additionalProperties: true,
    },
  );
}
export const greipActions: ActionDefinition[] = [
  defineProviderAction("greip", {
    name: "lookup_ip",
    operationType: "read",
    description: "Look up an IPv4 or IPv6 address with optional location and security enrichment.",
    requiredScopes: [],
    inputSchema: s.object(
      "IP lookup parameters.",
      {
        ip: s.nonEmptyString("IPv4 or IPv6 address to look up."),
        params: s.array(
          "Optional enrichment modules; availability depends on the plan.",
          s.stringEnum("Enrichment module.", ["security", "currency", "timezone", "location"]),
          { minItems: 1, uniqueItems: true },
        ),
        lang: s.stringEnum("Response language; EN is the default.", ["EN", "AR", "DE", "FR", "ES", "JA", "ZH", "RU"]),
        mode,
        userID: s.nonEmptyString("Optional user identifier for tracking requests in Greip events."),
      },
      {
        optional: ["params", "lang", "mode", "userID"],
      },
    ),
    outputSchema: envelope(ipData),
  }),
  defineProviderAction("greip", {
    name: "lookup_asn",
    operationType: "read",
    description: "Look up an autonomous system number, its organization and network prefixes.",
    requiredScopes: [],
    inputSchema: s.object(
      "ASN lookup parameters.",
      {
        asn: s.nonEmptyString("Autonomous system number, with or without the AS prefix, such as AS6167 or 6167."),
        mode,
      },
      {
        optional: ["mode"],
      },
    ),
    outputSchema: envelope(
      s.object(
        "Autonomous system information.",
        {
          asn: s.string("Autonomous system number."),
          name: s.string("Autonomous system name."),
          country: s.string("Country code."),
          org: s.string("Organization name."),
          prefixes: s.looseObject("Network prefixes advertised by the autonomous system.", {
            ipv4: s.array("IPv4 network prefixes.", s.string("IPv4 network prefix.")),
            ipv6: s.array("IPv6 network prefixes.", s.string("IPv6 network prefix.")),
            total: s.integer("Total number of prefixes."),
          }),
        },
        {
          required: ["asn"],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("greip", {
    name: "lookup_country",
    operationType: "read",
    description: "Look up country information with optional language, flag, currency and timezone details.",
    requiredScopes: [],
    inputSchema: s.object(
      "Country lookup parameters.",
      {
        CountryCode: s.string("Two-letter country code, such as GB.", {
          minLength: 2,
          maxLength: 2,
        }),
        params: s.array(
          "Optional country detail modules.",
          s.stringEnum("Country detail module.", ["language", "flag", "currency", "timezone"]),
          { minItems: 1, uniqueItems: true },
        ),
        mode,
      },
      {
        optional: ["params", "mode"],
      },
    ),
    outputSchema: envelope(
      s.object(
        "Country information and requested detail modules.",
        {
          ...countryFields,
          capital: s.string("Capital city."),
          population: s.integer("Country population."),
          phoneCode: s.string("International calling code."),
          countryIsEU: s.boolean("Whether the country is an EU member."),
          language: s.looseObject("Language details.", {}),
          flag: s.looseObject("Flag emoji and image URLs.", {}),
          currency: s.looseObject("Currency details.", {}),
          timezone: s.looseObject("Timezone details.", {}),
        },
        {
          required: ["countryCode"],
          additionalProperties: true,
        },
      ),
    ),
  }),
];
