import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "indexed";

const employeeRanges = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+"];
const operatingStatuses = ["active", "acquired", "ipo", "closed", "merged"];

const domainMatchSchema = s.object(
  {
    queried: s.string("The domain as supplied by the caller, after normalization."),
    canonical_domain: s.nullableString("The current website host of the matched company."),
    matched_via: s.stringEnum("Which stored domain matched the query.", [
      "canonical_domain",
      "alias_domain",
      "former_website",
    ]),
  },
  {
    description:
      "Present on domain lookups. When matched_via is not canonical_domain, the company's current website differs from the domain that was queried.",
  },
);

const companyCardSchema = s.object(
  {
    id: s.uuid("The Indexed company id."),
    name: s.string("The company name."),
    slug: s.string("The company slug. Pass it to get_company for more detail."),
    logo_url: s.nullableString("The company logo URL, or null."),
    website: s.nullableString("The company website, or null."),
    short_description: s.nullableString("A one or two sentence description, or null."),
    industries: s.nullable(s.array("Canonical industry labels, or null.", s.string("One industry label."))),
    hq_city: s.nullableString("Headquarters city, or null."),
    hq_country: s.nullableString("Headquarters country, or null."),
    employee_count_range: s.nullableString("Employee count bucket such as 51-200, or null."),
    total_funding_raised: s.nullableInteger(
      "Total disclosed funding in whole USD, grants included. Null when no round has a disclosed amount.",
    ),
    operating_status: s.nullableString("One of active, acquired, ipo, closed, or null when unknown."),
    _revealed: s.boolean("True when this account has already unlocked the company's detail within the last 12 months."),
    domain_match: domainMatchSchema,
  },
  {
    additionalProperties: true,
    optional: [
      "logo_url",
      "website",
      "short_description",
      "industries",
      "hq_city",
      "hq_country",
      "employee_count_range",
      "total_funding_raised",
      "operating_status",
      "domain_match",
    ],
    description: "The public company card. Fields not listed here may also be present.",
  },
);

const searchMetaSchema = s.object(
  {
    total: s.integer("Total number of matches."),
    page: s.integer("The page number returned."),
    limit: s.integer("The page size used."),
    hasMore: s.boolean("Whether another page exists."),
    revealed_count: s.integer("Count of matches this account has already unlocked."),
    unrevealed_count: s.integer("Count of matches this account has not unlocked."),
    all_revealed: s.boolean("Present when reveal_status is unrevealed but every match is already unlocked."),
    resolved_filters: s.unknownObject(
      "Echo of the resolved filter values, such as ai-ml resolved to AI/ML. Present when filters are applied.",
    ),
    next_cursor: s.string("Present on paid plans when more results exist. Pass it back as cursor for the next page."),
  },
  {
    additionalProperties: true,
    optional: ["all_revealed", "resolved_filters", "next_cursor"],
    description: "Pagination and reveal counts for the result set.",
  },
);

const coverageStatusSchema = s.stringEnum(
  "Present when a domain lookup or name search returns no result. queued: recorded for coverage review. not_queued: recording failed, retry later. pending_enrichment: Indexed holds the company but the profile is not yet complete enough to serve. scope_review: Indexed holds it and its fit with coverage scope is under review. not_in_coverage_scope: Indexed holds it but it is outside coverage scope and will not be served. not_found: no match; name misses are reviewed as search demand.",
  ["queued", "not_queued", "pending_enrichment", "scope_review", "not_in_coverage_scope", "not_found"],
);

const companyListOutputSchema = s.object(
  {
    data: s.array("Matching company cards. Empty when nothing matched.", companyCardSchema),
    meta: searchMetaSchema,
    coverage_requested: s.boolean(
      "Present on a zero-result domain lookup. True when the domain was recorded for coverage review, false when recording failed or the company is outside coverage scope. This is not a promise of coverage.",
    ),
    coverage_status: coverageStatusSchema,
  },
  {
    additionalProperties: true,
    optional: ["coverage_requested", "coverage_status"],
    description: "A page of company cards as returned by Indexed.",
  },
);

