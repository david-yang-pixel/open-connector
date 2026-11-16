import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const company = s.looseObject("Existing company identity and upstream fields.", {
  uuid: s.string("Company UUID for downstream actions."),
  name: s.string("Company name."),
  website: s.string("Company website."),
});
const handle = s.anyOf("Addition handle: a pending request ID or an already existing company.", [
  s.requiredObject("Pending addition request.", {
    request_id: s.string("Request ID.", { minLength: 1, not: { enum: [".", ".."] } }),
  }),
  s.requiredObject("Already existing company.", { company }),
]);
const search_news = defineProviderAction("akta", {
  name: "search_news",
  description: "Search company, industry and topic news with entity, date, taxonomy and sentiment filters.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "search news parameters.",
    {
      company: s.string("Website (e.g. 'https://canva.com') or company UUID returned by the Company Search API."),
      primary_company: s.string(
        "Filter to return only articles where the specified company is the primary company featured. Cannot be used with the `company` parameter.",
      ),
      industry: s.string(
        "Comma separated list of industry codes to filter articles by. Use industry search endpoint to fetch the list of industry codes for a given industry topic.",
      ),
      query: s.string("Topic name to search articles. Allows open-ended topic name. Eg. Crude oil price developments"),
      title: s.string("Search articles by title. Cannot be used with query."),
      start_date: s.string(
        "Start of the date range, formatted as YYYY-MM-DD. Non-enterprise plans are limited to a 6-month lookback.",
        { format: "date" },
      ),
      end_date: s.string("End of the date range, formatted as YYYY-MM-DD. Default = today.", {
        format: "date",
      }),
      limit: s.integer("Maximum number of news articles to return. Default = 10, Max = 100.", {
        maximum: 100,
      }),
      offset: s.integer("Number of results to skip before returning records. Use with limit for pagination."),
      unique_article: s.boolean(
        "Group similar articles from the same event, using the field documented by the endpoint reference. Do not combine with group_articles.",
      ),
      group_articles: s.boolean(
        "Group similar articles from the same event, using the field documented by the OpenAPI specification. Do not combine with unique_article.",
      ),
      news_score_list: s.stringEnum(
        "Filter by news score tier. Accepted values: High, Medium, Low, all. Default = all",
        ["High", "Medium", "Low", "all"],
      ),
      countries: s.string(
        "Filters articles based on the country of the event. Comma separated list of ISO country codes.",
      ),
      blacklisted: s.string("Comma separated list of publisher domains to exclude."),
      type_list: s.string(
        "Filter by news type. Download full list from https://playground.akta.pro/news-tags.csv. Default = all.",
      ),
      sentiment_list: s.string(
        "Comma-separated list of sentiments to filter by. Accepted values: positive, negative, neutral, all. Default = all. Example: sentiment_list=positive,negative",
      ),
      entity_person_list: s.string("Comma separated list of people names."),
      entity_location_list: s.string("Comma separated list of locations."),
      entity_product_list: s.string("Comma separated list of product names."),
      entity_event_list: s.string("Comma separated list of event names."),
      naics_code_list: s.string("Comma separated list of NAICS codes."),
      sic_code_list: s.string("Comma separated list of SIC codes."),
      iptc_code_list: s.string("Comma separated list of IPTC codes."),
      iab_code_list: s.string("Comma separated list of IAB codes."),
    },
    {
      optional: [
        "company",
        "primary_company",
        "industry",
        "query",
        "title",
        "start_date",
        "end_date",
        "limit",
        "offset",
        "group_articles",
        "unique_article",
        "news_score_list",
        "countries",
        "blacklisted",
        "type_list",
        "sentiment_list",
        "entity_person_list",
        "entity_location_list",
        "entity_product_list",
        "entity_event_list",
        "naics_code_list",
        "sic_code_list",
        "iptc_code_list",
        "iab_code_list",
      ],
      allOf: [
        { not: { required: ["company", "primary_company"] } },
        { not: { required: ["query", "title"] } },
        { not: { required: ["group_articles", "unique_article"] } },
      ],
    },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    status: s.string("Upstream response status."),
    total: s.integer("Total matching articles available."),
    count: s.integer("Number of articles returned in the data array."),
    limit: s.integer("Applied page size."),
    offset: s.integer("Applied pagination offset."),
    credits_consumed: s.number("API credits consumed."),
    data: s.array("Returned records or company data.", s.looseObject("One returned item.", {})),
  }),
});
const search_companies = defineProviderAction("akta", {
  name: "search_companies",
  description: "Resolve a company name, website or UUID into matching companies.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("search companies parameters.", {
    query: s.string(
      "A company name, website. The backend automatically resolves the input type. Examples: https://canva.com, canva",
    ),
  }),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.array("Returned records or company data.", company),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const enrich_company = defineProviderAction("akta", {
  name: "enrich_company",
  description:
    "Enrich a company with any of the 16 data sections; funding and M&A sections require a subscription or Enterprise plan.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "enrich company parameters.",
    {
      company: s.string(
        "Company website (e.g. 'https://canva.com') or a company UUID (e.g. '00031n-tesla'). The UUID can be obtained from the Company Search API.",
      ),
      sections: s.string(
        "Comma-separated list of sections to return. Copy-paste example: `firmographic,business_model,company_assessment,trust_signal,company_hierarchy,digital_presence,financial_estimate,location,management_profile,product_offering,strategic_signal,customer_profile,industry,technology,funding_detail,mna_and_investment`. Note: `funding_detail` and `mna_and_investment` are available on the subscription and Enterprise tier only.",
      ),
    },
    { optional: ["sections"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    status: s.string("Upstream response status."),
    data: s.looseObject("Enriched company data keyed by section name.", {}),
    count: s.integer("Number of sections returned."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_product_reviews = defineProviderAction("akta", {
  name: "get_product_reviews",
  description: "List company products and retrieve reviews for selected product IDs.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "get product reviews parameters.",
    {
      company: s.string(
        "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
      ),
      products: s.array(
        "List of product_id values to fetch reviews for. Pass the parameter multiple times to request more than one product. If omitted, the response returns the product list only.",
        s.string("One returned item."),
      ),
      limit: s.integer("Maximum number of reviews to return per product. Only applies when products is provided.", {
        maximum: 50,
      }),
      offset: s.integer("Number of reviews to skip before returning records. Use with limit for pagination."),
    },
    { optional: ["products", "limit", "offset"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {}),
    limit: s.integer("Applied page size."),
    offset: s.integer("Applied pagination offset."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_employee_reviews = defineProviderAction("akta", {
  name: "get_employee_reviews",
  description: "Read employee ratings and paginated reviews for a company.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "get employee reviews parameters.",
    {
      company: s.string(
        "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
      ),
      limit: s.integer("Maximum number of reviews to return.", { maximum: 100 }),
      offset: s.integer("Number of reviews to skip before returning records. Use with limit for pagination."),
    },
    { optional: ["limit", "offset"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {}),
    limit: s.integer("Applied page size."),
    offset: s.integer("Applied pagination offset."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const search_industries = defineProviderAction("akta", {
  name: "search_industries",
  description: "Resolve an industry topic into ranked taxonomy codes.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "search industries parameters.",
    {
      query: s.string("Free-text industry name or topic to search for. Example: 'warehouse automation'"),
      level: s.string(
        "Restrict results to one or more levels of the industry taxonomy hierarchy. Accepts a single level or a comma-separated list of multiple levels. Available values: l1, l2, l3, l4, all. Default is l4.",
      ),
    },
    { optional: ["level"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.array("Returned records or company data.", s.looseObject("One returned item.", {})),
    count: s.integer("Number of industry objects returned in the data array."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_headcount_trends = defineProviderAction("akta", {
  name: "get_headcount_trends",
  description: "Read company employee counts, growth history and functional breakdowns.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("get headcount trends parameters.", {
    company: s.string(
      "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
    ),
  }),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {}),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_job_posts = defineProviderAction("akta", {
  name: "get_job_posts",
  description: "Read paginated live company job listings.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "get job posts parameters.",
    {
      company: s.string(
        "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
      ),
      limit: s.integer("Maximum number of job listings to return."),
      offset: s.integer("Number of listings to skip before returning records."),
    },
    { optional: ["limit", "offset"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    status: s.string("Upstream response status."),
    data: s.array("Returned records or company data.", s.looseObject("One returned item.", {})),
    count: s.integer("Number of returned records."),
    limit: s.integer("Applied page size."),
    offset: s.integer("Applied pagination offset."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_social_posts = defineProviderAction("akta", {
  name: "get_social_posts",
  description: "Read paginated company social posts and engagement data.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "get social posts parameters.",
    {
      company: s.string(
        "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
      ),
      limit: s.integer("Maximum number of posts to return."),
      offset: s.integer("Number of posts to skip before returning records."),
    },
    { optional: ["limit", "offset"] },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {}),
    count: s.integer("Number of returned records."),
    limit: s.integer("Applied page size."),
    offset: s.integer("Applied pagination offset."),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_website_traffic = defineProviderAction("akta", {
  name: "get_website_traffic",
  description: "Read company website engagement, traffic history and acquisition channels.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("get website traffic parameters.", {
    company: s.string(
      "Company website (e.g. 'canva.com') or a company UUID. The UUID can be obtained from the Company Search API.",
    ),
  }),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {}),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const add_company = defineProviderAction("akta", {
  name: "add_company",
  description:
    "Submit a missing company for addition, or return the existing company. Use the returned handle with get_addition_result to wait for completion.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: s.requiredObject("add company parameters.", {
    company_name: s.string("Name of the company to add. Example: solios"),
    website: s.string(
      "Primary website URL of the company. Used to disambiguate and resolve the company. Example: https://www.soleosenergy.com/",
    ),
  }),
  outputSchema: s.object(
    "Company addition response with a reusable async handle.",
    {
      already_exists: s.boolean("Whether the company already exists."),
      company: s.nullable(company),
      request_id: s.nullableString("Request ID, or null when the company already exists."),
      status: s.nullableString("Submission status, or null when the company already exists."),
      domain: s.string("Resolved company domain."),
      credits_consumed: s.number("API credits consumed."),
      handle,
    },
    {
      required: ["handle"],
      additionalProperties: true,
    },
  ),
  asyncLifecycle: {
    startActionId: "akta.add_company",
    statusActionId: "akta.get_addition_result",
  },
});
const get_request_status = defineProviderAction("akta", {
  name: "get_request_status",
  description: "Read an asynchronous request by its request ID.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("get request status parameters.", {
    request_id: s.string(
      "The unique identifier of the request to check, returned when the original request was submitted. Example: 2db01b38-5c81-4b3f-b76d-8b36aeed603b",
      { minLength: 1, not: { enum: [".", ".."] } },
    ),
  }),
  outputSchema: s.object(
    "Request status and company addition details.",
    {
      request_id: s.string("Request ID."),
      request_type: s.string("Request type."),
      status: s.string("Request state: pending, in_progress, completed or failed."),
      detail: s.looseObject("Company addition details, including reason and company_uuid when available.", {}),
    },
    {
      required: ["status"],
      additionalProperties: true,
    },
  ),
});
const generate_company_list = defineProviderAction("akta", {
  name: "generate_company_list",
  description:
    "Generate a company list using a natural language query or structured filters, with optional enrichment.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "generate company list parameters.",
    {
      query: s.string(
        "Natural language search query (e.g. 'SaaS companies in the US with Series A funding'). Cannot be used with filters.",
      ),
      filters: s.looseObject(
        "Structured filter conditions. Use the Filter Builder API to generate valid filters. Cannot be used with query. See filter options at /api-reference/listgen-api.",
        {},
      ),
      sections: s.array(
        "Data enrichment sections to include. Values: firmographic, business_model, company_assessment, trust_signal, company_hierarchy, digital_presence, financial_estimate, location, management_profile, product_offering, strategic_signal, customer_profile, industry, technology, funding_detail (Subscription, Enterprise), mna_and_investment (Subscription, Enterprise)",
        s.string("One returned item."),
      ),
      sort_by: s.stringEnum("Field to sort results by. Default: relevance", [
        "relevance",
        "revenue_estimate",
        "valuation_estimate",
        "employee_range",
        "total_funding",
        "founded_year",
      ]),
      sort_order: s.stringEnum("Sort direction. Default: desc", ["asc", "desc"]),
      limit: s.integer("Maximum companies to return. Default: 50, Max: 500", { maximum: 500 }),
      offset: s.integer("Number of results to skip for pagination. Default: 0"),
    },
    {
      optional: ["query", "filters", "sections", "sort_by", "sort_order", "limit", "offset"],
      not: { required: ["query", "filters"] },
    },
  ),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.array(
      "Returned records or company data.",
      s.looseObject(
        "Company object with identity fields (uuid, name, website) plus any requested enrichment sections.",
        {},
      ),
    ),
    count: s.integer("Number of companies returned."),
    total_count: s.integer("Total matching companies. Capped at 500."),
    credits_consumed: s.number("Credits consumed. Returns 0 when no enrichment sections requested."),
  }),
});
const build_filters = defineProviderAction("akta", {
  name: "build_filters",
  description: "Convert a natural language company description into structured list filters.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("build filters parameters.", {
    query: s.string(
      "Natural language description of target companies (e.g. 'series a companies in mumbai working in climate tech').",
    ),
  }),
  outputSchema: s.looseObject("Akta response with upstream fields preserved.", {
    data: s.looseObject("Returned records or company data.", {
      filters: s.looseObject("Structured filters to pass to generate_company_list.", {}),
    }),
    credits_consumed: s.number("API credits consumed."),
  }),
});
const get_addition_result = defineProviderAction("akta", {
  name: "get_addition_result",
  description: "Wait for company addition using the submission handle; existing companies complete immediately.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("Company addition result parameters.", { handle }),
  outputSchema: s.object(
    "Company addition result.",
    {
      status: s.string("Request state: pending, in_progress, completed or failed."),
      company,
      detail: s.looseObject("Addition details, including company_uuid on completion or reason on failure.", {}),
      request_id: s.string("Request ID when a task was created."),
    },
    {
      required: ["status"],
      additionalProperties: true,
    },
  ),
});
export const aktaActions: ActionDefinition[] = [
  search_news,
  search_companies,
  enrich_company,
  get_product_reviews,
  get_employee_reviews,
  search_industries,
  get_headcount_trends,
  get_job_posts,
  get_social_posts,
  get_website_traffic,
  add_company,
  get_request_status,
  generate_company_list,
  build_filters,
  get_addition_result,
];
interface AktaRoute {
  method: string;
  path: string;
  timeoutMs?: number;
}
export const aktaRoutes: Record<string, AktaRoute> = {
  search_news: {
    method: "GET",
    path: "/v1/news/",
  },
  search_companies: {
    method: "GET",
    path: "/v1/company/search/",
  },
  enrich_company: {
    method: "GET",
    path: "/v1/company/enrichment/",
  },
  get_product_reviews: {
    method: "GET",
    path: "/v1/company/product-reviews/",
  },
  get_employee_reviews: {
    method: "GET",
    path: "/v1/company/employee-reviews/",
  },
  search_industries: {
    method: "GET",
    path: "/v1/industry/search/",
  },
  get_headcount_trends: {
    method: "GET",
    path: "/v1/company/headcount-trends/",
    timeoutMs: 150000,
  },
  get_job_posts: {
    method: "GET",
    path: "/v1/company/jobs/",
    timeoutMs: 180000,
  },
  get_social_posts: {
    method: "GET",
    path: "/v1/company/posts/",
    timeoutMs: 150000,
  },
  get_website_traffic: {
    method: "GET",
    path: "/v1/company/website-traffic/",
    timeoutMs: 60000,
  },
  add_company: {
    method: "POST",
    path: "/v1/company/addition-requests/",
  },
  get_request_status: {
    method: "GET",
    path: "/v1/status/{request_id}/",
  },
  generate_company_list: {
    method: "POST",
    path: "/v1/list/generate/companies/",
    timeoutMs: 90000,
  },
  build_filters: {
    method: "POST",
    path: "/v1/list/filter-builder/",
  },
};
