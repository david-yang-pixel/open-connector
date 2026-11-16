import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const glassdoorTools: DataTool[] = [
  {
    name: "glassdoor_search",
    path: "/api/glassdoor/search",
    description: "Search Glassdoor jobs by keyword and location, with salary, seniority and remote filters.",
    input: s.object(
      "Glassdoor Search parameters.",
      {
        q: s.nullable(
          s.string("Job title, keywords or company. Omit to browse using only location and filters.", {
            minLength: 1,
            maxLength: 512,
          }),
        ),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        location: s.nullable(
          s.string(
            "Free-text city, state, country or postal code. Use location_id and location_type for an exact location instead.",
            { minLength: 1, maxLength: 512 },
          ),
        ),
        page_token: s.nullable(
          s.string("Copy next_page_token with its next_page and the same search parameters to continue.", {
            minLength: 1,
            maxLength: 32768,
            pattern: "^[A-Za-z0-9+/=_-]+$",
          }),
        ),
        location_id: s.nullable(
          s.integer("Glassdoor location ID, for example 1132348 for New York. Omit for nationwide search.", {
            minimum: 1,
          }),
        ),
        location_type: s.nullable(
          s.withEnum(s.unknown("Location type: C city, S state, N country. Required with location_id."), [
            "C",
            "S",
            "N",
          ]),
        ),
        location_country: s.nullable(
          s.string(
            "Restrict the free-text location to this two-letter country, for example GB for London, England. Requires location.",
            { pattern: "^[A-Z]{2}$" },
          ),
        ),
        radius: s.nullable(
          s.integer("Distance in miles; 0 means the exact location. Defaults to 25.", {
            minimum: 0,
            maximum: 100,
          }),
        ),
        job_type: s.nullable(
          s.withEnum(s.unknown("Employment type. Use job_types to select multiple types."), [
            "fulltime",
            "parttime",
            "contract",
            "temporary",
            "internship",
            "permanent",
          ]),
        ),
        job_types: s.nullable(
          s.array(
            'Employment attribute codes as a JSON array, for example ["CF3CP","NJXCK"]. Mutually exclusive with job_type. Codes are returned by include_filters.',
            s.string("job types value. item.", { minLength: 1, maxLength: 512 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        from_age: s.nullable(s.integer("Maximum posting age in days.", { minimum: 1, maximum: 30 })),
        salary_min: s.nullable(s.integer("Minimum annual salary in the search location's currency.", { minimum: 0 })),
        salary_max: s.nullable(s.integer("Maximum annual salary in the search location's currency.", { minimum: 0 })),
        remote: s.nullable(
          s.boolean("True selects work-from-home or remote jobs. False includes all workplace types."),
        ),
        easy_apply: s.nullable(s.boolean("True selects Easy Apply jobs. False includes all application types.")),
        seniority: s.nullable(
          s.withEnum(s.unknown("Seniority filter."), [
            "internship",
            "entrylevel",
            "midseniorlevel",
            "director",
            "executive",
          ]),
        ),
        company_id: s.nullable(
          s.integer("Glassdoor employer ID; include_filters returns matching employer IDs.", {
            minimum: 1,
          }),
        ),
        company_sizes: s.nullable(
          s.array(
            "Employer size categories as a JSON array: 1 tiny, 2 small, 3 medium, 4 large, 5 huge.",
            s.integer("company sizes value. item."),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        industry_id: s.nullable(
          s.integer(
            "Glassdoor industry ID; available values depend on the search and are returned by include_filters.",
            { minimum: 1 },
          ),
        ),
        occupation_id: s.nullable(
          s.integer("Glassdoor occupation category, such as 1007 Engineering. See include_filters.", { minimum: 1 }),
        ),
        city_id: s.nullable(s.integer("Refine the search to a city ID from include_filters.", { minimum: 1 })),
        min_rating: s.nullable(s.number("Minimum employer rating.", { minimum: 0, maximum: 5 })),
        sort: s.nullable(
          s.withEnum(s.unknown("Relevance, oldest first, or newest first."), ["relevance", "date_asc", "date_desc"]),
        ),
        include_filters: s.boolean("Return available filters, values, counts and employer names in available_filters."),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Glassdoor Search asynchronous parameters.",
      {
        q: s.string("Job title, keywords or company. Omit to browse using only location and filters.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        location: s.string(
          "Free-text city, state, country or postal code. Use location_id and location_type for an exact location instead.",
          { minLength: 1, maxLength: 512 },
        ),
        page_token: s.string("Copy next_page_token with its next_page and the same search parameters to continue.", {
          minLength: 1,
          maxLength: 32768,
          pattern: "^[A-Za-z0-9+/=_-]+$",
        }),
        location_id: s.integer("Glassdoor location ID, for example 1132348 for New York. Omit for nationwide search.", {
          minimum: 1,
        }),
        location_type: s.withEnum(s.unknown("Location type: C city, S state, N country. Required with location_id."), [
          "C",
          "S",
          "N",
        ]),
        location_country: s.string(
          "Restrict the free-text location to this two-letter country, for example GB for London, England. Requires location.",
          { pattern: "^[A-Z]{2}$" },
        ),
        radius: s.integer("Distance in miles; 0 means the exact location. Defaults to 25.", {
          minimum: 0,
          maximum: 100,
        }),
        job_type: s.withEnum(s.unknown("Employment type. Use job_types to select multiple types."), [
          "fulltime",
          "parttime",
          "contract",
          "temporary",
          "internship",
          "permanent",
        ]),
        job_types: s.array(
          'Employment attribute codes as a JSON array, for example ["CF3CP","NJXCK"]. Mutually exclusive with job_type. Codes are returned by include_filters.',
          s.string("job types value. item.", { minLength: 1, maxLength: 512 }),
          { minItems: 1, maxItems: 100 },
        ),
        from_age: s.integer("Maximum posting age in days.", { minimum: 1, maximum: 30 }),
        salary_min: s.integer("Minimum annual salary in the search location's currency.", {
          minimum: 0,
        }),
        salary_max: s.integer("Maximum annual salary in the search location's currency.", {
          minimum: 0,
        }),
        remote: s.boolean("True selects work-from-home or remote jobs. False includes all workplace types."),
        easy_apply: s.boolean("True selects Easy Apply jobs. False includes all application types."),
        seniority: s.withEnum(s.unknown("Seniority filter."), [
          "internship",
          "entrylevel",
          "midseniorlevel",
          "director",
          "executive",
        ]),
        company_id: s.integer("Glassdoor employer ID; include_filters returns matching employer IDs.", { minimum: 1 }),
        company_sizes: s.array(
          "Employer size categories as a JSON array: 1 tiny, 2 small, 3 medium, 4 large, 5 huge.",
          s.integer("company sizes value. item."),
          { minItems: 1, maxItems: 100 },
        ),
        industry_id: s.integer(
          "Glassdoor industry ID; available values depend on the search and are returned by include_filters.",
          { minimum: 1 },
        ),
        occupation_id: s.integer("Glassdoor occupation category, such as 1007 Engineering. See include_filters.", {
          minimum: 1,
        }),
        city_id: s.integer("Refine the search to a city ID from include_filters.", { minimum: 1 }),
        min_rating: s.number("Minimum employer rating.", { minimum: 0, maximum: 5 }),
        sort: s.withEnum(s.unknown("Relevance, oldest first, or newest first."), [
          "relevance",
          "date_asc",
          "date_desc",
        ]),
        include_filters: s.boolean("Return available filters, values, counts and employer names in available_filters."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Glassdoor Search response.", {
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
