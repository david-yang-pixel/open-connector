import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const kuaishouActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_kuaishou_users",
    operationType: "read",
    description:
      "Search Kuaishou accounts by name. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        accountName: s.nonEmptyString("Account name to search for."),
        page: s.withDefault(s.integer("Page number, starting at 1.", { minimum: 1 }), 1),
        pageSize: s.withDefault(s.integer("Number of results per page.", { minimum: 1, maximum: 50 }), 20),
      },
      { optional: ["page", "pageSize"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_kuaishou_user_works",
    operationType: "read",
    description:
      "List works published by a Kuaishou account. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          kwaiId: s.nonEmptyString("Kuaishou display ID."),
          threeXId: s.nonEmptyString("Kuaishou profile ID."),
          page: s.withDefault(s.integer("Page number, starting at 1.", { minimum: 1 }), 1),
          size: s.withDefault(s.integer("Number of results per page, from 1 to 50.", { minimum: 1, maximum: 50 }), 20),
        },
        { optional: ["kwaiId", "threeXId", "page", "size"] },
      ),
      ["kwaiId", "threeXId"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_kuaishou_work",
    operationType: "read",
    description:
      "Get details about a Kuaishou work. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      photoId: s.nonEmptyString("Work ID returned by the account work list."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_kuaishou_works",
    operationType: "read",
    description:
      "Search Kuaishou works by keyword. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        page: s.withDefault(s.integer("Page number, starting at 1.", { minimum: 1 }), 1),
        size: s.withDefault(s.integer("Number of results per page, from 1 to 50.", { minimum: 1, maximum: 50 }), 20),
        sort: s.withDefault(s.stringEnum("Sort order.", ["综合", "最新", "最多点赞", "最多收藏"]), "综合"),
      },
      { optional: ["page", "size", "sort"] },
    ),
    outputSchema: responseSchema,
  }),
];
