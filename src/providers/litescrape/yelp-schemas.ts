import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const yelpTools: DataTool[] = [
  {
    name: "yelp_place",
    path: "/api/yelp/place",
    description: "Get a Yelp business's details and menu.",
    input: s.object(
      "Yelp Place parameters.",
      {
        place_id: s.string("Required Yelp encoded business ID or business alias."),
        yelp_domain: s.string("Supported localized Yelp hostname."),
        business_alert: s.boolean("Include business alert information when available."),
        full_menu: s.boolean("Fetch the full menu when available; otherwise return place details with an explanation."),
        menu_name: s.nullable(
          s.string("Select a named menu when more than one is available. Requires full_menu=true."),
        ),
      },
      { required: ["place_id"] },
    ),
    asyncInput: s.object(
      "Yelp Place asynchronous parameters.",
      {
        place_id: s.string("Required Yelp encoded business ID or business alias."),
        yelp_domain: s.string("Supported localized Yelp hostname."),
        business_alert: s.boolean("Include business alert information when available."),
        full_menu: s.boolean("Fetch the full menu when available; otherwise return place details with an explanation."),
        menu_name: s.string("Select a named menu when more than one is available. Requires full_menu=true."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["place_id"] },
    ),
    output: s.looseObject("Yelp Place response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      place_results: s.nullable(s.looseObject("place results value.", {})),
      full_menu_results: s.nullable(s.looseObject("full menu results value.", {})),
      error: s.nullable(s.string("error value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "yelp_reviews",
    path: "/api/yelp/reviews",
    description: "Get reviews for a Yelp business.",
    input: s.object(
      "Yelp Reviews parameters.",
      {
        place_id: s.string("Required encoded Yelp business identifier."),
        yelp_domain: s.string("Supported localized Yelp hostname."),
        hl: s.string("Review language such as en or fr-FR."),
        q: s.nullable(s.string("Search review text for these terms.")),
        sortby: s.withEnum(s.unknown("Yelp review ordering."), [
          "relevance_desc",
          "date_desc",
          "date_asc",
          "rating_desc",
          "rating_asc",
          "elites_desc",
        ]),
        rating: s.nullable(s.string("Comma-separated ratings from 1 through 5.")),
        not_recommended: s.boolean("Fetch reviews that Yelp does not recommend."),
        not_recommended_start: s.nullable(
          s.integer("Offset within not-recommended reviews. Requires not_recommended=true."),
        ),
        start: s.integer("Review offset from 0 through 10,000."),
        num: s.integer("Review count from 1 through 49."),
      },
      { required: ["place_id"] },
    ),
    asyncInput: s.object(
      "Yelp Reviews asynchronous parameters.",
      {
        place_id: s.string("Required encoded Yelp business identifier."),
        yelp_domain: s.string("Supported localized Yelp hostname."),
        hl: s.string("Review language such as en or fr-FR."),
        q: s.string("Search review text for these terms."),
        sortby: s.withEnum(s.unknown("Yelp review ordering."), [
          "relevance_desc",
          "date_desc",
          "date_asc",
          "rating_desc",
          "rating_asc",
          "elites_desc",
        ]),
        rating: s.string("Comma-separated ratings from 1 through 5."),
        not_recommended: s.boolean("Fetch reviews that Yelp does not recommend."),
        not_recommended_start: s.integer("Offset within not-recommended reviews. Requires not_recommended=true."),
        start: s.integer("Review offset from 0 through 10,000."),
        num: s.integer("Review count from 1 through 49."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["place_id"] },
    ),
    output: s.looseObject("Yelp Reviews response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      review_languages: s.nullable(
        s.array("review languages value.", s.looseObject("review languages value. item.", {})),
      ),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "yelp_search",
    path: "/api/yelp/search",
    description: "Search Yelp businesses by location and category.",
    input: s.object(
      "Yelp Search parameters.",
      {
        find_desc: s.nullable(s.string("Business name, category, or search terms.")),
        find_loc: s.string("Required Yelp search location."),
        yelp_domain: s.string("Supported Yelp hostname. Results use the language of the selected domain."),
        l: s.nullable(s.string("Optional Yelp-native map bounds token.")),
        cflt: s.nullable(s.string("Yelp category identifier containing letters, numbers, _ or -.")),
        sortby: s.withEnum(s.unknown("Native Yelp ordering."), ["recommended", "rating", "review_count"]),
        attrs: s.nullable(s.string("Yelp-native comma-separated attribute filters.")),
        start: s.integer("Result offset from 0 through 10,000."),
      },
      { required: ["find_loc"] },
    ),
    asyncInput: s.object(
      "Yelp Search asynchronous parameters.",
      {
        find_desc: s.string("Business name, category, or search terms."),
        find_loc: s.string("Required Yelp search location."),
        yelp_domain: s.string("Supported Yelp hostname. Results use the language of the selected domain."),
        l: s.string("Optional Yelp-native map bounds token."),
        cflt: s.string("Yelp category identifier containing letters, numbers, _ or -."),
        sortby: s.withEnum(s.unknown("Native Yelp ordering."), ["recommended", "rating", "review_count"]),
        attrs: s.string("Yelp-native comma-separated attribute filters."),
        start: s.integer("Result offset from 0 through 10,000."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["find_loc"] },
    ),
    output: s.looseObject("Yelp Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      filters: s.nullable(s.looseObject("filters value.", {})),
      ads_results: s.nullable(s.array("ads results value.", s.looseObject("ads results value. item.", {}))),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      related_links: s.nullable(s.array("related links value.", s.looseObject("related links value. item.", {}))),
      faqs: s.nullable(s.array("faqs value.", s.looseObject("faqs value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
