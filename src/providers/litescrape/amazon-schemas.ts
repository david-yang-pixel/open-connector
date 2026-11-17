import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const amazonTools: DataTool[] = [
  {
    name: "amazon_autocomplete",
    path: "/api/amazon/autocomplete",
    description: "Get Amazon search suggestions for a prefix and department. This upstream API is Alpha.",
    input: s.object(
      "Amazon Autocomplete parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        k: s.string("Partial search text to complete.", { minLength: 1 }),
        amazon_department: s.string("Department alias used to narrow suggestions; aps searches all departments.", {
          minLength: 1,
          pattern: "^[a-zA-Z0-9_-]+$",
        }),
      },
      { required: ["k"] },
    ),
    asyncInput: s.object(
      "Amazon Autocomplete asynchronous parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        k: s.string("Partial search text to complete.", { minLength: 1 }),
        amazon_department: s.string("Department alias used to narrow suggestions; aps searches all departments.", {
          minLength: 1,
          pattern: "^[a-zA-Z0-9_-]+$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["k"] },
    ),
    output: s.looseObject("Amazon Autocomplete response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      suggestions: s.nullable(s.array("suggestions value.", s.looseObject("suggestions value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "amazon_featured_reviews",
    path: "/api/amazon/featured-reviews",
    description: "Get the featured reviews for an Amazon product. This upstream API is Alpha.",
    input: s.object(
      "Amazon Featured Reviews parameters.",
      {
        asin: s.string(
          "Ten-character product ASIN in the selected Amazon storefront.\n\nAmazon chooses review order. Sorting, star filters and verified-purchase filters are not supported.",
          { pattern: "^[A-Z0-9]{10}$" },
        ),
        amazon_domain: s.nullable(
          s.withEnum(
            s.unknown(
              "Amazon storefront hostname. Omit for amazon.com. Supported on 23 storefronts; amazon.cn is not supported.\n\nUse an ASIN available in the selected storefront. Featured reviews can include international reviews. If featured reviews are unavailable, the request returns a failure rather than an empty review list.",
            ),
            [
              "amazon.ae",
              "amazon.ca",
              "amazon.co.jp",
              "amazon.co.uk",
              "amazon.co.za",
              "amazon.com",
              "amazon.com.au",
              "amazon.com.be",
              "amazon.com.br",
              "amazon.com.mx",
              "amazon.com.tr",
              "amazon.de",
              "amazon.eg",
              "amazon.es",
              "amazon.fr",
              "amazon.ie",
              "amazon.in",
              "amazon.it",
              "amazon.nl",
              "amazon.pl",
              "amazon.sa",
              "amazon.se",
              "amazon.sg",
            ],
          ),
        ),
      },
      { required: ["asin"] },
    ),
    asyncInput: s.object(
      "Amazon Featured Reviews asynchronous parameters.",
      {
        asin: s.string(
          "Ten-character product ASIN in the selected Amazon storefront.\n\nAmazon chooses review order. Sorting, star filters and verified-purchase filters are not supported.",
          { pattern: "^[A-Z0-9]{10}$" },
        ),
        amazon_domain: s.withEnum(
          s.unknown(
            "Amazon storefront hostname. Omit for amazon.com. Supported on 23 storefronts; amazon.cn is not supported.\n\nUse an ASIN available in the selected storefront. Featured reviews can include international reviews. If featured reviews are unavailable, the request returns a failure rather than an empty review list.",
          ),
          [
            "amazon.ae",
            "amazon.ca",
            "amazon.co.jp",
            "amazon.co.uk",
            "amazon.co.za",
            "amazon.com",
            "amazon.com.au",
            "amazon.com.be",
            "amazon.com.br",
            "amazon.com.mx",
            "amazon.com.tr",
            "amazon.de",
            "amazon.eg",
            "amazon.es",
            "amazon.fr",
            "amazon.ie",
            "amazon.in",
            "amazon.it",
            "amazon.nl",
            "amazon.pl",
            "amazon.sa",
            "amazon.se",
            "amazon.sg",
          ],
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["asin"] },
    ),
    output: s.looseObject("Amazon Featured Reviews response.", {
      source: s.withEnum(s.unknown("source value."), [
        "amazon.ae",
        "amazon.ca",
        "amazon.co.jp",
        "amazon.co.uk",
        "amazon.co.za",
        "amazon.com",
        "amazon.com.au",
        "amazon.com.be",
        "amazon.com.br",
        "amazon.com.mx",
        "amazon.com.tr",
        "amazon.de",
        "amazon.eg",
        "amazon.es",
        "amazon.fr",
        "amazon.ie",
        "amazon.in",
        "amazon.it",
        "amazon.nl",
        "amazon.pl",
        "amazon.sa",
        "amazon.se",
        "amazon.sg",
      ]),
      asin: s.string("asin value."),
      view: s.literal("featured", {
        description: "view value.",
      }),
      coverage: s.literal("featured", {
        description: "coverage value.",
      }),
      reviews: s.array("reviews value.", s.looseObject("reviews value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      search_metadata: s.looseObject("search metadata value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "amazon_media_reviews",
    path: "/api/amazon/media-reviews",
    description: "Get Amazon reviews that include photos or videos. This upstream API is Alpha.",
    input: s.object(
      "Amazon Media Reviews parameters.",
      {
        asin: s.nullable(
          s.string("Ten-character product ASIN in the selected Amazon storefront. Required for the first page.", {
            pattern: "^[A-Z0-9]{10}$",
          }),
        ),
        amazon_domain: s.nullable(
          s.withEnum(
            s.unknown(
              "Amazon storefront hostname. Omit for amazon.com. Supported on 23 storefronts; amazon.cn is not supported. Send page_token alone on continuation.\n\nUse an ASIN available in the selected storefront. Only reviews containing the selected media are returned. Review availability varies by storefront, product and request.",
            ),
            [
              "amazon.ae",
              "amazon.ca",
              "amazon.co.jp",
              "amazon.co.uk",
              "amazon.co.za",
              "amazon.com",
              "amazon.com.au",
              "amazon.com.be",
              "amazon.com.br",
              "amazon.com.mx",
              "amazon.com.tr",
              "amazon.de",
              "amazon.eg",
              "amazon.es",
              "amazon.fr",
              "amazon.ie",
              "amazon.in",
              "amazon.it",
              "amazon.nl",
              "amazon.pl",
              "amazon.sa",
              "amazon.se",
              "amazon.sg",
            ],
          ),
        ),
        view: s.nullable(
          s.withEnum(
            s.unknown(
              "Media filter: media (default) for images and videos, images, or videos. Only reviews containing the selected media are returned.\n\nAmazon chooses review order. Sorting, star filters and verified-purchase filters are not supported.",
            ),
            ["media", "images", "videos"],
          ),
        ),
        page_token: s.nullable(
          s.string(
            "Opaque continuation from pagination.next_page_token. Send it alone to fetch the next media-review page.\n\nPages can repeat a review when its media spans pages. Deduplicate by review id. If media reviews are unavailable, the request returns a failure rather than an empty review list.",
            { minLength: 5, maxLength: 8196, pattern: "^ar1\\.[A-Za-z0-9_-]+$" },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Amazon Media Reviews asynchronous parameters.",
      {
        asin: s.string("Ten-character product ASIN in the selected Amazon storefront. Required for the first page.", {
          pattern: "^[A-Z0-9]{10}$",
        }),
        amazon_domain: s.withEnum(
          s.unknown(
            "Amazon storefront hostname. Omit for amazon.com. Supported on 23 storefronts; amazon.cn is not supported. Send page_token alone on continuation.\n\nUse an ASIN available in the selected storefront. Only reviews containing the selected media are returned. Review availability varies by storefront, product and request.",
          ),
          [
            "amazon.ae",
            "amazon.ca",
            "amazon.co.jp",
            "amazon.co.uk",
            "amazon.co.za",
            "amazon.com",
            "amazon.com.au",
            "amazon.com.be",
            "amazon.com.br",
            "amazon.com.mx",
            "amazon.com.tr",
            "amazon.de",
            "amazon.eg",
            "amazon.es",
            "amazon.fr",
            "amazon.ie",
            "amazon.in",
            "amazon.it",
            "amazon.nl",
            "amazon.pl",
            "amazon.sa",
            "amazon.se",
            "amazon.sg",
          ],
        ),
        view: s.withEnum(
          s.unknown(
            "Media filter: media (default) for images and videos, images, or videos. Only reviews containing the selected media are returned.\n\nAmazon chooses review order. Sorting, star filters and verified-purchase filters are not supported.",
          ),
          ["media", "images", "videos"],
        ),
        page_token: s.string(
          "Opaque continuation from pagination.next_page_token. Send it alone to fetch the next media-review page.\n\nPages can repeat a review when its media spans pages. Deduplicate by review id. If media reviews are unavailable, the request returns a failure rather than an empty review list.",
          { minLength: 5, maxLength: 8196, pattern: "^ar1\\.[A-Za-z0-9_-]+$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Amazon Media Reviews response.", {
      source: s.withEnum(s.unknown("source value."), [
        "amazon.ae",
        "amazon.ca",
        "amazon.co.jp",
        "amazon.co.uk",
        "amazon.co.za",
        "amazon.com",
        "amazon.com.au",
        "amazon.com.be",
        "amazon.com.br",
        "amazon.com.mx",
        "amazon.com.tr",
        "amazon.de",
        "amazon.eg",
        "amazon.es",
        "amazon.fr",
        "amazon.ie",
        "amazon.in",
        "amazon.it",
        "amazon.nl",
        "amazon.pl",
        "amazon.sa",
        "amazon.se",
        "amazon.sg",
      ]),
      asin: s.string("asin value."),
      view: s.withEnum(s.unknown("view value."), ["media", "images", "videos"]),
      coverage: s.literal("reviews_with_media", {
        description: "coverage value.",
      }),
      reviews: s.array("reviews value.", s.looseObject("reviews value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      search_metadata: s.looseObject("search metadata value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "amazon_product",
    path: "/api/amazon/product",
    description: "Get an Amazon product page, with optional seller offers. This upstream API is Alpha.",
    input: s.object(
      "Amazon Product parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        language: s.nullable(
          s.string("Storefront locale, such as en_US or ja_JP.", {
            pattern: "^[a-z]{2}_[A-Z]{2}$",
          }),
        ),
        delivery_zip: s.nullable(
          s.string("Postal code used to determine delivery eligibility.", {
            minLength: 1,
            maxLength: 32,
          }),
        ),
        shipping_location: s.nullable(s.string("Two-letter destination country code.", { pattern: "^[A-Z]{2}$" })),
        asin: s.string("Ten-character Amazon product identifier.", { pattern: "^[A-Z0-9]{10}$" }),
        other_sellers: s.boolean("Fetch additional seller offers for this item."),
        all_related_products: s.boolean("Fetch every page exposed by related-product carousels."),
      },
      { required: ["asin"] },
    ),
    asyncInput: s.object(
      "Amazon Product asynchronous parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        language: s.string("Storefront locale, such as en_US or ja_JP.", {
          pattern: "^[a-z]{2}_[A-Z]{2}$",
        }),
        delivery_zip: s.string("Postal code used to determine delivery eligibility.", {
          minLength: 1,
          maxLength: 32,
        }),
        shipping_location: s.string("Two-letter destination country code.", {
          pattern: "^[A-Z]{2}$",
        }),
        asin: s.string("Ten-character Amazon product identifier.", { pattern: "^[A-Z0-9]{10}$" }),
        other_sellers: s.boolean("Fetch additional seller offers for this item."),
        all_related_products: s.boolean("Fetch every page exposed by related-product carousels."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["asin"] },
    ),
    output: s.looseObject("Amazon Product response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      product_results: s.nullable(s.looseObject("product results value.", {})),
      about_item: s.nullable(s.array("about item value.", s.string("about item value. item."))),
      product_details: s.nullable(s.looseObject("product details value.", {})),
      related_products: s.nullable(
        s.array("related products value.", s.looseObject("related products value. item.", {})),
      ),
      other_sellers: s.nullable(s.array("other sellers value.", s.looseObject("other sellers value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "amazon_search",
    path: "/api/amazon/search",
    description: "Search Amazon products. This upstream API is Alpha.",
    input: s.object(
      "Amazon Search parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        language: s.nullable(
          s.string("Storefront locale, such as en_US or ja_JP.", {
            pattern: "^[a-z]{2}_[A-Z]{2}$",
          }),
        ),
        delivery_zip: s.nullable(
          s.string("Postal code used to determine delivery eligibility.", {
            minLength: 1,
            maxLength: 32,
          }),
        ),
        shipping_location: s.nullable(s.string("Two-letter destination country code.", { pattern: "^[A-Z]{2}$" })),
        k: s.nullable(s.string("Search words. Supply either k or node.", { minLength: 1 })),
        node: s.nullable(s.string("Browse category ID. Supply either node or k.", { pattern: "^[0-9]+$" })),
        s: s.withEnum(s.unknown("Ordering for the product listings."), [
          "relevanceblender",
          "price-asc-rank",
          "price-desc-rank",
          "review-rank",
          "date-desc-rank",
          "exact-aware-popularity-rank",
        ]),
        rh: s.nullable(s.string("Comma-separated Amazon filter tokens, such as n:16318031,p_72:1248897011.")),
        dc: s.boolean("Keep results tied to the original spelling of the query."),
        page: s.integer("Result page to retrieve, starting at 1.", { minimum: 1 }),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Amazon Search asynchronous parameters.",
      {
        amazon_domain: s.string("Amazon storefront hostname."),
        language: s.string("Storefront locale, such as en_US or ja_JP.", {
          pattern: "^[a-z]{2}_[A-Z]{2}$",
        }),
        delivery_zip: s.string("Postal code used to determine delivery eligibility.", {
          minLength: 1,
          maxLength: 32,
        }),
        shipping_location: s.string("Two-letter destination country code.", {
          pattern: "^[A-Z]{2}$",
        }),
        k: s.string("Search words. Supply either k or node.", { minLength: 1 }),
        node: s.string("Browse category ID. Supply either node or k.", { pattern: "^[0-9]+$" }),
        s: s.withEnum(s.unknown("Ordering for the product listings."), [
          "relevanceblender",
          "price-asc-rank",
          "price-desc-rank",
          "review-rank",
          "date-desc-rank",
          "exact-aware-popularity-rank",
        ]),
        rh: s.string("Comma-separated Amazon filter tokens, such as n:16318031,p_72:1248897011."),
        dc: s.boolean("Keep results tied to the original spelling of the query."),
        page: s.integer("Result page to retrieve, starting at 1.", { minimum: 1 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Amazon Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      product_ads: s.nullable(s.array("product ads value.", s.looseObject("product ads value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
