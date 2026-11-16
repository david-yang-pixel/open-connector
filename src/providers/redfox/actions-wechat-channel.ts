import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const wechatChannelActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_wechat_channel_works",
    operationType: "read",
    description:
      "Search WeChat Channel works by keyword. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        sort: s.stringEnum("Sort order.", ["综合", "最新", "最多点赞", "最多收藏"]),
        page: s.integer("Page number, starting at 1.", { minimum: 1 }),
        size: s.integer("Number of results per page, from 1 to 50.", { minimum: 1, maximum: 50 }),
        exactMatch: s.boolean(
          "Require the entire keyword phrase in the title, summary, content or author instead of token matching.",
        ),
      },
      { optional: ["sort", "page", "size", "exactMatch"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_channel_users",
    operationType: "read",
    description:
      "Search WeChat Channel accounts by name. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        accountName: s.nonEmptyString("Account name to search for."),
        page: s.integer("Page number, starting at 1.", { minimum: 1 }),
        pageSize: s.integer("Number of results per page.", { minimum: 1, maximum: 50 }),
      },
      { optional: ["page", "pageSize"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_channel_work",
    operationType: "read",
    description:
      "Get details about a WeChat Channel work. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      videoId: s.nonEmptyString("Video ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_channel_user_works",
    operationType: "read",
    description:
      "List works published by a WeChat Channel account. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        nickname: s.nonEmptyString("Exact account nickname."),
        page: s.integer("Page number, starting at 1.", { minimum: 1 }),
        size: s.integer("Number of results per page, from 1 to 50.", { minimum: 1, maximum: 50 }),
      },
      { optional: ["page", "size"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_channel_work_by_url",
    operationType: "read",
    description: "Get a WeChat Channels post by its shared URL.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
];
