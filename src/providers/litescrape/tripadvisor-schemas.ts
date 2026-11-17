import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const tripadvisorTools: DataTool[] = [
  {
    name: "tripadvisor_place",
    path: "/api/tripadvisor/place",
    description: "Get a Tripadvisor place by ID.",
    input: s.object(
      "Tripadvisor Place parameters.",
      {
        place_id: s.integer("Required positive Tripadvisor place identifier."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        currency: s.string("Three-letter ISO currency for price fields."),
        geo_id: s.nullable(s.integer("Optional positive parent geography identifier.")),
      },
      { required: ["place_id"] },
    ),
    asyncInput: s.object(
      "Tripadvisor Place asynchronous parameters.",
      {
        place_id: s.integer("Required positive Tripadvisor place identifier."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        currency: s.string("Three-letter ISO currency for price fields."),
        geo_id: s.integer("Optional positive parent geography identifier."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["place_id"] },
    ),
    output: s.looseObject("Tripadvisor Place response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      place_results: s.nullable(s.looseObject("place results value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tripadvisor_reviews",
    path: "/api/tripadvisor/reviews",
    description: "Get reviews for a Tripadvisor place.",
    input: s.object(
      "Tripadvisor Reviews parameters.",
      {
        place_id: s.integer("Required positive Tripadvisor place identifier."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        start: s.integer("Review offset from 0 through 10,000."),
        num: s.integer("Review count from 1 through 50."),
        sort_by: s.withEnum(s.unknown("Chronological or machine-ranked ordering."), ["recent", "relevance"]),
        translate: s.boolean("Request Tripadvisor machine translation."),
      },
      { required: ["place_id"] },
    ),
    asyncInput: s.object(
      "Tripadvisor Reviews asynchronous parameters.",
      {
        place_id: s.integer("Required positive Tripadvisor place identifier."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        start: s.integer("Review offset from 0 through 10,000."),
        num: s.integer("Review count from 1 through 50."),
        sort_by: s.withEnum(s.unknown("Chronological or machine-ranked ordering."), ["recent", "relevance"]),
        translate: s.boolean("Request Tripadvisor machine translation."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["place_id"] },
    ),
    output: s.looseObject("Tripadvisor Reviews response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      sort: s.nullable(s.looseObject("sort value.", {})),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tripadvisor_search",
    path: "/api/tripadvisor/search",
    description: "Search Tripadvisor hotels, restaurants and attractions.",
    input: s.object(
      "Tripadvisor Search parameters.",
      {
        q: s.string("Required search text, up to 500 characters."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        geo_id: s.nullable(s.integer("Optional positive Tripadvisor geography identifier.")),
        lat: s.nullable(s.number("Optional search-center latitude; requires lon.")),
        lon: s.nullable(s.number("Optional search-center longitude; requires lat.")),
        place_type: s.withEnum(s.unknown("Result entity type."), [
          "all",
          "accommodation",
          "attraction",
          "attraction_product",
          "eatery",
          "geo",
        ]),
        start: s.integer("Result offset from 0 through 10,000."),
        num: s.integer("Result count from 1 through 30."),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Tripadvisor Search asynchronous parameters.",
      {
        q: s.string("Required search text, up to 500 characters."),
        tripadvisor_domain: s.string("Supported localized Tripadvisor hostname."),
        locale: s.string("Language or language-COUNTRY code."),
        geo_id: s.integer("Optional positive Tripadvisor geography identifier."),
        lat: s.number("Optional search-center latitude; requires lon."),
        lon: s.number("Optional search-center longitude; requires lat."),
        place_type: s.withEnum(s.unknown("Result entity type."), [
          "all",
          "accommodation",
          "attraction",
          "attraction_product",
          "eatery",
          "geo",
        ]),
        start: s.integer("Result offset from 0 through 10,000."),
        num: s.integer("Result count from 1 through 30."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Tripadvisor Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      search_results: s.nullable(s.array("search results value.", s.looseObject("search results value. item.", {}))),
      map_previews: s.nullable(s.array("map previews value.", s.looseObject("map previews value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
