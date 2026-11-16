import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const yicheActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_yiche_video",
    operationType: "read",
    description: "Get details of a Yiche video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      workId: s.nonEmptyString("Work ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_yiche_users",
    operationType: "read",
    description: "Search Yiche accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      keyword: s.nonEmptyString("Search keyword."),
      page: s.integer("Page number, starting at 1.", { minimum: 1 }),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_yiche_user_works",
    operationType: "read",
    description: "List posts published by a Yiche account.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        userId: s.nonEmptyString("User ID."),
        timestamp: s.nonEmptyString(
          "Omit for the first page; use the last item publishTime from the previous response.",
        ),
      },
      { optional: ["timestamp"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_yiche_works",
    operationType: "read",
    description: "Search Yiche posts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      keyword: s.nonEmptyString("Search keyword."),
      page: s.integer("Page number, starting at 1.", { minimum: 1 }),
      sourceType: s.stringEnum("Content source type.", ["club", "shipin", "xinwen"]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_yiche_article",
    operationType: "read",
    description: "Get the content and metadata of a Yiche article.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
];
