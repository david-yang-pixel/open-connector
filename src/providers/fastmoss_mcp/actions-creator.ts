import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import {
  bounds,
  creatorFilter,
  dateFields,
  fields,
  pagination,
  periodFields,
  rankingFields,
  resultSchema,
} from "./schemas.ts";

export const creatorActions: ActionDefinition[] = [
  defineProviderAction("fastmoss_mcp", {
    name: "creator_cargo_summary",
    operationType: "read",
    requiredScopes: [],
    description: "Read a creator's commerce performance summary.",
    inputSchema: s.object("FastMoss request parameters.", { filter: creatorFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_data_trends",
    operationType: "read",
    requiredScopes: [],
    description: "Read a creator's metric trends over a date range.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            uid: fields.uid,
            ...dateFields,
            date_type: s.integer("Date period selector."),
            field_type: s.string(
              "Metric: follower_change/play/like/comment/collect_count/share/units_sold/gmv; video_*=video commerce, live_*=live commerce, showcase_*=showcase commerce.",
            ),
          },
          { required: ["field_type", "uid"] },
        ),
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_fans_distribution",
    operationType: "read",
    requiredScopes: [],
    description: "Read a creator's audience demographics and distribution.",
    inputSchema: s.object("FastMoss request parameters.", { filter: creatorFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_product_list",
    operationType: "read",
    requiredScopes: [],
    description: "List products promoted by a creator and their sales performance.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            uid: fields.uid,
            time_range_days: s.string("Days: 7/14/28/90; recent=28; -1=cumulative."),
          },
          { required: ["uid"] },
        ),
        ...pagination,
        orderby: s.array(
          "Sort options. Only the first sort rule takes effect. Fields: units_sold, gmv, commission_rate_percent.",
          s.unknown("An item accepted by the live FastMoss tool schema."),
        ),
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_profile_overview",
    operationType: "read",
    requiredScopes: [],
    description: "Read a creator's profile and account overview.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      { filter: s.object("Filter parameters.", { uid: fields.uid, lang: fields.lang }, { required: ["uid"] }) },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_rank_top_ecommerce",
    operationType: "read",
    requiredScopes: [],
    description: "Rank commerce creators for a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            ...rankingFields,
            region: fields.region,
            creator_category_id: fields.creator_category_id,
            product_category_id: fields.product_category_id,
            account_type: s.integer("Account type filter."),
            ecommerce_type: s.integer("Commerce type filter."),
          },
          { required: ["date_type", "date_value"] },
        ),
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_rank_top_growth",
    operationType: "read",
    requiredScopes: [],
    description: "Rank creators by growth for a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            ...rankingFields,
            region: fields.region,
            category_id: fields.category_id,
            verify_type: s.integer("Verification type: 1 regular creators, 2 Blue V creators."),
          },
          { required: ["date_type", "date_value"] },
        ),
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_rank_top_potential",
    operationType: "read",
    requiredScopes: [],
    description: "Rank promising creators by category and audience for a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            ...rankingFields,
            category_path: fields.category_path,
            creator_category_id: fields.creator_category_id,
            region: fields.region,
            ecommerce_type: s.integer("Commerce type filter."),
            follower_age_type: s.looseObject("Audience age filter accepted by FastMoss."),
            follower_count_range: fields.follower_count_range,
            follower_gender_type: s.integer("Audience gender filter."),
          },
          { required: ["date_type", "date_value"] },
        ),
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search creators by identity, category, audience and commerce activity.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            category_id: fields.category_id,
            creator_type: s.integer("Creator type: 1 personal, 2 shop."),
            follower_age_type: s.integer("Follower age: 1=18-24, 2=25-34, 3=35+."),
            follower_gender_type: s.integer("Audience gender filter."),
            follower_range: s.object("Follower count range.", bounds, { required: [] }),
            is_ecommerce_creator: s.boolean("Whether the creator participates in commerce."),
            is_mcn_creator: s.boolean("Whether the creator belongs to an MCN agency."),
            region: fields.region,
            uid: fields.uid,
            unique_id: s.string("Creator handle."),
            verify_type: s.integer("Verification type: 1 regular creators, 2 Blue V creators."),
          },
          { required: [] },
        ),
        keywords: fields.keywords,
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "creator_video_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a creator's videos over a date range.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            uid: fields.uid,
            ...periodFields,
            orderby: pagination.orderby,
            page: s.integer("Page number. Default 1, max 10."),
            pagesize: s.integer("Page size. Default 10, max 10."),
            type: s.string("Video analysis type."),
          },
          { required: ["uid"] },
        ),
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
];
