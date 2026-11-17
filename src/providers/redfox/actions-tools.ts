import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const toolsActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_bilibili_audio",
    operationType: "read",
    description: "Extract an audio download URL from a Bilibili video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "parse_video",
    operationType: "read",
    description: "Resolve a shared video URL into media metadata and download links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_youtube_video_download",
    operationType: "read",
    description: "Resolve a YouTube video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_x_video_download",
    operationType: "read",
    description: "Resolve an X video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_tiktok_video_download",
    operationType: "read",
    description: "Resolve a TikTok video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_xiaohongshu_video_download",
    operationType: "read",
    description: "Resolve a Xiaohongshu video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_channel_video_download",
    operationType: "read",
    description: "Resolve a WeChat channel video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_douyin_video_download",
    operationType: "read",
    description: "Resolve a Douyin video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_kuaishou_video_download",
    operationType: "read",
    description: "Resolve a Kuaishou video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_bilibili_video_download",
    operationType: "read",
    description: "Resolve a Bilibili video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_instagram_video_download",
    operationType: "read",
    description: "Resolve an Instagram video URL into downloadable media links.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_aggregated_hot_topics",
    operationType: "read",
    description: "List trending topics aggregated across platforms for a time range.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      startDate: s.nonEmptyString("startDate formatted as yyyy-MM-dd HH:mm:ss."),
      endDate: s.nonEmptyString("endDate formatted as yyyy-MM-dd HH:mm:ss."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_hot_topics",
    operationType: "read",
    description: "Search trending topics by keywords, platforms and date range.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      platforms: s.array(
        "Platform codes. An empty list queries all platforms: 1 Kuaishou, 2 Douyin, 5 Weibo, 7 Baidu, 8 Bilibili, 9 Zhihu, 10 Toutiao.",
        s.withEnum(s.integer("Platform code."), [1, 2, 5, 7, 8, 9, 10]),
      ),
      keywords: s.array("Search keywords.", s.string("Keyword."), { minItems: 1 }),
      startDate: s.nonEmptyString(
        "Start date, yyyy-MM-dd. The range must not exceed 30 days. For today, use today as start and tomorrow as end.",
      ),
      endDate: s.nonEmptyString("End date, formatted as yyyy-MM-dd."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_platform_hot_topics",
    operationType: "read",
    description: "List trending topics on a selected platform for a date range.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      platform: s.withEnum(s.integer("Platform code."), [1, 2, 6, 5, 7, 8, 9, 10]),
      startDate: s.nonEmptyString("Start date, formatted as yyyy-MM-dd."),
      endDate: s.nonEmptyString("End date, formatted as yyyy-MM-dd."),
    }),
    outputSchema: responseSchema,
  }),
];