const lookupItemSchema = s.object(
  {
    domain: s.string("The normalized domain this result belongs to."),
    status: s.stringEnum(
      "hit: a company was found and 1 credit was charged. miss: no company found, nothing charged, the domain is recorded for coverage review. insufficient_credits: the account ran out of credits before this domain, nothing charged.",
      ["hit", "miss", "insufficient_credits"],
    ),
    credits_charged: s.integer("Credits charged for this domain: 1 for a hit, 0 otherwise."),
    data: companyCardSchema,
    coverage_requested: s.boolean("Present on a miss. Whether the domain was recorded for coverage review."),
    coverage_status: coverageStatusSchema,
    coverage_eta_days: s.nullableInteger(
      "Present on a miss. Currently null because manual review has no guaranteed completion date.",
    ),
  },
  {
    additionalProperties: true,
    optional: ["data", "coverage_requested", "coverage_status", "coverage_eta_days"],
    description: "The lookup outcome for one domain. data is present only when status is hit.",
  },
);

const companyProfileSchema = s.object(
  {
    id: s.uuid("The Indexed company id."),
    name: s.string("The company name."),
    slug: s.string("The company slug."),
    website: s.nullableString("The company website, or null."),
    short_description: s.nullableString("A one or two sentence description, or null."),
    industries: s.nullable(s.array("Canonical industry labels, or null.", s.string("One industry label."))),
    hq_country: s.nullableString("Headquarters country, or null."),
    total_funding_raised: s.nullableInteger("Total disclosed funding in whole USD, grants included, or null."),
    operating_status: s.nullableString("One of active, acquired, ipo, closed, or null when unknown."),
  },
  {
    additionalProperties: true,
    optional: ["website", "short_description", "industries", "hq_country", "total_funding_raised", "operating_status"],
    description:
      "The company profile. slim returns identity fields. standard adds all scalar fields plus owners and subsidiaries. full adds valuationEvents (funding rounds with participating investors), technologies and appStack. Amounts are whole USD and a null amount means undisclosed.",
  },
);

const searchInputSchema: JsonSchema = s.object(
  {
    q: s.string("Free text query, for example a company name.", { maxLength: 200 }),
    industries: s.array(
      "Industry filters. Accepts display labels such as Fintech or slugs such as ai-ml. Multiple values match any of them.",
      s.nonEmptyString("One industry label or slug."),
      { minItems: 1 },
    ),
    countries: s.array("Headquarters country names such as United States.", s.nonEmptyString("One country name."), {
      minItems: 1,
    }),
    employees: s.array("Employee count buckets to include.", s.stringEnum("One employee bucket.", employeeRanges), {
      minItems: 1,
    }),
    operatingStatus: s.array(
      "Operating statuses to include.",
      s.stringEnum("One operating status.", operatingStatuses),
      { minItems: 1 },
    ),
    minFunding: s.nonNegativeInteger(
      "Minimum total funding in whole USD, grants included. Funding filters are paid-plan only.",
    ),
    maxFunding: s.nonNegativeInteger(
      "Maximum total funding in whole USD, grants included. Funding filters are paid-plan only.",
    ),
    minCompleteness: s.integer("Minimum data_completeness_score, to skip thin records.", { minimum: 0, maximum: 64 }),
    updatedSince: s.nonEmptyString(
      "Incremental sync: only records modified at or after this ISO 8601 date or timestamp, such as 2026-09-01 or 2026-09-01T00:00:00Z. Combine with cursor for delta pulls.",
    ),
    revealStatus: s.stringEnum("Filter results by whether this account has unlocked them. Defaults to all.", [
      "all",
      "revealed",
      "unrevealed",
    ]),
    sort: s.stringEnum("Sort field. Sorting is part of the paid-plan listing surface.", [
      "total_funding_raised",
      "name",
      "last_funding_date",
      "last_funding_amount",
      "founded_year",
      "data_completeness_score",
    ]),
    order: s.stringEnum("Sort direction.", ["asc", "desc"]),
    page: s.integer("Page number, starting at 1. Free keys can read pages 1 through 3.", { minimum: 1 }),
    limit: s.integer("Results per page. Defaults to 25. Free keys get 10 rows per page.", { minimum: 1, maximum: 100 }),
    cursor: s.nonEmptyString(
      "Paid plans only. The meta.next_cursor value from the previous page, for sequential bulk pulls. When set, page and sort are ignored.",
    ),
  },
  {
    optional: [
      "q",
      "industries",
      "countries",
      "employees",
      "operatingStatus",
      "minFunding",
      "maxFunding",
      "minCompleteness",
      "updatedSince",
      "revealStatus",
      "sort",
      "order",
      "page",
      "limit",
      "cursor",
    ],
    description:
      "Search text and filters. Filter-only listing and sorting are part of the paid-plan surface and can be refused on a free key.",
  },
);

