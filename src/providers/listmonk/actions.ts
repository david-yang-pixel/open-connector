import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "listmonk";

const sendsEmailWarning =
  "SENDS EMAIL TO ALL SUBSCRIBERS OF THE TARGET LISTS - confirm with the user before executing.";

const emptyInputSchema = s.actionInput({}, [], "No input is required for this action.");

const subscriberIdSchema = s.positiveInteger("The numeric subscriber ID.");
const listIdSchema = s.positiveInteger("The numeric list ID.");
const campaignIdSchema = s.positiveInteger("The numeric campaign ID.");
const templateIdSchema = s.positiveInteger("The numeric template ID.");

function listIdsSchema(description: string): JsonSchema {
  return s.array(description, s.positiveInteger("One list ID."));
}

const pageSchema = s.positiveInteger("The page number, starting at 1.");
const perPageSchema = s.positiveInteger("Results per page. Defaults to the listmonk default (20).");
const allSchema = s.boolean("Return every matching record in one page (per_page=all). Overrides page and perPage.");
const orderSchema = s.stringEnum("The sort direction.", ["ASC", "DESC"]);
const orderBySchema = s.stringEnum("The field to sort by.", ["name", "status", "created_at", "updated_at"]);

const attribsSchema = s.unknownObject(
  'Arbitrary JSON attributes stored on the subscriber and available in templates, for example {"city": "Bengaluru"}.',
);
const subscriberSchema = s.looseObject(
  "A listmonk subscriber with id, uuid, email, name, attribs, status, lists (with subscription_status), created_at, and updated_at.",
);
const listSchema = s.looseObject(
  "A listmonk list with id, uuid, name, type, optin, status, tags, description, subscriber_count, and timestamps.",
);
const templateSchema = s.looseObject(
  "A listmonk template with id, name, type, subject, body, is_default, and timestamps.",
);
const campaignSchema = s.looseObject(
  "A listmonk campaign with id, uuid, name, subject, from_email, status, type, content_type, body, send_at, lists, tags, template_id, and the sent/to_send/views/clicks/bounces counters.",
);

