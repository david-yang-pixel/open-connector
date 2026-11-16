import type { ProviderActionDefinition } from "../../core/provider-definition.ts";
import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const sifCountries = ["US", "UK", "DE", "CA", "JP", "FR", "ES", "IT", "MX", "AU", "AE", "BR", "SA"] as const;

const summarySortFields = [
  "totalKeywordNum",
  "naturalKeywordNum",
  "brandKeywordNum",
  "vedioKeywordNum",
  "acKeywordNum",
  "erKeywordNum",
  "trKeywordNum",
  "sumScore",
  "totalNfScore",
  "totalSpSocre",
  "totalBrandScore",
  "totalVedioScore",
  "totalAcScore",
  "totalTrScore",
  "totalErScore",
] as const;

const keywordSummaryConditions = [
  "nfPosition",
  "isSpAd",
  "isVedioAd",
  "isBrandAd",
  "isPPCAd",
  "isSearchRecommend",
  "acAd",
  "totalPeriod.in",
  "nfKeywordCnt.total",
  "nfKeywordCnt.in",
  "adKeywordCnt.total",
  "adKeywordCnt.in",
  "allSpKeywordCnt.total",
  "allSpKeywordCnt.in",
  "spKeywordCnt.total",
  "spKeywordCnt.in",
  "recSpKeywordCnt.total",
  "recSpKeywordCnt.in",
  "allSbKeywordCnt.total",
  "allSbKeywordCnt.in",
  "sbKeywordCnt.total",
  "sbKeywordCnt.in",
  "sbvKeywordCnt.total",
  "sbvKeywordCnt.in",
] as const;

const _asinKeywordConditionValues = [
  "nfPosition",
  "isSpAd",
  "isBrandAd",
  "isVedioAd",
  "isAC",
  "isAccurateKw",
  "isAccurateTailKw",
  "isPurchaseKw",
  "isQualityKw",
  "isStableKw",
  "isLossKw",
  "isInvalidKw",
  "isMultiVariantKw",
  "isSearchVolUpKw",
  "isSearchVolDownKw",
  "totalPeriod.in",
  "nfKeywordCnt.total",
  "nfKeywordCnt.in",
  "adKeywordCnt.total",
  "adKeywordCnt.in",
  "allSpKeywordCnt.total",
  "allSpKeywordCnt.in",
  "spKeywordCnt.total",
  "spKeywordCnt.in",
  "recSpKeywordCnt.total",
  "recSpKeywordCnt.in",
  "allSbKeywordCnt.total",
  "allSbKeywordCnt.in",
  "sbKeywordCnt.total",
  "sbKeywordCnt.in",
  "sbvKeywordCnt.total",
  "sbvKeywordCnt.in",
] as const;

const _asinSummaryConditionValues = ["nf", "sp", "sb", "sbv", "ad", "acAd", "totalPeriod.in"] as const;

const countrySchema = s.optional(
  s.stringEnum("The Amazon marketplace code. LinkFox defaults to US when omitted.", sifCountries),
);
const nullableInteger = (description: string) => s.nullable(s.integer(description));
const nullableNumber = (description: string) => s.nullable(s.number(description));
const nullableString = (description: string) => s.nullable(s.string(description));

function resultSchema(description: string, recordDescription: string, extra: Record<string, JsonSchema> = {}) {
  return s.looseRequiredObject(description, {
    code: s.string("The SIF business code; 1 indicates success."),
    msg: nullableString("The SIF response message."),
    total: s.integer("The number of records returned by this request.", { minimum: 0 }),
    data: s.array("The SIF records returned by this request.", s.looseObject(recordDescription)),
    columns: s.array(
      "The LinkFox rendering-column definitions.",
      s.looseObject("A provider-defined rendering-column definition."),
    ),
    type: nullableString("The LinkFox rendering style when provided."),
    title: nullableString("The result title when provided."),
    costTime: nullableInteger("The upstream processing time in milliseconds."),
    costToken: nullableNumber("The LinkFox token cost when provided."),
    ...extra,
  });
}

