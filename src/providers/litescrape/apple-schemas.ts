import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const appleTools: DataTool[] = [
  {
    name: "apple_app_store_product",
    path: "/api/apple/app-store/product",
    description: "Get an App Store app's details, ratings and version history.",
    input: s.object(
      "Apple App Store Product parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        product_id: s.string("Positive decimal Apple app identifier, up to 20 digits.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        type: s.literal("app", {
          description: "App product type. Only app is supported.",
        }),
      },
      { required: ["product_id"] },
    ),
    asyncInput: s.object(
      "Apple App Store Product asynchronous parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        product_id: s.string("Positive decimal Apple app identifier, up to 20 digits.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        type: s.literal("app", {
          description: "App product type. Only app is supported.",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_id"] },
    ),
    output: s.looseObject("Apple App Store Product response.", {
      age_rating: s.nullable(s.string("age rating value.")),
      description: s.nullable(s.string("description value.")),
      developer: s.nullable(s.looseObject("developer value.", {})),
      featured_in: s.nullable(s.array("featured in value.", s.looseObject("featured in value. item.", {}))),
      id: s.nullable(s.string("id value.")),
      in_app_purchases: s.nullable(s.string("in app purchases value.")),
      information: s.nullable(s.looseObject("information value.", {})),
      ipad_screenshots: s.nullable(s.array("ipad screenshots value.", s.string("ipad screenshots value. item."))),
      iphone_screenshots: s.nullable(s.array("iphone screenshots value.", s.string("iphone screenshots value. item."))),
      logo: s.nullable(s.string("logo value.")),
      more_by_this_developer: s.nullable(s.looseObject("more by this developer value.", {})),
      price: s.nullable(s.string("price value.")),
      privacy: s.nullable(s.looseObject("privacy value.", {})),
      rating: s.nullable(s.number("rating value.")),
      rating_count: s.nullable(s.string("rating count value.")),
      ratings_and_reviews: s.nullable(s.looseObject("ratings and reviews value.", {})),
      snippet: s.nullable(s.string("snippet value.")),
      title: s.nullable(s.string("title value.")),
      version_history: s.nullable(s.array("version history value.", s.looseObject("version history value. item.", {}))),
      you_may_also_like: s.nullable(s.looseObject("you may also like value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "apple_app_store_reviews",
    path: "/api/apple/app-store/reviews",
    description: "Get reviews for an App Store app.",
    input: s.object(
      "Apple App Store Reviews parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        product_id: s.string("Positive decimal Apple app identifier, up to 20 digits.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        sort: s.withEnum(s.unknown("mostrecent or mosthelpful. Apple's Mac storefront always returns newest first."), [
          "mostrecent",
          "mosthelpful",
        ]),
        page: s.integer(
          "One-based page number, from 1 through 2,147,483,647. Exhausted pages return an empty review list.",
          { minimum: 1, maximum: 2147483647 },
        ),
      },
      { required: ["product_id"] },
    ),
    asyncInput: s.object(
      "Apple App Store Reviews asynchronous parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        product_id: s.string("Positive decimal Apple app identifier, up to 20 digits.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        sort: s.withEnum(s.unknown("mostrecent or mosthelpful. Apple's Mac storefront always returns newest first."), [
          "mostrecent",
          "mosthelpful",
        ]),
        page: s.integer(
          "One-based page number, from 1 through 2,147,483,647. Exhausted pages return an empty review list.",
          { minimum: 1, maximum: 2147483647 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_id"] },
    ),
    output: s.looseObject("Apple App Store Reviews response.", {
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      raises: s.nullable(s.looseObject("raises value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "apple_app_store_search",
    path: "/api/apple/app-store/search",
    description: "Search the App Store for iPhone, iPad and Mac apps.",
    input: s.object(
      "Apple App Store Search parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        term: s.string(
          "Search term with 1 to 2,048 UTF-8 bytes of printable text, and at most 4,096 bytes after URL encoding.",
          { minLength: 1, maxLength: 2048 },
        ),
        lang: s.string("Language-region code, such as en-us or fr-fr.", {
          pattern: "^[a-zA-Z]{2,3}-[a-zA-Z]{2}$",
        }),
        num: s.integer("Maximum results after filtering, from 1 through 200.", {
          minimum: 1,
          maximum: 200,
        }),
        disallow_explicit: s.boolean("Exclude explicit results when true."),
        property: s.nullable(
          s.literal("developer", {
            description: "Use developer to match developer names, ignoring case.",
          }),
        ),
        category_id: s.nullable(
          s.integer("Filter results by a native genre identifier, from 1 through 2,147,483,647.", {
            minimum: 1,
            maximum: 2147483647,
          }),
        ),
        device: s.withEnum(s.unknown("mobile for iPhone apps, tablet for iPad apps, or desktop for Mac apps."), [
          "mobile",
          "tablet",
          "desktop",
        ]),
      },
      { required: ["term"] },
    ),
    asyncInput: s.object(
      "Apple App Store Search asynchronous parameters.",
      {
        country: s.string("Two-letter Apple storefront country. UK is accepted as an alias for GB.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        term: s.string(
          "Search term with 1 to 2,048 UTF-8 bytes of printable text, and at most 4,096 bytes after URL encoding.",
          { minLength: 1, maxLength: 2048 },
        ),
        lang: s.string("Language-region code, such as en-us or fr-fr.", {
          pattern: "^[a-zA-Z]{2,3}-[a-zA-Z]{2}$",
        }),
        num: s.integer("Maximum results after filtering, from 1 through 200.", {
          minimum: 1,
          maximum: 200,
        }),
        disallow_explicit: s.boolean("Exclude explicit results when true."),
        property: s.literal("developer", {
          description: "Use developer to match developer names, ignoring case.",
        }),
        category_id: s.integer("Filter results by a native genre identifier, from 1 through 2,147,483,647.", {
          minimum: 1,
          maximum: 2147483647,
        }),
        device: s.withEnum(s.unknown("mobile for iPhone apps, tablet for iPad apps, or desktop for Mac apps."), [
          "mobile",
          "tablet",
          "desktop",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["term"] },
    ),
    output: s.looseObject("Apple App Store Search response.", {
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "apple_maps_places",
    path: "/api/apple/maps/places",
    description: "Search Apple Maps places.",
    input: s.object(
      "Apple Maps Places parameters.",
      {
        muid: s.string(
          "One or more Apple Maps unique place identifiers.\n\nSeparate multiple identifiers with commas. Accepted batch size: 1 through 50 unsigned 64-bit decimal IDs. Example: 4372355869446211302.",
        ),
        locale: s.string(
          "Controls Apple Maps language and regional formatting.\n\nExamples: en-US, fr-FR, ja-JP, and zh-TW.",
        ),
      },
      { required: ["muid"] },
    ),
    asyncInput: s.object(
      "Apple Maps Places asynchronous parameters.",
      {
        muid: s.string(
          "One or more Apple Maps unique place identifiers.\n\nSeparate multiple identifiers with commas. Accepted batch size: 1 through 50 unsigned 64-bit decimal IDs. Example: 4372355869446211302.",
        ),
        locale: s.string(
          "Controls Apple Maps language and regional formatting.\n\nExamples: en-US, fr-FR, ja-JP, and zh-TW.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["muid"] },
    ),
    output: s.looseObject("Apple Maps Places response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      place_results: s.nullable(s.array("place results value.", s.looseObject("place results value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "apple_maps_reviews",
    path: "/api/apple/maps/reviews",
    description: "Get Apple ratings and reviews for an Apple Maps place.",
    input: s.object(
      "Apple Maps Reviews parameters.",
      {
        muid: s.string("Exactly one unsigned 64-bit decimal Apple Maps MUID."),
        locale: s.string("Apple Maps language and regional formatting."),
      },
      { required: ["muid"] },
    ),
    asyncInput: s.object(
      "Apple Maps Reviews asynchronous parameters.",
      {
        muid: s.string("Exactly one unsigned 64-bit decimal Apple Maps MUID."),
        locale: s.string("Apple Maps language and regional formatting."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["muid"] },
    ),
    output: s.looseObject("Apple Maps Reviews response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      place_info: s.nullable(s.looseObject("place info value.", {})),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      ratings: s.nullable(s.looseObject("ratings value.", {})),
      rating_summary: s.nullable(s.looseObject("rating summary value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
