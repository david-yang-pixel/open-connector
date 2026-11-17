import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const xActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "list_x_post_comments",
    operationType: "read",
    description: "List replies to an X post.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        tweetId: s.nonEmptyString("X post ID."),
        cursor: s.string("Pagination cursor. Start with 0; use the cursor returned by the previous response."),
      },
      { optional: ["cursor"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_x_user",
    operationType: "read",
    description: "Get an X account by username or user ID.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          screenName: s.nonEmptyString("X username without @."),
          restId: s.nonEmptyString("X numeric user ID. Takes precedence over screenName."),
        },
        { optional: ["screenName", "restId"] },
      ),
      ["screenName", "restId"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_x_posts",
    operationType: "read",
    description: "Search X posts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        searchType: s.stringEnum("Search category.", ["Top", "Latest", "Media", "People", "Lists"]),
        cursor: s.string("Pagination cursor. Start with 0; use the cursor returned by the previous response."),
      },
      { optional: ["searchType", "cursor"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_x_post",
    operationType: "read",
    description: "Get an X post by its ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      tweetId: s.nonEmptyString("X post ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_x_hot_users",
    operationType: "read",
    description: "List popular X accounts by category. Uses the curated database.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        pageNum: s.withDefault(s.integer("Page number, starting at 1.", { minimum: 1, maximum: 10 }), 1),
        rankDate: s.nonEmptyString("Ranking date, formatted as yyyy-MM-dd."),
        gender: s.stringEnum("Gender filter: all, male, female; also accepts 全部, 男, 女.", [
          "all",
          "male",
          "female",
          "全部",
          "男",
          "女",
        ]),
        category: s.stringEnum("Content category.", [
          "商业创业",
          "全部行业",
          "汽车出行",
          "设计创意",
          "航空领域",
          "电商零售",
          "教育培训",
          "工程运营",
          "娱乐文化",
          "环境能源",
          "家庭育儿",
          "时尚美妆",
          "金融投资",
          "美食饮品",
          "游戏电竞",
          "健康医疗",
          "牧场马术",
          "宗教信仰",
          "科学学术",
          "体育健身",
          "科技软件",
          "旅行户外",
          "视觉艺术",
          "健康生活",
          "居家手工",
          "人力职场",
          "公益平权",
          "法律法务",
          "市场营销",
          "音乐领域",
          "萌宠动物",
          "政治新闻",
          "all",
        ]),
      },
      { optional: ["rankDate"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_x_user_following",
    operationType: "read",
    description: "List accounts followed by an X user.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        screenName: s.nonEmptyString("X username without @."),
        cursor: s.string("Pagination cursor. Start with 0; use the cursor returned by the previous response."),
      },
      { optional: ["cursor"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_x_user_posts",
    operationType: "read",
    description: "List posts published by an X account.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          screenName: s.nonEmptyString("X username without @."),
          restId: s.nonEmptyString("X numeric user ID. Takes precedence over screenName."),
          cursor: s.string("Pagination cursor. Start with 0; use the cursor returned by the previous response."),
        },
        { optional: ["screenName", "restId", "cursor"] },
      ),
      ["screenName", "restId"],
    ),
    outputSchema: responseSchema,
  }),
];
