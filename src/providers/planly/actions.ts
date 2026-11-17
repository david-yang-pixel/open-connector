import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const record = s.looseObject("Planly resource, including additional upstream fields.", {});
const pagination = s.object(
  "Cursor pagination options.",
  {
    cursor: s.nullableString("Cursor from the previous data.next; omit for the first page."),
    orderBy: s.tuple(
      [
        s.stringEnum("Sort property.", ["CreatedAt", "ContentLength"]),
        s.stringEnum("Sort direction.", ["asc", "desc"]),
      ],
      { description: "Sort property and direction." },
    ),
    pageSize: s.integer("Number of results; Planly defaults to 50.", { minimum: 1 }),
  },
  {
    optional: ["cursor", "orderBy", "pageSize"],
  },
);
const pageInput = s.object(
  "Team and pagination options.",
  {
    teamId: s.nonEmptyString("Team ID returned by list_teams."),
    pagination,
  },
  {
    optional: ["pagination"],
  },
);
const error = s.nullable(s.looseObject("Upstream error details, or null on success.", {}));
const envelope = (data: Record<string, unknown>) =>
  s.object(
    "Planly response envelope.",
    { data, error },
    {
      optional: ["error"],
      additionalProperties: true,
    },
  );
const pageOutput = envelope(
  s.object(
    "Page of Planly resources.",
    {
      rows: s.array("Resources in this page.", record),
      next: s.nullableString("Cursor for the next page, when available."),
      totalNumberOfRows: s.integer("Total number of matching resources, when provided."),
    },
    {
      optional: ["next", "totalNumberOfRows"],
      additionalProperties: true,
    },
  ),
);
const schedule = s.object(
  "A post to publish on a connected social channel.",
  {
    channelId: s.nonEmptyString("Connected channel ID returned by list_channels."),
    publishOn: s.string("Publication date and time; omit to publish immediately.", {
      format: "date-time",
    }),
    content: s.string("Text content for the post."),
    media: s.array(
      "Previously imported Planly media.",
      s.object(
        "Media reference and platform options.",
        {
          id: s.nonEmptyString("Planly media ID returned by import_media or list_media."),
          options: s.looseObject("Platform-specific media options passed unchanged to Planly.", {}),
        },
        {
          optional: ["options"],
        },
      ),
    ),
    options: s.looseObject(
      "Social-network options passed unchanged to Planly. Pinterest publishing requires boardId; TikTok requires privacyLevel. See https://docs.planly.com/#social-network-options for all platform fields.",
      {},
    ),
  },
  {
    optional: ["publishOn", "content", "media", "options"],
  },
);
export const planlyActions: readonly ActionDefinition[] = [
  defineProviderAction("planly", {
    name: "list_teams",
    operationType: "read",
    description: "List the Planly teams accessible to the API key.",
    requiredScopes: [],
    inputSchema: s.object(
      "No input is required.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: envelope(
      s.array(
        "Accessible teams.",
        s.looseObject("Planly team.", {
          id: s.string("Team ID."),
          name: s.string("Team name."),
        }),
      ),
    ),
  }),
  defineProviderAction("planly", {
    name: "list_channels",
    operationType: "read",
    description: "List connected social channels in a Planly team.",
    requiredScopes: [],
    inputSchema: s.object(
      "Channel list filters.",
      {
        team_id: s.nonEmptyString("Team ID returned by list_teams."),
        excludeCompetitors: s.boolean("Exclude competitor channels; defaults to false."),
      },
      {
        optional: ["excludeCompetitors"],
      },
    ),
    outputSchema: envelope(
      s.array(
        "Connected channels.",
        s.looseObject("Planly channel.", {
          id: s.string("Channel ID."),
          name: s.string("Channel name."),
          social_network: s.string("Social network identifier."),
        }),
      ),
    ),
  }),
  defineProviderAction("planly", {
    name: "import_media",
    operationType: "write",
    description: "Import a public media URL into Planly. Supports MP4, PNG, JPEG and WebP.",
    requiredScopes: [],
    inputSchema: s.object(
      "Media URL and destination team.",
      {
        teamId: s.nonEmptyString("Destination team ID."),
        url: s.string("Public media URL downloaded by Planly.", { format: "uri" }),
      },
      {
        optional: [],
      },
    ),
    outputSchema: envelope(
      s.looseObject("Imported media metadata.", {
        id: s.string("Media ID for use in schedules."),
        contentUri: s.string("Hosted media URL."),
      }),
    ),
  }),
  defineProviderAction("planly", {
    name: "list_media",
    operationType: "read",
    description: "List a page of media in a Planly team.",
    requiredScopes: [],
    inputSchema: pageInput,
    outputSchema: pageOutput,
  }),
  defineProviderAction("planly", {
    name: "delete_media",
    operationType: "destructive",
    description: "Delete media resources from Planly by ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Media resources to delete.",
      {
        ids: s.array("Media IDs to delete.", s.nonEmptyString("Media ID."), { minItems: 1 }),
      },
      {
        optional: [],
      },
    ),
    outputSchema: envelope(s.boolean("Whether the deletion succeeded.")),
  }),
  defineProviderAction("planly", {
    name: "create_schedules",
    operationType: "write",
    description:
      "Create scheduled or immediate social posts in Planly. This endpoint creates scheduled posts, not drafts; publication status can be read with list_schedules.",
    requiredScopes: [],
    inputSchema: s.object(
      "Posts to create.",
      {
        schedules: s.array("Social posts to schedule.", schedule, { minItems: 1 }),
      },
      {
        optional: [],
      },
    ),
    outputSchema: envelope(
      s.looseObject("Created schedule groups.", {
        upsert: s.array("Created groups with schedules and publication status.", record),
      }),
    ),
  }),
  defineProviderAction("planly", {
    name: "list_schedules",
    operationType: "read",
    description: "List a page of Planly schedules and their publication status.",
    requiredScopes: [],
    inputSchema: pageInput,
    outputSchema: pageOutput,
  }),
  defineProviderAction("planly", {
    name: "list_pinterest_boards",
    operationType: "read",
    description: "List boards for a connected Pinterest channel to obtain publishing board IDs.",
    requiredScopes: [],
    inputSchema: s.object(
      "Pinterest channel to query.",
      {
        channelId: s.nonEmptyString("Connected Pinterest channel ID."),
      },
      {
        optional: [],
      },
    ),
    outputSchema: envelope(
      s.looseObject("Pinterest boards result.", {
        boards: s.array(
          "Available boards.",
          s.looseObject("Pinterest board.", {
            value: s.string("Board ID."),
            label: s.string("Board name."),
          }),
        ),
      }),
    ),
  }),
];
