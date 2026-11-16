import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { bounds, fields, pagination, periodFields, rankingFields, resultSchema, shopPeriodFilter } from "./schemas.ts";

export const shopActions: ActionDefinition[] = [
  defineProviderAction("fastmoss_mcp", {
    name: "shop_base_info",
    operationType: "read",
    requiredScopes: [],
    description: "Read a shop's profile and basic information.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      { filter: s.object("Filter parameters.", { seller_id: fields.seller_id }, { required: ["seller_id"] }) },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_creator_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze creators promoting a shop's products.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            seller_id: fields.seller_id,
            time_range_days: periodFields.time_range_days,
            author_product_type: s.integer("Selling mode: 1 video, 2 live."),
            follower_count_range: fields.follower_count_range,
            sold_count_range: s.object("Units sold range.", bounds, { required: [] }),
          },
          { required: ["seller_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_data_trends",
    operationType: "read",
    requiredScopes: [],
    description: "Read a shop's performance trends over a date range.",
    inputSchema: s.object("FastMoss request parameters.", { filter: shopPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_investment_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a shop's advertising investment over a date range.",
    inputSchema: s.object("FastMoss request parameters.", { filter: shopPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_sale_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a shop's sales over a date range.",
    inputSchema: s.object("FastMoss request parameters.", { filter: shopPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_live_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze live sessions associated with a shop.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            seller_id: fields.seller_id,
            ...periodFields,
            is_shop: s.integer("Live type: 0 all, 1 shop live, 2 affiliate live."),
          },
          { required: ["seller_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_product_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a shop's products by category and listing age.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            seller_id: fields.seller_id,
            ...periodFields,
            category_id: fields.category_id,
            listing_time_range_days: s.integer("Product listing age in days."),
          },
          { required: ["seller_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "shop_rank_top_selling",
    operationType: "read",
    requiredScopes: [],
    description: "Rank shops by sales for a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            ...rankingFields,
            category_id: fields.category_id,
            is_cross_border: fields.is_cross_border,
            region: fields.region,
            shop_type: fields.shop_type,
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
    name: "shop_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search shops by name, region, category and creator relationships.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            brand_name: s.string("Brand name."),
            category_id: fields.category_id,
            creator_range: s.object("Creator count range.", bounds, { required: [] }),
            creator_uid: s.string("Creator UID."),
            creator_unique_id: s.string("Creator handle."),
            is_fully_managed: fields.is_fully_managed,
            is_local: s.boolean("Whether the shop is local."),
            rating_range: s.object("Shop rating range.", bounds, { required: [] }),
            region: fields.region,
            seller_id: fields.seller_id,
            shop_name: s.string("Shop name."),
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
    name: "shop_video_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze videos promoting a shop's products.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            seller_id: fields.seller_id,
            ...periodFields,
            is_ad: fields.is_ad,
            publish_time_range_days: s.integer("Video publish age in days."),
          },
          { required: ["seller_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
];
