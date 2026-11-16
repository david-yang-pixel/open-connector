import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const baijiahaoActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_baijiahao_article",
    operationType: "read",
    description: "Get the content and metadata of a Baijiahao article.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      articleId: s.nonEmptyString("Article ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_baijiahao_video",
    operationType: "read",
    description: "Get details of a Baijiahao video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      svId: s.nonEmptyString("Baijiahao video ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_baijiahao_user",
    operationType: "read",
    description: "Get details of a Baijiahao account.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      uk: s.nonEmptyString("Baijiahao account uk identifier."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_baijiahao_works",
    operationType: "read",
    description: "Search Baijiahao posts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        sort: s.nonEmptyString("Sort order."),
        pn: s.nonEmptyString("Pagination offset. Start with 0 and increase by 10."),
        keyWord: s.nonEmptyString("Search keyword."),
      },
      { optional: ["sort"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_baijiahao_users",
    operationType: "read",
    description: "Search Baijiahao accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      page: s.nonEmptyString(
        "Page cursor encoded as a string. Start with 0, then use the page returned by the previous response.",
      ),
      keyword: s.nonEmptyString("Search keyword."),
    }),
    outputSchema: responseSchema,
  }),
];
