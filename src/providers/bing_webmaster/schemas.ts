import type { JsonSchema } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";

export const siteUrl: JsonSchema = s.string(
  "The exact site URL registered in Bing Webmaster Tools, including its scheme.",
  { format: "uri" },
);

export const siteInput: JsonSchema = s.object("The registered site to query.", {
  siteUrl: siteUrl,
});

export const siteSchema: JsonSchema = s.object(
  "A registered site. Additional Bing fields are preserved.",
  {
    Url: s.string("The registered site URL."),
    IsVerified: s.boolean("Whether ownership of the site is verified."),
    AuthenticationCode: s.string("The site ownership verification code."),
    DnsVerificationCode: s.string("The DNS record used to verify site ownership."),
  },
  {
    optional: ["Url", "IsVerified", "AuthenticationCode", "DnsVerificationCode"],
    additionalProperties: true,
  },
);

export const trafficSchema: JsonSchema = s.object(
  "A traffic statistics record. Additional Bing fields are preserved.",
  {
    Date: s.string("The upstream date string, typically /Date(milliseconds-offset)/ in WCF JSON format."),
    Clicks: s.integer("The number of clicks."),
    Impressions: s.integer("The number of impressions."),
  },
  { optional: ["Date", "Clicks", "Impressions"], additionalProperties: true },
);

export const querySchema: JsonSchema = s.object(
  "A query or page statistics record. Additional Bing fields are preserved.",
  {
    Date: s.string("The upstream date string, typically /Date(milliseconds-offset)/ in WCF JSON format."),
    Clicks: s.integer("The number of clicks."),
    Impressions: s.integer("The number of impressions."),
    AvgClickPosition: s.number("The average position of clicked results."),
    AvgImpressionPosition: s.number("The average position of displayed results."),
    Query: s.string("The search query, or the page URL for page statistics."),
  },
  {
    optional: ["Date", "Clicks", "Impressions", "AvgClickPosition", "AvgImpressionPosition", "Query"],
    additionalProperties: true,
  },
);

export const crawlSchema: JsonSchema = s.object(
  "A crawl statistics record. Additional Bing fields are preserved.",
  {
    Date: s.string("The upstream date string, typically /Date(milliseconds-offset)/ in WCF JSON format."),
    AllOtherCodes: s.integer("Responses with other HTTP codes."),
    BlockedByRobotsTxt: s.integer("URLs blocked by robots.txt."),
    Code2xx: s.integer("Responses with 2xx codes."),
    Code301: s.integer("Responses with HTTP 301."),
    Code302: s.integer("Responses with HTTP 302."),
    Code4xx: s.integer("Responses with 4xx codes."),
    Code5xx: s.integer("Responses with 5xx codes."),
    ContainsMalware: s.integer("URLs reported to contain malware."),
    CrawlErrors: s.integer("The number of crawl errors."),
    CrawledPages: s.integer("The number of crawled pages."),
    InIndex: s.integer("The number of indexed pages."),
    InLinks: s.integer("The number of inbound links."),
  },
  {
    optional: [
      "Date",
      "AllOtherCodes",
      "BlockedByRobotsTxt",
      "Code2xx",
      "Code301",
      "Code302",
      "Code4xx",
      "Code5xx",
      "ContainsMalware",
      "CrawlErrors",
      "CrawledPages",
      "InIndex",
      "InLinks",
    ],
    additionalProperties: true,
  },
);

export const issueSchema: JsonSchema = s.object(
  "A URL with crawl issues. Additional Bing fields are preserved.",
  {
    Url: s.string("The affected page URL."),
    HttpCode: s.integer("The HTTP response code."),
    Issues: s.integer("The Bing CrawlIssues flags bitmask."),
    InLinks: s.integer("The number of inbound links."),
  },
  { optional: ["Url", "HttpCode", "Issues", "InLinks"], additionalProperties: true },
);

export const feedSchema: JsonSchema = s.object(
  "A sitemap or feed record. Additional Bing fields are preserved.",
  {
    Url: s.string("The sitemap or feed URL."),
    Compressed: s.boolean("Whether the feed is compressed."),
    FileSize: s.integer("The feed file size in bytes."),
    LastCrawled: s.string("The upstream date string, typically /Date(milliseconds-offset)/ in WCF JSON format."),
    Submitted: s.string("The upstream date string, typically /Date(milliseconds-offset)/ in WCF JSON format."),
    Status: s.string("The feed processing status."),
    Type: s.string("The feed format reported by Bing."),
    UrlCount: s.integer("The number of URLs in the feed."),
  },
  {
    optional: ["Url", "Compressed", "FileSize", "LastCrawled", "Submitted", "Status", "Type", "UrlCount"],
    additionalProperties: true,
  },
);

