import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const wechatActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_wechat_account",
    operationType: "read",
    description:
      "Get details about a WeChat Official Account. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        account: s.nonEmptyString("WeChat account handle."),
        accountName: s.nonEmptyString("Account name to search for."),
      },
      { optional: ["accountName"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_account_broad",
    operationType: "read",
    description:
      "Get a WeChat Official Account from the broad database. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          account: s.nonEmptyString("WeChat account handle."),
          wxId: s.nonEmptyString("Original WeChat account ID."),
          bizInfo: s.nonEmptyString("WeChat account collection ID."),
        },
        { optional: ["account", "wxId", "bizInfo"] },
      ),
      ["account", "wxId", "bizInfo"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_article",
    operationType: "read",
    description:
      "Get a WeChat Official Account article by its UUID. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      workUuid: s.nonEmptyString("Work UUID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_article_broad",
    operationType: "read",
    description:
      "Get a WeChat Official Account article from the broad database. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      workUuid: s.nonEmptyString("Work UUID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_accounts",
    operationType: "read",
    description:
      "Search WeChat Official Accounts by keyword. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
        sortType: s.stringEnum(
          "Sort: _0 = relevance, _2 = newest, _4 = hottest. For account searches, newest refers to recent posts and hottest to the platform ranking.",
          ["_0", "_2", "_4"],
        ),
      },
      { optional: ["offset", "sortType"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_accounts_broad",
    operationType: "read",
    description:
      "Search WeChat Official Accounts by keyword in the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
      },
      { optional: ["offset"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_articles",
    operationType: "read",
    description:
      "Search WeChat Official Account articles by keyword. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
        sortType: s.stringEnum(
          "Sort: _0 = relevance, _2 = newest, _4 = hottest. For account searches, newest refers to recent posts and hottest to the platform ranking.",
          ["_0", "_2", "_4"],
        ),
        exactMatch: s.boolean(
          "Require the entire keyword phrase in the title, summary, content or author instead of token matching.",
        ),
      },
      { optional: ["offset", "sortType", "exactMatch"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_articles_broad",
    operationType: "read",
    description:
      "Search WeChat Official Account articles in the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        exactMatch: s.boolean(
          "Require the entire keyword phrase in the title, summary, content or author instead of token matching.",
        ),
        offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
        sortType: s.stringEnum("Sort: 0 = default, 2 = newest, 4 = hottest.", ["0", "2", "4"]),
      },
      { optional: ["exactMatch", "offset", "sortType"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_account_articles",
    operationType: "read",
    description:
      "List articles published by a WeChat Official Account. Uses the curated database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        account: s.nonEmptyString("WeChat account handle."),
        accountName: s.nonEmptyString("Account name to search for."),
        offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
        sortType: s.stringEnum(
          "Sort: _0 = relevance, _2 = newest, _4 = hottest. For account searches, newest refers to recent posts and hottest to the platform ranking.",
          ["_0", "_2", "_4"],
        ),
        publishTimeStart: s.nonEmptyString("Earliest publication time; not earlier than 2026-04-01."),
        publishTimeEnd: s.nonEmptyString("Latest publication time."),
      },
      { optional: ["accountName", "offset", "sortType", "publishTimeStart", "publishTimeEnd"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_account_articles_broad",
    operationType: "read",
    description:
      "List articles by a WeChat Official Account in the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          account: s.nonEmptyString("WeChat account handle."),
          wxId: s.nonEmptyString("Original WeChat account ID."),
          bizInfo: s.nonEmptyString("WeChat account collection ID."),
          offset: s.integer("Pagination offset. Start with 0 and increase by 20.", { minimum: 0 }),
          sortType: s.stringEnum("Sort: 0 = default, 2 = newest, 4 = hottest.", ["0", "2", "4"]),
        },
        { optional: ["account", "wxId", "bizInfo", "offset", "sortType"] },
      ),
      ["account", "wxId", "bizInfo"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_wechat_ai_creations",
    operationType: "read",
    description:
      "Search WeChat Official Account articles related to AI creation. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        pageNum: s.integer("Page number, starting at 1.", { exclusiveMinimum: 0 }),
        pageSize: s.integer("Number of results per page.", { exclusiveMinimum: 0 }),
        startTime: s.nonEmptyString("Time bound formatted as yyyy-MM-dd HH:mm:ss."),
        endTime: s.nonEmptyString("Time bound formatted as yyyy-MM-dd HH:mm:ss."),
      },
      { optional: ["startTime", "endTime"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_article_by_url",
    operationType: "read",
    description: "Get a WeChat Official Account article by its URL.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      articleUrl: s.nonEmptyString("WeChat article URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_high_read_articles",
    operationType: "read",
    description:
      "List WeChat Official Account articles with high readership. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      type: s.stringEnum("Content category.", [
        "人文资讯",
        "知识百科",
        "健康养生",
        "时尚潮流",
        "乐活生活",
        "旅游出行",
        "搞笑幽默",
        "情感心理",
        "体育娱乐",
        "美容美体",
        "文摘精选",
        "财富理财",
        "科技数码",
        "创投商业",
        "汽车交通",
        "房产楼市",
        "职场发展",
        "教育考试",
        "学术研究",
        "企业品牌",
        "总排名",
      ]),
      startDate: s.nonEmptyString("Start date, formatted as yyyy-MM-dd."),
      endDate: s.nonEmptyString("End date, formatted as yyyy-MM-dd."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_original_viral_articles",
    operationType: "read",
    description:
      "List popular original articles from WeChat Official Accounts. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      type: s.stringEnum("Content category.", [
        "人文资讯",
        "知识百科",
        "健康养生",
        "时尚潮流",
        "乐活生活",
        "旅游出行",
        "搞笑幽默",
        "情感心理",
        "体育娱乐",
        "美容美体",
        "文摘精选",
        "财富理财",
        "科技数码",
        "创投商业",
        "汽车交通",
        "房产楼市",
        "职场发展",
        "教育考试",
        "学术研究",
        "企业品牌",
        "总排名",
      ]),
      startDate: s.nonEmptyString("Start date, formatted as yyyy-MM-dd."),
      endDate: s.nonEmptyString("End date, formatted as yyyy-MM-dd."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_reading_growth",
    operationType: "read",
    description:
      "List WeChat Official Account articles ranked by readership growth. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      rankDate: s.nonEmptyString("Ranking date, formatted as yyyy-MM-dd."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_account_rankings",
    operationType: "read",
    description: "List WeChat Official Account rankings. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      rankType: s.stringEnum("Ranking period: day, week or month.", ["day", "week", "month"]),
      rankDate: s.nonEmptyString("Ranking date, formatted as yyyy-MM-dd."),
      category: s.stringEnum("Content category.", [
        "人文资讯",
        "知识百科",
        "健康养生",
        "时尚潮流",
        "美食餐饮",
        "乐活生活",
        "旅游出行",
        "搞笑幽默",
        "情感心理",
        "体育娱乐",
        "美容美体",
        "文摘精选",
        "民生资讯",
        "财富理财",
        "科技数码",
        "创投商业",
        "汽车交通",
        "房产楼市",
        "职场发展",
        "教育考试",
        "学术研究",
        "企业品牌",
        "时事新闻",
        "总排名",
      ]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_wechat_headline_growth",
    operationType: "read",
    description: "List WeChat Official Account headline articles ranked by readership growth.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        page: s.integer("Page number, starting at 1.", { minimum: 1, maximum: 5 }),
        rank_date: s.nonEmptyString("Monday of the ranking week, formatted as yyyy-MM-dd HH:mm:ss."),
        author_type: s.stringEnum("Author category; omit to include all categories.", [
          "人文资讯",
          "知识百科",
          "健康养生",
          "时尚潮流",
          "美食餐饮",
          "乐活生活",
          "旅游出行",
          "搞笑幽默",
          "情感心理",
          "体育娱乐",
          "美容美体",
          "文摘精选",
          "民生资讯",
          "财富理财",
          "科技数码",
          "创投商业",
          "汽车交通",
          "房产楼市",
          "职场发展",
          "教育考试",
          "学术研究",
          "企业品牌",
          "时事新闻",
        ]),
        sort: s.stringEnum("Sort order.", ["cur_read", "prev_read", "growth_val", "growth_pct"]),
      },
      { optional: ["author_type", "sort"] },
    ),
    outputSchema: responseSchema,
  }),
];
