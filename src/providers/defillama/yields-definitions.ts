import type { DefillamaDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  underlyingTokensEntrySchema,
  currentSchema,
  rewardSchema,
  avg7dSchema,
  avg30dSchema,
  apySchema,
  sourcePoolSchema,
  pricePerShareSchema,
  rangeSchema,
  amountSchema,
  usdSchema,
  totalSchema,
} from "./shared-schemas.ts";
export const yieldsDefinitions: DefillamaDefinition[] = [
  {
    name: "get_yields_v1_pools",
    description:
      "Retrieve the latest data for all pools in the legacy v1 response format. Serves the former `/yields/pools` response format, including the extra fields from `/yields/poolsOld`. Frozen for compatibility: the shape will not change and no new fields will be added - use `/yields/v2/earn` for new integrations. Available with no_auth or api_key. Free access ends on November 13, 2026; API-key access uses the legacy v1 format.",
    route: {
      path: "/yields/v1/pools",
      parameters: [],
      free: { baseUrl: "https://yields.llama.fi", path: "/pools" },
      wrap: false,
    },
    inputSchema: s.object("Parameters for get_yields_v1_pools.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        status: s.string("status returned by DeFiLlama."),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              pool: s.string("Pool id (UUID). Same id space as the v2 yields API."),
              timestamp: s.string("Timestamp of the latest data point."),
              project: s.string("project returned by DeFiLlama."),
              chain: s.string("chain returned by DeFiLlama."),
              symbol: s.string("Uppercase symbol."),
              poolMeta: s.nullable(s.string("poolMeta returned by DeFiLlama.")),
              underlyingTokens: s.nullable(
                s.array("Underlying token addresses, lowercase.", s.string("Result entry returned by DeFiLlama.")),
              ),
              rewardTokens: s.nullable(
                s.array(
                  "Reward token addresses, lowercase; null when no rewards are currently flowing.",
                  s.string("Result entry returned by DeFiLlama."),
                ),
              ),
              poolTokenAddress: s.nullable(s.string("Receipt/pool token address, lowercase.")),
              tvlUsd: s.number("TVL in USD; for lending markets this is available liquidity, not total supplied."),
              apy: s.number("apy returned by DeFiLlama."),
              apyBase: s.nullable(s.number("apyBase returned by DeFiLlama.")),
              apyReward: s.nullable(s.number("apyReward returned by DeFiLlama.")),
              il7d: s.nullable(s.number("Always null; no longer computed.")),
              apyBase7d: s.nullable(s.number("Always null; no longer computed.")),
              volumeUsd1d: s.nullable(s.number("volumeUsd1d returned by DeFiLlama.")),
              volumeUsd7d: s.nullable(s.number("7-day volume in USD.")),
              apyBaseInception: s.nullable(s.number("Always null; no longer computed.")),
              url: s.string("url returned by DeFiLlama."),
              apyPct1D: s.nullable(s.number("Absolute APY change vs 1 day ago, in percentage points.")),
              apyPct7D: s.nullable(s.number("apyPct7D returned by DeFiLlama.")),
              apyPct30D: s.nullable(s.number("apyPct30D returned by DeFiLlama.")),
              apyMean30d: s.nullable(s.number("30-day mean APY.")),
              stablecoin: s.boolean("Whether every underlying asset is a stablecoin."),
              ilRisk: s.string("ilRisk returned by DeFiLlama."),
              exposure: s.string("exposure returned by DeFiLlama."),
              return: s.nullable(s.number("Always null; no longer computed.")),
              count: s.nullable(s.number("Always null; no longer computed.")),
              apyMeanExpanding: s.nullable(s.number("Always null; no longer computed.")),
              apyStdExpanding: s.nullable(s.number("Always null; no longer computed.")),
              mu: s.nullable(s.number("Always null; no longer computed.")),
              sigma: s.nullable(s.number("Always null; no longer computed.")),
              outlier: s.nullable(s.boolean("Always null; no longer computed.")),
              project_factorized: s.nullable(s.number("Always null; no longer computed.")),
              chain_factorized: s.nullable(s.number("Always null; no longer computed.")),
              predictions: s.object(
                "Always null; no longer computed.",
                {
                  predictedClass: s.nullable(s.string("predictedClass returned by DeFiLlama.")),
                  predictedProbability: s.nullable(s.number("predictedProbability returned by DeFiLlama.")),
                  binnedConfidence: s.nullable(s.number("binnedConfidence returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              pool_old: s.string("The original pool key (usually contains a pool address)."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v1_chart_by_pool",
    description:
      "Get historical APY and TVL of a pool in the legacy v1 response format. Daily history in the legacy v1 format. Every value is the day's last observation. Unknown pool ids return an empty `data` array. Available with no_auth or api_key. Free access ends on November 13, 2026; API-key access uses the legacy v1 format.",
    route: {
      path: "/yields/v1/chart/{pool}",
      parameters: [{ name: "pool", in: "path" }],
      free: { baseUrl: "https://yields.llama.fi", path: "/chart/{pool}" },
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v1_chart_by_pool.",
      {
        pool: s.string("pool id (UUID), from /yields/v1/pools (property is called pool)", {
          minLength: 1,
        }),
      },
      { required: ["pool"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        status: s.string("status returned by DeFiLlama."),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              timestamp: s.string("timestamp returned by DeFiLlama."),
              tvlUsd: s.nullable(s.number("The day's last observation.")),
              apy: s.nullable(s.number("The day's last observation.")),
              apyBase: s.nullable(s.number("apyBase returned by DeFiLlama.")),
              apyReward: s.nullable(s.number("apyReward returned by DeFiLlama.")),
              il7d: s.nullable(s.number("Always null; no longer computed.")),
              apyBase7d: s.nullable(s.number("Always null; no longer computed.")),
              pricePerShare: s.nullable(s.number("The day's last observation.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v1_pools_borrow",
    description:
      "Borrow costs APY of assets from lending markets in the legacy v1 response format. Serves the former `/yields/poolsBorrow` response format. Markets that cannot currently be borrowed from are not listed. Frozen for compatibility: the shape will not change and no new fields will be added - use `/yields/v2/borrow/markets` for new integrations. Requires an API plan key.",
    route: { path: "/yields/v1/poolsBorrow", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_yields_v1_pools_borrow.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        status: s.string("status returned by DeFiLlama."),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              chain: s.string("chain returned by DeFiLlama."),
              project: s.string("project returned by DeFiLlama."),
              symbol: s.string("Uppercase symbol."),
              tvlUsd: s.nullable(
                s.number("TVL in USD; for lending markets this is available liquidity, not total supplied."),
              ),
              apyBase: s.nullable(s.number("apyBase returned by DeFiLlama.")),
              apyReward: s.nullable(s.number("apyReward returned by DeFiLlama.")),
              apy: s.nullable(s.number("apy returned by DeFiLlama.")),
              rewardTokens: s.nullable(
                s.array(
                  "Reward token addresses, lowercase; null when no rewards are currently flowing.",
                  s.string("Result entry returned by DeFiLlama."),
                ),
              ),
              pool: s.string("Pool id (UUID). Same id space as the v2 yields API."),
              apyPct1D: s.nullable(s.number("Absolute APY change vs 1 day ago, in percentage points.")),
              apyPct7D: s.nullable(s.number("apyPct7D returned by DeFiLlama.")),
              apyPct30D: s.nullable(s.number("apyPct30D returned by DeFiLlama.")),
              stablecoin: s.boolean("Whether every underlying asset is a stablecoin."),
              ilRisk: s.string("ilRisk returned by DeFiLlama."),
              exposure: s.string("exposure returned by DeFiLlama."),
              predictions: s.object(
                "Always null; no longer computed.",
                {
                  predictedClass: s.nullable(s.string("predictedClass returned by DeFiLlama.")),
                  predictedProbability: s.nullable(s.number("predictedProbability returned by DeFiLlama.")),
                  binnedConfidence: s.nullable(s.number("binnedConfidence returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              poolMeta: s.nullable(s.string("poolMeta returned by DeFiLlama.")),
              mu: s.nullable(s.number("Always null; no longer computed.")),
              sigma: s.nullable(s.number("Always null; no longer computed.")),
              count: s.nullable(s.number("Always null; no longer computed.")),
              outlier: s.nullable(s.boolean("Always null; no longer computed.")),
              underlyingTokens: s.nullable(
                s.array("Underlying token addresses, lowercase.", s.string("Result entry returned by DeFiLlama.")),
              ),
              il7d: s.nullable(s.number("Always null; no longer computed.")),
              apyBase7d: s.nullable(s.number("Always null; no longer computed.")),
              apyMean30d: s.nullable(s.number("30-day mean APY.")),
              volumeUsd1d: s.nullable(s.number("volumeUsd1d returned by DeFiLlama.")),
              volumeUsd7d: s.nullable(s.number("7-day volume in USD.")),
              apyBaseInception: s.nullable(s.number("Always null; no longer computed.")),
              apyBaseBorrow: s.nullable(s.number("apyBaseBorrow returned by DeFiLlama.")),
              apyRewardBorrow: s.nullable(s.number("apyRewardBorrow returned by DeFiLlama.")),
              totalSupplyUsd: s.nullable(s.number("totalSupplyUsd returned by DeFiLlama.")),
              totalBorrowUsd: s.nullable(s.number("totalBorrowUsd returned by DeFiLlama.")),
              debtCeilingUsd: s.nullable(s.number("debtCeilingUsd returned by DeFiLlama.")),
              ltv: s.nullable(s.number("ltv returned by DeFiLlama.")),
              borrowable: s.nullable(s.boolean("borrowable returned by DeFiLlama.")),
              mintedCoin: s.nullable(
                s.string("The borrowed token's symbol when it differs from the deposited asset (CDP-style markets)."),
              ),
              borrowFactor: s.nullable(s.number("Always null; no longer computed.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v1_chart_lend_borrow_by_pool",
    description:
      "Historical borrow cost APY from a pool on a lending market in the legacy v1 response format. Daily borrow-market history in the legacy v1 format. Every value is the day's last observation. Unknown pool ids return an empty `data` array. Requires an API plan key.",
    route: {
      path: "/yields/v1/chartLendBorrow/{pool}",
      parameters: [{ name: "pool", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v1_chart_lend_borrow_by_pool.",
      {
        pool: s.string("pool id (UUID), from /yields/v1/poolsBorrow (property is called pool)", {
          minLength: 1,
        }),
      },
      { required: ["pool"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        status: s.string("status returned by DeFiLlama."),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              timestamp: s.string("timestamp returned by DeFiLlama."),
              totalSupplyUsd: s.nullable(s.number("The day's last observation.")),
              totalBorrowUsd: s.nullable(s.number("The day's last observation.")),
              debtCeilingUsd: s.nullable(s.number("debtCeilingUsd returned by DeFiLlama.")),
              apyBase: s.nullable(s.number("The day's last observation.")),
              apyReward: s.nullable(s.number("apyReward returned by DeFiLlama.")),
              apyBaseBorrow: s.nullable(s.number("The day's last observation.")),
              apyRewardBorrow: s.nullable(s.number("apyRewardBorrow returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v2_earn",
    description:
      "Retrieve the latest data for all earn pools. Returns every tracked earn pool (supply-side yield), sorted by TVL descending. APY values are percentages, attributed into `base` (organic), `reward` (incentive emissions) and `total` (base + reward) over `current`, `avg_7d` and `avg_30d` windows. Pools whose underlying token is itself yield-bearing additionally report that yield under `intrinsic`; it is not included in the pool APY. For a filtered, paginated variant of the same rows use `/yields/v2/earn/query`. Requires an API plan key.",
    route: { path: "/yields/v2/earn", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_yields_v2_earn.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Pool id (UUID). Same id space as the v1 yields API pool field."),
              pool_key: s.string("Stable pool key."),
              pool_token: s.nullable(
                s.object(
                  "Receipt / vault token representing the position; null when the pool has no transferable pool token",
                  {
                    address: s.string("address returned by DeFiLlama."),
                    symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                    name: s.nullable(s.string("name returned by DeFiLlama.")),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
              display: s.object(
                "Display strings for listings",
                {
                  label: s.nullable(s.string("label returned by DeFiLlama.")),
                  detail: s.nullable(s.string("detail returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              reference_asset_symbol: s.nullable(
                s.string("The asset you provide to enter the pool (e.g. ETH, USDC, BTC)"),
              ),
              url: s.nullable(s.string("Pool page on the protocol app")),
              protocol: s.string("Protocol display name"),
              chain: s.string("Chain display name"),
              underlying_tokens: s.array("Tokens deposited into the pool", underlyingTokensEntrySchema),
              reward_tokens: s.array(
                "Incentive tokens currently emitted to the pool; empty when there are none",
                underlyingTokensEntrySchema,
              ),
              tvl_usd: s.nullable(s.number("Total value locked in USD")),
              apy: s.object(
                "Supply APY in percent, attributed into base (organic) and reward (incentive emissions) components",
                { current: currentSchema, avg_7d: avg7dSchema, avg_30d: avg30dSchema },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.nullable(
                s.object(
                  "Yield accruing inside a yield-bearing underlying token, e.g. the stETH staking yield inside a wstETH pool. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                  { apy: apySchema, source_pool: sourcePoolSchema },
                  { required: [], additionalProperties: true },
                ),
              ),
              stability_30d: s.object(
                "Stability score (0 to 1) of the trailing 30-day APY series, computed as 1 / (1 + coefficient of variation); higher is steadier. Keyed by APY composition: read the leaf matching the APY components you consume (base, base + reward, base + intrinsic, base + reward + intrinsic).",
                {
                  base: s.nullable(s.number("base returned by DeFiLlama.")),
                  base_reward: s.nullable(s.number("base_reward returned by DeFiLlama.")),
                  base_intrinsic: s.nullable(s.number("base_intrinsic returned by DeFiLlama.")),
                  base_reward_intrinsic: s.nullable(s.number("base_reward_intrinsic returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              price_per_share: pricePerShareSchema,
              volume_1d_usd: s.nullable(s.number("Trailing 24h trading volume in USD for DEX pools; null otherwise")),
              attributes: s.object(
                "Boolean attributes, also available as filters on /yields/v2/earn/query",
                {
                  stablecoin_only: s.boolean("All pool assets are stablecoins"),
                  single_asset_exposure: s.boolean("Position is exposed to a single asset"),
                  impermanent_loss_risk: s.boolean("Position can suffer impermanent loss"),
                },
                { required: [], additionalProperties: true },
              ),
              holders: s.object(
                "Pool token holder statistics; values are null where holder data is not tracked",
                {
                  count: s.nullable(s.number("Number of pool token holders")),
                  avg_position_usd: s.nullable(s.number("Average position size in USD")),
                  top_10_share_pct: s.nullable(s.number("Share of supply held by the top 10 holders, in percent")),
                },
                { required: [], additionalProperties: true },
              ),
              available_supply_usd: s.nullable(
                s.number(
                  "Remaining deposit capacity in USD for lending pools with a supply cap (cap minus TVL, floored at 0); null when the pool has no cap",
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
    name: "get_yields_v2_earn_query",
    description:
      "Retrieve a filtered, paginated page of earn pools. Same rows as `/yields/v2/earn`, filtered and paginated server-side while keeping the TVL-descending order. All filters combine with AND; `chain` and `protocol` may be repeated to match any of up to 20 values. Unknown query parameters and out-of-range values are rejected with `400 INVALID_QUERY_PARAM`. Without parameters the top 100 pools by TVL are returned. Requires an API plan key.",
    route: {
      path: "/yields/v2/earn/query",
      parameters: [
        { name: "chain", in: "query" },
        { name: "protocol", in: "query" },
        { name: "stablecoin", in: "query" },
        { name: "single_asset_exposure", in: "query" },
        { name: "impermanent_loss_risk", in: "query" },
        { name: "min_tvl", in: "query" },
        { name: "page", in: "query" },
        { name: "limit", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v2_earn_query.",
      {
        chain: s.array(
          "Chain slug (lowercase). Repeat the parameter to match any of several chains, e.g. chain=ethereum&chain=arbitrum (at most 20 values)",
          s.string("Chain or protocol slug.", { minLength: 1 }),
          { minItems: 1, maxItems: 20 },
        ),
        protocol: s.array(
          "Protocol slug (lowercase, e.g. aave-v3). Repeat the parameter to match any of several protocols (at most 20 values)",
          s.string("Chain or protocol slug.", { minLength: 1 }),
          { minItems: 1, maxItems: 20 },
        ),
        stablecoin: s.boolean("true keeps only pools whose assets are all stablecoins, false only the rest"),
        single_asset_exposure: s.boolean("true keeps only pools exposed to a single asset, false only the rest"),
        impermanent_loss_risk: s.boolean("true keeps only pools with impermanent loss risk, false only the rest"),
        min_tvl: s.number("Minimum pool TVL in USD (inclusive)"),
        page: s.integer("1-based page number; default 1", { minimum: 1 }),
        limit: s.integer("Page size between 1 and 300; default 100. Values above 300 are rejected, not clamped", {
          minimum: 1,
          maximum: 300,
        }),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Pool id (UUID). Same id space as the v1 yields API pool field."),
              pool_key: s.string("Stable pool key."),
              pool_token: s.nullable(
                s.object(
                  "Receipt / vault token representing the position; null when the pool has no transferable pool token",
                  {
                    address: s.string("address returned by DeFiLlama."),
                    symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                    name: s.nullable(s.string("name returned by DeFiLlama.")),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
              display: s.object(
                "Display strings for listings",
                {
                  label: s.nullable(s.string("label returned by DeFiLlama.")),
                  detail: s.nullable(s.string("detail returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              reference_asset_symbol: s.nullable(
                s.string("The asset you provide to enter the pool (e.g. ETH, USDC, BTC)"),
              ),
              url: s.nullable(s.string("Pool page on the protocol app")),
              protocol: s.string("Protocol display name"),
              chain: s.string("Chain display name"),
              underlying_tokens: s.array("Tokens deposited into the pool", underlyingTokensEntrySchema),
              reward_tokens: s.array(
                "Incentive tokens currently emitted to the pool; empty when there are none",
                underlyingTokensEntrySchema,
              ),
              tvl_usd: s.nullable(s.number("Total value locked in USD")),
              apy: s.object(
                "Supply APY in percent, attributed into base (organic) and reward (incentive emissions) components",
                { current: currentSchema, avg_7d: avg7dSchema, avg_30d: avg30dSchema },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.nullable(
                s.object(
                  "Yield accruing inside a yield-bearing underlying token, e.g. the stETH staking yield inside a wstETH pool. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                  { apy: apySchema, source_pool: sourcePoolSchema },
                  { required: [], additionalProperties: true },
                ),
              ),
              stability_30d: s.object(
                "Stability score (0 to 1) of the trailing 30-day APY series, computed as 1 / (1 + coefficient of variation); higher is steadier. Keyed by APY composition: read the leaf matching the APY components you consume (base, base + reward, base + intrinsic, base + reward + intrinsic).",
                {
                  base: s.nullable(s.number("base returned by DeFiLlama.")),
                  base_reward: s.nullable(s.number("base_reward returned by DeFiLlama.")),
                  base_intrinsic: s.nullable(s.number("base_intrinsic returned by DeFiLlama.")),
                  base_reward_intrinsic: s.nullable(s.number("base_reward_intrinsic returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              price_per_share: pricePerShareSchema,
              volume_1d_usd: s.nullable(s.number("Trailing 24h trading volume in USD for DEX pools; null otherwise")),
              attributes: s.object(
                "Boolean attributes, also available as filters on /yields/v2/earn/query",
                {
                  stablecoin_only: s.boolean("All pool assets are stablecoins"),
                  single_asset_exposure: s.boolean("Position is exposed to a single asset"),
                  impermanent_loss_risk: s.boolean("Position can suffer impermanent loss"),
                },
                { required: [], additionalProperties: true },
              ),
              holders: s.object(
                "Pool token holder statistics; values are null where holder data is not tracked",
                {
                  count: s.nullable(s.number("Number of pool token holders")),
                  avg_position_usd: s.nullable(s.number("Average position size in USD")),
                  top_10_share_pct: s.nullable(s.number("Share of supply held by the top 10 holders, in percent")),
                },
                { required: [], additionalProperties: true },
              ),
              available_supply_usd: s.nullable(
                s.number(
                  "Remaining deposit capacity in USD for lending pools with a supply cap (cap minus TVL, floored at 0); null when the pool has no cap",
                ),
              ),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        pagination: s.object(
          "pagination returned by DeFiLlama.",
          {
            total: s.integer("Total number of rows matching the filters, across all pages"),
            page: s.integer("page returned by DeFiLlama."),
            limit: s.integer("limit returned by DeFiLlama."),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v2_earn_by_id_history",
    description:
      "Retrieve daily history for an earn pool. Daily TVL, attributed APY and price per share for one earn pool, oldest first. APY carries `avg_1d` (that day), `avg_7d` and `avg_30d` (trailing averages ending that day) windows, each attributed into base/reward/total. Requires an API plan key.",
    route: {
      path: "/yields/v2/earn/{id}/history",
      parameters: [
        { name: "id", in: "path" },
        { name: "range", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v2_earn_by_id_history.",
      { id: s.string("Earn pool id (UUID)", { minLength: 1 }), range: rangeSchema },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.string("Day (UTC)"),
              tvl_usd: s.nullable(s.number("Total value locked in USD at that day")),
              apy: s.object(
                "Supply APY in percent, attributed into base (organic) and reward (incentive emissions) components",
                {
                  avg_1d: s.object(
                    "Average over that day",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: s.nullable(s.number("base plus reward, in percent")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_7d: avg7dSchema,
                  avg_30d: avg30dSchema,
                },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.nullable(
                s.object(
                  "Intrinsic yield of a yield-bearing underlying token. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                  {
                    apy: s.object(
                      "Intrinsic APY in percent",
                      {
                        avg_1d: s.object(
                          "Average over that day",
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
                    ),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
              price_per_share: pricePerShareSchema,
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_yields_v2_earn_verified",
    description:
      "Retrieve the latest verified data for all measured earn pools. Measured yield for the `/yields/v2/earn` pools we simulate, sorted by verified TVL descending. Each figure is replayed from a real holder's withdrawal against archive state, so it shows what an exit would have paid rather than what the protocol reports; the two can disagree without either being wrong. APY is always the base leg, since a withdrawal cannot see reward emissions, and is unclamped, so it can be negative. A pool appears here only while it is listed on `/yields/v2/earn`, is not withheld for review, and has at least one measured day; join on `id`. Requires an API plan key.",
    route: { path: "/yields/v2/earn/verified", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_yields_v2_earn_verified.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Pool id (UUID); joins to `/yields/v2/earn`"),
              apy: s.object(
                "Measured base APY in percent. Base only, since a withdrawal cannot see reward emissions, and unclamped, so it can be negative. All three windows end at `apy_as_of`.",
                {
                  avg_1d: s.nullable(s.number("Trailing 1-day average")),
                  avg_7d: s.nullable(s.number("Trailing 7-day average")),
                  avg_30d: s.nullable(s.number("Trailing 30-day average")),
                },
                { required: [], additionalProperties: true },
              ),
              apy_as_of: s.nullable(s.string("Timestamp the APY windows end at")),
              apy_note: s.nullable(
                s.string(
                  "Why the APY is absent or qualified. Show it wherever the APY renders blank; null for most pools.",
                ),
              ),
              apy_confidence: s.nullable(
                s.withEnum(
                  s.string(
                    "How closely independent holders agreed on the redemption rate. Grades the measurement, not the pool.",
                  ),
                  ["high", "medium", "low", "conflict", null],
                ),
              ),
              exit: s.object(
                "Exit health from the most recent simulated withdrawal.",
                {
                  status: s.nullable(
                    s.withEnum(
                      s.string(
                        "What a withdrawal would do today: `instant` all of it leaves now, `queued` accepted but paid later, `partial` bounded by `exit_liquidity`, `depleted` the lane is dust (under 0.1% of TVL and under $10k), `unavailable` nothing was accepted, `blocked` reverted as paused or unrecognized. Null when unclassified.",
                      ),
                      ["instant", "queued", "partial", "depleted", "unavailable", "blocked", null],
                    ),
                  ),
                  eta_seconds: s.nullable(
                    s.number("Wait before a queued withdrawal can be claimed. Only set while `status` is `queued`."),
                  ),
                  fee_bps: s.nullable(
                    s.number(
                      "Hidden exit fee: median discount against the reported rate over the last 30 discount observations. Null when never observed, never a claimed zero.",
                    ),
                  ),
                  as_of: s.nullable(s.string("Timestamp of the exit observation")),
                },
                { required: [], additionalProperties: true },
              ),
              exit_liquidity: s.object(
                "Funded exit capacity, not backing inventory; for queued pools this is the on-chain funding buffer, not instant liquidity. Null means no on-chain capacity is exposed, not zero.",
                {
                  amount: amountSchema,
                  usd: usdSchema,
                  slippage_bps: s.nullable(s.number("Price impact of the simulated exit, in basis points")),
                  as_of: s.nullable(s.string("Day (UTC) the capacity was measured")),
                },
                { required: [], additionalProperties: true },
              ),
              tvl: s.object(
                "Receipt supply priced at the rate an exit actually paid, not the reported figure.",
                {
                  amount: s.nullable(
                    s.string(
                      "Receipt supply at the executed redemption rate. Raw base units of `denomination`, as a decimal string; parse with BigInt, not Number.",
                    ),
                  ),
                  usd: s.nullable(s.number("Verified TVL in USD. Null when `denomination` is.")),
                  as_of: s.nullable(s.string("Day (UTC) the TVL was measured")),
                },
                { required: [], additionalProperties: true },
              ),
              price_per_share: s.nullable(
                s.number(
                  "Underlying assets per position token, in human units. For rebasing tokens (aTokens, stETH) this is per internal share, so read it as a series normalized to its first point, not as an absolute.",
                ),
              ),
              denomination: s.nullable(
                s.object(
                  "Asset an exit pays out, and the decimals its raw amounts use. Null when it could not be pinned; the USD fields go null with it, and you must not assume 18.",
                  {
                    address: s.string("Payout token address"),
                    decimals: s.nullable(s.integer("Decimals of the payout token")),
                  },
                  { required: [], additionalProperties: true },
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
    name: "get_yields_v2_earn_verified_by_id",
    description:
      "Retrieve the latest verified data for one earn pool. The same row `/yields/v2/earn/verified` serves for this pool, plus `methods`: the on-chain calls the simulation executes, in order. Requires an API plan key.",
    route: {
      path: "/yields/v2/earn/verified/{id}",
      parameters: [{ name: "id", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v2_earn_verified_by_id.",
      { id: s.string("Earn pool id (UUID)", { minLength: 1 }) },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.object(
          "data returned by DeFiLlama.",
          {
            id: s.string("Pool id (UUID); joins to `/yields/v2/earn`"),
            apy: s.object(
              "Measured base APY in percent. Base only, since a withdrawal cannot see reward emissions, and unclamped, so it can be negative. All three windows end at `apy_as_of`.",
              {
                avg_1d: s.nullable(s.number("Trailing 1-day average")),
                avg_7d: s.nullable(s.number("Trailing 7-day average")),
                avg_30d: s.nullable(s.number("Trailing 30-day average")),
              },
              { required: [], additionalProperties: true },
            ),
            apy_as_of: s.nullable(s.string("Timestamp the APY windows end at")),
            apy_note: s.nullable(
              s.string(
                "Why the APY is absent or qualified. Show it wherever the APY renders blank; null for most pools.",
              ),
            ),
            apy_confidence: s.nullable(
              s.withEnum(
                s.string(
                  "How closely independent holders agreed on the redemption rate. Grades the measurement, not the pool.",
                ),
                ["high", "medium", "low", "conflict", null],
              ),
            ),
            exit: s.object(
              "Exit health from the most recent simulated withdrawal.",
              {
                status: s.nullable(
                  s.withEnum(
                    s.string(
                      "What a withdrawal would do today: `instant` all of it leaves now, `queued` accepted but paid later, `partial` bounded by `exit_liquidity`, `depleted` the lane is dust (under 0.1% of TVL and under $10k), `unavailable` nothing was accepted, `blocked` reverted as paused or unrecognized. Null when unclassified.",
                    ),
                    ["instant", "queued", "partial", "depleted", "unavailable", "blocked", null],
                  ),
                ),
                eta_seconds: s.nullable(
                  s.number("Wait before a queued withdrawal can be claimed. Only set while `status` is `queued`."),
                ),
                fee_bps: s.nullable(
                  s.number(
                    "Hidden exit fee: median discount against the reported rate over the last 30 discount observations. Null when never observed, never a claimed zero.",
                  ),
                ),
                as_of: s.nullable(s.string("Timestamp of the exit observation")),
              },
              { required: [], additionalProperties: true },
            ),
            exit_liquidity: s.object(
              "Funded exit capacity, not backing inventory; for queued pools this is the on-chain funding buffer, not instant liquidity. Null means no on-chain capacity is exposed, not zero.",
              {
                amount: amountSchema,
                usd: usdSchema,
                slippage_bps: s.nullable(s.number("Price impact of the simulated exit, in basis points")),
                as_of: s.nullable(s.string("Day (UTC) the capacity was measured")),
              },
              { required: [], additionalProperties: true },
            ),
            tvl: s.object(
              "Receipt supply priced at the rate an exit actually paid, not the reported figure.",
              {
                amount: s.nullable(
                  s.string(
                    "Receipt supply at the executed redemption rate. Raw base units of `denomination`, as a decimal string; parse with BigInt, not Number.",
                  ),
                ),
                usd: s.nullable(s.number("Verified TVL in USD. Null when `denomination` is.")),
                as_of: s.nullable(s.string("Day (UTC) the TVL was measured")),
              },
              { required: [], additionalProperties: true },
            ),
            price_per_share: s.nullable(
              s.number(
                "Underlying assets per position token, in human units. For rebasing tokens (aTokens, stETH) this is per internal share, so read it as a series normalized to its first point, not as an absolute.",
              ),
            ),
            denomination: s.nullable(
              s.object(
                "Asset an exit pays out, and the decimals its raw amounts use. Null when it could not be pinned; the USD fields go null with it, and you must not assume 18.",
                {
                  address: s.string("Payout token address"),
                  decimals: s.nullable(s.integer("Decimals of the payout token")),
                },
                { required: [], additionalProperties: true },
              ),
            ),
            methods: s.nullable(
              s.array(
                "On-chain calls the simulation executes, in order. Null when not recorded.",
                s.string("Result entry returned by DeFiLlama."),
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
    name: "get_yields_v2_earn_verified_by_id_history",
    description:
      "Retrieve daily verified history for an earn pool. Daily measured APY, share price, verified TVL and exit health for one pool, oldest first. APY carries `avg_1d` (that day), `avg_7d` and `avg_30d` (trailing averages ending that day). Days the pool was not measured are omitted, so the dates are not contiguous. Every `range` is sliced from the same cached series. Requires an API plan key.",
    route: {
      path: "/yields/v2/earn/verified/{id}/history",
      parameters: [
        { name: "id", in: "path" },
        { name: "range", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v2_earn_verified_by_id_history.",
      { id: s.string("Earn pool id (UUID)", { minLength: 1 }), range: rangeSchema },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.string("Day (UTC)"),
              outcome: s.nullable(
                s.withEnum(
                  s.string(
                    "Raw measurement outcome for that day, the uninterpreted form of `exit.status`. The `reverted_*` values are days a real withdrawal would have failed.",
                  ),
                  [
                    "ok_full",
                    "ok_partial",
                    "delayed",
                    "no_exit_primary",
                    "reverted_liquidity",
                    "reverted_paused",
                    "reverted_unknown",
                    "error_rpc",
                    null,
                  ],
                ),
              ),
              eta_seconds: s.nullable(
                s.number(
                  "Wait before that day's queued withdrawal could be claimed. Only set when `outcome` is `delayed`.",
                ),
              ),
              confidence: s.nullable(
                s.withEnum(s.string("Holder-consensus confidence in that day's measurement"), [
                  "high",
                  "medium",
                  "low",
                  "conflict",
                  null,
                ]),
              ),
              apy: s.object(
                "Measured base APY in percent. Base only, since a withdrawal cannot see reward emissions, and unclamped, so it can be negative.",
                {
                  avg_1d: s.nullable(s.number("Average over that day")),
                  avg_7d: s.nullable(s.number("Trailing 7-day average ending that day")),
                  avg_30d: s.nullable(s.number("Trailing 30-day average ending that day")),
                },
                { required: [], additionalProperties: true },
              ),
              price_per_share: s.nullable(
                s.number(
                  "Underlying assets per position token, in human units. For rebasing tokens (aTokens, stETH) this is per internal share, so read it as a series normalized to its first point, not as an absolute.",
                ),
              ),
              price_per_share_quoted: s.nullable(
                s.number(
                  "The pool's reported price, for days the executed exit could not price one. A quote, not a measurement, so mark it differently in a chart. Null unless corroborated.",
                ),
              ),
              reason: s.nullable(
                s.withEnum(
                  s.string(
                    "Why `price_per_share` is null on a day that was otherwise measured; null when it is present.",
                  ),
                  ["rate_quality_floor", "nav_quote_no_exit_path", "no_executed_exit_path", null],
                ),
              ),
              exit_liquidity: s.object(
                "Funded exit capacity, not backing inventory; for queued pools this is the on-chain funding buffer, not instant liquidity. Null means no on-chain capacity is exposed, not zero.",
                {
                  amount: amountSchema,
                  usd: usdSchema,
                  slippage_bps: s.nullable(s.number("Price impact of the simulated exit, in basis points")),
                },
                { required: [], additionalProperties: true },
              ),
              tvl: s.object(
                "Receipt supply priced at the rate an exit actually paid, not the reported figure.",
                {
                  amount: s.nullable(
                    s.string(
                      "Receipt supply at the executed redemption rate. Raw base units of `denomination`, as a decimal string; parse with BigInt, not Number.",
                    ),
                  ),
                  usd: s.nullable(s.number("Verified TVL in USD. Null when `denomination` is.")),
                },
                { required: [], additionalProperties: true },
              ),
              tvl_quoted: s.object(
                "Supply valued at the reported rate, for the days `tvl` is null. A valuation, not an exit measure.",
                { amount: amountSchema, usd: s.nullable(s.number("Quoted valuation in USD")) },
                { required: [], additionalProperties: true },
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
    name: "get_yields_v2_borrow_markets",
    description:
      "Retrieve the latest data for all borrow markets. One row per borrow market: collateral and debt token, maximum loan-to-value, USD supply/borrow totals and attributed APY for both sides over `current`, `avg_7d` and `avg_30d` windows. Reward emissions offset borrowing costs, so `borrow_cost_apy` totals can be negative (the borrower is net paid). Requires an API plan key.",
    route: { path: "/yields/v2/borrow/markets", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_yields_v2_borrow_markets.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Market id (UUID)"),
              pool_key: s.string("Stable market key."),
              pool_token: s.nullable(
                s.object(
                  "Receipt / vault token representing the position; null when the market has no transferable pool token",
                  {
                    address: s.string("address returned by DeFiLlama."),
                    symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                    name: s.nullable(s.string("name returned by DeFiLlama.")),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
              display: s.object(
                "Display strings for listings",
                {
                  label: s.nullable(s.string('Collateral symbol, or "COLLATERAL / DEBT" for isolated pairs')),
                  detail: s.nullable(s.string("detail returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              url: s.nullable(s.string("Market page on the protocol app")),
              protocol: s.string("Protocol display name"),
              chain: s.string("Chain display name"),
              collateral_token: s.object(
                "Token supplied as collateral; null when unknown",
                {
                  address: s.string("address returned by DeFiLlama."),
                  symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                  decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              borrow_token: s.object(
                "Token borrowed from the market; null when unknown",
                {
                  address: s.string("address returned by DeFiLlama."),
                  symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                  decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              reward_tokens: s.array(
                "Incentive tokens currently emitted to the market; empty when there are none",
                underlyingTokensEntrySchema,
              ),
              loan_to_value: s.nullable(s.number("Maximum loan-to-value as a fraction (0.805 = 80.5%)")),
              total_supply_usd: s.nullable(s.number("Total supplied to the market, in USD")),
              total_borrow_usd: s.nullable(s.number("Total borrowed from the market, in USD")),
              available_borrow_usd: s.nullable(s.number("Liquidity still available to borrow, in USD")),
              supply_apy: s.object(
                "APY in percent earned by suppliers",
                { current: currentSchema, avg_7d: avg7dSchema, avg_30d: avg30dSchema },
                { required: [], additionalProperties: true },
              ),
              borrow_cost_apy: s.object(
                "APY in percent paid by borrowers. Reward emissions reduce the cost, so total = base - reward and can be negative",
                {
                  current: s.object(
                    "Latest observed values",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_7d: s.object(
                    "Trailing 7-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_30d: s.object(
                    "Trailing 30-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.object(
                "Intrinsic yield of yield-bearing tokens on either side of the market",
                {
                  supply: s.nullable(
                    s.object(
                      "Intrinsic yield of the supply-side token. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                      { apy: apySchema, source_pool: sourcePoolSchema },
                      { required: [], additionalProperties: true },
                    ),
                  ),
                  borrow: s.nullable(
                    s.object(
                      "Intrinsic yield of the borrowed token. Borrowing a yield-bearing token adds this rate to the effective borrow cost, since the debt appreciates by it. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                      { apy: apySchema, source_pool: sourcePoolSchema },
                      { required: [], additionalProperties: true },
                    ),
                  ),
                },
                { required: [], additionalProperties: true },
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
    name: "get_yields_v2_borrow_markets_by_id_history",
    description:
      "Retrieve daily borrow-side history for a borrow market. Daily borrow totals and borrow-cost APY for one market, oldest first. APY carries `avg_1d` (that day), `avg_7d` and `avg_30d` (trailing averages ending that day) windows, each attributed into base/reward/total. Supply-side history for the same id lives at `/yields/v2/earn/{id}/history`. Requires an API plan key.",
    route: {
      path: "/yields/v2/borrow/markets/{id}/history",
      parameters: [
        { name: "id", in: "path" },
        { name: "range", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_yields_v2_borrow_markets_by_id_history.",
      { id: s.string("Borrow market id (UUID)", { minLength: 1 }), range: rangeSchema },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.string("Day (UTC)"),
              total_borrow_usd: s.nullable(s.number("Total borrowed from the market, in USD")),
              available_borrow_usd: s.nullable(s.number("Liquidity still available to borrow, in USD")),
              borrow_cost_apy: s.object(
                "APY in percent paid by borrowers. Reward emissions reduce the cost, so total = base - reward and can be negative",
                {
                  avg_1d: s.object(
                    "Average over that day",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_7d: s.object(
                    "Trailing 7-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_30d: s.object(
                    "Trailing 30-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.nullable(
                s.object(
                  "Intrinsic yield of the borrowed token. Borrowing a yield-bearing token adds this rate to the effective borrow cost, since the debt appreciates by it. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                  {
                    apy: s.object(
                      "Intrinsic APY in percent",
                      {
                        avg_1d: s.object(
                          "Average over that day",
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
                    ),
                  },
                  { required: [], additionalProperties: true },
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
    name: "get_yields_v2_borrow_routes",
    description:
      "Retrieve the latest data for all borrow routes. Every supported borrowing route: a collateral position paired with a debt market on the same protocol and chain. Each row reports the collateral side (supply APY earned on the collateral), the borrow side (cost APY of the debt token) and `net_apy` (collateral yield minus borrow cost). Negative net APY means the position costs more than the collateral earns. Requires an API plan key.",
    route: { path: "/yields/v2/borrow/routes", parameters: [], free: null, wrap: false },
    inputSchema: s.object(
      "Parameters for get_yields_v2_borrow_routes.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              display: s.object(
                "Display strings for listings",
                {
                  detail: s.nullable(s.string("Market variant label; null when there is only one market")),
                },
                { required: [], additionalProperties: true },
              ),
              protocol: s.string("Protocol display name"),
              chain: s.string("Chain display name"),
              collateral: s.object(
                "The supplied collateral position",
                {
                  id: s.string("Collateral pool id (UUID)"),
                  pool_key: s.string("Stable pool key of the collateral pool"),
                  url: s.nullable(s.string("url returned by DeFiLlama.")),
                  token: s.object(
                    "Token supplied as collateral",
                    {
                      address: s.string("address returned by DeFiLlama."),
                      symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                      decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  loan_to_value: s.nullable(s.number("Maximum loan-to-value as a fraction (0.84 = 84%)")),
                  total_supply_usd: s.nullable(s.number("Total supplied to the collateral pool, in USD")),
                  apy: s.object(
                    "Supply APY in percent earned on the collateral",
                    { current: currentSchema, avg_7d: avg7dSchema, avg_30d: avg30dSchema },
                    { required: [], additionalProperties: true },
                  ),
                  intrinsic: s.nullable(
                    s.object(
                      "Intrinsic yield of the collateral token. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                      { apy: apySchema, source_pool: sourcePoolSchema },
                      { required: [], additionalProperties: true },
                    ),
                  ),
                  reward_tokens: s.array(
                    "Incentive tokens emitted to the collateral side; empty when there are none",
                    underlyingTokensEntrySchema,
                  ),
                },
                { required: [], additionalProperties: true },
              ),
              borrow: s.object(
                "The borrowed debt position",
                {
                  id: s.string("Debt market id (UUID)"),
                  pool_key: s.string("Stable pool key of the debt market"),
                  url: s.nullable(s.string("url returned by DeFiLlama.")),
                  token: s.object(
                    "Token borrowed",
                    {
                      address: s.string("address returned by DeFiLlama."),
                      symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                      decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  total_borrow_usd: s.nullable(s.number("Total borrowed from the market, in USD")),
                  available_borrow_usd: s.nullable(s.number("Liquidity still available to borrow, in USD")),
                  cost_apy: s.object(
                    "Borrow cost APY in percent. Reward emissions reduce the cost, so total = base - reward and can be negative",
                    {
                      current: s.object(
                        "Latest observed values",
                        {
                          base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                          reward: rewardSchema,
                          total: totalSchema,
                        },
                        { required: [], additionalProperties: true },
                      ),
                      avg_7d: s.object(
                        "Trailing 7-day average",
                        {
                          base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                          reward: rewardSchema,
                          total: totalSchema,
                        },
                        { required: [], additionalProperties: true },
                      ),
                      avg_30d: s.object(
                        "Trailing 30-day average",
                        {
                          base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                          reward: rewardSchema,
                          total: totalSchema,
                        },
                        { required: [], additionalProperties: true },
                      ),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  intrinsic: s.nullable(
                    s.object(
                      "Intrinsic yield of the borrowed token. Borrowing a yield-bearing token adds this rate to the effective borrow cost, since the debt appreciates by it. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                      { apy: apySchema, source_pool: sourcePoolSchema },
                      { required: [], additionalProperties: true },
                    ),
                  ),
                  reward_tokens: s.array(
                    "Incentive tokens emitted to the borrow side; empty when there are none",
                    underlyingTokensEntrySchema,
                  ),
                },
                { required: [], additionalProperties: true },
              ),
              net_apy: s.object(
                "Net APY in percent: collateral supply APY minus borrow cost. Keyed by APY composition: read the leaf matching the APY components you consume (base, base + reward, base + intrinsic, base + reward + intrinsic).",
                {
                  current: s.object(
                    "Latest observed values",
                    {
                      base: s.nullable(s.number("base returned by DeFiLlama.")),
                      base_reward: s.nullable(s.number("base_reward returned by DeFiLlama.")),
                      base_intrinsic: s.nullable(s.number("base_intrinsic returned by DeFiLlama.")),
                      base_reward_intrinsic: s.nullable(s.number("base_reward_intrinsic returned by DeFiLlama.")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_7d: s.object(
                    "Trailing 7-day average",
                    {
                      base: s.nullable(s.number("base returned by DeFiLlama.")),
                      base_reward: s.nullable(s.number("base_reward returned by DeFiLlama.")),
                      base_intrinsic: s.nullable(s.number("base_intrinsic returned by DeFiLlama.")),
                      base_reward_intrinsic: s.nullable(s.number("base_reward_intrinsic returned by DeFiLlama.")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_30d: s.object(
                    "Trailing 30-day average",
                    {
                      base: s.nullable(s.number("base returned by DeFiLlama.")),
                      base_reward: s.nullable(s.number("base_reward returned by DeFiLlama.")),
                      base_intrinsic: s.nullable(s.number("base_intrinsic returned by DeFiLlama.")),
                      base_reward_intrinsic: s.nullable(s.number("base_reward_intrinsic returned by DeFiLlama.")),
                    },
                    { required: [], additionalProperties: true },
                  ),
                },
                { required: [], additionalProperties: true },
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
    name: "get_yields_v2_loops",
    description:
      "Retrieve the latest data for all loop strategies. Leveraged looping opportunities: supply a token, borrow against it and re-supply, repeated `loop_count` times at the market maximum loan-to-value. `loop_apy.total` is the resulting net APY at that leverage; `leverage` reports the accumulated supply and borrow multipliers relative to the initial capital. Borrow reward emissions offset the borrowing cost, so looped APY can exceed the plain supply APY substantially. Requires an API plan key.",
    route: { path: "/yields/v2/loops", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_yields_v2_loops.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("Collateral pool id (UUID)"),
              display: s.object(
                "Display strings for listings",
                {
                  detail: s.nullable(s.string("Market variant label; null when there is only one market")),
                },
                { required: [], additionalProperties: true },
              ),
              protocol: s.string("Protocol display name"),
              chain: s.string("Chain display name"),
              token: s.object(
                "Token being looped (supplied and borrowed)",
                {
                  address: s.string("address returned by DeFiLlama."),
                  symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
                  decimals: s.nullable(s.integer("decimals returned by DeFiLlama.")),
                },
                { required: [], additionalProperties: true },
              ),
              url: s.nullable(s.string("Market page on the protocol app")),
              loan_to_value: s.nullable(s.number("Maximum loan-to-value as a fraction (0.7 = 70%)")),
              total_supply_usd: s.nullable(s.number("Total supplied to the market, in USD")),
              total_borrow_usd: s.nullable(s.number("Total borrowed from the market, in USD")),
              available_borrow_usd: s.nullable(s.number("Liquidity still available to borrow, in USD")),
              supply_apy: s.object(
                "Unlevered supply APY in percent",
                { current: currentSchema, avg_7d: avg7dSchema, avg_30d: avg30dSchema },
                { required: [], additionalProperties: true },
              ),
              borrow_cost_apy: s.object(
                "Borrow cost APY in percent. Reward emissions reduce the cost, so total = base - reward and can be negative",
                {
                  current: s.object(
                    "Latest observed values",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_7d: s.object(
                    "Trailing 7-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                  avg_30d: s.object(
                    "Trailing 30-day average",
                    {
                      base: s.nullable(s.number("Organic APY in percent, excluding incentive rewards")),
                      reward: rewardSchema,
                      total: totalSchema,
                    },
                    { required: [], additionalProperties: true },
                  ),
                },
                { required: [], additionalProperties: true },
              ),
              loop_apy: s.object(
                "Looped position APY",
                {
                  loop_count: s.nullable(s.number("Number of borrow/re-supply iterations")),
                  total: s.nullable(s.number("Net APY in percent of the looped position at loop_count iterations")),
                },
                { required: [], additionalProperties: true },
              ),
              leverage: s.object(
                "Accumulated leverage after loop_count iterations",
                {
                  supply_multiplier: s.nullable(s.number("Total supplied relative to initial capital")),
                  borrow_multiplier: s.nullable(s.number("Total borrowed relative to initial capital")),
                },
                { required: [], additionalProperties: true },
              ),
              intrinsic: s.nullable(
                s.object(
                  "Intrinsic yield of the looped token. Intrinsic yield is reported separately and is NOT included in the base/reward/total APY. Null when there is no intrinsic yield source.",
                  { apy: apySchema, source_pool: sourcePoolSchema },
                  { required: [], additionalProperties: true },
                ),
              ),
              reward_tokens: s.object(
                "Incentive tokens per market side; empty arrays when there are none",
                {
                  supply: s.array("Incentive tokens emitted to the supply side", underlyingTokensEntrySchema),
                  borrow: s.array("Incentive tokens emitted to the borrow side", underlyingTokensEntrySchema),
                },
                { required: [], additionalProperties: true },
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
    name: "get_perp_funding_rates",
    description:
      "Funding rates and open interest of perpetual futures. Latest funding rate, open interest and index price for Binance and OKX perpetual markets, with the 7d and 30d average and sum of settled funding rates. Requires an API plan key.",
    route: { path: "/api/perpFundingRates", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_perp_funding_rates.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        status: s.string("status returned by DeFiLlama."),
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              perp_id: s.string("perp_id returned by DeFiLlama."),
              timestamp: s.string("timestamp returned by DeFiLlama."),
              marketplace: s.string("marketplace returned by DeFiLlama."),
              market: s.string("market returned by DeFiLlama."),
              baseAsset: s.string("baseAsset returned by DeFiLlama."),
              fundingRate: s.number("fundingRate returned by DeFiLlama."),
              fundingRatePrevious: s.number("fundingRatePrevious returned by DeFiLlama."),
              fundingTimePrevious: s.number("fundingTimePrevious returned by DeFiLlama."),
              openInterest: s.number("openInterest returned by DeFiLlama."),
              indexPrice: s.number("indexPrice returned by DeFiLlama."),
              fundingRate7dAverage: s.nullable(s.number("fundingRate7dAverage returned by DeFiLlama.")),
              fundingRate7dSum: s.nullable(s.number("fundingRate7dSum returned by DeFiLlama.")),
              fundingRate30dAverage: s.nullable(s.number("fundingRate30dAverage returned by DeFiLlama.")),
              fundingRate30dSum: s.nullable(s.number("fundingRate30dSum returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_lst_rates",
    description:
      "Exchange rates and ETH peg of liquid staking tokens. Latest expected (contract) redemption rate, executable market rate and resulting ETH peg for major LSTs. Requires an API plan key.",
    route: { path: "/api/lstRates", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_lst_rates.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              name: s.string("The name of the protocol issuing the LST"),
              symbol: s.nullable(s.string("The symbol of the LST")),
              address: s.string("The contract address of the LST"),
              type: s.nullable(s.string("The type of the LST (rebase or accruing)")),
              expectedRate: s.nullable(s.number("ETH per token owed by the protocol, read from its contract")),
              marketRate: s.nullable(
                s.number("Executable market rate in ETH per token; null when no credible market quote exists"),
              ),
              ethPeg: s.nullable(s.number("Percent deviation of the market rate from the expected rate")),
              fee: s.nullable(s.number("The protocol fee percentage")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
];
