import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const visitorId = s.nonEmptyString("Visitor ID.");
const chatId = s.integer("Chat ID.");
const eventId = s.nonEmptyString("Chat event ID.");
const chatOptions = {
  transcript: s.optional(s.boolean("Return message events as a transcript.")),
  eventTypes: s.optional(
    s.array("Filter returned events by type. Ignored when transcript is true.", s.nonEmptyString("Chat event type.")),
  ),
};
const links = s.optional(s.looseObject("Related API links, including pagination or older chats."));
const recordOutput = s.object(
  "Chaport response.",
  {
    result: s.looseObject("The requested record, including provider-defined fields."),
    links,
  },
  { required: [], additionalProperties: true },
);
const listOutput = s.object(
  "Chaport response.",
  {
    result: s.array("The requested records.", s.looseObject("A record including provider-defined fields.")),
    links,
  },
  { required: [], additionalProperties: true },
);
export const chaportActions: ActionDefinition[] = [
  defineProviderAction("chaport", {
    name: "list_visitors",
    operationType: "read",
    requiredScopes: [],
    description: "List visitors ordered by their most recent chat, one page at a time.",
    inputSchema: s.requiredObject("Visitor list input.", {
      page: s.optional(s.integer("Page number, starting at 1.", { minimum: 1 })),
    }),
    outputSchema: listOutput,
  }),
  defineProviderAction("chaport", {
    name: "get_visitor",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a visitor by ID.",
    inputSchema: s.requiredObject("Visitor lookup input.", { visitorId }),
    outputSchema: recordOutput,
  }),
  defineProviderAction("chaport", {
    name: "get_latest_chat",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a visitor's current or most recent chat and links to older chats.",
    inputSchema: s.requiredObject("Latest chat input.", { visitorId, ...chatOptions }),
    outputSchema: recordOutput,
  }),
  defineProviderAction("chaport", {
    name: "get_chat",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a specific chat for a visitor.",
    inputSchema: s.requiredObject("Chat lookup input.", { visitorId, chatId, ...chatOptions }),
    outputSchema: recordOutput,
  }),
  defineProviderAction("chaport", {
    name: "list_chat_events",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve all events for a visitor's chat.",
    inputSchema: s.requiredObject("Chat events input.", { visitorId, chatId }),
    outputSchema: listOutput,
  }),
  defineProviderAction("chaport", {
    name: "get_chat_event",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a specific event in a visitor's chat.",
    inputSchema: s.requiredObject("Chat event lookup input.", { visitorId, chatId, eventId }),
    outputSchema: recordOutput,
  }),
];
