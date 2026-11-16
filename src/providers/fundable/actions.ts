import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const financingTypesSchema = s.array(
  "Financing types with optional modifiers (pre, extension)",
  s.object(
    "Financing types item details.",
    {
      type: s.stringEnum("Financing type.", [
        "SERIES_A",
        "SERIES_B",
        "SERIES_C",
        "SERIES_D",
        "SERIES_E",
        "SERIES_F",
        "SERIES_G",
        "SERIES_H",
        "SERIES_I",
        "SERIES_J",
        "SERIES_K",
        "SERIES_L",
        "SERIES_M",
        "SEED",
        "SAFE",
        "CONVERTIBLE_NOTE",
        "EQUITY",
        "PREFERRED",
        "SECONDARY_MARKET",
        "DEBT_FINANCING",
        "GRANT",
        "NON_EQUITY_ASSISTANCE",
        "CROWDFUNDING",
        "INITIAL_COIN_OFFERING",
        "FUNDING_ROUND",
      ]),
      pre: s.boolean({
        description: "Pre-round modifier (e.g., Pre-Seed, Pre-Series A)",
        default: false,
      }),
      extension: s.boolean({ description: "Extension round modifier", default: false }),
    },
    { required: ["type"] },
  ),
);
const locationsSchema = s.array(
  "Location permalinks. Use /location/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
  s.string("Locations item.", { minLength: 1 }),
);
const industriesSchema = s.array(
  "Industry permalinks. Use /industry/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
  s.string("Industries item.", { minLength: 1 }),
);
const superCategoriesSchema = s.array(
  "Super category permalinks (automatically includes related industries). Use /industry/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
  s.string("Super categories item.", { minLength: 1 }),
);
const employeeCountSchema = s.array(
  "Employee count ranges. Valid: 1-10, 11-50, 51-100, 101-250, 251-500, 501-1000, 1001-5000, 5001-10000, 10001+",
  s.stringEnum("Employee count item.", [
    "1-10",
    "11-50",
    "51-100",
    "101-250",
    "251-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10001+",
  ]),
);
const pageSchema = s.integer("Page number (0-based)", { minimum: 0, default: 0 });
const pageSizeSchema = s.integer("Number of results per page", {
  minimum: 1,
  maximum: 500,
  default: 10,
});
const dealSchema = s.object(
  "Deal details.",
  {
    id: s.string("Unique identifier for the deal", { format: "uuid" }),
    round_type: s.nullable(
      s.stringEnum("Type of funding round", [
        "SERIES_A",
        "SERIES_B",
        "SERIES_C",
        "SERIES_D",
        "SERIES_E",
        "SERIES_F",
        "SERIES_G",
        "SERIES_H",
        "SERIES_I",
        "SERIES_J",
        "SERIES_K",
        "SERIES_L",
        "SERIES_M",
        "SEED",
        "SAFE",
        "CONVERTIBLE_NOTE",
        "EQUITY",
        "PREFERRED",
        "SECONDARY_MARKET",
        "DEBT_FINANCING",
        "GRANT",
        "NON_EQUITY_ASSISTANCE",
        "CROWDFUNDING",
        "INITIAL_COIN_OFFERING",
        "FUNDING_ROUND",
      ]),
    ),
    extension: s.nullable(s.boolean("Whether this is an extension round")),
    intermediate: s.nullable(
      s.stringEnum("Intermediate round designation", [
        "PLUS",
        "NONE",
        "ONE",
        "TWO",
        "THREE",
        "FOUR",
        "FIVE",
        "SIX",
        "SEVEN",
        "EIGHT",
      ]),
    ),
    pre: s.nullable(s.boolean("Whether this is a pre-round (e.g., Pre-Series A)")),
    date: s.nullable(s.string("Announcement date of the funding round", { format: "date-time" })),
    created_at: s.nullable(s.string("Date the deal was added to the system", { format: "date-time" })),
    total_round_raised: s.nullable(s.number("Total amount raised in the round (USD)")),
    deal_descriptions: s.nullable(
      s.object(
        "deal descriptions details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    company_id: s.string("Unique identifier for the company", { format: "uuid" }),
    investor_ids: s.array(
      "UUIDs of firm investors participating in this deal. Angels are surfaced separately in `angel_investor_ids`.",
      s.string("Investor ids item.", { format: "uuid" }),
    ),
    angel_investor_ids: s.array(
      "UUIDs of angel investors (people) who participated in this deal. Resolve via `/people/{id}`. Empty array when no angels.",
      s.string("Angel investor ids item.", { format: "uuid" }),
    ),
    financings: s.array(
      "Detailed financing information for deals that have multiple financing types",
      s.object(
        "financings record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    valuation: s.nullable(
      s.object(
        "Valuation information for this deal",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    articles: s.array(
      "Related articles/sources for this deal.\nAlways included for every API tier. Empty when the deal has no related sources.",
      s.object(
        "articles record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const dealInvestorSchema = s.object(
  "A firm investor on a deal. Angels are returned separately in the `angel_investors` array on /deals/{id}/investors.",
  {
    id: s.string("Unique identifier for the firm investor (parent_investor UUID)", {
      format: "uuid",
    }),
    name: s.string("Investor name"),
    lead_investor: s.nullable(s.boolean("Whether this investor led the round")),
    personnel: s.array(
      "Key personnel (partners) at this firm involved in this deal. Each entry is a person record joinable to /people/{id}.",
      s.object(
        "personnel record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    financing_type: s.nullable(s.string("The financing type this investor participated in")),
    domain: s.nullable(s.string("Investor's website domain")),
    linkedin: s.nullable(s.string("Investor's LinkedIn URL")),
    crunchbase: s.nullable(s.string("Investor's Crunchbase URL")),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const angelInvestorSchema = s.object(
  "An angel (individual) investor on a deal. Returned in the `angel_investors` array on /deals/{id}/investors.",
  {
    id: s.string("Person UUID for the angel. Resolves via /people/{id}.", { format: "uuid" }),
    name: s.nullable(s.string("Display name of the record.")),
    financing_type: s.nullable(s.string("The financing type this angel participated in.")),
    linkedin: s.nullable(s.string("Linkedin.")),
    crunchbase: s.nullable(s.string("Crunchbase.")),
    twitter: s.nullable(s.string("Twitter.")),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const latestDealSchema = s.nullable(
  s.looseObject("Details of the company's most recent funding round", {
    id: s.nullable(s.string("Unique identifier for the deal", { format: "uuid" })),
    type: s.nullable(s.string("Type of funding round")),
    total_round_raised: s.nullable(s.number("Total amount raised in the round (USD)")),
    date: s.nullable(s.string("Date of the funding round", { format: "date-time" })),
    extension: s.nullable(s.boolean("Whether this is an extension round")),
    pre: s.nullable(s.boolean("Whether this is a pre-round (e.g., Pre-Series A)")),
    intermediate: s.nullable(s.string("Intermediate round designation")),
    description: s.nullable(
      s.looseObject("Descriptions of the latest funding round.", {
        short_description: s.nullable(s.string("Brief description of the deal")),
        long_description: s.nullable(s.string("Detailed description of the deal")),
      }),
    ),
    investors: s.array(
      "UUIDs of firm investors participating in this deal. Angels are surfaced separately in `angel_investor_ids`.",
      s.string("Fundable investor UUID.", { format: "uuid" }),
    ),
    angel_investor_ids: s.array(
      "UUIDs of angel investors (people) on this latest deal. Resolve via `/people/{id}`. Empty array when no angels.",
      s.string("Fundable person UUID.", { format: "uuid" }),
    ),
    financings: s.array(
      "Individual financing tranches in this deal",
      s.looseObject("Financing tranche details.", {
        id: s.string("Unique identifier for the financing", { format: "uuid" }),
        type: s.string("Type of financing"),
        size_usd: s.nullable(s.number("Financing amount in USD")),
        size_native: s.nullable(s.number("Financing amount in native currency")),
        currency: s.nullable(s.string("Currency code for size_native")),
      }),
    ),
    articles: s.array(
      "Related articles/sources for the latest deal. Always included; empty when no sources exist.",
      s.looseObject("Article or source details for the latest deal."),
    ),
  }),
);
const personCurrentCompanySchema = s.nullable(
  s.looseObject("Current employer summary. Null when the person has no current employer.", {
    id: s.string("Fundable company UUID.", { format: "uuid" }),
    name: s.nullable(s.string("Current employer name.")),
    permalink: s.nullable(s.string("Fundable permalink for the company")),
    domain: s.nullable(s.string("Current employer domain.")),
  }),
);
const companyDetailsSchema = s.object(
  "Full company details returned by the /company endpoint",
  {
    id: s.string("Unique identifier for the company", { format: "uuid" }),
    name: s.nullable(s.string("Company name")),
    legal_name: s.nullable(s.string("Legal name of the company")),
    guru_permalink: s.nullable(s.string("Fundable permalink for the company")),
    domain: s.nullable(s.string("Company website domain")),
    region: s.nullable(s.string("Company region")),
    operating_status: s.nullable(s.string("Current operating status of the company")),
    founded_date: s.nullable(s.string("Date and time the company was founded", { format: "date-time" })),
    acquired: s.nullable(s.boolean("Whether the company has been acquired")),
    short_description: s.nullable(s.string("Brief description of the company")),
    long_description: s.nullable(
      s.string(
        "Full description of the company. Available on /company endpoint; may be null on /companies list endpoint.",
      ),
    ),
    num_employees: s.nullable(s.string("Number of employees range")),
    linkedin: s.nullable(s.string("LinkedIn profile URL", { format: "uri" })),
    twitter: s.nullable(s.string("Twitter profile URL", { format: "uri" })),
    facebook: s.nullable(s.string("Facebook profile URL", { format: "uri" })),
    pitchbook: s.nullable(s.string("PitchBook profile URL", { format: "uri" })),
    crunchbase: s.nullable(s.string("Crunchbase profile URL", { format: "uri" })),
    address: s.nullable(s.string("Company address")),
    ipo_status: s.nullable(s.stringEnum("IPO status of the company", ["public", "private"])),
    num_funding_rounds: s.nullable(s.integer("Number of funding rounds")),
    num_investors: s.nullable(s.integer("Number of investors")),
    total_raised: s.nullable(s.number("Total amount raised (USD)")),
    latest_valuation_usd: s.nullable(s.number("Latest valuation (USD)")),
    latest_valuation_date: s.nullable(s.string("Date of latest valuation", { format: "date-time" })),
    industries: s.array(
      "Industries the company operates in",
      s.object(
        "industries record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    location: s.object(
      "Company location hierarchy",
      {},
      {
        required: [],
        additionalProperties: true,
      },
    ),
    latest_deal: latestDealSchema,
    all_investor_ids: s.nullable(
      s.array(
        "UUIDs of all parent investors across all funding rounds for this company",
        s.string("All investor ids item.", { format: "uuid" }),
      ),
    ),
    similarity: s.nullable(
      s.number("Semantic similarity score (0-1). Only present when using search_query parameter."),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const companyDealSchema = s.object(
  "Deal returned by the /company/deals endpoint. Same shape as the Deal schema in the Deals API.",
  {
    id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
    round_type: s.nullable(s.string("Round type.")),
    extension: s.nullable(s.boolean("Whether to filter for extension rounds.")),
    intermediate: s.nullable(s.string("Intermediate.")),
    pre: s.nullable(s.boolean("Whether to filter for pre-round financing.")),
    date: s.nullable(s.string("Date.", { format: "date-time" })),
    created_at: s.nullable(s.string("Created at.", { format: "date-time" })),
    total_round_raised: s.nullable(s.number("Total round raised.")),
    deal_descriptions: s.nullable(
      s.object(
        "deal descriptions details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    company_id: s.string("Company id.", { format: "uuid" }),
    investor_ids: s.array(
      "UUIDs of firm investors participating in this deal. Angels are surfaced separately in `angel_investor_ids`.",
      s.string("Investor ids item.", { format: "uuid" }),
    ),
    angel_investor_ids: s.array(
      "UUIDs of angel investors (people) on this deal. Resolve via `/people/{id}`. Empty array when no angels.",
      s.string("Angel investor ids item.", { format: "uuid" }),
    ),
    financings: s.array(
      "Financings values.",
      s.object(
        "financings record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    valuation: s.nullable(
      s.object(
        "valuation details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    articles: s.array(
      "Related articles/sources for this deal. Always included; empty when no sources exist.",
      s.object(
        "articles record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const companySearchResultSchema = s.object(
  "CompanySearchResult details.",
  {
    id: s.string("Unique identifier for the company", { format: "uuid" }),
    guru_permalink: s.nullable(s.string("Fundable permalink for the company")),
    name: s.string("Company name"),
    short_description: s.nullable(s.string("Brief description of the company")),
    relevance_score: s.number("Search relevance score (0-1)"),
    domain: s.nullable(s.string("Company website domain")),
    linkedin: s.nullable(s.string("LinkedIn profile URL")),
    crunchbase: s.nullable(s.string("Crunchbase profile URL")),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const companyListItemSchema = s.object(
  "CompanyListItem details.",
  {
    id: s.string("Unique identifier for the company", { format: "uuid" }),
    name: s.nullable(s.string("Company name")),
    legal_name: s.nullable(s.string("Legal name of the company")),
    guru_permalink: s.nullable(s.string("Fundable permalink for the company")),
    domain: s.nullable(s.string("Company website domain")),
    region: s.nullable(s.string("Company region")),
    operating_status: s.nullable(s.string("Current operating status of the company")),
    founded_date: s.nullable(s.string("Date and time the company was founded", { format: "date-time" })),
    acquired: s.nullable(s.boolean("Whether the company has been acquired")),
    short_description: s.nullable(s.string("Brief description of the company")),
    long_description: s.nullable(
      s.string(
        "Full description of the company. Available on /company endpoint; may be null on /companies list endpoint.",
      ),
    ),
    num_employees: s.nullable(s.string("Number of employees range")),
    linkedin: s.nullable(s.string("LinkedIn profile URL", { format: "uri" })),
    twitter: s.nullable(s.string("Twitter profile URL", { format: "uri" })),
    facebook: s.nullable(s.string("Facebook profile URL", { format: "uri" })),
    pitchbook: s.nullable(s.string("PitchBook profile URL", { format: "uri" })),
    crunchbase: s.nullable(s.string("Crunchbase profile URL", { format: "uri" })),
    address: s.nullable(s.string("Company address")),
    ipo_status: s.nullable(s.stringEnum("IPO status of the company", ["public", "private"])),
    num_funding_rounds: s.nullable(s.integer("Number of funding rounds")),
    num_investors: s.nullable(s.integer("Number of investors")),
    total_raised: s.nullable(s.number("Total amount raised (USD)")),
    latest_valuation_usd: s.nullable(s.number("Latest valuation (USD)")),
    latest_valuation_date: s.nullable(s.string("Date of latest valuation", { format: "date-time" })),
    industries: s.array(
      "Industries the company operates in",
      s.object(
        "industries record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    location: s.object(
      "Company location hierarchy",
      {},
      {
        required: [],
        additionalProperties: true,
      },
    ),
    latest_deal: latestDealSchema,
    all_investor_ids: s.nullable(
      s.array(
        "UUIDs of all parent investors across all funding rounds for this company",
        s.string("All investor ids item.", { format: "uuid" }),
      ),
    ),
    similarity: s.nullable(
      s.number("Semantic similarity score (0-1). Only present when using search_query parameter."),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const investorListItemSchema = s.object(
  "InvestorListItem details.",
  {
    id: s.string("Unique identifier for the investor", { format: "uuid" }),
    name: s.string("Investor name"),
    total_deal_count: s.integer("Total number of deals"),
    lead_deal_count: s.integer("Number of deals where investor was lead"),
    deal_count_last_12_months: s.integer("Deals in the last 12 months"),
    lead_deal_count_last_12_months: s.integer("Lead deals in the last 12 months"),
    most_recent_deal_date: s.nullable(s.string("Date of the most recent deal", { format: "date-time" })),
    guru_permalink: s.string("Fundable permalink for the investor"),
    domain: s.nullable(s.string("Investor domain")),
    website: s.nullable(s.string("Investor website URL", { format: "uri" })),
    linkedin: s.nullable(s.string("Investor LinkedIn URL", { format: "uri" })),
    pitchbook: s.nullable(s.string("Investor PitchBook URL", { format: "uri" })),
    crunchbase: s.nullable(s.string("Investor Crunchbase URL", { format: "uri" })),
    description: s.nullable(s.string("Description of the investor")),
    legal_name: s.nullable(s.string("Legal name of the investor")),
    num_employees: s.nullable(s.string("Employee count range")),
    investment_stage: s.nullable(s.string("Investment stage focus")),
    contact_email: s.nullable(s.string("Contact email (when available)", { format: "email" })),
    contact_phone: s.nullable(s.string("Contact phone number (when available)")),
    location: s.object(
      "location details.",
      {},
      {
        required: [],
        additionalProperties: true,
      },
    ),
    top_industries: s.array(
      "Top industries invested in",
      s.object(
        "top industries record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    top_locations: s.array(
      "Top portfolio company locations",
      s.object(
        "top locations record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    top_round_types: s.array(
      "Most common round types",
      s.object(
        "top round types record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    filtered_deal_count: s.nullable(s.integer("Number of deals matching the active `company_investments` filters")),
    filtered_lead_count: s.nullable(
      s.integer("Of the deals matching the active `company_investments` filters, how many the investor led"),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const investorSchema = s.object(
  "Full investor profile",
  {
    id: s.string("Unique identifier for the investor", { format: "uuid" }),
    name: s.string("Investor name"),
    total_deal_count: s.integer("Total number of deals"),
    lead_deal_count: s.integer("Number of deals where investor was lead"),
    deal_count_last_12_months: s.integer("Deals in the last 12 months"),
    lead_deal_count_last_12_months: s.integer("Lead deals in the last 12 months"),
    most_recent_deal_date: s.nullable(s.string("Date of the most recent deal", { format: "date-time" })),
    guru_permalink: s.string("Fundable permalink for the investor"),
    domain: s.nullable(s.string("Investor domain")),
    website: s.nullable(s.string("Investor website URL", { format: "uri" })),
    linkedin: s.nullable(s.string("Investor LinkedIn URL", { format: "uri" })),
    pitchbook: s.nullable(s.string("Investor PitchBook URL", { format: "uri" })),
    crunchbase: s.nullable(s.string("Investor Crunchbase URL", { format: "uri" })),
    description: s.nullable(s.string("Description of the investor")),
    legal_name: s.nullable(s.string("Legal name of the investor")),
    num_employees: s.nullable(s.string("Employee count range")),
    investment_stage: s.nullable(s.string("Investment stage focus")),
    contact_email: s.nullable(s.string("Contact email (when available)", { format: "email" })),
    contact_phone: s.nullable(s.string("Contact phone number (when available)")),
    location: s.object(
      "location details.",
      {},
      {
        required: [],
        additionalProperties: true,
      },
    ),
    top_industries: s.array(
      "Top industries invested in",
      s.object(
        "top industries record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    top_locations: s.array(
      "Top portfolio company locations",
      s.object(
        "top locations record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    top_round_types: s.array(
      "Most common round types",
      s.object(
        "top round types record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const investorDealSchema = s.object(
  "Deal returned by the /investor/deals endpoint. Same shape as the Deal schema in the Deals API.",
  {
    id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
    round_type: s.nullable(s.string("Round type.")),
    extension: s.nullable(s.boolean("Whether to filter for extension rounds.")),
    intermediate: s.nullable(s.string("Intermediate.")),
    pre: s.nullable(s.boolean("Whether to filter for pre-round financing.")),
    date: s.nullable(s.string("Date.", { format: "date-time" })),
    created_at: s.nullable(s.string("Created at.", { format: "date-time" })),
    total_round_raised: s.nullable(s.number("Total round raised.")),
    deal_descriptions: s.nullable(
      s.object(
        "deal descriptions details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    company_id: s.string("Company id.", { format: "uuid" }),
    investor_ids: s.array(
      "UUIDs of firm investors participating in this deal. Angels are surfaced separately in `angel_investor_ids`.",
      s.string("Investor ids item.", { format: "uuid" }),
    ),
    angel_investor_ids: s.array(
      "UUIDs of angel investors (people) on this deal. Resolve via `/people/{id}`. Empty array when no angels.",
      s.string("Angel investor ids item.", { format: "uuid" }),
    ),
    financings: s.array(
      "Financings values.",
      s.object(
        "financings record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    valuation: s.nullable(
      s.object(
        "valuation details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    articles: s.array(
      "Related articles/sources for this deal. Always included; empty when no sources exist.",
      s.object(
        "articles record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const investorSearchResultSchema = s.object(
  "InvestorSearchResult details.",
  {
    id: s.string("Unique identifier for the investor", { format: "uuid" }),
    guru_permalink: s.nullable(s.string("Fundable permalink for the investor")),
    name: s.string("Investor name"),
    description: s.nullable(s.string("Brief description of the investor")),
    relevance_score: s.number("Search relevance score (0-1)"),
    domain: s.nullable(s.string("Investor website domain")),
    website: s.nullable(s.string("Investor website URL", { format: "uri" })),
    linkedin: s.nullable(s.string("LinkedIn profile URL")),
    crunchbase: s.nullable(s.string("Crunchbase profile URL")),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const personSearchResultSchema = s.object(
  "Constant unified person shape — every row carries every field. Investor aggregates live\nunder `investor_highlights` (null for non-investors); discriminator flags `is_investor` /\n`is_angel` / `has_led_deal` and `investment_firms` stay top-level. `employment_history`\nand `education_history` are capped at 3 in the search response; the detail endpoint\nreturns the full lists.",
  {
    id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
    name: s.nullable(s.string("Display name of the record.")),
    title: s.nullable(s.string("Current job title")),
    linkedin_url: s.nullable(s.string("Canonical LinkedIn person URL", { format: "uri" })),
    crunchbase_url: s.nullable(s.string("Canonical Crunchbase person URL", { format: "uri" })),
    twitter_url: s.nullable(s.string("Canonical Twitter/X profile URL", { format: "uri" })),
    location: s.nullable(s.string("Location.")),
    city: s.nullable(s.string("City.")),
    country_code: s.nullable(s.string("Country code.")),
    about: s.nullable(s.string("LinkedIn bio/about section")),
    is_founder: s.boolean("Is founder."),
    current_company: personCurrentCompanySchema,
    employment_history: s.array(
      "Recent employment (max 3 items in search; full list on detail endpoint)",
      s.object(
        "employment history record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
      { maxItems: 3 },
    ),
    education_history: s.array(
      "Education records (max 3 items in search; full list on detail endpoint)",
      s.object(
        "education history record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
      { maxItems: 3 },
    ),
    is_investor: s.boolean("Whether the person has any tracked investment activity"),
    is_angel: s.boolean("Whether the person makes angel investments"),
    has_led_deal: s.boolean("Whether the person has ever led a deal"),
    investment_firms: s.array(
      "Firms the person invests under (empty for pure angels)",
      s.object(
        "investment firms record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    investor_highlights: s.nullable(
      s.object(
        "Aggregated investor activity. Null when `is_investor` is false.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    filtered_deal_count: s.nullable(
      s.integer(
        "Count of deals matching the `investor.deals.*` filters. Populated only when any `investor.deals.*` filter is present; otherwise null.",
      ),
    ),
    filtered_lead_count: s.nullable(
      s.integer(
        "Of the matching deals, how many the person/firm led. Populated only when any `investor.deals.*` filter is present.",
      ),
    ),
    filtered_most_recent_date: s.nullable(
      s.string("Most recent matching-deal date. Populated only when any `investor.deals.*` filter is present.", {
        format: "date",
      }),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const personDetailSchema = s.object(
  "PersonDetail details.",
  {
    id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
    name: s.nullable(s.string("Display name of the record.")),
    title: s.nullable(s.string("Current job title")),
    linkedin_url: s.nullable(s.string("Canonical LinkedIn person URL", { format: "uri" })),
    crunchbase_url: s.nullable(s.string("Canonical Crunchbase person URL", { format: "uri" })),
    twitter_url: s.nullable(s.string("Canonical Twitter/X profile URL", { format: "uri" })),
    location: s.nullable(s.string("Location.")),
    city: s.nullable(s.string("City.")),
    country_code: s.nullable(s.string("Country code.")),
    about: s.nullable(s.string("LinkedIn bio/about section")),
    is_founder: s.boolean("Is founder."),
    current_company: personCurrentCompanySchema,
    employment_history: s.array(
      "Full employment history (no item cap)",
      s.object(
        "employment history record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    education_history: s.array(
      "Full education history (no item cap)",
      s.object(
        "education history record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    is_investor: s.boolean("Whether the person has any tracked investment activity"),
    is_angel: s.boolean("Whether the person makes angel investments"),
    has_led_deal: s.boolean("Whether the person has ever led a deal"),
    investment_firms: s.array(
      "Firms the person invests under (empty for pure angels)",
      s.object(
        "investment firms record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    investor_highlights: s.nullable(
      s.object(
        "Aggregated investor activity. Null when `is_investor` is false.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    filtered_deal_count: s.nullable(
      s.integer(
        "Count of deals matching the `investor.deals.*` filters. Populated only when any `investor.deals.*` filter is present; otherwise null.",
      ),
    ),
    filtered_lead_count: s.nullable(
      s.integer(
        "Of the matching deals, how many the person/firm led. Populated only when any `investor.deals.*` filter is present.",
      ),
    ),
    filtered_most_recent_date: s.nullable(
      s.string("Most recent matching-deal date. Populated only when any `investor.deals.*` filter is present.", {
        format: "date",
      }),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const personDealSchema = s.object(
  "Deal returned by the /person/deals endpoint. Same shape as deals returned by /company/deals.",
  {
    id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
    round_type: s.nullable(s.string("Round type.")),
    extension: s.nullable(s.boolean("Whether to filter for extension rounds.")),
    intermediate: s.nullable(s.string("Intermediate.")),
    pre: s.nullable(s.boolean("Whether to filter for pre-round financing.")),
    date: s.nullable(s.string("Date.", { format: "date-time" })),
    created_at: s.nullable(s.string("Created at.", { format: "date-time" })),
    total_round_raised: s.nullable(s.number("Total round raised.")),
    deal_descriptions: s.nullable(
      s.object(
        "deal descriptions details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    company_id: s.string("Company id.", { format: "uuid" }),
    investor_ids: s.array(
      "UUIDs of firm investors participating in this deal. Angels are surfaced separately in `angel_investor_ids`.",
      s.string("Investor ids item.", { format: "uuid" }),
    ),
    angel_investor_ids: s.array(
      "UUIDs of angel investors (people) on this deal. Resolve via `/people/{id}`. Empty array when no angels.",
      s.string("Angel investor ids item.", { format: "uuid" }),
    ),
    financings: s.array(
      "Financings values.",
      s.object(
        "financings record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    valuation: s.nullable(
      s.object(
        "valuation details.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    articles: s.array(
      "Related articles/sources for this deal. Always included; empty when no sources exist.",
      s.object(
        "articles record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const alertSchema = s.object(
  "Alert details.",
  {
    alertId: s.string("Unique identifier for the alert configuration", { format: "uuid" }),
    alertName: s.string("Name of the alert configuration"),
    alertFrequency: s.stringEnum("Frequency setting of the alert", ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
    totalDealCount: s.integer("Total number of deals for this alert"),
    deals: s.array(
      "Array of deals that matched the alert criteria (flattened from all time periods, sorted by date DESC)",
      s.object(
        "deals record.",
        {},
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const alertConfigurationSchema = s.object(
  "Alert configuration metadata including filters and settings",
  {
    configuration_id: s.string("Unique identifier for the alert configuration", { format: "uuid" }),
    configuration_name: s.string("User-defined name for the alert"),
    frequency: s.stringEnum("How often the alert runs", ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
    description: s.string("Alert description combining custom, alert, and semantic descriptions"),
    filters: s.object(
      "Alert filter criteria",
      {},
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const locationSearchResultSchema = s.object(
  "LocationSearchResult details.",
  {
    permalink: s.string("Location permalink identifier"),
    name: s.string("Location name"),
    location_type: s.stringEnum("Type of location", ["REGION", "COUNTRY", "STATE", "CITY"]),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const industrySearchResultSchema = s.object(
  "IndustrySearchResult details.",
  {
    permalink: s.string("Industry or super category permalink identifier"),
    name: s.string("Industry or super category name"),
    industry_type: s.stringEnum("Type of result", ["INDUSTRY", "SUPER_CATEGORY"]),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const responseMetadataSchema = s.looseObject("Pagination and credit usage reported by Fundable.", {
  total_count: s.integer("Total number of matching records."),
  page: s.integer("Zero-based page number."),
  page_size: s.integer("Number of results per page."),
  credits_used: s.number("Credits consumed by this request."),
  credit_source: s.nullable(s.string("Source of consumed credits.")),
  monthly_credits_remaining: s.nullable(s.number("Remaining monthly credits.")),
  purchased_credits_remaining: s.nullable(s.number("Remaining purchased credits.")),
});
function fundableResponse(data: JsonSchema) {
  return s.object(
    "Fundable response with records and available pagination and credit metadata.",
    {
      success: s.boolean("Whether the request succeeded."),
      data,
      meta: responseMetadataSchema,
      message: s.string("Optional explanatory message."),
    },
    {
      required: ["success", "data"],
      additionalProperties: true,
    },
  );
}
export const fundableActions: ActionDefinition[] = [
  defineProviderAction("fundable", {
    name: "search_deals",
    description:
      "Use this endpoint when the requested result is a set of funding rounds, or when deal criteria must match any historical round rather than only each company's latest round. It supports round-level analysis across the full deal history.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Filters for search deals.",
      {
        identifiers: s.object(
          "Look up specific deals by identifier",
          {
            deal_ids: s.array("Deal UUIDs", s.string("Deal ids item.", { format: "uuid", minLength: 1 })),
          },
          { required: [] },
        ),
        deal: s.object(
          "Deal attribute filters",
          {
            financing_types: financingTypesSchema,
            size_min: s.number("Minimum deal size (USD)", { minimum: 0 }),
            size_max: s.number("Maximum deal size (USD)", { minimum: 0 }),
            date_start: s.string("Filter deals announced after this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            date_end: s.string("Filter deals announced before this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            created_start: s.string("Filter deals added to the system after this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            created_end: s.string("Filter deals added to the system before this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
          },
          { required: [] },
        ),
        company: s.object(
          "Company attribute filters",
          {
            company_ids: s.array(
              "Company UUIDs - filter deals by specific companies",
              s.string("Company ids item.", { format: "uuid", minLength: 1 }),
            ),
            locations: locationsSchema,
            industries: industriesSchema,
            super_categories: superCategoriesSchema,
            employee_count: employeeCountSchema,
            ipo_status: s.array(
              "IPO status filter. Valid: public, private",
              s.stringEnum("Ipo status item.", ["public", "private"]),
            ),
            total_raised_min: s.number("Minimum total raised (USD)", { minimum: 0 }),
            total_raised_max: s.number("Maximum total raised (USD)", { minimum: 0 }),
          },
          { required: [] },
        ),
        investors: s.object(
          "Filter by investor participation (firms or people)",
          {
            investor_ids: s.array(
              "Investor UUIDs (firms)",
              s.string("Investor ids item.", { format: "uuid", minLength: 1 }),
            ),
            people_ids: s.array(
              "Person UUIDs — matches deals where any of these people participated as an\n**angel investor** OR as a **lead partner** of an investing firm.\nResolve via `/people/{id}`.",
              s.string("People ids item.", { format: "uuid", minLength: 1 }),
            ),
          },
          { required: [] },
        ),
        page: pageSchema,
        page_size: pageSizeSchema,
        sort_by: s.stringEnum(
          "Sort order for results",
          ["most_recent_deal", "oldest_deal", "largest_raise", "smallest_raise"],
          { default: "most_recent_deal" },
        ),
      },
      { required: [] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          deals: s.array("Deals values.", dealSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_deal_by_id",
    description:
      "Use this endpoint when a deal UUID is already known and full details for that one funding round are required. The response identifies related entities by ID rather than embedding their full profiles. Use `GET /company?id=...` for company metadata and `GET /deals/{id}/investors` for the complete investor lineup. ",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get deal by id.",
      {
        id: s.string("Unique identifier for the deal (UUID format)", {
          format: "uuid",
          minLength: 1,
        }),
      },
      { required: ["id"] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          deal: dealSchema,
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_deal_investors",
    description:
      "Use this endpoint after identifying a deal when investor IDs in the deal record need to be resolved into the complete investor lineup. It returns firm investors, associated people, angel investors, lead status, and profile links for one deal.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get deal investors.",
      {
        id: s.string("Unique identifier for the deal (UUID format)", {
          format: "uuid",
          minLength: 1,
        }),
      },
      { required: ["id"] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          investors: s.array(
            "Firm investors on this deal. Angels are surfaced separately in `angel_investors`.",
            dealInvestorSchema,
          ),
          angel_investors: s.array(
            "Angel investors (individuals) on this deal. Empty array when no angels.",
            angelInvestorSchema,
          ),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_company",
    description:
      "Use this endpoint when one company is already identified and its full profile and latest funding round are required. Prefer a domain or LinkedIn URL when available; they can be passed directly here without calling `/company/search` first.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get company.",
      {
        id: s.string("Company UUID", { format: "uuid", minLength: 1 }),
        domain: s.string(
          'Company domain or full URL (e.g., "stripe.com" or "https://stripe.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          company: companyDetailsSchema,
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_company_deals",
    description:
      "Use this endpoint when a company is already identified and its complete funding history is required. Prefer a domain or LinkedIn URL when available; it can be passed directly without first calling `/company/search`.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get company deals.",
      {
        id: s.string("Company UUID", { format: "uuid", minLength: 1 }),
        domain: s.string(
          'Company domain or full URL (e.g., "stripe.com" or "https://stripe.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
        page: pageSchema,
        page_size: s.integer("Number of results per page (1-500)", {
          minimum: 1,
          maximum: 500,
          default: 10,
        }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          deals: s.array("Deals values.", companyDealSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_company",
    description:
      "Use this endpoint primarily to resolve a fuzzy company name or an uncertain identifier into matching company records. If a reliable domain or LinkedIn URL is already available, skip this search and pass it directly to `GET /company` for one full profile or to `POST /companies` for a batch lookup.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for search company.",
      {
        name: s.string("Fuzzy search by company name", { minLength: 1 }),
        domain: s.string(
          'Company domain or full URL (e.g., "stripe.com" or "https://stripe.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
      },
      {
        required: [],
        oneOf: [
          { required: ["name"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          companies: s.array("Companies values.", companySearchResultSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_companies",
    description:
      "Use this endpoint by default for company sourcing and discovery. It returns company metadata such as name and domain together with the full details of each company's latest funding round.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Filters for search companies.",
      {
        identifiers: s.object(
          "Look up specific companies by identifier",
          {
            ids: s.array("Company UUIDs", s.string("Ids item.", { format: "uuid", minLength: 1 })),
            domains: s.array("Company domains (max 100)", s.string("Domains item.", { minLength: 1 }), {
              maxItems: 100,
            }),
            linkedin_urls: s.array(
              "LinkedIn company URLs (max 100)",
              s.string("Linkedin urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
            crunchbase_urls: s.array(
              "Crunchbase organization URLs (max 100)",
              s.string("Crunchbase urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
          },
          { required: [] },
        ),
        company: s.object(
          "Company attribute filters",
          {
            search_query: s.string(
              'AI-powered semantic search — a flexible replacement for an industry tag. First use /industry/search and apply an `industries` or `super_categories` filter when the taxonomy contains the intended category. Use semantic search only for a niche industry or specific product type the taxonomy cannot express, describing what the company does — its product, technology, or business model (e.g. "AI-powered medical imaging diagnostics" or "vertical SaaS for dental practices"). Do NOT use it for other attributes like stage, location, funding, or employee count — apply those with the dedicated filter fields instead. Results include a similarity score, are sorted by relevance, and are capped at 150 semantic matches.',
              { minLength: 1 },
            ),
            min_relevance: s.number("Minimum similarity threshold (0-1). Only applies with search_query.", {
              minimum: 0,
              maximum: 1,
            }),
            locations: locationsSchema,
            industries: industriesSchema,
            super_categories: superCategoriesSchema,
            employee_count: employeeCountSchema,
            ipo_status: s.array(
              "IPO status filter. Valid: public, private",
              s.stringEnum("Ipo status item.", ["public", "private"]),
            ),
            total_raised_min: s.number("Minimum total raised (USD)", { minimum: 0 }),
            total_raised_max: s.number("Maximum total raised (USD)", { minimum: 0 }),
          },
          { required: [] },
        ),
        latest_deal: s.object(
          "Latest funding round filters",
          {
            financing_types: financingTypesSchema,
            size_min: s.number("Minimum deal size (USD)", { minimum: 0 }),
            size_max: s.number("Maximum deal size (USD)", { minimum: 0 }),
            date_start: s.string("Latest deal after this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            date_end: s.string("Latest deal before this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            created_start: s.string(
              "Latest deal record added to the system on or after this date (ISO 8601). Filters by ingestion date (`created_at`), not the announcement date — useful for finding rounds newly added to Fundable.",
              { format: "date", minLength: 1 },
            ),
            created_end: s.string(
              "Latest deal record added to the system on or before this date (ISO 8601). Filters by ingestion date (`created_at`), not the announcement date.",
              { format: "date", minLength: 1 },
            ),
            investor_ids: s.array(
              "Filter by investors who participated in the latest deal only",
              s.string("Investor ids item.", { format: "uuid", minLength: 1 }),
            ),
          },
          { required: [] },
        ),
        investors: s.object(
          "Filter by investors (firms or people) across all funding rounds",
          {
            investor_ids: s.array(
              "Investor UUIDs — matches companies where these investors participated in any round ever",
              s.string("Investor ids item.", { format: "uuid", minLength: 1 }),
            ),
            people_ids: s.array(
              "Person UUIDs — matches companies where any of these people participated in any round\nas an **angel investor** OR as a **lead partner** of an investing firm.\nResolve via `/people/{id}`.",
              s.string("People ids item.", { format: "uuid", minLength: 1 }),
            ),
          },
          { required: [] },
        ),
        page: pageSchema,
        page_size: pageSizeSchema,
        sort_by: s.stringEnum(
          "Sort order. Ignored when search_query is provided (sorted by relevance).",
          [
            "most_recent_raise",
            "oldest_raise",
            "most_recent_founded",
            "oldest_founded",
            "largest_valuation",
            "smallest_valuation",
            "largest_total_raise",
            "smallest_total_raise",
            "most_funding_rounds",
            "most_investors",
          ],
          { default: "most_recent_raise" },
        ),
      },
      { required: [] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          companies: s.array("Companies values.", companyListItemSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "list_investors",
    description:
      "Use this endpoint when the requested result is a list of investor firms. Filters under `company_investments` identify qualifying portfolio companies and deals, then return the firms that participated in those deals. For example, use this route to find San Francisco-based investors that participated in a Seed round during the last year.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Filters for list investors.",
      {
        identifiers: s.object(
          "Investor lookup filters (OR'd together)",
          {
            ids: s.array("Investor UUIDs", s.string("Ids item.", { format: "uuid", minLength: 1 })),
            domains: s.array("Investor domains (max 100)", s.string("Domains item.", { minLength: 1 }), {
              maxItems: 100,
            }),
            linkedin_urls: s.array(
              "Investor LinkedIn URLs (max 100)",
              s.string("Linkedin urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
            crunchbase_urls: s.array(
              "Investor Crunchbase URLs (max 100)",
              s.string("Crunchbase urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
          },
          { required: [] },
        ),
        investor: s.object(
          "Investor entity-level filters",
          {
            locations: s.array(
              "Investor HQ location permalinks. Use /location/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
              s.string("Locations item.", { minLength: 1 }),
            ),
            employee_count: s.array(
              "Investor firm employee count ranges",
              s.stringEnum("Employee count item.", [
                "1-10",
                "11-50",
                "51-100",
                "101-250",
                "251-500",
                "501-1000",
                "1001-5000",
                "5001-10000",
                "10001+",
              ]),
            ),
          },
          { required: [] },
        ),
        company_investments: s.object(
          "Portfolio filters (filter by companies the investor has invested in)",
          {
            company_ids: s.array(
              "Portfolio company UUIDs",
              s.string("Company ids item.", { format: "uuid", minLength: 1 }),
            ),
            search_query: s.string(
              'AI-powered semantic search matched against each investor\'s\nportfolio companies — a flexible replacement for an industry tag.\nFirst use /industry/search and apply an `industries` or\n`super_categories` filter when the taxonomy contains the intended\ncategory. Use semantic search only for a niche industry or specific\nproduct type the taxonomy cannot express, describing what those\ncompanies do — their product, technology, or business model (e.g.\n"climate-focused carbon capture hardware"). Do NOT use it for other\nattributes like stage, location, or funding — apply those with the\ndedicated `company_investments` and `investor` filter fields instead.\nResults are ranked by portfolio relevance and capped at 150 semantic\nmatches.',
              { minLength: 1 },
            ),
            min_relevance: s.number(
              "Minimum relevance score threshold (0–1) for the portfolio-based\nsemantic search. Only applies when `search_query` is provided.\nInvestors whose portfolio match score falls below this threshold\nare excluded. Defaults to 0 (return all results).",
              { minimum: 0, maximum: 1 },
            ),
            locations: s.array(
              "Portfolio company location permalinks. Use /location/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
              s.string("Locations item.", { minLength: 1 }),
            ),
            industries: s.array(
              "Portfolio company industry permalinks. Use /industry/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
              s.string("Industries item.", { minLength: 1 }),
            ),
            super_categories: s.array(
              "Broad industry super-category permalinks. Use /industry/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
              s.string("Super categories item.", { minLength: 1 }),
            ),
            employee_count: s.array(
              "Portfolio company employee count ranges",
              s.stringEnum("Employee count item.", [
                "1-10",
                "11-50",
                "51-100",
                "101-250",
                "251-500",
                "501-1000",
                "1001-5000",
                "5001-10000",
                "10001+",
              ]),
            ),
            ipo_status: s.array(
              "Portfolio company IPO status",
              s.stringEnum("Ipo status item.", ["public", "private"]),
            ),
            total_raised_min: s.number("Minimum total raised by portfolio companies (USD)", {
              minimum: 0,
            }),
            total_raised_max: s.number("Maximum total raised by portfolio companies (USD)", {
              minimum: 0,
            }),
            financing_types: financingTypesSchema,
            deal_size_min: s.number("Minimum deal size (USD)", { minimum: 0 }),
            deal_size_max: s.number("Maximum deal size (USD)", { minimum: 0 }),
            deal_start_date: s.string("Filter deals on or after this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            deal_end_date: s.string("Filter deals on or before this date (ISO 8601)", {
              format: "date",
              minLength: 1,
            }),
            only_lead_deals: s.boolean({
              description: "When true, only count deals where investor was lead",
              default: false,
            }),
            min_matching_deals: s.integer("Minimum number of deals matching the portfolio filters", { minimum: 1 }),
          },
          { required: [] },
        ),
        page: pageSchema,
        page_size: s.integer("Number of results per page (max 500)", {
          minimum: 1,
          maximum: 500,
          default: 10,
        }),
        sort_by: s.stringEnum(
          "Sort order for results.\n- **most_recent_deal** — Date of most recent investment (newest first)\n- **recent_deals** — Deals in last 12 months (highest first)\n- **deals_led_ltm** — Lead deals in last 12 months (highest first)\n- **total_deals** — All-time deal count (highest first)\n- **matching_deals** — Deals matching portfolio filters (highest first)",
          ["most_recent_deal", "recent_deals", "deals_led_ltm", "total_deals", "matching_deals"],
          { default: "most_recent_deal" },
        ),
      },
      { required: [] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          investors: s.array("Investors values.", investorListItemSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_investor_by_identifier",
    description:
      "Use this endpoint when one investor firm is already identified and its full profile, statistics, and portfolio summary are required. Prefer a domain or LinkedIn URL when available; it can be passed directly without calling `/investor/search` first.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get investor by identifier.",
      {
        id: s.string("Investor UUID", { format: "uuid", minLength: 1 }),
        domain: s.string(
          'Investor domain or full URL (e.g., "sequoiacap.com" or "https://sequoiacap.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          investor: investorSchema,
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_investor_deals",
    description:
      "Use this endpoint when an investor firm is already identified and its complete deal history is required. Prefer a domain or LinkedIn URL when available; it can be passed directly without calling `/investor/search` first.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get investor deals.",
      {
        id: s.string("Investor UUID", { format: "uuid", minLength: 1 }),
        domain: s.string(
          'Investor domain or full URL (e.g., "sequoiacap.com" or "https://sequoiacap.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
        page: pageSchema,
        page_size: s.integer("Number of results per page (1-500)", {
          minimum: 1,
          maximum: 500,
          default: 10,
        }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          deals: s.array("Deals values.", investorDealSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_investors",
    description:
      "Use this endpoint primarily to resolve a fuzzy investor-firm name or an uncertain identifier. If a reliable domain or LinkedIn URL is already available, skip this search and pass it directly to `GET /investor` for one full profile or to `POST /investors` for a batch lookup.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for search investors.",
      {
        name: s.string("Investor name (fuzzy search with relevance scoring)", { minLength: 1 }),
        domain: s.string(
          'Investor domain or full URL (e.g., "sequoiacap.com" or "https://sequoiacap.com") — URLs are automatically parsed to extract the domain',
          { minLength: 1 },
        ),
        linkedin: s.string("LinkedIn company URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase organization URL", { minLength: 1 }),
      },
      {
        required: [],
        oneOf: [
          { required: ["name"] },
          { required: ["domain"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          investors: s.array("Investors values.", investorSearchResultSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_people",
    description: "Use this endpoint when the requested result is a list of people.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Filters for search people.",
      {
        person_type: s.stringEnum(
          "Restrict results to one population. `company` returns only people with a\ncurrent employer (founders, executives, employees). `investor` returns only\npeople who invest. `any` (default) returns the union — anyone matching the\nother filter blocks regardless of population.",
          ["company", "investor", "any"],
          { default: "any" },
        ),
        identifiers: s.object(
          "Look up specific people by identifier",
          {
            ids: s.array("Person UUIDs", s.string("Ids item.", { format: "uuid", minLength: 1 })),
            linkedin_urls: s.array(
              "LinkedIn person URLs (max 100)",
              s.string("Linkedin urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
            crunchbase_urls: s.array(
              "Crunchbase person URLs (max 100)",
              s.string("Crunchbase urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
            twitter_urls: s.array("Twitter/X URLs (max 100)", s.string("Twitter urls item.", { minLength: 1 }), {
              maxItems: 100,
            }),
          },
          { required: [] },
        ),
        person: s.object(
          "Person attribute filters",
          {
            roles: s.array(
              "Person's role at their current employer",
              s.stringEnum("Roles item.", ["founder", "ceo", "key_person"]),
            ),
            contact_types: s.array(
              "Available contact info on the person",
              s.stringEnum("Contact types item.", ["linkedin", "email", "phone", "twitter"]),
            ),
            job_titles: s.array("Normalized job-title keys", s.string("Job titles item.", { minLength: 1 })),
            education_schools: s.array(
              "Education institution IDs",
              s.string("Education schools item.", { minLength: 1 }),
            ),
            linkedin_companies: s.array(
              "Filter by previous/current employer LinkedIn company IDs",
              s.string("Linkedin companies item.", { minLength: 1 }),
            ),
          },
          { required: [] },
        ),
        company: s.object(
          "Current-employer attribute filters. Setting any field implicitly requires the person to have a current employer.",
          {
            search_query: s.string(
              'AI-powered semantic search against the person\'s current employer — a flexible replacement for an industry tag. First use /industry/search and apply an `industries` or `super_categories` filter when the taxonomy contains the intended category. Use semantic search only for a niche industry or product type the taxonomy cannot express, describing what that company does — its product, technology, or business model (e.g. "climate tech carbon accounting software"). Do NOT use it for stage, location, or funding — apply dedicated filters instead. Results are ordered by relevance and capped at 150 semantic matches.',
              { minLength: 1 },
            ),
            min_relevance: s.number("Minimum similarity threshold (0-1). Only applies with search_query.", {
              minimum: 0,
              maximum: 1,
            }),
            ids: s.array("Filter by current-employer UUIDs", s.string("Ids item.", { format: "uuid", minLength: 1 })),
            locations: locationsSchema,
            industries: industriesSchema,
            super_categories: s.array(
              "Super category permalinks (auto-includes related industries). Use /industry/search to find permalinks. A value that is not an exact permalink is silently ignored (returns zero results, no error).",
              s.string("Super categories item.", { minLength: 1 }),
            ),
            employee_count: s.array(
              "Current-employer headcount ranges",
              s.stringEnum("Employee count item.", [
                "1-10",
                "11-50",
                "51-100",
                "101-250",
                "251-500",
                "501-1000",
                "1001-5000",
                "5001-10000",
                "10001+",
              ]),
            ),
            ipo_status: s.array(
              "Current-employer IPO status",
              s.stringEnum("Ipo status item.", ["public", "private", "acquired", "delisted"]),
            ),
            total_raised_min: s.number("Minimum total raised by current employer (USD)", {
              minimum: 0,
            }),
            total_raised_max: s.number("Maximum total raised by current employer (USD)", {
              minimum: 0,
            }),
            investor_people_ids: s.array(
              "Person UUIDs — filter to people whose current employer has ever raised\nfrom any of these people as an **angel investor** OR as a **lead partner**\nof an investing firm. Resolve via `/people/{id}`.",
              s.string("Investor people ids item.", { format: "uuid", minLength: 1 }),
            ),
            latest_deal: s.object(
              "Nested. Filters on the current employer's most recent funding round.",
              {
                financing_types: s.array(
                  "Financing types with optional modifiers (pre, extension)",
                  s.object(
                    "Financing types item details.",
                    {
                      type: s.stringEnum("Financing type.", [
                        "SERIES_A",
                        "SERIES_B",
                        "SERIES_C",
                        "SERIES_D",
                        "SERIES_E",
                        "SERIES_F",
                        "SERIES_G",
                        "SERIES_H",
                        "SERIES_I",
                        "SERIES_J",
                        "SERIES_K",
                        "SERIES_L",
                        "SERIES_M",
                        "SEED",
                        "SAFE",
                        "CONVERTIBLE_NOTE",
                        "EQUITY",
                        "PREFERRED",
                        "SECONDARY_MARKET",
                        "DEBT_FINANCING",
                        "GRANT",
                        "NON_EQUITY_ASSISTANCE",
                        "CROWDFUNDING",
                        "INITIAL_COIN_OFFERING",
                        "FUNDING_ROUND",
                      ]),
                      pre: s.boolean({
                        description: "Whether to filter for pre-round financing.",
                        default: false,
                      }),
                      extension: s.boolean({
                        description: "Whether to filter for extension rounds.",
                        default: false,
                      }),
                    },
                    { required: ["type"] },
                  ),
                ),
                size_min: s.number("Minimum latest-deal size (USD)", { minimum: 0 }),
                size_max: s.number("Maximum latest-deal size (USD)", { minimum: 0 }),
                date_start: s.string("Earliest announcement date (ISO 8601).", {
                  format: "date",
                  minLength: 1,
                }),
                date_end: s.string("Latest announcement date (ISO 8601).", {
                  format: "date",
                  minLength: 1,
                }),
                investor_ids: s.array(
                  "Filter to deals where these investor UUIDs participated",
                  s.string("Investor ids item.", { format: "uuid", minLength: 1 }),
                ),
                investor_locations: s.array(
                  "Filter to deals with investors HQ'd in these locations",
                  s.string("Investor locations item.", { minLength: 1 }),
                ),
              },
              { required: [] },
            ),
          },
          { required: [] },
        ),
        investor: s.object(
          "Filters on the investor entity (firm) and on the person's deal activity.\nSetting any field (including any nested `deals.*` field) implicitly requires\nthe person to be an investor.",
          {
            ids: s.array("Firm (parent investor) UUIDs", s.string("Ids item.", { format: "uuid", minLength: 1 })),
            domains: s.array("Firm domains (max 100)", s.string("Domains item.", { minLength: 1 }), { maxItems: 100 }),
            linkedin_urls: s.array("Firm LinkedIn URLs (max 100)", s.string("Linkedin urls item.", { minLength: 1 }), {
              maxItems: 100,
            }),
            crunchbase_urls: s.array(
              "Firm Crunchbase URLs (max 100)",
              s.string("Crunchbase urls item.", { minLength: 1 }),
              { maxItems: 100 },
            ),
            permalinks: s.array("Fundable firm permalinks (max 100)", s.string("Permalinks item.", { minLength: 1 }), {
              maxItems: 100,
            }),
            locations: s.array("Firm HQ location permalinks", s.string("Locations item.", { minLength: 1 })),
            employee_count: s.array(
              "Firm headcount ranges",
              s.stringEnum("Employee count item.", [
                "1-10",
                "11-50",
                "51-100",
                "101-250",
                "251-500",
                "501-1000",
                "1001-5000",
                "5001-10000",
                "10001+",
              ]),
            ),
            deals: s.object(
              "Nested. Combined deal-activity and portfolio-company filters. Includes:\ndeal-level controls (`investment_type`, `min_matching_deals`, `only_lead_deals`),\nround-level filters (`financing_types`, `size_min/max`, `date_start/end`), and\nportfolio-company attributes (`industries`, `super_categories`,\n`portfolio_locations`, `portfolio_employee_count`, `ipo_status`,\n`total_raised_min/max`, plus semantic `search_query` / `min_relevance`).",
              {
                search_query: s.string(
                  'AI-powered semantic search against the person\'s portfolio companies — a flexible replacement for an industry tag. First use /industry/search and apply an `industries` or `super_categories` filter when the taxonomy contains the intended category. Use semantic search only for a niche industry or product type the taxonomy cannot express, describing what those companies do (e.g. "AI infrastructure for model training"). Do NOT use it for stage, location, or funding — apply dedicated filters instead. Results are ordered by relevance and capped at 150 semantic matches.',
                  { minLength: 1 },
                ),
                min_relevance: s.number("Minimum similarity threshold (0-1). Only applies with search_query.", {
                  minimum: 0,
                  maximum: 1,
                }),
                investment_type: s.stringEnum(
                  "Filter by whether the person invests as an angel, under a firm, or both",
                  ["all", "angel", "institutional"],
                  { default: "all" },
                ),
                only_lead_deals: s.boolean({
                  description: "Only count deals where the person/firm was a lead investor",
                  default: false,
                }),
                min_matching_deals: s.integer("Require at least this many deals to match the deal filters", {
                  minimum: 1,
                }),
                financing_types: s.array(
                  "Financing types for the person's investment activity",
                  s.object(
                    "Financing types item details.",
                    {
                      type: s.stringEnum("Financing type.", [
                        "SERIES_A",
                        "SERIES_B",
                        "SERIES_C",
                        "SERIES_D",
                        "SERIES_E",
                        "SERIES_F",
                        "SERIES_G",
                        "SERIES_H",
                        "SERIES_I",
                        "SERIES_J",
                        "SERIES_K",
                        "SERIES_L",
                        "SERIES_M",
                        "SEED",
                        "SAFE",
                        "CONVERTIBLE_NOTE",
                        "EQUITY",
                        "PREFERRED",
                        "SECONDARY_MARKET",
                        "DEBT_FINANCING",
                        "GRANT",
                        "NON_EQUITY_ASSISTANCE",
                        "CROWDFUNDING",
                        "INITIAL_COIN_OFFERING",
                        "FUNDING_ROUND",
                      ]),
                      pre: s.boolean({
                        description: "Whether to filter for pre-round financing.",
                        default: false,
                      }),
                      extension: s.boolean({
                        description: "Whether to filter for extension rounds.",
                        default: false,
                      }),
                    },
                    { required: ["type"] },
                  ),
                ),
                size_min: s.number("Minimum deal size (USD) for the person's deal activity", {
                  minimum: 0,
                }),
                size_max: s.number("Maximum deal size (USD) for the person's deal activity", {
                  minimum: 0,
                }),
                date_start: s.string("Earliest announcement date (ISO 8601).", {
                  format: "date",
                  minLength: 1,
                }),
                date_end: s.string("Latest announcement date (ISO 8601).", {
                  format: "date",
                  minLength: 1,
                }),
                industries: s.array(
                  "Portfolio company industry permalinks",
                  s.string("Industries item.", { minLength: 1 }),
                ),
                super_categories: s.array(
                  "Portfolio company super-category permalinks",
                  s.string("Super categories item.", { minLength: 1 }),
                ),
                portfolio_locations: s.array(
                  "Portfolio company location permalinks",
                  s.string("Portfolio locations item.", { minLength: 1 }),
                ),
                portfolio_employee_count: s.array(
                  "Portfolio company headcount ranges",
                  s.stringEnum("Portfolio employee count item.", [
                    "1-10",
                    "11-50",
                    "51-100",
                    "101-250",
                    "251-500",
                    "501-1000",
                    "1001-5000",
                    "5001-10000",
                    "10001+",
                  ]),
                ),
                ipo_status: s.array(
                  "Portfolio company IPO status",
                  s.stringEnum("Ipo status item.", ["public", "private"]),
                ),
                total_raised_min: s.number("Minimum total raised by the portfolio company (USD)", {
                  minimum: 0,
                }),
                total_raised_max: s.number("Maximum total raised by the portfolio company (USD)", {
                  minimum: 0,
                }),
              },
              { required: [] },
            ),
          },
          { required: [] },
        ),
        page: pageSchema,
        page_size: s.integer("Number of results per page (max 500)", {
          minimum: 1,
          maximum: 500,
          default: 10,
        }),
        sort_by: s.stringEnum(
          "Sort order. All values are universally accepted — non-applicable values (e.g. `lead_deal_count`\nwhen no investor filter is set) resolve to 0 / null via COALESCE and naturally sort to the bottom (DESC).\nIgnored when `company.search_query` or `investor.deals.search_query` is set (results are then\nordered by semantic relevance).",
          [
            "most_recent_deal_date",
            "total_raised",
            "latest_deal_size",
            "name",
            "total_deal_count",
            "deal_count_last_12_months",
            "lead_deal_count",
            "lead_deal_count_last_12_months",
            "filtered_deal_count",
          ],
          { default: "most_recent_deal_date" },
        ),
      },
      { required: [] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          people: s.array("People values.", personSearchResultSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_person",
    description:
      "Use this endpoint when one person is already identified and their full profile is required. Prefer a LinkedIn URL when available; it can be passed directly without calling `/person/search` first.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get person.",
      {
        id: s.string("Person UUID", { format: "uuid", minLength: 1 }),
        linkedin: s.string("LinkedIn person URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase person URL", { minLength: 1 }),
        twitter: s.string("Twitter/X URL", { minLength: 1 }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
          { required: ["twitter"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          person: personDetailSchema,
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_person_email",
    description:
      "Use this endpoint only when a verified email is explicitly required for an identified person. Return a verified email for a person identified by UUID, LinkedIn, Crunchbase, or Twitter/X. Provide one identifier. If multiple identifiers are supplied, the endpoint uses the first non-empty value in this order: `id`, `linkedin`, `crunchbase`, `twitter`. Unlocks contact information for the account; new unlocks cost 5 credits and repeats cost 0. Requires non-trial Pro+, Enterprise, or API plan.",
    requiredScopes: [],
    operationType: "write",
    inputSchema: s.object(
      "Parameters for get person email.",
      {
        id: s.string("Fundable person UUID", { format: "uuid", minLength: 1 }),
        linkedin: s.string("LinkedIn person URL, slug, or supported normalized identifier", {
          minLength: 1,
        }),
        crunchbase: s.string("Crunchbase person URL or supported normalized identifier", {
          minLength: 1,
        }),
        twitter: s.string("Twitter/X URL or handle", { minLength: 1 }),
      },
      {
        required: [],
        anyOf: [
          { required: ["id"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
          { required: ["twitter"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          person_id: s.string("Fundable person UUID.", { format: "uuid" }),
          email: s.string("Verified email address.", { format: "email" }),
          already_unlocked: s.boolean("True when this user previously unlocked the same email."),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_person_phone",
    description:
      "Use this endpoint only when a verified phone number is explicitly required for an identified person. Return a verified phone number for a person identified by UUID, LinkedIn, Crunchbase, or Twitter/X. Provide one identifier. If multiple identifiers are supplied, the endpoint uses the first non-empty value in this order: `id`, `linkedin`, `crunchbase`, `twitter`. Unlocks contact information for the account; new unlocks cost 5 credits and repeats cost 0. Requires non-trial Pro+, Enterprise, or API plan.",
    requiredScopes: [],
    operationType: "write",
    inputSchema: s.object(
      "Parameters for get person phone.",
      {
        id: s.string("Fundable person UUID", { format: "uuid", minLength: 1 }),
        linkedin: s.string("LinkedIn person URL, slug, or supported normalized identifier", {
          minLength: 1,
        }),
        crunchbase: s.string("Crunchbase person URL or supported normalized identifier", {
          minLength: 1,
        }),
        twitter: s.string("Twitter/X URL or handle", { minLength: 1 }),
      },
      {
        required: [],
        anyOf: [
          { required: ["id"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
          { required: ["twitter"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          person_id: s.string("Fundable person UUID.", { format: "uuid" }),
          phone: s.string("Phone number in E.164 format."),
          already_unlocked: s.boolean("True when this account previously unlocked the same phone number."),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_person_deals",
    description:
      "Use this endpoint when a person is already identified and their investment history is required. It returns deals the person joined as an angel plus lead or firm deals. Prefer a LinkedIn URL when available; it can be passed directly without first calling `/person/search`.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get person deals.",
      {
        id: s.string("Person UUID", { format: "uuid", minLength: 1 }),
        linkedin: s.string("LinkedIn person URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase person URL", { minLength: 1 }),
        twitter: s.string("Twitter/X URL", { minLength: 1 }),
        page: pageSchema,
        page_size: s.integer("Number of results per page (1-500)", {
          minimum: 1,
          maximum: 500,
          default: 10,
        }),
      },
      {
        required: [],
        oneOf: [
          { required: ["id"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
          { required: ["twitter"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          deals: s.array("Deals values.", personDealSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_person",
    description:
      "Use this endpoint primarily to resolve a fuzzy person name or uncertain identifier. If a reliable LinkedIn URL is already available, skip this search and pass it directly to `GET /person` for one full profile or to `POST /people` for a batch lookup.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for search person.",
      {
        name: s.string("Fuzzy search by person name", { minLength: 1 }),
        id: s.string("Person UUID", { format: "uuid", minLength: 1 }),
        linkedin: s.string("LinkedIn person URL", { minLength: 1 }),
        crunchbase: s.string("Crunchbase person URL", { minLength: 1 }),
        twitter: s.string("Twitter/X URL", { minLength: 1 }),
        person_type: s.stringEnum(
          "Optional filter restricting results to one pool. `investor` keeps only\npeople tracked as investors/angels; `company` keeps only non-investor\npeople (founders, CEOs, employees). Omit to search both. Applies to\nboth name and identifier modes — identifier lookups return empty if\nthe resolved person doesn't match the requested type.",
          ["investor", "company"],
        ),
      },
      {
        required: [],
        oneOf: [
          { required: ["name"] },
          { required: ["id"] },
          { required: ["linkedin"] },
          { required: ["crunchbase"] },
          { required: ["twitter"] },
        ],
      },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          people: s.array(
            "People values.",
            s.object(
              "People item details.",
              {
                id: s.string("Unique Fundable record identifier.", { format: "uuid" }),
                name: s.string("Display name of the record."),
                linkedin_url: s.nullable(s.string("LinkedIn profile URL.", { format: "uri" })),
                crunchbase_url: s.nullable(s.string("Crunchbase profile URL.", { format: "uri" })),
                twitter_url: s.nullable(s.string("Twitter/X profile URL.", { format: "uri" })),
                person_type: s.stringEnum(
                  "Which pool the result came from. Mirrors the request-body discriminator on POST /people.",
                  ["investor", "company"],
                ),
              },
              {
                required: [],
                additionalProperties: true,
              },
            ),
          ),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_alerts",
    description:
      "Retrieve saved alert data including all deals that matched the alert criteria within the specified date range. Results include a flattened array of deals sorted by date (newest first) with duplicates removed. Requires Pro+ or Enterprise; consumes no credits.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for get alerts.",
      {
        alert_ids: s.string(
          'Comma-separated list of alert UUIDs (up to 10 alerts per request).\nAll alerts must be associated with your API key\'s account.\nExample: "uuid1,uuid2,uuid3"',
          { minLength: 1 },
        ),
        start_date: s.string(
          "Start date for the alert data range (ISO 8601 format).\nResults will include deals from this date onwards.",
          { format: "date-time", minLength: 1 },
        ),
        end_date: s.string(
          "End date for the alert data range (ISO 8601 format).\nResults will include deals up to and including this date.\n\n**Note:** All dates are processed in UTC timezone. Deals are grouped into time periods based on UTC date boundaries.",
          { format: "date-time", minLength: 1 },
        ),
      },
      { required: ["alert_ids", "start_date", "end_date"] },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          alerts: s.array("Array of alert configurations with their timeline data", alertSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "get_alert_configurations",
    description:
      "Retrieve all alert configurations for the authenticated user (identified by API key). Returns configuration metadata including filters, frequency, and descriptions. Requires Pro+ or Enterprise; consumes no credits.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object("Parameters for get alert configurations.", {}, { required: [] }),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          configurations: s.array("Array of alert configurations for this email", alertConfigurationSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_locations",
    description:
      "Use this endpoint to resolve a human-readable city, state, country, or region into the exact permalink required by location filters on discovery endpoints. Agents should not guess permalinks. Select the result that matches the user's intended geography, then pass its permalink to the relevant filter.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for search locations.",
      {
        name: s.string("Location name to search for", { minLength: 1 }),
        type: s.stringEnum("Filter by specific location type", ["CITY", "STATE", "REGION", "COUNTRY"]),
        location_type: s.stringEnum("Alias for 'type' parameter", ["CITY", "STATE", "REGION", "COUNTRY"]),
      },
      { required: ["name"], not: { required: ["type", "location_type"] } },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          locations: s.array("Locations values.", locationSearchResultSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
  defineProviderAction("fundable", {
    name: "search_industries",
    description:
      "Use this endpoint before semantic search to resolve a human-readable category into an exact `INDUSTRY` or `SUPER_CATEGORY` permalink. Agents should not guess permalinks. If the taxonomy has an appropriate result, use its permalink in the structured industry filter. Use `search_query` only when the requested niche is not represented by the taxonomy.",
    requiredScopes: [],
    operationType: "read",
    inputSchema: s.object(
      "Parameters for search industries.",
      {
        name: s.string("Industry name to search for", { minLength: 1 }),
        type: s.stringEnum("Filter by specific industry type", ["INDUSTRY", "SUPER_CATEGORY"]),
        industry_type: s.stringEnum("Alias for 'type' parameter", ["INDUSTRY", "SUPER_CATEGORY"]),
      },
      { required: ["name"], not: { required: ["type", "industry_type"] } },
    ),
    outputSchema: fundableResponse(
      s.object(
        "Requested Fundable records.",
        {
          industries: s.array("Industries values.", industrySearchResultSchema),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
  }),
];
interface FundableRoute {
  method: "GET" | "POST";
  path: string;
}
export const fundableRoutes: Record<string, FundableRoute> = {
  search_deals: { method: "POST", path: "/deals" },
  get_deal_by_id: { method: "GET", path: "/deals/{id}" },
  get_deal_investors: { method: "GET", path: "/deals/{id}/investors" },
  get_company: { method: "GET", path: "/company" },
  get_company_deals: { method: "GET", path: "/company/deals" },
  search_company: { method: "GET", path: "/company/search" },
  search_companies: { method: "POST", path: "/companies" },
  list_investors: { method: "POST", path: "/investors" },
  get_investor_by_identifier: { method: "GET", path: "/investor" },
  get_investor_deals: { method: "GET", path: "/investor/deals" },
  search_investors: { method: "GET", path: "/investor/search" },
  search_people: { method: "POST", path: "/people" },
  get_person: { method: "GET", path: "/person" },
  get_person_email: { method: "GET", path: "/person/email" },
  get_person_phone: { method: "GET", path: "/person/phone" },
  get_person_deals: { method: "GET", path: "/person/deals" },
  search_person: { method: "GET", path: "/person/search" },
  get_alerts: { method: "GET", path: "/alerts" },
  get_alert_configurations: { method: "GET", path: "/alerts/configurations" },
  search_locations: { method: "GET", path: "/location/search" },
  search_industries: { method: "GET", path: "/industry/search" },
};
