import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const baiduTools: DataTool[] = [
  {
    name: "baidu_search",
    path: "/api/baidu/search",
    description: "Get Baidu search results as JSON.",
    input: s.object(
      "Baidu Search parameters.",
      {
        q: s.string(
          "Required search text, trimmed to 1 through 500 characters. Unicode queries are supported. Control characters are rejected.",
          { minLength: 1, maxLength: 500 },
        ),
        pn: s.integer(
          "Zero-based result offset from 0 through 750, not a page number. Use pagination.next_pn or litescrape_pagination.next to continue.",
          { minimum: 0, maximum: 750 },
        ),
        rn: s.withEnum(
          s.unknown(
            "Requested result count: 10, 20, or 50. Defaults to 10. Baidu can return fewer web results when a page includes other result modules.",
          ),
          [10, 20, 50],
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Baidu Search asynchronous parameters.",
      {
        q: s.string(
          "Required search text, trimmed to 1 through 500 characters. Unicode queries are supported. Control characters are rejected.",
          { minLength: 1, maxLength: 500 },
        ),
        pn: s.integer(
          "Zero-based result offset from 0 through 750, not a page number. Use pagination.next_pn or litescrape_pagination.next to continue.",
          { minimum: 0, maximum: 750 },
        ),
        rn: s.withEnum(
          s.unknown(
            "Requested result count: 10, 20, or 50. Defaults to 10. Baidu can return fewer web results when a page includes other result modules.",
          ),
          [10, 20, 50],
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Baidu Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      organic_results: s.array("organic results value.", s.looseObject("organic results value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.looseObject("litescrape pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
