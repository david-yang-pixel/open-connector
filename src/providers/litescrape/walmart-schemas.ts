import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const walmartTools: DataTool[] = [
  {
    name: "walmart_product",
    path: "/api/walmart/product",
    description: "Get a Walmart product's details, price and availability. This upstream API is Alpha.",
    input: s.object(
      "Walmart Product parameters.",
      {
        url: s.string("Public HTTPS product URL on this retailer's site.", {
          minLength: 1,
          maxLength: 4096,
        }),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Walmart Product asynchronous parameters.",
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
    output: s.looseObject("Walmart Product response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      product: s.looseObject("product value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "walmart_search",
    path: "/api/walmart/search",
    description: "Search Walmart products with prices and availability. This upstream API is Alpha.",
    input: s.object(
      "Walmart Search parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("One-based result page.", { minimum: 1, maximum: 100 }),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Walmart Search asynchronous parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("One-based result page.", { minimum: 1, maximum: 100 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Walmart Search response.", {
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
