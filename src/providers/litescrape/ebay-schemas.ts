import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const ebayTools: DataTool[] = [
  {
    name: "ebay_product",
    path: "/api/ebay/product",
    description: "Get an eBay listing by item ID.",
    input: s.object(
      "eBay Product parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        product_id: s.string("12-digit eBay listing ID from search results or an /itm/ URL.", {
          pattern: "^[0-9]{12}$",
        }),
        locale: s.nullable(s.string("Country code for eBay's localized interface, e.g. US, JP, CA.")),
        lang: s.nullable(
          s.string("Interface language override; requires locale and ebay.com.", {
            maxLength: 12,
            pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$",
          }),
        ),
        shipping_country: s.nullable(s.string("Two-letter destination country code for shipping calculations.")),
      },
      { required: ["product_id"] },
    ),
    asyncInput: s.object(
      "eBay Product asynchronous parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        product_id: s.string("12-digit eBay listing ID from search results or an /itm/ URL.", {
          pattern: "^[0-9]{12}$",
        }),
        locale: s.string("Country code for eBay's localized interface, e.g. US, JP, CA."),
        lang: s.string("Interface language override; requires locale and ebay.com.", {
          maxLength: 12,
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$",
        }),
        shipping_country: s.string("Two-letter destination country code for shipping calculations."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_id"] },
    ),
    output: s.looseObject("eBay Product response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      product_results: s.looseObject("product results value.", {}),
      seller_results: s.nullable(s.looseObject("seller results value.", {})),
      related_products: s.nullable(
        s.array("related products value.", s.looseObject("related products value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "ebay_search",
    path: "/api/ebay/search",
    description: "Search eBay listings by keyword or category.",
    input: s.object(
      "eBay Search parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        _nkw: s.nullable(
          s.string("Search keywords. Required unless category_id is supplied.", {
            minLength: 1,
            maxLength: 500,
          }),
        ),
        category_id: s.nullable(s.integer("eBay category ID.", { minimum: 1, maximum: 2147483647 })),
        _pgn: s.integer("Result page, starting at 1.", { minimum: 1, maximum: 2147483647 }),
        _ipg: s.withEnum(s.unknown("Requested results per page. eBay may adjust the page size."), [25, 50, 100, 200]),
        _sop: s.withEnum(
          s.unknown(
            "Sort: 12 best match, 1 ending soonest, 10 newly listed, 7 nearest, 15/16 total price ascending/descending, 2/3 item price ascending/descending, 18/19 condition new/used first. Availability depends on marketplace.",
          ),
          [1, 2, 3, 7, 10, 12, 15, 16, 18, 19],
        ),
        _udlo: s.nullable(s.number("Minimum item price.", { minimum: 0 })),
        _udhi: s.nullable(s.number("Maximum item price.", { minimum: 0 })),
        buying_format: s.nullable(
          s.withEnum(s.unknown("Auction, Buy It Now (BIN), or accepts offers (BO)."), ["Auction", "BIN", "BO"]),
        ),
        LH_ItemCondition: s.nullable(
          s.string("Condition IDs joined with |, such as 1000|3000.", {
            pattern: "^[0-9]{1,4}(\\|[0-9]{1,4}){0,9}$",
          }),
        ),
        _stpos: s.nullable(
          s.string("Destination postal code used by eBay for shipping estimates.", {
            minLength: 1,
            maxLength: 20,
          }),
        ),
        _salic: s.nullable(s.integer("eBay item-location country ID, e.g. 1 US, 2 Canada, 3 UK.")),
        _blrs: s.nullable(
          s.literal("spell_auto_correct", {
            description: "Exclude automatic spelling corrections.",
          }),
        ),
        show_only: s.nullable(
          s.string("Comma-separated filters: FR, RPA, AS, Savings, SaleItems, Lots, Charity, AV, FS, LPickup.", {
            maxLength: 100,
          }),
        ),
        _sasl: s.nullable(s.string("Comma-separated eBay seller usernames.", { maxLength: 1000 })),
        _saslop: s.withEnum(s.unknown("Include (1) or exclude (2) the sellers in _sasl."), [1, 2]),
        popular_filters: s.nullable(
          s.string(
            "eBay aspect filters as key=value pairs joined with &, with multiple values joined by |. Percent-encoded names are accepted.",
            { maxLength: 4000 },
          ),
        ),
        _dmd: s.nullable(s.withEnum(s.unknown("Result layout."), ["Grid", "List"])),
        LH_PrefLoc: s.nullable(
          s.withEnum(s.unknown("Item location relative to the marketplace."), ["Domestic", "Regional", "Worldwide"]),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "eBay Search asynchronous parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        _nkw: s.string("Search keywords. Required unless category_id is supplied.", {
          minLength: 1,
          maxLength: 500,
        }),
        category_id: s.integer("eBay category ID.", { minimum: 1, maximum: 2147483647 }),
        _pgn: s.integer("Result page, starting at 1.", { minimum: 1, maximum: 2147483647 }),
        _ipg: s.withEnum(s.unknown("Requested results per page. eBay may adjust the page size."), [25, 50, 100, 200]),
        _sop: s.withEnum(
          s.unknown(
            "Sort: 12 best match, 1 ending soonest, 10 newly listed, 7 nearest, 15/16 total price ascending/descending, 2/3 item price ascending/descending, 18/19 condition new/used first. Availability depends on marketplace.",
          ),
          [1, 2, 3, 7, 10, 12, 15, 16, 18, 19],
        ),
        _udlo: s.number("Minimum item price.", { minimum: 0 }),
        _udhi: s.number("Maximum item price.", { minimum: 0 }),
        buying_format: s.withEnum(s.unknown("Auction, Buy It Now (BIN), or accepts offers (BO)."), [
          "Auction",
          "BIN",
          "BO",
        ]),
        LH_ItemCondition: s.string("Condition IDs joined with |, such as 1000|3000.", {
          pattern: "^[0-9]{1,4}(\\|[0-9]{1,4}){0,9}$",
        }),
        _stpos: s.string("Destination postal code used by eBay for shipping estimates.", {
          minLength: 1,
          maxLength: 20,
        }),
        _salic: s.integer("eBay item-location country ID, e.g. 1 US, 2 Canada, 3 UK."),
        _blrs: s.literal("spell_auto_correct", {
          description: "Exclude automatic spelling corrections.",
        }),
        show_only: s.string(
          "Comma-separated filters: FR, RPA, AS, Savings, SaleItems, Lots, Charity, AV, FS, LPickup.",
          { maxLength: 100 },
        ),
        _sasl: s.string("Comma-separated eBay seller usernames.", { maxLength: 1000 }),
        _saslop: s.withEnum(s.unknown("Include (1) or exclude (2) the sellers in _sasl."), [1, 2]),
        popular_filters: s.string(
          "eBay aspect filters as key=value pairs joined with &, with multiple values joined by |. Percent-encoded names are accepted.",
          { maxLength: 4000 },
        ),
        _dmd: s.withEnum(s.unknown("Result layout."), ["Grid", "List"]),
        LH_PrefLoc: s.withEnum(s.unknown("Item location relative to the marketplace."), [
          "Domestic",
          "Regional",
          "Worldwide",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("eBay Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.looseObject("search information value.", {}),
      organic_results: s.array("organic results value.", s.looseObject("organic results value. item.", {})),
      categories: s.nullable(s.array("categories value.", s.looseObject("categories value. item.", {}))),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      deals: s.nullable(s.looseObject("deals value.", {})),
      inline_categories: s.nullable(
        s.array("inline categories value.", s.looseObject("inline categories value. item.", {})),
      ),
      inline_results: s.nullable(s.array("inline results value.", s.looseObject("inline results value. item.", {}))),
      popular_filters: s.nullable(s.array("popular filters value.", s.looseObject("popular filters value. item.", {}))),
      related_items: s.nullable(s.array("related items value.", s.looseObject("related items value. item.", {}))),
      review_highlights: s.nullable(
        s.array("review highlights value.", s.looseObject("review highlights value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "ebay_seller",
    path: "/api/ebay/seller",
    description: "Get an eBay seller's profile and listings.",
    input: s.object(
      "eBay Seller parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        seller_id: s.string("Seller username for type=user, or the store URL slug for type=store.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9_.*-]{0,99}$",
        }),
        type: s.withEnum(s.unknown("Public seller profile type."), ["user", "store"]),
        _pgn: s.integer("Result page, starting at 1.", { minimum: 1, maximum: 2147483647 }),
        _ipg: s.withEnum(s.unknown("Products per page."), [24, 48, 72]),
        _sop: s.withEnum(
          s.unknown(
            "Sort: 12 best match, 1 ending soonest, 7 nearest, 10 newly listed, 15/16 total price ascending/descending.",
          ),
          [1, 7, 10, 12, 15, 16],
        ),
        buying_format: s.withEnum(s.unknown("All listings (0), Buy It Now (1), or auctions (2)."), [0, 1, 2]),
        LH_ItemCondition: s.nullable(
          s.string("Condition IDs joined with |: 3 new, 4 used, 10 unspecified.", {
            maxLength: 20,
            pattern: "^(?:3|4|10)(?:\\|(?:3|4|10))*$",
          }),
        ),
        free_shipping: s.boolean("Only products with free shipping."),
      },
      { required: ["seller_id", "type"] },
    ),
    asyncInput: s.object(
      "eBay Seller asynchronous parameters.",
      {
        ebay_domain: s.withEnum(s.unknown("eBay marketplace hostname."), [
          "ebay.com",
          "ebay.co.uk",
          "ebay.ca",
          "ebay.com.au",
          "ebay.de",
          "ebay.fr",
          "ebay.it",
          "ebay.es",
          "ebay.at",
          "ebay.be",
          "ebay.ch",
          "ebay.ie",
          "ebay.nl",
          "ebay.com.hk",
          "ebay.com.my",
          "ebay.pl",
          "ebay.com.sg",
        ]),
        seller_id: s.string("Seller username for type=user, or the store URL slug for type=store.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9_.*-]{0,99}$",
        }),
        type: s.withEnum(s.unknown("Public seller profile type."), ["user", "store"]),
        _pgn: s.integer("Result page, starting at 1.", { minimum: 1, maximum: 2147483647 }),
        _ipg: s.withEnum(s.unknown("Products per page."), [24, 48, 72]),
        _sop: s.withEnum(
          s.unknown(
            "Sort: 12 best match, 1 ending soonest, 7 nearest, 10 newly listed, 15/16 total price ascending/descending.",
          ),
          [1, 7, 10, 12, 15, 16],
        ),
        buying_format: s.withEnum(s.unknown("All listings (0), Buy It Now (1), or auctions (2)."), [0, 1, 2]),
        LH_ItemCondition: s.string("Condition IDs joined with |: 3 new, 4 used, 10 unspecified.", {
          maxLength: 20,
          pattern: "^(?:3|4|10)(?:\\|(?:3|4|10))*$",
        }),
        free_shipping: s.boolean("Only products with free shipping."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["seller_id", "type"] },
    ),
    output: s.looseObject("eBay Seller response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      seller_results: s.looseObject("seller results value.", {}),
      product_results: s.array("product results value.", s.looseObject("product results value. item.", {})),
      featured_categories: s.nullable(
        s.array("featured categories value.", s.looseObject("featured categories value. item.", {})),
      ),
      about: s.nullable(s.looseObject("about value.", {})),
      feedback: s.nullable(s.looseObject("feedback value.", {})),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
