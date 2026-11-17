import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const indeedTools: DataTool[] = [
  {
    name: "indeed_search",
    path: "/api/indeed/search",
    description: "Search Indeed jobs by keyword and location, with salary, experience and remote filters.",
    input: s.object(
      "Indeed Search parameters.",
      {
        q: s.nullable(
          s.string(
            "Job title, keywords, company or Indeed query syntax. Omit to browse using only location and filters.",
            { minLength: 1, maxLength: 512 },
          ),
        ),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        page_token: s.nullable(
          s.string("Continuation token from next_page_token. Use it with next_page and unchanged search parameters.", {
            minLength: 1,
            maxLength: 32768,
            pattern: "^[A-Za-z0-9+/=_-]+$",
          }),
        ),
        location: s.nullable(s.string("City, state, ZIP code, or Remote.", { minLength: 1, maxLength: 512 })),
        radius: s.integer("Search radius in radius_unit units; 0 means exact location.", {
          minimum: 0,
          maximum: 100,
        }),
        radius_unit: s.withEnum(s.unknown("Distance unit for the location radius."), ["miles", "kilometers"]),
        country: s.string("Two-letter Indeed market, for example US, CA, GB, DE or AU.", {
          pattern: "^[A-Z]{2}$",
        }),
        locale: s.nullable(
          s.string(
            "Indeed locale, such as fr-CA or de-DE. Defaults to en-{country}; set the language for non-English searches.",
            { pattern: "^[a-z]{2,3}-[A-Z]{2}$" },
          ),
        ),
        limit: s.integer("Jobs requested per page. Results may contain fewer jobs; use next_page_token to continue.", {
          minimum: 1,
          maximum: 100,
        }),
        sort: s.withEnum(s.unknown("Result ordering."), ["relevance", "date"]),
        fromage: s.nullable(s.integer("Maximum age in days since the job appeared on Indeed.", { minimum: 1 })),
        job_type: s.nullable(
          s.withEnum(s.unknown("Employment type filter."), [
            "fulltime",
            "parttime",
            "contract",
            "temporary",
            "internship",
            "permanent",
            "temp_to_hire",
            "freelance",
          ]),
        ),
        workplace: s.nullable(s.withEnum(s.unknown("Filter for remote or hybrid jobs."), ["remote", "hybrid"])),
        easy_apply: s.boolean("Require Indeed Apply."),
        education: s.nullable(
          s.withEnum(s.unknown("Education level filter."), [
            "high_school",
            "associate",
            "bachelor",
            "master",
            "doctoral",
          ]),
        ),
        no_experience: s.boolean("Require jobs marked No Experience Required."),
        experience_level: s.nullable(
          s.withEnum(s.unknown("Filter for entry, mid or senior level jobs."), ["entry", "mid", "senior"]),
        ),
        salary_min: s.nullable(s.integer("Minimum annualized base salary in the market's currency.", { minimum: 0 })),
        salary_max: s.nullable(s.integer("Maximum annualized base salary in the market's currency.", { minimum: 0 })),
        experience_months_min: s.nullable(s.integer("Minimum required experience in months.", { minimum: 0 })),
        experience_months_max: s.nullable(s.integer("Maximum required experience in months.", { minimum: 0 })),
        job_language: s.nullable(
          s.string("Language of the job posting, independent of the response locale.", {
            pattern: "^[a-z]{2,3}$",
          }),
        ),
        employer_keys: s.nullable(
          s.array(
            "Encoded Indeed employer keys as a JSON array. Names are not keys; company names can be searched in q using company:name.",
            s.string("employer keys value. item.", { minLength: 1, maxLength: 512 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        attribute_keys: s.nullable(
          s.array(
            "Require all of these Indeed attribute codes (JSON array), covering skills, benefits, shifts, licenses, clearances and employment types. Codes and labels are included on returned jobs.",
            s.string("attribute keys value. item.", { minLength: 1, maxLength: 512 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        any_attribute_keys: s.nullable(
          s.array(
            "Require any of these Indeed attribute codes (JSON array), combined with all other supplied filters.",
            s.string("any attribute keys value. item.", { minLength: 1, maxLength: 512 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Indeed Search asynchronous parameters.",
      {
        q: s.string(
          "Job title, keywords, company or Indeed query syntax. Omit to browse using only location and filters.",
          { minLength: 1, maxLength: 512 },
        ),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        page_token: s.string(
          "Continuation token from next_page_token. Use it with next_page and unchanged search parameters.",
          { minLength: 1, maxLength: 32768, pattern: "^[A-Za-z0-9+/=_-]+$" },
        ),
        location: s.string("City, state, ZIP code, or Remote.", { minLength: 1, maxLength: 512 }),
        radius: s.integer("Search radius in radius_unit units; 0 means exact location.", {
          minimum: 0,
          maximum: 100,
        }),
        radius_unit: s.withEnum(s.unknown("Distance unit for the location radius."), ["miles", "kilometers"]),
        country: s.string("Two-letter Indeed market, for example US, CA, GB, DE or AU.", {
          pattern: "^[A-Z]{2}$",
        }),
        locale: s.string(
          "Indeed locale, such as fr-CA or de-DE. Defaults to en-{country}; set the language for non-English searches.",
          { pattern: "^[a-z]{2,3}-[A-Z]{2}$" },
        ),
        limit: s.integer("Jobs requested per page. Results may contain fewer jobs; use next_page_token to continue.", {
          minimum: 1,
          maximum: 100,
        }),
        sort: s.withEnum(s.unknown("Result ordering."), ["relevance", "date"]),
        fromage: s.integer("Maximum age in days since the job appeared on Indeed.", { minimum: 1 }),
        job_type: s.withEnum(s.unknown("Employment type filter."), [
          "fulltime",
          "parttime",
          "contract",
          "temporary",
          "internship",
          "permanent",
          "temp_to_hire",
          "freelance",
        ]),
        workplace: s.withEnum(s.unknown("Filter for remote or hybrid jobs."), ["remote", "hybrid"]),
        easy_apply: s.boolean("Require Indeed Apply."),
        education: s.withEnum(s.unknown("Education level filter."), [
          "high_school",
          "associate",
          "bachelor",
          "master",
          "doctoral",
        ]),
        no_experience: s.boolean("Require jobs marked No Experience Required."),
        experience_level: s.withEnum(s.unknown("Filter for entry, mid or senior level jobs."), [
          "entry",
          "mid",
          "senior",
        ]),
        salary_min: s.integer("Minimum annualized base salary in the market's currency.", {
          minimum: 0,
        }),
        salary_max: s.integer("Maximum annualized base salary in the market's currency.", {
          minimum: 0,
        }),
        experience_months_min: s.integer("Minimum required experience in months.", { minimum: 0 }),
        experience_months_max: s.integer("Maximum required experience in months.", { minimum: 0 }),
        job_language: s.string("Language of the job posting, independent of the response locale.", {
          pattern: "^[a-z]{2,3}$",
        }),
        employer_keys: s.array(
          "Encoded Indeed employer keys as a JSON array. Names are not keys; company names can be searched in q using company:name.",
          s.string("employer keys value. item.", { minLength: 1, maxLength: 512 }),
          { minItems: 1, maxItems: 100 },
        ),
        attribute_keys: s.array(
          "Require all of these Indeed attribute codes (JSON array), covering skills, benefits, shifts, licenses, clearances and employment types. Codes and labels are included on returned jobs.",
          s.string("attribute keys value. item.", { minLength: 1, maxLength: 512 }),
          { minItems: 1, maxItems: 100 },
        ),
        any_attribute_keys: s.array(
          "Require any of these Indeed attribute codes (JSON array), combined with all other supplied filters.",
          s.string("any attribute keys value. item.", { minLength: 1, maxLength: 512 }),
          { minItems: 1, maxItems: 100 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Indeed Search response.", {
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
