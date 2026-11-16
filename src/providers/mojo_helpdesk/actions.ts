import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "mojo_helpdesk";

const ticketId = s.positiveInteger("The Mojo Helpdesk ticket ID.");
const page = s.positiveInteger("The one-based page number.", { default: 1 });
const perPage = s.positiveInteger("The number of results per page.");
const sortOrder = s.stringEnum("The result sort direction.", ["asc", "desc"]);
const ticketSortField = s.stringEnum("The ticket field used to sort the results.", [
  "id",
  "title",
  "description",
  "user_id",
  "assigned_to_id",
  "status_id",
  "ticket_form_id",
  "priority_id",
  "ticket_queue_id",
  "company_id",
  "rating",
  "rated_on",
  "created_on",
  "updated_on",
  "status_changed_on",
  "solved_on",
  "assigned_on",
  "ticket_type_id",
  "due_on",
  "scheduled_on",
]);
const priorityId = {
  type: "integer",
  enum: [10, 20, 30, 40],
  description: "The ticket priority ID: 10 emergency, 20 urgent, 30 normal, or 40 low.",
};
const statusId = {
  type: "integer",
  enum: [10, 20, 30, 40, 50, 60],
  description:
    "The ticket status ID: 10 new, 20 in progress, 30 on hold, 40 information requested, 50 solved, or 60 closed.",
};
const ticket = s.looseObject("A Mojo Helpdesk ticket, including provider-defined related data.");
const comment = s.looseObject("A Mojo Helpdesk ticket comment.");
const ticketQueue = s.looseObject("A Mojo Helpdesk ticket queue.");
const tag = s.looseObject("A Mojo Helpdesk ticket tag.");

const ticketFields = {
  title: s.nonEmptyString("The ticket title."),
  description: s.string("The ticket description or body."),
  ticketQueueId: s.positiveInteger("The ID of the ticket queue."),
  priorityId,
  statusId,
  ticketTypeId: s.positiveInteger("The ID of the ticket type."),
  assignedToId: s.positiveInteger("The ID of the assigned user."),
  ticketFormId: s.positiveInteger("The ID of the ticket form."),
  userId: s.positiveInteger("The ID of the user who created the ticket."),
  userEmail: s.email("The email address of a new ticket requester."),
  cc: s.string("A comma-separated list of email addresses copied on ticket notifications."),
  assetTag: s.string("The asset tag associated with the ticket."),
  assetId: s.positiveInteger("The ID of the asset associated with the ticket."),
  dueOn: s.dateTime("The ticket due date and time."),
  scheduledOn: s.dateTime("The ticket scheduled date and time."),
  resolutionId: s.positiveInteger("The ID of the ticket resolution."),
  customFields: s.record(
    "Custom field values keyed by their system key without the custom_field_ prefix.",
    s.string("A custom field value."),
  ),
};

const ticketOutput = s.object("A Mojo Helpdesk ticket response.", { ticket });
const ticketsOutput = s.object("A Mojo Helpdesk ticket list response.", {
  tickets: s.array("The returned tickets.", ticket),
});

