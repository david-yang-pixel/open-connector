import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const messageId = s.integer("The message ID returned by a send or schedule request.");
const deliveryProperties = {
  whatsapp_client: s.integer(
    "The WhatsApp Client ID from https://wbiztool.com/whatsapp-settings/. Required for scheduling; sending can omit it when exactly one number is connected.",
  ),
  phone: s.nonEmptyString(
    "The recipient phone number, preferably including its country calling code. Supply phone or group_name, never both.",
  ),
  group_name: s.nonEmptyString(
    "The name of a WhatsApp group the sending number belongs to. Supply group_name or phone, never both.",
  ),
  country_code: s.nonEmptyString(
    "The country calling code without +. Omit when phone already contains the full international number; ignored for groups.",
  ),
  msg_type: {
    ...s.integer("The message type: 0 for text (default), 1 for an image, or 2 for a file or document."),
    enum: [0, 1, 2],
  },
  msg: s.string("The message text, or optional caption for an image or file."),
  img_url: s.url(
    "The public HTTP or HTTPS image URL fetched by Wbiztool for msg_type 1. Scheduled URLs must remain available until sending.",
  ),
  file_url: s.url(
    "The public HTTP or HTTPS file URL fetched by Wbiztool for msg_type 2. Scheduled URLs must remain available until sending.",
  ),
  file_name: s.nonEmptyString(
    "The recipient-visible file name including its extension. Wbiztool lowercases and sanitizes it; unsupported extensions receive an added .pdf suffix.",
  ),
  webhook: s.url(
    "The URL notified by Wbiztool when the message is sent or fails. Cancelled and expired messages do not trigger this callback.",
  ),
};
function deliverySchema(scheduled: boolean): JsonSchema {
  const properties: Record<string, JsonSchema> = { ...deliveryProperties };
  if (scheduled) {
    properties.date = s.string("The scheduled date in dd/mm/yyyy format. A past time is sent immediately.", {
      pattern: "^[0-9]{2}/[0-9]{2}/[0-9]{4}$",
    });
    properties.time = s.string("The scheduled local time in 24-hour HH:MM format, without seconds.", {
      pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$",
    });
    properties.timezone = s.nonEmptyString(
      "The IANA timezone, such as Asia/Kolkata, or an official uppercase abbreviation. Defaults to IST (Asia/Kolkata). Unknown zones are rejected by the connector.",
    );
  } else {
    properties.msg = s.string("The message text (up to 3,000 characters), or optional caption for an image or file.", {
      maxLength: 3000,
    });
    properties.expire_after_seconds = s.integer(
      "Expire an unsent message after this many seconds. Expiration is checked at least 30 seconds after the deadline.",
    );
  }
  return {
    ...s.object(
      scheduled ? "The message and its delivery schedule." : "The message to queue for sending.",
      properties,
      {
        required: scheduled ? ["whatsapp_client", "date", "time"] : [],
      },
    ),
    oneOf: [
      { required: ["phone"], not: { required: ["group_name"] } },
      { required: ["group_name"], not: { required: ["phone"] } },
    ],
    allOf: [
      {
        if: { properties: { msg_type: { const: 1 } }, required: ["msg_type"] },
        then: { required: ["img_url"] },
      },
      {
        if: { properties: { msg_type: { const: 2 } }, required: ["msg_type"] },
        then: { required: ["file_url"] },
      },
      {
        if: { properties: { msg_type: { const: 0 } } },
        then: { required: ["msg"], properties: { msg: { minLength: 1 } } },
      },
    ],
  };
}
const queuedOutput = s.object(
  "The queued message. Acceptance does not confirm delivery.",
  {
    status: s.integer("The request success flag, 1 when accepted."),
    message: s.string("The upstream acceptance message."),
    msg_id: messageId,
  },
  {
    optional: [],
    additionalProperties: true,
  },
);
function sendAction(name: "send_message" | "schedule_message", scheduled: boolean) {
  return defineProviderAction("wbiztool", {
    name,
    description: scheduled
      ? "Schedule a WhatsApp text, image or file for one phone number or group."
      : "Queue a WhatsApp text, image or file for one phone number or group.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: deliverySchema(scheduled),
    outputSchema: queuedOutput,
    asyncLifecycle: {
      startActionId: `wbiztool.${name}`,
      statusActionId: "wbiztool.get_message_status",
      cancelActionId: "wbiztool.cancel_message",
    },
  });
}
export const wbiztoolActions: ActionDefinition[] = [
  sendAction("send_message", false),
  sendAction("schedule_message", true),
  defineProviderAction("wbiztool", {
    name: "get_message_status",
    description: "Read a WhatsApp message state. Sent means sent from the account, not delivered or read.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The message to query.",
      { msg_id: messageId },
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "The current message state returned by Wbiztool.",
      {
        status: s.integer("The message state: 0 Created, 1 Sent, 2 Failed, 3 Cancelled, or 4 Expired."),
        status_text: s.string("The message state name: Created, Sent, Failed, Cancelled, or Expired."),
        message: s.string("The upstream message state description."),
        error: s.nullable(s.string("The reason sending failed, or empty when no error was reported.")),
      },
      {
        optional: [],
        additionalProperties: true,
      },
    ),
    asyncLifecycle: {
      startActionId: "wbiztool.send_message",
      statusActionId: "wbiztool.get_message_status",
      cancelActionId: "wbiztool.cancel_message",
    },
  }),
  defineProviderAction("wbiztool", {
    name: "cancel_message",
    description: "Cancel a queued or scheduled WhatsApp message. A message already being sent may still go out.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: s.object(
      "The queued message to cancel.",
      { msg_id: messageId },
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "The cancellation response.",
      {
        status: s.integer("The request success flag, 1 when cancelled."),
        message: s.string("The upstream cancellation message."),
      },
      {
        optional: [],
        additionalProperties: true,
      },
    ),
  }),
];
