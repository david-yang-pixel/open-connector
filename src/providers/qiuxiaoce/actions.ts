import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const qiuxiaoceActions: ActionDefinition[] = [
  defineProviderAction("qiuxiaoce", {
    name: "get_quota",
    description: "Read remaining credits, expiration and today's usage without consuming credits.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object("Parameters for get_quota.", {}, { required: [] }),
    outputSchema: s.looseObject("The get_quota response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Credit balance and usage.", {
        credits_remaining: s.integer("Remaining API credits."),
        expires_at: s.nullable(s.string("Credit expiration reported by the provider.")),
        today_used: s.integer("Credits consumed today."),
      }),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_daily_digest",
    description:
      "List matches for a sales date, including fixture IDs and report availability. Omit date for the current sales day.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_daily_digest.",
      { date: s.string("Calendar date in YYYY-MM-DD format.", { format: "date" }) },
      { required: [] },
    ),
    outputSchema: s.looseObject("The get_daily_digest response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      date: s.string("Calendar date in YYYY-MM-DD format.", { format: "date" }),
      total: s.integer("Total matches."),
      summary: s.looseObject("Report and data readiness counts."),
      matches: s.array(
        "Matches on the selected sales day.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_fixtures",
    description:
      "Find fixtures by date, date range, league, team, round, status or fixture ID. Use either date or from/to.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Parameters for list_fixtures.",
        {
          date: s.string("Calendar date in YYYY-MM-DD format.", { format: "date" }),
          from: s.string("Calendar date in YYYY-MM-DD format.", { format: "date" }),
          to: s.string("Calendar date in YYYY-MM-DD format.", { format: "date" }),
          league: s.integer("The provider entity ID returned by a discovery action."),
          season: s.integer("Season starting year. Omit to use the provider default season."),
          team: s.integer("The provider entity ID returned by a discovery action."),
          round: s.string("Round name; requires league and season."),
          status: s.stringEnum("Fixture status: not started, finished, or live.", ["NS", "FT", "LIVE"]),
          last: s.integer("Most recent number of matches; requires team."),
          next: s.integer("Upcoming number of matches; requires team."),
          id: s.integer("The provider entity ID returned by a discovery action."),
        },
        { required: [] },
      ),
      dependentRequired: {
        from: ["to"],
        to: ["from"],
        round: ["league", "season"],
        last: ["team"],
        next: ["team"],
      },
      not: { required: ["date"], anyOf: [{ required: ["from"] }, { required: ["to"] }] },
    },
    outputSchema: s.looseObject("The list_fixtures response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      count: s.integer("Number of returned fixtures."),
      fixtures: s.array(
        "Matching fixtures.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_fixture",
    description: "Read a fixture's kickoff, score, status and teams.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_fixture.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_fixture response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_fixture_stats",
    description: "Read post-match technical statistics for a fixture.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_fixture_stats.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_fixture_stats response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_fixture_events",
    description: "Read goals, cards and substitutions for a fixture.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_fixture_events.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_fixture_events response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      events: s.array("Fixture events.", s.looseObject("One upstream record, including provider-specific fields.")),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_fixture_lineups",
    description: "Read announced starting lineups and substitutes for a fixture.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_fixture_lineups.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_fixture_lineups response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_fixture_players",
    description: "Read player-by-player post-match statistics for a fixture.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_fixture_players.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_fixture_players response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "search_teams",
    description:
      "Search teams by name, including Chinese aliases. Verify the returned identity before selecting an ID.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for search_teams.",
      { search: s.nonEmptyString("Team name keyword, including Chinese aliases.") },
      { required: ["search"] },
    ),
    outputSchema: s.looseObject("The search_teams response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      teams: s.array("Matching teams.", s.looseObject("One upstream record, including provider-specific fields.")),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_team",
    description: "Read a team's names, country, venue and founding information.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_team.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_team response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_leagues",
    description: "List supported leagues, optionally searching by name or Chinese alias.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_leagues.",
      { q: s.string("Optional league name keyword.") },
      { required: [] },
    ),
    outputSchema: s.looseObject("The list_leagues response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      leagues: s.array("Matching leagues.", s.looseObject("One upstream record, including provider-specific fields.")),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_league",
    description: "Read league details and current standings.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_league.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The get_league response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.looseObject("Upstream detail fields, preserved without filtering."),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "get_standings",
    description: "Read league standings for a season, defaulting to the latest available season.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for get_standings.",
      {
        league: s.integer("The provider entity ID returned by a discovery action."),
        season: s.integer("Season starting year. Omit to use the provider default season."),
      },
      { required: ["league"] },
    ),
    outputSchema: s.looseObject("The get_standings response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      season: s.integer("Season starting year. Omit to use the provider default season."),
      data: s.array("League standings.", s.looseObject("One upstream record, including provider-specific fields.")),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_league_fixtures",
    description: "List all league fixtures and scores for a season.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_league_fixtures.",
      {
        id: s.integer("The provider entity ID returned by a discovery action."),
        season: s.integer("Season starting year. Omit to use the provider default season."),
      },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The list_league_fixtures response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.array(
        "Season records returned by the provider.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_league_teams",
    description: "List participating teams for a league season.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_league_teams.",
      {
        id: s.integer("The provider entity ID returned by a discovery action."),
        season: s.integer("Season starting year. Omit to use the provider default season."),
      },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The list_league_teams response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.array(
        "Season records returned by the provider.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_league_top_scorers",
    description: "Read a league season's top scorers.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_league_top_scorers.",
      {
        id: s.integer("The provider entity ID returned by a discovery action."),
        season: s.integer("Season starting year. Omit to use the provider default season."),
      },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The list_league_top_scorers response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.array(
        "Season records returned by the provider.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_league_top_assists",
    description: "Read a league season's assist leaders.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_league_top_assists.",
      {
        id: s.integer("The provider entity ID returned by a discovery action."),
        season: s.integer("Season starting year. Omit to use the provider default season."),
      },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The list_league_top_assists response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.array(
        "Season records returned by the provider.",
        s.looseObject("One upstream record, including provider-specific fields."),
      ),
    }),
  }),
  defineProviderAction("qiuxiaoce", {
    name: "list_league_seasons",
    description: "List available season years before querying historical league data.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for list_league_seasons.",
      { id: s.integer("The provider entity ID returned by a discovery action.") },
      { required: ["id"] },
    ),
    outputSchema: s.looseObject("The list_league_seasons response from QiuXiaoCe.", {
      success: s.boolean("Whether the provider reports success."),
      data: s.array(
        "Available season starting years.",
        s.integer("Season starting year. Omit to use the provider default season."),
      ),
    }),
  }),
];
