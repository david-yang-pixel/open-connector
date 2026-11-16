import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const homesTools: DataTool[] = [
  {
    name: "homes_property",
    path: "/api/homes/property",
    description: "Get a Homes.com property by URL. This upstream API is Alpha.",
    input: s.object(
      "Homes.com Property parameters.",
      {
        url: s.string(
          "Homes.com property URL under /property/, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available property facts, descriptions, coordinates, agents and photos. Price history is not available from this route. Returns available fields for the requested property.",
          { maxLength: 2048 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Homes.com Property asynchronous parameters.",
      {
        url: s.string(
          "Homes.com property URL under /property/, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available property facts, descriptions, coordinates, agents and photos. Price history is not available from this route. Returns available fields for the requested property.",
          { maxLength: 2048 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Homes.com Property response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      property: s.looseObject("property value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "homes_search",
    path: "/api/homes/search",
    description: "Search Homes.com listings from a search URL. This upstream API is Alpha.",
    input: s.object(
      "Homes.com Search parameters.",
      {
        url: s.string(
          "Homes.com location search URL, including sale, rental, price, property-type or page filters.\n\nAlpha: availability may vary by location or property. Use the site URL to set filters or select a page. Follow pagination.next when present. Page links and total counts are included when available.",
          { maxLength: 4096 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Homes.com Search asynchronous parameters.",
      {
        url: s.string(
          "Homes.com location search URL, including sale, rental, price, property-type or page filters.\n\nAlpha: availability may vary by location or property. Use the site URL to set filters or select a page. Follow pagination.next when present. Page links and total counts are included when available.",
          { maxLength: 4096 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Homes.com Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      properties: s.array("properties value.", s.looseObject("properties value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