export const quotaSchema: JsonSchema = s.object(
  "The remaining URL submission quota. Additional Bing fields are preserved.",
  {
    DailyQuota: s.integer("The remaining daily submission quota."),
    MonthlyQuota: s.integer("The remaining monthly submission quota."),
  },
  { optional: ["DailyQuota", "MonthlyQuota"], additionalProperties: true },
);

export const submittedSchema: JsonSchema = s.object("The submission result.", {
  submitted: s.boolean("Whether Bing accepted the submission. This does not guarantee indexing."),
});

export const siteRoleInput: JsonSchema = s.object(
  "The site role record to remove, obtained from list_site_roles.",
  {
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    DelegatedCode: s.string("The delegated site verification code."),
    DelegatedCodeOwnerEmail: s.string("The owner email of the delegated verification code."),
    DelegatorEmail: s.string("The delegating user email."),
    Email: s.string("The user receiving site access."),
    Expired: s.boolean("Whether the delegated access has expired."),
    Role: {
      type: "integer",
      enum: [0, 1, 2],
      description: "User role: 0 administrator, 1 read-only, 2 read-write.",
    },
    Site: s.string("The URL reported by Bing."),
    VerificationSite: s.string("The site used for ownership verification."),
  },
  { optional: ["Date", "DelegatedCodeOwnerEmail", "DelegatorEmail", "Expired"] },
);

export const siteRoleOutput: JsonSchema = s.object(
  "A delegated site role.",
  {
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    DelegatedCode: s.string("The delegated site verification code."),
    DelegatedCodeOwnerEmail: s.string("The owner email of the delegated verification code."),
    DelegatorEmail: s.string("The delegating user email."),
    Email: s.string("The user receiving site access."),
    Expired: s.boolean("Whether the delegated access has expired."),
    Role: {
      type: "integer",
      enum: [0, 1, 2],
      description: "User role: 0 administrator, 1 read-only, 2 read-write.",
    },
    Site: s.string("The URL reported by Bing."),
    VerificationSite: s.string("The site used for ownership verification."),
  },
  {
    optional: [
      "Date",
      "DelegatedCode",
      "DelegatedCodeOwnerEmail",
      "DelegatorEmail",
      "Email",
      "Expired",
      "Role",
      "Site",
      "VerificationSite",
    ],
    additionalProperties: true,
  },
);

export const filterInput: JsonSchema = s.object(
  "Filters for URLs in a directory. Omitted flags use the upstream default.",
  {
    CrawlDateFilter: {
      type: "integer",
      enum: [0, 1, 2, 4],
      description: "Crawl date filter: 0 any, 1 last week, 2 last two weeks, 4 last three weeks.",
    },
    DiscoveredDateFilter: {
      type: "integer",
      enum: [0, 1, 2],
      description: "Discovery date filter: 0 any, 1 last week, 2 last month.",
    },
    DocFlagsFilters: s.integer(
      "Document flags bitmask: 0 any, 1 blocked by robots.txt, 2 malware. Flags may be combined.",
      { minimum: 0, maximum: 3 },
    ),
    HttpCodeFilters: s.integer(
      "HTTP code flags bitmask: 1 2xx, 2 3xx, 4 301, 8 302, 16 4xx, 32 5xx, 64 other; 0 means any.",
      { minimum: 0, maximum: 127 },
    ),
  },
  { optional: ["CrawlDateFilter", "DiscoveredDateFilter", "DocFlagsFilters", "HttpCodeFilters"] },
);

export const urlInfoOutput: JsonSchema = s.object(
  "Index information for a URL or directory.",
  {
    Url: s.string("The URL reported by Bing."),
    AnchorCount: s.integer("The number of anchors."),
    DiscoveryDate: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    DocumentSize: s.integer("The document size reported by Bing."),
    HttpStatus: s.integer("The HTTP status reported by Bing."),
    IsPage: s.boolean("Whether this entry represents a page."),
    LastCrawledDate: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    TotalChildUrlCount: s.integer("The number of child URLs."),
  },
  {
    optional: [
      "Url",
      "AnchorCount",
      "DiscoveryDate",
      "DocumentSize",
      "HttpStatus",
      "IsPage",
      "LastCrawledDate",
      "TotalChildUrlCount",
    ],
    additionalProperties: true,
  },
);

