import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const bilibiliActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_bilibili_work",
    operationType: "read",
    description:
      "Get a Bilibili work by its BV ID or URL. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          bvId: s.nonEmptyString("Bilibili BV ID."),
          workUrl: s.nonEmptyString("Work URL."),
        },
        { optional: ["bvId", "workUrl"] },
      ),
      ["bvId", "workUrl"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_bilibili_user",
    operationType: "read",
    description:
      "Get details about a Bilibili account. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      mid: s.nonEmptyString("Bilibili user MID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_bilibili_users",
    operationType: "read",
    description:
      "Search Bilibili accounts by keyword. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        page: s.nonEmptyString("Page number, starting at 1."),
        pageSize: s.integer("Number of results per page.", { minimum: 1, maximum: 50 }),
        order: s.stringEnum("Sort order.", ["follower", "like"]),
      },
      { optional: ["pageSize", "order"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_bilibili_works",
    operationType: "read",
    description:
      "Search Bilibili works by keyword. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        exactMatch: s.boolean(
          "Require the entire keyword phrase in the title, summary, content or author instead of token matching.",
        ),
        page: s.nonEmptyString("Page number, starting at 1."),
        pageSize: s.integer("Number of results per page.", { minimum: 1, maximum: 50 }),
        order: s.stringEnum("Sort order.", ["time", "play", "like", "comment", "favorite"]),
      },
      { optional: ["exactMatch", "pageSize", "order"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_bilibili_user_works",
    operationType: "read",
    description:
      "List works published by a Bilibili account. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          mid: s.nonEmptyString("Bilibili user MID."),
          accountUrl: s.nonEmptyString("Account profile URL."),
          page: s.integer("Page number, starting at 1.", { minimum: 1 }),
          pageSize: s.integer("Number of results per page.", { minimum: 1, maximum: 50 }),
          order: s.stringEnum("Sort order.", ["time", "play", "like"]),
        },
        { optional: ["mid", "accountUrl", "page", "pageSize", "order"] },
      ),
      ["mid", "accountUrl"],
    ),
    outputSchema: responseSchema,
  }),
];
