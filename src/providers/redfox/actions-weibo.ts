import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const weiboActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_weibo_work",
    operationType: "read",
    description: "Get details of a Weibo post.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      opusId: s.nonEmptyString("Work ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_weibo_user",
    operationType: "read",
    description: "Get details of a Weibo account.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      userId: s.nonEmptyString("User ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_weibo_users",
    operationType: "read",
    description: "Search Weibo accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      page: s.integer("Page number, starting at 1.", { minimum: 1 }),
      keyword: s.nonEmptyString("Search keyword."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_weibo_works",
    operationType: "read",
    description: "Search Weibo posts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        searchType: s.stringEnum("Search category.", ["1", "3", "60", "61"]),
        page: s.nonEmptyString("Page number, starting at 1."),
        keyword: s.nonEmptyString("Search keyword."),
        extParam: s.stringEnum("Verification filter: 3 = organization, 2 = individual, 0 = ordinary user.", [
          "3",
          "2",
          "0",
        ]),
      },
      { optional: ["extParam"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_weibo_hot_searches",
    operationType: "read",
    description: "List trending Weibo search terms.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {}),
    outputSchema: responseSchema,
  }),
];