export const urlTrafficOutput: JsonSchema = s.object(
  "Traffic information for a URL or directory.",
  {
    Url: s.string("The URL reported by Bing."),
    Clicks: s.integer("The number of clicks."),
    Impressions: s.integer("The number of impressions."),
    IsPage: s.boolean("Whether this entry represents a page."),
  },
  { optional: ["Url", "Clicks", "Impressions", "IsPage"], additionalProperties: true },
);

export const crawlSettingsInput: JsonSchema = s.object(
  "Crawl settings to save. Read current settings first to avoid overwriting unintended values.",
  {
    CrawlRate: s.array(
      "Hourly crawl rates, in the upstream order.",
      s.integer("The crawl rate byte value.", { minimum: 0, maximum: 255 }),
    ),
    AjaxEnabled: s.boolean("Whether AJAX crawling is enabled, as exposed by the endpoint example."),
    CrawlBoostAvailable: s.boolean("Whether crawl boost is available."),
    CrawlBoostEnabled: s.boolean("Whether crawl boost is enabled."),
  },
  { optional: ["AjaxEnabled", "CrawlBoostAvailable", "CrawlBoostEnabled"] },
);

export const crawlSettingsOutput: JsonSchema = s.object(
  "The current crawl settings.",
  {
    CrawlRate: s.array(
      "Hourly crawl rates, in the upstream order.",
      s.integer("The crawl rate byte value.", { minimum: 0, maximum: 255 }),
    ),
    AjaxEnabled: s.boolean("Whether AJAX crawling is enabled, as exposed by the endpoint example."),
    CrawlBoostAvailable: s.boolean("Whether crawl boost is available."),
    CrawlBoostEnabled: s.boolean("Whether crawl boost is enabled."),
  },
  {
    optional: ["CrawlRate", "AjaxEnabled", "CrawlBoostAvailable", "CrawlBoostEnabled"],
    additionalProperties: true,
  },
);

export const fetchedOutput: JsonSchema = s.object(
  "A URL fetch record.",
  {
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    Expired: s.boolean("Whether this fetch entry has expired."),
    Fetched: s.boolean("Whether the URL has been fetched."),
    Url: s.string("The URL reported by Bing."),
  },
  { optional: ["Date", "Expired", "Fetched", "Url"], additionalProperties: true },
);

export const fetchedDetailsOutput: JsonSchema = s.object(
  "Details of a fetched URL.",
  {
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    Document: s.string("The fetched document returned by Bing."),
    Headers: s.string("The fetched response headers returned by Bing."),
    Status: s.string("The upstream fetch status string; no undocumented terminal states are inferred."),
    Url: s.string("The URL reported by Bing."),
  },
  { optional: ["Date", "Document", "Headers", "Status", "Url"], additionalProperties: true },
);

export const keywordStatsOutput: JsonSchema = s.object(
  "A keyword history record.",
  {
    BroadImpressions: s.integer("Broad-match keyword impressions."),
    Impressions: s.integer("Keyword impressions."),
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    Query: s.string("The keyword text."),
  },
  { optional: ["BroadImpressions", "Impressions", "Date", "Query"], additionalProperties: true },
);

export const linkCountOutput: JsonSchema = s.object(
  "An inbound link count for a page.",
  {
    Count: s.integer("The number of inbound links."),
    Url: s.string("The URL reported by Bing."),
  },
  { optional: ["Count", "Url"], additionalProperties: true },
);

export const linkDetailOutput: JsonSchema = s.object(
  "An inbound link and its anchor text.",
  {
    AnchorText: s.string("The anchor text of the inbound link."),
    Url: s.string("The URL reported by Bing."),
  },
  { optional: ["AnchorText", "Url"], additionalProperties: true },
);

export const linkCountsOutput: JsonSchema = s.object(
  "A page of inbound link counts.",
  {
    Links: s.array("The page link counts.", linkCountOutput),
    TotalPages: s.integer("The total number of result pages."),
  },
  { optional: ["Links", "TotalPages"], additionalProperties: true },
);

export const linkDetailsOutput: JsonSchema = s.object(
  "A page of inbound link details.",
  {
    Details: s.array("The inbound links.", linkDetailOutput),
    TotalPages: s.integer("The total number of result pages."),
  },
  { optional: ["Details", "TotalPages"], additionalProperties: true },
);

