import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const redfinTools: DataTool[] = [
  {
    name: "redfin_property",
    path: "/api/redfin/property",
    description: "Get a Redfin property by listing URL.",
    input: s.object(
      "Redfin Property parameters.",
      {
        url: s.string("Redfin property URL ending in /home/<property_id>.", { maxLength: 2048 }),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Redfin Property asynchronous parameters.",
      {
        url: s.string("Redfin property URL ending in /home/<property_id>.", { maxLength: 2048 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Redfin Property response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      property: s.looseObject("property value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "redfin_search",
    path: "/api/redfin/search",
    description: "Search Redfin homes for sale or recently sold.",
    input: s.object(
      "Redfin Search parameters.",
      {
        min_price: s.nullable(s.integer("Minimum listing price in US dollars.", { minimum: 0 })),
        max_price: s.nullable(s.integer("Maximum listing price in US dollars.", { minimum: 0 })),
        min_beds: s.nullable(s.integer("Minimum number of bedrooms.", { minimum: 0, maximum: 20 })),
        max_beds: s.nullable(s.integer("Maximum number of bedrooms.", { minimum: 0, maximum: 20 })),
        min_baths: s.nullable(s.number("Minimum number of bathrooms.", { minimum: 0, maximum: 20 })),
        min_sqft: s.nullable(s.integer("Minimum interior area in square feet.", { minimum: 0 })),
        max_sqft: s.nullable(s.integer("Maximum interior area in square feet.", { minimum: 0 })),
        url: s.nullable(
          s.string(
            "Redfin city, ZIP, county or neighborhood search URL. Existing URL filters are retained unless overridden.\n\nSupply one location: a region URL, region_id with region_type, or map_bounds.",
            { maxLength: 2048 },
          ),
        ),
        region_id: s.nullable(s.integer("Redfin region identifier; requires region_type.", { exclusiveMinimum: 0 })),
        region_type: s.nullable(
          s.withEnum(
            s.unknown(
              "Region kind: 1 neighborhood, 2 ZIP region, 5 county, 6 city, 11 state.\n\nA ZIP region identifier differs from the ZIP code. Use a Redfin ZIP search URL if the region identifier is unknown.",
            ),
            [1, 2, 5, 6, 11],
          ),
        ),
        map_bounds: s.nullable(s.string("Map rectangle as north,east,south,west.")),
        status: s.nullable(
          s.withEnum(s.unknown("Listing status. Defaults to for_sale when no URL is supplied."), ["for_sale", "sold"]),
        ),
        sold_within_days: s.nullable(
          s.integer("Sold listings from the last N days; requires status=sold. Defaults to 180 for sold searches.", {
            minimum: 1,
            maximum: 365,
          }),
        ),
        property_type: s.nullable(
          s.withEnum(s.unknown("Restrict results to one property type."), [
            "house",
            "condo",
            "townhouse",
            "multi_family",
            "land",
            "other",
            "manufactured",
            "co_op",
          ]),
        ),
        sort: s.nullable(
          s.withEnum(s.unknown("Result ordering. Defaults to recommended when no URL is supplied."), [
            "recommended",
            "newest",
            "price_asc",
            "price_desc",
            "sqft",
          ]),
        ),
        limit: s.integer(
          "Maximum homes returned. Narrow the region or map bounds when results reach this limit.\n\nThe response does not advertise pagination or a total count. If search_information.possibly_truncated is true, narrow the location or filters.",
          { minimum: 1, maximum: 350 },
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Redfin Search asynchronous parameters.",
      {
        min_price: s.integer("Minimum listing price in US dollars.", { minimum: 0 }),
        max_price: s.integer("Maximum listing price in US dollars.", { minimum: 0 }),
        min_beds: s.integer("Minimum number of bedrooms.", { minimum: 0, maximum: 20 }),
        max_beds: s.integer("Maximum number of bedrooms.", { minimum: 0, maximum: 20 }),
        min_baths: s.number("Minimum number of bathrooms.", { minimum: 0, maximum: 20 }),
        min_sqft: s.integer("Minimum interior area in square feet.", { minimum: 0 }),
        max_sqft: s.integer("Maximum interior area in square feet.", { minimum: 0 }),
        url: s.string(
          "Redfin city, ZIP, county or neighborhood search URL. Existing URL filters are retained unless overridden.\n\nSupply one location: a region URL, region_id with region_type, or map_bounds.",
          { maxLength: 2048 },
        ),
        region_id: s.integer("Redfin region identifier; requires region_type.", {
          exclusiveMinimum: 0,
        }),
        region_type: s.withEnum(
          s.unknown(
            "Region kind: 1 neighborhood, 2 ZIP region, 5 county, 6 city, 11 state.\n\nA ZIP region identifier differs from the ZIP code. Use a Redfin ZIP search URL if the region identifier is unknown.",
          ),
          [1, 2, 5, 6, 11],
        ),
        map_bounds: s.string("Map rectangle as north,east,south,west."),
        status: s.withEnum(s.unknown("Listing status. Defaults to for_sale when no URL is supplied."), [
          "for_sale",
          "sold",
        ]),
        sold_within_days: s.integer(
          "Sold listings from the last N days; requires status=sold. Defaults to 180 for sold searches.",
          { minimum: 1, maximum: 365 },
        ),
        property_type: s.withEnum(s.unknown("Restrict results to one property type."), [
          "house",
          "condo",
          "townhouse",
          "multi_family",
          "land",
          "other",
          "manufactured",
          "co_op",
        ]),
        sort: s.withEnum(s.unknown("Result ordering. Defaults to recommended when no URL is supplied."), [
          "recommended",
          "newest",
          "price_asc",
          "price_desc",
          "sqft",
        ]),
        limit: s.integer(
          "Maximum homes returned. Narrow the region or map bounds when results reach this limit.\n\nThe response does not advertise pagination or a total count. If search_information.possibly_truncated is true, narrow the location or filters.",
          { minimum: 1, maximum: 350 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Redfin Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      properties: s.array("properties value.", s.looseObject("properties value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