export const indexedActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "lookup_company_by_domain",
    operationType: "read",
    description:
      "Find the company that owns one website domain. Accepts a bare domain or a full URL and matches the registrable domain exactly: stripe.com finds a company whose site is stripe.com or a subdomain of it, never a longer name such as bluestripe.com. A sub-host you send, like app.stripe.com, is not rewritten to its parent, so send the company's main domain. Alias and former domains match too, and domain_match says which. This counts as a standard search: free within the daily search quota, after which paid plans spend 1 credit per page that has results and free plans get a rate-limited error. A miss costs nothing and the domain is recorded for coverage review; coverage_status explains why nothing was returned.",
    inputSchema: s.actionInput(
      { domain: s.nonEmptyString("The website domain or URL, for example stripe.com.") },
      ["domain"],
      "The domain to look up.",
    ),
    outputSchema: companyListOutputSchema,
    followUpActions: ["indexed.get_company"],
  }),
  defineProviderAction(service, {
    name: "lookup_companies_by_domains",
    operationType: "read",
    description:
      "Look up up to 100 website domains in one call. Domains are normalized and deduplicated in first-seen order, and results keep that order. Each hit costs 1 credit. Misses are free and are recorded for coverage review. If credits run out part way through, the remaining domains come back as insufficient_credits without a charge. summary gives the counts and total credits charged.",
    inputSchema: s.actionInput(
      {
        domains: s.array(
          "Website domains or URLs to look up, 1 to 100 items.",
          s.nonEmptyString("One domain or URL.", { maxLength: 500 }),
          { minItems: 1, maxItems: 100 },
        ),
      },
      ["domains"],
      "The domains to look up.",
    ),
    outputSchema: s.looseObject(
      {
        data: s.array("One result per unique domain, in first-seen order.", lookupItemSchema),
        summary: s.looseObject(
          {
            total_requested: s.integer("Unique domains looked up."),
            total_hits: s.integer("Domains that matched a company."),
            total_misses: s.integer("Domains with no match."),
            total_insufficient_credits: s.integer("Domains skipped because credits ran out."),
            total_credits_charged: s.integer("Credits charged for this call."),
          },
          { description: "Counts across the whole call." },
        ),
      },
      { description: "Ordered per-domain results and a summary." },
    ),
    followUpActions: ["indexed.get_company"],
  }),
  defineProviderAction(service, {
    name: "search_companies",
    operationType: "read",
    description:
      "Search company cards by name text and filters such as industry, country, size, operating status and funding range. Standard search is free within the daily search quota. After the quota, paid plans spend 1 credit per page that has results and free plans get a rate-limited error. Results are cards, so use get_company for funding history and stacks. Technology-stack filters are not exposed here because they are billed as a separate premium search.",
    inputSchema: searchInputSchema,
    outputSchema: companyListOutputSchema,
    followUpActions: ["indexed.get_company"],
  }),
  defineProviderAction(service, {
    name: "get_company",
    operationType: "read",
    description:
      "Fetch one company profile by slug. Cost depends on depth: slim is 1 credit (identity fields), standard is 2 credits (all scalar fields, owners and subsidiaries), full is 3 credits (adds funding rounds with investors, valuations, technologies and app stack). Fetching the same company at the same depth again within 12 months is not charged. A 402 means credits are exhausted, which is a billing state and should not be retried.",
    inputSchema: s.actionInput(
      {
        slug: s.stringPattern("^[a-z0-9][a-z0-9-]*[a-z0-9]$", {
          description: "The company slug from a search or lookup result.",
        }),
        depth: s.stringEnum("How much of the profile to return and charge for. Defaults to standard.", [
          "slim",
          "standard",
          "full",
        ]),
      },
      ["slug"],
      "The company to fetch.",
    ),
    outputSchema: s.looseObject({ data: companyProfileSchema }, { description: "The company profile." }),
  }),
];