const sendAtSchema = s.string(
  "When to send, as an ISO-8601 timestamp WITH a timezone offset, for example 2026-10-01T09:00:00+02:00 or 2026-10-01T07:00:00Z. Must be in the future. listmonk stores the absolute instant; the dashboard displays it in the listmonk server's timezone, so always state the offset explicitly.",
  { pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?(Z|[+-]\\d{2}:\\d{2})$" },
);

const contentTypeSchema = s.stringEnum("The campaign body format.", [
  "richtext",
  "html",
  "markdown",
  "plain",
  "visual",
]);

function paginatedOutput(key: string, description: string, item: JsonSchema): JsonSchema {
  return s.actionOutput(
    {
      [key]: s.array(`The ${key} on this page.`, item),
      total: s.integer("The total number of matching records."),
      page: s.integer("The current page number."),
      perPage: s.integer("The page size used by listmonk (0 when all results were requested)."),
    },
    description,
  );
}

function campaignStatusOutput(description: string): JsonSchema {
  return s.actionOutput({ campaign: campaignSchema }, description);
}

export const listmonkActions: ActionDefinition[] = [
  // Subscribers
  defineProviderAction(service, {
    name: "list_subscribers",
    operationType: "read",
    description:
      "Query listmonk subscribers, optionally filtered by list membership and an SQL expression over the subscribers table, with paging.",
    providerPermissions: ["subscribers:get_all"],
    inputSchema: s.actionInput(
      {
        query: s.string(
          "An SQL WHERE expression over the subscribers table, for example subscribers.email LIKE '%@example.com' or subscribers.attribs->>'city' = 'Chicago'. The API user's role needs the subscribers:sql_query permission whenever this is set.",
        ),
        listIds: listIdsSchema("Only subscribers in any of these list IDs."),
        subscriptionStatus: s.stringEnum("Filter by subscription status on the given listIds.", [
          "unconfirmed",
          "confirmed",
          "unsubscribed",
        ]),
        orderBy: orderBySchema,
        order: orderSchema,
        page: pageSchema,
        perPage: perPageSchema,
        all: allSchema,
      },
      [],
      "Input parameters for querying subscribers.",
    ),
    outputSchema: paginatedOutput("subscribers", "The matching listmonk subscribers.", subscriberSchema),
  }),
  defineProviderAction(service, {
    name: "get_subscriber",
    operationType: "read",
    description: "Fetch one listmonk subscriber with attributes and list subscriptions.",
    providerPermissions: ["subscribers:get_all"],
    inputSchema: s.actionInput(
      { subscriberId: subscriberIdSchema },
      ["subscriberId"],
      "Input parameters for fetching one subscriber.",
    ),
    outputSchema: s.actionOutput({ subscriber: subscriberSchema }, "The requested subscriber."),
  }),
  defineProviderAction(service, {
    name: "create_subscriber",
    operationType: "write",
    description:
      "Create a listmonk subscriber and optionally subscribe it to lists. Double opt-in lists send a confirmation email unless preconfirmSubscriptions is true.",
    providerPermissions: ["subscribers:manage"],
    inputSchema: s.actionInput(
      {
        email: s.email("The subscriber email address."),
        name: s.nonEmptyString("The subscriber name."),
        status: s.stringEnum("The subscriber status. Defaults to enabled.", ["enabled", "blocklisted"]),
        listIds: listIdsSchema("List IDs to subscribe the subscriber to."),
        attribs: attribsSchema,
        preconfirmSubscriptions: s.boolean(
          "Mark the subscriptions as confirmed so no opt-in email is sent for double opt-in lists.",
        ),
      },
      ["email", "name"],
      "Input parameters for creating one subscriber.",
    ),
    outputSchema: s.actionOutput({ subscriber: subscriberSchema }, "The created subscriber."),
  }),
  defineProviderAction(service, {
    name: "update_subscriber",
    operationType: "write",
    description:
      "Update one listmonk subscriber. Only the provided fields change: the current subscriber is read first and merged, so omitted fields and list subscriptions are preserved. Passing listIds replaces the subscriber's list subscriptions; attribs replaces all attributes. Unless preconfirmSubscriptions is true, an instance with opt-in confirmations enabled emails the subscriber again for every double opt-in list that is still unconfirmed.",
    providerPermissions: ["subscribers:manage"],
    inputSchema: s.actionInput(
      {
        subscriberId: subscriberIdSchema,
        email: s.email("The new email address."),
        name: s.nonEmptyString("The new name."),
        status: s.stringEnum("The new subscriber status.", ["enabled", "disabled", "blocklisted"]),
        listIds: listIdsSchema("The complete set of list IDs the subscriber should belong to."),
        attribs: attribsSchema,
        preconfirmSubscriptions: s.boolean("Mark newly added subscriptions as confirmed without an opt-in email."),
      },
      ["subscriberId"],
      "Input parameters for updating one subscriber.",
    ),
    outputSchema: s.actionOutput({ subscriber: subscriberSchema }, "The updated subscriber."),
  }),
  defineProviderAction(service, {
    name: "delete_subscriber",
    operationType: "destructive",
    description: "Permanently delete one listmonk subscriber and its subscriptions.",
    providerPermissions: ["subscribers:manage"],
    inputSchema: s.actionInput(
      { subscriberId: subscriberIdSchema },
      ["subscriberId"],
      "Input parameters for deleting one subscriber.",
    ),
    outputSchema: s.actionOutput({ deleted: s.boolean("Whether the subscriber was deleted.") }, "The deletion result."),
  }),
  defineProviderAction(service, {
    name: "manage_subscriber_lists",
    operationType: "write",
    description:
      "Add subscribers to lists, remove them from lists, or mark their subscriptions as unsubscribed. status is required when action is add.",
    providerPermissions: ["subscribers:manage"],
    inputSchema: s.actionInput(
      {
        subscriberIds: s.array("The subscriber IDs to modify.", s.positiveInteger("One subscriber ID."), {
          minItems: 1,
        }),
        action: s.stringEnum("The membership change to apply.", ["add", "remove", "unsubscribe"]),
        targetListIds: s.array("The list IDs to modify.", s.positiveInteger("One list ID."), { minItems: 1 }),
        status: s.stringEnum("The subscription status to set when action is add.", [
          "confirmed",
          "unconfirmed",
          "unsubscribed",
        ]),
      },
      ["subscriberIds", "action", "targetListIds"],
      "Input parameters for changing list memberships.",
    ),
    outputSchema: s.actionOutput({ updated: s.boolean("Whether listmonk applied the change.") }, "The update result."),
  }),
  defineProviderAction(service, {
    name: "blocklist_subscribers",
    operationType: "destructive",
    description:
      "Blocklist one or more listmonk subscribers. Blocklisted subscribers are unsubscribed from every list and never receive campaigns.",
    providerPermissions: ["subscribers:manage"],
    inputSchema: s.actionInput(
      {
        subscriberIds: s.array("The subscriber IDs to blocklist.", s.positiveInteger("One subscriber ID."), {
          minItems: 1,
        }),
      },
      ["subscriberIds"],
      "Input parameters for blocklisting subscribers.",
    ),
    outputSchema: s.actionOutput(
      { blocklisted: s.boolean("Whether the subscribers were blocklisted.") },
      "The blocklist result.",
    ),
  }),

  // Lists
  defineProviderAction(service, {
    name: "list_lists",
    operationType: "read",
    description: "List listmonk mailing lists with subscriber counts, optionally filtered by name, status, or tags.",
    providerPermissions: ["lists:get_all"],
    inputSchema: s.actionInput(
      {
        query: s.string("Search lists by name."),
        status: s.stringEnum("Only lists with this status.", ["active", "archived"]),
        tags: s.stringArray("Only lists carrying any of these tags."),
        orderBy: orderBySchema,
        order: orderSchema,
        page: pageSchema,
        perPage: perPageSchema,
        all: allSchema,
      },
      [],
      "Input parameters for listing lists.",
    ),
    outputSchema: paginatedOutput("lists", "The matching listmonk lists.", listSchema),
  }),
  defineProviderAction(service, {
    name: "get_list",
    operationType: "read",
    description: "Fetch one listmonk list.",
    providerPermissions: ["lists:get_all"],
    inputSchema: s.actionInput({ listId: listIdSchema }, ["listId"], "Input parameters for fetching one list."),
    outputSchema: s.actionOutput({ list: listSchema }, "The requested list."),
  }),
  defineProviderAction(service, {
    name: "create_list",
    operationType: "write",
    description: "Create a listmonk mailing list.",
    providerPermissions: ["lists:manage_all"],
    inputSchema: s.actionInput(
      {
        name: s.nonEmptyString("The list name."),
        type: s.stringEnum("public lists appear on the public subscription form; private lists do not.", [
          "private",
          "public",
        ]),
        optin: s.stringEnum("single subscribes immediately; double sends a confirmation email.", ["single", "double"]),
        status: s.stringEnum("The list status. Defaults to active.", ["active", "archived"]),
        tags: s.stringArray("Tags for the list."),
        description: s.string("A description of the list."),
      },
      ["name", "type", "optin"],
      "Input parameters for creating one list.",
    ),
    outputSchema: s.actionOutput({ list: listSchema }, "The created list."),
  }),
  defineProviderAction(service, {
    name: "update_list",
    operationType: "write",
    description:
      "Update one listmonk list. Only the provided fields change; the current name and tags are preserved when omitted.",
    providerPermissions: ["lists:manage_all"],
    inputSchema: s.actionInput(
      {
        listId: listIdSchema,
        name: s.nonEmptyString("The new list name."),
        type: s.stringEnum("The list type.", ["private", "public"]),
        optin: s.stringEnum("The opt-in type.", ["single", "double"]),
        status: s.stringEnum("The list status.", ["active", "archived"]),
        tags: s.stringArray("The complete set of tags; replaces existing tags."),
        description: s.string("The new description."),
      },
      ["listId"],
      "Input parameters for updating one list.",
    ),
    outputSchema: s.actionOutput({ list: listSchema }, "The updated list."),
  }),

  // Templates
  defineProviderAction(service, {
    name: "list_templates",
    operationType: "read",
    description:
      "List listmonk templates (campaign, visual campaign, and transactional) to pick a templateId for campaigns.",
    providerPermissions: ["templates:get"],
    inputSchema: s.actionInput(
      { noBody: s.boolean("Omit template bodies from the response. Defaults to true.") },
      [],
      "Input parameters for listing templates.",
    ),
    outputSchema: s.actionOutput(
      { templates: s.array("The listmonk templates.", templateSchema) },
      "The listmonk templates.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_template",
    operationType: "read",
    description: "Fetch one listmonk template including its body.",
    providerPermissions: ["templates:get"],
    inputSchema: s.actionInput(
      { templateId: templateIdSchema },
      ["templateId"],
      "Input parameters for fetching one template.",
    ),
    outputSchema: s.actionOutput({ template: templateSchema }, "The requested template."),
  }),

  // Campaigns
  defineProviderAction(service, {
    name: "list_campaigns",
    operationType: "read",
    description:
      "List listmonk campaigns, optionally filtered by a name/subject search, statuses, or tags, with paging.",
    providerPermissions: ["campaigns:get_all"],
    inputSchema: s.actionInput(
      {
        query: s.string("Full-text and substring search over campaign name and subject."),
        statuses: s.array(
          "Only campaigns in any of these statuses.",
          s.stringEnum("One campaign status.", ["draft", "scheduled", "running", "paused", "finished", "cancelled"]),
        ),
        tags: s.stringArray("Only campaigns carrying any of these tags."),
        orderBy: orderBySchema,
        order: orderSchema,
        page: pageSchema,
        perPage: perPageSchema,
        all: allSchema,
        noBody: s.boolean("Omit campaign bodies from the response. Defaults to true."),
      },
      [],
      "Input parameters for listing campaigns.",
    ),
    outputSchema: paginatedOutput("campaigns", "The matching listmonk campaigns.", campaignSchema),
  }),
  defineProviderAction(service, {
    name: "get_campaign",
    operationType: "read",
    description: "Fetch one listmonk campaign with its status, schedule, target lists, body, and delivery counters.",
    providerPermissions: ["campaigns:get_all"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema, noBody: s.boolean("Omit the campaign body from the response.") },
      ["campaignId"],
      "Input parameters for fetching one campaign.",
    ),
    outputSchema: s.actionOutput({ campaign: campaignSchema }, "The requested campaign."),
  }),
  defineProviderAction(service, {
    name: "create_campaign",
    operationType: "write",
    description:
      "Create a listmonk campaign as a draft. Nothing is sent: use send_campaign_test to preview it by email, then schedule_campaign or start_campaign to send it. Setting sendAt here only stores the time; the campaign is not scheduled until schedule_campaign runs.",
    providerPermissions: ["campaigns:manage_all"],
    inputSchema: s.actionInput(
      {
        name: s.nonEmptyString("The internal campaign name."),
        subject: s.nonEmptyString("The email subject. May contain listmonk template expressions."),
        listIds: s.array("The list IDs to send the campaign to.", s.positiveInteger("One list ID."), { minItems: 1 }),
        fromEmail: s.string(
          'The From header, for example "Chicago Aggies <news@example.org>". Defaults to the instance setting.',
        ),
        contentType: contentTypeSchema,
        body: s.string("The campaign body in the chosen contentType."),
        altbody: s.string("An optional plain-text alternative body for HTML and richtext campaigns."),
        templateId: s.positiveInteger("The campaign template ID. Defaults to the instance default template."),
        tags: s.stringArray("Tags for the campaign."),
        sendAt: sendAtSchema,
        messenger: s.string("The messenger to send through. Defaults to email."),
        headers: s.array(
          "Extra SMTP headers, each an object with one header name and value.",
          s.record("One header.", s.string("The header value.")),
        ),
      },
      ["name", "subject", "listIds"],
      "Input parameters for creating one campaign.",
    ),
    outputSchema: s.actionOutput({ campaign: campaignSchema }, "The created draft campaign."),
  }),
  defineProviderAction(service, {
    name: "update_campaign",
    operationType: "write",
    description:
      "Update a draft, scheduled, or paused listmonk campaign. Only the provided fields change; target lists and attachments are preserved unless listIds is given. Pass sendAt null to clear a stored send time; listmonk rejects every update while the stored send time is in the past.",
    providerPermissions: ["campaigns:manage_all"],
    inputSchema: s.actionInput(
      {
        campaignId: campaignIdSchema,
        name: s.nonEmptyString("The internal campaign name."),
        subject: s.nonEmptyString("The email subject."),
        listIds: s.array("The complete set of target list IDs.", s.positiveInteger("One list ID."), { minItems: 1 }),
        fromEmail: s.string("The From header."),
        contentType: contentTypeSchema,
        body: s.string("The campaign body."),
        altbody: s.string("The plain-text alternative body."),
        templateId: s.positiveInteger("The campaign template ID."),
        tags: s.stringArray("The complete set of tags; replaces existing tags."),
        sendAt: s.describe(
          s.nullable(sendAtSchema),
          "A new send time as an ISO-8601 timestamp with a timezone offset, or null to clear the stored send time.",
        ),
      },
      ["campaignId"],
      "Input parameters for updating one campaign.",
    ),
    outputSchema: s.actionOutput({ campaign: campaignSchema }, "The updated campaign."),
  }),
  defineProviderAction(service, {
    name: "delete_campaign",
    operationType: "destructive",
    description: "Permanently delete one listmonk campaign.",
    providerPermissions: ["campaigns:manage_all"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for deleting one campaign.",
    ),
    outputSchema: s.actionOutput({ deleted: s.boolean("Whether the campaign was deleted.") }, "The deletion result."),
  }),
  defineProviderAction(service, {
    name: "get_campaign_preview",
    operationType: "read",
    description:
      "Render the campaign body inside its template and return the HTML preview, exactly as recipients would see it.",
    providerPermissions: ["campaigns:get_all"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for previewing one campaign.",
    ),
    outputSchema: s.actionOutput({ html: s.string("The rendered campaign HTML.") }, "The campaign preview."),
  }),
  defineProviderAction(service, {
    name: "send_campaign_test",
    operationType: "write",
    description:
      "Send the campaign as it is currently saved to specific test addresses only (not to the lists). Each address must already exist as a subscriber in listmonk.",
    providerPermissions: ["campaigns:manage_all"],
    inputSchema: s.actionInput(
      {
        campaignId: campaignIdSchema,
        emails: s.array("The subscriber email addresses to send the test to.", s.email("One subscriber email."), {
          minItems: 1,
        }),
      },
      ["campaignId", "emails"],
      "Input parameters for sending one test campaign.",
    ),
    outputSchema: s.actionOutput({ sent: s.boolean("Whether listmonk queued the test messages.") }, "The test result."),
  }),
  defineProviderAction(service, {
    name: "schedule_campaign",
    operationType: "write",
    description: `Schedule a draft or paused campaign to be sent automatically at sendAt: stores sendAt on the campaign, then changes its status to scheduled. A campaign that is already scheduled is simply moved to the new time. ${sendsEmailWarning}`,
    providerPermissions: ["campaigns:manage_all", "campaigns:send"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema, sendAt: sendAtSchema },
      ["campaignId", "sendAt"],
      "Input parameters for scheduling one campaign.",
    ),
    outputSchema: campaignStatusOutput("The scheduled campaign."),
  }),
  defineProviderAction(service, {
    name: "unschedule_campaign",
    operationType: "write",
    description:
      "Unschedule a scheduled campaign by moving it back to draft, so it is not sent at its sendAt. The stored sendAt is kept; only scheduled campaigns can be unscheduled.",
    providerPermissions: ["campaigns:send"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for unscheduling one campaign.",
    ),
    outputSchema: campaignStatusOutput("The campaign, now a draft."),
  }),
  defineProviderAction(service, {
    name: "start_campaign",
    operationType: "write",
    description: `Start sending a draft or paused campaign immediately (status running); a paused campaign resumes where it stopped. ${sendsEmailWarning}`,
    providerPermissions: ["campaigns:send"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for starting one campaign.",
    ),
    outputSchema: campaignStatusOutput("The running campaign."),
  }),
  defineProviderAction(service, {
    name: "pause_campaign",
    operationType: "write",
    description:
      "Pause a running campaign. It can be resumed later with start_campaign. Only running campaigns can be paused.",
    providerPermissions: ["campaigns:send"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for pausing one campaign.",
    ),
    outputSchema: campaignStatusOutput("The paused campaign."),
  }),
  defineProviderAction(service, {
    name: "cancel_campaign",
    operationType: "destructive",
    description: "Cancel a running or paused campaign permanently. A cancelled campaign cannot be resumed.",
    providerPermissions: ["campaigns:send"],
    inputSchema: s.actionInput(
      { campaignId: campaignIdSchema },
      ["campaignId"],
      "Input parameters for cancelling one campaign.",
    ),
    outputSchema: campaignStatusOutput("The cancelled campaign."),
  }),
  defineProviderAction(service, {
    name: "get_running_campaign_stats",
    operationType: "read",
    description:
      "Fetch live delivery stats (sent, to_send, rate, started_at) for currently running campaigns, optionally narrowed to specific campaign IDs.",
    providerPermissions: ["campaigns:get_all"],
    inputSchema: s.actionInput(
      { campaignIds: s.array("Only return stats for these campaign IDs.", s.positiveInteger("One campaign ID.")) },
      [],
      "Input parameters for fetching running campaign stats.",
    ),
    outputSchema: s.actionOutput(
      { stats: s.array("One entry per running campaign.", s.looseObject("Stats for one running campaign.")) },
      "The running campaign stats.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_campaign_analytics",
    operationType: "read",
    description:
      "Fetch campaign analytics over a date range: daily view, click, or bounce counts, or per-link click counts (type links).",
    providerPermissions: ["campaigns:get_analytics"],
    inputSchema: s.actionInput(
      {
        campaignIds: s.array("The campaign IDs to report on.", s.positiveInteger("One campaign ID."), { minItems: 1 }),
        type: s.stringEnum("The analytics type.", ["views", "clicks", "bounces", "links"]),
        from: s.string("The range start, as YYYY-MM-DD or an ISO-8601 timestamp."),
        to: s.string("The range end, as YYYY-MM-DD or an ISO-8601 timestamp."),
      },
      ["campaignIds", "type", "from", "to"],
      "Input parameters for fetching campaign analytics.",
    ),
    outputSchema: s.actionOutput(
      {
        type: s.string("The analytics type that was requested."),
        results: s.array("The analytics rows returned by listmonk.", s.looseObject("One analytics row.")),
      },
      "The campaign analytics.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_profile",
    operationType: "read",
    description: "Fetch the listmonk user profile of the connected API user, including its role and permissions.",
    inputSchema: emptyInputSchema,
    outputSchema: s.actionOutput({ user: s.looseObject("The listmonk user profile.") }, "The API user profile."),
  }),
];
