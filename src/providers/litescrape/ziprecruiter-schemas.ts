import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const ziprecruiterTools: DataTool[] = [
  {
    name: "ziprecruiter_search",
    path: "/api/ziprecruiter/search",
    description: "Search ZipRecruiter jobs in the US and Canada by keyword and location.",
    input: s.object(
      "ZipRecruiter Search parameters.",
      {
        q: s.string("Job title, keywords, or company to search for.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        location: s.string("City and state or ZIP code, for example New York, NY.", {
          minLength: 1,
          maxLength: 512,
        }),
        radius: s.nullable(
          s.integer("Search radius in miles. Use 5000 for any distance.", {
            minimum: 0,
            maximum: 5000,
          }),
        ),
        days: s.nullable(s.integer("Maximum posting age in days.", { minimum: 1 })),
        employment_types: s.nullable(
          s.array(
            "Employment types as a JSON array.",
            s.withEnum(s.unknown("employment types value. item."), [
              "full_time",
              "part_time",
              "contract",
              "contract_to_hire",
              "temporary",
              "as_needed",
              "other",
            ]),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        location_type: s.nullable(
          s.withEnum(s.unknown("On-site, remote-only, or hybrid jobs."), ["no_remote", "only_remote", "hybrid"]),
        ),
        salary_min: s.nullable(
          s.integer("Lower bound for the job's maximum annualized pay, in the location's currency.", { minimum: 0 }),
        ),
        salary_max: s.nullable(s.integer("Upper bound for the job's maximum annualized pay.", { minimum: 0 })),
        experience_level: s.nullable(
          s.withEnum(s.unknown("Experience/seniority class."), ["no_experience", "junior", "mid", "senior"]),
        ),
        easy_apply: s.boolean("Require ZipRecruiter's quick application."),
      },
      { required: ["q", "location"] },
    ),
    asyncInput: s.object(
      "ZipRecruiter Search asynchronous parameters.",
      {
        q: s.string("Job title, keywords, or company to search for.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        location: s.string("City and state or ZIP code, for example New York, NY.", {
          minLength: 1,
          maxLength: 512,
        }),
        radius: s.integer("Search radius in miles. Use 5000 for any distance.", {
          minimum: 0,
          maximum: 5000,
        }),
        days: s.integer("Maximum posting age in days.", { minimum: 1 }),
        employment_types: s.array(
          "Employment types as a JSON array.",
          s.withEnum(s.unknown("employment types value. item."), [
            "full_time",
            "part_time",
            "contract",
            "contract_to_hire",
            "temporary",
            "as_needed",
            "other",
          ]),
          { minItems: 1, maxItems: 100 },
        ),
        location_type: s.withEnum(s.unknown("On-site, remote-only, or hybrid jobs."), [
          "no_remote",
          "only_remote",
          "hybrid",
        ]),
        salary_min: s.integer("Lower bound for the job's maximum annualized pay, in the location's currency.", {
          minimum: 0,
        }),
        salary_max: s.integer("Upper bound for the job's maximum annualized pay.", { minimum: 0 }),
        experience_level: s.withEnum(s.unknown("Experience/seniority class."), [
          "no_experience",
          "junior",
          "mid",
          "senior",
        ]),
        easy_apply: s.boolean("Require ZipRecruiter's quick application."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q", "location"] },
    ),
    output: s.looseObject("ZipRecruiter Search response.", {
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
