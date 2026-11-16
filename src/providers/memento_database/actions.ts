import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "memento_database";
const libraryId = s.nonEmptyString("The library ID returned by list_libraries.");
const entryId = s.nonEmptyString("The entry ID returned by Memento Database.");
const pageToken = s.nonEmptyString("The nextPageToken from the previous response.");
const selectedFields = s.nonEmptyString("Comma-separated field IDs or *all. Defaults to *all to include field values.");
const fieldValues = s.array(
  "The entry fields. Use field IDs from get_library and values matching their field types.",
  s.object(
    "One library field value.",
    {
      id: s.integer("The field ID defined in the library."),
      value: s.unknown("The JSON value accepted by the library field type."),
    },
    {
      optional: [],
    },
  ),
);
const entry = s.object(
  "The entry returned by Memento Database, including any additional upstream fields.",
  {
    id: s.string("The entry ID."),
    author: s.string("The entry author."),
    createdTime: s.string("The entry creation timestamp."),
    modifiedTime: s.string("The entry modification timestamp."),
    revision: s.integer("The entry revision."),
    status: s.string("The entry status."),
    size: s.number("The entry size reported by Memento Database."),
    fields: fieldValues,
  },
  {
    optional: ["author", "createdTime", "modifiedTime", "revision", "status", "size", "fields"],
    additionalProperties: true,
  },
);
const library = s.object(
  "The library metadata returned by Memento Database.",
  {
    id: s.string("The library ID."),
    name: s.string("The library name."),
    owner: s.string("The library owner."),
    createdTime: s.string("The library creation timestamp."),
    modifiedTime: s.string("The library modification timestamp."),
    revision: s.integer("The library revision."),
    size: s.number("The library size reported by Memento Database."),
    fields: s.array(
      "The library field definitions.",
      s.object(
        "A library field definition.",
        {
          id: s.integer("The field ID defined in the library."),
          type: s.string("The library field type."),
          name: s.string("The library field name."),
        },
        {
          optional: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    optional: ["owner", "createdTime", "modifiedTime", "revision", "size", "fields"],
    additionalProperties: true,
  },
);
const entries = s.array("The entries in this response page.", entry);
const nextPageToken = s.string("The continuation token, when another page is available.");
export const mementoDatabaseActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "list_libraries",
    description: "List the Memento Database libraries accessible to the connected account.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The input for listing libraries.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "The accessible libraries.",
      {
        libraries: s.array("The library metadata list.", library),
      },
      {
        optional: [],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction(service, {
    name: "get_library",
    description: "Get a Memento Database library and its field definitions before editing entries.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The library to retrieve.",
      { libraryId },
      {
        optional: [],
      },
    ),
    outputSchema: library,
  }),
  defineProviderAction(service, {
    name: "list_entries",
    description: "List one page of Memento Database entries, optionally starting at a library revision.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry listing parameters.",
      {
        libraryId,
        pageSize: s.integer("The maximum number of entries per page. The upstream default is 50.", {
          minimum: 1,
        }),
        pageToken,
        fields: selectedFields,
        startRevision: s.integer("Return entries updated or created at or after this revision."),
      },
      {
        optional: ["pageSize", "pageToken", "fields", "startRevision"],
      },
    ),
    outputSchema: s.object(
      "One page of library entries.",
      {
        entries,
        nextPageToken,
        revision: s.integer("The library revision returned with the page."),
      },
      {
        optional: ["nextPageToken", "revision"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction(service, {
    name: "search_entries",
    description: "Search one page of Memento Database entries using a text query.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry search parameters.",
      {
        libraryId,
        q: s.nonEmptyString("The search query. Pass plain text; the connector URL-encodes it."),
        pageToken,
        fields: selectedFields,
      },
      {
        optional: ["pageToken", "fields"],
      },
    ),
    outputSchema: s.object(
      "One page of matching entries.",
      {
        entries,
        nextPageToken,
        total: s.integer("The total number of matching entries."),
      },
      {
        optional: ["nextPageToken", "total"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction(service, {
    name: "get_entry",
    description: "Get a single Memento Database entry and its field values.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry to retrieve.",
      { libraryId, entryId },
      {
        optional: [],
      },
    ),
    outputSchema: entry,
  }),
  defineProviderAction(service, {
    name: "create_entry",
    description: "Create a Memento Database entry using existing library field IDs.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry to create.",
      { libraryId, fields: fieldValues },
      {
        optional: [],
      },
    ),
    outputSchema: entry,
  }),
  defineProviderAction(service, {
    name: "update_entry",
    description: "Update fields of an existing Memento Database entry.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry fields to update.",
      {
        libraryId,
        entryId,
        fields: fieldValues,
      },
      {
        optional: [],
      },
    ),
    outputSchema: entry,
  }),
  defineProviderAction(service, {
    name: "delete_entry",
    description: "Delete a Memento Database entry from a library.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: s.object(
      "The entry to delete.",
      { libraryId, entryId },
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "The confirmed deletion result.",
      {
        success: s.boolean("Whether the upstream deletion request succeeded."),
      },
      {
        optional: [],
      },
    ),
  }),
];