export const blockedUrlInput: JsonSchema = s.object(
  "The URL block record. Preserve returned metadata when removing an existing block.",
  {
    Url: s.string("The URL reported by Bing."),
    EntityType: {
      type: "integer",
      enum: [0, 1],
      description: "Blocked entity: 0 page, 1 directory.",
    },
    RequestType: {
      type: "integer",
      enum: [0, 1],
      description: "Removal request: 0 cached copy only, 1 full removal.",
    },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    DaysToExpire: s.integer("Days until the block expires, as supplied by Bing."),
  },
  { optional: ["Date", "DaysToExpire"] },
);

export const blockedUrlOutput: JsonSchema = s.object(
  "A blocked URL record.",
  {
    Url: s.string("The URL reported by Bing."),
    EntityType: {
      type: "integer",
      enum: [0, 1],
      description: "Blocked entity: 0 page, 1 directory.",
    },
    RequestType: {
      type: "integer",
      enum: [0, 1],
      description: "Removal request: 0 cached copy only, 1 full removal.",
    },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    DaysToExpire: s.integer("Days until the block expires, as supplied by Bing."),
  },
  {
    optional: ["Url", "EntityType", "RequestType", "Date", "DaysToExpire"],
    additionalProperties: true,
  },
);

export const queryParameterOutput: JsonSchema = s.object(
  "A URL normalization parameter.",
  {
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    IsEnabled: s.boolean("Whether this normalization rule is enabled."),
    Parameter: s.string("The URL query parameter name."),
    Source: s.integer("The rule source reported by Bing."),
  },
  { optional: ["Date", "IsEnabled", "Parameter", "Source"], additionalProperties: true },
);

export const countrySettingsInput: JsonSchema = s.object(
  "Country or region targeting settings.",
  {
    Url: s.string("The URL reported by Bing."),
    TwoLetterIsoCountryCode: s.string("The two-letter ISO country code."),
    Type: {
      type: "integer",
      enum: [0, 1, 2, 3],
      description: "Target scope: 0 page, 1 directory, 2 domain, 3 subdomain.",
    },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
  },
  { optional: ["Date"] },
);

export const countrySettingsOutput: JsonSchema = s.object(
  "A country or region targeting record.",
  {
    Url: s.string("The URL reported by Bing."),
    TwoLetterIsoCountryCode: s.string("The two-letter ISO country code."),
    Type: {
      type: "integer",
      enum: [0, 1, 2, 3],
      description: "Target scope: 0 page, 1 directory, 2 domain, 3 subdomain.",
    },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
  },
  { optional: ["Url", "TwoLetterIsoCountryCode", "Type", "Date"], additionalProperties: true },
);

export const siteMoveInput: JsonSchema = s.object(
  "Settings for a site move.",
  {
    SourceUrl: s.string("The source URL of the site move."),
    TargetUrl: s.string("The destination URL of the site move."),
    MoveScope: {
      type: "integer",
      enum: [0, 1, 2],
      description: "Move scope: 0 domain, 1 host, 2 directory.",
    },
    MoveType: { type: "integer", enum: [0, 1], description: "Move type: 0 local, 1 global." },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
  },
  { optional: ["Date"] },
);

export const siteMoveOutput: JsonSchema = s.object(
  "A site move record.",
  {
    SourceUrl: s.string("The source URL of the site move."),
    TargetUrl: s.string("The destination URL of the site move."),
    MoveScope: {
      type: "integer",
      enum: [0, 1, 2],
      description: "Move scope: 0 domain, 1 host, 2 directory.",
    },
    MoveType: { type: "integer", enum: [0, 1], description: "Move type: 0 local, 1 global." },
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
  },
  {
    optional: ["SourceUrl", "TargetUrl", "MoveScope", "MoveType", "Date"],
    additionalProperties: true,
  },
);

export const detailedQueryOutput: JsonSchema = s.object(
  "Statistics for a specific query and page.",
  {
    Clicks: s.integer("The number of clicks."),
    Impressions: s.integer("The number of impressions."),
    Date: s.string("The date string in the upstream WCF /Date(milliseconds-offset)/ format."),
    Position: s.integer("The search result position."),
  },
  { optional: ["Clicks", "Impressions", "Date", "Position"], additionalProperties: true },
);
