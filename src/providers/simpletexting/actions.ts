import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const pagination = {
  page: s.optional(s.integer("Zero-based page number. Defaults to 0.", { minimum: 0 })),
  size: s.optional(s.integer("Results per page. Defaults to 50; maximum 500.", { minimum: 1, maximum: 500 })),
};
const contactId = s.nonWhitespaceString("Contact phone number (preferred) or hexadecimal contact ID.");
const listId = s.nonWhitespaceString("Contact list ID or exact list name.");
const customFields = s.record(
  "Custom field values keyed by field name or merge tag without percent signs.",
  s.string("Custom field value."),
);
const contactFields = {
  contactPhone: s.string("Contact phone number."),
  firstName: s.string("Contact first name."),
  lastName: s.string("Contact last name."),
  email: s.string("Contact email address."),
  birthday: s.string("Contact birthday in YYYY-MM-DD format."),
  customFields,
  comment: s.string("Notes about the contact."),
  listIds: s.array(
    "List IDs or names to add or replace, controlled by listsReplacement.",
    s.string("List ID or name."),
  ),
};
const updateFlags = {
  upsert: s.optional(s.boolean("Update an existing contact with the body phone number. Upstream defaults to true.")),
  listsReplacement: s.optional(
    s.boolean("Replace existing list memberships when true; add memberships when false. Upstream defaults to true."),
  ),
};
const { listIds: _listIds, ...contactOutputFields } = contactFields;
const contact = s.looseObject("Contact details, including upstream extension fields.", {
  ...contactOutputFields,
  contactId: s.string("Contact ID."),
  lists: s.array(
    "Lists containing the contact.",
    s.looseObject("Contact list membership.", {
      id: s.string("List ID."),
      name: s.string("List name."),
    }),
  ),
  subscriptionStatus: s.string("Contact subscription status."),
  created: s.string("Creation timestamp in ISO 8601 format."),
  updated: s.string("Last update timestamp in ISO 8601 format."),
  updateSource: s.string("Source of the most recent update."),
});
const list = s.looseObject("Contact list details.", {
  listId: s.string("Contact list ID."),
  name: s.string("Contact list name."),
  created: s.string("Creation timestamp."),
  updated: s.string("Last update timestamp."),
  description: s.nullable(s.string("Description assigned to automatically created lists.")),
  totalContactsCount: s.integer("Total number of contacts."),
  activeContactsCount: s.integer("Number of active contacts."),
  invalidContactsCount: s.integer("Number of invalid contacts."),
  unsubscribedContactsCount: s.integer("Number of unsubscribed contacts."),
  keywords: s.array("Associated keywords.", s.string("Keyword.")),
});
const idOutput = s.looseObject("Created or updated resource identifier.", {
  id: s.string("Resource ID."),
});
const successOutput = s.looseObject("Operation result. Empty successful responses become success: true.", {
  success: s.boolean("Whether the empty-response operation succeeded."),
});
const listName = s.nonWhitespaceString("List name containing fewer than 42 characters.", {
  maxLength: 41,
});
function pageOutput(item: JsonSchema) {
  return s.looseObject("One page of results and pagination totals.", {
    content: s.array("Items on this page.", item),
    totalPages: s.integer("Total number of pages."),
    totalElements: s.integer("Total number of matching items."),
  });
}
export const simpletextingActions: ActionDefinition[] = [
  defineProviderAction("simpletexting", {
    name: "list_contacts",
    operationType: "read",
    description: "List one page of SimpleTexting contacts, optionally updated since a timestamp.",
    inputSchema: s.requiredObject("Contact search parameters.", {
      ...pagination,
      since: s.optional(s.string("Only contacts updated since this ISO 8601 timestamp.", { format: "date-time" })),
      direction: s.optional(s.stringEnum("Sort direction for the updated field. Defaults to desc.", ["asc", "desc"])),
    }),
    outputSchema: pageOutput(contact),
  }),
  defineProviderAction("simpletexting", {
    name: "get_contact",
    operationType: "read",
    description: "Get a SimpleTexting contact by phone number or ID.",
    inputSchema: s.requiredObject("Contact lookup.", { contactIdOrNumber: contactId }),
    outputSchema: contact,
  }),
  defineProviderAction("simpletexting", {
    name: "create_contact",
    operationType: "write",
    description: "Create a SimpleTexting contact, or update an existing contact when upsert is enabled.",
    inputSchema: s.object(
      "Contact creation parameters.",
      { ...contactFields, ...updateFlags },
      {
        required: ["contactPhone"],
      },
    ),
    outputSchema: idOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "update_contact",
    operationType: "write",
    description: "Update a SimpleTexting contact and optionally replace or add list memberships.",
    inputSchema: s.object(
      "Contact update parameters.",
      { contactIdOrNumber: contactId, ...contactFields, ...updateFlags },
      {
        required: ["contactIdOrNumber"],
      },
    ),
    outputSchema: idOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "delete_contact",
    operationType: "destructive",
    description: "Delete a SimpleTexting contact by phone number or ID.",
    inputSchema: s.requiredObject("Contact deletion parameters.", { contactIdOrNumber: contactId }),
    outputSchema: successOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "list_contact_lists",
    operationType: "read",
    description: "List one page of SimpleTexting contact lists.",
    inputSchema: s.requiredObject("Contact list pagination.", pagination),
    outputSchema: pageOutput(list),
  }),
  defineProviderAction("simpletexting", {
    name: "get_contact_list",
    operationType: "read",
    description: "Get a SimpleTexting contact list by ID or name.",
    inputSchema: s.requiredObject("Contact list lookup.", { listIdOrName: listId }),
    outputSchema: list,
  }),
  defineProviderAction("simpletexting", {
    name: "create_contact_list",
    operationType: "write",
    description: "Create a SimpleTexting contact list.",
    inputSchema: s.requiredObject("Contact list creation parameters.", { name: listName }),
    outputSchema: idOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "update_contact_list",
    operationType: "write",
    description: "Rename a SimpleTexting contact list by ID or existing name.",
    inputSchema: s.requiredObject("Contact list update parameters.", { listIdOrName: listId, name: listName }),
    outputSchema: idOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "delete_contact_list",
    operationType: "destructive",
    description: "Delete a SimpleTexting contact list by ID or name.",
    inputSchema: s.requiredObject("Contact list deletion parameters.", { listIdOrName: listId }),
    outputSchema: successOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "add_contact_to_list",
    operationType: "write",
    description: "Add an existing SimpleTexting contact to a contact list.",
    inputSchema: s.requiredObject("Contact list membership parameters.", {
      listIdOrName: listId,
      contactPhoneOrId: contactId,
    }),
    outputSchema: successOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "remove_contact_from_list",
    operationType: "write",
    description: "Remove a contact from a SimpleTexting list without deleting the contact.",
    inputSchema: s.requiredObject("Contact list membership parameters.", {
      listIdOrName: listId,
      contactPhoneOrId: contactId,
    }),
    outputSchema: successOutput,
  }),
  defineProviderAction("simpletexting", {
    name: "list_segments",
    operationType: "read",
    description: "List one page of SimpleTexting contact segments.",
    inputSchema: s.requiredObject("Segment pagination.", pagination),
    outputSchema: pageOutput(
      s.looseObject("Contact segment.", {
        segmentId: s.string("Segment ID."),
        name: s.string("Segment name."),
        created: s.string("Creation timestamp."),
        updated: s.string("Last update timestamp."),
      }),
    ),
  }),
  defineProviderAction("simpletexting", {
    name: "list_custom_fields",
    operationType: "read",
    description: "List one page of SimpleTexting custom fields and their merge tags.",
    inputSchema: s.requiredObject("Custom field pagination.", pagination),
    outputSchema: pageOutput(
      s.looseObject("Custom field definition.", {
        label: s.string("Custom field name."),
        type: s.string("Custom field type."),
        mergeTag: s.string("Merge tag used to supply custom field values."),
        defaultMaxLength: s.integer("Default maximum field length."),
      }),
    ),
  }),
  defineProviderAction("simpletexting", {
    name: "get_account",
    operationType: "read",
    description: "Get the SimpleTexting account email associated with the connected API token.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseObject("Account identity.", { email: s.string("Account email address.") }),
  }),
];
