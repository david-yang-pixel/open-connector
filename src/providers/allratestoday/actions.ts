import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "allratestoday";

const currency = s.nonEmptyString(
  "Three-letter currency code from the ECB reference set, such as USD, EUR, GBP, or JPY.",
);
const rates = s.record("Units of each currency per one unit of the base currency.", s.number("The exchange rate."));
const attribution = s.string("Credit line AllRatesToday asks to show wherever these rates are displayed.");
const date = s.string("Date of the ECB reference rates, in YYYY-MM-DD format.");

export const allratestodayActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_latest_rates",
    operationType: "read",
    description:
      "Get the latest daily ECB reference exchange rates against a base currency. Covers the 30 currencies the European Central Bank publishes; rates update once per working day around 16:00 CET. Free and needs no API key.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Latest exchange rate input.", {
      base: s.optional(s.withDefault(currency, "USD")),
      symbols: s.optional(
        s.array("Currency codes to return; omit for every available currency.", currency, { minItems: 1 }),
      ),
    }),
    outputSchema: s.looseRequiredObject(
      "Latest exchange rates.",
      {
        base: s.string("The base currency code."),
        date,
        last_updated: s.string("When the rates were last updated, as an HTTP date in UTC."),
        next_update: s.string("When the next update is expected, as an HTTP date in UTC."),
        rates,
        source: s.string("Where the rates come from."),
        attribution,
      },
      { optional: ["last_updated", "next_update", "source", "attribution"] },
    ),
  }),
  defineProviderAction(service, {
    name: "convert",
    operationType: "read",
    description:
      "Convert an amount between two of the 30 ECB reference currencies using the latest daily rate. Free and needs no API key.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Currency conversion input.", {
      from: currency,
      to: currency,
      amount: s.optional(s.number("Amount to convert. Defaults to 1.", { default: 1 })),
    }),
    outputSchema: s.looseRequiredObject(
      "The converted amount.",
      {
        from: s.string("The source currency code."),
        to: s.string("The target currency code."),
        amount: s.number("The original amount."),
        rate: s.number("Units of the target currency per one unit of the source currency."),
        result: s.number("The converted amount."),
        date,
        attribution,
      },
      { optional: ["attribution"] },
    ),
  }),
];
