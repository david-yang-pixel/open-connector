import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const homedepotTools: DataTool[] = [
  {
    name: "homedepot_product",
    path: "/api/homedepot/product",
    description: "Get a Home Depot product's details, price and availability. This upstream API is Alpha.",
    input: s.object(
      "Home Depot Product parameters.",
      {
        url: s.string("Public HTTPS product URL on this retailer's site.", {
          minLength: 1,
          maxLength: 4096,
        }),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Home Depot Product asynchronous parameters.",
      {
        url: s.string("Public HTTPS product URL on this retailer's site.", {
          minLength: 1,
          maxLength: 4096,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Home Depot Product response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      product: s.looseObject("product value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "homedepot_search",
    path: "/api/homedepot/search",
    description: "Search Home Depot products with prices and availability. This upstream API is Alpha.",
    input: s.object(
      "Home Depot Search parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("Only the first result page is currently supported.", {
          minimum: 1,
          maximum: 1,
        }),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Home Depot Search asynchronous parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("Only the first result page is currently supported.", {
          minimum: 1,
          maximum: 1,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Home Depot Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      products: s.array("products value.", s.looseObject("products value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
