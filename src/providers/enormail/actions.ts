import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const page = s.optional(s.integer("Page number to retrieve.", { minimum: 1 }));
const listid = s.nonEmptyString("Enormail mailing list ID.");
const record = s.looseObject("Enormail resource with upstream fields preserved.", {});
const paginated = s.looseObject("One page of Enormail resources and pagination metadata.", {
  results: s.array("Resources on this page.", record),
  total_results: s.integer("Total number of matching resources."),
  page_size: s.integer("Number of resources per page."),
  number_of_pages: s.integer("Total number of pages."),
  current_page: s.integer("Current page number."),
});

export const enormailActions: readonly ActionDefinition[] = [
  defineProviderAction("enormail", {
    name: "get_account",
    operationType: "read",
    description: "Get the authenticated Enormail account profile.",
    inputSchema: s.requiredObject("Account query.", {}),
    outputSchema: s.looseObject("Enormail account profile.", {
      id: s.string("Account ID."),
      firstname: s.string("Account first name."),
      lastname: s.string("Account last name."),
      email: s.string("Account email address."),
      created_at: s.string("Account creation timestamp."),
      lastlogin_at: s.string("Last login timestamp."),
    }),
  }),
  defineProviderAction("enormail", {
    name: "list_senders",
    operationType: "read",
    description: "List allowed sender email addresses for the Enormail account.",
    inputSchema: s.requiredObject("Sender query.", {}),
    outputSchema: s.requiredObject("Allowed senders.", {
      senders: s.array("Allowed sender addresses.", s.string("Sender email address.")),
    }),
  }),
  defineProviderAction("enormail", {
    name: "list_lists",
    operationType: "read",
    description: "List one page of Enormail mailing lists.",
    inputSchema: s.requiredObject("Mailing list query.", { page }),
    outputSchema: s.requiredObject("Mailing list collection.", {
      lists: s.array("Mailing lists on this page.", record),
    }),
  }),
  defineProviderAction("enormail", {
    name: "get_list",
    operationType: "read",
    description: "Get an Enormail mailing list and its subscriber counts.",
    inputSchema: s.requiredObject("Mailing list identifier.", { listid }),
    outputSchema: s.looseObject("Mailing list details with upstream counts and timestamps.", {
      listid: s.string("Mailing list ID."),
      title: s.string("Mailing list title."),
    }),
  }),
  defineProviderAction("enormail", {
    name: "list_contacts",
    operationType: "read",
    description: "List one page of Enormail contacts in a mailing list by subscription state.",
    inputSchema: s.requiredObject("Contact list query.", {
      listid,
      state: s.stringEnum("Subscription state to retrieve.", ["active", "unconfirmed", "unsubscribed", "bounced"]),
      page,
    }),
    outputSchema: paginated,
  }),
  defineProviderAction("enormail", {
    name: "get_contact",
    operationType: "read",
    description: "Get an Enormail contact by mailing list and email address.",
    inputSchema: s.requiredObject("Contact lookup.", { listid, email: s.email("Contact email address.") }),
    outputSchema: s.looseObject("Contact profile with upstream custom fields preserved.", {
      listid: s.string("Mailing list ID."),
      email: s.string("Contact email address."),
      state: s.string("Subscription state."),
    }),
  }),
  defineProviderAction("enormail", {
    name: "list_mailings",
    operationType: "read",
    description: "List one page of sent, draft, or scheduled Enormail mailings.",
    inputSchema: s.requiredObject("Mailing query.", {
      state: s.stringEnum("Mailing state to retrieve.", ["sent", "drafts", "scheduled"]),
      page,
    }),
    outputSchema: paginated,
  }),
  defineProviderAction("enormail", {
    name: "get_mailing_stats",
    operationType: "read",
    description: "Get delivery, open, click, bounce, and unsubscribe statistics for a sent Enormail mailing.",
    inputSchema: s.requiredObject("Sent mailing identifier.", {
      mailingid: s.nonEmptyString("Enormail mailing ID."),
    }),
    outputSchema: s.looseObject("Sent mailing metadata and statistics.", {
      mailingid: s.string("Mailing ID."),
      statistics: s.looseObject("Delivery and engagement counters and ratios.", {}),
    }),
  }),
];
