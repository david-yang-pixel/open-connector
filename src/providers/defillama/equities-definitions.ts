import type { DefillamaDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  countrySchema,
  annualValueSchema,
  valuesEntrySchema,
  childrenValueSchema,
  valuesSchema,
  periodEndingSchema,
  childrenSchema,
  sectorSchema,
  sectorSlugSchema,
  dollarVolumeShare24hSchema,
  marketCapChange1dSchema,
  dollarVolume24hSchema,
  employeeCountSchema,
  trailingPESchema,
  earningsYieldSchema,
  priceToRevenueSchema,
  priceToBookSchema,
  enterpriseValueToEbitdaSchema,
  dividendYieldSchema,
  holdersYieldSchema,
  operatingProfitMarginTTMSchema,
  priceChangePercentage1dSchema,
  priceChangePercentage7dSchema,
  priceChangePercentage1mSchema,
  priceChangePercentage3mSchema,
  priceChangePercentage6mSchema,
  priceChangePercentage1ySchema,
  coverageSchema,
  updatedAtSchema,
  companySchema,
} from "./shared-schemas.ts";
export const equitiesDefinitions: DefillamaDefinition[] = [
  {
    name: "get_equities_v1_companies_list",
    description:
      "Get list of all tracked public companies. Returns the tracked US-listed companies with their identity and sector and industry slugs, sorted by market cap (largest first). Use this to discover valid `ticker` + `country` pairs for the other equities endpoints. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/companies-list",
      parameters: [
        { name: "sector", in: "query" },
        { name: "industry", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_companies_list.",
      {
        sector: s.string(
          "Only return companies in this sector, as a slug (`technology`, `financial-services`) or as its label in any case (`Financial Services`). Valid values are the `sectorSlug`s returned by `GET /equities/v1/sectors`. An unknown value returns an empty list.",
        ),
        industry: s.string(
          "Only return companies in this industry, as a slug (`semiconductors`) or as its label in any case. Valid values are the `industrySlug`s returned by `GET /equities/v1/industries`. An unknown value returns an empty list.",
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              ticker: s.string("ticker returned by DeFiLlama."),
              companyName: s.string("companyName returned by DeFiLlama."),
              country: s.string("country returned by DeFiLlama."),
              countryName: s.string("countryName returned by DeFiLlama."),
              sectorSlug: s.string(
                "Sector id, the same value `GET /equities/v1/sectors` returns. `unknown` when the vendor left the company unclassified.",
              ),
              industrySlug: s.string("Industry id, the same value `GET /equities/v1/industries` returns."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_statements",
    description:
      "Get financial statements for a company. Returns income statement, balance sheet, and cash flow statement for the given ticker, broken down by quarterly and annual periods. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/statements",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_statements.",
      { ticker: s.string("Stock ticker symbol (case-insensitive)"), country: countrySchema },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Financial statements containing income statement, balance sheet, and cash flow data broken down by quarterly and annual periods.",
      {
        incomeStatement: s.object(
          "Income statement data. The `labels` array defines the rows; `values` is a parallel array of arrays where each inner array holds one row's values across all periods.",
          {
            labels: s.array(
              "Ordered list of income statement line items. Each index corresponds to an inner array in `quarterly.values` and `annual.values`.",
              s.string("Result entry returned by DeFiLlama."),
            ),
            children: s.object(
              "Metadata describing which top-level labels have child breakdowns and what those child labels are, separately for quarterly and annual periods.",
              {
                quarterly: s.object(
                  "Child label definitions for quarterly data. Keys are parent label names from `labels`.",
                  {},
                  {
                    required: [],
                    additionalProperties: s.object(
                      "Value for this key.",
                      {
                        labels: s.array(
                          "Child line item names for this parent. Each index corresponds to an inner array in `quarterly.children[label].values`.",
                          s.string("Result entry returned by DeFiLlama."),
                        ),
                      },
                      { required: [], additionalProperties: true },
                    ),
                  },
                ),
                annual: s.object(
                  "Child label definitions for annual data. Keys are parent label names from `labels`.",
                  {},
                  { required: [], additionalProperties: annualValueSchema },
                ),
              },
              { required: [], additionalProperties: true },
            ),
            quarterly: s.object(
              "Quarterly period data for the income statement.",
              {
                periodEnding: s.array(
                  "ISO 8601 date each quarter ended.",
                  s.string("Result entry returned by DeFiLlama.", { format: "date" }),
                ),
                values: s.array(
                  "Parallel to `labels`. Each inner array contains the values for that row across all `periodEnding` entries. Values may be `null` when not reported.",
                  valuesEntrySchema,
                ),
                children: s.object(
                  "Breakdown data for parent labels that have sub-components. Keys match parent label names. Child labels are defined in `children.quarterly[label].labels`.",
                  {},
                  {
                    required: [],
                    additionalProperties: s.object(
                      "Value for this key.",
                      {
                        values: s.array(
                          "One inner array per child label, each containing values across all periods. Values may be `null`.",
                          valuesEntrySchema,
                        ),
                      },
                      { required: [], additionalProperties: true },
                    ),
                  },
                ),
              },
              { required: [], additionalProperties: true },
            ),
            annual: s.object(
              "Annual period data for the income statement.",
              {
                periodEnding: s.array(
                  "ISO 8601 date each fiscal year ended.",
                  s.string("Result entry returned by DeFiLlama.", { format: "date" }),
                ),
                values: s.array(
                  "Parallel to `labels`. Each inner array contains the values for that row across all `periodEnding` entries. Values may be `null`.",
                  valuesEntrySchema,
                ),
                children: s.object(
                  "Breakdown data for parent labels that have sub-components. Child labels are defined in `children.annual[label].labels`.",
                  {},
                  { required: [], additionalProperties: childrenValueSchema },
                ),
              },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
        balanceSheet: s.object(
          "Balance sheet data. Follows the same structure as `incomeStatement`: top-level `labels`, `children` metadata, and `quarterly`/`annual` period objects each containing `periodEnding`, `values`, and `children`.",
          {
            labels: s.array(
              "Ordered list of balance sheet line items.",
              s.string("Result entry returned by DeFiLlama."),
            ),
            children: s.object(
              "children returned by DeFiLlama.",
              {
                quarterly: s.object(
                  "quarterly returned by DeFiLlama.",
                  {},
                  { required: [], additionalProperties: annualValueSchema },
                ),
                annual: s.object(
                  "annual returned by DeFiLlama.",
                  {},
                  { required: [], additionalProperties: annualValueSchema },
                ),
              },
              { required: [], additionalProperties: true },
            ),
            quarterly: s.object(
              "quarterly returned by DeFiLlama.",
              { periodEnding: periodEndingSchema, values: valuesSchema, children: childrenSchema },
              { required: [], additionalProperties: true },
            ),
            annual: s.object(
              "annual returned by DeFiLlama.",
              { periodEnding: periodEndingSchema, values: valuesSchema, children: childrenSchema },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
        cashflow: s.object(
          "Cash flow statement data. Follows the same structure as `incomeStatement`: top-level `labels`, `children` metadata, and `quarterly`/`annual` period objects each containing `periodEnding`, `values`, and `children`.",
          {
            labels: s.array("Ordered list of cash flow line items.", s.string("Result entry returned by DeFiLlama.")),
            children: s.object(
              "children returned by DeFiLlama.",
              {
                quarterly: s.object(
                  "quarterly returned by DeFiLlama.",
                  {},
                  { required: [], additionalProperties: annualValueSchema },
                ),
                annual: s.object(
                  "annual returned by DeFiLlama.",
                  {},
                  { required: [], additionalProperties: annualValueSchema },
                ),
              },
              { required: [], additionalProperties: true },
            ),
            quarterly: s.object(
              "quarterly returned by DeFiLlama.",
              { periodEnding: periodEndingSchema, values: valuesSchema, children: childrenSchema },
              { required: [], additionalProperties: true },
            ),
            annual: s.object(
              "annual returned by DeFiLlama.",
              { periodEnding: periodEndingSchema, values: valuesSchema, children: childrenSchema },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_dimensions",
    description:
      "Get financial dimensions for a company. Returns time-series financial dimension metrics (revenue, holders revenue, earnings, and basic shares outstanding) for the given ticker, each broken down into annual and quarterly series. Every data point is a two-element array: ISO 8601 period-ending date, then the numeric value. Series are sorted by date descending (newest first). Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/dimensions",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_dimensions.",
      { ticker: s.string("Stock ticker symbol (case-insensitive)"), country: countrySchema },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Map of metric name to its annual and quarterly time series. Keys vary by company and by which metrics are available (for example `revenue`, `holdersRevenue`, `earnings`, `basicSharesOutstanding`).",
      {},
      {
        required: [],
        additionalProperties: s.object(
          "A single dimension metric, split into annual and quarterly series.",
          {
            annual: s.array(
              "Annual data points, newest first. Each item is `[periodEnding, value]`.",
              s.array(
                "Result entry returned by DeFiLlama.",
                {
                  anyOf: [s.string("ISO 8601 period-ending date"), s.number("Metric value")],
                  description: "Result entry returned by DeFiLlama.",
                },
                { minItems: 2, maxItems: 2 },
              ),
            ),
            quarterly: s.array(
              "Quarterly data points, newest first. Each item is `[periodEnding, value]`.",
              s.array(
                "Result entry returned by DeFiLlama.",
                {
                  anyOf: [s.string("ISO 8601 period-ending date"), s.number("Metric value")],
                  description: "Result entry returned by DeFiLlama.",
                },
                { minItems: 2, maxItems: 2 },
              ),
            ),
          },
          { required: [], additionalProperties: true },
        ),
      },
    ),
  },
  {
    name: "get_equities_v1_price_history",
    description:
      "Get historical price data for a company. Returns closing prices as two-element arrays: ISO 8601 date-time string, then numeric price. Sorted by date descending (newest first). Resolution follows `timeframe`: `1D`, `7D` and `1W` are 5-minute intraday bars whose date-time carries a real time of day, while `1M` and longer are daily closes stamped `T00:00:00Z`. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/price-history",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
        { name: "timeframe", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_price_history.",
      {
        ticker: s.string("Stock ticker symbol (case-insensitive)"),
        country: countrySchema,
        timeframe: {
          ...s.withEnum(
            s.string(
              "Optional lookback window (case-insensitive). `1D` returns the most recent trading session and `7D`/`1W` (aliases) the last 7 days, both at 5-minute resolution; `1M` and longer are daily. `YTD` runs from January 1 of the current year. Omit or empty for full history (`MAX`). Intraday coverage is best-effort — a ticker without intraday data falls back to daily bars, and `1D` then returns the single most recent daily bar.",
            ),
            ["1D", "7D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y", "MAX"],
          ),
          default: "MAX",
        },
      },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "Each item is `[timestamp, price]`: ISO 8601 string, then closing price.",
          s.array(
            "Result entry returned by DeFiLlama.",
            {
              anyOf: [s.string("ISO 8601 date-time"), s.number("Closing price")],
              description: "Result entry returned by DeFiLlama.",
            },
            { minItems: 2, maxItems: 2 },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_ohlcv",
    description:
      "Get OHLCV candle data for a company. Returns OHLCV bars as six-number arrays: Unix timestamp in seconds (UTC), open, high, low, close, volume. Sorted by time descending (newest first). Optional `timeframe` controls both how far back data goes and the bar resolution: `1D`, `7D` and `1W` return 5-minute bars, `1M` and longer return daily bars. Omit or empty for full history (`MAX`). Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/ohlcv",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
        { name: "timeframe", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_ohlcv.",
      {
        ticker: s.string("Stock ticker symbol (case-insensitive)"),
        country: countrySchema,
        timeframe: {
          ...s.withEnum(
            s.string(
              "Optional lookback window (case-insensitive), same values as price history. `1D` returns the most recent trading session and `7D`/`1W` (aliases) the last 7 days, both as 5-minute bars; `1M` and longer are daily bars. `YTD` runs from January 1 of the current year. Omit or empty for full history (`MAX`). Intraday coverage is best-effort — a ticker without intraday data falls back to daily bars.",
            ),
            ["1D", "7D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y", "MAX"],
          ),
          default: "MAX",
        },
      },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "Each item is `[timestamp, open, high, low, close, volume]`. `timestamp` is Unix epoch seconds (UTC).",
          s.array("Result entry returned by DeFiLlama.", s.number("Result entry returned by DeFiLlama."), {
            minItems: 6,
            maxItems: 6,
          }),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_summary",
    description:
      "Get live market summary for a company. Returns current market data for a single ticker. This is a compact snapshot (no `ticker` / `name` fields); use `GET /equities/v1/companies-list` for the list of tracked companies with their identity details. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/summary",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_summary.",
      { ticker: s.string("Stock ticker symbol (case-insensitive)"), country: countrySchema },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        currentPrice: s.number("currentPrice returned by DeFiLlama."),
        volume: s.number("volume returned by DeFiLlama."),
        marketCap: s.number("marketCap returned by DeFiLlama."),
        circulatingMarketCap: s.nullable(s.number("circulatingMarketCap returned by DeFiLlama.")),
        enterpriseValue: s.nullable(s.number("enterpriseValue returned by DeFiLlama.")),
        fiftyTwoWeekHigh: s.number("fiftyTwoWeekHigh returned by DeFiLlama."),
        fiftyTwoWeekLow: s.number("fiftyTwoWeekLow returned by DeFiLlama."),
        dividendYield: s.nullable(s.number("dividendYield returned by DeFiLlama.")),
        trailingPE: s.nullable(s.number("trailingPE returned by DeFiLlama.")),
        priceToRevenue: s.nullable(s.number("priceToRevenue returned by DeFiLlama.")),
        priceChangePercentage1d: s.number("priceChangePercentage1d returned by DeFiLlama."),
        priceChangePercentage7d: s.number("priceChangePercentage7d returned by DeFiLlama."),
        priceChangePercentage1m: s.number("priceChangePercentage1m returned by DeFiLlama."),
        priceChange1d: s.number("priceChange1d returned by DeFiLlama."),
        marketCapChange1d: s.number("marketCapChange1d returned by DeFiLlama."),
        priceToBook: s.nullable(s.number("priceToBook returned by DeFiLlama.")),
        enterpriseValueToEbitda: s.nullable(s.number("enterpriseValueToEbitda returned by DeFiLlama.")),
        holdersYield: s.nullable(s.number("holdersYield returned by DeFiLlama.")),
        updatedAt: s.string("updatedAt returned by DeFiLlama.", { format: "date-time" }),
        revenueTTM: s.nullable(s.number("revenueTTM returned by DeFiLlama.")),
        grossProfitTTM: s.nullable(s.number("grossProfitTTM returned by DeFiLlama.")),
        earningsTTM: s.nullable(s.number("earningsTTM returned by DeFiLlama.")),
        ebitdaTTM: s.nullable(s.number("ebitdaTTM returned by DeFiLlama.")),
        operatingProfitMarginTTM: s.nullable(s.number("operatingProfitMarginTTM returned by DeFiLlama.")),
        holdersRevenueTTM: s.nullable(s.number("holdersRevenueTTM returned by DeFiLlama.")),
        holderEarningsTTM: s.nullable(s.number("holderEarningsTTM returned by DeFiLlama.")),
        dividendsTTM: s.nullable(s.number("dividendsTTM returned by DeFiLlama.")),
        stockRepurchaseTTM: s.nullable(s.number("stockRepurchaseTTM returned by DeFiLlama.")),
        stockIssuanceTTM: s.nullable(s.number("stockIssuanceTTM returned by DeFiLlama.")),
        stockBasedCompensationTTM: s.nullable(s.number("stockBasedCompensationTTM returned by DeFiLlama.")),
        cashAndCashEquivalents: s.nullable(s.number("cashAndCashEquivalents returned by DeFiLlama.")),
        totalAssets: s.nullable(s.number("totalAssets returned by DeFiLlama.")),
        totalLiabilities: s.nullable(s.number("totalLiabilities returned by DeFiLlama.")),
        totalShareholdersEquity: s.nullable(s.number("totalShareholdersEquity returned by DeFiLlama.")),
        totalDebt: s.nullable(s.number("totalDebt returned by DeFiLlama.")),
        circulatingSupply: s.nullable(s.number("circulatingSupply returned by DeFiLlama.")),
        totalSupply: s.nullable(s.number("totalSupply returned by DeFiLlama.")),
        employeeCount: s.nullable(s.integer("employeeCount returned by DeFiLlama.")),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_filings",
    description:
      "Get filings for a company. Returns a list of company filings (such as annual reports, quarterly reports, and other important filings) for the given ticker, sorted by filing date descending (newest first). Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/filings",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_filings.",
      { ticker: s.string("Stock ticker symbol (case-insensitive)"), country: countrySchema },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              filingDate: s.string("filingDate returned by DeFiLlama.", { format: "date" }),
              reportDate: s.string("reportDate returned by DeFiLlama.", { format: "date" }),
              form: s.string("form returned by DeFiLlama."),
              primaryDocumentUrl: s.string("primaryDocumentUrl returned by DeFiLlama.", {
                format: "uri",
              }),
              documentDescription: s.string("documentDescription returned by DeFiLlama."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_onchain",
    description:
      "Get on-chain tradeable markets for a company. Returns where the stock can be traded on-chain: `perps` are perpetual futures markets across exchanges, and `tokens` are tokenised-equity issuers. This is a live snapshot refreshed hourly and no history is kept. On-chain data is only collected for US-listed tickers, so a ticker in another market comes back with empty `perps` and `tokens` arrays rather than an error. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/onchain",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "country", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_onchain.",
      { ticker: s.string("Stock ticker symbol (case-insensitive)"), country: countrySchema },
      { required: ["ticker", "country"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        perps: s.array(
          "Perpetual futures markets tracking the stock.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              pair: s.string("Market pair as the venue names it."),
              price: s.nullable(s.number("Last traded price of the contract, in USD.")),
              volume24h: s.nullable(s.number("24 hour volume, in USD.")),
              openInterest: s.nullable(s.number("Open interest, in USD.")),
              annualizedFundingRate: s.nullable(
                s.number(
                  "Annualised funding rate, in percent, so `-70.13` is -70.13% a year. Negative means shorts pay longs.",
                ),
              ),
              tradeUrl: s.string("Direct link to the market on the venue."),
              contractSlug: s.string("DefiLlama market identifier, `{venue}:{symbol}`."),
              exchangeProtocolSlug: s.string("DefiLlama protocol slug for the exchange, when it has one."),
              rwaPlatformSlug: s.string("DefiLlama RWA platform slug for the venue, when it has one."),
              exchangeType: s.withEnum(s.string("Whether the venue is a centralised or an on-chain exchange."), [
                "CEX",
                "DEX",
              ]),
              updatedAt: s.string("When this market was last refreshed.", { format: "date-time" }),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        tokens: s.array(
          "Tokenised equity products tracking the stock.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              issuer: s.string("Legal entity issuing the tokenised share, not the listed company."),
              issuerRwaPlatformSlug: s.string("DefiLlama RWA platform slug for the issuer."),
              price: s.nullable(s.number("Token price, in USD.")),
              assetSlug: s.string("Token symbol as the issuer lists it."),
              activeMarketcap: s.nullable(
                s.number("Market cap of the token across active markets, in USD. `null` when no market reports one."),
              ),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_sectors",
    description:
      "Get all sectors. Returns one row per sector, sorted by market cap (largest first): market cap and weight, traded value, valuation ratios, price changes over seven windows, and the three largest holdings.\n\nCovers US-listed companies. All monetary values are in USD.\n\nSector and industry names come from the data vendor (a Morningstar-style list of 11 sectors and about 140 industries), not GICS. Companies with no sector are grouped as `Unknown` rather than dropped, so sector market caps add up to the market total.\n\nRatios such as `trailingPE` are aggregates (total market cap / total earnings), so the group is valued as one company rather than averaging its constituents' ratios. Price changes are weighted by market cap at the start of each window. Percentages are in percent, not fractions: `1.82` means +1.82%. Requires an API plan key. Beta API; upstream fields may change.",
    route: { path: "/equities/v1/sectors", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_equities_v1_sectors.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              sector: sectorSchema,
              sectorSlug: sectorSlugSchema,
              rank: s.integer("Position by market cap, starting at 1."),
              weight: s.nullable(
                s.number(
                  "Share of all tracked US equity market cap, in percent. Sums to 100 across sectors, `Unknown` included.",
                ),
              ),
              dollarVolumeShare24h: dollarVolumeShare24hSchema,
              industryCount: s.integer("Number of distinct industries in the sector."),
              marketCap: s.nullable(s.number("Total market cap of the constituents, in USD.")),
              marketCapChange1d: marketCapChange1dSchema,
              dollarVolume24h: dollarVolume24hSchema,
              revenueTTM: s.nullable(s.number("Total trailing twelve month revenue, in USD.")),
              earningsTTM: s.nullable(s.number("Total trailing twelve month earnings, in USD.")),
              ebitdaTTM: s.nullable(s.number("Total trailing twelve month EBITDA, in USD.")),
              enterpriseValue: s.nullable(s.number("Total enterprise value, in USD.")),
              employeeCount: employeeCountSchema,
              trailingPE: trailingPESchema,
              earningsYield: earningsYieldSchema,
              priceToRevenue: priceToRevenueSchema,
              priceToBook: priceToBookSchema,
              enterpriseValueToEbitda: enterpriseValueToEbitdaSchema,
              dividendYield: dividendYieldSchema,
              holdersYield: holdersYieldSchema,
              operatingProfitMarginTTM: operatingProfitMarginTTMSchema,
              priceChangePercentage1d: priceChangePercentage1dSchema,
              priceChangePercentage7d: priceChangePercentage7dSchema,
              priceChangePercentage1m: priceChangePercentage1mSchema,
              priceChangePercentage3m: priceChangePercentage3mSchema,
              priceChangePercentage6m: priceChangePercentage6mSchema,
              priceChangePercentageYtd: s.nullable(s.number("Cap-weighted price change since January 1, in percent.")),
              priceChangePercentage1y: priceChangePercentage1ySchema,
              companyCount: s.integer("Number of constituents."),
              coverage: coverageSchema,
              updatedAt: updatedAtSchema,
              volumeAsOf: s.nullable(s.string("When `dollarVolume24h` was taken.", { format: "date-time" })),
              topHoldings: s.array(
                "The three largest constituents by market cap. `GET /equities/v1/sector` returns ten.",
                s.object(
                  "Result entry returned by DeFiLlama.",
                  {
                    ticker: s.string("ticker returned by DeFiLlama."),
                    name: s.string("name returned by DeFiLlama."),
                    marketCap: s.nullable(s.number("Market cap, in USD.")),
                    sectorWeight: s.nullable(s.number("Share of this sector's market cap, in percent.")),
                    priceChangePercentage1d: s.nullable(s.number("Price change over the latest session, in percent.")),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_sectors_overview",
    description:
      "Get market-wide sector overview. Returns totals across all tracked US companies, which the per-sector rows cannot carry: the market cap every sector `weight` is measured against, aggregate and median valuation ratios for the whole market, and the best, worst, and largest sector.\n\nThe constituents here are every tracked US company. Fields shared with `GET /equities/v1/sectors` mean the same thing.\n\nCovers US-listed companies. All monetary values are in USD. Requires an API plan key. Beta API; upstream fields may change.",
    route: { path: "/equities/v1/sectors-overview", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_equities_v1_sectors_overview.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        marketCap: s.nullable(s.number("Total market cap of the constituents, in USD.")),
        marketCapChange1d: marketCapChange1dSchema,
        dollarVolume24h: dollarVolume24hSchema,
        revenueTTM: s.nullable(s.number("Total trailing twelve month revenue, in USD.")),
        earningsTTM: s.nullable(s.number("Total trailing twelve month earnings, in USD.")),
        ebitdaTTM: s.nullable(s.number("Total trailing twelve month EBITDA, in USD.")),
        enterpriseValue: s.nullable(s.number("Total enterprise value, in USD.")),
        employeeCount: employeeCountSchema,
        trailingPE: trailingPESchema,
        earningsYield: earningsYieldSchema,
        priceToRevenue: priceToRevenueSchema,
        priceToBook: priceToBookSchema,
        enterpriseValueToEbitda: enterpriseValueToEbitdaSchema,
        dividendYield: dividendYieldSchema,
        holdersYield: holdersYieldSchema,
        operatingProfitMarginTTM: operatingProfitMarginTTMSchema,
        priceChangePercentage1d: priceChangePercentage1dSchema,
        priceChangePercentage7d: priceChangePercentage7dSchema,
        priceChangePercentage1m: priceChangePercentage1mSchema,
        priceChangePercentage3m: priceChangePercentage3mSchema,
        priceChangePercentage6m: priceChangePercentage6mSchema,
        priceChangePercentageYtd: s.nullable(s.number("Cap-weighted price change since January 1, in percent.")),
        priceChangePercentage1y: priceChangePercentage1ySchema,
        companyCount: s.integer("Number of constituents."),
        coverage: coverageSchema,
        updatedAt: updatedAtSchema,
        volumeAsOf: s.nullable(s.string("When `dollarVolume24h` was taken.", { format: "date-time" })),
        medianTrailingPE: s.nullable(s.number("Median of the constituents' own P/E, over those with a positive one.")),
        medianPriceToRevenue: s.nullable(
          s.number("Median of the constituents' own price to sales, over those with a positive one."),
        ),
        medianPriceToBook: s.nullable(
          s.number("Median of the constituents' own price to book, over those with a positive one."),
        ),
        medianEnterpriseValueToEbitda: s.nullable(
          s.number("Median of the constituents' own EV/EBITDA, over those with a positive one."),
        ),
        medianOperatingProfitMarginTTM: s.nullable(
          s.number("Median of the constituents' own TTM operating margin, in percent."),
        ),
        medianDividendYield: s.nullable(s.number("Median of the constituents' own dividend yield, in percent.")),
        medianMarketCap: s.nullable(s.number("Median constituent market cap, in USD.")),
        sectorCount: s.integer("Number of sectors, not counting `Unknown`."),
        industryCount: s.integer("Number of distinct industries."),
        bestSector1d: s.nullable(
          s.object(
            "Sector with the highest `priceChangePercentage1d`. Never `Unknown`.",
            {
              sector: sectorSchema,
              sectorSlug: sectorSlugSchema,
              priceChangePercentage1d: s.nullable(
                s.number("Cap-weighted price change over the latest session, in percent."),
              ),
              weight: s.nullable(s.number("Share of all tracked US equity market cap, in percent.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        worstSector1d: s.nullable(
          s.object(
            "Sector with the lowest `priceChangePercentage1d`. Never `Unknown`.",
            {
              sector: sectorSchema,
              sectorSlug: sectorSlugSchema,
              priceChangePercentage1d: s.nullable(
                s.number("Cap-weighted price change over the latest session, in percent."),
              ),
              weight: s.nullable(s.number("Share of all tracked US equity market cap, in percent.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        largestSector: s.nullable(
          s.object(
            "Sector with the largest market cap. Never `Unknown`.",
            {
              sector: sectorSchema,
              sectorSlug: sectorSlugSchema,
              priceChangePercentage1d: s.nullable(
                s.number("Cap-weighted price change over the latest session, in percent."),
              ),
              weight: s.nullable(s.number("Share of all tracked US equity market cap, in percent.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_sector",
    description:
      "Get details for one sector. Returns one sector in full: everything its `GET /equities/v1/sectors` row has, plus a short description, the ten largest holdings, aggregate and median valuation ratios side by side, and how concentrated the sector is.\n\nCovers US-listed companies. All monetary values are in USD. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/sector",
      parameters: [{ name: "sector", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_sector.",
      {
        sector: s.string(
          "Sector to return, as a slug (`technology`, `financial-services`) or as its label in any case (`Financial Services`). Valid values are the `sectorSlug`s returned by `GET /equities/v1/sectors`.",
        ),
      },
      { required: ["sector"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        sector: sectorSchema,
        sectorSlug: sectorSlugSchema,
        rank: s.integer("Position by market cap, starting at 1."),
        weight: s.nullable(
          s.number(
            "Share of all tracked US equity market cap, in percent. Sums to 100 across sectors, `Unknown` included.",
          ),
        ),
        dollarVolumeShare24h: dollarVolumeShare24hSchema,
        industryCount: s.integer("Number of distinct industries in the sector."),
        marketCap: s.nullable(s.number("Total market cap of the constituents, in USD.")),
        marketCapChange1d: marketCapChange1dSchema,
        dollarVolume24h: dollarVolume24hSchema,
        revenueTTM: s.nullable(s.number("Total trailing twelve month revenue, in USD.")),
        earningsTTM: s.nullable(s.number("Total trailing twelve month earnings, in USD.")),
        ebitdaTTM: s.nullable(s.number("Total trailing twelve month EBITDA, in USD.")),
        enterpriseValue: s.nullable(s.number("Total enterprise value, in USD.")),
        employeeCount: employeeCountSchema,
        trailingPE: trailingPESchema,
        earningsYield: earningsYieldSchema,
        priceToRevenue: priceToRevenueSchema,
        priceToBook: priceToBookSchema,
        enterpriseValueToEbitda: enterpriseValueToEbitdaSchema,
        dividendYield: dividendYieldSchema,
        holdersYield: holdersYieldSchema,
        operatingProfitMarginTTM: operatingProfitMarginTTMSchema,
        priceChangePercentage1d: priceChangePercentage1dSchema,
        priceChangePercentage7d: priceChangePercentage7dSchema,
        priceChangePercentage1m: priceChangePercentage1mSchema,
        priceChangePercentage3m: priceChangePercentage3mSchema,
        priceChangePercentage6m: priceChangePercentage6mSchema,
        priceChangePercentageYtd: s.nullable(s.number("Cap-weighted price change since January 1, in percent.")),
        priceChangePercentage1y: priceChangePercentage1ySchema,
        companyCount: s.integer("Number of constituents."),
        coverage: coverageSchema,
        updatedAt: updatedAtSchema,
        volumeAsOf: s.nullable(s.string("When `dollarVolume24h` was taken.", { format: "date-time" })),
        topHoldings: s.array(
          "The ten largest constituents by market cap.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              ticker: s.string("ticker returned by DeFiLlama."),
              name: s.string("name returned by DeFiLlama."),
              marketCap: s.nullable(s.number("Market cap, in USD.")),
              sectorWeight: s.nullable(s.number("Share of this sector's market cap, in percent.")),
              priceChangePercentage1d: s.nullable(s.number("Price change over the latest session, in percent.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        description: s.string("Short description of what the sector covers."),
        valuation: s.object(
          "The sector's aggregate ratios (same values as the top-level fields) next to the median of its constituents' own ratios. Compare aggregate with aggregate and median with median, for example against `GET /equities/v1/sectors-overview`.",
          {
            trailingPE: s.nullable(s.number("Aggregate P/E.")),
            earningsYield: s.nullable(s.number("Aggregate earnings yield, in percent.")),
            priceToRevenue: s.nullable(s.number("Aggregate price to sales.")),
            priceToBook: s.nullable(s.number("Aggregate price to book.")),
            enterpriseValueToEbitda: s.nullable(s.number("Aggregate EV/EBITDA.")),
            operatingProfitMarginTTM: s.nullable(s.number("Revenue-weighted TTM operating margin, in percent.")),
            dividendYield: s.nullable(s.number("Aggregate dividend yield, in percent.")),
            medianTrailingPE: s.nullable(
              s.number("Median of the constituents' own P/E, over those with a positive one."),
            ),
            medianPriceToRevenue: s.nullable(
              s.number("Median of the constituents' own price to sales, over those with a positive one."),
            ),
            medianPriceToBook: s.nullable(
              s.number("Median of the constituents' own price to book, over those with a positive one."),
            ),
            medianEnterpriseValueToEbitda: s.nullable(
              s.number("Median of the constituents' own EV/EBITDA, over those with a positive one."),
            ),
            medianOperatingProfitMarginTTM: s.nullable(
              s.number("Median of the constituents' own TTM operating margin, in percent."),
            ),
            medianDividendYield: s.nullable(s.number("Median of the constituents' own dividend yield, in percent.")),
          },
          { required: [], additionalProperties: true },
        ),
        concentration: s.object(
          "How much of the sector's market cap sits in its largest constituents.",
          {
            top10MarketCapShare: s.nullable(
              s.number("Share of the sector's market cap held by its ten largest constituents, in percent."),
            ),
            hhi: s.nullable(
              s.number(
                "Herfindahl-Hirschman index over the constituents' percentage shares of sector market cap, from 0 to 10,000. A single-company sector is 10,000 and ten equal constituents are 1,000.",
              ),
            ),
            megaCapCount: s.integer("Number of constituents with a market cap of at least `megaCapThreshold`."),
            megaCapThreshold: s.number("Market cap, in USD, from which a company counts as mega cap."),
            medianMarketCap: s.nullable(s.number("Median constituent market cap, in USD.")),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_industries",
    description:
      "Get industries. Returns one row per industry, sorted by market cap (largest first), with the same metrics as a `GET /equities/v1/sectors` row plus the parent sector. Filter to one sector with `sector`, or to one industry with `industry`.\n\nEach row carries two weights: `weight` is the share of all tracked US equity, and `sectorWeight` is the share of the parent sector. For Technology's industries, `sectorWeight` sums to 100 while `weight` sums to Technology's own weight in the market.\n\n`rank` counts within the selected sector when `sector` is set, and across all industries otherwise. Filtering by `industry` alone keeps each row's market-wide rank.\n\nThe same industry name can exist under two sectors, so `industry` alone can return more than one row.\n\nCovers US-listed companies. All monetary values are in USD. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/industries",
      parameters: [
        { name: "sector", in: "query" },
        { name: "industry", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_industries.",
      {
        sector: s.string(
          "Only return industries in this sector, as a slug (`technology`, `financial-services`) or as its label in any case (`Financial Services`). Valid values are the `sectorSlug`s returned by `GET /equities/v1/sectors`. An unknown value returns an empty list.",
        ),
        industry: s.string(
          "Only return this industry, as a slug (`semiconductors`) or as its label in any case (`Semiconductors`). An unknown value returns an empty list.",
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              industry: s.string("Industry name as the data vendor labels it."),
              industrySlug: s.string("URL-safe industry id. Pass it as `industry` to filter."),
              sector: sectorSchema,
              sectorSlug: sectorSlugSchema,
              rank: s.integer("Position by market cap, starting at 1. See the note on ranking above."),
              weight: s.nullable(s.number("Share of all tracked US equity market cap, in percent.")),
              sectorWeight: s.nullable(s.number("Share of the parent sector's market cap, in percent.")),
              dollarVolumeShare24h: dollarVolumeShare24hSchema,
              marketCap: s.nullable(s.number("Total market cap of the constituents, in USD.")),
              marketCapChange1d: marketCapChange1dSchema,
              dollarVolume24h: dollarVolume24hSchema,
              revenueTTM: s.nullable(s.number("Total trailing twelve month revenue, in USD.")),
              earningsTTM: s.nullable(s.number("Total trailing twelve month earnings, in USD.")),
              ebitdaTTM: s.nullable(s.number("Total trailing twelve month EBITDA, in USD.")),
              enterpriseValue: s.nullable(s.number("Total enterprise value, in USD.")),
              employeeCount: employeeCountSchema,
              trailingPE: trailingPESchema,
              earningsYield: earningsYieldSchema,
              priceToRevenue: priceToRevenueSchema,
              priceToBook: priceToBookSchema,
              enterpriseValueToEbitda: enterpriseValueToEbitdaSchema,
              dividendYield: dividendYieldSchema,
              holdersYield: holdersYieldSchema,
              operatingProfitMarginTTM: operatingProfitMarginTTMSchema,
              priceChangePercentage1d: priceChangePercentage1dSchema,
              priceChangePercentage7d: priceChangePercentage7dSchema,
              priceChangePercentage1m: priceChangePercentage1mSchema,
              priceChangePercentage3m: priceChangePercentage3mSchema,
              priceChangePercentage6m: priceChangePercentage6mSchema,
              priceChangePercentageYtd: s.nullable(s.number("Cap-weighted price change since January 1, in percent.")),
              priceChangePercentage1y: priceChangePercentage1ySchema,
              companyCount: s.integer("Number of constituents."),
              coverage: coverageSchema,
              updatedAt: updatedAtSchema,
              volumeAsOf: s.nullable(s.string("When `dollarVolume24h` was taken.", { format: "date-time" })),
              topHoldings: s.array(
                "The three largest constituents by market cap.",
                s.object(
                  "Result entry returned by DeFiLlama.",
                  {
                    ticker: s.string("ticker returned by DeFiLlama."),
                    name: s.string("name returned by DeFiLlama."),
                    marketCap: s.nullable(s.number("Market cap, in USD.")),
                    sectorWeight: s.nullable(
                      s.number(
                        "Share of this industry's market cap, in percent. The name matches the sector holdings.",
                      ),
                    ),
                    priceChangePercentage1d: s.nullable(s.number("Price change over the latest session, in percent.")),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_equities_v1_earnings_calendar",
    description:
      "Get earnings calendar. Returns earnings report dates built from SEC EDGAR filings: past reports, plus the next four expected dates projected from each company's own filing history. Covers US-listed companies.\n\nThe same path serves two shapes:\n\n- **With `ticker`**: that company's full history plus its upcoming estimates.\n- **Without `ticker`**: the market-wide calendar over a rolling window from about 1 month back to about 13 months ahead. Use the `ticker` form for older history.\n\nRows are sorted by `report_date`, oldest first, so `limit` keeps the earliest matches. `?ticker=AAPL&status=estimated&limit=1` is Apple's next report.\n\nEvery row says what kind of date it is in `date_status`. A future date is `estimated`, with a `max_drift_days` range, and is not a confirmed schedule.\n\nCompany names are not included. Join on `ticker` against `GET /equities/v1/companies-list`. Requires an API plan key. Beta API; upstream fields may change.",
    route: {
      path: "/equities/v1/earnings-calendar",
      parameters: [
        { name: "ticker", in: "query" },
        { name: "from", in: "query" },
        { name: "to", in: "query" },
        { name: "status", in: "query" },
        { name: "limit", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_equities_v1_earnings_calendar.",
      {
        ticker: s.string("Stock ticker symbol (case-insensitive). When set, returns that company's full calendar."),
        from: s.string("Earliest `report_date` to include, as `YYYY-MM-DD` (inclusive).", {
          format: "date",
        }),
        to: s.string("Latest `report_date` to include, as `YYYY-MM-DD` (inclusive).", {
          format: "date",
        }),
        status: s.withEnum(
          s.string(
            "Only return rows with this `date_status` (case-insensitive). `confirmed` is accepted but nothing produces it yet, so it returns an empty list.",
          ),
          ["reported", "inferred", "confirmed", "estimated"],
        ),
        limit: {
          ...s.integer(
            "Maximum rows to return, taken from the earliest `report_date`. Positive integer; values above 20000 are capped at 20000.",
            { minimum: 1, maximum: 20000 },
          ),
          default: 20000,
        },
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              ticker: s.string("ticker returned by DeFiLlama."),
              iso2_country_code: s.string("iso2_country_code returned by DeFiLlama."),
              cik: s.string(
                "SEC CIK of the registrant that filed the row. Differs from the company's current CIK for rows inherited from a predecessor after a reorganisation.",
              ),
              event_key: s.string(
                "`<fiscal_year>-<fiscal_period>`, the row's identity. When the report arrives, its row replaces the estimate with the same key.",
              ),
              date_status: s.withEnum(
                s.string(
                  "`reported`: an earnings release (8-K Item 2.02) was filed. `inferred`: no release that quarter, so the date comes from the 10-Q or 10-K (filing-backed, but weaker). `estimated`: projected from the company's past cadence. `confirmed`: announced by the company; not produced yet.",
                ),
                ["reported", "inferred", "confirmed", "estimated"],
              ),
              report_date: s.string(
                "US Eastern date of the report, from the SEC acceptance timestamp rather than EDGAR's filing date.",
                { format: "date" },
              ),
              report_time: s.withEnum(
                s.string(
                  "`bmo`: before 09:30 ET. `dmt`: during market hours. `amc`: after 16:00 ET. `unknown`: no timestamp, as on estimates. Taken from the SEC acceptance time, not the newswire.",
                ),
                ["bmo", "dmt", "amc", "unknown"],
              ),
              accepted_at: s.string("Raw SEC acceptance timestamp, in UTC. Empty on estimates."),
              fiscal_year: s.integer("Fiscal year the quarter belongs to, named for the calendar year it ends in."),
              fiscal_period: s.withEnum(s.string("fiscal_period returned by DeFiLlama."), ["Q1", "Q2", "Q3", "Q4"]),
              period_end: s.string(
                "Last day of the fiscal period the report covers. Empty for a release whose 10-Q has not been filed yet, and for estimates projected from one.",
              ),
              source: s.withEnum(
                s.string(
                  "`8k_item_202`: an earnings release. `periodic_filing`: a 10-Q or 10-K, used when there was no release. `cadence_model`: an estimate.",
                ),
                ["8k_item_202", "periodic_filing", "cadence_model"],
              ),
              source_form: s.string(
                "SEC form the date comes from, such as `8-K`, `10-Q` or `10-K`. Empty on estimates.",
              ),
              accession_number: s.string("SEC accession number of that filing. Empty on estimates."),
              max_drift_days: s.nullable(
                s.integer(
                  "On estimates, how many days either side of `report_date` the real date may land. 96% of real dates fell inside this range when tested against past reports. Wider for small caps and short histories. `null` on filing-backed rows.",
                ),
              ),
              first_published_at: s.string("When this `event_key` was first published (`YYYY-MM-DD HH:MM:SS.sss`)."),
              revision_count: s.integer(
                "How many times the filing-backed date has moved since it was first published.",
              ),
              previous_report_date: s.string("The `report_date` before the most recent move. Empty if it never moved."),
              inserted_at: s.string("When this row was last written (`YYYY-MM-DD HH:MM:SS.sss`)."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_pre_ipo_v1_companies_list",
    description:
      "Get list of all tracked pre-IPO companies. Returns every private company in the pre-IPO registry with its latest estimated valuation and derived funding metrics. Use this to discover valid `company` ids for the other pre-IPO endpoints. Companies come back in registry order, so the list is not sorted by valuation. Requires an API plan key.",
    route: { path: "/pre-ipo/v1/companies-list", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_pre_ipo_v1_companies_list.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Snapshot envelope. `data` holds one row per tracked company.",
      {
        updatedAt: s.string("When this snapshot was generated.", { format: "date-time" }),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Company id. Pass this as the `company` query parameter on the other pre-IPO endpoints."),
              name: s.string("name returned by DeFiLlama."),
              description: s.string("description returned by DeFiLlama."),
              website: s.string("website returned by DeFiLlama."),
              sector: s.string("sector returned by DeFiLlama."),
              latestEstimatedValuation: s.nullable(
                s.number(
                  "Most recent monthly secondary-market estimate, in USD. Falls back to the latest funding round post-money valuation when no marketplace lists the company.",
                ),
              ),
              latestRaise: s.nullable(s.number("Amount raised in the most recent funding round, in USD.")),
              latestFundingValuation: s.nullable(
                s.number("Post-money valuation of the most recent funding round, in USD."),
              ),
              latestFundingDate: s.nullable(s.string("latestFundingDate returned by DeFiLlama.", { format: "date" })),
              lastValuationDate: s.nullable(
                s.string("Date of the most recent secondary mark behind `latestEstimatedValuation`.", {
                  format: "date",
                }),
              ),
              totalRaised: s.nullable(s.number("Sum of all disclosed funding rounds, in USD.")),
              valuationChange1YPercentage: s.nullable(
                s.number(
                  "Change in the secondary estimate against the same month a year earlier, in percent. `null` when the company has no secondary marks.",
                ),
              ),
              premiumVsLatestFundingPercentage: s.nullable(
                s.number(
                  "Premium of the secondary estimate over the latest round post-money valuation, in percent. `null` when the company has no secondary marks.",
                ),
              ),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_pre_ipo_v1_valuations",
    description:
      "Get valuation history for a pre-IPO company. Returns one aggregated valuation point per calendar month, oldest first. Within a month every source's marks are averaged and then the source averages are averaged, so a source that reports daily does not outvote one that reports monthly. Points are rounded to the nearest 100 and dated `YYYY-MM-01`; months with no data are skipped, and the current month is month-to-date. Requires an API plan key.",
    route: {
      path: "/pre-ipo/v1/valuations",
      parameters: [{ name: "company", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_pre_ipo_v1_valuations.",
      { company: companySchema },
      { required: ["company"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Snapshot envelope. `data` holds the monthly valuation series, oldest first.",
      {
        updatedAt: s.string("When this snapshot was generated.", { format: "date-time" }),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.string("First day of the month the point covers.", { format: "date" }),
              estimatedValuation: s.number("Aggregated valuation estimate for that month, in USD."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_pre_ipo_v1_raises",
    description:
      "Get funding rounds for a pre-IPO company. Returns disclosed funding rounds, oldest first. The same round is usually reported by several sources with different dates and amounts, so rounds are reconciled before being served: each cluster collapses to one canonical raise taking the earliest date, the median amount, the median valuation, and the highest-ranked series label. Requires an API plan key.",
    route: {
      path: "/pre-ipo/v1/raises",
      parameters: [{ name: "company", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_pre_ipo_v1_raises.",
      { company: companySchema },
      { required: ["company"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Snapshot envelope. `data` holds the reconciled funding rounds, oldest first.",
      {
        updatedAt: s.string("When this snapshot was generated.", { format: "date-time" }),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.string("Date the round was announced.", { format: "date" }),
              amountRaised: s.number("Amount raised in the round, in USD."),
              valuation: s.nullable(
                s.number("Post-money valuation of the round, in USD. `null` when no source disclosed one."),
              ),
              series: s.string("Round label, for example `Series C` or `Series H-4`."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_pre_ipo_v1_summary",
    description:
      "Get profile and latest valuation for a pre-IPO company. Returns the company profile together with its latest estimated valuation and its most recent funding round. Requires an API plan key.",
    route: {
      path: "/pre-ipo/v1/summary",
      parameters: [{ name: "company", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_pre_ipo_v1_summary.",
      { company: companySchema },
      { required: ["company"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Snapshot envelope. `data` holds the company profile.",
      {
        updatedAt: s.string("When this snapshot was generated.", { format: "date-time" }),
        data: s.object(
          "data returned by DeFiLlama.",
          {
            id: s.string("id returned by DeFiLlama."),
            name: s.string("name returned by DeFiLlama."),
            description: s.string("description returned by DeFiLlama."),
            summary: s.string("Short-form company summary. Currently identical to `description`."),
            website: s.string("website returned by DeFiLlama."),
            sector: s.string("sector returned by DeFiLlama."),
            latestEstimatedValuation: s.nullable(
              s.number(
                "Most recent monthly secondary-market estimate, in USD. Falls back to the latest funding round post-money valuation when no marketplace lists the company.",
              ),
            ),
            lastValuationDate: s.nullable(s.string("lastValuationDate returned by DeFiLlama.", { format: "date" })),
            latestRaise: s.nullable(
              s.object(
                "Most recent funding round, or `null` when no round is on record.",
                {
                  date: s.string("Date the round was announced.", { format: "date" }),
                  amountRaised: s.number("Amount raised in the round, in USD."),
                  valuation: s.nullable(
                    s.number("Post-money valuation of the round, in USD. `null` when no source disclosed one."),
                  ),
                  series: s.string("Round label, for example `Series C` or `Series H-4`."),
                },
                { required: [], additionalProperties: true },
              ),
            ),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_pre_ipo_v1_integrations",
    description:
      "Get tradeable markets for a pre-IPO company. Returns where the company can actually be traded right now: perpetual futures venues and tokenised-share issuers. A pre-IPO perp settles in stablecoins against the venue's reference price, so no shares change hands and the same company can trade at a slightly different price on every venue. This is a live snapshot refreshed hourly and no history is kept. Every company in the registry gets a response: one with no listings returns empty `perps` and `tokenIssuers` arrays rather than a miss. Requires an API plan key.",
    route: {
      path: "/pre-ipo/v1/integrations",
      parameters: [{ name: "company", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_pre_ipo_v1_integrations.",
      { company: companySchema },
      { required: ["company"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Snapshot envelope. `data` holds the live markets for the company.",
      {
        updatedAt: s.string("When this snapshot was generated.", { format: "date-time" }),
        data: s.object(
          "data returned by DeFiLlama.",
          {
            perps: s.array(
              "Perpetual futures markets tracking the company.",
              s.object(
                "Result entry returned by DeFiLlama.",
                {
                  exchangeName: s.string("exchangeName returned by DeFiLlama."),
                  platformSlug: s.string("DefiLlama slug for the venue."),
                  defillamaContract: s.string("DefiLlama market identifier, `{venue}:{pair}`."),
                  exchangeType: s.withEnum(s.string("Whether the venue is a centralised or an on-chain exchange."), [
                    "CEX",
                    "DEX",
                  ]),
                  openInterest: s.nullable(s.number("Open interest, in USD.")),
                  volume: s.nullable(s.number("24 hour volume, in USD.")),
                  price: s.number("Last traded price of the contract, in USD."),
                  annualizedFundingRate: s.nullable(
                    s.number(
                      "Annualised funding rate, in percent, so `5.2` is 5.2% a year. Negative means shorts pay longs.",
                    ),
                  ),
                  tradeUrl: s.string("tradeUrl returned by DeFiLlama."),
                  estimatedValuation: s.nullable(s.number("Company valuation implied by this venue's price, in USD.")),
                },
                { required: [], additionalProperties: true },
              ),
            ),
            tokenIssuers: s.array(
              "Tokenised exposure to the company's private shares.",
              s.object(
                "Result entry returned by DeFiLlama.",
                {
                  issuerName: s.string("The token issuer, not the private company."),
                  slug: s.nullable(s.string("DefiLlama RWA platform slug for the issuer, when it has one.")),
                  backing: s.withEnum(
                    s.string(
                      "What the token is a claim on, ordered from the most direct claim on the underlying shares to the least. `Direct shares` and `Trust-held SPV` are asset-backed and bankruptcy-remote, `SPV interest` is asset-backed but held one layer removed through a vehicle, and `Unsecured note` and `Synthetic` are not asset-backed at all.",
                    ),
                    ["Direct shares", "Trust-held SPV", "SPV interest", "Unsecured note", "Synthetic"],
                  ),
                  productUrl: s.string("productUrl returned by DeFiLlama."),
                  price: s.number("Token price, in USD."),
                  marketCap: s.nullable(
                    s.number("Market cap of the token, in USD. Only populated for issuers that publish one."),
                  ),
                  estimatedValuation: s.nullable(s.number("Company valuation implied by the token price, in USD.")),
                },
                { required: [], additionalProperties: true },
              ),
            ),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
];
