import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const currency = s.nonEmptyString("Currency code, such as USD, EUR, or BTC.", {});
const amount = s.number("Amount to convert. Defaults to 1.", { default: 1 });
const from = s.nonEmptyString("Base currency code. Defaults to USD.", {
  default: "USD",
});
const date = s.string("Date in YYYY-MM-DD format.", { format: "date" });
const values = s.record("Values indexed by currency code.", s.number("The currency value."));
const ratesProperties = {
  amount: s.number("The amount requested."),
  base: s.string("The base currency code."),
  to: s.string("The target currency when requested."),
  rate: s.number("The exchange rate for a single target currency."),
  result: s.number("The converted amount for a single target currency."),
  rates: values,
  results: values,
};
export const unirateapiActions: ActionDefinition[] = [
  defineProviderAction("unirateapi", {
    name: "list_currencies",
    description: "List the currency codes available from UniRateAPI.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Currency discovery input.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: s.looseObject("Available currencies.", {
      currencies: s.array("Supported currency codes.", s.string("A currency code.")),
      count: s.integer("The number of currencies."),
    }),
  }),
  defineProviderAction("unirateapi", {
    name: "get_rates",
    description: "Get current exchange rates and converted amounts for one or all currencies.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Current exchange rate input.",
      { from, to: currency, amount },
      {
        optional: ["from", "to", "amount"],
      },
    ),
    outputSchema: s.object(
      "Current rates; to selects rate/result, otherwise rates/results are returned.",
      ratesProperties,
      {
        required: ["amount", "base"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("unirateapi", {
    name: "convert",
    description: "Convert an amount into a target currency using current exchange rates.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Currency conversion input.",
      { from, to: currency, amount },
      {
        optional: ["from", "amount"],
      },
    ),
    outputSchema: s.looseObject("The converted amount.", {
      amount: s.number("The original amount."),
      from: s.string("The source currency."),
      to: s.string("The target currency."),
      result: s.number("The converted amount."),
    }),
  }),
  defineProviderAction("unirateapi", {
    name: "get_historical_rates",
    description: "Get exchange rates and converted amounts for a historical date.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Historical exchange rate input.",
      { date, from, to: currency, amount },
      {
        optional: ["from", "to", "amount"],
      },
    ),
    outputSchema: s.object(
      "Historical rates; to selects rate/result, otherwise rates/results are returned.",
      {
        date,
        ...ratesProperties,
      },
      {
        required: ["date", "amount", "base"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("unirateapi", {
    name: "get_timeseries",
    description:
      "Get daily historical currency values over a date range of at most five years. Values include the requested amount multiplier.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Historical time series input.",
      {
        start_date: date,
        end_date: date,
        base: from,
        amount,
        currencies: s.array("Currency codes to retrieve; omit for all currencies.", currency, {
          minItems: 1,
        }),
      },
      {
        optional: ["base", "amount", "currencies"],
      },
    ),
    outputSchema: s.looseObject("Daily currency values for the requested interval.", {
      start_date: date,
      end_date: date,
      base: s.string("The base currency."),
      amount: s.number("The amount multiplier."),
      currencies: s.array("Returned currencies.", s.string("A currency code.")),
      data: s.record("Daily values indexed by date.", values),
      total_days: s.integer("The number of returned days."),
    }),
  }),
  defineProviderAction("unirateapi", {
    name: "get_historical_limits",
    description: "Discover the available historical date range for each currency.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Historical availability input.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: s.looseObject("Historical availability by currency.", {
      currencies: s.record(
        "Availability indexed by currency code.",
        s.looseObject("A currency's historical availability.", {
          earliest_date: s.string("The earliest available date."),
          latest_date: s.string("The latest available date."),
          total_days: s.integer("Available day count."),
          description: s.string("Upstream availability explanation."),
        }),
      ),
      total_currencies: s.integer("Number of currencies with historical data."),
      data_source: s.string("The historical data source."),
    }),
  }),
];
