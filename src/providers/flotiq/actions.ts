import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "flotiq";
const contentType = s.nonEmptyString("The content type API name, such as blogposts.");
const id = s.nonEmptyString("The content object ID.");
const hydrate = s.integer("Relation hydration depth: 0, 1 or 2.", { minimum: 0, maximum: 2 });
const preview = s.boolean("Include draft and archived content using X-MODE: preview; defaults to false.");
const objectOutput = s.object(
  "The returned content object.",
  {
    object: s.looseObject("The content object's schema-defined fields and Flotiq metadata."),
  },
  {
    optional: [],
  },
);
const content = s.looseObject(
  "Content fields matching the content type schema, including optional id and relation references. Maximum object size is 1 MB.",
);
export const flotiqActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_content_type",
    operationType: "read",
    requiredScopes: [],
    description: "Get a Flotiq content type definition to discover its fields before reading or writing objects.",
    inputSchema: s.object(
      "Content type lookup parameters.",
      {
        contentType,
        resolveRef: s.boolean("Resolve schema references; defaults to false."),
        strictSchema: s.boolean("Use the OpenAPI-compatible schema property when resolveRef is true."),
      },
      {
        optional: ["resolveRef", "strictSchema"],
      },
    ),
    outputSchema: s.object(
      "The content type definition.",
      {
        contentType: s.looseObject("The complete content type definition and schema."),
      },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction(service, {
    name: "list_content_objects",
    operationType: "read",
    requiredScopes: [],
    description:
      "List one page of Flotiq content objects with filtering, sorting, relation hydration and optional draft preview.",
    inputSchema: s.object(
      "Content object listing parameters.",
      {
        contentType,
        page: s.integer("The 1-based page number; defaults to 1.", { minimum: 1 }),
        limit: s.integer("Objects per page; defaults to 20, maximum 1000.", {
          minimum: 1,
          maximum: 1000,
        }),
        order_by: s.nonEmptyString("The schema field to sort by, such as internal.createdAt."),
        order_direction: s.stringEnum("Sort direction; defaults to asc.", ["asc", "desc"]),
        empty_first: s.boolean("Place empty values first; defaults to false."),
        filters: s.looseObject(
          "Flotiq filter conditions keyed by field, such as {title: {type: 'equals', filter: 'Hello'}}. Encoded as JSON by the connector.",
        ),
        hydrate,
        preview,
      },
      {
        optional: ["page", "limit", "order_by", "order_direction", "empty_first", "filters", "hydrate", "preview"],
      },
    ),
    outputSchema: s.looseObject("One page of content objects and upstream pagination metadata.", {
      data: s.array("The content objects on this page.", s.looseObject("A content object with user-defined fields.")),
      total_count: s.integer("Total matching objects."),
      total_pages: s.integer("Total available pages."),
      current_page: s.integer("The returned 1-based page number."),
      count: s.integer("The number of objects on this page."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_content_object",
    operationType: "read",
    requiredScopes: [],
    description: "Get a Flotiq content object by ID with optional relation hydration and draft preview.",
    inputSchema: s.object(
      "Content object lookup parameters.",
      { contentType, id, hydrate, preview },
      {
        optional: ["hydrate", "preview"],
      },
    ),
    outputSchema: objectOutput,
  }),
  defineProviderAction(service, {
    name: "create_content_object",
    operationType: "write",
    requiredScopes: [],
    description:
      "Create a Flotiq content object using fields from its content type schema. Types with Draft & Public enabled create drafts.",
    inputSchema: s.object(
      "Content object creation parameters.",
      { contentType, content },
      {
        optional: [],
      },
    ),
    outputSchema: objectOutput,
  }),
  defineProviderAction(service, {
    name: "update_content_object",
    operationType: "write",
    requiredScopes: [],
    description:
      "Update a Flotiq content object. PATCH changes supplied fields; PUT replaces object data and requires all schema-required fields.",
    inputSchema: s.object(
      "Content object update parameters.",
      {
        contentType,
        id,
        content,
        method: s.stringEnum("Update method; defaults to PATCH. PUT requires the complete object data.", [
          "PATCH",
          "PUT",
        ]),
      },
      {
        optional: ["method"],
      },
    ),
    outputSchema: objectOutput,
  }),
  defineProviderAction(service, {
    name: "delete_content_object",
    operationType: "destructive",
    requiredScopes: [],
    description: "Delete one Flotiq content object by ID. Flotiq can reject deletion when other objects reference it.",
    inputSchema: s.object(
      "Content object deletion parameters.",
      { contentType, id },
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "The confirmed deletion result.",
      {
        deleted: s.boolean("Whether Flotiq accepted the deletion."),
      },
      {
        optional: [],
      },
    ),
  }),
];
