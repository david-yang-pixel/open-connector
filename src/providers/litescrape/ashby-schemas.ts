import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const ashbyTools: DataTool[] = [
  {
    name: "ashby_search",
    path: "/api/ashby/search",
    description: "Search jobs on a company's Ashby job board.",
    input: s.object(
      "Jobs by Ashby Search parameters.",
      {
        q: s.nullable(
          s.string("Case-insensitive phrase in title or description.", {
            minLength: 1,
            maxLength: 512,
          }),
        ),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        board: s.string("Employer board name from jobs.ashbyhq.com/{board}, for example ashby.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$",
        }),
        location: s.nullable(
          s.string("Case-insensitive phrase in primary or secondary locations.", {
            minLength: 1,
            maxLength: 512,
          }),
        ),
        department: s.nullable(s.string("Case-insensitive department name.", { minLength: 1, maxLength: 512 })),
        team: s.nullable(s.string("Exact team name, case-insensitive.", { minLength: 1, maxLength: 512 })),
        workplace_type: s.nullable(s.withEnum(s.unknown("Employer's workplace type."), ["OnSite", "Remote", "Hybrid"])),
        country: s.nullable(
          s.string(
            "Country from a primary or secondary postal address, for example USA. Exact case-insensitive match.",
            { minLength: 1, maxLength: 512 },
          ),
        ),
        region: s.nullable(
          s.string("State or province from a primary or secondary postal address. Exact case-insensitive match.", {
            minLength: 1,
            maxLength: 512,
          }),
        ),
        city: s.nullable(
          s.string(
            "City from a primary or secondary postal address. All supplied address filters must match the same address.",
            { minLength: 1, maxLength: 512 },
          ),
        ),
        remote: s.nullable(s.boolean("True selects remote jobs. False selects non-remote jobs.")),
        employment_type: s.nullable(
          s.withEnum(s.unknown("Employment type."), ["FullTime", "PartTime", "Intern", "Contract", "Temporary"]),
        ),
        limit: s.integer("Results per page.", { minimum: 1, maximum: 100 }),
        include_compensation: s.boolean("Include published compensation tiers and salary ranges."),
      },
      { required: ["board"] },
    ),
    asyncInput: s.object(
      "Jobs by Ashby Search asynchronous parameters.",
      {
        q: s.string("Case-insensitive phrase in title or description.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        board: s.string("Employer board name from jobs.ashbyhq.com/{board}, for example ashby.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$",
        }),
        location: s.string("Case-insensitive phrase in primary or secondary locations.", {
          minLength: 1,
          maxLength: 512,
        }),
        department: s.string("Case-insensitive department name.", { minLength: 1, maxLength: 512 }),
        team: s.string("Exact team name, case-insensitive.", { minLength: 1, maxLength: 512 }),
        workplace_type: s.withEnum(s.unknown("Employer's workplace type."), ["OnSite", "Remote", "Hybrid"]),
        country: s.string(
          "Country from a primary or secondary postal address, for example USA. Exact case-insensitive match.",
          { minLength: 1, maxLength: 512 },
        ),
        region: s.string(
          "State or province from a primary or secondary postal address. Exact case-insensitive match.",
          { minLength: 1, maxLength: 512 },
        ),
        city: s.string(
          "City from a primary or secondary postal address. All supplied address filters must match the same address.",
          { minLength: 1, maxLength: 512 },
        ),
        remote: s.boolean("True selects remote jobs. False selects non-remote jobs."),
        employment_type: s.withEnum(s.unknown("Employment type."), [
          "FullTime",
          "PartTime",
          "Intern",
          "Contract",
          "Temporary",
        ]),
        limit: s.integer("Results per page.", { minimum: 1, maximum: 100 }),
        include_compensation: s.boolean("Include published compensation tiers and salary ranges."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["board"] },
    ),
    output: s.looseObject("Jobs by Ashby Search response.", {
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
