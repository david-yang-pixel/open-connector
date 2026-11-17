import type { SurfActionDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  arrayResponseSchema,
  dataSchema,
  metaSchema,
  objectResponseSchema,
  exchangeMarketTypeSchema,
  orderSchema,
  fromSchema,
} from "./shared-schemas.ts";
export const marketDefinitions: SurfActionDefinition[] = [
  {
    name: "dex_token_price",
    description: "DEX Token OHLCV Price.",
    operationType: "read",
    route: {
      path: "/gateway/v1/dex/token/price",
      method: "GET",
      parameters: [
        { name: "chain", in: "query", field: "chain" },
        { name: "address", in: "query", field: "address" },
        { name: "interval", in: "query", field: "interval" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for DEX Token OHLCV Price.",
      {
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Chain the token lives on. Can be `ethereum`, `base`, `bsc`, `arbitrum`, `optimism`, `polygon`, `avalanche`, or `solana`.",
            ),
            ["ethereum", "base", "bsc", "arbitrum", "optimism", "polygon", "avalanche", "solana"],
          ),
          ["ethereum"],
        ),
        address: s.withExamples(
          s.string(
            "Token contract address — 0x-prefixed hex (42 chars) for EVM chains, base58 for Solana. NOT a ticker symbol.",
          ),
          ["0x6982508145454ce325ddbe47a25d4ec3d2311933"],
        ),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Candle bucket size. Sub-day intervals (`1m`-`4h`) are the typical choice for active DEX analysis. Default: "1h".',
            ),
            ["1m", "5m", "15m", "30m", "1h", "4h", "12h", "1d", "7d"],
          ),
          ["1h"],
        ),
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of historical data to return. `max` returns the largest allowed 1500-bar window for the selected interval. Ignored when both `from` and `to` are set. Default: "24h".',
            ),
            ["1h", "6h", "12h", "24h", "7d", "30d", "90d", "180d", "365d", "max"],
          ),
          ["24h"],
        ),
        from: s.withExamples(
          s.string(
            "Start of custom date range (Unix seconds or YYYY-MM-DD). Must be set together with `to`. Overrides `time_range` when set.",
          ),
          ["2026-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of custom date range (Unix seconds or YYYY-MM-DD). Must be set together with `from`. Overrides `time_range` when set.",
          ),
          ["2026-01-02"],
        ),
      },
      { required: ["chain", "address"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_candles",
    description: "Exchange Historical Candles.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/candles",
      method: "GET",
      parameters: [
        { name: "exchange", in: "query", field: "exchange" },
        { name: "pair", in: "query", field: "pair" },
        { name: "interval", in: "query", field: "interval" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "include_synthetic", in: "query", field: "include_synthetic" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Historical Candles.",
      {
        exchange: s.withExamples(
          s.withEnum(s.string("Exchange identifier"), ["bithumb", "upbit", "hashkey", "bitflyer", "coinone", "korbit"]),
          ["bithumb"],
        ),
        pair: s.withExamples(s.string("Trading pair in base/quote form, e.g. BTC/KRW"), ["BTC/KRW"]),
        interval: s.withExamples(s.withEnum(s.string('Candle interval Default: "5m".'), ["5m", "4h", "1w"]), ["5m"]),
        from: s.withExamples(s.string("Start of time range. Accepts Unix seconds or date string"), [
          "2026-06-24T09:00:00Z",
        ]),
        to: s.withExamples(s.string("End of time range. Accepts Unix seconds or date string"), [
          "2026-06-24T10:00:00Z",
        ]),
        include_synthetic: s.withExamples(
          s.boolean(
            "Whether to include carry-forward candles for no-trade intervals. Defaults to true for continuous charts; set false for raw exchange-only candles. Default: true.",
          ),
          [true],
        ),
        limit: s.withExamples(
          s.integer(
            "Max number of candles to return. Weekly candles allow up to 300 rows for a 5-year chart; intraday intervals are capped at 100. Default: 100.",
            { minimum: 1, maximum: 300 },
          ),
          [100],
        ),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["exchange", "pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_coverage",
    description: "Exchange Market Coverage.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/coverage",
      method: "GET",
      parameters: [
        { name: "exchange", in: "query", field: "exchange" },
        { name: "q", in: "query", field: "q" },
        { name: "quote", in: "query", field: "quote" },
        { name: "type", in: "query", field: "type" },
        { name: "status", in: "query", field: "status" },
        { name: "data_status", in: "query", field: "data_status" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Market Coverage.",
      {
        exchange: s.withExamples(
          s.withEnum(s.string("Exchange identifier. When omitted, returns all supported exchanges."), [
            "bithumb",
            "upbit",
            "hashkey",
            "bitflyer",
            "coinone",
            "korbit",
          ]),
          ["bithumb"],
        ),
        q: s.withExamples(s.string("Free-text search over pair, base currency, or quote currency"), ["BTC"]),
        quote: s.withExamples(s.string("Quote currency filter"), ["KRW"]),
        type: s.withExamples(s.withEnum(s.string('Market type Default: "spot".'), ["spot"]), ["spot"]),
        status: s.withExamples(s.withEnum(s.string("Market status filter"), ["active", "inactive"]), ["active"]),
        data_status: s.withExamples(
          s.withEnum(s.string("Market data coverage status filter"), [
            "covered",
            "official_empty_all",
            "official_empty_ticker",
            "official_empty_5m",
            "official_empty_weekly",
            "stale_gt_7d",
            "stale_30m_to_7d",
            "recent_but_lt_min_ta_candles",
            "missing_4h",
            "missing_latest_ta",
          ]),
          ["covered"],
        ),
        sort_by: s.withExamples(
          s.withEnum(s.string('Sort field Default: "pair".'), [
            "pair",
            "price",
            "change_24h",
            "volume_24h",
            "technical_score",
            "latest_candle_at",
            "status",
          ]),
          ["pair"],
        ),
        order: s.withExamples(s.withEnum(s.string('Sort order Default: "asc".'), ["asc", "desc"]), ["asc"]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_depth",
    description: "Exchange Order Book Depth.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/depth",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "type", in: "query", field: "type" },
        { name: "limit", in: "query", field: "limit" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Order Book Depth.",
      {
        pair: s.withExamples(s.string("Trading pair (e.g. BTC/USDT)"), ["BTC/USDT"]),
        type: exchangeMarketTypeSchema,
        limit: s.withExamples(
          s.integer("Number of price levels (1-100) Default: 20.", { minimum: 1, maximum: 100 }),
          [20],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Note: hyperliquid uses USDC-settled perps (e.g. BTC/USDC:USDC); pass USDC-quoted pairs when querying hyperliquid. Default: "binance".',
            ),
            [
              "binance",
              "okx",
              "bybit",
              "bitget",
              "coinbase",
              "kraken",
              "gate",
              "mexc",
              "upbit",
              "bitstamp",
              "deribit",
              "bitmex",
              "bithumb",
              "hyperliquid",
            ],
          ),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_funding_history",
    description: "Exchange Funding Rate History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/funding-history",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "from", in: "query", field: "from" },
        { name: "limit", in: "query", field: "limit" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Funding Rate History.",
      {
        pair: s.withExamples(s.string("Trading pair (e.g. BTC/USDT)"), ["BTC/USDT"]),
        from: s.withExamples(
          s.string(
            "Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Not all exchanges support historical queries; some only return recent data regardless of this value.",
          ),
          ["2026-03-01"],
        ),
        limit: s.withExamples(
          s.integer(
            "Max number of records. For longer history, paginate using the last returned timestamp as the next from value. Default: 100.",
            { minimum: 1, maximum: 500 },
          ),
          [100],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Note: hyperliquid uses USDC-settled perps (e.g. BTC/USDC:USDC); pass USDC-quoted pairs when querying hyperliquid. Default: "binance".',
            ),
            ["binance", "okx", "bybit", "bitget", "gate", "htx", "mexc", "bitfinex", "bitmex", "hyperliquid"],
          ),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_klines",
    description: "Exchange OHLCV Candlesticks.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/klines",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "type", in: "query", field: "type" },
        { name: "interval", in: "query", field: "interval" },
        { name: "from", in: "query", field: "from" },
        { name: "limit", in: "query", field: "limit" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange OHLCV Candlesticks.",
      {
        pair: s.withExamples(s.string("Trading pair (e.g. BTC/USDT)"), ["BTC/USDT"]),
        type: exchangeMarketTypeSchema,
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Candle size — bucket duration for each returned OHLCV row. This endpoint uses `interval` only; it does NOT accept `time_range`. Use `from` + `limit` to control the window. Default: "1h".',
            ),
            ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"],
          ),
          ["1h"],
        ),
        from: s.withExamples(
          s.string("Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601)"),
          ["2026-03-01"],
        ),
        limit: s.withExamples(
          s.integer(
            "Max number of candles to return. Exchange may cap lower (e.g. 200-1000). For longer ranges, paginate using the last returned timestamp as the next from value. Default: 100.",
            { minimum: 1, maximum: 1000 },
          ),
          [100],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Note: hyperliquid uses USDC-settled perps (e.g. BTC/USDC:USDC); pass USDC-quoted pairs when querying hyperliquid. Default: "binance".',
            ),
            [
              "binance",
              "okx",
              "bybit",
              "bitget",
              "coinbase",
              "kraken",
              "gate",
              "htx",
              "kucoin",
              "mexc",
              "upbit",
              "bitfinex",
              "bitstamp",
              "deribit",
              "bitmex",
              "bithumb",
              "hyperliquid",
            ],
          ),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_long_short_ratio",
    description: "Exchange Long/Short Ratio History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/long-short-ratio",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "interval", in: "query", field: "interval" },
        { name: "from", in: "query", field: "from" },
        { name: "limit", in: "query", field: "limit" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Long/Short Ratio History.",
      {
        pair: s.withExamples(s.string("Trading pair (e.g. BTC/USDT)"), ["BTC/USDT"]),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Bucket size for each point in the series: `1h`, `4h`, or `1d`. This endpoint uses `interval` only; it does NOT accept `time_range`. Use `from` + `limit` to control the window. Default: "1h".',
            ),
            ["1h", "4h", "1d"],
          ),
          ["1h"],
        ),
        from: s.withExamples(
          s.string(
            "Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD, ISO8601). Binance only retains the last 30 days of data; other exchanges may have different limits.",
          ),
          ["2026-03-01"],
        ),
        limit: s.withExamples(
          s.integer(
            "Max number of records. For longer history, paginate using the last returned timestamp as the next from value. Default: 50.",
            { minimum: 1, maximum: 500 },
          ),
          [50],
        ),
        exchange: s.withExamples(
          s.withEnum(s.string('Exchange identifier Default: "binance".'), ["binance", "okx", "bybit", "bitget"]),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_markets",
    description: "Exchange Trading Pairs.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/markets",
      method: "GET",
      parameters: [
        { name: "exchange", in: "query", field: "exchange" },
        { name: "type", in: "query", field: "type" },
        { name: "base", in: "query", field: "base" },
        { name: "quote", in: "query", field: "quote" },
        { name: "search", in: "query", field: "search" },
        { name: "limit", in: "query", field: "limit" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Trading Pairs.",
      {
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Defaults to binance. Pass a specific venue to list that exchange only. Default: "binance".',
            ),
            [
              "binance",
              "okx",
              "bybit",
              "bitget",
              "coinbase",
              "kraken",
              "gate",
              "htx",
              "kucoin",
              "mexc",
              "upbit",
              "bitfinex",
              "bitstamp",
              "deribit",
              "bitmex",
              "bithumb",
              "hyperliquid",
            ],
          ),
          ["binance"],
        ),
        type: s.withExamples(
          s.withEnum(s.string("Market type filter. Use perpetual or perp for perpetual contracts (alias for swap)."), [
            "spot",
            "swap",
            "future",
            "option",
            "perpetual",
            "perp",
          ]),
          ["spot"],
        ),
        base: s.withExamples(s.string("Filter by base currency"), ["ETH"]),
        quote: s.withExamples(s.string("Filter by quote currency"), ["USDT"]),
        search: s.withExamples(s.string("Fuzzy search in pair/base/quote"), ["ETH"]),
        limit: s.withExamples(s.integer("Max results Default: 100.", { minimum: 1, maximum: 5000 }), [100]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "exchange_perp",
    description: "Exchange Perpetual Contract Snapshot.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/perp",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "fields", in: "query", field: "fields" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Perpetual Contract Snapshot.",
      {
        pair: s.withExamples(
          s.string(
            "Trading pair (e.g. BTC/USDT). The swap settle suffix is added automatically from the quote currency, e.g. BTC/USDT:USDT or BTC/USDC:USDC.",
          ),
          ["BTC/USDT"],
        ),
        fields: s.withExamples(
          s.string(
            "Comma-separated fields to include: 'funding' (current funding rate), 'oi' (open interest). Defaults to all fields. Default: \"funding,oi\".",
          ),
          ["funding,oi"],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Hyperliquid uses USDC-settled perps (e.g. BTC/USDC:USDC). Default: "binance".',
            ),
            ["binance", "okx", "bybit", "bitget", "htx", "bitfinex", "bitmex", "hyperliquid"],
          ),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "exchange_price",
    description: "Exchange Ticker Price.",
    operationType: "read",
    route: {
      path: "/gateway/v1/exchange/price",
      method: "GET",
      parameters: [
        { name: "pair", in: "query", field: "pair" },
        { name: "type", in: "query", field: "type" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Ticker Price.",
      {
        pair: s.withExamples(s.string("Trading pair (e.g. BTC/USDT)"), ["BTC/USDT"]),
        type: exchangeMarketTypeSchema,
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange identifier. Note: hyperliquid uses USDC-settled perps (e.g. BTC/USDC:USDC); pass USDC-quoted pairs when querying hyperliquid. Default: "binance".',
            ),
            [
              "binance",
              "okx",
              "bybit",
              "bitget",
              "coinbase",
              "kraken",
              "gate",
              "htx",
              "kucoin",
              "mexc",
              "upbit",
              "bitfinex",
              "bitstamp",
              "deribit",
              "bitmex",
              "bithumb",
              "hyperliquid",
            ],
          ),
          ["binance"],
        ),
      },
      { required: ["pair"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_etf",
    description: "ETF Flow History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/etf",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for ETF Flow History.",
      {
        symbol: s.withExamples(
          s.withEnum(s.string("Token symbol. Can be `BTC`, `ETH`, `XRP`, `SOL`, or `HYPE`."), [
            "BTC",
            "ETH",
            "XRP",
            "SOL",
            "HYPE",
          ]),
          ["BTC"],
        ),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "timestamp".'), ["flow_usd", "timestamp"]),
          ["timestamp"],
        ),
        order: orderSchema,
        from: s.withExamples(s.string("Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD)"), [
          "2026-01-01",
        ]),
        to: s.withExamples(s.string("End of time range. Accepts Unix seconds or date string (YYYY-MM-DD)"), [
          "2026-03-01",
        ]),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_exchange_flow_exchanges",
    description: "Exchange Flow Exchanges.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/exchange-flow/exchanges",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Flow Exchanges.",
      {
        symbol: s.withExamples(s.withEnum(s.string("Token ticker symbol. Can be `BTC` or `ETH`."), ["BTC", "ETH"]), [
          "BTC",
        ]),
        limit: s.withExamples(s.integer("Results per page Default: 100.", { minimum: 1, maximum: 100 }), [100]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_fear_greed",
    description: "Fear & Greed Index History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/fear-greed",
      method: "GET",
      parameters: [
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fear & Greed Index History.",
      {
        from: s.withExamples(s.string("Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD)"), [
          "2026-01-01",
        ]),
        to: s.withExamples(s.string("End of time range. Accepts Unix seconds or date string (YYYY-MM-DD)"), [
          "2026-03-01",
        ]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_futures",
    description: "Futures Market Overview.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/futures",
      method: "GET",
      parameters: [
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Futures Market Overview.",
      {
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "volume_24h".'), [
            "open_interest",
            "funding_rate",
            "volume_24h",
            "long_short_ratio",
          ]),
          ["volume_24h"],
        ),
        order: orderSchema,
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_liquidation_chart",
    description: "Liquidation Chart.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/liquidation/chart",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "interval", in: "query", field: "interval" },
        { name: "exchange", in: "query", field: "exchange" },
        { name: "limit", in: "query", field: "limit" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Liquidation Chart.",
      {
        symbol: s.withExamples(s.string("Token ticker symbol like `BTC` or `ETH`"), ["BTC"]),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Candlestick interval — bucket size for each point in the liquidation chart series: `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `4h`, `6h`, `8h`, `12h`, `1d`, or `1w`. This endpoint uses `interval` only; it does NOT accept `time_range`. Use `from`/`to` to bound the series. Default: "1h".',
            ),
            ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "6h", "8h", "12h", "1d", "1w"],
          ),
          ["1h"],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange name. Can be `Binance`, `OKX`, `Bybit`, `Bitget`, `Hyperliquid`, `Gate`, `HTX`, `Bitmex`, `Bitfinex`, `CoinEx`, `Aster`, or `Lighter`. Default: "Binance".',
            ),
            [
              "Binance",
              "OKX",
              "Bybit",
              "Bitget",
              "Hyperliquid",
              "Gate",
              "HTX",
              "Bitmex",
              "Bitfinex",
              "CoinEx",
              "Aster",
              "Lighter",
            ],
          ),
          ["Binance"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 500.", { minimum: 1, maximum: 4500 }), [500]),
        from: fromSchema,
        to: s.withExamples(
          s.string("End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)"),
          ["2024-02-01"],
        ),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_liquidation_exchange_list",
    description: "Liquidation by Exchange.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/liquidation/exchange-list",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Liquidation by Exchange.",
      {
        symbol: s.withExamples(s.string('Token ticker symbol like `BTC` or `ETH` Default: "BTC".'), ["BTC"]),
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window to aggregate over for the snapshot: `1h`, `4h`, `12h`, or `24h`. Returns a single snapshot (not a time-series). This endpoint uses `time_range` only — it does NOT accept `interval`. Default: "24h".',
            ),
            ["1h", "4h", "12h", "24h"],
          ),
          ["24h"],
        ),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "liquidation_usd".'), [
            "liquidation_usd",
            "long_liquidation_usd",
            "short_liquidation_usd",
          ]),
          ["liquidation_usd"],
        ),
        order: orderSchema,
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_liquidation_order",
    description: "Large Liquidation Orders.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/liquidation/order",
      method: "GET",
      parameters: [
        { name: "exchange", in: "query", field: "exchange" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "min_amount", in: "query", field: "min_amount" },
        { name: "side", in: "query", field: "side" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Large Liquidation Orders.",
      {
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange name. Can be `Binance`, `OKX`, `Bybit`, `Bitget`, `Hyperliquid`, `Gate`, `HTX`, `Bitmex`, `Bitfinex`, `CoinEx`, `Aster`, or `Lighter`. Default: "Binance".',
            ),
            [
              "Binance",
              "OKX",
              "Bybit",
              "Bitget",
              "Hyperliquid",
              "Gate",
              "HTX",
              "Bitmex",
              "Bitfinex",
              "CoinEx",
              "Aster",
              "Lighter",
            ],
          ),
          ["Binance"],
        ),
        symbol: s.withExamples(s.string('Token ticker symbol like `BTC` or `ETH` Default: "BTC".'), ["BTC"]),
        min_amount: s.withExamples(s.string('Minimum liquidation amount in USD Default: "10000".'), ["10000"]),
        side: s.withExamples(
          s.withEnum(s.string("Filter by liquidation side. Omit to return both."), ["long", "short"]),
          ["long"],
        ),
        sort_by: s.withEnum(s.string('Field to sort results by Default: "timestamp".'), [
          "usd_value",
          "timestamp",
          "price",
        ]),
        order: s.withEnum(s.string('Sort order Default: "desc".'), ["asc", "desc"]),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
        from: s.withExamples(
          s.string(
            "Start of time range (inclusive). Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)",
          ),
          ["2024-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of time range, exclusive (returns rows strictly older than `to`). Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`). To page backward, set this to the oldest returned `timestamp` + 1 and de-duplicate on `order_id`.",
          ),
          ["2024-02-01"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "listing",
    description: "Exchange Listing Events.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/listing",
      method: "GET",
      parameters: [
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "exchange", in: "query", field: "exchange" },
        { name: "product", in: "query", field: "product" },
        { name: "type", in: "query", field: "type" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Exchange Listing Events.",
      {
        from: s.withExamples(s.string("Start date (YYYY-MM-DD or ISO 8601)"), ["2024-01-01"]),
        to: s.withExamples(s.string("End date (defaults to now)"), ["2024-03-01"]),
        symbol: s.withExamples(s.string("Filter by token symbol"), ["BTC"]),
        exchange: s.withExamples(s.string("Filter by exchange name"), ["binance"]),
        product: s.withEnum(s.string('Filter by product type Default: "all".'), [
          "spot",
          "margin",
          "perp",
          "pre_market_perp",
          "all",
        ]),
        type: s.withEnum(s.string('Event type filter Default: "listing".'), [
          "listing",
          "delisting",
          "cancelled",
          "advanced",
          "postponed",
        ]),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: ["from"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_onchain_indicator",
    description: "On-Chain Indicator.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/onchain-indicator",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "metric", in: "query", field: "metric" },
        { name: "granularity", in: "query", field: "granularity" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "exchange", in: "query", field: "exchange" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for On-Chain Indicator.",
      {
        symbol: s.withExamples(s.withEnum(s.string("Token ticker symbol. Can be `BTC` or `ETH`."), ["BTC", "ETH"]), [
          "BTC",
        ]),
        metric: s.withExamples(
          s.withEnum(
            s.string(
              "On-chain metric name. Can be `nupl`, `sopr`, `mvrv`, `puell-multiple`, `nvm`, `nvt`, `nvt-golden-cross`, or `exchange-flows/{inflow,outflow,netflow,reserve}`.",
            ),
            [
              "nupl",
              "sopr",
              "mvrv",
              "puell-multiple",
              "nvm",
              "nvt",
              "nvt-golden-cross",
              "exchange-flows/inflow",
              "exchange-flows/outflow",
              "exchange-flows/netflow",
              "exchange-flows/reserve",
            ],
          ),
          ["nupl"],
        ),
        granularity: s.withExamples(s.withEnum(s.string('Aggregation granularity. Default: "day".'), ["day"]), ["day"]),
        from: s.withExamples(
          s.string(
            "Start of time range. Accepts Unix seconds or date string (YYYY-MM-DD). Defaults to 90 days ago when omitted. Maximum range is 365 days. Responses are capped at about 100 data points; when meta.has_more is true, split from/to into smaller windows (about 90 days for daily data).",
          ),
          ["2026-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of time range. Accepts Unix seconds or date string (YYYY-MM-DD). Defaults to today when omitted. Maximum range is 365 days. Responses are capped at about 100 data points; when meta.has_more is true, split from/to into smaller windows (about 90 days for daily data).",
          ),
          ["2026-03-01"],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Curated exchange filter for exchange-flow metrics. Use /v1/market/exchange-flow/exchanges to list labels. Default: "all_exchange".',
            ),
            [
              "all_exchange",
              "spot_exchange",
              "derivative_exchange",
              "coinbase_prime",
              "binance",
              "coinbase_advanced",
              "okx",
              "kraken",
              "bybit",
              "bitstamp",
              "gemini",
              "bitget",
              "kucoin",
              "bitfinex",
              "gate_io",
              "deribit",
              "mexc",
              "htx_global",
              "bitflyer",
              "coinone",
              "bithumb",
              "upbit",
              "hashkey_exchange",
            ],
          ),
          ["all_exchange"],
        ),
      },
      { required: ["symbol", "metric"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_options",
    description: "Options Market Data.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/options",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Options Market Data.",
      {
        symbol: s.withExamples(
          s.withEnum(s.string("Token symbol. Can be `BTC`, `ETH`, `SOL`, `XRP`, `BNB`, `DOGE`, `ADA`, or `AVAX`."), [
            "BTC",
            "ETH",
            "SOL",
            "XRP",
            "BNB",
            "DOGE",
            "ADA",
            "AVAX",
          ]),
          ["BTC"],
        ),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "volume_24h".'), ["open_interest", "volume_24h"]),
          ["volume_24h"],
        ),
        order: orderSchema,
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_price",
    description: "Token Price History.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/price",
      method: "GET",
      parameters: [
        { name: "symbol", in: "query", field: "symbol" },
        { name: "time_range", in: "query", field: "time_range" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "currency", in: "query", field: "currency" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Price History.",
      {
        symbol: s.withExamples(
          s.string("Single token ticker symbol like `BTC`, `ETH`, or `SOL` (multi-symbol not supported)"),
          ["BTC"],
        ),
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window of historical data to return: `1d`, `7d`, `14d`, `30d`, `90d`, `180d`, `365d`, or `max`. Ignored when `from`/`to` are set. This endpoint uses `time_range` only — it does NOT accept `interval`; bucket granularity is chosen server-side based on the window size. Default: "30d".',
            ),
            ["1d", "7d", "14d", "30d", "90d", "180d", "365d", "max"],
          ),
          ["30d"],
        ),
        from: s.withExamples(
          s.string(
            "Start of custom date range (Unix timestamp or YYYY-MM-DD). Must be used together with `to`. Overrides `time_range` when set.",
          ),
          ["2025-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of custom date range (Unix timestamp or YYYY-MM-DD). Must be used together with `from`. Overrides `time_range` when set.",
          ),
          ["2025-03-01"],
        ),
        currency: s.withExamples(s.string('Quote currency like `usd`, `eur`, or `btc` Default: "usd".'), ["usd"]),
      },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        data: dataSchema,
        meta: metaSchema,
        project_id: s.string("Resolved Surf project UUID."),
        summary: s.object(
          "Statistics aggregated over the requested window.",
          {},
          { required: [], additionalProperties: true },
        ),
        symbol: s.string("Normalized queried ticker symbol."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "market_price_indicator",
    description: "Technical Indicator.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/price-indicator",
      method: "GET",
      parameters: [
        { name: "indicator", in: "query", field: "indicator" },
        { name: "symbol", in: "query", field: "symbol" },
        { name: "interval", in: "query", field: "interval" },
        { name: "exchange", in: "query", field: "exchange" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "options", in: "query", field: "options" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Technical Indicator.",
      {
        indicator: s.withExamples(
          s.withEnum(
            s.string(
              "Technical indicator name. Can be `rsi`, `macd`, `ema`, `sma`, `bbands`, `stoch`, `adx`, `atr`, `cci`, `obv`, `vwap`, `dmi`, `ichimoku`, or `supertrend`.",
            ),
            [
              "rsi",
              "macd",
              "ema",
              "sma",
              "bbands",
              "stoch",
              "adx",
              "atr",
              "cci",
              "obv",
              "vwap",
              "dmi",
              "ichimoku",
              "supertrend",
            ],
          ),
          ["rsi"],
        ),
        symbol: s.withExamples(s.string("Trading pair as `BTC/USDT` or bare symbol like `BTC`"), ["BTC"]),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              'Candlestick interval — bucket size for each point in the indicator series: `1m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `12h`, `1d`, or `1w`. This endpoint uses `interval` only; it does NOT accept `time_range`. Use `from`/`to` to bound the series. Default: "1d".',
            ),
            ["1m", "5m", "15m", "30m", "1h", "2h", "4h", "12h", "1d", "1w"],
          ),
          ["1d"],
        ),
        exchange: s.withExamples(
          s.withEnum(
            s.string(
              'Exchange for price data. Can be `binance`, `bybit`, `coinbase`, or `kraken`. Default: "binance".',
            ),
            ["binance", "bybit", "coinbase", "kraken"],
          ),
          ["binance"],
        ),
        from: s.withExamples(
          s.string(
            "Start of time range. When set, returns time-series instead of latest value. Accepts Unix seconds (`1704067200`) or date string (`2024-01-01`)",
          ),
          ["2024-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "End of time range. Defaults to now when from is set. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)",
          ),
          ["2024-02-01"],
        ),
        options: s.withExamples(
          s.string(
            "Indicator-specific options as comma-separated key:value pairs. Available options by indicator: `period` — lookback period for rsi (default 14), sma (default 20), ema (default 20), bbands (default 20), adx (default 14), atr (default 14), cci (default 20), dmi (default 14), stoch (default 14), supertrend (default 10). `stddev` — standard deviation for bbands (default 2). `multiplier` — multiplier for supertrend (default 3). `fast_period` — MACD fast EMA (default 12). `slow_period` — MACD slow EMA (default 26). `signal_period` — MACD signal smoothing (default 9). Examples: `period:7`, `period:200`, `fast_period:8,slow_period:21,signal_period:5`, `period:10,stddev:1.5`.",
          ),
          ["period:7"],
        ),
      },
      { required: ["indicator", "symbol"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_public_sale",
    description: "Public Sale / Crowdsale.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/public-sale",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Public Sale / Crowdsale.",
      {
        id: s.withExamples(s.string("Surf project UUID"), ["25c6612a-395c-4974-94eb-3b5f9f4b2ed7"]),
        q: s.withExamples(s.string("Project name or symbol for entity resolution"), ["bitcoin"]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_ranking",
    description: "Token Rankings.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/ranking",
      method: "GET",
      parameters: [
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "category", in: "query", field: "category" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Rankings.",
      {
        sort_by: s.withExamples(
          s.withEnum(
            s.string(
              'Field to sort by. `market_cap` sorts by total market capitalisation, `change_24h` sorts by 24-hour price change percentage (fetches top 250 by market cap then sorts client-side), `volume_24h` sorts by 24-hour trading volume. Default: "market_cap".',
            ),
            ["market_cap", "change_24h", "volume_24h"],
          ),
          ["market_cap"],
        ),
        order: s.withExamples(
          s.withEnum(
            s.string('Sort order: `desc` (default, highest first) or `asc` (lowest first). Default: "desc".'),
            ["asc", "desc"],
          ),
          ["desc"],
        ),
        category: s.withExamples(
          s.withEnum(
            s.string(
              "Optional token category filter. When provided, results are limited to coins in that category. Supported values: MEME, AI, AI_AGENTS, L1, L2, DEFI, GAMING, STABLECOIN, RWA, DEPIN, SOL_ECO, BASE_ECO, LST.",
            ),
            [
              "MEME",
              "AI",
              "AI_AGENTS",
              "L1",
              "L2",
              "DEFI",
              "GAMING",
              "STABLECOIN",
              "RWA",
              "DEPIN",
              "SOL_ECO",
              "BASE_ECO",
              "LST",
            ],
          ),
          ["MEME"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "market_tge",
    description: "Token Generation Event.",
    operationType: "read",
    route: {
      path: "/gateway/v1/market/tge",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Generation Event.",
      {
        id: s.withExamples(s.string("Surf project UUID"), ["25c6612a-395c-4974-94eb-3b5f9f4b2ed7"]),
        q: s.withExamples(s.string("Project name or symbol for entity resolution"), ["bitcoin"]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
];
