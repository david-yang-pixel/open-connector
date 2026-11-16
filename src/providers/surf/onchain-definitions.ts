import type { SurfActionDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  arrayResponseSchema,
  dataSchema,
  metaSchema,
  objectResponseSchema,
  evmWalletAddressSchema,
  fromSchema,
  sqlJobResponseSchema,
} from "./shared-schemas.ts";
export const onchainDefinitions: SurfActionDefinition[] = [
  {
    name: "hyperliquid_account",
    description: "Account Portfolio.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/account",
      method: "GET",
      parameters: [{ name: "address", in: "query", field: "address" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Account Portfolio.",
      { address: evmWalletAddressSchema },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "hyperliquid_candles",
    description: "Market Candles.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/candles",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "interval", in: "query", field: "interval" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Market Candles.",
      {
        symbol: s.withExamples(
          s.string(
            "Hyperliquid market id (for example BTC, kPEPE, xyz:GOLD, the canonical PURR/USDC spot pair, or an @index spot market).",
          ),
          ["SOL"],
        ),
        interval: s.withExamples(
          s.withEnum(s.string('Candle granularity. Default: "4h".'), [
            "1m",
            "3m",
            "5m",
            "15m",
            "30m",
            "1h",
            "2h",
            "4h",
            "8h",
            "12h",
            "1d",
            "3d",
            "1w",
            "1M",
          ]),
          ["4h"],
        ),
        from: s.withExamples(s.string("Window start (Unix seconds, an ISO datetime, or a bare UTC date)."), [
          "2026-05-16",
        ]),
        to: s.withExamples(
          s.string(
            "Window end (Unix seconds, an ISO datetime, or a bare UTC date; a bare date means the end of that day).",
          ),
          ["2026-05-19"],
        ),
      },
      { required: ["symbol", "from", "to"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "hyperliquid_fills",
    description: "Fills.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/fills",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "to_ms", in: "query", field: "to_ms" },
        { name: "to_fill_id", in: "query", field: "to_fill_id" },
        { name: "order", in: "query", field: "order" },
        { name: "cursor", in: "query", field: "cursor" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fills.",
      {
        address: evmWalletAddressSchema,
        from: s.withExamples(
          s.string(
            "Window start (Unix seconds or a date). With the default order=desc, results cover the window forward from this point and are capped at ~2000 of the earliest fills in range (narrow the range to see the most-recent fills). With order=asc this is the start of a complete-history walk: follow meta.next_cursor to page through every fill in the window with no cap.",
          ),
          ["2026-03-01"],
        ),
        to: s.withExamples(
          s.string(
            "Window end (Unix seconds or a date), inclusive. Defaults to now. With order=desc, page back within the most-recent results by setting this to the oldest time you received (prefer to_ms for millisecond precision); with order=asc it bounds the walk.",
          ),
          ["2026-03-01"],
        ),
        to_ms: s.integer(
          "Window end in Unix milliseconds, for millisecond-precise desc paging: pass the time_ms of the oldest fill you received to fetch the next page. On its own the boundary is exclusive (fills AT to_ms are dropped), so when more than limit fills share one millisecond the remainder is skipped — pair it with to_fill_id to page losslessly through a boundary millisecond. Takes precedence over to (which is ignored when to_ms is set). Like to, it pages within the recent (~2000-fill) window. desc-only: rejected with order=asc (use cursor instead).",
          { minimum: 0 },
        ),
        to_fill_id: s.string(
          "Cursor tiebreak for to_ms: pass the fill_id of the oldest fill you received alongside its time_ms as to_ms. The next page then resumes strictly after that (time_ms, fill_id) pair — fills at the boundary millisecond with a lower fill_id are included instead of skipped, so paging never loses fills that share a millisecond. Requires to_ms; desc-only. Equivalent to following meta.next_cursor, which encodes the same position. An empty page can mean the window is exhausted (set from to reach older history), not that no older fills exist.",
        ),
        order: s.withEnum(
          s.string(
            'desc (default): newest first — the recent feed, or the earliest-anchored ~2000-fill slice when from is set. asc: oldest first, a complete-history walk from from (required) up to to — each page links the next via meta.next_cursor with no result cap, the reliable mode for full trade-history or PnL reconstruction. Default: "desc".',
          ),
          ["desc", "asc"],
        ),
        cursor: s.string(
          "Opaque continuation token from a previous response's meta.next_cursor. It encodes the paging direction, position, and window, so pass it with only symbol and limit — combining it with from, to, to_ms, or to_fill_id is rejected with 400.",
        ),
        symbol: s.string(
          "Filter to one market (exact match, e.g. xyz:GOLD). Applied client-side: with order=desc it filters after the recent cap (pair it with from/to so older fills are not missed); with order=asc the cursor walk scans past non-matching fills, so a page may return fewer than limit items (or none) while meta.next_cursor still advances.",
        ),
        limit: s.integer("Page size (1-100). Default: 20.", { minimum: 1, maximum: 100 }),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "hyperliquid_leaderboard",
    description: "Trader Leaderboard.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/leaderboard",
      method: "GET",
      parameters: [
        { name: "time_range", in: "query", field: "time_range" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "min_trades", in: "query", field: "min_trades" },
        { name: "min_days_active", in: "query", field: "min_days_active" },
        { name: "min_account_age_days", in: "query", field: "min_account_age_days" },
        { name: "min_human_score", in: "query", field: "min_human_score" },
        { name: "dex", in: "query", field: "dex" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Trader Leaderboard.",
      {
        time_range: s.withEnum(s.string('Window to rank over. Default all (data starts 2025-08-01). Default: "all".'), [
          "1d",
          "7d",
          "30d",
          "90d",
          "all",
        ]),
        sort_by: s.withEnum(s.string('Rank by this metric. Always sorted descending. Default: "total_pnl".'), [
          "total_pnl",
          "win_rate",
          "volume_traded",
        ]),
        min_trades: s.integer(
          "Only traders with at least this many trades. Defaults to 5; pass 0 for the full population. Default: 5.",
          { minimum: 0 },
        ),
        min_days_active: s.integer("Only traders active at least this many days (0 = no filter). Default: 0.", {
          minimum: 0,
        }),
        min_account_age_days: s.integer("Only accounts at least this old, in days (0 = no filter). Default: 0.", {
          minimum: 0,
        }),
        min_human_score: s.integer("Only traders scoring at least this, 0-100 (0 = no filter). Default: 0.", {
          minimum: 0,
          maximum: 100,
        }),
        dex: s.withEnum(
          s.string(
            "Market to rank within: main_dex (or omit) for the native market ONLY, or a builder market — one of: xyz, flx, vntl, hyna, km, abcd, cash, para, mkts. NOTE: the omit default differs from /trades/aggregate, where omitting dex aggregates across ALL markets.",
          ),
          ["main_dex", "xyz", "flx", "vntl", "hyna", "km", "abcd", "cash", "para", "mkts"],
        ),
        limit: s.integer("Results per page (1-100). Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Results to skip. Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "hyperliquid_orders",
    description: "Open & Recent Orders.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/orders",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "open_limit", in: "query", field: "open_limit" },
        { name: "historical_limit", in: "query", field: "historical_limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Open & Recent Orders.",
      {
        address: evmWalletAddressSchema,
        open_limit: s.integer(
          "Max open orders returned (market makers can hold 1500+; open_total reports the pre-truncation count). Default: 500.",
          { minimum: 1, maximum: 2000 },
        ),
        historical_limit: s.integer(
          "Max terminal orders returned, newest first (the upstream feed holds ~1000 post-collapse; historical_total reports the pre-truncation count). Default: 200.",
          { minimum: 1, maximum: 2000 },
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "hyperliquid_performance",
    description: "Trading Performance.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/performance",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "dex", in: "query", field: "dex" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Trading Performance.",
      {
        address: evmWalletAddressSchema,
        dex: s.string(
          "NOT SUPPORTED on /performance — returns 400 if set. The lifetime summary always spans ALL markets; market scoping lives on /trades/aggregate (dex=...).",
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "hyperliquid_positions",
    description: "Open Positions.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/positions",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "dex", in: "query", field: "dex" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Open Positions.",
      {
        address: evmWalletAddressSchema,
        dex: s.withEnum(
          s.string(
            "Market scope: omit (or main_dex) for the native market, or a builder market — one of: xyz, flx, vntl, hyna, km, abcd, cash, para, mkts.",
          ),
          ["main_dex", "xyz", "flx", "vntl", "hyna", "km", "abcd", "cash", "para", "mkts"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "hyperliquid_trades",
    description: "Closed Trades.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/trades",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "direction", in: "query", field: "direction" },
        { name: "dex", in: "query", field: "dex" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "cursor", in: "query", field: "cursor" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Closed Trades.",
      {
        address: evmWalletAddressSchema,
        symbol: s.string(
          "NOT SUPPORTED on /trades — returns 400 if set. Per-symbol slicing lives on /trades/aggregate (group_by=symbol) or client-side.",
        ),
        direction: s.withEnum(
          s.string(
            "NOT SUPPORTED on /trades — returns 400 if set. Per-direction slicing lives on /trades/aggregate (group_by=direction) or client-side.",
          ),
          ["long", "short"],
        ),
        dex: s.string(
          "NOT SUPPORTED on /trades — returns 400 if set. Market scoping lives on /trades/aggregate (dex=...).",
        ),
        from: s.withExamples(
          s.string(
            "Window start: Unix seconds, an ISO datetime (2026-03-01T12:00:00Z), or a bare date (= midnight UTC). Omit for the full history.",
          ),
          ["2026-03-01"],
        ),
        to: s.withExamples(
          s.string(
            "Window end, inclusive: Unix seconds, an ISO datetime, or a bare date — a bare date means the END of that UTC day, so from=X&to=X covers the whole day X. Defaults to now.",
          ),
          ["2026-03-01"],
        ),
        cursor: s.string(
          "Opaque continuation token from a previous response's meta.next_cursor. It encodes the window, position, and address, so pass it with only address + limit — and only with the address it was issued for. Tokens are single-use opaque values: identical requests mint different tokens that decode to the same position.",
        ),
        limit: s.integer("Page size (1-100). Default: 20.", { minimum: 1, maximum: 100 }),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "hyperliquid_trades_aggregate",
    description: "Closed Trades Aggregate.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/trades/aggregate",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "group_by", in: "query", field: "group_by" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "dex", in: "query", field: "dex" },
        { name: "fill_gaps", in: "query", field: "fill_gaps" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Closed Trades Aggregate.",
      {
        address: evmWalletAddressSchema,
        group_by: s.withEnum(
          s.string(
            'Dimension to roll up by. day = UTC calendar day (the P&L calendar / equity-curve source); symbol = per market; direction = long vs short; size_bucket = notional-USD tiers; hold_bucket = holding-time tiers. Default: "day".',
          ),
          ["day", "symbol", "direction", "size_bucket", "hold_bucket"],
        ),
        from: s.withExamples(
          s.string(
            "Window start, bounds close_time: Unix seconds, an ISO datetime (2026-03-01T12:00:00Z), or a bare date (= midnight UTC). Omit for full history.",
          ),
          ["2026-03-01"],
        ),
        to: s.withExamples(
          s.string(
            "Window end, inclusive, bounds close_time: Unix seconds, an ISO datetime, or a bare date — a bare date means the END of that UTC day, so from=X&to=X covers the whole day X. Defaults to now.",
          ),
          ["2026-03-31"],
        ),
        dex: s.withEnum(
          s.string(
            "Market scope: main_dex for the native market only, omit to aggregate across ALL markets, or a builder market — one of: xyz, flx, vntl, hyna, km, abcd, cash, para, mkts. NOTE: the omit default differs from /leaderboard, where omitting dex means the native market only.",
          ),
          ["main_dex", "xyz", "flx", "vntl", "hyna", "km", "abcd", "cash", "para", "mkts"],
        ),
        fill_gaps: s.boolean(
          "group_by=day only: emit a zero row for every no-trade UTC day in the window so the calendar is dense. Requires from (a bounded window); ignored for other group_by values. Default: false.",
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "hyperliquid_trade_context",
    description: "Closed Trade Funding and Leverage.",
    operationType: "read",
    route: {
      path: "/gateway/v1/hyperliquid/trades/context",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "direction", in: "query", field: "direction" },
        { name: "open_time", in: "query", field: "open_time" },
        { name: "close_time", in: "query", field: "close_time" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Closed Trade Funding and Leverage.",
      {
        address: evmWalletAddressSchema,
        symbol: s.string(
          "Hyperliquid perpetual market id, including a builder prefix for HIP-3 markets (for example xyz:GOLD).",
        ),
        direction: s.withEnum(s.string("Opening direction of the episode."), ["long", "short"]),
        open_time: s.integer("Episode open time, Unix seconds, copied from GET /hyperliquid/trades.", { minimum: 1 }),
        close_time: s.integer("Episode close time, Unix seconds, copied from GET /hyperliquid/trades.", { minimum: 1 }),
      },
      {
        required: ["address", "symbol", "direction", "open_time", "close_time"],
        additionalProperties: false,
      },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "onchain_bridge_ranking",
    description: "Bridge Protocol Ranking.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/bridge/ranking",
      method: "GET",
      parameters: [
        { name: "time_range", in: "query", field: "time_range" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Bridge Protocol Ranking.",
      {
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window to aggregate bridge volume over: `7d`, `30d`, `90d`, `180d`, `1y`, or `all`. Returns a single ranked snapshot (not a time-series). This endpoint uses `time_range` only — it does NOT accept `interval`. Default: "30d".',
            ),
            ["7d", "30d", "90d", "180d", "1y", "all"],
          ),
          ["30d"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "onchain_dex_activity",
    description: "DEX Protocol Activity.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/dex/activity",
      method: "GET",
      parameters: [
        { name: "chain", in: "query", field: "chain" },
        { name: "project", in: "query", field: "project" },
        { name: "address", in: "query", field: "address" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "group_by", in: "query", field: "group_by" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for DEX Protocol Activity.",
      {
        chain: s.withExamples(
          s.withEnum(s.string("Chain to query."), ["ethereum", "base", "bsc", "arbitrum", "tron"]),
          ["ethereum"],
        ),
        project: s.withExamples(
          s.string(
            "DEX project name (e.g. `uniswap`, `pancakeswap`, `aerodrome`). Exactly one of `project` / `address` is required.",
          ),
          ["uniswap"],
        ),
        address: s.withExamples(
          s.string("A specific router/contract measured as `tx_to`. Exactly one of `project` / `address` is required."),
          ["0x1111111254eeb25477b68fb85ed929f73a960582"],
        ),
        time_range: s.withEnum(
          s.string('Look-back window (hard 90d cap). Overridden by `from`/`to` when set. Default: "7d".'),
          ["1d", "7d", "30d", "90d"],
        ),
        from: s.withExamples(
          s.string("Start of range — Unix seconds or YYYY-MM-DD. With `to`, the range may span at most 90 days."),
          ["2025-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of range — Unix seconds or YYYY-MM-DD. Without `from`, the window is `time_range` ending at `to`.",
          ),
          ["2025-02-01"],
        ),
        group_by: s.withEnum(
          s.string('`total` = single aggregate; `day` = daily series (newest first). Default: "total".'),
          ["total", "day"],
        ),
      },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "onchain_gas_price",
    description: "Current Gas Price.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/gas-price",
      method: "GET",
      parameters: [{ name: "chain", in: "query", field: "chain" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Current Gas Price.",
      {
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.",
            ),
            ["ethereum", "polygon", "bsc", "arbitrum", "optimism", "base", "avalanche", "fantom", "linea", "cyber"],
          ),
          ["ethereum"],
        ),
      },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "onchain_structured_query",
    description:
      "Query blockchain data with structured column, filter, and sort clauses. Discover agent.<table> sources with onchain_schema; always filter large tables by block_date. Resolve token symbols using search_token rather than filtering unindexed symbol columns. Transfer amount is decimal-adjusted, while amount_raw is in base units.",
    operationType: "read",
    route: { path: "/gateway/v1/onchain/query", method: "POST", parameters: [], body: true },
    inputSchema: s.object(
      "Parameters for Blockchain Structured Query.",
      {
        fields: s.nullable(
          s.withExamples(s.array("Columns to return. Omit to return all columns.", s.string("Array item.")), [
            ["project", "symbol", "apy", "tvl_usd"],
          ]),
        ),
        filters: s.nullable(
          s.array(
            "WHERE conditions (ANDed together)",
            s.object(
              "Array item.",
              {
                field: s.withExamples(s.string("Column name to filter on like `block_number` or `from_address`"), [
                  "block_number",
                ]),
                op: s.withExamples(
                  s.string(
                    "Comparison operator: eq, neq, gt, gte, lt, lte, like, in, not_in. For `in`/`not_in`, value must be a JSON array",
                  ),
                  ["eq"],
                ),
                value: {
                  description:
                    "Comparison value. Use a JSON array for `in`/`not_in` operators like `[21000000, 21000001]`",
                },
              },
              { required: ["field", "op", "value"], additionalProperties: false },
            ),
          ),
        ),
        limit: s.withExamples(s.integer("Max rows to return. Default 20, max 10000"), [20]),
        offset: s.withExamples(s.integer("Rows to skip for pagination. Default 0"), [0]),
        sort: s.nullable(
          s.array(
            "ORDER BY clauses",
            s.object(
              "Array item.",
              {
                field: s.withExamples(s.string("Column name to sort by like `gas`, `block_number`, or `amount_usd`"), [
                  "gas",
                ]),
                order: s.withExamples(s.string("Sort direction: asc (default) or desc"), ["desc"]),
              },
              { required: ["field"], additionalProperties: false },
            ),
          ),
        ),
        source: s.withExamples(
          s.string(
            "Fully-qualified table name like `agent.ethereum_yields_daily`. Use GET /v1/onchain/schema for available tables.",
          ),
          ["agent.ethereum_yields_daily"],
        ),
      },
      { required: ["source"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "onchain_schema",
    description: "On-Chain Table Schema.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/schema",
      method: "GET",
      parameters: [{ name: "table", in: "query", field: "table" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for On-Chain Table Schema.",
      {
        table: s.withExamples(
          s.string(
            "Optional logical table name from the agent database. Use this to include bounded physical partition, ordering-key, and size metadata.",
          ),
          ["polymarket_trades"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "onchain_sql",
    description:
      "Execute a read-only ClickHouse SELECT/WITH query against agent.<table> blockchain data. Discover tables with onchain_schema and filter large tables by block_date or block_number. Normalize address literals to lowercase without wrapping indexed address columns in lower(); use separate UNION ALL branches instead of OR for transfer from/to predicates. Resolve token symbols with search_token before querying contracts. The synchronous budget is 30 seconds; use prefer=respond-async and a stable idempotency_key for long queries. Do not automatically retry synchronous timeouts; submit an asynchronous job instead.",
    operationType: "destructive",
    route: {
      path: "/gateway/v1/onchain/sql",
      method: "POST",
      parameters: [
        { name: "Prefer", in: "header", field: "prefer" },
        { name: "Idempotency-Key", in: "header", field: "idempotency_key" },
      ],
      body: true,
    },
    inputSchema: s.object(
      "Parameters for Blockchain SQL Query.",
      {
        prefer: s.string(
          "Optional RFC 7240 preference. Include respond-async to submit this request as a durable asynchronous job and receive 202 Accepted.",
        ),
        idempotency_key: s.string(
          "Stable client-generated key used when Prefer includes respond-async. Reusing it returns the existing retained job.",
          { maxLength: 200 },
        ),
        max_rows: s.withExamples(
          s.integer("Maximum number of rows to return Default: 1000.", {
            minimum: 1,
            maximum: 10000,
          }),
          [1000],
        ),
        sql: s.withExamples(
          s.string(
            'Send a JSON object with the sql field. Example: {"sql":"SELECT 1"}. Use GET /v1/onchain/schema for tables and columns. Transfer table amount is decimal-adjusted; amount_raw is the original base-unit value. Use single quotes for ClickHouse strings. Example: toDate(\'2026-04-07\').',
          ),
          [
            "SELECT block_date, project, symbol, apy, tvl_usd FROM agent.ethereum_yields_daily WHERE block_date >= today() - 7 ORDER BY apy DESC LIMIT 10",
          ],
        ),
      },
      { required: ["sql"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        data: { description: "Upstream result data, preserving all provider fields." },
        meta: metaSchema,
        job_id: s.string("Asynchronous SQL job identifier, promoted from data.job_id."),
        status: s.string("Asynchronous SQL job state, promoted from data.status."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "onchain_sql_job_create",
    description:
      "Submit a read-only ClickHouse SELECT/WITH query as a durable asynchronous job. Use agent.<table> names, partition filters, and resolved contract addresses as for onchain_sql. A retained job is reused for the same idempotency key or equivalent normalized SQL and max_rows. Poll onchain_sql_job_get, then read onchain_sql_job_results; results are retained for 24 hours.",
    operationType: "destructive",
    route: {
      path: "/gateway/v1/onchain/sql/jobs",
      method: "POST",
      parameters: [{ name: "Idempotency-Key", in: "header", field: "idempotency_key" }],
      body: true,
    },
    inputSchema: s.object(
      "Parameters for Submit Asynchronous Blockchain SQL Job.",
      {
        idempotency_key: s.string(
          "Stable client-generated key. Reusing it returns the existing job without starting another query.",
          { maxLength: 200 },
        ),
        max_rows: s.withExamples(
          s.integer("Maximum number of result rows to retain Default: 1000.", {
            minimum: 1,
            maximum: 10000,
          }),
          [1000],
        ),
        sql: s.withExamples(
          s.string(
            "Exact read-only ClickHouse SQL to execute asynchronously. The submitted SQL and date range are preserved.",
          ),
          [
            "SELECT block_date, project, symbol, apy FROM agent.ethereum_yields_daily WHERE block_date >= today() - 30 ORDER BY apy DESC",
          ],
        ),
      },
      { required: ["sql"], additionalProperties: false },
    ),
    outputSchema: sqlJobResponseSchema,
  },
  {
    name: "onchain_sql_job_cancel",
    description: "Cancel Asynchronous Blockchain SQL Job.",
    operationType: "destructive",
    route: {
      path: "/gateway/v1/onchain/sql/jobs/{job_id}",
      method: "DELETE",
      parameters: [{ name: "job_id", in: "path", field: "job_id" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Cancel Asynchronous Blockchain SQL Job.",
      { job_id: s.string("Asynchronous SQL job identifier", { format: "uuid" }) },
      { required: ["job_id"], additionalProperties: false },
    ),
    outputSchema: sqlJobResponseSchema,
  },
  {
    name: "onchain_sql_job_get",
    description: "Get Asynchronous Blockchain SQL Job.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/sql/jobs/{job_id}",
      method: "GET",
      parameters: [{ name: "job_id", in: "path", field: "job_id" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Get Asynchronous Blockchain SQL Job.",
      { job_id: s.string("Asynchronous SQL job identifier", { format: "uuid" }) },
      { required: ["job_id"], additionalProperties: false },
    ),
    outputSchema: sqlJobResponseSchema,
  },
  {
    name: "onchain_sql_job_results",
    description: "Download Asynchronous Blockchain SQL Results.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/sql/jobs/{job_id}/results",
      method: "GET",
      parameters: [
        { name: "job_id", in: "path", field: "job_id" },
        { name: "format", in: "query", field: "format" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Download Asynchronous Blockchain SQL Results.",
      {
        job_id: s.string("Asynchronous SQL job identifier", { format: "uuid" }),
        format: s.withEnum(s.string('Result representation Default: "json".'), ["json", "csv"]),
      },
      { required: ["job_id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        data: dataSchema,
        meta: metaSchema,
        csv: s.string("CSV result text when CSV format is requested."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "onchain_sql_preflight",
    description: "Preflight Blockchain SQL Query.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/sql/preflight",
      method: "POST",
      parameters: [],
      body: true,
    },
    inputSchema: s.object(
      "Parameters for Preflight Blockchain SQL Query.",
      {
        max_rows: s.withExamples(
          s.integer("Maximum result rows in the final server-bounded execution plan Default: 1000.", {
            minimum: 1,
            maximum: 10000,
          }),
          [1000],
        ),
        sql: s.withExamples(
          s.string("Read-only ClickHouse SELECT/WITH query to validate and estimate without executing it"),
          [
            "SELECT block_date, project, apy, tvl_usd FROM agent.ethereum_yields_daily WHERE block_date >= today() - 7 LIMIT 100",
          ],
        ),
      },
      { required: ["sql"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "onchain_tx",
    description: "Transaction Details by Hash.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/tx",
      method: "GET",
      parameters: [
        { name: "hash", in: "query", field: "hash" },
        { name: "chain", in: "query", field: "chain" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Transaction Details by Hash.",
      {
        hash: s.withExamples(s.string("Transaction hash (0x-prefixed hex)"), [
          "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060",
        ]),
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, `linea`, or `cyber`.",
            ),
            ["ethereum", "polygon", "bsc", "arbitrum", "optimism", "base", "avalanche", "fantom", "linea", "cyber"],
          ),
          ["ethereum"],
        ),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach. Currently valid: `labels` — adds `from_label` and `to_label` fields with entity information for the from/to addresses.",
          ),
          ["labels"],
        ),
      },
      { required: ["hash", "chain"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "onchain_yield_ranking",
    description: "Yield Pool Ranking.",
    operationType: "read",
    route: {
      path: "/gateway/v1/onchain/yield/ranking",
      method: "GET",
      parameters: [
        { name: "project", in: "query", field: "project" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Yield Pool Ranking.",
      {
        project: s.withExamples(s.string("Filter by protocol name like `lido`, `aave`, or `uniswap`"), ["aave"]),
        sort_by: s.withExamples(
          s.withEnum(
            s.string(
              'Ranking metric: `apy` or `tvl_usd`. When sorted by `apy`, only pools with TVL >= $100k are included Default: "apy".',
            ),
            ["apy", "tvl_usd"],
          ),
          ["apy"],
        ),
        order: s.withExamples(s.withEnum(s.string('Sort direction Default: "desc".'), ["asc", "desc"]), ["desc"]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "portfolio_wallets",
    description: "Current User Portfolio Wallets.",
    operationType: "read",
    route: { path: "/gateway/v1/portfolio/wallets", method: "GET", parameters: [], body: false },
    inputSchema: s.object(
      "Parameters for Current User Portfolio Wallets.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "token_dex_trades",
    description: "Token DEX Trade History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/dex-trades",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token DEX Trade History.",
      {
        address: s.withExamples(
          s.string(
            "Token CONTRACT ADDRESS — 0x-prefixed hex (EVM chains only; Tron also accepts base58 `T...`). This is NOT a ticker symbol (e.g. do NOT pass `USDC` or `BTC`). To resolve a ticker symbol to a contract address, call GET /v1/search/token?q={symbol}&chain={chain} and use the `address` whose `chain` is supported by this endpoint. This endpoint has no `symbol` parameter.",
          ),
          ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        ),
        chain: s.withExamples(
          s.withEnum(s.string('Chain. Can be `ethereum`, `base`, `bsc`, `arbitrum`, or `tron`. Default: "ethereum".'), [
            "ethereum",
            "base",
            "bsc",
            "arbitrum",
            "tron",
          ]),
          ["ethereum"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach to each trade. Currently valid: `labels` — adds a `taker_label` field with entity information for the taker address.",
          ),
          ["labels"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "token_holders",
    description: "Token Holders.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/holders",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Holders.",
      {
        address: s.withExamples(
          s.string(
            "Token CONTRACT ADDRESS — 0x-prefixed hex for EVM chains, base58 for Solana. This is NOT a ticker symbol (e.g. do NOT pass `USDC` or `BTC`). To resolve a ticker symbol to a contract address, call GET /v1/search/token?q={symbol}&chain={chain} and use the `address` whose `chain` is supported by this endpoint. This endpoint has no `symbol` parameter.",
          ),
          ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        ),
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Chain. Can be `ethereum`, `polygon`, `bsc`, `solana`, `avalanche`, `arbitrum`, `optimism`, or `base`.",
            ),
            ["ethereum", "polygon", "bsc", "solana", "avalanche", "arbitrum", "optimism", "base"],
          ),
          ["ethereum"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach to each holder. Currently valid: `labels` — adds a full `label` record alongside the flat `entity_name` / `entity_type` fields.",
          ),
          ["labels"],
        ),
      },
      { required: ["address", "chain"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "token_tokenomics",
    description: "Token Unlock Schedule.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/tokenomics",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Unlock Schedule.",
      {
        id: s.withExamples(
          s.string(
            "Surf project UUID. PREFERRED — always use this when available from a previous response. Takes priority over symbol.",
          ),
          ["25c6612a-395c-4974-94eb-3b5f9f4b2ed7"],
        ),
        symbol: s.withExamples(s.string("Token symbol like `ARB`, `OP`, or `APT`"), ["ARB"]),
        from: fromSchema,
        to: s.withExamples(
          s.string("End of time range. Accepts Unix seconds (`1735689600`) or date string (`2025-01-01`)"),
          ["2025-01-01"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "token_transfer_counterparties",
    description: "Top Transfer Counterparties.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/transfer-counterparties",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "direction", in: "query", field: "direction" },
        { name: "metric", in: "query", field: "metric" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include", in: "query", field: "include" },
        { name: "exclude_labels", in: "query", field: "exclude_labels" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Top Transfer Counterparties.",
      {
        address: s.withExamples(
          s.string(
            "Token CONTRACT ADDRESS (0x-hex for EVM; Tron accepts base58 `T...` or 0x-hex). Not a ticker — resolve a symbol via GET /v1/search/token?q={symbol}&chain={chain} and use a returned address whose chain is supported by this endpoint.",
          ),
          ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        ),
        chain: s.withExamples(
          s.withEnum(s.string("Chain the token contract is deployed on."), [
            "ethereum",
            "base",
            "bsc",
            "arbitrum",
            "tron",
          ]),
          ["ethereum"],
        ),
        direction: s.withExamples(
          s.withEnum(s.string("Ranking direction: `to` = top receivers, `from` = top senders."), ["to", "from"]),
          ["to"],
        ),
        metric: s.withEnum(
          s.string(
            'Ranking key: `count` = transfer frequency, `amount` = decimal-adjusted token sum, `amount_usd` = USD value sum (USD lags ~3 days; unreliable for recent windows). Default: "count".',
          ),
          ["count", "amount", "amount_usd"],
        ),
        time_range: s.withEnum(s.string('Look-back window (hard 90d cap). Default: "7d".'), ["1d", "7d", "30d", "90d"]),
        limit: s.integer("Results per page. Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset. Default: 0.", { minimum: 0 }),
        include: s.withExamples(
          s.string("Comma-separated enrichments. `labels` attaches an entity label per counterparty."),
          ["labels"],
        ),
        exclude_labels: s.withExamples(
          s.string(
            "Comma-separated entity categories to drop (best-effort): `cex`, `router`, `amm`, `bridge`. Results may be fewer than `limit` when top counterparties are infrastructure.",
          ),
          ["cex,router"],
        ),
      },
      { required: ["address", "chain", "direction"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "token_transfer_stats",
    description: "Token Transfer Activity Summary.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/transfer-stats",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Transfer Activity Summary.",
      {
        address: s.withExamples(
          s.string(
            "Token CONTRACT ADDRESS (0x-hex for EVM; Tron accepts base58 `T...` or 0x-hex). Not a ticker — resolve a symbol via GET /v1/search/token?q={symbol}&chain={chain} and use a returned address whose chain is supported by this endpoint.",
          ),
          ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        ),
        chain: s.withExamples(
          s.withEnum(s.string("Chain the token contract is deployed on."), [
            "ethereum",
            "base",
            "bsc",
            "arbitrum",
            "tron",
          ]),
          ["ethereum"],
        ),
        time_range: s.withEnum(s.string('Look-back window (hard 90d cap). Default: "7d".'), ["1d", "7d", "30d", "90d"]),
        include: s.withExamples(
          s.string("Comma-separated extras. `series` adds a daily trend breakdown (volume only)."),
          ["series"],
        ),
      },
      { required: ["address", "chain"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "token_transfers",
    description: "Token Transfer History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/token/transfers",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Transfer History.",
      {
        address: s.withExamples(
          s.string(
            "Token CONTRACT ADDRESS — 0x-prefixed hex for EVM chains, base58 for Solana. This is NOT a ticker symbol (e.g. do NOT pass `USDC` or `BTC`). To resolve a ticker symbol to a contract address, call GET /v1/search/token?q={symbol}&chain={chain} and use the `address` whose `chain` is supported by this endpoint. This endpoint has no `symbol` parameter.",
          ),
          ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        ),
        chain: s.withExamples(
          s.withEnum(s.string("Chain. Can be `ethereum`, `base`, `solana`, `tron`, `bsc`, or `arbitrum`."), [
            "ethereum",
            "base",
            "solana",
            "tron",
            "bsc",
            "arbitrum",
          ]),
          ["ethereum"],
        ),
        from: s.withExamples(
          s.string("Start of date range. Accepts Unix seconds or YYYY-MM-DD. Defaults to 7 days ago."),
          ["2025-01-01"],
        ),
        to: s.withExamples(s.string("End of date range. Accepts Unix seconds or YYYY-MM-DD. Defaults to today."), [
          "2025-03-01",
        ]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach to each transfer. Currently valid: `labels` — adds `from_label` and `to_label` fields.",
          ),
          ["labels"],
        ),
      },
      { required: ["address", "chain"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "wallet_detail",
    description: "Aggregated Wallet Detail.",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/detail",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "fields", in: "query", field: "fields" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Aggregated Wallet Detail.",
      {
        address: s.withExamples(s.string("Wallet address (0x hex for EVM, base58 for Solana)"), [
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        ]),
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Chain filter for `tokens`, `nft`, and `approvals`. When omitted, inferred from address format: 0x addresses query all EVM chains, base58 addresses query Solana.",
            ),
            ["ethereum", "polygon", "bsc", "avalanche", "arbitrum", "optimism", "fantom", "base", "solana"],
          ),
          ["ethereum"],
        ),
        fields: s.withExamples(
          s.string(
            'Comma-separated sub-resources to include. Valid: `balance`, `tokens`, `labels`, `nft`, `approvals`. The `active_chains` field is always returned. `approvals` is opt-in (not in default) as it triggers additional upstream calls. Default: "balance,tokens,labels,nft".',
          ),
          ["balance,labels,approvals"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "wallet_history",
    description: "Wallet Transaction History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/history",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "before", in: "query", field: "before" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet Transaction History.",
      {
        address: s.withExamples(s.string("Wallet address — must be a raw 0x-prefixed hex address, not an ENS name"), [
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        ]),
        chain: s.withExamples(
          s.withEnum(
            s.string(
              'Chain filter. Can be `ethereum`, `polygon`, `bsc`, `avalanche`, `arbitrum`, `optimism`, `fantom`, or `base`. Default: "ethereum".',
            ),
            ["ethereum", "polygon", "bsc", "avalanche", "arbitrum", "optimism", "fantom", "base"],
          ),
          ["ethereum"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(
          s.integer(
            "Pagination offset. This feed is cursor-paginated upstream and only the most recent ~1000 transactions are reachable; a larger offset returns an empty page with meta.empty_reason rather than an error. For deep history prefer the `before` cursor — its upstream cost is bounded by `limit` and independent of depth, whereas a large offset is emulated by walking the whole feed. Default: 0.",
            { minimum: 0 },
          ),
          [0],
        ),
        before: s.withExamples(
          s.integer(
            "Cursor for efficient deep pagination: return transactions strictly older than this Unix-seconds timestamp (exclusive). Pass the `timestamp` of the last item from the previous page; if items may share a second, pass that timestamp + 1 and de-duplicate on `tx_hash`. Unlike `offset` (which walks the feed), the number of upstream fetches is bounded by `limit` (DeBank returns up to 20 per page) and independent of how far back you page. Mutually exclusive with `offset`.",
            { minimum: 0 },
          ),
          [1704067200],
        ),
        sort_by: s.withExamples(
          s.withEnum(
            s.string(
              'Field to sort results by. The cursor-paginated upstream feed only supports `timestamp` correctly; unsupported values are rejected by the handler for correctness. Default: "timestamp".',
            ),
            ["timestamp", "value"],
          ),
          ["timestamp"],
        ),
        order: s.withExamples(
          s.withEnum(
            s.string(
              'Sort order. The cursor-paginated upstream feed only supports `desc` correctly; unsupported values are rejected by the handler for correctness. Default: "desc".',
            ),
            ["asc", "desc"],
          ),
          ["desc"],
        ),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach to each item. Currently valid: `labels` — adds `from_label` and `to_label` fields with entity information for each counterparty address.",
          ),
          ["labels"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "wallet_labels_batch",
    description: "Wallet Labels (Batch).",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/labels/batch",
      method: "GET",
      parameters: [{ name: "addresses", in: "query", field: "addresses" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet Labels (Batch).",
      {
        addresses: s.withExamples(s.string("Comma-separated wallet addresses to look up, max 100"), [
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0xdead",
        ]),
      },
      { required: ["addresses"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "wallet_net_worth",
    description: "Wallet Net Worth History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/net-worth",
      method: "GET",
      parameters: [{ name: "address", in: "query", field: "address" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet Net Worth History.",
      {
        address: s.withExamples(
          s.string(
            "Wallet address — must be a raw 0x-prefixed hex address (EVM only). Solana and ENS names are not supported.",
          ),
          ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "wallet_protocols",
    description: "Wallet DeFi Protocol Positions.",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/protocols",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet DeFi Protocol Positions.",
      {
        address: s.withExamples(s.string("Wallet address — must be a raw 0x-prefixed hex address, not an ENS name"), [
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        ]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "wallet_transfers",
    description: "Wallet Transfer History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/wallet/transfers",
      method: "GET",
      parameters: [
        { name: "address", in: "query", field: "address" },
        { name: "chain", in: "query", field: "chain" },
        { name: "flow", in: "query", field: "flow" },
        { name: "token", in: "query", field: "token" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include", in: "query", field: "include" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet Transfer History.",
      {
        address: s.withExamples(
          s.string(
            "Wallet address — must be a raw address (0x-prefixed hex for EVM, base58 for Solana). ENS names like `vitalik.eth` are not supported; resolve to a 0x address first.",
          ),
          ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
        ),
        chain: s.withExamples(
          s.withEnum(
            s.string('Chain. Can be `ethereum`, `base`, `solana`, `tron`, `bsc`, or `arbitrum`. Default: "ethereum".'),
            ["ethereum", "base", "solana", "tron", "bsc", "arbitrum"],
          ),
          ["ethereum"],
        ),
        flow: s.withExamples(
          s.withEnum(
            s.string(
              "Filter by transfer direction relative to the queried wallet. `in` for incoming, `out` for outgoing. Omit for both directions.",
            ),
            ["in", "out"],
          ),
          ["in"],
        ),
        token: s.withExamples(
          s.string(
            "Filter by token contract address. Use `0x0000000000000000000000000000000000000000` for native token transfers. Omit for all tokens.",
          ),
          ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
        ),
        limit: s.withExamples(
          s.integer(
            "Results per page. Default 20, max 100. NOTE: Solana (`chain=solana`) is hard-capped at 40 per call by the upstream Solscan API — values above 40 return at most 40 items. Check `meta.has_more` and paginate with `offset` to fetch beyond the first page. Default: 20.",
            { minimum: 1, maximum: 100 },
          ),
          [20],
        ),
        offset: s.withExamples(
          s.integer(
            "Pagination offset. For Solana, this maps to Solscan's 1-indexed `page` parameter (page = offset/page_size + 1). Default: 0.",
            { minimum: 0 },
          ),
          [0],
        ),
        include: s.withExamples(
          s.string(
            "Comma-separated enrichments to attach to each transfer. Currently valid: `labels` — adds `from_label` and `to_label` fields with entity information for each counterparty address.",
          ),
          ["labels"],
        ),
      },
      { required: ["address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
];
