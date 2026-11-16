import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { managementActions } from "./management-actions.ts";
import { reportingActions } from "./reporting-actions.ts";
import {
  siteInput,
  siteUrl,
  siteSchema,
  trafficSchema,
  querySchema,
  crawlSchema,
  issueSchema,
  feedSchema,
  quotaSchema,
  submittedSchema,
} from "./schemas.ts";

const service = "bing_webmaster";

export const bingWebmasterActions: readonly ActionDefinition[] = [
  ...reportingActions,
  ...managementActions,
  defineProviderAction(service, {
    name: "list_sites",
    description: "List the sites registered in the Bing Webmaster account, including unverified sites.",
    operationType: "read",
    inputSchema: s.object("No input is required.", {}),
    outputSchema: s.object("The Bing Webmaster API result.", {
      sites: s.array("The records returned by Bing.", siteSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_rank_and_traffic_stats",
    description: "Get daily site impressions and clicks across Bing search verticals.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      stats: s.array("The records returned by Bing.", trafficSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_query_stats",
    description: "Get traffic and position statistics for top search queries. Bing updates this report weekly.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      stats: s.array("The records returned by Bing.", querySchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_page_stats",
    description: "Get traffic and position statistics for top pages. The Query field contains the page URL.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      stats: s.array("The records returned by Bing.", querySchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_crawl_stats",
    description: "Get daily crawl statistics for the last six months.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      stats: s.array("The records returned by Bing.", crawlSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_crawl_issues",
    description: "List URLs with crawl issues. Resolved issues may take several days to disappear.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      issues: s.array("The records returned by Bing.", issueSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "list_sitemaps",
    description: "List top-level sitemaps and feeds registered for a site.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", {
      sitemaps: s.array("The records returned by Bing.", feedSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_url_submission_quota",
    description: "Get the remaining URL submission quota before submitting URLs.",
    operationType: "read",
    inputSchema: siteInput,
    outputSchema: s.object("The Bing Webmaster API result.", { quota: quotaSchema }),
  }),
  defineProviderAction(service, {
    name: "submit_sitemap",
    description: "Submit a sitemap, RSS 2.0, Atom 0.3, Atom 1.0, or text feed URL to Bing.",
    operationType: "write",
    inputSchema: s.object("The site and URLs to submit.", {
      siteUrl,
      feedUrl: s.string("The sitemap or feed URL for Bing to fetch.", { format: "uri" }),
    }),
    outputSchema: submittedSchema,
  }),
  defineProviderAction(service, {
    name: "submit_url",
    description: "Submit one URL to Bing for crawling, subject to the available submission quota.",
    operationType: "write",
    inputSchema: s.object("The site and URLs to submit.", {
      siteUrl,
      url: s.string("The page URL to submit.", { format: "uri" }),
    }),
    outputSchema: submittedSchema,
  }),
  defineProviderAction(service, {
    name: "submit_url_batch",
    description: "Submit up to 500 URLs to Bing in one request, subject to the available submission quota.",
    operationType: "write",
    inputSchema: s.object("The site and URLs to submit.", {
      siteUrl,
      urlList: s.array("Between 1 and 500 page URLs to submit.", s.string("A page URL to submit.", { format: "uri" }), {
        minItems: 1,
        maxItems: 500,
      }),
    }),
    outputSchema: submittedSchema,
  }),
];
