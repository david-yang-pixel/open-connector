import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const id = s.anyOf(
  [s.integer("Numeric identifier.", { minimum: 1 }), s.string("Numeric identifier.", { pattern: "^[0-9]+$" })],
  { description: "Numeric resource identifier, not its display number." },
);
const scalar = s.anyOf([s.string("Text value."), s.integer("Integer value.")], {
  description: "Text or integer value.",
});
const layout = s.stringEnum("Response layout; long includes comments, attachments, and service statistics.", [
  "short",
  "long",
]);
function clearableReference(field: string, description: string) {
  return s.anyOf(
    [
      s.requiredObject(description, { [field]: s.string(`Reference ${field}.`) }),
      {
        type: "null",
        const: null,
        description: "Clear the reference.",
      },
      s.literal("", {
        description: "Clear the reference with an empty string.",
      }),
      s.literal("nil", {
        description: "Clear the reference with nil.",
      }),
    ],
    { description },
  );
}
const emailReference = clearableReference("email", "User referenced by email, or an explicit clearing value.");
const nameReference = clearableReference("name", "Object referenced by name, or an explicit clearing value.");
const customValue = s.nullable(scalar);
const customField = s.object(
  "A JSON custom field value; binary attachment fields are not supported.",
  {
    name: s.string("Custom field name."),
    value: customValue,
    user_value: emailReference,
  },
  {
    optional: ["value", "user_value"],
  },
);
const customAttribute = s.object(
  "A custom field value addressed by ID.",
  {
    id,
    custom_field_id: id,
    value: customValue,
  },
  {
    required: [],
  },
);
function oneOrMany(schema: JsonSchema, description: string, maxItems?: number) {
  return s.anyOf([schema, s.array(description, schema, { maxItems })], { description });
}
const related = s.requiredObject("Related resource identified by its display number.", { number: scalar });
const incidentFields = {
  name: s.string("Incident name; the API truncates names longer than 255 characters."),
  site_id: {
    ...scalar,
    description: "Site ID.",
  },
  department_id: {
    ...scalar,
    description: "Department ID.",
  },
  description: s.nullable(s.string("Incident description.")),
  state_id: {
    ...scalar,
    description: "Tenant-defined incident state ID.",
  },
  assignee: emailReference,
  group_assignee: nameReference,
  assignee_id: {
    ...scalar,
    description: "Assigned user ID.",
  },
  group_assignee_id: {
    ...scalar,
    description: "Assigned group ID.",
  },
  priority: {
    ...scalar,
    description: "Incident priority as a name or numeric value.",
  },
  requester: emailReference,
  category: nameReference,
  subcategory: nameReference,
  due_at: s.string("Due date in a SolarWinds-supported date format."),
  add_to_tag_list: s.string("Comma-separated tags to add."),
  remove_from_tag_list: s.string("Comma-separated tags to remove."),
  tag_list: s.string("Comma-separated complete tag list."),
  custom_fields_values: s.requiredObject("Custom fields addressed by name.", {
    custom_fields_value: oneOrMany(customField, "One or more custom field values."),
  }),
  custom_fields_values_attributes: oneOrMany(customAttribute, "Custom field values addressed by ID."),
  incidents: oneOrMany(related, "Related incidents."),
  solutions: oneOrMany(related, "Related knowledge base solutions."),
  changes: oneOrMany(related, "Related changes."),
  problems: oneOrMany(related, "Related problem; at most one can be associated.", 1),
  releases: oneOrMany(related, "Related releases."),
  configuration_item_ids: s.array("Related configuration item IDs.", id),
  cc: s.array("Email addresses to copy on the incident.", s.string("An email address.", { format: "email" })),
};
const incident = s.looseObject("Incident data, including upstream fields for the requested layout.", {
  id: scalar,
  number: s.integer("Incident display number."),
  name: s.string("Incident name."),
  description: s.nullable(s.string("Incident description.")),
  state: s.string("Current state name."),
  priority: s.string("Priority name."),
  requester: s.nullable(s.looseObject("Requester details.")),
  assignee: s.nullable(s.looseObject("Assigned user details.")),
  created_at: s.string("Creation timestamp."),
  updated_at: s.string("Last update timestamp."),
});
const incidentOutput = s.requiredObject("Incident response.", { incident });
export const solarwindsServiceDeskActions: ActionDefinition[] = [
  defineProviderAction("solarwinds_service_desk", {
    name: "list_incidents",
    operationType: "read",
    description: "List SolarWinds Service Desk incidents with pagination, layout, and creation or update time filters.",
    inputSchema: s.object(
      "Incident listing options.",
      {
        page: s.integer("Page number, starting at 1.", { minimum: 1 }),
        per_page: s.integer("Number of records requested per page.", { minimum: 1 }),
        layout,
        updated: s.string("Relative update window: 1-90 or 365 days, or 1h-23h."),
        updated_from: s.string("Start of update time range in ISO 8601 UTC."),
        updated_to: s.string("End of update time range in ISO 8601 UTC."),
        created_from: s.string("Start of creation time range in ISO 8601 UTC."),
        created_to: s.string("End of creation time range in ISO 8601 UTC."),
      },
      {
        required: [],
      },
    ),
    outputSchema: s.requiredObject("Incident page with upstream pagination metadata.", {
      incidents: s.array("Incidents on this page.", incident),
      page: s.integer("Requested page number."),
      per_page: s.nullable(s.integer("Actual page size reported in X-Per-Page.")),
      total_count: s.nullable(s.integer("Total count reported in X-Total-Count.")),
      total_pages: s.nullable(s.integer("Total pages reported in X-Total-Pages.")),
      link: s.nullable(s.string("Upstream Link header containing pagination URLs; returned without fetching them.")),
    }),
  }),
  defineProviderAction("solarwinds_service_desk", {
    name: "get_incident",
    operationType: "read",
    description: "Get a SolarWinds Service Desk incident by ID, optionally including its long-layout details.",
    inputSchema: s.object(
      "Incident lookup.",
      { id, layout },
      {
        optional: ["layout"],
      },
    ),
    outputSchema: incidentOutput,
  }),
  defineProviderAction("solarwinds_service_desk", {
    name: "create_incident",
    operationType: "write",
    description:
      "Create a SolarWinds Service Desk incident with assignment, tags, related resources, and JSON custom fields.",
    inputSchema: s.requiredObject("Incident creation request.", {
      incident: s.object("Incident fields to create.", incidentFields, {
        required: ["name"],
      }),
    }),
    outputSchema: incidentOutput,
  }),
  defineProviderAction("solarwinds_service_desk", {
    name: "update_incident",
    operationType: "write",
    description:
      "Update a SolarWinds Service Desk incident, including assignment, custom fields, or a state change that may close it.",
    inputSchema: s.requiredObject("Incident update request.", {
      id,
      incident: {
        ...s.object("Fields to update; omitted fields are unchanged.", incidentFields, {
          required: [],
        }),
        minProperties: 1,
      },
    }),
    outputSchema: incidentOutput,
  }),
  defineProviderAction("solarwinds_service_desk", {
    name: "delete_incident",
    operationType: "destructive",
    description: "Delete a SolarWinds Service Desk incident by its resource ID.",
    inputSchema: s.requiredObject("Incident deletion request.", { id }),
    outputSchema: s.object(
      "Deleted incident IDs.",
      {
        deleted_ids: s.array("IDs returned by SolarWinds for the deleted incidents.", scalar),
      },
      { required: ["deleted_ids"], additionalProperties: true },
    ),
  }),
  defineProviderAction("solarwinds_service_desk", {
    name: "create_incident_comment",
    operationType: "write",
    description:
      "Add a public or private comment to a SolarWinds Service Desk incident, optionally triggering notifications.",
    inputSchema: s.object(
      "New incident comment.",
      {
        id,
        body: s.string("Comment body."),
        is_private: s.anyOf(
          [
            s.boolean("Whether the comment is private."),
            s.stringEnum("String form of the privacy flag.", ["true", "false"]),
          ],
          { description: "Whether the comment is private." },
        ),
        user_id: id,
        add_callbacks: s.boolean("Enable notifications; the API does not trigger them by default."),
      },
      {
        required: ["id", "body"],
      },
    ),
    outputSchema: s.object(
      "Comment creation response.",
      {
        comment: s.looseObject("Created comment.", {
          id: scalar,
          body: s.string("Comment body."),
          is_private: s.anyOf([s.boolean("Privacy flag."), s.string("Privacy flag returned as text.")], {
            description: "Comment privacy flag.",
          }),
          created_at: s.string("Creation timestamp."),
          user: s.looseObject("Author details."),
        }),
      },
      { required: ["comment"], additionalProperties: true },
    ),
  }),
];
