import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "papertrail";

const emptyInputSchema = s.object("An empty Papertrail action input.", {});
const resourceSchema = s.looseRequiredObject("A Papertrail resource returned by the API.", {
  id: s.integer("The numeric Papertrail resource ID."),
  name: s.string("The Papertrail resource name."),
});
const savedSearchSchema = s.looseRequiredObject("A Papertrail saved search.", {
  id: s.integer("The numeric saved-search ID."),
  name: s.string("The saved-search name."),
  query: s.string("The Papertrail event query stored by the saved search."),
});
const savedSearchInputFields = {
  name: s.nonEmptyString("The saved-search name."),
  query: s.nonEmptyString("The Papertrail event query to save."),
  groupId: s.integer("The Papertrail group ID associated with the saved search.", { minimum: 1 }),
};

const actions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "search_events",
    operationType: "read",
    description: "Search Papertrail log events with optional resource and time boundaries.",
    inputSchema: s.object(
      "The input payload for searching Papertrail log events.",
      {
        query: s.string("The Papertrail event search query. Omit it to return recent events."),
        systemId: s.string("The Papertrail system ID or unique system name used to limit results."),
        groupId: s.integer("The Papertrail group ID used to limit results.", { minimum: 1 }),
        minId: s.string("The oldest Papertrail event ID to examine."),
        minTime: s.integer("The oldest UTC Unix timestamp to examine."),
        maxId: s.string("The newest Papertrail event ID to examine."),
        maxTime: s.integer("The newest UTC Unix timestamp to examine."),
        limit: s.integer("The maximum number of events to return.", {
          minimum: 1,
          maximum: 10_000,
        }),
        tail: s.boolean("Whether Papertrail should prioritize recent events for live-tail usage."),
      },
      {
        optional: ["query", "systemId", "groupId", "minId", "minTime", "maxId", "maxTime", "limit", "tail"],
      },
    ),
    outputSchema: s.object("The Papertrail event search response.", {
      events: s.array(
        "The matching Papertrail log events.",
        s.looseObject("One Papertrail log event, including its string event ID and message."),
      ),
      minId: s.nullable(s.string("The lowest Papertrail event ID examined.")),
      maxId: s.nullable(s.string("The highest Papertrail event ID examined.")),
      minTimeAt: s.nullable(s.string("The oldest human-readable timestamp examined.")),
      maxTimeAt: s.nullable(s.string("The newest human-readable timestamp examined.")),
    }),
  }),
  defineProviderAction(service, {
    name: "list_systems",
    operationType: "read",
    description: "List systems registered in the Papertrail account.",
    inputSchema: emptyInputSchema,
    outputSchema: s.object("The Papertrail systems response.", {
      systems: s.array("The systems registered in Papertrail.", resourceSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "list_groups",
    operationType: "read",
    description: "List Papertrail groups and their current system membership.",
    inputSchema: emptyInputSchema,
    outputSchema: s.object("The Papertrail groups response.", {
      groups: s.array("The groups configured in Papertrail.", resourceSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "list_saved_searches",
    operationType: "read",
    description: "List saved event searches in Papertrail.",
    inputSchema: emptyInputSchema,
    outputSchema: s.object("The Papertrail saved-search list response.", {
      savedSearches: s.array("The saved searches configured in Papertrail.", savedSearchSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "create_saved_search",
    operationType: "write",
    description: "Create a Papertrail saved event search.",
    inputSchema: s.object("The input payload for creating a Papertrail saved search.", savedSearchInputFields, {
      optional: ["groupId"],
    }),
    outputSchema: s.object("The Papertrail saved-search creation response.", {
      savedSearch: savedSearchSchema,
    }),
  }),
  defineProviderAction(service, {
    name: "update_saved_search",
    operationType: "destructive",
    description: "Replace the name, query, and optional group of a Papertrail saved search.",
    inputSchema: s.object(
      "The input payload for updating a Papertrail saved search.",
      {
        id: s.integer("The numeric Papertrail saved-search ID to update.", { minimum: 1 }),
        ...savedSearchInputFields,
      },
      { optional: ["groupId"] },
    ),
    outputSchema: s.object("The Papertrail saved-search update response.", {
      savedSearch: savedSearchSchema,
    }),
  }),
  defineProviderAction(service, {
    name: "delete_saved_search",
    operationType: "destructive",
    description: "Permanently delete a Papertrail saved search.",
    inputSchema: s.object("The input payload for deleting a Papertrail saved search.", {
      id: s.integer("The numeric Papertrail saved-search ID to delete.", { minimum: 1 }),
    }),
    outputSchema: s.object("The Papertrail saved-search deletion response.", {
      message: s.string("The deletion confirmation returned by Papertrail."),
    }),
  }),
];

export const papertrailActions: readonly ActionDefinition[] = actions;
