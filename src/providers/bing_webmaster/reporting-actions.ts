import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import {
  blockedUrlOutput,
  countrySettingsOutput,
  crawlSettingsOutput,
  detailedQueryOutput,
  feedSchema,
  fetchedDetailsOutput,
  fetchedOutput,
  filterInput,
  keywordStatsOutput,
  linkCountsOutput,
  linkDetailsOutput,
  queryParameterOutput,
  querySchema,
  quotaSchema,
  siteMoveOutput,
  siteRoleOutput,
  siteUrl,
  trafficSchema,
  urlInfoOutput,
  urlTrafficOutput,
} from "./schemas.ts";

export const reportingActions: readonly ActionDefinition[] = [
  defineProviderAction("bing_webmaster", {
    name: "get_page_query_stats",
    description: "Get search queries and traffic for a specific page.",
    operationType: "read",
    inputSchema: s.object("The input for GetPageQueryStats.", {
      siteUrl: siteUrl,
      page: s.string("The page URL.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of GetPageQueryStats.", {
      stats: s.array("The records returned by Bing.", querySchema),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_query_page_stats",
    description: "Get page statistics for a search query.",
    operationType: "read",
    inputSchema: s.object("The input for GetQueryPageStats.", {
      siteUrl: siteUrl,
      query: s.nonEmptyString("The search query."),
    }),
    outputSchema: s.object("The result of GetQueryPageStats.", {
      stats: s.array("The records returned by Bing.", querySchema),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_query_page_detail_stats",
    description: "Get detailed statistics for a search query and page.",
    operationType: "read",
    inputSchema: s.object("The input for GetQueryPageDetailStats.", {
      siteUrl: siteUrl,
      query: s.nonEmptyString("The search query."),
      page: s.string("The page URL.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of GetQueryPageDetailStats.", {
      stats: s.array("The records returned by Bing.", detailedQueryOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_query_traffic_stats",
    description: "Get traffic statistics for a search query.",
    operationType: "read",
    inputSchema: s.object("The input for GetQueryTrafficStats.", {
      siteUrl: siteUrl,
      query: s.nonEmptyString("The search query."),
    }),
    outputSchema: s.object("The result of GetQueryTrafficStats.", {
      stats: s.array("The records returned by Bing.", trafficSchema),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_url_info",
    description: "Get index and crawl information for a page or directory.",
    operationType: "read",
    inputSchema: s.object("The input for GetUrlInfo.", {
      siteUrl: siteUrl,
      url: s.nonEmptyString(
        "A Bing URL or directory identifier, including values such as example.com or domain:example.com.",
      ),
    }),
    outputSchema: s.object("The result of GetUrlInfo.", {
      info: urlInfoOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_url_traffic_info",
    description: "Get traffic information for a page or directory.",
    operationType: "read",
    inputSchema: s.object("The input for GetUrlTrafficInfo.", {
      siteUrl: siteUrl,
      url: s.nonEmptyString(
        "A Bing URL or directory identifier, including values such as example.com or domain:example.com.",
      ),
    }),
    outputSchema: s.object("The result of GetUrlTrafficInfo.", {
      traffic: urlTrafficOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_child_url_info",
    description: "List child URLs with filters. This read operation uses POST.",
    operationType: "read",
    inputSchema: s.object("The input for GetChildrenUrlInfo.", {
      siteUrl: siteUrl,
      url: s.nonEmptyString(
        "A Bing URL or directory identifier, including values such as example.com or domain:example.com.",
      ),
      page: s.integer("Zero-based result page. Request successive pages until no records remain.", {
        minimum: 0,
      }),
      filterProperties: filterInput,
    }),
    outputSchema: s.object("The result of GetChildrenUrlInfo.", {
      urls: s.array("The records returned by Bing.", urlInfoOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_child_url_traffic_info",
    description: "List traffic information for child URLs.",
    operationType: "read",
    inputSchema: s.object("The input for GetChildrenUrlTrafficInfo.", {
      siteUrl: siteUrl,
      url: s.nonEmptyString(
        "A Bing URL or directory identifier, including values such as example.com or domain:example.com.",
      ),
      page: s.integer("Zero-based result page. Request successive pages until no records remain.", {
        minimum: 0,
      }),
    }),
    outputSchema: s.object("The result of GetChildrenUrlTrafficInfo.", {
      urls: s.array("The records returned by Bing.", urlTrafficOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_crawl_settings",
    description: "Read the current crawl settings.",
    operationType: "read",
    inputSchema: s.object("The input for GetCrawlSettings.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetCrawlSettings.", {
      settings: crawlSettingsOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_fetched_urls",
    description: "List URL fetch records, including fetched and expired flags.",
    operationType: "read",
    inputSchema: s.object("The input for GetFetchedUrls.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetFetchedUrls.", {
      urls: s.array("The records returned by Bing.", fetchedOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_fetched_url_details",
    description: "Read the document, headers and status of a fetched URL.",
    operationType: "read",
    inputSchema: s.object("The input for GetFetchedUrlDetails.", {
      siteUrl: siteUrl,
      url: s.string("The fetched page URL.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of GetFetchedUrlDetails.", {
      details: fetchedDetailsOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_link_counts",
    description: "List page inbound link counts with pagination.",
    operationType: "read",
    inputSchema: s.object("The input for GetLinkCounts.", {
      siteUrl: siteUrl,
      page: s.integer("Zero-based result page. Request successive pages until no records remain.", {
        minimum: 0,
      }),
    }),
    outputSchema: s.object("The result of GetLinkCounts.", {
      links: linkCountsOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_url_links",
    description: "List inbound links and anchor text for a page.",
    operationType: "read",
    inputSchema: s.object("The input for GetUrlLinks.", {
      siteUrl: siteUrl,
      link: s.string("The page URL whose inbound links are requested.", { format: "uri" }),
      page: s.integer("Zero-based result page. Request successive pages until no records remain.", {
        minimum: 0,
      }),
    }),
    outputSchema: s.object("The result of GetUrlLinks.", {
      links: linkDetailsOutput,
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_connected_pages",
    description: "List pages connected to the site.",
    operationType: "read",
    inputSchema: s.object("The input for GetConnectedPages.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetConnectedPages.", {
      pages: s.array(
        "The records returned by Bing.",
        s.looseObject("An upstream Bing record. All returned fields are preserved."),
      ),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_sitemap_details",
    description: "List feed details within a sitemap index.",
    operationType: "read",
    inputSchema: s.object("The input for GetFeedDetails.", {
      siteUrl: siteUrl,
      feedUrl: s.string("The sitemap index URL.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of GetFeedDetails.", {
      sitemaps: s.array("The records returned by Bing.", feedSchema),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_content_submission_quota",
    description: "Get the remaining content submission quota.",
    operationType: "read",
    inputSchema: s.object("The input for GetContentSubmissionQuota.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetContentSubmissionQuota.", {
      quota: {
        ...quotaSchema,
        description: "The remaining content submission quota. Additional Bing fields are preserved.",
      },
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_blocked_urls",
    description: "List blocked pages and directories.",
    operationType: "read",
    inputSchema: s.object("The input for GetBlockedUrls.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetBlockedUrls.", {
      blocks: s.array("The records returned by Bing.", blockedUrlOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_page_preview_blocks",
    description: "List active page preview blocks.",
    operationType: "read",
    inputSchema: s.object("The input for GetActivePagePreviewBlocks.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetActivePagePreviewBlocks.", {
      blocks: s.array(
        "The records returned by Bing.",
        s.looseObject("An upstream Bing record. All returned fields are preserved."),
      ),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_deep_link_blocks",
    description: "List deep link blocking rules.",
    operationType: "read",
    inputSchema: s.object("The input for GetDeepLinkBlocks.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetDeepLinkBlocks.", {
      blocks: s.array(
        "The records returned by Bing.",
        s.looseObject("An upstream Bing record. All returned fields are preserved."),
      ),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_query_parameters",
    description: "List URL query parameter normalization rules.",
    operationType: "read",
    inputSchema: s.object("The input for GetQueryParameters.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetQueryParameters.", {
      parameters: s.array("The records returned by Bing.", queryParameterOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_country_region_settings",
    description: "List country and region targeting settings.",
    operationType: "read",
    inputSchema: s.object("The input for GetCountryRegionSettings.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetCountryRegionSettings.", {
      settings: s.array("The records returned by Bing.", countrySettingsOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_site_moves",
    description: "List site move records.",
    operationType: "read",
    inputSchema: s.object("The input for GetSiteMoves.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of GetSiteMoves.", {
      moves: s.array("The records returned by Bing.", siteMoveOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "get_keyword_stats",
    description: "Get historical keyword statistics for a country and language.",
    operationType: "read",
    inputSchema: s.object("The input for GetKeywordStats.", {
      q: s.nonEmptyString("The keyword to research."),
      country: s.string("The country code used by Bing keyword research."),
      language: s.string("The language code used by Bing keyword research."),
    }),
    outputSchema: s.object("The result of GetKeywordStats.", {
      stats: s.array("The records returned by Bing.", keywordStatsOutput),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "list_site_roles",
    description: "List delegated site roles, optionally including subdomains.",
    operationType: "read",
    inputSchema: s.object("The input for GetSiteRoles.", {
      siteUrl: siteUrl,
      includeAllSubdomains: s.boolean("Whether to include roles for all subdomains."),
    }),
    outputSchema: s.object("The result of GetSiteRoles.", {
      roles: s.array("The records returned by Bing.", siteRoleOutput),
    }),
  }),
];