const asinKeywordsInputBase = s.object("Parameters for reverse-searching one ASIN's SIF keywords.", {
  asin: s.nonEmptyString("The single Amazon ASIN to analyze.", { maxLength: 1000 }),
  country: countrySchema,
  keyword: s.optional(s.string("An optional localized keyword used to filter the result.", { maxLength: 1000 })),
  timePieceType: s.optional(
    s.stringEnum("The analysis period type. LinkFox defaults to latelyDay.", ["latelyDay", "month", "week"]),
  ),
  timePieceValue: s.optional(
    s.string(
      "The period value: 7 or 30 for latelyDay, YYYY-MM for month, or the week-start date in YYYY-MM-DD format.",
      { maxLength: 1000 },
    ),
  ),
  conditions: s.optional(
    s.string(
      "Comma-separated SIF keyword filters, including traffic-position, advertising, conversion, stability, and period-entry markers.",
      { maxLength: 1000 },
    ),
  ),
  sortBy: s.optional(
    s.stringEnum("The keyword sort field. Omit it to use SIF's system order.", [
      "lastRank",
      "adLastRank",
      "updateTime",
      "searchesRank",
      "estSearchesNum",
    ]),
  ),
  desc: s.optional(s.boolean("Whether to sort descending. LinkFox defaults to true.")),
  pageNum: s.optional(s.integer("The one-based result page. LinkFox defaults to 1.", { minimum: 1 })),
  pageSize: s.optional(
    s.integer("The number of keyword records per page. LinkFox defaults to 100.", {
      minimum: 10,
      maximum: 100,
    }),
  ),
});

const asinKeywordsInput = asinKeywordsInputBase;

const dateRangeFields = {
  last7d: s.optional(
    s.boolean(
      "Whether to use the latest seven days. Set false to use startDate and endDate; LinkFox defaults to true.",
    ),
  ),
  startDate: s.optional(s.date("The period start date, used when last7d is false.")),
  endDate: s.optional(s.date("The period end date, paired with startDate.")),
} satisfies Record<string, JsonSchema>;

const asinSummaryInputBase = s.object("Parameters for summarizing SIF traffic sources by ASIN.", {
  searchValue: s.nonEmptyString("One to ten comma-separated Amazon ASINs.", { maxLength: 1000 }),
  country: countrySchema,
  ...dateRangeFields,
  conditions: s.optional(
    s.string("Comma-separated SIF filters: nf, sp, sb, sbv, ad, acAd, or totalPeriod.in.", {
      maxLength: 1000,
    }),
  ),
  sortBy: s.optional(s.stringEnum("The ASIN traffic-summary sort field.", summarySortFields)),
  pageNum: s.optional(s.integer("The one-based result page. LinkFox defaults to 1.", { minimum: 1 })),
  pageSize: s.optional(
    s.integer("The number of ASIN summaries per page. LinkFox defaults to 10000.", {
      minimum: 10,
      maximum: 10_000,
    }),
  ),
  desc: s.optional(s.boolean("Whether to sort descending. LinkFox defaults to true.")),
});

const asinSummaryInput = asinSummaryInputBase;

const keywordOverviewInputBase = s.object("Parameters for retrieving a SIF keyword overview.", {
  keyword: s.nonEmptyString("The localized Amazon keyword to analyze.", { maxLength: 1000 }),
  country: countrySchema,
  ...dateRangeFields,
});

const keywordOverviewInput = keywordOverviewInputBase;

