import type { DefillamaDefinition } from "./actions.ts";

import { s } from "../../core/json-schema.ts";
import {
  categoriesValueSchema,
  chainsSchema,
  leadInvestorsSchema,
  otherInvestorsSchema,
  chainTvlsSchema,
  chartBreakdownValuesSchema,
  byChainValueSchema,
} from "./shared-schemas.ts";
export const ecosystemDefinitions: DefillamaDefinition[] = [
  {
    name: "get_emissions",
    description: "List of all tokens along with basic info for each.  Requires an API plan key.",
    route: { path: "/api/emissions", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_emissions.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              token: s.string("token returned by DeFiLlama."),
              sources: s.array("sources returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              protocolId: s.string("protocolId returned by DeFiLlama."),
              name: s.string("name returned by DeFiLlama."),
              circSupply: s.number("circSupply returned by DeFiLlama."),
              circSupply30d: s.number("circSupply30d returned by DeFiLlama."),
              totalLocked: s.number("totalLocked returned by DeFiLlama."),
              maxSupply: s.number("maxSupply returned by DeFiLlama."),
              gecko_id: s.string("gecko_id returned by DeFiLlama."),
              events: s.array(
                "events returned by DeFiLlama.",
                s.object(
                  "Result entry returned by DeFiLlama.",
                  {
                    description: s.string("description returned by DeFiLlama."),
                    timestamp: s.number("timestamp returned by DeFiLlama."),
                    noOfTokens: s.array(
                      "noOfTokens returned by DeFiLlama.",
                      s.number("Result entry returned by DeFiLlama."),
                    ),
                    category: s.string("category returned by DeFiLlama."),
                    unlockType: s.string("unlockType returned by DeFiLlama."),
                  },
                  { required: [], additionalProperties: true },
                ),
              ),
              nextEvent: s.object(
                "nextEvent returned by DeFiLlama.",
                {
                  date: s.number("date returned by DeFiLlama."),
                  toUnlock: s.number("toUnlock returned by DeFiLlama."),
                },
                { required: [], additionalProperties: true },
              ),
              unlocksPerDay: s.number("unlocksPerDay returned by DeFiLlama."),
              mcap: s.number("mcap returned by DeFiLlama."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_emission_by_protocol",
    description:
      "Unlocks data for a given token/protocol. You can find a list of available slugs to query by querying /emissions and then extracting the key `gecko_id`.  Requires an API plan key.",
    route: {
      path: "/api/emission/{protocol}",
      parameters: [{ name: "protocol", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_emission_by_protocol.",
      { protocol: s.string("protocol slug", { minLength: 1 }) },
      { required: ["protocol"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        body: s.object(
          "body returned by DeFiLlama.",
          {
            documentedData: s.object(
              "documentedData returned by DeFiLlama.",
              {
                data: s.array(
                  "data returned by DeFiLlama.",
                  s.object(
                    "Result entry returned by DeFiLlama.",
                    {
                      label: s.string("label returned by DeFiLlama."),
                      data: s.array(
                        "data returned by DeFiLlama.",
                        s.object(
                          "Result entry returned by DeFiLlama.",
                          {
                            timestamp: s.number("timestamp returned by DeFiLlama."),
                            unlocked: s.number("unlocked returned by DeFiLlama."),
                            rawEmission: s.number("rawEmission returned by DeFiLlama."),
                            burned: s.number("burned returned by DeFiLlama."),
                          },
                          { required: [], additionalProperties: true },
                        ),
                      ),
                    },
                    { required: [], additionalProperties: true },
                  ),
                ),
                tokenAllocation: s.object(
                  "tokenAllocation returned by DeFiLlama.",
                  {
                    current: s.object(
                      "current returned by DeFiLlama.",
                      {
                        insiders: s.number("insiders returned by DeFiLlama."),
                        noncirculating: s.number("noncirculating returned by DeFiLlama."),
                        publicSale: s.number("publicSale returned by DeFiLlama."),
                        airdrop: s.number("airdrop returned by DeFiLlama."),
                        farming: s.number("farming returned by DeFiLlama."),
                      },
                      { required: [], additionalProperties: true },
                    ),
                    final: s.object(
                      "final returned by DeFiLlama.",
                      {
                        insiders: s.number("insiders returned by DeFiLlama."),
                        noncirculating: s.number("noncirculating returned by DeFiLlama."),
                        publicSale: s.number("publicSale returned by DeFiLlama."),
                        airdrop: s.number("airdrop returned by DeFiLlama."),
                        farming: s.number("farming returned by DeFiLlama."),
                      },
                      { required: [], additionalProperties: true },
                    ),
                    progress: s.object(
                      "progress returned by DeFiLlama.",
                      {
                        insiders: s.number("insiders returned by DeFiLlama."),
                        noncirculating: s.number("noncirculating returned by DeFiLlama."),
                        publicSale: s.number("publicSale returned by DeFiLlama."),
                        airdrop: s.number("airdrop returned by DeFiLlama."),
                        farming: s.number("farming returned by DeFiLlama."),
                      },
                      { required: [], additionalProperties: true },
                    ),
                  },
                  { required: [], additionalProperties: true },
                ),
              },
              { required: [], additionalProperties: true },
            ),
            metadata: s.object(
              "metadata returned by DeFiLlama.",
              {
                notes: s.array("notes returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
                token: s.string("token returned by DeFiLlama."),
                sources: s.array("sources returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
                protocolIds: s.array(
                  "protocolIds returned by DeFiLlama.",
                  s.string("Result entry returned by DeFiLlama."),
                ),
                total: s.number("total returned by DeFiLlama."),
                chain: s.string("chain returned by DeFiLlama."),
                name: s.string("name returned by DeFiLlama."),
                gecko_id: s.string("gecko_id returned by DeFiLlama."),
                defillamaIds: s.array(
                  "defillamaIds returned by DeFiLlama.",
                  s.string("Result entry returned by DeFiLlama."),
                ),
                categories: s.object(
                  "categories returned by DeFiLlama.",
                  {
                    insiders: s.array(
                      "insiders returned by DeFiLlama.",
                      s.string("Result entry returned by DeFiLlama."),
                    ),
                    noncirculating: s.array(
                      "noncirculating returned by DeFiLlama.",
                      s.string("Result entry returned by DeFiLlama."),
                    ),
                    publicSale: s.array(
                      "publicSale returned by DeFiLlama.",
                      s.string("Result entry returned by DeFiLlama."),
                    ),
                    airdrop: s.array("airdrop returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
                    farming: s.array("farming returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
                  },
                  { required: [], additionalProperties: true },
                ),
                protocolCategory: s.string("protocolCategory returned by DeFiLlama."),
                chainName: s.string("chainName returned by DeFiLlama."),
                pId: s.string("pId returned by DeFiLlama."),
              },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
        lastModified: s.string("lastModified returned by DeFiLlama."),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_categories",
    description: "Overview of all categories accross all protocols.  Requires an API plan key.",
    route: { path: "/api/categories", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_categories.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        chart: s.object(
          "chart returned by DeFiLlama.",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {},
              {
                required: [],
                additionalProperties: s.object(
                  "Value for this key.",
                  {
                    tvl: s.number("tvl returned by DeFiLlama."),
                    staking: s.number("staking returned by DeFiLlama."),
                    pool2: s.number("pool2 returned by DeFiLlama."),
                    doublecounted: s.number("doublecounted returned by DeFiLlama."),
                    borrowed: s.number("borrowed returned by DeFiLlama."),
                    offers: s.number("offers returned by DeFiLlama."),
                    vesting: s.number("vesting returned by DeFiLlama."),
                    treasury: s.number("treasury returned by DeFiLlama."),
                    liquidstaking: s.number("liquidstaking returned by DeFiLlama."),
                    dcAndLsOverlap: s.number("dcAndLsOverlap returned by DeFiLlama."),
                  },
                  { required: [], additionalProperties: true },
                ),
              },
            ),
          },
        ),
        categories: s.object(
          "categories returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_forks",
    description: "Overview of all forks accross all protocols.  Requires an API plan key.",
    route: { path: "/api/forks", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_forks.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        chart: s.object(
          "chart returned by DeFiLlama.",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {},
              {
                required: [],
                additionalProperties: s.object(
                  "Value for this key.",
                  {
                    staking: s.number("staking returned by DeFiLlama."),
                    tvl: s.number("tvl returned by DeFiLlama."),
                    pool2: s.number("pool2 returned by DeFiLlama."),
                    doublecounted: s.number("doublecounted returned by DeFiLlama."),
                    borrowed: s.number("borrowed returned by DeFiLlama."),
                    vesting: s.number("vesting returned by DeFiLlama."),
                    liquidstaking: s.number("liquidstaking returned by DeFiLlama."),
                    dcAndLsOverlap: s.number("dcAndLsOverlap returned by DeFiLlama."),
                  },
                  { required: [], additionalProperties: true },
                ),
              },
            ),
          },
        ),
        forks: s.object(
          "forks returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_oracles",
    description: "Overview of all oracles accross all protocols.  Requires an API plan key.",
    route: { path: "/api/oracles", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_oracles.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        chart: s.object(
          "chart returned by DeFiLlama.",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {},
              {
                required: [],
                additionalProperties: s.object(
                  "Value for this key.",
                  {
                    tvl: s.number("tvl returned by DeFiLlama."),
                    staking: s.number("staking returned by DeFiLlama."),
                    pool2: s.number("pool2 returned by DeFiLlama."),
                    borrowed: s.number("borrowed returned by DeFiLlama."),
                    treasury: s.number("treasury returned by DeFiLlama."),
                    vesting: s.number("vesting returned by DeFiLlama."),
                  },
                  { required: [], additionalProperties: true },
                ),
              },
            ),
          },
        ),
        oracles: s.object(
          "oracles returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
        chainsByOracle: s.object(
          "chainsByOracle returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: categoriesValueSchema },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_hacks",
    description: "Overview of all hacks on our Hacks dashboard.  Requires an API plan key.",
    route: { path: "/api/hacks", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_hacks.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.number("date returned by DeFiLlama."),
              name: s.string("name returned by DeFiLlama."),
              classification: s.string("classification returned by DeFiLlama."),
              technique: s.string("technique returned by DeFiLlama."),
              amount: s.number("amount returned by DeFiLlama."),
              chain: s.array("chain returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              bridgeHack: s.boolean("bridgeHack returned by DeFiLlama."),
              targetType: s.string("targetType returned by DeFiLlama."),
              source: s.string("source returned by DeFiLlama."),
              returnedFunds: s.nullable(s.number("returnedFunds returned by DeFiLlama.")),
              defillamaId: s.nullable(s.number("defillamaId returned by DeFiLlama.")),
              language: s.nullable(s.string("language returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_raises",
    description: "Overview of all raises on our Raises dashboard.  Requires an API plan key.",
    route: { path: "/api/raises", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_raises.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        raises: s.array(
          "raises returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              date: s.number("date returned by DeFiLlama."),
              name: s.string("name returned by DeFiLlama."),
              round: s.string("round returned by DeFiLlama."),
              amount: s.number("amount returned by DeFiLlama."),
              chains: chainsSchema,
              sector: s.string("sector returned by DeFiLlama."),
              category: s.string("category returned by DeFiLlama."),
              categoryGroup: s.string("categoryGroup returned by DeFiLlama."),
              source: s.string("source returned by DeFiLlama."),
              leadInvestors: leadInvestorsSchema,
              otherInvestors: otherInvestorsSchema,
              valuation: s.nullable(s.number("valuation returned by DeFiLlama.")),
              defillamaId: s.string("defillamaId returned by DeFiLlama."),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_treasuries",
    description: "List all protocols on our Treasuries dashboard.  Requires an API plan key.",
    route: { path: "/api/treasuries", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_treasuries.", {}, { required: [], additionalProperties: false }),
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
              address: s.nullable(s.string("address returned by DeFiLlama.")),
              symbol: s.string("symbol returned by DeFiLlama."),
              url: s.string("url returned by DeFiLlama."),
              description: s.string("description returned by DeFiLlama."),
              chain: s.string("chain returned by DeFiLlama."),
              logo: s.string("logo returned by DeFiLlama."),
              audits: s.string("audits returned by DeFiLlama."),
              audit_note: s.nullable(s.string("audit_note returned by DeFiLlama.")),
              gecko_id: s.nullable(s.string("gecko_id returned by DeFiLlama.")),
              cmcId: s.nullable(s.string("cmcId returned by DeFiLlama.")),
              category: s.string("category returned by DeFiLlama."),
              chains: chainsSchema,
              module: s.string("module returned by DeFiLlama."),
              treasury: s.string("treasury returned by DeFiLlama."),
              forkedFromIds: s.array(
                "forkedFromIds returned by DeFiLlama.",
                s.string("Result entry returned by DeFiLlama."),
              ),
              twitter: s.string("twitter returned by DeFiLlama."),
              slug: s.string("slug returned by DeFiLlama."),
              tvl: s.number("tvl returned by DeFiLlama."),
              chainTvls: chainTvlsSchema,
              change_1h: s.number("change_1h returned by DeFiLlama."),
              change_1d: s.number("change_1d returned by DeFiLlama."),
              change_7d: s.number("change_7d returned by DeFiLlama."),
              tokenBreakdowns: s.object(
                "tokenBreakdowns returned by DeFiLlama.",
                {
                  ownTokens: s.number("ownTokens returned by DeFiLlama."),
                  stablecoins: s.number("stablecoins returned by DeFiLlama."),
                  majors: s.number("majors returned by DeFiLlama."),
                  others: s.number("others returned by DeFiLlama."),
                },
                { required: [], additionalProperties: true },
              ),
              mcap: s.nullable(s.number("mcap returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_entities",
    description: "List all entities.  Requires an API plan key.",
    route: { path: "/api/entities", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_entities.", {}, { required: [], additionalProperties: false }),
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
              url: s.string("url returned by DeFiLlama."),
              description: s.string("description returned by DeFiLlama."),
              logo: s.string("logo returned by DeFiLlama."),
              category: s.string("category returned by DeFiLlama."),
              module: s.string("module returned by DeFiLlama."),
              twitter: s.string("twitter returned by DeFiLlama."),
              symbol: s.string("symbol returned by DeFiLlama."),
              chain: s.string("chain returned by DeFiLlama."),
              gecko_id: s.nullable(s.string("gecko_id returned by DeFiLlama.")),
              cmcId: s.nullable(s.string("cmcId returned by DeFiLlama.")),
              chains: chainsSchema,
              slug: s.string("slug returned by DeFiLlama."),
              tvl: s.number("tvl returned by DeFiLlama."),
              chainTvls: chainTvlsSchema,
              change_1h: s.number("change_1h returned by DeFiLlama."),
              change_1d: s.number("change_1d returned by DeFiLlama."),
              change_7d: s.number("change_7d returned by DeFiLlama."),
              tokenBreakdowns: s.object(
                "tokenBreakdowns returned by DeFiLlama.",
                {
                  ownTokens: s.number("ownTokens returned by DeFiLlama."),
                  stablecoins: s.number("stablecoins returned by DeFiLlama."),
                  majors: s.number("majors returned by DeFiLlama."),
                  others: s.number("others returned by DeFiLlama."),
                },
                { required: [], additionalProperties: true },
              ),
              mcap: s.nullable(s.number("mcap returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_historical_liquidity_by_token",
    description: "Read historical token liquidity. Requires an API plan key.",
    route: {
      path: "/api/historicalLiquidity/{token}",
      parameters: [{ name: "token", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_historical_liquidity_by_token.",
      { token: s.string("token slug", { minLength: 1 }) },
      { required: ["token"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      { data: { description: "DeFiLlama response." } },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_bridges_bridges",
    description: "List all bridges along with summaries of recent bridge volumes..  Requires an API plan key.",
    route: {
      path: "/bridges/bridges",
      parameters: [{ name: "includeChains", in: "query" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_bridges_bridges.",
      {
        includeChains: s.boolean("set whether to include current previous day volume breakdown by chain"),
      },
      { required: [], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        bridges: s.array(
          "List of bridges",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.integer("Bridge ID"),
              name: s.string("Bridge name"),
              displayName: s.string("Bridge display name"),
              icon: s.string("Bridge icon"),
              volumePrevDay: s.number("Previous day volume"),
              volumePrev2Day: s.number("Previous 2 days volume"),
              lastHourlyVolume: s.number("Last hourly volume"),
              last24hVolume: s.number("Last 24 hours volume"),
              lastDailyVolume: s.number("Last daily volume"),
              dayBeforeLastVolume: s.number("Day before last volume"),
              weeklyVolume: s.number("Weekly volume"),
              monthlyVolume: s.number("Monthly volume"),
              chains: s.array("Supported chains", s.string("Result entry returned by DeFiLlama.")),
              destinationChain: s.string("Destination chain"),
              url: s.string("Bridge URL"),
              slug: s.string("Bridge slug"),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_bridges_bridge_by_id",
    description: "Get summary of bridge volume and volume breakdown by chain.  Requires an API plan key.",
    route: {
      path: "/bridges/bridge/{id}",
      parameters: [{ name: "id", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_bridges_bridge_by_id.",
      { id: s.integer("bridge ID, you can get these from /bridges") },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        id: s.integer("Bridge ID"),
        name: s.string("Bridge name"),
        displayName: s.string("Bridge display name"),
        lastHourlyVolume: s.number("Last hourly volume"),
        currentDayVolume: s.number("Current day volume"),
        lastDailyVolume: s.number("Last daily volume"),
        dayBeforeLastVolume: s.number("Day before last volume"),
        weeklyVolume: s.number("Weekly volume"),
        monthlyVolume: s.number("Monthly volume"),
        lastHourlyTxs: s.object(
          "Last hourly transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        currentDayTxs: s.object(
          "Current day transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        prevDayTxs: s.object(
          "Previous day transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        dayBeforeLastTxs: s.object(
          "Day before last transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        weeklyTxs: s.object(
          "Weekly transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        monthlyTxs: s.object(
          "Monthly transactions",
          {
            deposits: s.integer("Number of deposits"),
            withdrawals: s.integer("Number of withdrawals"),
          },
          { required: [], additionalProperties: true },
        ),
        chainBreakdown: s.object("Volume breakdown by chain", {}, { required: [], additionalProperties: true }),
        destinationChain: s.string("Destination chain"),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_bridges_bridgevolume_by_chain",
    description:
      "Get historical volumes for a bridge, chain, or bridge on a particular chain.  Requires an API plan key.",
    route: {
      path: "/bridges/bridgevolume/{chain}",
      parameters: [
        { name: "chain", in: "path" },
        { name: "id", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_bridges_bridgevolume_by_chain.",
      {
        chain: s.string("chain slug, you can get these from /chains. Call also use 'all' for volume on all chains.", {
          minLength: 1,
        }),
        id: s.integer("bridge ID, you can get these from /bridges"),
      },
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
              date: s.string("Date timestamp"),
              depositUSD: s.number("Deposit volume in USD"),
              withdrawUSD: s.number("Withdrawal volume in USD"),
              depositTxs: s.integer("Number of deposit transactions"),
              withdrawTxs: s.integer("Number of withdrawal transactions"),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_bridges_bridgedaystats_by_timestamp_by_chain",
    description: "Get a 24hr token and address volume breakdown for a bridge.  Requires an API plan key.",
    route: {
      path: "/bridges/bridgedaystats/{timestamp}/{chain}",
      parameters: [
        { name: "timestamp", in: "path" },
        { name: "chain", in: "path" },
        { name: "id", in: "query" },
      ],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_bridges_bridgedaystats_by_timestamp_by_chain.",
      {
        timestamp: s.integer(
          "Unix timestamp. Data returned will be for the 24hr period starting at 00:00 UTC that the timestamp lands in.",
        ),
        chain: s.string("chain slug, you can get these from /chains.", { minLength: 1 }),
        id: s.integer("bridge ID, you can get these from /bridges"),
      },
      { required: ["timestamp", "chain"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        date: s.integer("Date timestamp"),
        totalTokensDeposited: s.object(
          "Total tokens deposited with their details",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {
                usdValue: s.number("USD value of the token"),
                amount: s.string("Token amount as string"),
                symbol: s.string("Token symbol"),
                decimals: s.integer("Token decimals"),
              },
              { required: [], additionalProperties: true },
            ),
          },
        ),
        totalTokensWithdrawn: s.object(
          "Total tokens withdrawn with their details",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {
                usdValue: s.number("USD value of the token"),
                amount: s.string("Token amount as string"),
                symbol: s.string("Token symbol"),
                decimals: s.integer("Token decimals"),
              },
              { required: [], additionalProperties: true },
            ),
          },
        ),
        totalAddressDeposited: s.object(
          "Total addresses that deposited with their details",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {
                usdValue: s.number("Total USD value deposited by this address"),
                txs: s.integer("Number of transactions from this address"),
              },
              { required: [], additionalProperties: true },
            ),
          },
        ),
        totalAddressWithdrawn: s.object(
          "Total addresses that withdrew with their details",
          {},
          {
            required: [],
            additionalProperties: s.object(
              "Value for this key.",
              {
                usdValue: s.number("Total USD value withdrawn by this address"),
                txs: s.integer("Number of transactions from this address"),
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
    name: "get_bridges_transactions_by_id",
    description: "Get all transactions for a bridge within a date range.  Requires an API plan key.",
    route: {
      path: "/bridges/transactions/{id}",
      parameters: [
        { name: "id", in: "path" },
        { name: "starttimestamp", in: "query" },
        { name: "endtimestamp", in: "query" },
        { name: "sourcechain", in: "query" },
        { name: "address", in: "query" },
        { name: "limit", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_bridges_transactions_by_id.",
      {
        id: s.integer("bridge ID, you can get these from /bridges"),
        starttimestamp: s.integer("start timestamp (Unix Timestamp) for date range"),
        endtimestamp: s.integer("end timestamp (Unix timestamp) for date range"),
        sourcechain: s.string("Returns only transactions that are bridging from the specified source chain."),
        address: s.string(
          'Returns only transactions with specified address as "from" or "to". Addresses are quried in the form {chain}:{address}, where chain is an identifier such as ethereum, bsc, polygon, avax... .',
        ),
        limit: s.integer("limit to number of transactions returned, maximum is 6000", {
          minimum: 1,
          maximum: 6000,
        }),
      },
      { required: ["id"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: {
          oneOf: [
            s.object(
              "Bridge information (returned when no query parameters provided)",
              {
                id: s.integer("Bridge ID"),
                name: s.string("Bridge name"),
                displayName: s.string("Bridge display name"),
                lastHourlyVolume: s.number("Last hourly volume"),
                currentDayVolume: s.number("Current day volume"),
                lastDailyVolume: s.number("Last daily volume"),
                dayBeforeLastVolume: s.number("Day before last volume"),
                weeklyVolume: s.number("Weekly volume"),
                monthlyVolume: s.number("Monthly volume"),
                lastHourlyTxs: s.object(
                  "lastHourlyTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                currentDayTxs: s.object(
                  "currentDayTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                prevDayTxs: s.object(
                  "prevDayTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                dayBeforeLastTxs: s.object(
                  "dayBeforeLastTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                weeklyTxs: s.object(
                  "weeklyTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                monthlyTxs: s.object(
                  "monthlyTxs returned by DeFiLlama.",
                  {
                    deposits: s.integer("Number of deposit transactions"),
                    withdrawals: s.integer("Number of withdrawal transactions"),
                  },
                  { required: [], additionalProperties: true },
                ),
                chainBreakdown: s.object(
                  "chainBreakdown returned by DeFiLlama.",
                  {},
                  {
                    required: [],
                    additionalProperties: s.object(
                      "Value for this key.",
                      {
                        lastHourlyVolume: s.number("Last hourly volume"),
                        currentDayVolume: s.number("Current day volume"),
                        lastDailyVolume: s.number("Last daily volume"),
                        dayBeforeLastVolume: s.number("Day before last volume"),
                        weeklyVolume: s.number("Weekly volume"),
                        monthlyVolume: s.number("Monthly volume"),
                        last24hVolume: s.number("Last 24 hour volume"),
                        lastHourlyTxs: s.object(
                          "lastHourlyTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                        currentDayTxs: s.object(
                          "currentDayTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                        prevDayTxs: s.object(
                          "prevDayTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                        dayBeforeLastTxs: s.object(
                          "dayBeforeLastTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                        weeklyTxs: s.object(
                          "weeklyTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                        monthlyTxs: s.object(
                          "monthlyTxs returned by DeFiLlama.",
                          {
                            deposits: s.integer("Number of deposit transactions"),
                            withdrawals: s.integer("Number of withdrawal transactions"),
                          },
                          { required: [], additionalProperties: true },
                        ),
                      },
                      { required: [], additionalProperties: true },
                    ),
                  },
                ),
                destinationChain: s.string("Destination chain"),
              },
              { required: [], additionalProperties: true },
            ),
            s.array(
              "Transaction list (returned when query parameters provided)",
              s.object(
                "Result entry returned by DeFiLlama.",
                {
                  tx_hash: s.string("Transaction hash"),
                  ts: s.string("Timestamp in ISO format"),
                  tx_block: s.integer("Block number"),
                  tx_from: s.string("From address"),
                  tx_to: s.string("To address"),
                  token: s.string("Token contract address"),
                  amount: s.string("Transaction amount"),
                  chain: s.string("Blockchain name"),
                  bridge_name: s.string("Bridge name"),
                  usd_value: s.nullable(s.number("USD value of transaction")),
                  sourceChain: s.string("Source chain name"),
                },
                { required: [], additionalProperties: true },
              ),
            ),
          ],
          description: "DeFiLlama response.",
        },
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_usage",
    description:
      "Get amount of credits left in the api key, these reset on the 1st of each month.  Requires an API plan key.",
    route: { path: "/usage/{YOUR_API_KEY}", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_usage.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      { creditsLeft: s.number("Credits remaining in the current month.") },
      { required: ["creditsLeft"], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_current",
    description:
      "List all current RWA assets. Returns current Real World Asset rows with per-chain onchain market cap, active market cap, and DeFi active TVL maps. Requires an API plan key.",
    route: { path: "/rwa/current", parameters: [], free: null, wrap: true },
    inputSchema: s.object("Parameters for get_rwa_current.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama result.",
      {
        data: s.array(
          "DeFiLlama response.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("id returned by DeFiLlama."),
              canonicalMarketId: s.nullable(s.string("canonicalMarketId returned by DeFiLlama.")),
              ticker: s.string("ticker returned by DeFiLlama."),
              assetName: s.nullable(s.string("assetName returned by DeFiLlama.")),
              assetGroup: s.nullable(s.string("assetGroup returned by DeFiLlama.")),
              primaryChain: s.nullable(s.string("primaryChain returned by DeFiLlama.")),
              chain: s.nullable(
                s.array("chain returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              category: s.nullable(
                s.array("category returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              assetClass: s.nullable(
                s.array("assetClass returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              type: s.nullable(s.string("type returned by DeFiLlama.")),
              rwaClassification: s.nullable(s.string("rwaClassification returned by DeFiLlama.")),
              accessModel: s.nullable(s.string("accessModel returned by DeFiLlama.")),
              issuer: s.nullable(s.string("issuer returned by DeFiLlama.")),
              parentPlatform: s.nullable(s.string("parentPlatform returned by DeFiLlama.")),
              stablecoin: s.nullable(s.boolean("stablecoin returned by DeFiLlama.")),
              governance: s.nullable(s.boolean("governance returned by DeFiLlama.")),
              onChainMcap: s.object(
                "Current onchain market cap by chain.",
                {},
                { required: [], additionalProperties: s.number("Value for this key.") },
              ),
              activeMcap: s.object(
                "Current active market cap by chain.",
                {},
                { required: [], additionalProperties: s.number("Value for this key.") },
              ),
              defiActiveTvl: s.object(
                "Current DeFi active TVL by chain and tracked protocol.",
                {},
                { required: [], additionalProperties: chartBreakdownValuesSchema },
              ),
              price: s.nullable(s.number("price returned by DeFiLlama.")),
              activeMcapData: s.boolean("activeMcapData returned by DeFiLlama."),
              coingeckoId: s.nullable(s.string("coingeckoId returned by DeFiLlama.")),
              logo: s.nullable(s.string("logo returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_stats",
    description:
      "Get aggregate RWA stats by chain, category, platform, and asset group. Returns RWA aggregates. For the default per-chain table, read byChain[chain].base: assetIssuers.length, assetCount, activeMcap, onChainMcap, and defiActiveTvl. Add stablecoinsOnly, governanceOnly, and stablecoinsAndGovernance when those buckets should be included. Requires an API plan key.",
    route: { path: "/rwa/stats", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_rwa_stats.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        totalOnChainMcap: s.number("totalOnChainMcap returned by DeFiLlama."),
        totalActiveMcap: s.number("totalActiveMcap returned by DeFiLlama."),
        totalDefiActiveTvl: s.number("totalDefiActiveTvl returned by DeFiLlama."),
        assetCount: s.integer("assetCount returned by DeFiLlama."),
        assetIssuers: s.integer("assetIssuers returned by DeFiLlama."),
        byChain: s.object(
          "byChain returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: byChainValueSchema },
        ),
        byCategory: s.object(
          "byCategory returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: byChainValueSchema },
        ),
        byPlatform: s.object(
          "byPlatform returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: byChainValueSchema },
        ),
        byAssetGroup: s.object(
          "byAssetGroup returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: byChainValueSchema },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_list",
    description:
      "List RWA ids and filter values. Returns lightweight RWA lists used for discovery, search, and filters. Requires an API plan key.",
    route: { path: "/rwa/list", parameters: [], free: null, wrap: false },
    inputSchema: s.object("Parameters for get_rwa_list.", {}, { required: [], additionalProperties: false }),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        canonicalMarketIds: s.array(
          "canonicalMarketIds returned by DeFiLlama.",
          s.string("Result entry returned by DeFiLlama."),
        ),
        platforms: s.array("platforms returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        chains: chainsSchema,
        categories: s.array("categories returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        assetGroups: s.array("assetGroups returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
        idMap: s.object(
          "idMap returned by DeFiLlama.",
          {},
          { required: [], additionalProperties: s.string("Value for this key.") },
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_chain_by_chain",
    description:
      "List current RWA assets on a chain. Returns current RWA assets that have onchain market cap, active market cap, or DeFi active TVL on the requested chain. Requires an API plan key.",
    route: {
      path: "/rwa/chain/{chain}",
      parameters: [{ name: "chain", in: "path" }],
      free: null,
      wrap: false,
    },
    inputSchema: s.object(
      "Parameters for get_rwa_chain_by_chain.",
      { chain: s.string("Chain display name, case-insensitive.", { minLength: 1 }) },
      { required: ["chain"], additionalProperties: false },
    ),
    outputSchema: s.object(
      "DeFiLlama response.",
      {
        data: s.array(
          "data returned by DeFiLlama.",
          s.object(
            "Result entry returned by DeFiLlama.",
            {
              id: s.string("id returned by DeFiLlama."),
              canonicalMarketId: s.nullable(s.string("canonicalMarketId returned by DeFiLlama.")),
              ticker: s.string("ticker returned by DeFiLlama."),
              assetName: s.nullable(s.string("assetName returned by DeFiLlama.")),
              assetGroup: s.nullable(s.string("assetGroup returned by DeFiLlama.")),
              primaryChain: s.nullable(s.string("primaryChain returned by DeFiLlama.")),
              chain: s.nullable(
                s.array("chain returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              category: s.nullable(
                s.array("category returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              assetClass: s.nullable(
                s.array("assetClass returned by DeFiLlama.", s.string("Result entry returned by DeFiLlama.")),
              ),
              type: s.nullable(s.string("type returned by DeFiLlama.")),
              rwaClassification: s.nullable(s.string("rwaClassification returned by DeFiLlama.")),
              accessModel: s.nullable(s.string("accessModel returned by DeFiLlama.")),
              issuer: s.nullable(s.string("issuer returned by DeFiLlama.")),
              parentPlatform: s.nullable(s.string("parentPlatform returned by DeFiLlama.")),
              stablecoin: s.nullable(s.boolean("stablecoin returned by DeFiLlama.")),
              governance: s.nullable(s.boolean("governance returned by DeFiLlama.")),
              onChainMcap: s.object(
                "Current onchain market cap by chain.",
                {},
                { required: [], additionalProperties: s.number("Value for this key.") },
              ),
              activeMcap: s.object(
                "Current active market cap by chain.",
                {},
                { required: [], additionalProperties: s.number("Value for this key.") },
              ),
              defiActiveTvl: s.object(
                "Current DeFi active TVL by chain and tracked protocol.",
                {},
                { required: [], additionalProperties: chartBreakdownValuesSchema },
              ),
              price: s.nullable(s.number("price returned by DeFiLlama.")),
              activeMcapData: s.boolean("activeMcapData returned by DeFiLlama."),
              coingeckoId: s.nullable(s.string("coingeckoId returned by DeFiLlama.")),
              logo: s.nullable(s.string("logo returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_chart_chain_by_chain",
    description:
      "Get historical RWA chart data for a chain. Returns historical onchain market cap, active market cap, and DeFi active TVL totals for a chain. Requires an API plan key.",
    route: {
      path: "/rwa/chart/chain/{chain}",
      parameters: [{ name: "chain", in: "path" }],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_rwa_chart_chain_by_chain.",
      {
        chain: s.string("Chain display name. The API normalizes it to the internal RWA slug.", {
          minLength: 1,
        }),
      },
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
              timestamp: s.integer("timestamp returned by DeFiLlama."),
              onChainMcap: s.nullable(s.number("onChainMcap returned by DeFiLlama.")),
              activeMcap: s.nullable(s.number("activeMcap returned by DeFiLlama.")),
              defiActiveTvl: s.nullable(s.number("defiActiveTvl returned by DeFiLlama.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
  {
    name: "get_rwa_chart_chain_breakdown",
    description:
      "Get historical RWA metric breakdown by chain. Returns time series rows with one column per chain for the selected RWA metric. Requires an API plan key.",
    route: {
      path: "/rwa/chart/chain-breakdown",
      parameters: [
        { name: "key", in: "query" },
        { name: "includeStablecoin", in: "query" },
        { name: "includeGovernance", in: "query" },
      ],
      free: null,
      wrap: true,
    },
    inputSchema: s.object(
      "Parameters for get_rwa_chart_chain_breakdown.",
      {
        key: s.withEnum(s.string("Metric to break down by chain. Defaults to onChainMcap."), [
          "onChainMcap",
          "activeMcap",
          "defiActiveTvl",
        ]),
        includeStablecoin: s.boolean("Include stablecoin-token assets in the chart totals."),
        includeGovernance: s.boolean("Include governance-token assets in the chart totals."),
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
            { timestamp: s.integer("timestamp returned by DeFiLlama.") },
            { required: ["timestamp"], additionalProperties: s.number("Value for this key.") },
          ),
        ),
      },
      { required: ["data"], additionalProperties: true },
    ),
  },
];
