import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const recipient = s.object(
  "One recipient and optional personalized message or media.",
  {
    number: s.string("Phone number with country code, without a leading zero, plus sign, or spaces.", {
      pattern: "^[1-9][0-9]{4,}$",
    }),
    messenger_id: s.nonEmptyString("Facebook Messenger recipient ID; use with application 5 instead of number."),
    message: s.string("Personalized text or image/video caption; falls back to globalmessage when empty."),
    media: s.string("Public media URL for this recipient; supported by WhatsApp Official and Shared Numbers.", {
      format: "uri",
    }),
    reference_number: s.string("Your reference returned in delivery webhooks; not an idempotency key."),
    quoted: s.string("Message ID to quote in a reply on WhatsApp Web Automation."),
  },
  { optional: ["number", "messenger_id", "message", "media", "reference_number", "quoted"] },
);

export const pickyAssistActions: ActionDefinition[] = [
  defineProviderAction("picky_assist", {
    name: "get_balance",
    operationType: "read",
    description: "Get the Picky Assist account balance using the connected project API token.",
    requiredScopes: [],
    inputSchema: s.requiredObject("No input is required.", {}),
    outputSchema: s.looseObject("Picky Assist account balance response.", {
      status: s.integer("Provider business status; 100 indicates success."),
      message: s.string("Provider status message."),
      balance: s.number("Available account balance reported by Picky Assist."),
    }),
  }),
  defineProviderAction("picky_assist", {
    name: "send_messages",
    operationType: "write",
    description:
      "Submit text or public-URL media messages to one or more Picky Assist recipients. Success means accepted for processing, not delivered. WhatsApp session and channel restrictions still apply.",
    requiredScopes: [],
    inputSchema: s.object(
      "Text or media messages for a connected channel.",
      {
        application: s.integer(
          "Channel ID from https://app.pickyassist.com/settings/channels; use 5 for Facebook Messenger.",
        ),
        globalmessage: s.string("Shared text or image/video caption, used when a recipient message is empty."),
        globalmedia: s.string(
          "Public media URL fetched by Picky Assist, not by Connector. Media limits depend on the channel and file type.",
          { format: "uri" },
        ),
        media_name: s.string("Display filename for PDFs and documents; unsupported by Phone Automation.", {
          maxLength: 20,
        }),
        priority: s.integer("Queue priority: 0 for low (default), 1 for high.", {
          minimum: 0,
          maximum: 1,
        }),
        createcontact: s.literal(1, { description: "Set to 1 to create contacts against the channel." }),
        voice: s.literal(1, { description: "Set to 1 to send audio as a voice note on WhatsApp Web Automation." }),
        data: s.array(
          "Recipients with optional personalized content. Each needs text or media, either shared or individual.",
          recipient,
          { minItems: 1 },
        ),
      },
      {
        optional: ["globalmessage", "globalmedia", "media_name", "priority", "createcontact", "voice"],
      },
    ),
    outputSchema: s.looseObject("Submission response; use delivery webhooks to determine final delivery.", {
      status: s.integer("Provider business status; 100 indicates acceptance."),
      message: s.string("Provider status message."),
      push_id: s.string("Batch submission ID."),
      data: s.array(
        "Per-recipient submission results.",
        s.looseObject("One recipient result, including any additional provider fields.", {
          msg_id: s.string("Message ID allocated by Picky Assist."),
          number: s.string("Recipient phone number."),
          credit: s.string("Credit charged as reported by the provider."),
        }),
      ),
    }),
  }),
];
