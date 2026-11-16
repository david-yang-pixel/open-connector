import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { bounds, fields, pagination, periodFields, productFilter, rankingFields, resultSchema } from "./schemas.ts";

const productPeriodFilter = s.object(
  "Filter parameters.",
  { product_id: fields.product_id, ...periodFields },
  { required: ["product_id"] },
);
export const productActions: ActionDefinition[] = [
  defineProviderAction("fastmoss_mcp", {
    name: "product_category_info",
    operationType: "read",
    requiredScopes: [],
    description: "Read the product category tree. Use search_category_by_words to resolve category names.",
    inputSchema: s.object("FastMoss request parameters.", {}),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_creator_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze the creators selling a product, including audience and sales contributions.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      { filter: productFilter, ...pagination },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_detail_info",
    operationType: "read",
    requiredScopes: [],
    description: "Read a product's price, shop, ratings, logistics and media.",
    inputSchema: s.object("FastMoss request parameters.", { filter: productFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_investment",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a product's advertising spend, ROAS and paid-traffic trends.",
    inputSchema: s.object("FastMoss request parameters.", { filter: productPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_overview",
    operationType: "read",
    requiredScopes: [],
    description: "Read a product's sales channels, momentum and paid-versus-organic performance.",
    inputSchema: s.object("FastMoss request parameters.", { filter: productPeriodFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_rank_new_listed",
    operationType: "read",
    requiredScopes: [],
    description: "Rank recently listed products by sales performance in a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            category_id: fields.category_id,
            ...rankingFields,
            region: fields.region,
            is_cross_border: fields.is_cross_border,
            is_fully_managed: fields.is_fully_managed,
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
    name: "product_rank_top_selling",
    operationType: "read",
    requiredScopes: [],
    description: "Rank bestselling products in a market or category for a completed period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            category_id: fields.category_id,
            ...rankingFields,
            region: fields.region,
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
    name: "product_review_list",
    operationType: "read",
    requiredScopes: [],
    description: "Read one page of product reviews and buyer feedback.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            product_id: fields.product_id,
            time_range_days: periodFields.time_range_days,
          },
          { required: ["product_id"] },
        ),
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_sales_trend",
    operationType: "read",
    requiredScopes: [],
    description: "Read daily product GMV and units sold for a selected period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            product_id: fields.product_id,
            time_range_days: periodFields.time_range_days,
          },
          { required: ["product_id", "time_range_days"] },
        ),
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_search",
    operationType: "read",
    requiredScopes: [],
    description: "Find products by keyword, category, price, sales and fulfilment filters.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        keywords: fields.keywords,
        ...pagination,
        filter: s.object(
          "Filter parameters.",
          {
            category_path: fields.category_path,
            product_id: fields.product_id,
            region: fields.region,
            shop_type: s.integer("Shop type: 1 local, 2 cross-border; deprecated."),
            commission_rate_range: s.object("Commission rate range.", bounds, { required: [] }),
            creator_count_range: s.object("Promoting creator count range.", bounds, { required: [] }),
            day28_gmv_range: s.object("GMV range over the last 28 days.", bounds, { required: [] }),
            day28_units_sold_range: s.object("Units sold range over the last 28 days.", bounds, { required: [] }),
            day7_gmv_range: s.object("GMV range over the last 7 days.", bounds, { required: [] }),
            day7_units_sold_range: s.object("Units sold range over the last 7 days.", bounds, { required: [] }),
            floor_price_range: s.object("Minimum product price range.", bounds, { required: [] }),
            total_gmv_range: s.object("Cumulative GMV range.", bounds, { required: [] }),
            units_sold_range: s.object("Units sold range.", bounds, { required: [] }),
            is_cross_border: fields.is_cross_border,
            is_fully_managed: fields.is_fully_managed,
            is_free_shipping: s.boolean("Whether shipping is free."),
            is_local_warehouse: s.boolean("Whether fulfilment uses a local warehouse."),
            is_new_listed: s.boolean("Whether the product was recently listed."),
            is_sshop: s.boolean("Whether it is fully managed."),
            is_top_selling: s.boolean("Whether the product is a bestseller."),
          },
          { required: [] },
        ),
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_sku",
    operationType: "read",
    requiredScopes: [],
    description: "Read product SKU sales and inventory shares.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            product_id: fields.product_id,
            time_range_days: periodFields.time_range_days,
          },
          { required: ["product_id"] },
        ),
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "product_video_list",
    operationType: "read",
    requiredScopes: [],
    description: "List videos promoting a product, optionally filtered by publish time and ad traffic.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            product_id: fields.product_id,
            time_range_days: periodFields.time_range_days,
            create_time_range: fields.create_time_range,
            is_ad: fields.is_ad,
          },
          { required: ["product_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
];
