import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { agencyFilter, fields, pagination, periodFields, rankingFields, resultSchema } from "./schemas.ts";

const querySchema = s.anyOf("Search query or queries.", [
  s.string("Search query."),
  s.array("Search queries.", s.string("One search query.")),
]);
export const researchActions: ActionDefinition[] = [
  defineProviderAction("fastmoss_mcp", {
    name: "agency_creator_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze creators associated with an MCN agency.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      { filter: agencyFilter, ...pagination },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_product_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze an MCN agency's product performance.",
    inputSchema: s.object("FastMoss request parameters.", { filter: agencyFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_product_list",
    operationType: "read",
    requiredScopes: [],
    description: "List an MCN agency's products by category and price.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            agency_id: fields.agency_id,
            time_range_days: periodFields.time_range_days,
            product_category_id: fields.product_category_id,
            minimum_price: s.number("Minimum product price."),
            maximum_price: s.number("Maximum product price."),
          },
          { required: ["agency_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_profile_overview",
    operationType: "read",
    requiredScopes: [],
    description: "Read an MCN agency's profile and performance overview.",
    inputSchema: s.object("FastMoss request parameters.", { filter: agencyFilter }, { required: ["filter"] }),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_rank_top",
    operationType: "read",
    requiredScopes: [],
    description: "Rank MCN agencies for a completed week or month.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object("Filter parameters.", { ...rankingFields, region: fields.region }, { required: [] }),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_search",
    operationType: "read",
    requiredScopes: [],
    description: "Search MCN agencies by name and region.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            region: fields.region,
            search_keyword: s.string("Agency name or search keyword."),
          },
          { required: [] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "agency_shop_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze shops associated with an MCN agency.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            agency_id: fields.agency_id,
            product_category_id: fields.product_category_id,
            time_range_days: periodFields.time_range_days,
          },
          { required: ["agency_id"] },
        ),
        ...pagination,
      },
      { required: ["filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "market_category_analysis",
    operationType: "read",
    requiredScopes: [],
    description: "Analyze a market category by region and period.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        analysis_type: s.string("Category analysis type."),
        filter: s.object(
          "Filter parameters.",
          { category_id: fields.category_id, ...rankingFields, region: fields.region },
          { required: [] },
        ),
        lang: fields.lang,
      },
      { required: ["analysis_type", "filter"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "market_category_author_sales_matrix",
    operationType: "read",
    requiredScopes: [],
    description: "Read the creator sales matrix for a market category.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        filter: s.object(
          "Filter parameters.",
          {
            category_id: fields.category_id,
            date_value: rankingFields.date_value,
            region: fields.region,
            sold_type: s.integer("Sales metric selector."),
          },
          { required: [] },
        ),
        lang: fields.lang,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "market_category_ranking",
    operationType: "read",
    requiredScopes: [],
    description: "Rank market categories by performance for a completed period.",
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
          { required: [] },
        ),
        lang: fields.lang,
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "credit_usage_summary",
    operationType: "read",
    requiredScopes: [],
    description: "Read the connected account's FastMoss Credits usage.",
    inputSchema: s.object("No input is required.", {}),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "fastmoss_detail_url_examples",
    operationType: "read",
    requiredScopes: [],
    description: "Read FastMoss detail-page URL examples for research results.",
    inputSchema: s.object("No input is required.", {}),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "search_category_by_words",
    operationType: "read",
    requiredScopes: [],
    description: "Resolve category names or keywords to FastMoss category IDs.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        query: querySchema,
        max_total_results: s.integer("Maximum total results."),
        top_k: s.integer("Number of matches per query."),
      },
      { required: ["query"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "search_fastmoss_documents",
    operationType: "read",
    requiredScopes: [],
    description: "Search FastMoss documentation for metrics, filters and research guidance.",
    inputSchema: s.object(
      "FastMoss request parameters.",
      {
        query: querySchema,
        source_file: s.string("Documentation source file filter."),
        top_k: s.integer("Number of matches per query."),
      },
      { required: ["query"] },
    ),
    outputSchema: resultSchema,
  }),
];
