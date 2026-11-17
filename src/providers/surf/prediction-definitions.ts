import type { SurfActionDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  arrayResponseSchema,
  objectResponseSchema,
  orderSchema,
  kalshiTickerSchema,
  timeRangeSchema,
  polymarketConditionIdSchema,
  conditionIdSchema,
} from "./shared-schemas.ts";
export const predictionDefinitions: SurfActionDefinition[] = [
  {
    name: "prediction_market_analytics",
    description: "Prediction Market Analytics.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/analytics",
      method: "GET",
      parameters: [
        { name: "category", in: "query", field: "category" },
        { name: "platform", in: "query", field: "platform" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "top_n", in: "query", field: "top_n" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Prediction Market Analytics.",
      {
        category: s.withEnum(s.string("Category to analyze. Omit to get platform-wide totals across all categories."), [
          "crypto",
          "culture",
          "economics",
          "financials",
          "politics",
          "stem",
          "sports",
        ]),
        platform: s.withEnum(s.string("Filter to one platform"), ["polymarket", "kalshi"]),
        time_range: s.withEnum(
          s.string(
            'Window for category trends: `7d`, `30d`, `90d`, `180d`, or `1y`. Bucket size is fixed at 1 day — this endpoint uses `time_range` only and does NOT accept `interval`. Default: "30d".',
          ),
          ["7d", "30d", "90d", "180d", "1y"],
        ),
        top_n: s.integer("Number of top markets to include Default: 10.", {
          minimum: 1,
          maximum: 50,
        }),
        sort_by: s.withEnum(s.string('Sort field for momentum markets Default: "volume_7d".'), [
          "volume_7d",
          "whale_flow_net_7d",
          "price_change_7d",
          "oi_change_7d",
        ]),
        order: s.withEnum(s.string('Sort direction Default: "desc".'), ["asc", "desc"]),
        limit: s.integer("Limit for momentum markets list Default: 20.", {
          minimum: 1,
          maximum: 100,
        }),
        offset: s.integer("Pagination offset for momentum markets Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "prediction_market_correlations",
    description: "Market Correlations.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/correlations",
      method: "GET",
      parameters: [
        { name: "category", in: "query", field: "category" },
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "min_correlation", in: "query", field: "min_correlation" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Market Correlations.",
      {
        category: s.withEnum(s.string("Category (correlations are within-category only)"), [
          "crypto",
          "culture",
          "economics",
          "financials",
          "politics",
          "stem",
          "sports",
        ]),
        condition_id: s.string("Filter to pairs involving this market"),
        min_correlation: s.number("Minimum absolute correlation Default: 0.5."),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: ["category"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_events",
    description: "Kalshi Events.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/events",
      method: "GET",
      parameters: [
        { name: "event_ticker", in: "query", field: "event_ticker" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Events.",
      {
        event_ticker: s.withExamples(
          s.string(
            "Event ticker identifier. When omitted, returns top active events by volume. Use GET /v1/search/prediction-market?platform=kalshi&q={keyword} to discover valid tickers.",
          ),
          ["KXBTC2026250-27JAN01"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_markets",
    description: "Kalshi Markets.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/markets",
      method: "GET",
      parameters: [
        { name: "market_ticker", in: "query", field: "market_ticker" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Markets.",
      {
        market_ticker: s.withExamples(
          s.string(
            "Market ticker identifier. When omitted, returns top active markets by volume. Use GET /v1/search/prediction-market?platform=kalshi&q={keyword} to discover valid tickers.",
          ),
          ["KXBTC2026250-27JAN01-250000"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_open_interest",
    description: "Kalshi Open Interest History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/open-interest",
      method: "GET",
      parameters: [
        { name: "ticker", in: "query", field: "ticker" },
        { name: "time_range", in: "query", field: "time_range" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Open Interest History.",
      { ticker: kalshiTickerSchema, time_range: timeRangeSchema },
      { required: ["ticker"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_orderbooks",
    description: "Kalshi Orderbook History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/orderbooks",
      method: "GET",
      parameters: [
        { name: "ticker", in: "query", field: "ticker" },
        { name: "start_time", in: "query", field: "start_time" },
        { name: "end_time", in: "query", field: "end_time" },
        { name: "limit", in: "query", field: "limit" },
        { name: "pagination_key", in: "query", field: "pagination_key" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Orderbook History.",
      {
        ticker: s.withExamples(s.string("Kalshi market ticker"), ["KXCITRINI-28JUL01"]),
        start_time: s.integer("Start time in Unix milliseconds. 0 means 7 days ago."),
        end_time: s.integer("End time in Unix milliseconds. 0 means current time."),
        limit: s.integer("Maximum number of snapshots to return Default: 100.", {
          minimum: 1,
          maximum: 200,
        }),
        pagination_key: s.string("Base64 cursor for pagination"),
      },
      { required: ["ticker"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        pagination: s.object("Upstream pagination metadata.", {}, { required: [], additionalProperties: true }),
        snapshots: s.nullable(
          s.array("Order book snapshots.", {
            description: "Upstream result item, preserving all provider fields.",
          }),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "kalshi_prices",
    description: "Kalshi Price History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/prices",
      method: "GET",
      parameters: [
        { name: "ticker", in: "query", field: "ticker" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "interval", in: "query", field: "interval" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Price History.",
      {
        ticker: kalshiTickerSchema,
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of history to return: `7d`, `30d`, `90d`, `180d`, or `1y`. Ignored when `interval=latest`. Distinct from `interval` (which sets bucket size within the window). Default: "30d".',
            ),
            ["7d", "30d", "90d", "180d", "1y"],
          ),
          ["30d"],
        ),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Bucket size for each point in the series: `1h` (hourly OHLC), `1d` (daily OHLC), or `latest` (single most-recent trade price). Distinct from `time_range` (window size). Default: "1d".',
            ),
            ["1h", "1d", "latest"],
          ),
          ["1d"],
        ),
      },
      { required: ["ticker"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_trades",
    description: "Kalshi Trades.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/trades",
      method: "GET",
      parameters: [
        { name: "ticker", in: "query", field: "ticker" },
        { name: "taker_side", in: "query", field: "taker_side" },
        { name: "min_amount", in: "query", field: "min_amount" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Trades.",
      {
        ticker: kalshiTickerSchema,
        taker_side: s.withEnum(s.string("Filter by taker side: `yes` or `no`"), ["yes", "no"]),
        min_amount: s.integer("Minimum notional volume in USD (each contract = $1)", {
          minimum: 0,
        }),
        from: s.string("Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)"),
        to: s.string("End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)"),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "timestamp".'), ["timestamp", "notional_volume_usd"]),
          ["timestamp"],
        ),
        order: orderSchema,
        limit: s.withExamples(s.integer("Results per page Default: 50.", { minimum: 1, maximum: 500 }), [50]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["ticker"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "kalshi_volumes",
    description: "Kalshi Volume History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/kalshi/volumes",
      method: "GET",
      parameters: [
        { name: "ticker", in: "query", field: "ticker" },
        { name: "time_range", in: "query", field: "time_range" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Kalshi Volume History.",
      { ticker: kalshiTickerSchema, time_range: timeRangeSchema },
      { required: ["ticker"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "matching_market_daily",
    description: "Cross-Platform Daily Comparison (Polymarket <> Kalshi).",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/matching/daily",
      method: "GET",
      parameters: [
        { name: "polymarket_condition_id", in: "query", field: "polymarket_condition_id" },
        { name: "kalshi_market_ticker", in: "query", field: "kalshi_market_ticker" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Cross-Platform Daily Comparison (Polymarket <> Kalshi).",
      {
        polymarket_condition_id: polymarketConditionIdSchema,
        kalshi_market_ticker: s.withExamples(s.string("Kalshi market ticker"), ["KXBTC2026250-27JAN01-250000"]),
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of daily data to return: `1d`, `7d`, `30d`, `90d`, `180d`, `1y`, or `all`. Bucket size is fixed at 1 day — this endpoint uses `time_range` only and does NOT accept `interval`. Default: "30d".',
            ),
            ["1d", "7d", "30d", "90d", "180d", "1y", "all"],
          ),
          ["30d"],
        ),
        limit: s.withExamples(s.integer("Maximum rows Default: 200.", { minimum: 1, maximum: 10000 }), [200]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      {
        required: ["polymarket_condition_id", "kalshi_market_ticker"],
        additionalProperties: false,
      },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "matching_market_pairs",
    description: "Cross-Platform Prediction Market Matcher (Polymarket <> Kalshi).",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/matching/pairs",
      method: "GET",
      parameters: [
        { name: "category", in: "query", field: "category" },
        { name: "match_type", in: "query", field: "match_type" },
        { name: "active_only", in: "query", field: "active_only" },
        { name: "min_confidence", in: "query", field: "min_confidence" },
        { name: "polymarket_condition_id", in: "query", field: "polymarket_condition_id" },
        { name: "kalshi_market_ticker", in: "query", field: "kalshi_market_ticker" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Cross-Platform Prediction Market Matcher (Polymarket <> Kalshi).",
      {
        category: s.withExamples(
          s.withEnum(s.string("Filter by category"), [
            "crypto",
            "culture",
            "economics",
            "financials",
            "politics",
            "stem",
            "sports",
          ]),
          ["politics"],
        ),
        match_type: s.withExamples(s.withEnum(s.string("Filter by match type"), ["exact", "related"]), ["exact"]),
        active_only: s.boolean("Only return pairs where both markets are currently active Default: false."),
        min_confidence: s.integer("Minimum confidence score (0-100) Default: 0.", {
          minimum: 0,
          maximum: 100,
        }),
        polymarket_condition_id: s.string("Find match for this Polymarket market"),
        kalshi_market_ticker: s.string("Find match for this Kalshi market"),
        sort_by: s.withEnum(s.string('Sort field Default: "confidence".'), [
          "confidence",
          "polymarket_volume",
          "kalshi_volume",
          "spread_pct",
        ]),
        order: s.withEnum(s.string('Sort order Default: "desc".'), ["asc", "desc"]),
        limit: s.withExamples(s.integer("Maximum rows to return Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_events",
    description: "Polymarket Events.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/events",
      method: "GET",
      parameters: [
        { name: "event_slug", in: "query", field: "event_slug" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Events.",
      {
        event_slug: s.withExamples(
          s.string(
            "Polymarket event slug (identifies a multi-outcome question with several nested markets). Known World Cup match sibling slugs are expanded to the canonical match group. Discover slugs via /v1/search/prediction-market?platform=polymarket&q={keyword}. For a single Yes/No market, use /polymarket/markets with market_slug instead — this endpoint only accepts event_slug, not market_slug.",
          ),
          ["what-price-will-bitcoin-hit-before-2027"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["event_slug"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_leaderboard",
    description: "Polymarket Leaderboard.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/leaderboard",
      method: "GET",
      parameters: [
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Leaderboard.",
      {
        sort_by: s.withEnum(s.string('Ranking metric Default: "pnl".'), ["pnl", "volume", "trade_count"]),
        order: s.withEnum(s.string('Sort direction Default: "desc".'), ["asc", "desc"]),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_markets",
    description: "Polymarket Markets.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/markets",
      method: "GET",
      parameters: [
        { name: "market_slug", in: "query", field: "market_slug" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Markets.",
      {
        market_slug: s.withExamples(
          s.string(
            "Polymarket market slug (identifies a single Yes/No outcome). Discover slugs via /v1/search/prediction-market?platform=polymarket&q={keyword}. For a multi-outcome question (e.g. 'who wins the 2024 election'), use the /polymarket/events endpoint with event_slug instead.",
          ),
          [
            "will-bitcoin-dip-to-45000-by-december-31-2026-674-923-755-971-998-525-926-245-316-517-544-589-965-923-986-841-815-224",
          ],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["market_slug"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_open_interest",
    description: "Polymarket Open Interest History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/open-interest",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "time_range", in: "query", field: "time_range" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Open Interest History.",
      { condition_id: conditionIdSchema, time_range: timeRangeSchema },
      { required: ["condition_id"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_orderbooks",
    description: "Polymarket Orderbook History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/orderbooks",
      method: "GET",
      parameters: [
        { name: "token_id", in: "query", field: "token_id" },
        { name: "start_time", in: "query", field: "start_time" },
        { name: "end_time", in: "query", field: "end_time" },
        { name: "limit", in: "query", field: "limit" },
        { name: "pagination_key", in: "query", field: "pagination_key" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Orderbook History.",
      {
        token_id: s.withExamples(s.string("Token identifier"), [
          "73662070458561467734997715458900555626841827840002814944742182699282770895284",
        ]),
        start_time: s.integer("Start time in Unix milliseconds. 0 means 7 days ago."),
        end_time: s.integer("End time in Unix milliseconds. 0 means current time."),
        limit: s.integer("Maximum number of snapshots to return Default: 100.", {
          minimum: 1,
          maximum: 200,
        }),
        pagination_key: s.string("Base64 cursor for pagination"),
      },
      { required: ["token_id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        pagination: s.object("Upstream pagination metadata.", {}, { required: [], additionalProperties: true }),
        snapshots: s.nullable(
          s.array("Order book snapshots.", {
            description: "Upstream result item, preserving all provider fields.",
          }),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "polymarket_positions",
    description: "Polymarket Wallet Positions.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/positions",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Wallet Positions.",
      {
        address: s.withExamples(s.string("Polymarket proxy wallet address"), [
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        ]),
        limit: s.withExamples(s.integer("Results per page Default: 50.", { minimum: 1, maximum: 100 }), [50]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_price_ohlcv",
    description: "Polymarket OHLCV Candlesticks.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/price-ohlcv/{condition_id}",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "path", field: "condition_id" },
        { name: "start_time", in: "query", field: "start_time" },
        { name: "end_time", in: "query", field: "end_time" },
        { name: "interval", in: "query", field: "interval" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket OHLCV Candlesticks.",
      {
        condition_id: polymarketConditionIdSchema,
        start_time: s.integer(
          "Start time (Unix seconds). 0 means no lower bound. Cache aligns to 5-minute buckets, so two requests within the same bucket return the same cached result.",
          { minimum: 0 },
        ),
        end_time: s.integer(
          "End time (Unix seconds). 0 means current time. Cache aligns to 5-minute buckets, so two requests within the same bucket return the same cached result.",
          { minimum: 0 },
        ),
        interval: s.integer("Candle interval in minutes: 1=1min, 60=1hour, 1440=1day Default: 60.", {
          minimum: 1,
          maximum: 1440,
        }),
      },
      { required: ["condition_id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        candles: s.nullable(
          s.array("OHLCV candles.", {
            description: "Upstream result item, preserving all provider fields.",
          }),
        ),
        condition_id: s.string("Market condition identifier."),
        interval: s.integer("Returned time interval."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "polymarket_prices",
    description: "Polymarket Price History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/prices",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "interval", in: "query", field: "interval" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Price History.",
      {
        condition_id: conditionIdSchema,
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of history to return (how much data, from now backward): `7d`, `30d`, `90d`, `180d`, or `1y`. Ignored when `interval=latest`. Distinct from `interval` (which sets bucket size within this window). Default: "30d".',
            ),
            ["7d", "30d", "90d", "180d", "1y"],
          ),
          ["30d"],
        ),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Bucket size for each point in the returned series: `1h` (hourly), `1d` (daily), or `latest` (single most-recent snapshot). Distinct from `time_range` (which sets the window size). Default: "1d".',
            ),
            ["1h", "1d", "latest"],
          ),
          ["1d"],
        ),
      },
      { required: ["condition_id"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_smart_money",
    description: "Polymarket Smart Money.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/smart-money",
      method: "GET",
      parameters: [
        { name: "view", in: "query", field: "view" },
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "category", in: "query", field: "category" },
        { name: "direction", in: "query", field: "direction" },
        { name: "whale_tier", in: "query", field: "whale_tier" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Smart Money.",
      {
        view: s.withEnum(
          s.string(
            'positioning = aggregate smart wallet direction per market; trades = individual $10K+ trades with wallet metadata Default: "positioning".',
          ),
          ["positioning", "trades"],
        ),
        condition_id: s.string("Filter to a specific market (omit to browse all)"),
        category: s.withEnum(s.string("Filter by category"), [
          "crypto",
          "culture",
          "economics",
          "financials",
          "politics",
          "stem",
          "sports",
        ]),
        direction: s.withEnum(s.string("Filter by net smart money direction (only for view=positioning)"), [
          "bullish",
          "bearish",
          "neutral",
        ]),
        whale_tier: s.withEnum(s.string("Trade size tier filter (only for view=trades)"), ["whale", "large", "mega"]),
        from: s.string("Start time as Unix seconds or date string (only for view=trades)"),
        to: s.string("End time as Unix seconds or date string (only for view=trades)"),
        sort_by: s.withEnum(s.string('Sort field Default: "smart_wallets_involved".'), [
          "smart_wallets_involved",
          "smart_buy_volume_usd",
          "smart_sell_volume_usd",
          "amount_usd",
          "block_time",
        ]),
        order: s.withEnum(s.string('Sort direction Default: "desc".'), ["asc", "desc"]),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_trades",
    description: "Polymarket Trades.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/trades",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "address", in: "query", field: "address" },
        { name: "type", in: "query", field: "type" },
        { name: "outcome_label", in: "query", field: "outcome_label" },
        { name: "min_amount", in: "query", field: "min_amount" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Trades.",
      {
        condition_id: conditionIdSchema,
        address: s.string("Wallet address — returns trades where the address is maker or taker"),
        type: s.withEnum(
          s.string(
            'Filter by activity type: `trade` (default, spot trades only), `redemption` (splits/merges/redemptions), or `all` (all activity). Use `redemption` or `all` to get non-trade wallet activity; `address` is required for these types. Default: "trade".',
          ),
          ["trade", "redemption", "all"],
        ),
        outcome_label: s.withEnum(s.string("Filter by outcome label: `Yes` or `No`"), ["Yes", "No"]),
        min_amount: s.number("Minimum trade amount in USD", { minimum: 0 }),
        from: s.string("Start of time range. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)"),
        to: s.string("End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)"),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "timestamp".'), ["timestamp", "notional_volume_usd"]),
          ["timestamp"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 50.", { minimum: 1, maximum: 500 }), [50]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "polymarket_volume_split",
    description: "Polymarket Volume Split (YES/NO).",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/volume-split/{condition_id}",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "path", field: "condition_id" },
        { name: "granularity", in: "query", field: "granularity" },
        { name: "start_time", in: "query", field: "start_time" },
        { name: "end_time", in: "query", field: "end_time" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Volume Split (YES/NO).",
      {
        condition_id: polymarketConditionIdSchema,
        granularity: s.withEnum(s.string('Time granularity for volume aggregation Default: "hour".'), [
          "hour",
          "day",
          "week",
        ]),
        start_time: s.integer(
          "Start time (Unix seconds). 0 means no lower bound. Cache aligns to 5-minute buckets, so two requests within the same bucket return the same cached result.",
          { minimum: 0 },
        ),
        end_time: s.integer(
          "End time (Unix seconds). 0 means current time. Cache aligns to 5-minute buckets, so two requests within the same bucket return the same cached result.",
          { minimum: 0 },
        ),
      },
      { required: ["condition_id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        condition_id: s.string("Market condition identifier."),
        data_points: s.nullable(
          s.array("Number of returned data points.", {
            description: "Upstream result item, preserving all provider fields.",
          }),
        ),
        end_time: s.integer("Returned window end time."),
        granularity: s.string("Returned aggregation granularity."),
        start_time: s.integer("Returned window start time."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "polymarket_volumes",
    description: "Polymarket Volume History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/prediction-market/polymarket/volumes",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "token_id", in: "query", field: "token_id" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "interval", in: "query", field: "interval" },
        { name: "granularity", in: "query", field: "granularity" },
        { name: "start_time", in: "query", field: "start_time" },
        { name: "end_time", in: "query", field: "end_time" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Polymarket Volume History.",
      {
        condition_id: s.withExamples(s.string("Market condition identifier (required if token_id not provided)"), [
          "0x6fefc0438c7598b23531457c8c60541990d0786bd4bd9dfc3eabc8d95c291092",
        ]),
        token_id: s.string("Token ID (alternative identifier, resolved to condition_id internally)"),
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of history to return (how much data, from now backward): `7d`, `30d`, `90d`, `180d`, or `1y`. Distinct from `interval` (which sets bucket size within the window). Default: "30d".',
            ),
            ["7d", "30d", "90d", "180d", "1y"],
          ),
          ["30d"],
        ),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Bucket size for each point in the returned series: `1h` (hourly) or `1d` (daily). Distinct from `time_range` (which sets the window size). Default: "1d".',
            ),
            ["1h", "1d"],
          ),
          ["1d"],
        ),
        granularity: s.withEnum(
          s.string(
            "Aggregation granularity (alternative to interval). When provided, queries daily table with buy/sell volume breakdown.",
          ),
          ["day", "week", "month", "year", "all"],
        ),
        start_time: s.integer("Start time as Unix seconds (alternative to time_range)"),
        end_time: s.integer("End time as Unix seconds (alternative to time_range)"),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
];
