import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const realtorTools: DataTool[] = [
  {
    name: "realtor_property",
    path: "/api/realtor/property",
    description: "Get a Realtor.com property by URL. This upstream API is Alpha.",
    input: s.object(
      "Realtor.com Property parameters.",
      {
        url: s.string(
          "Realtor.com property URL under /realestateandhomes-detail/, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available fields for the requested property.",
          { maxLength: 2048 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Realtor.com Property asynchronous parameters.",
      {
        url: s.string(
          "Realtor.com property URL under /realestateandhomes-detail/, without query parameters.\n\nAlpha: availability may vary by location or property. Returns available fields for the requested property.",
          { maxLength: 2048 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Realtor.com Property response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      property: s.looseObject("property value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "realtor_search",
    path: "/api/realtor/search",
    description: "Search Realtor.com listings from a search URL. This upstream API is Alpha.",
    input: s.object(
      "Realtor.com Search parameters.",
      {
        limit: s.integer("Listings per results page, from 1 to 200.", { minimum: 1, maximum: 200 }),
        url: s.string(
          "Realtor.com city_STATE or ZIP search URL under /realestateandhomes-search/ or /apartments/.\n\nAlpha: availability may vary by location or property. Supported URL filters: price, beds, baths, sqft, type-single-family-home, show-recently-sold and pg-1 through pg-100. Unsupported filters and query parameters are rejected. Follow pagination.next when present. Bedroom filters require whole numbers.",
          { maxLength: 4096 },
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Realtor.com Search asynchronous parameters.",
      {
        limit: s.integer("Listings per results page, from 1 to 200.", { minimum: 1, maximum: 200 }),
        url: s.string(
          "Realtor.com city_STATE or ZIP search URL under /realestateandhomes-search/ or /apartments/.\n\nAlpha: availability may vary by location or property. Supported URL filters: price, beds, baths, sqft, type-single-family-home, show-recently-sold and pg-1 through pg-100. Unsupported filters and query parameters are rejected. Follow pagination.next when present. Bedroom filters require whole numbers.",
          { maxLength: 4096 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Realtor.com Search response.", {
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
