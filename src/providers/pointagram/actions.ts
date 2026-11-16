import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const playerId = s.integer("The Pointagram player ID.");
const teamId = s.integer("The Pointagram team ID.");
const playerFields = {
  player_name: s.nonWhitespaceString("The player's name in Pointagram."),
  player_email: s.string("The player's email address, used for invitations."),
  player_external_id: s.string("Your external identifier for the player."),
  offline: s.stringEnum("Use 1 for offline or 0 for online; online players receive an invitation.", ["0", "1"]),
};
const teamFields = {
  team_name: s.nonWhitespaceString("The team's name in Pointagram."),
  icon: s.nonWhitespaceString(
    "An existing Pointagram icon filename, such as Bulls.png, or a previously uploaded custom icon.",
  ),
  filter_ignore: s.stringEnum("Use 1 to exempt this team from filter settings, or 0 otherwise.", ["0", "1"]),
};
const envelope = (data: Record<string, unknown>) =>
  s.looseObject("The Pointagram response envelope.", {
    status: s.string("The upstream operation status."),
    message: s.string("The upstream operation message."),
    data,
  });
const player = s.looseObject("A Pointagram player; additional upstream fields are preserved.", {
  id: s.string("The player ID returned by Pointagram."),
  name: s.string("The player's name."),
  emailaddress: s.string("The player's email address."),
  external_id: s.string("The player's external identifier."),
});
const team = s.looseObject("A Pointagram team; additional upstream fields are preserved.", {
  id: s.string("The team ID returned by Pointagram."),
  name: s.string("The team's name."),
  icon: s.string("The team's icon filename."),
});
const mutationOutput = envelope(
  s.looseObject("Operation details, including any created resource ID.", {
    profile_id: s.string("The created or updated player ID, when returned."),
    team_id: s.string("The created or updated team ID, when returned."),
  }),
);
export const pointagramActions: ActionDefinition[] = [
  defineProviderAction("pointagram", {
    name: "list_players",
    operationType: "read",
    description:
      "List or search Pointagram players. Continue with data.pagination.next_offset; offset is a player ID, not a row count.",
    inputSchema: s.object(
      "Player search and pagination parameters.",
      {
        search_by: s.string("Search by Email, Name or External Id."),
        filter: s.string("The value to search for."),
        limit: s.integer("Maximum players per page; default 50, maximum 1000.", {
          minimum: 1,
          maximum: 1000,
        }),
        offset: s.string("The last player ID from the previous page."),
      },
      {
        required: [],
      },
    ),
    outputSchema: envelope(
      s.looseObject("Players and pagination information.", {
        players: s.array("The matching players.", player),
        pagination: s.looseObject("Pagination cursors returned by Pointagram.", {
          limit: s.string("The page size returned by Pointagram."),
          offset: s.string("The current cursor."),
          next_offset: s.string("The player ID to use as the next offset."),
        }),
      }),
    ),
  }),
  defineProviderAction("pointagram", {
    name: "get_player",
    operationType: "read",
    description: "Get a Pointagram player by ID.",
    inputSchema: s.requiredObject("Player lookup parameters.", { player_id: playerId }),
    outputSchema: envelope(s.looseObject("The player details returned by Pointagram.", {})),
  }),
  defineProviderAction("pointagram", {
    name: "create_player",
    operationType: "write",
    description:
      "Create a Pointagram player. Online players receive an invitation; an existing player produces a conflict.",
    inputSchema: s.object("New player details.", playerFields, {
      required: ["player_name"],
    }),
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "update_player",
    operationType: "write",
    description: "Update a Pointagram player using the provided fields.",
    inputSchema: {
      ...s.object(
        "Player ID and fields to update.",
        { player_id: playerId, ...playerFields },
        {
          required: ["player_id"],
        },
      ),
      minProperties: 2,
    },
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "delete_player",
    operationType: "destructive",
    description:
      "Soft-delete a Pointagram player. Administrators cannot be removed. Complete anonymization requires the Pointagram UI; inspect the upstream status and message.",
    inputSchema: s.requiredObject("Player to soft-delete.", { player_id: playerId }),
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "list_teams",
    operationType: "read",
    description: "List Pointagram teams.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: envelope(s.looseObject("Team listing.", { teams: s.array("The teams.", team) })),
  }),
  defineProviderAction("pointagram", {
    name: "get_team",
    operationType: "read",
    description: "Get a Pointagram team by ID.",
    inputSchema: s.requiredObject("Team lookup parameters.", { team_id: teamId }),
    outputSchema: envelope(team),
  }),
  defineProviderAction("pointagram", {
    name: "create_team",
    operationType: "write",
    description: "Create a Pointagram team with an existing icon filename.",
    inputSchema: s.object("New team details.", teamFields, {
      required: ["team_name", "icon"],
    }),
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "update_team",
    operationType: "write",
    description: "Update a Pointagram team's name, icon and filter settings.",
    inputSchema: s.object(
      "Team ID and replacement team details.",
      { team_id: teamId, ...teamFields },
      {
        required: ["team_id", "team_name", "icon"],
      },
    ),
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "list_team_players",
    operationType: "read",
    description: "List the players belonging to a Pointagram team.",
    inputSchema: s.requiredObject("Team membership lookup parameters.", { team_id: teamId }),
    outputSchema: envelope(
      s.looseObject("Team membership details.", {
        players: s.array(
          "Players belonging to the team.",
          s.looseObject("A team member.", {
            profile_id: s.string("The player's profile ID."),
            name: s.string("The player's name."),
          }),
        ),
      }),
    ),
  }),
  defineProviderAction("pointagram", {
    name: "add_team_player",
    operationType: "write",
    description: "Add a player to a Pointagram team using a player ID, email address or external ID.",
    inputSchema: {
      ...s.object(
        "Team and player identifiers.",
        {
          team_id: teamId,
          player_id: playerId,
          player_email: s.nonWhitespaceString("The email address identifying the player."),
          player_external_id: s.nonWhitespaceString("The external ID identifying the player."),
        },
        {
          required: ["team_id"],
        },
      ),
      anyOf: [{ required: ["player_id"] }, { required: ["player_email"] }, { required: ["player_external_id"] }],
    },
    outputSchema: mutationOutput,
  }),
  defineProviderAction("pointagram", {
    name: "remove_team_player",
    operationType: "write",
    description: "Remove a player from a Pointagram team's membership without deleting the player.",
    inputSchema: s.requiredObject("Team and player IDs for membership removal.", {
      team_id: teamId,
      player_id: playerId,
    }),
    outputSchema: mutationOutput,
  }),
];
