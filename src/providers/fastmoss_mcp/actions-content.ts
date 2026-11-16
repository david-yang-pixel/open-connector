import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { bounds, dateFields, fields, pagination, resultSchema, videoPeriodFilter } from "./schemas.ts";

export const contentActions: ActionDefinition[] = [
  defineProviderAction("fastmoss_mcp", {
    name: "ad_data_overview",
    operationType: "read",
    requiredScopes: [],
    description: "Read a video's advertising spend, ROAS and engagement over a date range.",
    inputSchema: s.object("FastMoss request parameters.", { filter: videoPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "ad_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search advertisements by category, spend, ROAS and activity dates.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            ad_type: s.integer("Ad type: 1 TikTok Shop commerce ad, 2 non-commerce/planting ad."),
            category_l1_id: s.integer("Level 1 category ID."),
            category_l2_id: s.integer("Level 2 category ID."),
            category_l3_id: s.integer("Level 3 category ID."),
            estimated_ad_spend_range: s.object("Estimated advertising spend range.", bounds, { required: [] }),
            keywords: fields.keywords,
            last_seen_ad_date_range: s.object("Last observed advertising date range.", dateFields, { required: [] }),
            observed_active_days_range: s.object("Observed active-day count range.", bounds, { required: [] }),
            play_count_range: fields.play_count_range,
            region: fields.region,
            roas_range: s.object("Return on advertising spend range.", bounds, { required: [] }),
            video_create_date_range: s.object("Video creation date range.", dateFields, { required: [] }),
          },
          { required: [] },
        ),
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "live_detail_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a live session's audience and commerce performance.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object("Filter parameters.", { room_id: fields.room_id }, { required: ["room_id"] }),
        lang: fields.lang,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "live_products_list",
    operationType: "read",
    requiredScopes: [],
    description: "List products promoted in a live session.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            room_id: fields.room_id,
            category_id: fields.category_id,
            seller_id: fields.seller_id,
          },
          { required: ["room_id"] },
        ),
        lang: fields.lang,
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "live_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search live sessions by start time, audience and commerce performance.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            creator_category: s.integer("Creator category ID."),
            follower_range: s.object("Follower count range.", bounds, { required: [] }),
            live_type: s.integer("Live type: 1 shop live, 2 creator live."),
            product_category: s.integer("Product category ID."),
            region: fields.region,
            room_id: fields.room_id,
            sold_range: s.object("Units sold range.", bounds, { required: [] }),
            start_time: s.integer("Live-session start time."),
            viewer_range: s.object("Viewer count range.", bounds, { required: [] }),
          },
          { required: ["start_time"] },
        ),
        keywords: fields.keywords,
        lang: fields.lang,
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "video_data_trends",
    operationType: "read",
    requiredScopes: [],
    description: "Read a video's performance trends over a date range.",
    inputSchema: s.object("FastMoss request parameters.", { filter: videoPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "video_detail_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a video's engagement and commerce performance.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object("Filter parameters.", { video_id: fields.video_id }, { required: ["video_id"] }),
        lang: fields.lang,
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "video_script_info",
    operationType: "read",
    requiredScopes: [],
    description: "Read the script or transcript of a video.",
    inputSchema: s.object("FastMoss request parameters.", { video_id: fields.video_id }, { required: ["video_id"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "video_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search videos by creation time, creator, engagement and commerce activity.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            create_time_range: fields.create_time_range,
            creator_category_id: fields.creator_category_id,
            creator_uid: s.integer("Creator UID."),
            creator_unique_id: s.string("Creator handle."),
            digg_count_range: s.object("Like count range.", bounds, { required: [] }),
            follower_count_range: fields.follower_count_range,
            interact_rate_range: s.object("Engagement rate range.", bounds, { required: [] }),
            is_ecommerce: s.boolean("Whether the video promotes products."),
            play_count_range: fields.play_count_range,
            product_category_id: fields.product_category_id,
            region: fields.region,
          },
          { required: ["create_time_range"] },
        ),
        keywords: fields.keywords,
        lang: fields.lang,
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
];
