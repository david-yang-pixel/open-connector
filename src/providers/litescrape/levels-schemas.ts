import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const levelsTools: DataTool[] = [
  {
    name: "levels_search",
    path: "/api/levels/search",
    description: "Search Levels.fyi jobs by company, location, level and pay.",
    input: s.object(
      "Levels.fyi Search parameters.",
      {
        q: s.nullable(
          s.string("Job title, keywords or company; omit to browse.", {
            minLength: 1,
            maxLength: 512,
          }),
        ),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        company: s.nullable(s.string("Company slug, such as google.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" })),
        location: s.nullable(
          s.string("Levels.fyi location slug, such as united-states; not a free-text city name.", {
            pattern: "^[a-z0-9][a-z0-9-]{0,127}$",
          }),
        ),
        sort: s.withEnum(s.unknown("Result ordering."), ["relevance", "date_published", "total_compensation"]),
        limit: s.integer("Companies per page; jobs are grouped by company.", {
          minimum: 1,
          maximum: 20,
        }),
        jobs_per_company: s.integer("Maximum matching jobs included for each company.", {
          minimum: 1,
          maximum: 15,
        }),
        companies: s.nullable(
          s.array(
            "Company slugs as a JSON array; mutually exclusive with company. A single company advances jobs instead of company groups.",
            s.string("companies value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        locations: s.nullable(
          s.array(
            'City, state or country slugs as a JSON array, such as ["united-states","canada"]. Mutually exclusive with location.',
            s.string("locations value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        job_families: s.nullable(
          s.array(
            'Job-family slugs as a JSON array, such as ["software-engineer"].',
            s.string("job families value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        levels: s.nullable(
          s.array(
            "Standard seniority levels as a JSON array.",
            s.withEnum(s.unknown("levels value. item."), [
              "internship",
              "entry",
              "mid_staff",
              "principal",
              "manager",
              "director",
              "executive",
            ]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        employment_types: s.nullable(
          s.array(
            "Employment types as a JSON array.",
            s.withEnum(s.unknown("employment types value. item."), [
              "full_time",
              "part_time",
              "contract",
              "temporary",
              "internship",
              "volunteer",
              "other",
            ]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        work_arrangements: s.nullable(
          s.array(
            "Work arrangements as a JSON array.",
            s.withEnum(s.unknown("work arrangements value. item."), ["remote", "office", "hybrid"]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        min_base_compensation: s.nullable(s.integer("Minimum annual base compensation in USD.", { minimum: 0 })),
        min_total_compensation: s.nullable(
          s.integer("Minimum median annual total compensation in USD; may include Levels.fyi estimates.", {
            minimum: 0,
          }),
        ),
        company_types: s.nullable(
          s.array(
            "Company types as a JSON array.",
            s.withEnum(s.unknown("company types value. item."), [
              "private",
              "public",
              "nonprofit",
              "government",
              "education",
              "delisted",
            ]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        company_sizes: s.nullable(
          s.array(
            "Company sizes as a JSON array: seed 1–50, early 51–200, mid 201–1,000, large 1,001–10,000, enterprise 10,001+ employees.",
            s.withEnum(s.unknown("company sizes value. item."), ["seed", "early", "mid", "large", "enterprise"]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        company_valuations: s.nullable(
          s.array(
            "Company valuation ranges in USD as a JSON array of [minimum, maximum] pairs.",
            s.array("company valuations value. item.", s.integer("company valuations value. item. item."), {
              minItems: 2,
              maxItems: 2,
            }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        perk_ids: s.nullable(
          s.array(
            "Benefit IDs as a JSON array, for example 58 remote work, 4 retirement plan, 35 paid time off, 22 health insurance.",
            s.integer("perk ids value. item."),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        posted_within: s.nullable(s.integer("Maximum posting age in posted_within_unit units.", { minimum: 1 })),
        posted_within_unit: s.withEnum(s.unknown("Unit for posted_within."), ["days", "weeks", "months"]),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Levels.fyi Search asynchronous parameters.",
      {
        q: s.string("Job title, keywords or company; omit to browse.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        company: s.string("Company slug, such as google.", {
          pattern: "^[a-z0-9][a-z0-9-]{0,127}$",
        }),
        location: s.string("Levels.fyi location slug, such as united-states; not a free-text city name.", {
          pattern: "^[a-z0-9][a-z0-9-]{0,127}$",
        }),
        sort: s.withEnum(s.unknown("Result ordering."), ["relevance", "date_published", "total_compensation"]),
        limit: s.integer("Companies per page; jobs are grouped by company.", {
          minimum: 1,
          maximum: 20,
        }),
        jobs_per_company: s.integer("Maximum matching jobs included for each company.", {
          minimum: 1,
          maximum: 15,
        }),
        companies: s.array(
          "Company slugs as a JSON array; mutually exclusive with company. A single company advances jobs instead of company groups.",
          s.string("companies value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
          { minItems: 1, maxItems: 100 },
        ),
        locations: s.array(
          'City, state or country slugs as a JSON array, such as ["united-states","canada"]. Mutually exclusive with location.',
          s.string("locations value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
          { minItems: 1, maxItems: 100 },
        ),
        job_families: s.array(
          'Job-family slugs as a JSON array, such as ["software-engineer"].',
          s.string("job families value. item.", { pattern: "^[a-z0-9][a-z0-9-]{0,127}$" }),
          { minItems: 1, maxItems: 100 },
        ),
        levels: s.array(
          "Standard seniority levels as a JSON array.",
          s.withEnum(s.unknown("levels value. item."), [
            "internship",
            "entry",
            "mid_staff",
            "principal",
            "manager",
            "director",
            "executive",
          ]),
          { minItems: 1, maxItems: 100 },
        ),
        employment_types: s.array(
          "Employment types as a JSON array.",
          s.withEnum(s.unknown("employment types value. item."), [
            "full_time",
            "part_time",
            "contract",
            "temporary",
            "internship",
            "volunteer",
            "other",
          ]),
          { minItems: 1, maxItems: 100 },
        ),
        work_arrangements: s.array(
          "Work arrangements as a JSON array.",
          s.withEnum(s.unknown("work arrangements value. item."), ["remote", "office", "hybrid"]),
          { minItems: 1, maxItems: 100 },
        ),
        min_base_compensation: s.integer("Minimum annual base compensation in USD.", {
          minimum: 0,
        }),
        min_total_compensation: s.integer(
          "Minimum median annual total compensation in USD; may include Levels.fyi estimates.",
          { minimum: 0 },
        ),
        company_types: s.array(
          "Company types as a JSON array.",
          s.withEnum(s.unknown("company types value. item."), [
            "private",
            "public",
            "nonprofit",
            "government",
            "education",
            "delisted",
          ]),
          { minItems: 1, maxItems: 100 },
        ),
        company_sizes: s.array(
          "Company sizes as a JSON array: seed 1–50, early 51–200, mid 201–1,000, large 1,001–10,000, enterprise 10,001+ employees.",
          s.withEnum(s.unknown("company sizes value. item."), ["seed", "early", "mid", "large", "enterprise"]),
          { minItems: 1, maxItems: 100 },
        ),
        company_valuations: s.array(
          "Company valuation ranges in USD as a JSON array of [minimum, maximum] pairs.",
          s.array("company valuations value. item.", s.integer("company valuations value. item. item."), {
            minItems: 2,
            maxItems: 2,
          }),
          { minItems: 1, maxItems: 100 },
        ),
        perk_ids: s.array(
          "Benefit IDs as a JSON array, for example 58 remote work, 4 retirement plan, 35 paid time off, 22 health insurance.",
          s.integer("perk ids value. item."),
          { minItems: 1, maxItems: 100 },
        ),
        posted_within: s.integer("Maximum posting age in posted_within_unit units.", {
          minimum: 1,
        }),
        posted_within_unit: s.withEnum(s.unknown("Unit for posted_within."), ["days", "weeks", "months"]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Levels.fyi Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      jobs_results: s.array("jobs results value.", s.looseObject("jobs results value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.looseObject("litescrape pagination value.", {}),
      available_filters: s.nullable(
        s.array("available filters value.", s.looseObject("available filters value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
