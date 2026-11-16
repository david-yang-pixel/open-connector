import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import {
  blockedUrlInput,
  countrySettingsInput,
  crawlSettingsInput,
  siteMoveInput,
  siteRoleInput,
  siteUrl,
} from "./schemas.ts";

export const managementActions: readonly ActionDefinition[] = [
  defineProviderAction("bing_webmaster", {
    name: "add_site",
    description: "Add a site to the account. Ownership must be verified separately.",
    operationType: "write",
    inputSchema: s.object("The input for AddSite.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of AddSite.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_site",
    description: "Remove a site from the account.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveSite.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of RemoveSite.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "save_crawl_settings",
    description: "Save crawl settings for a site, replacing supplied settings.",
    operationType: "destructive",
    inputSchema: s.object("The input for SaveCrawlSettings.", {
      siteUrl: siteUrl,
      crawlSettings: crawlSettingsInput,
    }),
    outputSchema: s.object("The result of SaveCrawlSettings.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_connected_page",
    description: "Add a page connected to the site.",
    operationType: "write",
    inputSchema: s.object("The input for AddConnectedPage.", {
      siteUrl: siteUrl,
      masterUrl: s.string("The connected page URL supplied to Bing as masterUrl.", {
        format: "uri",
      }),
    }),
    outputSchema: s.object("The result of AddConnectedPage.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_sitemap",
    description: "Remove a registered sitemap or feed.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveFeed.", {
      siteUrl: siteUrl,
      feedUrl: s.string("The sitemap or feed URL to remove.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of RemoveFeed.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_blocked_url",
    description: "Block a page or directory, including cache-only and full-removal modes.",
    operationType: "destructive",
    inputSchema: s.object("The input for AddBlockedUrl.", {
      siteUrl: siteUrl,
      blockedUrl: blockedUrlInput,
    }),
    outputSchema: s.object("The result of AddBlockedUrl.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_blocked_url",
    description: "Remove an existing page or directory block.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveBlockedUrl.", {
      siteUrl: siteUrl,
      blockedUrl: blockedUrlInput,
    }),
    outputSchema: s.object("The result of RemoveBlockedUrl.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_page_preview_block",
    description: "Remove a page preview block.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemovePagePreviewBlock.", {
      siteUrl: siteUrl,
      url: s.string("The page URL.", { format: "uri" }),
    }),
    outputSchema: s.object("The result of RemovePagePreviewBlock.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_deep_link_block",
    description: "Block a deep link for a search URL and market.",
    operationType: "destructive",
    inputSchema: s.object("The input for AddDeepLinkBlock.", {
      siteUrl: siteUrl,
      market: s.nonEmptyString("The Bing market identifier, such as en-US."),
      searchUrl: s.string("The search URL supplied to Bing."),
      deepLinkUrl: s.string("The deep link URL to block."),
    }),
    outputSchema: s.object("The result of AddDeepLinkBlock.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_deep_link_block",
    description: "Remove a deep link blocking rule.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveDeepLinkBlock.", {
      siteUrl: siteUrl,
      market: s.nonEmptyString("The Bing market identifier, such as en-US."),
      searchUrl: s.string("The search URL supplied to Bing."),
      deepLinkUrl: s.string("The deep link URL whose block is removed."),
    }),
    outputSchema: s.object("The result of RemoveDeepLinkBlock.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_query_parameter",
    description: "Add a URL normalization parameter.",
    operationType: "write",
    inputSchema: s.object("The input for AddQueryParameter.", {
      siteUrl: siteUrl,
      queryParameter: s.nonEmptyString("The URL parameter name; Bing permits unreserved characters and colon."),
    }),
    outputSchema: s.object("The result of AddQueryParameter.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "set_query_parameter_enabled",
    description: "Enable or disable a URL normalization parameter.",
    operationType: "destructive",
    inputSchema: s.object("The input for EnableDisableQueryParameter.", {
      siteUrl: siteUrl,
      queryParameter: s.nonEmptyString("The URL parameter name."),
      isEnabled: s.boolean("Whether to enable this parameter rule."),
    }),
    outputSchema: s.object("The result of EnableDisableQueryParameter.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_query_parameter",
    description: "Remove a URL normalization parameter.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveQueryParameter.", {
      siteUrl: siteUrl,
      queryParameter: s.nonEmptyString("The URL parameter name."),
    }),
    outputSchema: s.object("The result of RemoveQueryParameter.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_country_region_settings",
    description: "Set country or region targeting for a URL scope.",
    operationType: "destructive",
    inputSchema: s.object("The input for AddCountryRegionSettings.", {
      siteUrl: siteUrl,
      settings: countrySettingsInput,
    }),
    outputSchema: s.object("The result of AddCountryRegionSettings.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_country_region_settings",
    description: "Remove country or region targeting settings.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveCountryRegionSettings.", {
      siteUrl: siteUrl,
      settings: countrySettingsInput,
    }),
    outputSchema: s.object("The result of RemoveCountryRegionSettings.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "submit_site_move",
    description: "Submit a site move between source and destination URLs.",
    operationType: "destructive",
    inputSchema: s.object("The input for SubmitSiteMove.", {
      siteUrl: siteUrl,
      settings: siteMoveInput,
    }),
    outputSchema: s.object("The result of SubmitSiteMove.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "verify_site",
    description: "Attempt to verify site ownership and return whether verification succeeded.",
    operationType: "write",
    inputSchema: s.object("The input for VerifySite.", {
      siteUrl: siteUrl,
    }),
    outputSchema: s.object("The result of VerifySite.", {
      verified: s.boolean("Whether Bing verified ownership of the site."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "add_site_roles",
    description: "Delegate site access to a user with administrator, read-only or read-write permissions.",
    operationType: "destructive",
    inputSchema: s.object("The input for AddSiteRoles.", {
      siteUrl: siteUrl,
      delegatedUrl: s.string("The site URL whose access is delegated.", { format: "uri" }),
      userEmail: s.string("The email of the delegated user.", { format: "email" }),
      authenticationCode: s.nonEmptyString("The site authentication code used for delegation."),
      isAdministrator: s.boolean("Whether to grant administrator access."),
      isReadOnly: s.boolean("Whether to grant read-only access."),
    }),
    outputSchema: s.object("The result of AddSiteRoles.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
  defineProviderAction("bing_webmaster", {
    name: "remove_site_role",
    description: "Remove a delegated site role.",
    operationType: "destructive",
    inputSchema: s.object("The input for RemoveSiteRole.", {
      siteUrl: siteUrl,
      siteRole: siteRoleInput,
    }),
    outputSchema: s.object("The result of RemoveSiteRole.", {
      success: s.boolean("Whether Bing accepted the operation."),
    }),
  }),
];
