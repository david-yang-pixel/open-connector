import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const dongchediActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_dongchedi_works",
    operationType: "read",
    description: "Search Dongchedi posts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      keyword: s.nonEmptyString("Search keyword."),
      offset: s.nonEmptyString("Pagination offset. Start with 0 and increase by 20."),
      sourceType: s.stringEnum("Content source type.", ["1", "2"]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_dongchedi_work",
    operationType: "read",
    description: "Get details of a Dongchedi post.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      workId: s.nonEmptyString("Work ID."),
      workType: s.stringEnum("Work type: video or article.", ["video", "article"]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_dongchedi_users",
    operationType: "read",
    description: "Search Dongchedi accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.withDefault(
          s.integer(
            "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
            { minimum: 0 },
          ),
          0,
        ),
      },
      { optional: ["offset"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_dongchedi_user_works",
    operationType: "read",
    description: "List posts published by a Dongchedi account.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      userId: s.nonEmptyString("User ID."),
    }),
    outputSchema: responseSchema,
  }),
];
