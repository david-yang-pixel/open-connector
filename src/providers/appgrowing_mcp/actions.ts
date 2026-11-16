import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "appgrowing_mcp";
const resultSchema = s.requiredObject("The AppGrowing Global MCP tool result.", {
  result: s.unknown(
    "Structured MCP content when available; otherwise the complete MCP content envelope. Data availability and Credits depend on the connected AppGrowing Global account.",
  ),
});
const category = s.array(
  "Store categories for the selected product type; obtain IDs from filterOptions.",
  s.nullableInteger("Store category ID."),
);
const appStyle = s.array(
  "App styles for the selected product type; obtain IDs from filterOptions.",
  s.nullableInteger("App style ID."),
);
const area = s.array("Countries to include; obtain codes from filterOptions.", s.nullableString("Country code."));
const page = s.integer("Page number, starting at 1. Each page contains up to 100 results.", { minimum: 1 });

const creativeSearchInput = s.object(
  "Advertising creative filters. Omit filters that do not apply to the selected product type.",
  {
    purpose: s.withEnum(s.integer("Promoted product: 1 game, 2 app, 3 website."), [1, 2, 3]),
    startDate: s.date("First date to include."),
    endDate: s.date("Last date to include."),
    isAllDate: s.integer("Use 1 to search all dates, or 0 to use the date range."),
    category,
    resourceElement: s.array(
      "Visual element tags for games or apps.",
      s.nullableInteger("Visual element tag ID from filterOptions."),
    ),
    appStyle,
    media: s.array(
      "Advertising channels for the selected product type.",
      s.nullableInteger("Media channel ID from filterOptions."),
    ),
    area,
    format: s.array(
      "Advertising formats for the selected product type.",
      s.nullableInteger("Ad format ID from filterOptions."),
    ),
    platform: s.array(
      "Promotion platforms for games or apps.",
      s.nullableInteger("Promotion platform ID from filterOptions."),
    ),
    language: s.array("Creative languages.", s.nullableString("Language value from filterOptions.")),
    videoTime: s.integer("Video duration filter ID from filterOptions, not seconds."),
    minDuration: s.string("Minimum advertising days as a numeric string.", { pattern: "^[0-9]*$" }),
    maxDuration: s.string("Maximum advertising days as a numeric string.", { pattern: "^[0-9]*$" }),
    accurateSearch: s.integer("Use 1 for an exact ordered keyword match, or 0 for broad matching."),
    isNew: s.integer("Use 1 for new creatives only, or 0 to include existing creatives."),
    isNewAd: s.integer("Use 1 for new advertisements only, or 0 to include existing advertisements."),
    resolution: s.integer("Use 1 for high-definition creatives, or 0 to include other resolutions."),
    keyword: s.string("Search keyword."),
    order: s.stringEnum("Sort order.", [
      "_score_desc",
      "max_dt_desc",
      "max_dt",
      "min_dt_desc",
      "min_dt",
      "cnt_ad_id_desc",
      "cnt_dt_desc",
      "cnt_dt",
      "impression_inc_2y_desc",
      "similar_cnt_desc",
    ]),
    page,
    isCreative: s.integer("Use 1 for innovative game or app creatives, or 0 for other creatives."),
    gender: s.array("Audience genders for games or apps.", s.nullableInteger("Gender: 1 male, 2 female, 3 unknown.")),
    ageRange: s.array(
      "Audience age groups for games or apps.",
      s.nullableString("Age group: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64 or 65+."),
    ),
    isW2a: s.integer("Use 1 for web-to-app promotion; omit to leave it unfiltered."),
    excludeW2a: s.integer("For games or apps, use 0 with isW2a=1 or 1 with isW2a=0; otherwise omit."),
    campaignTypeCombine: s.integer("Use 1 when filtering game or app promotion types; otherwise omit."),
    campaignType: s.array(
      "Game or app promotion types.",
      s.nullableInteger(
        "Promotion type: 101/201/298/295 app downloads, 299 web-to-APK, 297 PWA/H5; omit for web-to-app.",
      ),
    ),
    platformCampaignType: s.array(
      "Platform-specific promotion types.",
      s.nullableInteger("App platform: 201 Google Play, 295 Galaxy, 298 RuStore, 299 APK, 101 App Store."),
    ),
    appCashWay: s.array(
      "Game or app monetization methods.",
      s.nullable(
        s.stringEnum("Monetization method: ads, purchases, mixed, or subscriptions.", [
          "iaa",
          "iap",
          "iaa_iap",
          "subscribable",
        ]),
      ),
    ),
    materialRatio: s.array("Creative aspect ratios.", s.nullableString("Aspect ratio from filterOptions.")),
    blockIds: s.array("Creative IDs to exclude.", s.nullableString("Creative ID.")),
    blockAppIds: s.array("Promoted product IDs to exclude.", s.nullableString("Product ID.")),
    isPre: s.integer("Use 1 for games with preregistration campaigns, or 0 for other games."),
    asr: s.integer("Use 1 for narrated creatives, or 0 for creatives without narration."),
    asrLanguage: s.string("Narration language from filterOptions."),
    searchDsl: s.array(
      "Field-level search conditions. The upstream equal operator may not narrow results; prefer contain when appropriate.",
      s.nullable(
        s.object(
          "A field-level search condition.",
          {
            key: s.stringEnum("Field to search.", [
              "campaign_name",
              "appid",
              "slogan",
              "asr",
              "brands_name",
              "developer_name",
              "website",
            ]),
            type: s.stringEnum("Matching operator.", ["contain", "exclude", "equal", "notEqual"]),
            value: s.string("Value to match."),
          },
          { required: ["key", "type", "value"] },
        ),
      ),
    ),
    isViolation: s.integer("Use 1 for policy-violating game or app advertisements, or 0 for other advertisements."),
    hasCooperate: s.integer("Use 1 for ads featuring a collaborating creator, or 0 for other ads."),
    marketingWord: s.string("Game or app selling-point word returned by creativeSellingPointTrends."),
    singleArea: s.integer("Use 1 for ads running in a single region, or 0 for other ads."),
    postpage: s.integer("Use 1 to filter original advertising posts, or 0 for other creatives."),
    hasPpid: s.integer("Custom product page filter for games or apps."),
    excludeLowQuality: s.integer(
      "Use 1 to exclude low-quality creatives, or 0 to include them. The provider excludes them by default.",
    ),
  },
  { required: ["purpose", "order"] },
);

