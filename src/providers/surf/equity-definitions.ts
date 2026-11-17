import type { SurfActionDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  arrayResponseSchema,
  endDateSchema,
  financialPeriodLimitSchema,
  objectResponseSchema,
} from "./shared-schemas.ts";
export const equityDefinitions: SurfActionDefinition[] = [
  {
    name: "equity_balance_sheet",
    description: "Equity Balance Sheet.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/balance-sheet",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Balance Sheet.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial period Default: "annual".'), ["quarterly", "annual"]),
        end_date: endDateSchema,
        limit: financialPeriodLimitSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_candles",
    description: "Equity Price Candles.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/candles",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "interval", in: "query", field: "interval" },
        { name: "interval_multiplier", in: "query", field: "interval_multiplier" },
        { name: "start_date", in: "query", field: "start_date" },
        { name: "end_date", in: "query", field: "end_date" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Price Candles.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol", { minLength: 1, maxLength: 20 }), ["AAPL"]),
        interval: s.withEnum(s.string('Candle interval Default: "day".'), ["day", "week", "month", "year"]),
        interval_multiplier: s.integer("Number of intervals represented by each candle Default: 1.", {
          minimum: 1,
          maximum: 100,
        }),
        start_date: s.withExamples(
          s.string("Inclusive start date in YYYY-MM-DD format; defaults to one year before end_date"),
          ["2025-01-01"],
        ),
        end_date: s.withExamples(
          s.string("Inclusive end date in YYYY-MM-DD format; defaults to the current date in US Eastern time"),
          ["2025-12-31"],
        ),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "equity_cash_flow",
    description: "Equity Cash Flow.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/cash-flow",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Cash Flow.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial period Default: "annual".'), ["quarterly", "ytd", "annual", "ttm"]),
        end_date: endDateSchema,
        limit: financialPeriodLimitSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_etf_holdings",
    description: "ETF Holdings.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/etf/holdings",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "as_of", in: "query", field: "as_of" },
        { name: "asset_class", in: "query", field: "asset_class" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for ETF Holdings.",
      {
        symbol: s.withExamples(s.string("US-listed ETF or index-fund ticker symbol", { minLength: 1, maxLength: 20 }), [
          "SPY",
        ]),
        as_of: s.withExamples(
          s.string(
            "Select the composition effective on or before this YYYY-MM-DD date; the response also includes its immediately previous snapshot",
          ),
          ["2026-03-31"],
        ),
        asset_class: s.withEnum(s.string("Filter holdings by instrument type"), ["equity", "bond"]),
        limit: s.integer("Maximum holdings to return Default: 50.", { minimum: 1, maximum: 1000 }),
        offset: s.integer("Number of holdings to skip Default: 0.", { minimum: 0 }),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "equity_filings",
    description: "Equity SEC Filings.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/filings",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity SEC Filings.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_income_statement",
    description: "Equity Income Statement.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/income-statement",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Income Statement.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial period Default: "annual".'), ["quarterly", "ytd", "annual", "ttm"]),
        end_date: endDateSchema,
        limit: financialPeriodLimitSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_latest_filings",
    description: "Latest Equity Filings.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/latest-filings",
      method: "GET",
      parameters: [{ name: "limit", in: "query", field: "limit" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Latest Equity Filings.",
      { limit: s.integer("Maximum filings to return Default: 4.", { minimum: 1, maximum: 20 }) },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_latest_financials",
    description: "Latest Equity Financials.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/latest-financials",
      method: "GET",
      parameters: [
        { name: "limit", in: "query", field: "limit" },
        { name: "market_cap_min", in: "query", field: "market_cap_min" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Latest Equity Financials.",
      {
        limit: s.integer("Maximum companies to return Default: 4.", { minimum: 1, maximum: 20 }),
        market_cap_min: s.nullable(
          s.number("Optional minimum current market capitalization in USD; omit to disable this filter", {
            minimum: 0,
          }),
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_listings",
    description: "Equity Listings.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/listings",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Listings.",
      {
        symbol: s.withExamples(
          s.string("Ticker used to resolve the issuer whose current verified stock listings are returned"),
          ["AAPL"],
        ),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_meta",
    description: "Equity Metadata.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/meta",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "include_tokenized", in: "query", field: "include_tokenized" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Metadata.",
      {
        symbol: s.withExamples(
          s.string("One or more comma-separated US stock or ETF ticker symbols; at most 20 unique symbols", {
            minLength: 1,
            maxLength: 419,
          }),
          ["AAPL,NVDA,SPY"],
        ),
        include_tokenized: s.boolean(
          "Include tokenized counterparts of each stock — issuer-minted crypto tokens tracking the equity, with their chains and contract addresses. Off by default: most symbols have none, and the payload grows with a 20-symbol request.",
        ),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_financial_metrics",
    description: "Equity Financial Metrics.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/metrics",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Financial Metrics.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial metric period Default: "ttm".'), ["quarterly", "annual", "ttm"]),
        end_date: endDateSchema,
        limit: financialPeriodLimitSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_overview",
    description: "Equity Financial Overview.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/overview",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Financial Overview.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial period Default: "ttm".'), ["quarterly", "ytd", "annual", "ttm"]),
        end_date: endDateSchema,
        limit: financialPeriodLimitSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "equity_company_profile",
    description: "Equity Profile.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/profile",
      method: "GET",
      parameters: [{ name: "symbol", in: "query", field: "symbol" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Profile.",
      { symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]) },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "equity_segments",
    description: "Equity Segment Financials.",
    operationType: "read",
    route: {
      path: "/gateway/v1/equity/segments",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "period", in: "query", field: "period" },
        { name: "statement_type", in: "query", field: "statement_type" },
        { name: "metric_code", in: "query", field: "metric_code" },
        { name: "dimension_type", in: "query", field: "dimension_type" },
        { name: "label", in: "query", field: "label" },
        { name: "start_date", in: "query", field: "start_date" },
        { name: "end_date", in: "query", field: "end_date" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Equity Segment Financials.",
      {
        symbol: s.withExamples(s.string("US equity ticker symbol"), ["AAPL"]),
        period: s.withEnum(s.string('Financial period Default: "annual".'), ["quarterly", "annual"]),
        statement_type: s.withEnum(s.string("Optional statement family"), ["income", "balance_sheet", "cash_flow"]),
        metric_code: s.string("Optional normalized metric code"),
        dimension_type: s.string("Optional provider dimension key", {
          pattern: "^[a-z][a-z0-9_]*$",
        }),
        label: s.string("Optional provider segment label"),
        start_date: s.string("Inclusive period start", { pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
        end_date: s.string("Inclusive period end", { pattern: "^\\d{4}-\\d{2}-\\d{2}$" }),
        limit: s.integer("Maximum facts to return Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Number of facts to skip Default: 0.", { minimum: 0 }),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
];
