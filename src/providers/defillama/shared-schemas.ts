import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const dividendYieldSchema: JsonSchema = s.nullable(
  s.number("100 × total TTM dividends / total market cap, in percent."),
);
export const priceChangePercentage1ySchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the last year, in percent."),
);
export const priceChangePercentage7dSchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the last 7 days, in percent."),
);
export const priceChangePercentage1mSchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the last 30 days, in percent."),
);
export const coinsSchema: JsonSchema = s.string("set of comma-separated tokens defined as {chain}:{address}", {
  minLength: 1,
});
export const sectorSlugSchema: JsonSchema = s.string(
  "URL-safe sector id. Pass it as `sector` to the other equities endpoints.",
);
export const priceToRevenueSchema: JsonSchema = s.nullable(
  s.number("Aggregate price to sales: total market cap / total TTM revenue."),
);
export const enterpriseValueToEbitdaSchema: JsonSchema = s.nullable(
  s.number("Aggregate EV/EBITDA: total enterprise value / total TTM EBITDA."),
);
export const pricePerShareSchema: JsonSchema = s.nullable(
  s.number("Pool token price per share for vault-style pools; null otherwise"),
);
export const confidenceSchema: JsonSchema = s.number(
  "Confidence score between 0 and 1 indicating the reliability of the price.",
);
export const rangeSchema: JsonSchema = s.withEnum(s.string("History window; defaults to max (the full series)"), [
  "30d",
  "90d",
  "max",
]);
export const updatedAtSchema: JsonSchema = s.nullable(
  s.string("Most recent quote time across the constituents.", { format: "date-time" }),
);
export const decimalsSchema: JsonSchema = s.number(
  "Token decimals. Omitted for coingecko-native assets (e.g. coingecko:ethereum).",
);
export const protocolEntrySchema: JsonSchema = s.object(
  "Result entry returned by DeFiLlama.",
  {},
  { required: [], additionalProperties: true },
);
export const totalSchema: JsonSchema = s.nullable(
  s.number("base minus reward, in percent; negative means the borrower is net paid"),
);
export const priceChangePercentage3mSchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the last 3 calendar months, in percent."),
);
export const priceChangePercentage6mSchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the last 6 calendar months, in percent."),
);
export const rewardSchema: JsonSchema = s.nullable(
  s.number("APY in percent from incentive token emissions; null when there are none"),
);
export const dollarVolumeShare24hSchema: JsonSchema = s.nullable(
  s.number("Share of all tracked US value traded in the latest session, in percent."),
);
export const priceToBookSchema: JsonSchema = s.nullable(
  s.number("Aggregate price to book: total market cap / total shareholders' equity."),
);
export const priceChangePercentage1dSchema: JsonSchema = s.nullable(
  s.number("Cap-weighted price change over the latest session, in percent (`0.86` is +0.86%)."),
);
export const linkedProtocolsSchema: JsonSchema = s.array(
  "Linked protocols",
  s.string("Result entry returned by DeFiLlama."),
);
export const chainSchema: JsonSchema = s.string(
  "chain slug, you can get these from /chains or the chains property on /protocols",
  { minLength: 1 },
);
export const amountSchema: JsonSchema = s.nullable(
  s.string("Raw base units of `denomination`, as a decimal string; parse with BigInt, not Number."),
);
export const employeeCountSchema: JsonSchema = s.nullable(
  s.number("Total employees across the constituents that report a headcount. `null` when none do."),
);
export const usdSchema: JsonSchema = s.nullable(
  s.number("Capacity in USD. Null when `denomination` is, since the conversion needs its decimals."),
);
export const categoriesValueSchema: JsonSchema = s.array(
  "Value for this key.",
  s.string("Result entry returned by DeFiLlama."),
);
export const githubSchema: JsonSchema = s.array("GitHub repositories", s.string("Result entry returned by DeFiLlama."));
export const categorySchema: JsonSchema = s.string(
  "category slug (slugified category name, e.g. 'dexs', 'prediction-market', 'options')",
  { minLength: 1 },
);
export const dataTypeSchema: JsonSchema = s.withEnum(s.string("Desired data type, dailyNotionalVolume by default."), [
  "dailyPremiumVolume",
  "dailyNotionalVolume",
]);
export const companySchema: JsonSchema = s.string(
  "Company id from `GET /pre-ipo/v1/companies-list` (case-insensitive). The display `name` is not accepted.",
);
export const operatingProfitMarginTTMSchema: JsonSchema = s.nullable(
  s.number("Total TTM operating income / total TTM revenue, in percent. Weighted by revenue, not market cap."),
);
export const chainsSchema: JsonSchema = s.array(
  "chains returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
const labelsSchema: JsonSchema = s.array(
  "labels returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
export const allChainsSchema: JsonSchema = s.array(
  "allChains returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
export const chartBreakdownValuesSchema: JsonSchema = s.object(
  "Value for this key.",
  {},
  { required: [], additionalProperties: s.number("Value for this key.") },
);
const assetIssuersSchema: JsonSchema = s.array(
  "assetIssuers returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
export const leadInvestorsSchema: JsonSchema = s.array(
  "leadInvestors returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
export const totalDataChartSchema: JsonSchema = s.array(
  "totalDataChart returned by DeFiLlama.",
  s.array("Result entry returned by DeFiLlama.", {}),
);
export const otherInvestorsSchema: JsonSchema = s.array(
  "otherInvestors returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama."),
);
export const sectorSchema: JsonSchema = s.string(
  "Sector name as the data vendor labels it (not GICS). Companies the vendor left unclassified roll up into `Unknown`.",
);
export const marketCapChange1dSchema: JsonSchema = s.nullable(
  s.number(
    "Change in total market cap over the latest session, in USD. Reconciles exactly with `priceChangePercentage1d`.",
  ),
);
export const valuesEntrySchema: JsonSchema = s.array(
  "Result entry returned by DeFiLlama.",
  s.nullable(s.number("Result entry returned by DeFiLlama.")),
);
export const totalDataChartBreakdownSchema: JsonSchema = s.array(
  "totalDataChartBreakdown returned by DeFiLlama.",
  s.array("Result entry returned by DeFiLlama.", {}),
);
export const holdersYieldSchema: JsonSchema = s.nullable(
  s.number(
    "100 × total TTM holders' revenue (dividends plus buybacks, net of share issuance) / total market cap, in percent.",
  ),
);
export const breakdownSchema: JsonSchema = s.object(
  "breakdown returned by DeFiLlama.",
  {},
  { required: [], additionalProperties: s.string("Value for this key.") },
);
export const chainTvlsSchema: JsonSchema = s.object(
  "chainTvls returned by DeFiLlama.",
  {},
  { required: [], additionalProperties: s.number("Value for this key.") },
);
export const periodEndingSchema: JsonSchema = s.array(
  "periodEnding returned by DeFiLlama.",
  s.string("Result entry returned by DeFiLlama.", { format: "date" }),
);
export const countrySchema: JsonSchema = s.string(
  "Two-letter country code (ISO 3166-1 alpha-2) for the company, as returned by `GET /equities/v1/companies-list` (case-insensitive).",
);
export const currentChainTvlsSchema: JsonSchema = s.object(
  "currentChainTvls returned by DeFiLlama.",
  {},
  { required: [], additionalProperties: s.number("Value for this key.") },
);
export const childProtocolsSchema: JsonSchema = s.array("Child protocols", protocolEntrySchema);
const dataEntrySchema: JsonSchema = s.array(
  "Result entry returned by DeFiLlama.",
  s.number("Result entry returned by DeFiLlama."),
  { minItems: 2, maxItems: 2 },
);
export const unstructuredChartResponseSchema: JsonSchema = s.object(
  "DeFiLlama result.",
  { data: s.array("DeFiLlama response.", {}) },
  { required: ["data"], additionalProperties: true },
);
export const earningsYieldSchema: JsonSchema = s.nullable(
  s.number(
    "100 × total TTM earnings / total market cap, in percent. Signed, so it stays defined when `trailingPE` is `null` for a loss-making group.",
  ),
);
export const trailingPESchema: JsonSchema = s.nullable(
  s.number(
    "Aggregate price to earnings: total market cap / total TTM earnings. `null` when total earnings are zero or negative; use `earningsYield` then.",
  ),
);
export const totalCirculatingSchema: JsonSchema = s.object(
  "totalCirculating returned by DeFiLlama.",
  { peggedUSD: s.number("peggedUSD returned by DeFiLlama.") },
  { required: [], additionalProperties: true },
);
export const dollarVolume24hSchema: JsonSchema = s.nullable(
  s.number(
    "Value traded in the latest session (shares traded × price, summed), in USD. Reads low while a session is still open; `volumeAsOf` says when it was taken.",
  ),
);
export const metricSchema: JsonSchema = s.withEnum(s.string("The dimension metric type", { minLength: 1 }), [
  "fees",
  "liquidations",
  "dexs",
  "derivatives",
  "options",
  "aggregators",
  "bridge-aggregators",
  "open-interest",
  "normalized-volume",
  "active-users",
]);
export const valuesSchema: JsonSchema = s.array("values returned by DeFiLlama.", valuesEntrySchema);
const dataSchema: JsonSchema = s.array("DeFiLlama response.", dataEntrySchema);
export const annualValueSchema: JsonSchema = s.object(
  "Value for this key.",
  { labels: labelsSchema },
  { required: [], additionalProperties: true },
);
export const keySchema: JsonSchema = s.withEnum(
  s.string(
    'Metric to return. Omit for default TVL. Use "all" for the sum of tvl+borrowed+staking+pool2+vesting, or a specific metric like "staking", "borrowed", "vesting", "pool2".',
  ),
  ["all", "staking", "borrowed", "vesting", "pool2"],
);
export const childrenValueSchema: JsonSchema = s.object(
  "Value for this key.",
  { values: valuesSchema },
  { required: [], additionalProperties: true },
);
export const timeSeriesResponseSchema: JsonSchema = s.object(
  "DeFiLlama result.",
  { data: dataSchema },
  { required: ["data"], additionalProperties: true },
);
export const underlyingTokensEntrySchema: JsonSchema = s.object(
  "Result entry returned by DeFiLlama.",
  {
    address: s.string("address returned by DeFiLlama."),
    symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
    decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
  },
  { required: [], additionalProperties: true },
);
export const sourcePoolSchema: JsonSchema = s.object(
  "source_pool returned by DeFiLlama.",
  {
    id: s.string("Earn pool the intrinsic yield is sourced from"),
    pool_token: s.string("Address of the yield-bearing token"),
    symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
  },
  { required: [], additionalProperties: true },
);
export const coverageSchema: JsonSchema = s.object(
  "Share of the constituents' market cap that supplied each metric's inputs, from 0 to 1, keyed by metric name. A ratio is served as `null` when its coverage is below 0.6, rather than as a figure computed over the wrong subset.",
  {},
  {
    required: [],
    additionalProperties: s.number("Value for this key.", { minimum: 0, maximum: 1 }),
  },
);
export const breakdownChartResponseSchema: JsonSchema = s.object(
  "DeFiLlama result.",
  {
    data: s.array(
      "DeFiLlama response.",
      s.object(
        "Result entry returned by DeFiLlama.",
        { timestamp: s.number("Unix timestamp") },
        { required: [], additionalProperties: s.number("Value for this key.") },
      ),
    ),
  },
  { required: ["data"], additionalProperties: true },
);
export const currentSchema: JsonSchema = s.object(
  "Latest observed values",
  {
    base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
    reward: rewardSchema,
    total: s.nullable(s.number("base plus reward, in percent")),
  },
  { required: [], additionalProperties: true },
);
export const avg7dSchema: JsonSchema = s.object(
  "Trailing 7-day average",
  {
    base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
    reward: rewardSchema,
    total: s.nullable(s.number("base plus reward, in percent")),
  },
  { required: [], additionalProperties: true },
);
export const avg30dSchema: JsonSchema = s.object(
  "Trailing 30-day average",
  {
    base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
    reward: rewardSchema,
    total: s.nullable(s.number("base plus reward, in percent")),
  },
  { required: [], additionalProperties: true },
);
export const childrenSchema: JsonSchema = s.object(
  "children returned by DeFiLlama.",
  {},
  { required: [], additionalProperties: childrenValueSchema },
);
const governanceOnlySchema: JsonSchema = s.object(
  "governanceOnly returned by DeFiLlama.",
  {
    onChainMcap: s.number("onChainMcap returned by DeFiLlama."),
    activeMcap: s.number("activeMcap returned by DeFiLlama."),
    defiActiveTvl: s.number("defiActiveTvl returned by DeFiLlama."),
    assetCount: s.integer("assetCount returned by DeFiLlama."),
    assetIssuers: assetIssuersSchema,
  },
  { required: [], additionalProperties: true },
);
const stablecoinsOnlySchema: JsonSchema = s.object(
  "stablecoinsOnly returned by DeFiLlama.",
  {
    onChainMcap: s.number("onChainMcap returned by DeFiLlama."),
    activeMcap: s.number("activeMcap returned by DeFiLlama."),
    defiActiveTvl: s.number("defiActiveTvl returned by DeFiLlama."),
    assetCount: s.integer("assetCount returned by DeFiLlama."),
    assetIssuers: assetIssuersSchema,
  },
  { required: [], additionalProperties: true },
);
const stablecoinsAndGovernanceSchema: JsonSchema = s.object(
  "stablecoinsAndGovernance returned by DeFiLlama.",
  {
    onChainMcap: s.number("onChainMcap returned by DeFiLlama."),
    activeMcap: s.number("activeMcap returned by DeFiLlama."),
    defiActiveTvl: s.number("defiActiveTvl returned by DeFiLlama."),
    assetCount: s.integer("assetCount returned by DeFiLlama."),
    assetIssuers: assetIssuersSchema,
  },
  { required: [], additionalProperties: true },
);
export const apySchema: JsonSchema = s.object(
  "Intrinsic APY in percent",
  {
    current: s.object(
      "Latest observed value",
      { base: s.nullable(s.number("base returned by DeFiLlama.")) },
      { required: [], additionalProperties: true },
    ),
    avg_7d: s.object(
      "Trailing 7-day average",
      { base: s.nullable(s.number("base returned by DeFiLlama.")) },
      { required: [], additionalProperties: true },
    ),
    avg_30d: s.object(
      "Trailing 30-day average",
      { base: s.nullable(s.number("base returned by DeFiLlama.")) },
      { required: [], additionalProperties: true },
    ),
  },
  { required: [], additionalProperties: true },
);
const baseSchema: JsonSchema = s.object(
  "Default RWA bucket. The chain table uses this bucket unless stablecoins or governance assets are explicitly included.",
  {
    onChainMcap: s.number("onChainMcap returned by DeFiLlama."),
    activeMcap: s.number("activeMcap returned by DeFiLlama."),
    defiActiveTvl: s.number("defiActiveTvl returned by DeFiLlama."),
    assetCount: s.integer("assetCount returned by DeFiLlama."),
    assetIssuers: assetIssuersSchema,
  },
  { required: [], additionalProperties: true },
);
export const byChainValueSchema: JsonSchema = s.object(
  "Value for this key.",
  {
    base: baseSchema,
    stablecoinsOnly: stablecoinsOnlySchema,
    governanceOnly: governanceOnlySchema,
    stablecoinsAndGovernance: stablecoinsAndGovernanceSchema,
  },
  { required: [], additionalProperties: true },
);
