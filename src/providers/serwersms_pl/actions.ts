import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "serwersms_pl";
function stringOrArray(description: string, maxItems?: number) {
  return s.anyOf(description, [
    s.nonEmptyString("A single value."),
    s.array("Multiple values.", s.nonEmptyString("One value."), { minItems: 1, maxItems }),
  ]);
}
const messageItems = s.array(
  "Message records, including per-recipient status and errors.",
  s.looseObject("A message record returned by SerwerSMS.pl."),
);
const successOutput = s.looseObject("The operation result.", {
  success: s.boolean("Whether the operation succeeded."),
});
export const serwersmsPlActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "send_sms",
    description:
      "Send or schedule SMS messages with the same content. Omit sender for ECO+ or use an approved sender for FULL SMS. A queued result does not mean delivery.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "SMS content, recipients, and delivery options.",
        {
          text: s.nonEmptyString("The message content; for vcard, supply newline-separated vCard text."),
          phone: stringOrArray(
            "Recipient phone numbers, preferably in international +country format. Use batches of 50–200 numbers.",
            100000,
          ),
          group_id: stringOrArray("Recipient group IDs in the Customer Panel."),
          contact_id: stringOrArray("Recipient contact IDs in the Customer Panel."),
          sender: s.string(
            "An approved sender name or number for FULL SMS; empty or omitted selects ECO+. Use 2waySMS for a reply-capable random number.",
          ),
          flash: s.boolean("Send as a flash SMS if enabled on the account."),
          test: s.boolean("Simulate submission without sending messages."),
          wap_push: s.string("The WAP Push URL."),
          utf: s.boolean("Enable Unicode for FULL SMS; requires sender and reduces a single part to 70 characters."),
          details: s.boolean({
            description: "Include individual message IDs and statuses; defaults to true.",
            default: true,
          }),
          vcard: s.boolean("Interpret the message text as a vCard."),
          speed: s.boolean("Use the highest-quality independent channel, which may incur an extra charge."),
          date: s.nonEmptyString("Scheduled dispatch time in provider format, for example 2026-12-01 12:25:55."),
          unique_id: s.anyOf("Caller-assigned message IDs; provide one per recipient, with unique values.", [
            s.string("One caller-assigned ID.", {
              minLength: 3,
              maxLength: 50,
              pattern: "^[a-zA-Z0-9]+$",
            }),
            s.array(
              "Caller-assigned IDs in recipient order.",
              s.string("One caller-assigned ID.", {
                minLength: 3,
                maxLength: 50,
                pattern: "^[a-zA-Z0-9]+$",
              }),
              { minItems: 1, uniqueItems: true },
            ),
          ]),
          dlr_url: s.nonEmptyString(
            "Delivery callback URL template, passed to SerwerSMS.pl. Supply the unencoded URL; form encoding is handled automatically. Supported placeholders include #SMSID#, #STAN#, #DATA#, and #PRZYCZYNA#.",
          ),
        },
        {
          required: ["text"],
        },
      ),
      anyOf: [{ required: ["phone"] }, { required: ["group_id"] }, { required: ["contact_id"] }],
    },
    outputSchema: s.object(
      "SMS submission result, including any partial failures.",
      {
        success: s.boolean("Whether the submission was processed."),
        queued: s.integer("Number of queued messages."),
        unsent: s.integer("Number of messages not sent."),
        items: messageItems,
      },
      {
        optional: ["items"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction(service, {
    name: "get_delivery_reports",
    description:
      "Query SMS delivery reports by message IDs or filters. Reports are available for about 14 days and updated for up to 72 hours; prefer batches of 50–200 IDs.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Delivery report filters.",
      {
        id: stringOrArray("Provider message IDs; at most 500 per request.", 500),
        unique_id: stringOrArray("Caller-assigned message IDs.", 500),
        phone: stringOrArray("Recipient phone numbers in international format."),
        date_from: s.nonEmptyString("Start of the queuing-time interval, for example 2026-12-01 00:00:00."),
        date_to: s.nonEmptyString("End of the queuing-time interval, for example 2026-12-01 23:59:59."),
        status: s.stringEnum("Filter by dispatch status.", [
          "delivered",
          "undelivered",
          "pending",
          "sent",
          "unsent",
          "in_progress",
          "saved",
        ]),
        show_contact: s.boolean("Include contact details when the recipient exists in the contact database."),
      },
      {
        required: [],
      },
    ),
    outputSchema: s.looseObject("Delivery report result; archived messages may produce an empty list.", {
      items: messageItems,
    }),
  }),
  defineProviderAction(service, {
    name: "cancel_scheduled_sms",
    description: "Cancel scheduled SMS messages by provider or caller-assigned IDs before dispatch.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Scheduled messages to cancel.",
        {
          id: stringOrArray("Provider message IDs."),
          unique_id: stringOrArray("Caller-assigned message IDs."),
        },
        {
          required: [],
        },
      ),
      anyOf: [{ required: ["id"] }, { required: ["unique_id"] }],
    },
    outputSchema: s.looseObject("Cancellation result.", {
      success: s.boolean("Whether the operation was processed."),
      correct: s.integer("Number of successfully cancelled messages."),
      failed: s.integer("Number of messages that could not be cancelled."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_account_limits",
    description: "Get available message quotas and optionally the account type.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Account quota options.",
      {
        show_type: s.boolean({
          description: "Include the account type; defaults to true.",
          default: true,
        }),
      },
      {
        required: [],
      },
    ),
    outputSchema: s.object(
      "Account quotas.",
      {
        account: s.looseObject("Account information, including prepaid or postpaid type."),
        items: s.array(
          "Available quotas by message or lookup type.",
          s.looseObject("A quota record; value may be a numeric string, no_limit, or not_available."),
        ),
      },
      {
        optional: ["account"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction(service, {
    name: "list_senders",
    description: "List sender names and their authorization status, optionally including predefined senders.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Sender list options.",
      {
        predefined: s.boolean("Include predefined sender names ready to use."),
        type: s.stringEnum("Filter by sender type.", ["ndi", "mms"]),
        sort: s.stringEnum("Sort by sender name.", ["name"]),
        order: s.stringEnum("Sort direction.", ["asc", "desc"]),
      },
      {
        required: [],
      },
    ),
    outputSchema: s.looseObject("Sender list result.", {
      items: s.array(
        "Sender names and approval states.",
        s.looseObject("A sender record with name, agreement, status, and optional note or networks."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "add_sender",
    description:
      "Submit a sender name for authorization. Wait until list_senders reports authorized before using it to send SMS.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Sender name to submit.",
      {
        name: s.nonEmptyString("The alphanumeric sender name, at most 11 characters.", {
          maxLength: 11,
        }),
      },
      {
        optional: [],
      },
    ),
    outputSchema: successOutput,
  }),
];
