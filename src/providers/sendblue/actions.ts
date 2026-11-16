import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const phone = (description: string) => s.string(description, { pattern: "^\\+[1-9][0-9]{1,14}$" });
const number = phone("Contact phone number in E.164 format.");
const tags = s.array("Complete set of contact tags; replaces existing tags on update.", s.string("A tag label."));
const variables = s.record(
  "Custom variables keyed by human-readable label; new labels are created and updates merge existing values.",
  s.string("A custom variable value."),
);
const fields = {
  first_name: s.string("Contact first name."),
  last_name: s.string("Contact last name."),
  sendblue_number: phone("Associated Sendblue phone number in E.164 format."),
  assigned_to_email: s.string("Email of the user assigned to the contact."),
  tags,
  custom_variables: variables,
};
const contact = s.looseObject("Contact returned by Sendblue; upstream snake_case or camelCase fields are preserved.", {
  phone: s.string("Contact phone number."),
  contact_id: s.string("Immutable contact identifier when returned."),
});
const status = s.string("Upstream operation status.");
const contactOutput = s.looseObject("Contact operation response.", { status, contact });
const statusOutput = s.looseObject("Operation response.", { status });
export const sendblueActions: ActionDefinition[] = [
  defineProviderAction("sendblue", {
    name: "list_contacts",
    operationType: "read",
    requiredScopes: [],
    description: "List Sendblue contacts with offset pagination, phone or identity filters, and sorting.",
    inputSchema: s.object(
      "Contact list input.",
      {
        limit: s.integer("Maximum contacts per page; defaults to 100, capped at 1000.", {
          minimum: 1,
          maximum: 1000,
          default: 100,
        }),
        offset: s.integer("Contacts to skip; capped at 10000.", {
          minimum: 0,
          maximum: 10000,
          default: 0,
        }),
        order_by: s.stringEnum("Contact sort field.", ["created_at", "firstName", "lastName", "phone"]),
        order_direction: s.stringEnum("Sort direction.", ["asc", "desc"]),
        phone_number: number,
        cid: s.nonEmptyString("Filter by contact ID."),
        created_at_gte: s.string("Include contacts created at or after this ISO 8601 timestamp.", {
          format: "date-time",
        }),
      },
      {
        optional: ["limit", "offset", "order_by", "order_direction", "phone_number", "cid", "created_at_gte"],
      },
    ),
    outputSchema: s.requiredObject(
      "Contact list response; advance offset by the returned count to request another page.",
      {
        contacts: s.array("Contacts in this page.", contact),
      },
    ),
  }),
  defineProviderAction("sendblue", {
    name: "count_contacts",
    operationType: "read",
    requiredScopes: [],
    description: "Count Sendblue contacts, optionally filtered by phone number.",
    inputSchema: s.object("Contact count input.", { phone_number: number }, { optional: ["phone_number"] }),
    outputSchema: s.looseObject("Contact count response.", {
      count: s.integer("Number of matching contacts."),
    }),
  }),
  defineProviderAction("sendblue", {
    name: "get_contact",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a Sendblue contact by phone number.",
    inputSchema: s.requiredObject("Contact lookup input.", { number }),
    outputSchema: contactOutput,
  }),
  defineProviderAction("sendblue", {
    name: "create_contact",
    operationType: "write",
    requiredScopes: [],
    description: "Create a Sendblue contact, optionally updating an existing contact with the same number.",
    inputSchema: s.object(
      "Contact creation input.",
      {
        number,
        ...fields,
        update_if_exists: s.boolean("Update the contact when it already exists; defaults to false."),
      },
      { optional: [...Object.keys(fields), "update_if_exists"] },
    ),
    outputSchema: contactOutput,
  }),
  defineProviderAction("sendblue", {
    name: "update_contact",
    operationType: "write",
    requiredScopes: [],
    description: "Update a Sendblue contact. Tags replace the full set; custom variables merge with existing values.",
    inputSchema: s.object(
      "Contact update input.",
      {
        number,
        ...fields,
        phone_number: phone("New phone number in E.164 format; number selects the existing contact."),
        company_name: s.string("Contact company name."),
        opt_out: s.boolean("Whether the contact is opted out of SMS."),
      },
      { optional: [...Object.keys(fields), "phone_number", "company_name", "opt_out"] },
    ),
    outputSchema: contactOutput,
  }),
  defineProviderAction("sendblue", {
    name: "delete_contact",
    operationType: "destructive",
    requiredScopes: [],
    description: "Delete a Sendblue contact by phone number.",
    inputSchema: s.requiredObject("Contact deletion input.", { number }),
    outputSchema: statusOutput,
  }),
  defineProviderAction("sendblue", {
    name: "bulk_create_contacts",
    operationType: "write",
    requiredScopes: [],
    description: "Create multiple Sendblue contacts and return successful contacts and any per-contact failures.",
    inputSchema: s.requiredObject("Bulk contact creation input.", {
      contacts: s.array(
        "Contacts to create.",
        s.object(
          "One contact to create.",
          {
            phone: number,
            firstName: fields.first_name,
            lastName: fields.last_name,
            company: s.string("Contact company name."),
            tags,
            customVariables: variables,
          },
          { optional: ["firstName", "lastName", "company", "tags", "customVariables"] },
        ),
        { minItems: 1 },
      ),
    }),
    outputSchema: s.looseObject("Bulk contact creation response; inspect failures even when the request succeeds.", {
      status,
      contacts: s.array("Successfully created contacts.", contact),
      numberOfContactsCreated: s.integer("Number of contacts created."),
      failures: s.array(
        "Per-contact creation failures when present.",
        s.looseObject("One contact creation failure.", {
          contact: s.looseObject("Submitted contact that failed."),
          error: s.string("Reason the contact failed."),
        }),
      ),
    }),
  }),
  defineProviderAction("sendblue", {
    name: "bulk_delete_contacts",
    operationType: "destructive",
    requiredScopes: [],
    description: "Delete multiple Sendblue contacts by phone number and return deletion counts.",
    inputSchema: s.requiredObject("Bulk contact deletion input.", {
      contact_ids: s.array("Phone numbers of contacts to delete, not internal IDs.", number, {
        minItems: 1,
      }),
    }),
    outputSchema: s.looseObject("Bulk contact deletion response.", {
      status,
      amount: s.integer("Upstream amount count."),
      total: s.integer("Total contacts processed."),
      successes: s.integer("Successful deletions."),
      failures: s.integer("Failed deletions."),
    }),
  }),
  defineProviderAction("sendblue", {
    name: "set_contact_opt_out",
    operationType: "write",
    requiredScopes: [],
    description: "Set a Sendblue contact's messaging opt-out preference, or opt the contact back in.",
    inputSchema: s.object(
      "Contact messaging preference input.",
      {
        number,
        opted_out: s.withDefault(
          s.boolean("True blocks outbound messages; false opts back in. Defaults to true."),
          true,
        ),
      },
      { optional: ["opted_out"] },
    ),
    outputSchema: s.looseObject("Contact messaging preference response.", {
      status,
      number: s.string("Normalized contact phone number."),
      opted_out: s.boolean("Current opt-out preference."),
    }),
  }),
];
