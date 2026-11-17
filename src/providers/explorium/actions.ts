import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const businessId = s.string("The business ID returned by matching.", { pattern: "^[a-f0-9]{32}$" });
const requestContext = s.looseObject("Optional request context forwarded to Explorium.", {});
const responseContext = s.looseObject("Request status and diagnostic context.", {
  correlation_id: s.string("The upstream correlation ID."),
  request_status: s.string("The upstream status: success, miss, or failure."),
  time_took_in_seconds: s.number("Upstream processing time in seconds."),
});
const businessAttributes = {
  ...s.object(
    "Business identifiers; provide at least one.",
    {
      name: s.nonWhitespaceString("The business name.", { maxLength: 256 }),
      domain: s.nonWhitespaceString("The business website domain."),
      url: s.nonWhitespaceString("The business URL, such as its LinkedIn company URL."),
    },
    { optional: ["name", "domain", "url"] },
  ),
  minProperties: 1,
};
const enrichmentInput = s.object(
  "Enrich one to fifty matched businesses.",
  {
    business_ids: s.array("Business IDs to enrich.", businessId, { minItems: 1, maxItems: 50 }),
    request_context: requestContext,
    parameters: s.looseObject("Optional enrichment parameters forwarded to Explorium.", {}),
  },
  { optional: ["request_context", "parameters"] },
);
const firmographics = s.looseObject("Company attributes; additional upstream fields are preserved.", {
  business_id: s.string("The matched business ID."),
  name: s.string("The business name."),
  website: s.string("The business website URL."),
  country_name: s.string("The business country name."),
  number_of_employees_range: s.string("The employee count range."),
  yearly_revenue_range: s.string("The yearly revenue range."),
  linkedin_profile: s.string("The LinkedIn company profile URL."),
});
const technographics = s.looseObject("Technology attributes; additional upstream fields are preserved.", {
  full_tech_stack: s.array("All detected technologies.", s.string("A technology name.")),
  full_nested_tech_stack: s.array(
    "Technology details grouped by category.",
    s.looseObject("An upstream technology record.", {}),
  ),
});
function enrichmentOutput(dataSchema: Record<string, unknown>) {
  return s.object(
    "Batch enrichment results, including unmatched rows without data.",
    {
      response_context: responseContext,
      total_results: s.integer("The total number of results."),
      data: s.array(
        "Enrichment results for the supplied business IDs.",
        s.looseObject("One business enrichment result.", {
          business_id: s.string("The requested business ID."),
          data: s.nullable(dataSchema),
        }),
      ),
    },
    { required: ["response_context", "total_results"], additionalProperties: true },
  );
}
export const exploriumActions: ActionDefinition[] = [
  defineProviderAction("explorium", {
    name: "match_businesses",
    operationType: "read",
    requiredScopes: [],
    description:
      "Match one to fifty businesses by name, domain, or URL to Explorium business IDs. Results preserve input order; unmatched rows have no business ID. Requests may consume credits.",
    inputSchema: s.object(
      "Business matching input.",
      {
        businesses_to_match: s.array("Businesses to match in input order.", businessAttributes, {
          minItems: 1,
          maxItems: 50,
        }),
        request_context: requestContext,
      },
      { optional: ["request_context"] },
    ),
    outputSchema: s.object(
      "Business matches in input order.",
      {
        response_context: responseContext,
        total_results: s.integer("The number of submitted business results."),
        total_matches: s.integer("The number of matched businesses."),
        matched_businesses: s.array(
          "Matched and unmatched business results.",
          s.looseObject("One business match.", {
            input: s.looseObject("The original business identifiers.", {
              name: s.string("The submitted business name."),
              domain: s.string("The submitted business domain."),
              url: s.string("The submitted business URL."),
            }),
            business_id: s.nullable(s.string("The matched ID; null or absent when unmatched.")),
          }),
        ),
      },
      { required: ["response_context", "total_results", "total_matches"], additionalProperties: true },
    ),
  }),
  defineProviderAction("explorium", {
    name: "enrich_firmographics",
    operationType: "read",
    requiredScopes: [],
    description:
      "Retrieve company profiles for one to fifty Explorium business IDs, including industry, location, employee count, and revenue. Obtain IDs with match_businesses first. Requests may consume credits.",
    inputSchema: enrichmentInput,
    outputSchema: enrichmentOutput(firmographics),
  }),
  defineProviderAction("explorium", {
    name: "enrich_technographics",
    operationType: "read",
    requiredScopes: [],
    description:
      "Retrieve technology stacks for one to fifty Explorium business IDs. Obtain IDs with match_businesses first. Requests may consume credits.",
    inputSchema: enrichmentInput,
    outputSchema: enrichmentOutput(technographics),
  }),
  defineProviderAction("explorium", {
    name: "autocomplete_businesses",
    operationType: "read",
    requiredScopes: [],
    description:
      "Find Explorium business filter values by field and optional partial query, including countries, industries, company names, and technologies.",
    inputSchema: s.object(
      "Business filter autocomplete input.",
      {
        field: s.stringEnum("The field to autocomplete.", [
          "country",
          "country_code",
          "region_country_code",
          "google_category",
          "naics_category",
          "linkedin_category",
          "company_tech_stack_tech",
          "company_tech_stack_categories",
          "job_title",
          "company_size",
          "company_revenue",
          "number_of_locations",
          "company_age",
          "job_department",
          "job_level",
          "city_region_country",
          "company_name",
        ]),
        query: s.string("Partial search text; omitted means an empty query."),
      },
      { optional: ["query"] },
    ),
    outputSchema: s.requiredObject("Autocomplete suggestions.", {
      items: s.array(
        "Suggested filter values.",
        s.looseObject("One autocomplete suggestion.", {
          query: s.string("The original search query."),
          label: s.string("The suggestion display label."),
          value: s.string("The filter value to use in API requests."),
        }),
      ),
    }),
  }),
];
