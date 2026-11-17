import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const tiktokActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_tiktok_work",
    operationType: "read",
    description: "Get a TikTok video by its ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      awemeId: s.nonEmptyString("TikTok work ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_tiktok_user_works",
    operationType: "read",
    description: "List videos published by a TikTok account.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      secUserId: s.nonEmptyString("Encrypted user ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_tiktok_works",
    operationType: "read",
    description: "Search TikTok videos by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.nonEmptyString(
          "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
        ),
        count: s.nonEmptyString("Number of results to request."),
        sortType: s.stringEnum("Sort: 0 = relevance, 1 = most likes.", ["0", "1"]),
        publishTime: s.nonEmptyString("Publication age in days: 0 = any, 1, 7, 30, 90 or 180."),
        region: s.nonEmptyString("Country code; defaults to US."),
      },
      { optional: ["offset", "count", "sortType", "publishTime", "region"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_tiktok_users",
    operationType: "read",
    description: "Search TikTok accounts by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        offset: s.withDefault(
          s.nonEmptyString(
            "Pagination offset. Start with 0 and use the offset or next cursor returned by the previous response.",
          ),
          "0",
        ),
        count: s.withDefault(s.nonEmptyString("Number of results to request."), "20"),
        followerCountFilter: s.withEnum(
          s.integer("Follower range: 1 = 0-1K, 2 = 1K-10K, 3 = 10K-100K, 4 = above 100K. Omit for all."),
          [1, 2, 3, 4],
        ),
        profileTypeFilter: s.withEnum(s.integer("Set to 1 to restrict results to verified users."), [1]),
        otherPrefFilter: s.withEnum(s.integer("Set to 1 to rank by username relevance."), [1]),
      },
      {
        optional: ["offset", "count", "followerCountFilter", "profileTypeFilter", "otherPrefFilter"],
      },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_tiktok_topic_works",
    operationType: "read",
    description: "List TikTok videos associated with a topic.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        ch_id: s.integer("TikTok topic ID."),
        cursor: s.withDefault(
          s.integer("Pagination cursor. Start with 0; use the cursor returned by the previous response.", {
            minimum: 0,
          }),
          0,
        ),
        region: s.stringEnum("Country code; defaults to US.", ["US", "GB", "FR", "JP", "VN", "SG"]),
      },
      { optional: ["cursor", "region"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_tiktok_topics",
    operationType: "read",
    description: "Search TikTok topics by keyword.",
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
    name: "list_tiktok_user_following",
    operationType: "read",
    description: "List accounts followed by a TikTok user.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          userId: s.nonEmptyString("User ID."),
          secUserId: s.nonEmptyString("Encrypted user ID."),
          minTime: s.withDefault(
            s.nonEmptyString("Pagination time. Use 0 for the first page, then the returned minTime."),
            "0",
          ),
          pageToken: s.withDefault(
            s.string("Pagination token. Use an empty string for the first page, then the returned pageToken."),
            "",
          ),
        },
        { optional: ["userId", "secUserId", "minTime", "pageToken"] },
      ),
      ["userId", "secUserId"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_tiktok_user_liked_works",
    operationType: "read",
    description: "List videos liked by a TikTok user.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        sec_user_id: s.nonEmptyString("Encrypted TikTok user ID."),
        max_cursor: s.withDefault(
          s.integer("Pagination cursor. Start with 0; use nextCursor from the previous response.", {
            minimum: 0,
          }),
          0,
        ),
      },
      { optional: ["max_cursor"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_tiktok_work_comments",
    operationType: "read",
    description: "List comments on a TikTok video.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        aweme_id: s.nonEmptyString("TikTok work ID."),
        cursor: s.withDefault(
          s.integer("Pagination cursor. Start with 0; use the cursor returned by the previous response.", {
            minimum: 0,
          }),
          0,
        ),
      },
      { optional: ["cursor"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_tiktok_comment_replies",
    operationType: "read",
    description: "List replies to a TikTok video comment.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        itemId: s.nonEmptyString("TikTok work ID."),
        commentId: s.nonEmptyString("Comment ID."),
        cursor: s.withDefault(
          s.integer("Pagination cursor. Start with 0; use the cursor returned by the previous response.", {
            minimum: 0,
          }),
          0,
        ),
        count: s.integer("Number of results to request.", { minimum: 1 }),
      },
      { optional: ["cursor"] },
    ),
    outputSchema: responseSchema,
  }),
];
