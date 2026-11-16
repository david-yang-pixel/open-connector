import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const entity = s.stringEnum("The kind of sports entity.", ["league", "team", "player", "event", "venue"]);
const id = s.string("The numeric TheSportsDB entity ID, returned by search or list actions.", {
  pattern: "^[0-9]+$",
});
const outputSchema = s.object(
  "The matching sports records.",
  {
    items: s.array(
      "Records returned by TheSportsDB, or an empty array when no records match.",
      s.looseObject("A sports record with original TheSportsDB fields, IDs and artwork URLs."),
    ),
  },
  {
    optional: [],
  },
);
export const thesportsdbActions: ActionDefinition[] = [
  defineProviderAction("thesportsdb", {
    name: "search_entities",
    description: "Search TheSportsDB leagues, teams, players, events or venues by name. Requires a Premium API key.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Sports entity search parameters.",
      {
        entity,
        query: s.nonEmptyString("The name to search for. Spaces are converted to underscores."),
      },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "lookup_entity",
    description: "Look up a TheSportsDB league, team, player, event or venue by ID.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Sports entity lookup parameters.",
      { entity, id },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "list_catalog",
    description: "List the countries, sports or leagues supported by TheSportsDB.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Sports catalog parameters.",
      {
        catalog: s.stringEnum("The catalog to retrieve.", ["countries", "sports", "leagues"]),
      },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "list_related",
    description: "List teams or seasons in a league, or players in a team, using TheSportsDB IDs.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Related sports records parameters.",
      {
        collection: s.stringEnum("Retrieve teams or seasons for a league ID, or players for a team ID.", [
          "teams",
          "seasons",
          "players",
        ]),
        id,
      },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "get_schedule",
    description: "Get upcoming or previous events for a league, team or venue. TheSportsDB controls the result limit.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Recent or upcoming schedule parameters.",
      {
        entity: s.stringEnum("The entity whose events to retrieve.", ["league", "team", "venue"]),
        id,
        direction: s.stringEnum("Retrieve upcoming events or previous results.", ["next", "previous"]),
      },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "get_team_season_schedule",
    description: "Get the full current season schedule for a TheSportsDB team.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Full team schedule parameters.",
      { id },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "get_league_season_schedule",
    description: "Get a TheSportsDB league schedule for a specific season.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "League season schedule parameters.",
      {
        id,
        season: s.nonEmptyString("The season returned by list_related, such as 2025-2026 or 2025."),
      },
      {
        optional: [],
      },
    ),
    outputSchema,
  }),
  defineProviderAction("thesportsdb", {
    name: "get_livescores",
    description: "Get current TheSportsDB live scores for all sports, one sport or a league ID.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Live score parameters.",
      {
        filter: s.nonEmptyString("Use all, a sport such as soccer, or a numeric league ID. Defaults to all.", {
          default: "all",
        }),
      },
      {
        optional: ["filter"],
      },
    ),
    outputSchema,
  }),
];
