import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const apartmentsTools: DataTool[] = [
  {
    name: "apartments_property",
    path: "/api/apartments/property",
    description: "Get an Apartments.com property by URL. This upstream API is Alpha.",
    input: s.object(
      "Apartments.com Property parameters.",
      {
        url: s.string(
          "Apartments.com property URL ending in its seven-character listing ID, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available fields for the requested property. Prices may represent a rental range. Bedroom-specific rents and total-monthly-price labels are preserved when present.",
          { maxLength: 2048 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Apartments.com Property asynchronous parameters.",
      {
        url: s.string(
          "Apartments.com property URL ending in its seven-character listing ID, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available fields for the requested property. Prices may represent a rental range. Bedroom-specific rents and total-monthly-price labels are preserved when present.",
          { maxLength: 2048 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Apartments.com Property response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      property: s.looseObject("property value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "apartments_search",
    path: "/api/apartments/search",
    description: "Search Apartments.com listings from a search URL. This upstream API is Alpha.",
    input: s.object(
      "Apartments.com Search parameters.",
      {
        url: s.string(
          "Apartments.com location search URL, including any price, bedroom, amenity or page filters.\n\nAlpha: availability may vary by location or property. Use the site URL to set filters or select a page. Follow pagination.next when present. Page links and total counts are included when available. Prices may represent a rental range. Bedroom-specific rents and total-monthly-price labels are preserved when present.",
          { maxLength: 4096 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Apartments.com Search asynchronous parameters.",
      {
        url: s.string(
          "Apartments.com location search URL, including any price, bedroom, amenity or page filters.\n\nAlpha: availability may vary by location or property. Use the site URL to set filters or select a page. Follow pagination.next when present. Page links and total counts are included when available. Prices may represent a rental range. Bedroom-specific rents and total-monthly-price labels are preserved when present.",
          { maxLength: 4096 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Apartments.com Search response.", {
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