const sellingPointInput = s.object(
  "Selling-point trend filters for games and apps.",
  {
    purpose: s.withEnum(s.integer("Promoted product: 1 game, 2 app."), [1, 2]),
    category,
    appStyle,
    area,
    wordAttr: s.array("Selling-point categories.", s.nullableString("Selling-point category from filterOptions.")),
    keyword: s.string("Search keyword."),
    order: s.stringEnum("Sort order.", [
      "adverts_desc",
      "material_cnt_desc",
      "shot_cnt_desc",
      "product_cnt_desc",
      "ratio_desc",
    ]),
    page,
  },
  { required: ["purpose"] },
);

export const appgrowingMcpActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "filterOptions",
    operationType: "read",
    description:
      "List the advertising filters available to your AppGrowing account. Business queries consume account credits.",
    requiredScopes: [],
    inputSchema: s.object("No input is required.", {}),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "creativeResourceUrl",
    operationType: "read",
    description: "Refresh expired creative download links using the resource filenames, including their extensions.",
    requiredScopes: [],
    inputSchema: s.object(
      "Resources whose download links should be refreshed.",
      {
        key: s.array(
          "Resource filenames from expired URLs, not resource IDs.",
          s.nullableString("Resource filename including its extension."),
          { minItems: 1 },
        ),
      },
      { required: ["key"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "searchAdCreatives",
    operationType: "read",
    description:
      "Find global advertising creatives by product, audience and campaign filters. Use filterOptions for valid IDs and page to continue through results.",
    requiredScopes: [],
    inputSchema: creativeSearchInput,
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "creativeSellingPointTrends",
    operationType: "read",
    description: "Compare selling-point trends for games and apps by category, style and country.",
    requiredScopes: [],
    inputSchema: sellingPointInput,
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "creativeAIAnalysisData",
    operationType: "read",
    description:
      "Read narration, selling points and AI analysis for up to 100 creative resources. Pair each resource ID with one of its ad format IDs.",
    requiredScopes: [],
    inputSchema: s.object(
      "Creative resources to analyze.",
      {
        ids: s.array(
          "Resource IDs from material.creative.resource[].id, in their original form.",
          s.string("Creative resource ID."),
          { minItems: 1, maxItems: 100 },
        ),
        format: s.array(
          "One material.format[].id for each resource, in the same order as ids.",
          s.integer("Ad format ID."),
          { minItems: 1, maxItems: 100 },
        ),
      },
      { required: ["ids", "format"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "list_tools",
    operationType: "read",
    description:
      "Discover current AppGrowing Global MCP tools, live argument schemas and behavior annotations for advertising creative, app, publisher and developer research.",
    requiredScopes: [],
    inputSchema: s.requiredObject("No input is required.", {}),
    outputSchema: s.requiredObject("The live AppGrowing Global MCP tool catalog.", {
      tools: s.array(
        "Tools available to the connected AppGrowing Global account.",
        s.object(
          "One AppGrowing Global MCP tool.",
          {
            name: s.nonEmptyString("The exact tool name."),
            description: s.string("The current official tool description."),
            annotations: s.looseObject("Official MCP behavior annotations."),
            inputSchema: s.looseObject("The current JSON Schema for tool arguments."),
          },
          { optional: ["description", "annotations"] },
        ),
      ),
    }),
    followUpActions: ["appgrowing_mcp.call_tool"],
  }),
  defineProviderAction(service, {
    name: "call_tool",
    operationType: "destructive",
    description:
      "Call any current AppGrowing Global MCP tool after inspecting list_tools. Arguments must match the live schema. Calls may consume AppGrowing credits; inspect behavior annotations before invoking newly added tools.",
    requiredScopes: [],
    inputSchema: s.object(
      "Call a live AppGrowing Global MCP tool.",
      {
        toolName: s.nonEmptyString("The exact tool name returned by list_tools."),
        arguments: s.looseObject("Arguments matching the selected tool's live input schema."),
      },
      { optional: ["arguments"] },
    ),
    outputSchema: resultSchema,
  }),
];