export const mojoHelpdeskActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "list_tickets",
    operationType: "read",
    description: "List Mojo Helpdesk tickets with pagination and sorting.",
    inputSchema: s.object(
      "Parameters for listing Mojo Helpdesk tickets.",
      { sortBy: ticketSortField, sortOrder, page, perPage },
      { optional: ["sortBy", "sortOrder", "page", "perPage"] },
    ),
    outputSchema: ticketsOutput,
  }),
  defineProviderAction(service, {
    name: "search_tickets",
    operationType: "read",
    description: "Search Mojo Helpdesk tickets with the advanced-search query syntax.",
    inputSchema: s.object(
      "Parameters for searching Mojo Helpdesk tickets.",
      {
        query: s.string("The advanced-search query; omit it to return all tickets."),
        sortField: s.stringEnum("The date field used to sort search results.", [
          "created_on",
          "due_on",
          "rated_on",
          "scheduled_on",
          "solved_on",
          "updated_on",
        ]),
        reverse: s.boolean("Whether to sort in descending order."),
        page,
        perPage: s.integer("The number of results per page.", { minimum: 10 }),
      },
      { optional: ["query", "sortField", "reverse", "page", "perPage"] },
    ),
    outputSchema: ticketsOutput,
  }),
  defineProviderAction(service, {
    name: "get_ticket",
    operationType: "read",
    description: "Get one Mojo Helpdesk ticket and its related data.",
    inputSchema: s.object("Parameters for getting a Mojo Helpdesk ticket.", { ticketId }),
    outputSchema: ticketOutput,
  }),
  defineProviderAction(service, {
    name: "create_ticket",
    operationType: "write",
    description: "Create a Mojo Helpdesk ticket without file attachments.",
    inputSchema: s.object("Fields for creating a Mojo Helpdesk ticket.", ticketFields, {
      optional: Object.keys(ticketFields).filter((key) => key !== "title" && key !== "ticketQueueId"),
    }),
    outputSchema: ticketOutput,
  }),
  defineProviderAction(service, {
    name: "update_ticket",
    operationType: "destructive",
    description: "Partially update a Mojo Helpdesk ticket without replacing omitted fields.",
    inputSchema: s.object(
      "Fields for partially updating a Mojo Helpdesk ticket.",
      { ticketId, ...ticketFields },
      { optional: Object.keys(ticketFields) },
    ),
    outputSchema: ticketOutput,
  }),
  defineProviderAction(service, {
    name: "list_comments",
    operationType: "read",
    description: "List public comments on a Mojo Helpdesk ticket.",
    inputSchema: s.object(
      "Parameters for listing comments on a Mojo Helpdesk ticket.",
      { ticketId, page, perPage },
      { optional: ["page", "perPage"] },
    ),
    outputSchema: s.object("A Mojo Helpdesk comment list response.", {
      comments: s.array("The returned ticket comments.", comment),
    }),
  }),
  defineProviderAction(service, {
    name: "create_comment",
    operationType: "write",
    description: "Add a public comment to a Mojo Helpdesk ticket.",
    inputSchema: s.object(
      "Fields for creating a Mojo Helpdesk ticket comment.",
      {
        ticketId,
        body: s.nonEmptyString("The comment body."),
        timeSpent: s.nonNegativeInteger("The time spent on the comment in minutes."),
        cc: s.string("A comma-separated list of email addresses copied on the comment."),
        userId: s.positiveInteger("The account user ID to attribute the comment to."),
      },
      { optional: ["timeSpent", "cc", "userId"] },
    ),
    outputSchema: s.object("A Mojo Helpdesk comment response.", { comment }),
  }),
  defineProviderAction(service, {
    name: "list_ticket_queues",
    operationType: "read",
    description: "List Mojo Helpdesk ticket queues available to the connected agent.",
    inputSchema: s.object(
      "Parameters for listing Mojo Helpdesk ticket queues.",
      { page, perPage },
      { optional: ["page", "perPage"] },
    ),
    outputSchema: s.object("A Mojo Helpdesk ticket queue list response.", {
      ticketQueues: s.array("The returned ticket queues.", ticketQueue),
    }),
  }),
  defineProviderAction(service, {
    name: "list_tags",
    operationType: "read",
    description: "List Mojo Helpdesk ticket tags with optional sorting.",
    inputSchema: s.object(
      "Parameters for listing Mojo Helpdesk ticket tags.",
      { sortBy: s.string("The tag column used to sort results."), sortOrder },
      { optional: ["sortBy", "sortOrder"] },
    ),
    outputSchema: s.object("A Mojo Helpdesk tag list response.", {
      tags: s.array("The returned ticket tags.", tag),
    }),
  }),
];
