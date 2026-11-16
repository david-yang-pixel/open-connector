import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const toutiaoActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_toutiao_works",
    operationType: "read",
    description: "Search Toutiao works by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      keyword: s.nonEmptyString("Search keyword."),
      offset: s.nonEmptyString("Pagination offset encoded as a string. Start with 0 and increase by 1."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_toutiao_work",
    operationType: "read",
    description: "Get details about a Toutiao work.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      opusId: s.nonEmptyString("Work ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_toutiao_work_comments",
    operationType: "read",
    description: "List comments on a Toutiao work.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        opusId: s.nonEmptyString("Work ID."),
        offset: s.nonEmptyString(
          "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
        ),
      },
      { optional: ["offset"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_toutiao_users",
    operationType: "read",
    description: "Search Toutiao accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        name: s.nonEmptyString("Account name keyword."),
        offset: s.nonEmptyString(
          "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
        ),
        searchId: s.nonEmptyString("Search ID returned by the previous response."),
      },
      { optional: ["offset", "searchId"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_toutiao_user_works",
    operationType: "read",
    description: "List works published by a Toutiao account.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      category: s.stringEnum("Content category.", [
        "profile_all",
        "pc_profile_article",
        "pc_profile_video",
        "pc_profile_ugc",
        "profile_wenda",
        "pc_profile_short_video",
      ]),
      token: s.nonEmptyString(
        "Public Toutiao web account identifier from the account profile URL; not an authentication token.",
      ),
      offset: s.nonEmptyString(
        "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
      ),
    }),
    outputSchema: responseSchema,
  }),
];
