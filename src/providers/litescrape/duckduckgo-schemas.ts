import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const duckduckgoTools: DataTool[] = [
  {
    name: "duckduckgo_maps",
    path: "/api/duckduckgo/maps",
    description: "Search DuckDuckGo Maps places within a map area.",
    input: s.object(
      "DuckDuckGo Maps parameters.",
      {
        q: s.string("Required place or category query, up to 500 characters."),
        bbox: s.nullable(s.string("Viewport rectangle as top,left,bottom,right.")),
        lat: s.nullable(s.number("Viewport center latitude; requires lon.")),
        lon: s.nullable(s.number("Viewport center longitude; requires lat.")),
        strict_bbox: s.boolean("Exclude results outside the requested bounds."),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "DuckDuckGo Maps asynchronous parameters.",
      {
        q: s.string("Required place or category query, up to 500 characters."),
        bbox: s.string("Viewport rectangle as top,left,bottom,right."),
        lat: s.number("Viewport center latitude; requires lon."),
        lon: s.number("Viewport center longitude; requires lat."),
        strict_bbox: s.boolean("Exclude results outside the requested bounds."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("DuckDuckGo Maps response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      local_results: s.nullable(s.array("local results value.", s.looseObject("local results value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "duckduckgo_search",
    path: "/api/duckduckgo/search",
    description: "Get DuckDuckGo web search results.",
    input: s.object(
      "DuckDuckGo Search parameters.",
      {
        q: s.string("Required search text, up to 500 characters."),
        kl: s.nullable(s.string("DuckDuckGo region and language token, such as us-en.")),
        safe: s.withEnum(s.unknown("DuckDuckGo safe-search level."), ["1", "-1", "-2"]),
        df: s.nullable(s.string("Date window: d, w, m, y, or YYYY-MM-DD..YYYY-MM-DD.")),
        search_assist: s.boolean("Enable DuckDuckGo query assistance; mutually exclusive with m."),
        start: s.integer("Result offset from 0 through 10,000."),
        m: s.integer("Requested result count from 1 through 50; mutually exclusive with search_assist."),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "DuckDuckGo Search asynchronous parameters.",
      {
        q: s.string("Required search text, up to 500 characters."),
        kl: s.string("DuckDuckGo region and language token, such as us-en."),
        safe: s.withEnum(s.unknown("DuckDuckGo safe-search level."), ["1", "-1", "-2"]),
        df: s.string("Date window: d, w, m, y, or YYYY-MM-DD..YYYY-MM-DD."),
        search_assist: s.boolean("Enable DuckDuckGo query assistance; mutually exclusive with m."),
        start: s.integer("Result offset from 0 through 10,000."),
        m: s.integer("Requested result count from 1 through 50; mutually exclusive with search_assist."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("DuckDuckGo Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
