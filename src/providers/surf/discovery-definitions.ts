import type { SurfActionDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  arrayResponseSchema,
  dataSchema,
  metaSchema,
  objectResponseSchema,
  orderSchema,
  fromSchema,
  projectIdSchema,
  projectSearchQuerySchema,
} from "./shared-schemas.ts";
export const discoveryDefinitions: SurfActionDefinition[] = [
  {
    name: "fund_detail",
    description: "Fund Profile Detail.",
    operationType: "read",
    route: {
      path: "/gateway/v1/fund/detail",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
      ],
      body: false,
    },
    inputSchema: {
      ...s.object(
        "Parameters for Fund Profile Detail.",
        {
          id: s.withExamples(
            s.string(
              "Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.",
            ),
            ["ef3b6da9-283d-4080-b3c7-87b1b45924dc"],
          ),
          q: s.withExamples(
            s.string(
              "Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.",
              { maxLength: 100 },
            ),
            ["a16z"],
          ),
        },
        { required: [], additionalProperties: false },
      ),
      anyOf: [{ required: ["id"] }, { required: ["q"] }],
    },
    outputSchema: objectResponseSchema,
  },
  {
    name: "fund_portfolio",
    description: "Fund Portfolio.",
    operationType: "read",
    route: {
      path: "/gateway/v1/fund/portfolio",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "is_lead", in: "query", field: "is_lead" },
        { name: "invested_after", in: "query", field: "invested_after" },
        { name: "invested_before", in: "query", field: "invested_before" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fund Portfolio.",
      {
        id: s.withExamples(
          s.string(
            "Surf fund UUID. PREFERRED — always use this when available from a previous response (e.g. id from /search/fund). Takes priority over q.",
          ),
          ["ef3b6da9-283d-4080-b3c7-87b1b45924dc"],
        ),
        q: s.withExamples(
          s.string(
            "Fuzzy fund name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.",
            { maxLength: 100 },
          ),
          ["a16z"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        is_lead: s.withExamples(
          s.withEnum(s.string("Filter by lead investor status. Omit or leave empty for all investments."), [
            "true",
            "false",
            "",
          ]),
          ["true"],
        ),
        invested_after: s.withExamples(
          s.integer("Only include investments at or after this Unix timestamp (seconds)"),
          [1704067200],
        ),
        invested_before: s.withExamples(
          s.integer("Only include investments before this Unix timestamp (seconds)"),
          [1735689600],
        ),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "invested_at".'), [
            "invested_at",
            "recent_raise",
            "total_raise",
          ]),
          ["recent_raise"],
        ),
        order: orderSchema,
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "fund_ranking",
    description: "Fund Ranking.",
    operationType: "read",
    route: {
      path: "/gateway/v1/fund/ranking",
      method: "GET",
      parameters: [
        { name: "metric", in: "query", field: "metric" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fund Ranking.",
      {
        metric: s.withExamples(
          s.withEnum(
            s.string(
              "Ranking metric. Can be `tier` (lower is better) or `portfolio_count` (number of invested projects).",
            ),
            ["tier", "portfolio_count"],
          ),
          ["tier"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["metric"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "signal_detail",
    description: "Signal Detail.",
    operationType: "read",
    route: {
      path: "/gateway/v1/heatscore/detail",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "project_slug", in: "query", field: "project_slug" },
        { name: "time_range", in: "query", field: "time_range" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Signal Detail.",
      {
        id: s.withExamples(s.string("Surf token UUID. Pass exactly one of id or project_slug."), [
          "25c6612a-395c-4974-94eb-3b5f9f4b2ed7",
        ]),
        project_slug: s.withExamples(s.string("Project slug. Pass exactly one of id or project_slug."), ["synapse"]),
        time_range: s.withExamples(
          s.withEnum(s.string('Window to compute signal score over: 24h or 7d. Default: "24h".'), ["24h", "7d"]),
          ["24h"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "signal_projects",
    description: "Signal Projects.",
    operationType: "read",
    route: {
      path: "/gateway/v1/heatscore/projects",
      method: "GET",
      parameters: [
        { name: "time_range", in: "query", field: "time_range" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Signal Projects.",
      {
        time_range: s.withExamples(
          s.withEnum(
            s.string(
              'Window to compute signal scores over: 24h or 7d. Returns a ranked snapshot, not a time-series. Default: "24h".',
            ),
            ["24h", "7d"],
          ),
          ["24h"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "signal_token_of_the_day",
    description: "Signal Token Of The Day.",
    operationType: "read",
    route: {
      path: "/gateway/v1/heatscore/token-of-the-day",
      method: "GET",
      parameters: [
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Signal Token Of The Day.",
      {
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "signal_token_of_week",
    description: "Signal Token Of The Week.",
    operationType: "read",
    route: {
      path: "/gateway/v1/heatscore/token-of-week",
      method: "GET",
      parameters: [
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Signal Token Of The Week.",
      {
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "news_detail",
    description: "News Article Detail.",
    operationType: "read",
    route: {
      path: "/gateway/v1/news/detail",
      method: "GET",
      parameters: [{ name: "id", in: "query", field: "id" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for News Article Detail.",
      {
        id: s.withExamples(s.string("Article ID (returned as id in feed/search results)"), [
          "e54e0ac4-1ef8-44d2-928e-52df465e2c81",
        ]),
      },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "news_feed",
    description: "Crypto News Feed.",
    operationType: "read",
    route: {
      path: "/gateway/v1/news/feed",
      method: "GET",
      parameters: [
        { name: "source", in: "query", field: "source" },
        { name: "project", in: "query", field: "project" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Crypto News Feed.",
      {
        source: s.withExamples(
          s.withEnum(s.string("Filter by news source"), [
            "coindesk",
            "cointelegraph",
            "theblock",
            "decrypt",
            "dlnews",
            "blockbeats",
            "bitcoincom",
            "coinpedia",
            "ambcrypto",
            "cryptodaily",
            "cryptopotato",
            "phemex",
            "panews",
            "odaily",
            "tradingview",
            "chaincatcher",
            "techflow",
          ]),
          ["coindesk"],
        ),
        project: s.withExamples(s.string("Comma-separated project names to filter by"), ["bitcoin,ethereum"]),
        from: s.withExamples(
          s.string("Filter articles published on or after this time. Accepts Unix seconds or date string (2024-01-01)"),
          ["2024-01-01"],
        ),
        to: s.withExamples(
          s.string(
            "Filter articles published on or before this time. Accepts Unix seconds or date string (2024-02-01)",
          ),
          ["2024-02-01"],
        ),
        sort_by: s.withExamples(
          s.withEnum(
            s.string(
              'Sort order: recency (newest first) or trending (deterministic newest-first alias until engagement ranking is available) Default: "recency".',
            ),
            ["recency", "trending"],
          ),
          ["recency"],
        ),
        limit: s.withExamples(s.integer("Results per page (max 50) Default: 20.", { minimum: 1, maximum: 50 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "project_ai_news",
    description: "Project AI News.",
    operationType: "read",
    route: {
      path: "/gateway/v1/project/ai-news",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "lang", in: "query", field: "lang" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project AI News.",
      {
        id: projectIdSchema,
        q: projectSearchQuerySchema,
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 50 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        lang: s.withExamples(
          s.withEnum(s.string('Language for AI-generated content Default: "en".'), ["en", "zh", "ja", "kr"]),
          ["en"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "project_defi_metrics",
    description: "Project DeFi Metrics.",
    operationType: "read",
    route: {
      path: "/gateway/v1/project/defi/metrics",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "metric", in: "query", field: "metric" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "chain", in: "query", field: "chain" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project DeFi Metrics.",
      {
        id: projectIdSchema,
        q: s.withExamples(
          s.string(
            "Fuzzy entity name search. Only use when 'id' is not available. May return unexpected results for ambiguous names.",
          ),
          ["uniswap"],
        ),
        metric: s.withExamples(
          s.withEnum(
            s.string(
              'Metric to query. Can be `volume`, `fees` (or `fee` alias), `revenue`, `tvl`, or `users`. Defaults to tvl. Default: "tvl".',
            ),
            ["volume", "fee", "fees", "revenue", "tvl", "users"],
          ),
          ["tvl"],
        ),
        from: fromSchema,
        to: s.withExamples(
          s.string("End of time range. Accepts Unix seconds (`1706745600`) or date string (`2024-02-01`)"),
          ["2024-02-01"],
        ),
        chain: s.withExamples(
          s.withEnum(
            s.string(
              "Filter by chain. Can be `ethereum`, `polygon`, `bsc`, `arbitrum`, `optimism`, `base`, `avalanche`, `fantom`, or `solana`.",
            ),
            ["ethereum", "polygon", "bsc", "arbitrum", "optimism", "base", "avalanche", "fantom", "solana"],
          ),
          ["ethereum"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "project_defi_ranking",
    description: "DeFi Protocol Ranking.",
    operationType: "read",
    route: {
      path: "/gateway/v1/project/defi/ranking",
      method: "GET",
      parameters: [
        { name: "metric", in: "query", field: "metric" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for DeFi Protocol Ranking.",
      {
        metric: s.withExamples(
          s.withEnum(s.string("Ranking metric. Can be `tvl`, `revenue`, `fees`, `volume`, or `users`."), [
            "tvl",
            "revenue",
            "fees",
            "volume",
            "users",
          ]),
          ["tvl"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["metric"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "project_detail",
    description: "Aggregated Project Detail.",
    operationType: "read",
    route: {
      path: "/gateway/v1/project/detail",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "x_id", in: "query", field: "x_id" },
        { name: "handle", in: "query", field: "handle" },
        { name: "q", in: "query", field: "q" },
        { name: "fields", in: "query", field: "fields" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Aggregated Project Detail.",
      {
        id: projectIdSchema,
        x_id: s.withExamples(s.string("Numeric X (Twitter) account ID. Resolves to the associated project."), [
          "984188226826010624",
        ]),
        handle: s.withExamples(
          s.string("X (Twitter) handle without @. Resolves to the associated project via twitter account lookup."),
          ["uniswap"],
        ),
        q: projectSearchQuerySchema,
        fields: s.withExamples(
          s.string(
            'Comma-separated sub-resources to include. Can be `overview`, `token_info`, `tokenomics`, `funding`, `team`, `contracts`, `social`, or `tge_status`. Default: "overview,token_info,tokenomics,funding,team,contracts,social,tge_status".',
          ),
          ["overview,token_info,funding"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "project_pulse",
    description: "Project Pulse [Deprecated].",
    operationType: "read",
    route: {
      path: "/gateway/v1/project/pulse",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "lang", in: "query", field: "lang" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project Pulse [Deprecated].",
      {
        id: projectIdSchema,
        q: projectSearchQuerySchema,
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 50 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        lang: s.withExamples(
          s.withEnum(s.string('Language for AI-generated content Default: "en".'), ["en", "zh", "ja", "kr"]),
          ["en"],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_airdrop",
    description: "Airdrop Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/airdrop",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "phase", in: "query", field: "phase" },
        { name: "reward_type", in: "query", field: "reward_type" },
        { name: "task_type", in: "query", field: "task_type" },
        { name: "has_open", in: "query", field: "has_open" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "include_tasks", in: "query", field: "include_tasks" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Airdrop Search.",
      {
        q: s.withExamples(s.string("Search keyword for coin name", { maxLength: 100 }), ["airdrop"]),
        phase: s.withExamples(
          s.string(
            'Comma-separated lifecycle phases. `active` = tasks open, can participate (POTENTIAL + CONFIRMED). `claimable` = eligible, can claim (SNAPSHOT + VERIFICATION + REWARD_AVAILABLE). `completed` = done (DISTRIBUTED). Defaults to `active,claimable` to show actionable airdrops. Default: "active,claimable".',
          ),
          ["active"],
        ),
        reward_type: s.withExamples(
          s.withEnum(s.string("Filter by reward type"), [
            "airdrop",
            "points",
            "whitelist",
            "nft",
            "role",
            "ambassador",
          ]),
          ["airdrop"],
        ),
        task_type: s.withExamples(
          s.withEnum(s.string("Filter activities containing tasks of this type"), [
            "social",
            "bounty-platforms",
            "testnet",
            "mainnet",
            "role",
            "form",
            "liquidity",
            "mint-nft",
            "game",
            "trading",
            "staking",
            "depin",
            "node",
            "ambassador",
            "hold",
            "check-wallet",
            "mint-domain",
            "predictions",
            "deploy",
          ]),
          ["social"],
        ),
        has_open: s.withExamples(s.boolean("Only return activities with currently OPEN tasks Default: false."), [true]),
        sort_by: s.withExamples(
          s.withEnum(s.string('Field to sort results by Default: "last_status_update".'), [
            "total_raise",
            "xscore",
            "last_status_update",
          ]),
          ["last_status_update"],
        ),
        order: orderSchema,
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        include_tasks: s.withExamples(s.boolean("Include full task list per activity Default: false."), [true]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_airdrop_activities",
    description: "Airdrop Activities.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/airdrop/activities",
      method: "GET",
      parameters: [
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Airdrop Activities.",
      {
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_events",
    description: "Project Event Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/events",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "type", in: "query", field: "type" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project Event Search.",
      {
        id: projectIdSchema,
        q: projectSearchQuerySchema,
        type: s.withExamples(
          s.withEnum(
            s.string(
              "Filter by event type. Can be `launch`, `upgrade`, `partnership`, `news`, `airdrop`, `listing`, or `twitter`.",
            ),
            ["launch", "upgrade", "partnership", "news", "airdrop", "listing", "twitter"],
          ),
          ["launch"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_fund",
    description: "Fund Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/fund",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fund Search.",
      {
        q: s.withExamples(
          s.string("Search keyword — fund name like `a16z`, `paradigm`, or `coinbase ventures`", {
            maxLength: 100,
          }),
          ["a16z"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_fundraising",
    description: "Fundraising Event Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/fundraising",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "source", in: "query", field: "source" },
        { name: "lang", in: "query", field: "lang" },
        { name: "min_importance", in: "query", field: "min_importance" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Fundraising Event Search.",
      {
        q: s.withExamples(
          s.string(
            "Optional project name, alias, symbol, title, or summary search query. When provided, the trimmed query must contain 2-100 Unicode characters.",
            { minLength: 2, maxLength: 100 },
          ),
          ["elliptic"],
        ),
        from: s.withExamples(
          s.string(
            "Inclusive event-time lower bound. Accepts Unix seconds, YYYY-MM-DD, or RFC3339; date-only values start at 00:00:00 UTC.",
          ),
          ["2026-07-01"],
        ),
        to: s.withExamples(
          s.string(
            "Inclusive event-time upper bound. Accepts Unix seconds, YYYY-MM-DD, or RFC3339; date-only values end at 23:59:59 UTC. Defaults to the current time.",
          ),
          ["2026-07-10"],
        ),
        source: s.withExamples(
          s.withEnum(s.string("Filter by public source type: social or news."), ["social", "news"]),
          ["social"],
        ),
        lang: s.withExamples(
          s.withEnum(
            s.string(
              'Display and search language. Missing translated fields fall back to English. ko is accepted as an alias for kr. Default: "en".',
            ),
            ["en", "zh", "ja", "kr", "ko"],
          ),
          ["en"],
        ),
        min_importance: s.withExamples(
          s.integer("Minimum importance score from 1 to 5. Omit to include unscored events.", {
            minimum: 1,
            maximum: 5,
          }),
          [3],
        ),
        sort_by: s.withExamples(
          s.withEnum(
            s.string('Sort by recency, query relevance, or importance. Relevance requires q. Default: "recency".'),
            ["recency", "relevance", "importance"],
          ),
          ["recency"],
        ),
        order: s.withExamples(
          s.withEnum(s.string('Sort order. Relevance only supports desc. Default: "desc".'), ["asc", "desc"]),
          ["desc"],
        ),
        limit: s.withExamples(s.integer("Results per page. Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(
          s.integer("Pagination offset. The offset plus limit cannot exceed 10000. Default: 0.", {
            minimum: 0,
          }),
          [0],
        ),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_news",
    description: "News Article Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/news",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for News Article Search.",
      {
        q: s.withExamples(s.string("Search keyword or phrase"), ["bitcoin ETF"]),
        limit: s.withExamples(s.integer("Results per page Default: 10.", { minimum: 1, maximum: 100 }), [10]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_prediction_market",
    description: "Search Prediction Markets.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/prediction-market",
      method: "GET",
      parameters: [
        { name: "condition_id", in: "query", field: "condition_id" },
        { name: "market_ticker", in: "query", field: "market_ticker" },
        { name: "platform", in: "query", field: "platform" },
        { name: "category", in: "query", field: "category" },
        { name: "status", in: "query", field: "status" },
        { name: "sort_by", in: "query", field: "sort_by" },
        { name: "order", in: "query", field: "order" },
        { name: "smart_money", in: "query", field: "smart_money" },
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Search Prediction Markets.",
      {
        condition_id: s.string("Polymarket condition ID for single-market lookup"),
        market_ticker: s.string("Kalshi market ticker for single-market lookup"),
        platform: s.withEnum(s.string("Filter by platform (omit for both)"), ["polymarket", "kalshi"]),
        category: s.withEnum(s.string("Filter by Surf-curated category"), [
          "crypto",
          "culture",
          "economics",
          "financials",
          "politics",
          "stem",
          "sports",
        ]),
        status: s.withEnum(s.string('Market status filter Default: "active".'), ["active", "closed", "finalized"]),
        sort_by: s.withEnum(s.string('Sort field Default: "volume_7d".'), [
          "volume_1d",
          "volume_7d",
          "volume_30d",
          "open_interest",
          "trade_count_7d",
          "days_to_resolution",
        ]),
        order: s.withEnum(s.string('Sort direction Default: "desc".'), ["asc", "desc"]),
        smart_money: s.withEnum(s.string("Filter by smart money direction (Polymarket only)"), ["bullish", "bearish"]),
        q: s.string(
          "Search markets by keyword in question text or ticker. Results include slug and event fields when available, but machine slugs are not searched.",
        ),
        limit: s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }),
        offset: s.integer("Pagination offset Default: 0.", { minimum: 0 }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_project",
    description: "Project Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/project",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project Search.",
      {
        q: s.withExamples(
          s.string("Search keyword — project name or ticker like `uniswap`, `bitcoin`, or `ETH`", {
            maxLength: 100,
          }),
          ["bitcoin"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_token",
    description: "Token Symbol Resolution.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/token",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "chain", in: "query", field: "chain" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Token Symbol Resolution.",
      {
        q: s.withExamples(
          s.string(
            "Exact token ticker symbol to resolve (case-insensitive), like `USDC` or `PEPE`. NOT a contract address, trading pair, or fuzzy token name.",
            { maxLength: 50 },
          ),
          ["USDC"],
        ),
        chain: s.withExamples(
          s.withEnum(s.string("Restrict resolution to one supported chain. Omit to search all supported chains."), [
            "ethereum",
            "base",
            "bsc",
            "arbitrum",
            "solana",
            "polygon",
            "optimism",
            "avalanche",
            "fantom",
            "tron",
            "linea",
            "mantle",
            "blast",
            "gnosis",
            "zksync",
            "scroll",
          ]),
          ["solana"],
        ),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_wallet",
    description: "Wallet Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/wallet",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Wallet Search.",
      {
        q: s.withExamples(s.string("Search keyword like `binance`, `vitalik.eth`, or `0xd8dA...`"), ["vitalik.eth"]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "search_web",
    description: "Web Search.",
    operationType: "read",
    route: {
      path: "/gateway/v1/search/web",
      method: "GET",
      parameters: [
        { name: "q", in: "query", field: "q" },
        { name: "limit", in: "query", field: "limit" },
        { name: "offset", in: "query", field: "offset" },
        { name: "site", in: "query", field: "site" },
        { name: "include_content", in: "query", field: "include_content" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Web Search.",
      {
        q: s.withExamples(s.string("Search query like `bitcoin price prediction 2026`"), [
          "bitcoin price prediction 2026",
        ]),
        limit: s.withExamples(s.integer("Results per page Default: 20.", { minimum: 1, maximum: 100 }), [20]),
        offset: s.withExamples(s.integer("Pagination offset Default: 0.", { minimum: 0 }), [0]),
        site: s.withExamples(s.string("Comma-separated domain filter like `coindesk.com` or `cointelegraph.com`"), [
          "coindesk.com,cointelegraph.com",
        ]),
        include_content: s.withExamples(
          s.boolean(
            "When false (default), search returns title/url/description only — fast (~2-3s) URL discovery. Set true to also include full markdown content for each result (~5-30KB per result, ~10-15s for limit=5). Use true only when the caller needs page content inline and won't follow up with `/web/fetch`. Default: false.",
          ),
          [false],
        ),
      },
      { required: ["q"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "social_mindshare",
    description: "Project Mindshare Time Series.",
    operationType: "read",
    route: {
      path: "/gateway/v1/social/mindshare",
      method: "GET",
      parameters: [
        { name: "id", in: "query", field: "id" },
        { name: "q", in: "query", field: "q" },
        { name: "interval", in: "query", field: "interval" },
        { name: "from", in: "query", field: "from" },
        { name: "to", in: "query", field: "to" },
        { name: "include_tag_percents", in: "query", field: "include_tag_percents" },
        { name: "source", in: "query", field: "source" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Project Mindshare Time Series.",
      {
        id: s.withExamples(s.string("Surf project UUID. Provide one of `id` or `q`."), [
          "25c6612a-395c-4974-94eb-3b5f9f4b2ed7",
        ]),
        q: s.withExamples(
          s.string("Entity name to resolve like `uniswap`, `ethereum`, or `aave`. Provide one of `id` or `q`."),
          ["uniswap"],
        ),
        interval: s.withExamples(
          s.withEnum(
            s.string(
              "Bucket size for each point in the returned time-series: `5m`, `1h`, `1d`, or `7d`. This is NOT a window — the default window is 30 days; pass `from`/`to` to bound the range. Not the same parameter as `time_range` (which does not exist on this endpoint). Note: when `include_tag_percents=true`, `5m` falls back to hourly data for the per-tag series (Argus has no 5m granularity for tag percentages).",
            ),
            ["5m", "1h", "1d", "7d"],
          ),
          ["1d"],
        ),
        from: s.withExamples(
          s.string("Start timestamp. Accepts Unix seconds (1704067200) or date string (2024-01-01)"),
          ["1704067200"],
        ),
        to: s.withExamples(s.string("End timestamp. Accepts Unix seconds (1706745600) or date string (2024-02-01)"), [
          "1706745600",
        ]),
        include_tag_percents: s.withExamples(
          s.boolean(
            "Set to `true` to additionally return per-tag mindshare percentage time-series in the `tag_percents` field. A project can belong to multiple tags; each tag returns its own sparse time-series (values are 0~100 percentages, not ratios). Default `false` — response shape is byte-identical to the legacy format. Default: false.",
          ),
          [true],
        ),
        source: s.withEnum(
          s.string(
            'Data lane: `x` (X/Twitter, default) or `binance_square` (Binance Square). Response shape is identical across sources. Default: "x".',
          ),
          ["x", "binance_square"],
        ),
      },
      { required: ["interval"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf response with the original provider envelope and fields.",
      {
        $schema: s.string("Response JSON Schema URL."),
        data: dataSchema,
        meta: metaSchema,
        tag_percents: s.array("Per-tag mindshare percentage series, present when requested.", {
          description: "Upstream result item, preserving all provider fields.",
        }),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "web_fetch",
    description: "Web Page Fetch.",
    operationType: "read",
    route: {
      path: "/gateway/v1/web/fetch",
      method: "GET",
      parameters: [
        { name: "url", in: "query", field: "url" },
        { name: "target_selector", in: "query", field: "target_selector" },
        { name: "remove_selector", in: "query", field: "remove_selector" },
        { name: "wait_for_selector", in: "query", field: "wait_for_selector" },
        { name: "timeout", in: "query", field: "timeout" },
      ],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for Web Page Fetch.",
      {
        url: s.withExamples(s.string("URL to fetch and parse"), ["https://ethereum.org"]),
        target_selector: s.withExamples(s.string("CSS selector to extract specific content"), ["article.main-content"]),
        remove_selector: s.withExamples(s.string("CSS selector to remove unwanted elements"), ["nav,footer,.ads"]),
        wait_for_selector: s.withExamples(s.string("CSS selector to wait for before extracting"), [".content-loaded"]),
        timeout: s.withExamples(
          s.integer("Request timeout in milliseconds Default: 30000.", {
            minimum: 1000,
            maximum: 60000,
          }),
          [5000],
        ),
      },
      { required: ["url"], additionalProperties: false },
    ),
    outputSchema: objectResponseSchema,
  },
  {
    name: "x_tweets",
    description: "X Tweets by IDs.",
    operationType: "read",
    route: {
      path: "/gateway/v1/x/tweets",
      method: "GET",
      parameters: [{ name: "ids", in: "query", field: "ids" }],
      body: false,
    },
    inputSchema: s.object(
      "Parameters for X Tweets by IDs.",
      {
        ids: {
          ...s.withExamples(
            s.string(
              "Comma-separated numeric tweet IDs, from 1 to 100 values; each ID must contain 1 to 19 digits without leading zeros",
              { minLength: 1, maxLength: 1999, pattern: "^(0|[1-9][0-9]*)(,(0|[1-9][0-9]*))*$" },
            ),
            ["1228393702244134912"],
          ),
          patternDescription: "comma-separated canonical numeric tweet IDs",
        },
      },
      { required: ["ids"], additionalProperties: false },
    ),
    outputSchema: arrayResponseSchema,
  },
  {
    name: "research",
    description:
      "Research crypto and equity markets with Surf Research 2.0 and return non-streaming Responses JSON. Use previous_response_id to continue a response chain. surf-2.0-instant favors latency; surf-2.0 supports optional nested reasoning.effort for deeper analysis, with higher latency and credit cost.",
    operationType: "write",
    route: { path: "/gateway/v1/responses", method: "POST", parameters: [], body: true },
    inputSchema: s.object(
      "Research request parameters.",
      {
        model: s.withEnum(s.string("Surf research model."), ["surf-2.0", "surf-2.0-instant"]),
        input: {
          description: "Prompt text or a Responses-compatible array of input items.",
          anyOf: [
            s.string("Plain-text research prompt."),
            s.array(
              "Responses-compatible input items.",
              s.object(
                "Input item preserving Responses-compatible fields.",
                {},
                { required: [], additionalProperties: true },
              ),
            ),
          ],
        },
        instructions: s.string("System or developer instructions guiding the answer."),
        stream: {
          ...s.boolean("Transport is normalized to non-streaming JSON; only false is accepted."),
          const: false,
        },
        include: s.array(
          "Additional response fields requested from the backend.",
          s.string("Response field identifier."),
        ),
        max_output_tokens: s.integer("Maximum generated output tokens."),
        metadata: s.object(
          "Client metadata; reserved Surf identity keys are ignored upstream.",
          {},
          { required: [], additionalProperties: true },
        ),
        previous_response_id: s.string("Previous response ID for continuing a response chain."),
        prompt: s.object(
          "Reusable prompt configuration in Responses format.",
          {},
          { required: [], additionalProperties: true },
        ),
        reasoning: s.object(
          "Responses reasoning configuration; omit for a fast single-pass answer.",
          {
            effort: s.withEnum(s.string("Reasoning effort; surf-2.0 latency and credit cost increase with effort."), [
              "none",
              "minimal",
              "low",
              "medium",
              "high",
              "xhigh",
            ]),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: ["model", "input"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "Surf Research response preserving all output items and metadata.",
      {
        id: s.string("Response identifier."),
        object: s.string("Response object type."),
        created_at: s.integer("Response creation timestamp in Unix seconds."),
        status: s.string("Response generation status."),
        model: s.string("Model used for the response."),
        output: s.array(
          "Responses output items, including messages and content.",
          s.object("Output item with original provider fields.", {}, { required: [], additionalProperties: true }),
        ),
        output_text: s.string("Generated answer text when supplied."),
        usage: s.object("Input, output, and total token usage.", {}, { required: [], additionalProperties: true }),
        metadata: s.object("Response metadata.", {}, { required: [], additionalProperties: true }),
        error: { description: "Response error." },
        incomplete_details: { description: "Response incomplete details." },
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "credit_balance",
    description: "Read the current API account credit balance.",
    operationType: "read",
    route: { path: "/gateway/v1/me/credit-balance", method: "GET", parameters: [], body: false },
    inputSchema: s.object("Credit balance query parameters.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "Credit balance response preserving the provider envelope.",
      {},
      { required: [], additionalProperties: true },
    ),
  },
];
