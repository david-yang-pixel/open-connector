import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const zillowTools: DataTool[] = [
  {
    name: "zillow_locations",
    path: "/api/zillow/locations",
    description: "Get Zillow region and address suggestions.",
    input: s.object(
      "Zillow Locations parameters.",
      {
        q: s.nullable(
          s.string(
            "City, ZIP code, neighborhood or street address. Required on the first page; omit with page_token.",
            { minLength: 1, maxLength: 200 },
          ),
        ),
        type: s.nullable(
          s.withEnum(
            s.unknown(
              "Find regions or addresses. Defaults to regions; omit with page_token.\n\nRegion suggestions include Zillow region IDs. Address suggestions return names; this route does not return property ZPIDs or coordinates.",
            ),
            ["regions", "addresses"],
          ),
        ),
        limit: s.nullable(
          s.integer(
            "Suggestions per page, from 1 to 100. Defaults to 10; omit with page_token.\n\nFollow pagination.next or send pagination.next_page_token as page_token. Each lookup supports up to 1,000 suggestions; if pagination.possibly_truncated is true, refine q.",
            { minimum: 1, maximum: 100 },
          ),
        ),
        page_token: s.nullable(
          s.string(
            "Opaque next_page_token from the preceding response. Send it alone to continue the same lookup.\n\nContinue the same query, suggestion type and page size without repeating previously returned suggestions. If pagination.next is null while has_more is true, send page_token through POST JSON.",
            { minLength: 1, maxLength: 32768 },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Zillow Locations asynchronous parameters.",
      {
        q: s.string(
          "City, ZIP code, neighborhood or street address. Required on the first page; omit with page_token.",
          { minLength: 1, maxLength: 200 },
        ),
        type: s.withEnum(
          s.unknown(
            "Find regions or addresses. Defaults to regions; omit with page_token.\n\nRegion suggestions include Zillow region IDs. Address suggestions return names; this route does not return property ZPIDs or coordinates.",
          ),
          ["regions", "addresses"],
        ),
        limit: s.integer(
          "Suggestions per page, from 1 to 100. Defaults to 10; omit with page_token.\n\nFollow pagination.next or send pagination.next_page_token as page_token. Each lookup supports up to 1,000 suggestions; if pagination.possibly_truncated is true, refine q.",
          { minimum: 1, maximum: 100 },
        ),
        page_token: s.string(
          "Opaque next_page_token from the preceding response. Send it alone to continue the same lookup.\n\nContinue the same query, suggestion type and page size without repeating previously returned suggestions. If pagination.next is null while has_more is true, send page_token through POST JSON.",
          { minLength: 1, maxLength: 32768 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Zillow Locations response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      locations: s.array("locations value.", s.looseObject("locations value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "zillow_property",
    path: "/api/zillow/property",
    description: "Get a Zillow property by ID or URL.",
    input: s.object(
      "Zillow Property parameters.",
      {
        zpid: s.nullable(s.integer("Zillow property identifier. Supply zpid or url.", { exclusiveMinimum: 0 })),
        url: s.nullable(
          s.string(
            "Zillow homedetails URL. Supply url or zpid.\n\nSupply exactly one of url or zpid. Apartment building URLs are not property-detail URLs.",
            { maxLength: 2048 },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Zillow Property asynchronous parameters.",
      {
        zpid: s.integer("Zillow property identifier. Supply zpid or url.", { exclusiveMinimum: 0 }),
        url: s.string(
          "Zillow homedetails URL. Supply url or zpid.\n\nSupply exactly one of url or zpid. Apartment building URLs are not property-detail URLs.",
          { maxLength: 2048 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Zillow Property response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      property: s.looseObject("property value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "zillow_search",
    path: "/api/zillow/search",
    description: "Search Zillow homes for sale, for rent or recently sold.",
    input: s.object(
      "Zillow Search parameters.",
      {
        min_price: s.nullable(
          s.integer(
            "Minimum listing price in US dollars.\n\nFor rental searches, prices are monthly rent in US dollars.",
            { minimum: 0 },
          ),
        ),
        max_price: s.nullable(s.integer("Maximum listing price in US dollars.", { minimum: 0 })),
        min_beds: s.nullable(s.integer("Minimum number of bedrooms.", { minimum: 0, maximum: 20 })),
        max_beds: s.nullable(s.integer("Maximum number of bedrooms.", { minimum: 0, maximum: 20 })),
        min_baths: s.nullable(s.number("Minimum number of bathrooms.", { minimum: 0, maximum: 20 })),
        min_sqft: s.nullable(s.integer("Minimum interior area in square feet.", { minimum: 0 })),
        max_sqft: s.nullable(s.integer("Maximum interior area in square feet.", { minimum: 0 })),
        q: s.nullable(
          s.string(
            "City, ZIP code, neighborhood or address. Supply q or map_bounds.\n\nSupply exactly one of q or map_bounds.",
            { minLength: 1, maxLength: 200 },
          ),
        ),
        map_bounds: s.nullable(s.string("Map rectangle as north,east,south,west.")),
        status: s.withEnum(s.unknown("Listing status."), ["for_sale", "for_rent", "sold"]),
        property_type: s.nullable(
          s.withEnum(s.unknown("Restrict results to one property type."), [
            "house",
            "condo",
            "townhouse",
            "multi_family",
            "land",
            "manufactured",
            "apartment",
          ]),
        ),
        sort: s.withEnum(s.unknown("Order of matching listings."), [
          "recommended",
          "newest",
          "price_asc",
          "price_desc",
          "beds",
          "sqft",
        ]),
        page: s.integer(
          "Result page, starting at 1; Zillow caps searches at 20 pages.\n\nFollow pagination.next for another page. A search exposes at most 20 pages.",
          { minimum: 1, maximum: 20 },
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Zillow Search asynchronous parameters.",
      {
        min_price: s.integer(
          "Minimum listing price in US dollars.\n\nFor rental searches, prices are monthly rent in US dollars.",
          { minimum: 0 },
        ),
        max_price: s.integer("Maximum listing price in US dollars.", { minimum: 0 }),
        min_beds: s.integer("Minimum number of bedrooms.", { minimum: 0, maximum: 20 }),
        max_beds: s.integer("Maximum number of bedrooms.", { minimum: 0, maximum: 20 }),
        min_baths: s.number("Minimum number of bathrooms.", { minimum: 0, maximum: 20 }),
        min_sqft: s.integer("Minimum interior area in square feet.", { minimum: 0 }),
        max_sqft: s.integer("Maximum interior area in square feet.", { minimum: 0 }),
        q: s.string(
          "City, ZIP code, neighborhood or address. Supply q or map_bounds.\n\nSupply exactly one of q or map_bounds.",
          { minLength: 1, maxLength: 200 },
        ),
        map_bounds: s.string("Map rectangle as north,east,south,west."),
        status: s.withEnum(s.unknown("Listing status."), ["for_sale", "for_rent", "sold"]),
        property_type: s.withEnum(s.unknown("Restrict results to one property type."), [
          "house",
          "condo",
          "townhouse",
          "multi_family",
          "land",
          "manufactured",
          "apartment",
        ]),
        sort: s.withEnum(s.unknown("Order of matching listings."), [
          "recommended",
          "newest",
          "price_asc",
          "price_desc",
          "beds",
          "sqft",
        ]),
        page: s.integer(
          "Result page, starting at 1; Zillow caps searches at 20 pages.\n\nFollow pagination.next for another page. A search exposes at most 20 pages.",
          { minimum: 1, maximum: 20 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Zillow Search response.", {
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
