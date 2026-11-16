import type { DefillamaDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  breakdownSchema,
  categoriesValueSchema,
  chainsSchema,
  leadInvestorsSchema,
  otherInvestorsSchema,
  chainTvlsSchema,
  currentChainTvlsSchema,
  chainSchema,
  keySchema,
  timeSeriesResponseSchema,
  unstructuredChartResponseSchema,
  breakdownChartResponseSchema,
} from "./shared-schemas.ts";
export const tvlDefinitions: DefillamaDefinition[] = [
  {
    name: "get_token_protocols_by_symbol",
    description:
      "Lists the amount of a certain token within all protocols. Data for the Token Usage page.  Requires an API plan key.",
    route: {
      path: "/api/tokenProtocols/{symbol}",
      parameters: [{ name: "symbol", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_token_protocols_by_symbol.",
      { symbol: s.string("token slug", { minLength: 1 }) },
      { required: ["symbol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              name: s.string("name returned by DeFiLlama."),
              category: s.string("category returned by DeFiLlama."),
              amountUsd: s.object(
                "amountUsd returned by DeFiLlama.",
                {},
                { required: [], additionalProperties: s.number("Value for this key.") },
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
    name: "get_inflows_by_protocol_by_timestamp",
    description: "Lists the amount of inflows and outflows for a protocol at a given date.  Requires an API plan key.",
    route: {
      path: "/api/inflows/{protocol}/{timestamp}",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "timestamp", in: "path" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_inflows_by_protocol_by_timestamp.",
      {
        protocol: s.string("protocol slug", { minLength: 1 }),
        timestamp: s.integer("unix timestamp"),
      },
      { required: ["protocol", "timestamp"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        outflows: s.number("outflows returned by DeFiLlama."),
        oldTokens: s.object(
          "oldTokens returned by DeFiLlama.",
          {
            date: s.number("date returned by DeFiLlama."),
            tvl: s.object(
              "tvl returned by DeFiLlama.",
              {},
              { required: [], additionalProperties: s.number("Value for this key.") },
            ),
          },
          { required: [], additionalProperties: true },
        ),
        currentTokens: s.object(
          "currentTokens returned by DeFiLlama.",
          {
            date: s.number("date returned by DeFiLlama."),
            tvl: s.object(
              "tvl returned by DeFiLlama.",
              {},
              { required: [], additionalProperties: s.number("Value for this key.") },
            ),
          },
          { required: [], additionalProperties: true },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_chain_assets",
    description: "Get assets of all chains.  Requires an API plan key.",
    route: { path: "/api/chainAssets", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_chain_assets.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        chain: s.object(
          "chain returned by DeFiLlama.",
          {
            canonical: s.object(
              "canonical returned by DeFiLlama.",
              { total: s.string("total returned by DeFiLlama."), breakdown: breakdownSchema },
              { required: [], additionalProperties: true },
            ),
            native: s.object(
              "native returned by DeFiLlama.",
              { total: s.string("total returned by DeFiLlama."), breakdown: breakdownSchema },
              { required: [], additionalProperties: true },
            ),
            thirdParty: s.object(
              "thirdParty returned by DeFiLlama.",
              { total: s.string("total returned by DeFiLlama."), breakdown: breakdownSchema },
              { required: [], additionalProperties: true },
            ),
            total: s.object(
              "total returned by DeFiLlama.",
              { total: s.string("total returned by DeFiLlama."), breakdown: breakdownSchema },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
        timestamp: s.number("timestamp returned by DeFiLlama."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_protocols",
    description: "List all protocols on defillama along with their tvl.  Available with no_auth or api_key.",
    route: {
      path: "/api/protocols",
      parameters: [],
      free: { baseUrl: "https://api.llama.fi", path: "/protocols" },
      wrap: true,
    },
    inputSchema: s.object("Parameters for get_protocols.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("id returned by DeFiLlama."),
              name: s.string("name returned by DeFiLlama."),
              symbol: s.string("symbol returned by DeFiLlama."),
              category: s.string("category returned by DeFiLlama."),
              chains: chainsSchema,
              tvl: s.number("tvl returned by DeFiLlama."),
              chainTvls: chainTvlsSchema,
              change_1d: s.number("change_1d returned by DeFiLlama."),
              change_7d: s.number("change_7d returned by DeFiLlama."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_protocol_by_protocol",
    description:
      "Get historical TVL of a protocol and breakdowns by token and chain.  Available with no_auth or api_key.",
    route: {
      path: "/api/protocol/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: { baseUrl: "https://api.llama.fi", path: "/protocol/{protocol}" },
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_protocol_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        id: s.string("id returned by DeFiLlama."),
        name: s.string("name returned by DeFiLlama."),
        symbol: s.string("symbol returned by DeFiLlama."),
        category: s.string("category returned by DeFiLlama."),
        chains: chainsSchema,
        currentChainTvls: currentChainTvlsSchema,
        chainTvls: s.object(
          "chainTvls returned by DeFiLlama.",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {
                tvl: s.array(
                  "tvl returned by DeFiLlama.",
                  s.object(
                    "Result entry returned by DeFiLlama.",
                    {
                      date: s.number("date returned by DeFiLlama."),
                      totalLiquidityUSD: s.number("totalLiquidityUSD returned by DeFiLlama."),
                    },
                    { required: [], additionalProperties: true },
                  ),
                ),
                tokens: s.array(
                  "tokens returned by DeFiLlama.",
                  s.object(
                    "Result entry returned by DeFiLlama.",
                    {
                      date: s.number("date returned by DeFiLlama."),
                      tokens: s.object(
                        "tokens returned by DeFiLlama.",
                        {},
                        { required: [], additionalProperties: s.number("Value for this key.") },
                      ),
                    },
                    { required: [], additionalProperties: true },
                  ),
                ),
              },
              { required: [], additionalProperties: true },
            ),
          },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_historical_chain_tvl",
    description:
      "Get historical TVL (excludes liquid staking and double counted tvl) of DeFi on all chains.  Available with no_auth or api_key.",
    route: {
      path: "/api/v2/historicalChainTvl",
      parameters: [],
      free: { baseUrl: "https://api.llama.fi", path: "/v2/historicalChainTvl" },
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_historical_chain_tvl.",
      {},
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
              date: s.number("Unix timestamp"),
              tvl: s.number("Total Value Locked in USD across all chains"),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_historical_chain_tvl_by_chain",
    description:
      "Get historical TVL (excludes liquid staking and double counted tvl) of a chain.  Available with no_auth or api_key.",
    route: {
      path: "/api/v2/historicalChainTvl/{chain}",
      parameters: [{ name: "chain", in: "path" }],
      free: { baseUrl: "https://api.llama.fi", path: "/v2/historicalChainTvl/{chain}" },
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_historical_chain_tvl_by_chain.",
      { chain: chainSchema },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.number("Unix timestamp"),
              tvl: s.number("Total Value Locked in USD for this chain"),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_tvl_by_protocol",
    description:
      "Simplified endpoint to get current TVL of a protocol. Simplified endpoint that only returns a number, the current TVL of a protocol Available with no_auth or api_key.",
    route: {
      path: "/api/tvl/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: { baseUrl: "https://api.llama.fi", path: "/tvl/{protocol}" },
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_tvl_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      { data: s.number("Total Value Locked in USD") },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_chains",
    description: "Get current TVL of all chains.  Available with no_auth or api_key.",
    route: {
      path: "/api/v2/chains",
      parameters: [],
      free: { baseUrl: "https://api.llama.fi", path: "/v2/chains" },
      wrap: true,
    },
    inputSchema: s.object("Parameters for get_v2_chains.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              gecko_id: s.nullable(s.string("CoinGecko ID for the chain's native token")),
              tvl: s.number("Total Value Locked in USD"),
              tokenSymbol: s.nullable(s.string("Native token symbol")),
              cmcId: s.nullable(s.string("CoinMarketCap ID")),
              name: s.string("Chain name"),
              chainId: s.nullable(s.number("Chain ID number")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_metrics_tvl_protocol_by_protocol",
    description:
      "Get aggregate TVL metrics for a protocol. Returns protocol metadata along with current TVL figures, chain breakdowns, and other aggregate metrics. Requires an API plan key.",
    route: {
      path: "/api/v2/metrics/tvl/protocol/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_v2_metrics_tvl_protocol_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        id: s.string("id returned by DeFiLlama."),
        name: s.string("name returned by DeFiLlama."),
        address: s.nullable(s.string("address returned by DeFiLlama.")),
        symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
        url: s.string("url returned by DeFiLlama."),
        referralUrl: s.nullable(s.string("referralUrl returned by DeFiLlama.")),
        description: s.string("description returned by DeFiLlama."),
        chain: s.string("chain returned by DeFiLlama."),
        logo: s.string("logo returned by DeFiLlama."),
        audits: s.nullable(s.string("audits returned by DeFiLlama.")),
        audit_note: s.nullable(s.string("audit_note returned by DeFiLlama.")),
        gecko_id: s.nullable(s.string("gecko_id returned by DeFiLlama.")),
        cmcId: s.nullable(s.string("cmcId returned by DeFiLlama.")),
        category: s.string("category returned by DeFiLlama."),
        tags: s.nullable(s.array("tags returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama."))),
        chains: chainsSchema,
        module: s.nullable(s.string("module returned by DeFiLlama.")),
        treasury: s.nullable(s.string("treasury returned by DeFiLlama.")),
        twitter: s.string("twitter returned by DeFiLlama."),
        audit_links: s.array("audit_links returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        openSource: s.boolean("openSource returned by DeFiLlama."),
        forkedFrom: s.array("forkedFrom returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        oraclesByChain: s.object(
          "oraclesByChain returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
        parentProtocol: s.string("parentProtocol returned by DeFiLlama."),
        governanceID: s.array("governanceID returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        github: s.array("github returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        currentChainTvls: currentChainTvlsSchema,
        isParentProtocol: s.boolean("isParentProtocol returned by DeFiLlama."),
        mcap: s.nullable(s.number("mcap returned by DeFiLlama.")),
        methodology: s.nullable(s.string("methodology returned by DeFiLlama.")),
        raises: s.array(
          "raises returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              round: s.string("round returned by DeFiLlama."),
              amount: s.number("amount returned by DeFiLlama."),
              valuation: s.string("valuation returned by DeFiLlama."),
              source: s.string("source returned by DeFiLlama."),
              date: s.number("date returned by DeFiLlama."),
              defillamaId: s.string("defillamaId returned by DeFiLlama."),
              leadInvestors: leadInvestorsSchema,
              otherInvestors: otherInvestorsSchema,
              investors: s.array("investors returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        otherProtocols: s.array(
          "otherProtocols returned by DeFiLlama.",
          s.string("Result entry returned by DeFiLlama."),
        ),
        hallmarks: s.array(
          "Notable events in the protocol's history as [timestamp, description] pairs",
          s.array("Result entry returned by DeFiLlama.", {}),
        ),
        stablecoins: s.array("stablecoins returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        misrepresentedTokens: s.boolean("misrepresentedTokens returned by DeFiLlama."),
        deprecated: s.boolean("deprecated returned by DeFiLlama."),
        rugged: s.boolean("rugged returned by DeFiLlama."),
        deadUrl: s.boolean("deadUrl returned by DeFiLlama."),
        warningBanners: s.array(
          "warningBanners returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              message: s.string("message returned by DeFiLlama."),
              until: s.nullable(s.string("until returned by DeFiLlama.")),
              level: s.withEnum(s.string("level returned by DeFiLlama."), ["low", "alert", "rug"]),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        tokenRights: s.object(
          "Token governance and value accrual rights",
          {},
          { required: [], additionalProperties: true },
        ),
        wrongLiquidity: s.boolean("wrongLiquidity returned by DeFiLlama."),
        tvlCodePath: s.string("Path to the TVL adapter source code"),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_chart_tvl_protocol_by_protocol",
    description:
      "Get historical TVL chart for a protocol. Returns an array of [timestamp, value] pairs representing the protocol's TVL over time. By default returns the base TVL metric. Use the `key` parameter to select a different metric or aggregate all metrics. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/tvl/protocol/{protocol}",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_tvl_protocol_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }), key: keySchema },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: timeSeriesResponseSchema,
  },
  {
    name: "get_v2_chart_tvl_protocol_by_protocol_chain_breakdown",
    description:
      "Get historical TVL chart for a protocol broken down by chain. Returns an array of [timestamp, { chain: value }] pairs showing the selected metric per chain over time. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/tvl/protocol/{protocol}/chain-breakdown",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_tvl_protocol_by_protocol_chain_breakdown.",
      { protocol: s.string("protocol slug", { minLength: 1 }), key: keySchema },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: unstructuredChartResponseSchema,
  },
  {
    name: "get_v2_chart_tvl_protocol_by_protocol_token_breakdown",
    description:
      "Get historical TVL chart for a protocol broken down by token. Returns an array of [timestamp, { token: value }] pairs showing TVL per token over time. Values are in USD by default; use the currency selector for other denominations. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/tvl/protocol/{protocol}/token-breakdown",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
        { name: "currency", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_tvl_protocol_by_protocol_token_breakdown.",
      {
        protocol: s.string("protocol slug", { minLength: 1 }),
        key: keySchema,
        currency: s.withEnum(s.string("Currency denomination: usd, token or raw."), ["usd", "token", "raw"]),
      },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: unstructuredChartResponseSchema,
  },
  {
    name: "get_v2_metrics_treasury_protocol_by_protocol",
    description:
      "Get aggregate treasury metrics for a protocol. Returns protocol metadata along with current treasury figures and chain breakdowns. Requires an API plan key.",
    route: {
      path: "/api/v2/metrics/treasury/protocol/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_v2_metrics_treasury_protocol_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        id: s.string("id returned by DeFiLlama."),
        name: s.string("name returned by DeFiLlama."),
        address: s.nullable(s.string("address returned by DeFiLlama.")),
        symbol: s.nullable(s.string("symbol returned by DeFiLlama.")),
        url: s.string("url returned by DeFiLlama."),
        referralUrl: s.nullable(s.string("referralUrl returned by DeFiLlama.")),
        description: s.string("description returned by DeFiLlama."),
        chain: s.string("chain returned by DeFiLlama."),
        logo: s.string("logo returned by DeFiLlama."),
        audits: s.nullable(s.string("audits returned by DeFiLlama.")),
        audit_note: s.nullable(s.string("audit_note returned by DeFiLlama.")),
        gecko_id: s.nullable(s.string("gecko_id returned by DeFiLlama.")),
        cmcId: s.nullable(s.string("cmcId returned by DeFiLlama.")),
        category: s.string("category returned by DeFiLlama."),
        tags: s.nullable(s.array("tags returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama."))),
        chains: chainsSchema,
        module: s.nullable(s.string("module returned by DeFiLlama.")),
        treasury: s.nullable(s.string("treasury returned by DeFiLlama.")),
        twitter: s.string("twitter returned by DeFiLlama."),
        audit_links: s.array("audit_links returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        openSource: s.boolean("openSource returned by DeFiLlama."),
        forkedFrom: s.array("forkedFrom returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        oraclesByChain: s.object(
          "oraclesByChain returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
        parentProtocol: s.string("parentProtocol returned by DeFiLlama."),
        governanceID: s.array("governanceID returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        github: s.array("github returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        currentChainTvls: currentChainTvlsSchema,
        isParentProtocol: s.boolean("isParentProtocol returned by DeFiLlama."),
        mcap: s.nullable(s.number("mcap returned by DeFiLlama.")),
        methodology: s.nullable(s.string("methodology returned by DeFiLlama.")),
        raises: s.array(
          "raises returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              round: s.string("round returned by DeFiLlama."),
              amount: s.number("amount returned by DeFiLlama."),
              valuation: s.string("valuation returned by DeFiLlama."),
              source: s.string("source returned by DeFiLlama."),
              date: s.number("date returned by DeFiLlama."),
              defillamaId: s.string("defillamaId returned by DeFiLlama."),
              leadInvestors: leadInvestorsSchema,
              otherInvestors: otherInvestorsSchema,
              investors: s.array("investors returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        otherProtocols: s.array(
          "otherProtocols returned by DeFiLlama.",
          s.string("Result entry returned by DeFiLlama."),
        ),
        hallmarks: s.array(
          "Notable events in the protocol's history as [timestamp, description] pairs",
          s.array("Result entry returned by DeFiLlama.", {}),
        ),
        stablecoins: s.array("stablecoins returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        misrepresentedTokens: s.boolean("misrepresentedTokens returned by DeFiLlama."),
        deprecated: s.boolean("deprecated returned by DeFiLlama."),
        rugged: s.boolean("rugged returned by DeFiLlama."),
        deadUrl: s.boolean("deadUrl returned by DeFiLlama."),
        warningBanners: s.array(
          "warningBanners returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              message: s.string("message returned by DeFiLlama."),
              until: s.nullable(s.string("until returned by DeFiLlama.")),
              level: s.withEnum(s.string("level returned by DeFiLlama."), ["low", "alert", "rug"]),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        tokenRights: s.object(
          "Token governance and value accrual rights",
          {},
          { required: [], additionalProperties: true },
        ),
        wrongLiquidity: s.boolean("wrongLiquidity returned by DeFiLlama."),
        tvlCodePath: s.string("Path to the TVL adapter source code"),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_chart_treasury_protocol_by_protocol",
    description:
      "Get historical treasury chart for a protocol. Returns an array of [timestamp, value] pairs representing the protocol's treasury value over time. By default excludes the protocol's own tokens (OwnTokens). Requires an API plan key.",
    route: {
      path: "/api/v2/chart/treasury/protocol/{protocol}",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_treasury_protocol_by_protocol.",
      {
        protocol: s.string("protocol slug", { minLength: 1 }),
        key: s.withEnum(
          s.string(
            'Token filter. Omit to exclude OwnTokens (default). Use "OwnTokens" to return only the protocol\'s own tokens, or "all" for the sum of all tokens including OwnTokens.',
          ),
          ["OwnTokens", "all"],
        ),
      },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: timeSeriesResponseSchema,
  },
  {
    name: "get_v2_chart_treasury_protocol_by_protocol_chain_breakdown",
    description:
      "Get historical treasury chart for a protocol broken down by chain. Returns an array of [timestamp, { chain: value }] pairs showing treasury value per chain over time. By default excludes the protocol's own tokens. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/treasury/protocol/{protocol}/chain-breakdown",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_treasury_protocol_by_protocol_chain_breakdown.",
      {
        protocol: s.string("protocol slug", { minLength: 1 }),
        key: s.withEnum(
          s.string(
            'Token filter. Omit to exclude OwnTokens (default). Use "OwnTokens" to return only the protocol\'s own tokens, or "all" for the sum of all tokens including OwnTokens.',
          ),
          ["OwnTokens", "all"],
        ),
      },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: unstructuredChartResponseSchema,
  },
  {
    name: "get_v2_chart_treasury_protocol_by_protocol_token_breakdown",
    description:
      "Get historical treasury chart for a protocol broken down by token. Returns an array of [timestamp, { token: value }] pairs showing treasury value per token over time. By default excludes OwnTokens and values are in USD. Use key and currency params to customize. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/treasury/protocol/{protocol}/token-breakdown",
      parameters: [
        { name: "protocol", in: "path" },
        { name: "key", in: "query" },
        { name: "currency", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_treasury_protocol_by_protocol_token_breakdown.",
      {
        protocol: s.string("protocol slug", { minLength: 1 }),
        key: s.withEnum(
          s.string(
            'Token filter. Omit to exclude OwnTokens (default). Use "OwnTokens" to return only the protocol\'s own tokens, or "all" for the sum of all tokens including OwnTokens.',
          ),
          ["OwnTokens", "all"],
        ),
        currency: s.withEnum(s.string("Currency denomination: usd, token or raw."), ["usd", "token", "raw"]),
      },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: unstructuredChartResponseSchema,
  },
  {
    name: "get_v2_metrics_oracle",
    description:
      "Get oracle data overview. Returns an object mapping oracle names to arrays of protocol names that use each oracle. Requires an API plan key.",
    route: { path: "/api/v2/metrics/oracle", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_v2_metrics_oracle.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        oracles: s.object(
          "Mapping of oracle names to arrays of protocol names using that oracle",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_v2_chart_oracle",
    description:
      "Get timeseries chart data for all oracles. Returns an array of [timestamp, value] pairs representing total TVL across all oracles over time. Requires an API plan key.",
    route: { path: "/api/v2/chart/oracle", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_v2_chart_oracle.", {}, { required: [], additionalProperties: false }),
    outputSchema: timeSeriesResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_chain_breakdown",
    description:
      "Get timeseries chart data breakdown by chain. Returns an array of objects with a timestamp and TVL values broken down by chain. Requires an API plan key.",
    route: { path: "/api/v2/chart/oracle/chain-breakdown", parameters: [], free: null, wrap: true },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_chain_breakdown.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: breakdownChartResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_protocol_breakdown",
    description:
      "Get timeseries chart data breakdown by protocol. Returns an array of objects with a timestamp and TVL values broken down by oracle/protocol. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/oracle/protocol-breakdown",
      parameters: [],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_protocol_breakdown.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: breakdownChartResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_protocol_by_protocol",
    description:
      "Get timeseries chart data by protocol/oracle. Returns an array of [timestamp, value] pairs representing TVL over time for a specific oracle/protocol. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/oracle/protocol/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_protocol_by_protocol.",
      { protocol: s.string("oracle/protocol name", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: timeSeriesResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_protocol_by_protocol_chain_breakdown",
    description:
      "Get chain breakdown timeseries chart data by protocol/oracle. Returns an array of objects with a timestamp and TVL values broken down by chain for a specific oracle/protocol. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/oracle/protocol/{protocol}/chain-breakdown",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_protocol_by_protocol_chain_breakdown.",
      { protocol: s.string("oracle/protocol name", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: breakdownChartResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_chain_by_chain",
    description:
      "Get timeseries chart data by chain. Returns an array of [timestamp, value] pairs representing oracle TVL over time for a specific chain. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/oracle/chain/{chain}",
      parameters: [{ name: "chain", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_chain_by_chain.",
      { chain: s.string("chain name", { minLength: 1 }) },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: timeSeriesResponseSchema,
  },
  {
    name: "get_v2_chart_oracle_chain_by_chain_protocol_breakdown",
    description:
      "Get protocol breakdown timeseries chart data by chain. Returns an array of objects with a timestamp and TVL values broken down by oracle/protocol for a specific chain. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/oracle/chain/{chain}/protocol-breakdown",
      parameters: [{ name: "chain", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_oracle_chain_by_chain_protocol_breakdown.",
      { chain: s.string("chain name", { minLength: 1 }) },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: breakdownChartResponseSchema,
  },
  {
    name: "get_v2_metrics_fork",
    description:
      "Get fork data overview. Returns an object mapping fork names to arrays of protocol names that are forks of each protocol. Requires an API plan key.",
    route: { path: "/api/v2/metrics/fork", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_v2_metrics_fork.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object("DeFiLlama response.", {}, { required: [], additionalProperties: categoriesValueSchema }),
  },
  {
    name: "get_v2_chart_fork_protocol_breakdown",
    description:
      "Get timeseries chart data breakdown by protocol. Returns an array of objects with a timestamp and TVL values broken down by fork protocol. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/fork/protocol-breakdown",
      parameters: [],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_fork_protocol_breakdown.",
      {},
      { required: [], additionalProperties: false },
    ),
    outputSchema: breakdownChartResponseSchema,
  },
  {
    name: "get_v2_chart_fork_protocol_by_protocol",
    description:
      "Get timeseries chart data by protocol. Returns an array of [timestamp, value] pairs representing TVL over time for all forks of a specific protocol. Requires an API plan key.",
    route: {
      path: "/api/v2/chart/fork/protocol/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_v2_chart_fork_protocol_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: timeSeriesResponseSchema,
  },
];