const keywordSummaryInputBase = s.object("Parameters for summarizing competitor traffic sources for one keyword.", {
  searchKeyword: s.nonEmptyString("The localized Amazon keyword to analyze.", {
    maxLength: 1000,
  }),
  country: countrySchema,
  asins: s.optional(s.string("An optional comma-separated ASIN filter.", { maxLength: 1000 })),
  condition: s.optional(
    s.stringEnum(
      "One SIF traffic or period filter, such as nfPosition, isSpAd, isBrandAd, isPPCAd, acAd, or totalPeriod.in.",
      keywordSummaryConditions,
    ),
  ),
  ...dateRangeFields,
  sortBy: s.optional(s.stringEnum("The competitor traffic-summary sort field.", summarySortFields)),
  pageNum: s.optional(s.integer("The one-based result page. LinkFox defaults to 1.", { minimum: 1 })),
  pageSize: s.optional(
    s.integer("The number of competitor ASINs per page. LinkFox defaults to 100.", {
      minimum: 10,
      maximum: 100,
    }),
  ),
  desc: s.optional(s.boolean("Whether to sort descending. LinkFox defaults to true.")),
});

const keywordSummaryInput = keywordSummaryInputBase;

interface SifOperation {
  path: string;
  usage: number;
  action: ProviderActionDefinition;
}

function operation(
  name: string,
  path: string,
  description: string,
  inputSchema: JsonSchema,
  outputSchema: JsonSchema,
): SifOperation {
  return {
    path,
    usage: 9,
    action: defineProviderAction("linkfox", {
      name,
      description,
      operationType: "read",
      inputSchema,
      outputSchema,
    }),
  };
}

export const sifOperations: readonly SifOperation[] = [
  operation(
    "list_sif_asin_keywords",
    "/sif/asinKeywords",
    "Reverse-search one Amazon ASIN's SIF traffic keywords, ranks, traffic shares, and conversion markers through LinkFox.",
    asinKeywordsInput,
    resultSchema(
      "SIF keyword intelligence for one Amazon ASIN.",
      "A SIF keyword record with ranks, search volume, traffic shares, exposure scores, placements, and conversion markers.",
      {
        isParentAsin: s.optional(s.boolean("Whether the queried ASIN is a parent ASIN.")),
        hasVaiants: s.optional(s.boolean("Whether the queried product has variants.")),
        abaCreateDateWeek: nullableString("The latest week represented by the ABA data."),
      },
    ),
  ),
  operation(
    "get_sif_asin_traffic_summary",
    "/sif/asinSummary",
    "Summarize natural, advertising, and recommendation traffic sources for up to ten Amazon ASINs through LinkFox and SIF.",
    asinSummaryInput,
    resultSchema(
      "SIF traffic-source summaries for Amazon ASINs.",
      "A SIF ASIN summary with product context, current and previous exposure scores, traffic shares, keyword counts, entry or exit counts, and source markers.",
      {
        isParentAsin: s.optional(s.boolean("Whether the search target is a parent ASIN.")),
        variantsNum: nullableInteger("The number of variants with traffic keywords."),
        noKeywordVariantsNum: nullableInteger("The number of variants without traffic keywords."),
      },
    ),
  ),
  operation(
    "get_sif_keyword_overview",
    "/sif/keywordOverview",
    "Get SIF search demand, supply-demand ratio, and advertising or recommendation competition for one Amazon keyword through LinkFox.",
    keywordOverviewInput,
    resultSchema(
      "A SIF market-competition overview for one Amazon keyword.",
      "A SIF keyword overview with search volume, supply-demand ratio, product counts by traffic placement, tracked ASIN totals, and data-period timestamps.",
    ),
  ),
  operation(
    "get_sif_keyword_traffic_summary",
    "/sif/keywordSummary",
    "Analyze competitor ASIN traffic shares and natural, advertising, or recommendation exposure for one Amazon keyword through LinkFox and SIF.",
    keywordSummaryInput,
    resultSchema(
      "SIF competitor traffic-source summaries for one Amazon keyword.",
      "A SIF competitor record with product context, overall and queried-keyword exposure scores, traffic shares, and source markers.",
    ),
  ),
];

export const sifActions: readonly ActionDefinition[] = sifOperations.map(({ action }) => action);
