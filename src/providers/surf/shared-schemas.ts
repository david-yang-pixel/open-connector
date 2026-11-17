import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const orderSchema: JsonSchema = s.withExamples(
  s.withEnum(s.string('Sort order Default: "desc".'), ["asc", "desc"]),
  ["desc"],
);
export const financialPeriodLimitSchema: JsonSchema = s.integer("Maximum financial periods to return Default: 5.", {
  minimum: 1,
  maximum: 100,
});
export const endDateSchema: JsonSchema = s.withExamples(
  s.string("Inclusive latest period end date in YYYY-MM-DD format"),
  ["2024-12-31"],
);
export const evmWalletAddressSchema: JsonSchema = s.string(
  "Wallet address: a 0x EVM address or an ENS name (e.g. vitalik.eth). Solana addresses are not supported.",
);
export const polymarketConditionIdSchema: JsonSchema = s.withExamples(s.string("Polymarket condition ID"), [
  "0x6fefc0438c7598b23531457c8c60541990d0786bd4bd9dfc3eabc8d95c291092",
]);
export const conditionIdSchema: JsonSchema = s.withExamples(s.string("Market condition identifier"), [
  "0x6fefc0438c7598b23531457c8c60541990d0786bd4bd9dfc3eabc8d95c291092",
]);
export const fromSchema: JsonSchema = s.withExamples(
  s.string("Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)"),
  ["2024-01-01"],
);
export const metaSchema: JsonSchema = s.object(
  "Upstream response metadata, including pagination cursors, limits, and credits when supplied.",
  {},
  { required: [], additionalProperties: true },
);
export const projectSearchQuerySchema: JsonSchema = s.withExamples(
  s.string(
    "Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.",
  ),
  ["ethereum"],
);
export const dataSchema: JsonSchema = s.nullable(
  s.array("Upstream result data, preserving all provider fields.", {
    description: "Upstream result item, preserving all provider fields.",
  }),
);
export const exchangeMarketTypeSchema: JsonSchema = s.withExamples(
  s.withEnum(
    s.string('Market type: spot for spot trading, swap/perpetual/perp for perpetual contracts Default: "spot".'),
    ["spot", "swap", "perpetual", "perp"],
  ),
  ["spot"],
);
export const kalshiTickerSchema: JsonSchema = s.withExamples(
  s.string(
    "Market ticker identifier. Use GET /v1/prediction-market/kalshi/markets or GET /v1/search/prediction-market?platform=kalshi&q={keyword} to discover valid tickers.",
  ),
  ["KXBTC2026250-27JAN01-250000"],
);
export const timeRangeSchema: JsonSchema = s.withExamples(
  s.withEnum(
    s.string(
      'Window of history to return: `7d`, `30d`, `90d`, `180d`, or `1y`. This endpoint uses `time_range` only — it does NOT accept `interval`. Default: "30d".',
    ),
    ["7d", "30d", "90d", "180d", "1y"],
  ),
  ["30d"],
);
export const projectIdSchema: JsonSchema = s.withExamples(
  s.string(
    "Surf project UUID. PREFERRED — always use this when available from a previous response (e.g. project_id from /fund/portfolio or id from /search/project). Takes priority over q.",
  ),
  ["25c6612a-395c-4974-94eb-3b5f9f4b2ed7"],
);
export const objectResponseSchema: JsonSchema = s.object(
  "Surf response with the original provider envelope and fields.",
  {
    $schema: s.string("Response JSON Schema URL."),
    data: s.object(
      "Upstream result data, preserving all provider fields.",
      {},
      { required: [], additionalProperties: true },
    ),
    meta: metaSchema,
  },
  { required: [], additionalProperties: true },
);
export const arrayResponseSchema: JsonSchema = s.object(
  "Surf response with the original provider envelope and fields.",
  { $schema: s.string("Response JSON Schema URL."), data: dataSchema, meta: metaSchema },
  { required: [], additionalProperties: true },
);
export const sqlJobResponseSchema: JsonSchema = s.object(
  "Surf response with the original provider envelope and fields.",
  {
    $schema: s.string("Response JSON Schema URL."),
    data: s.object(
      "Upstream result data, preserving all provider fields.",
      {},
      { required: [], additionalProperties: true },
    ),
    meta: metaSchema,
    job_id: s.string("Asynchronous SQL job identifier, promoted from data.job_id."),
    status: s.string("Asynchronous SQL job state, promoted from data.status."),
  },
  { required: [], additionalProperties: true },
);
