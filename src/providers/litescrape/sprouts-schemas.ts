import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const sproutsTools: DataTool[] = [
  {
    name: "sprouts_product",
    path: "/api/sprouts/product",
    description: "Get a Sprouts product's details, price and availability. This upstream API is Alpha.",
    input: s.object(
      "Sprouts Product parameters.",
      {
        url: s.string("Public HTTPS product URL on this retailer's site.", {
          minLength: 1,
          maxLength: 4096,
        }),
        store_id: s.nullable(
          s.string("Sprouts store location ID, such as 17650. Selects that store's in-store catalog.", {
            minLength: 1,
            maxLength: 8,
            pattern: "^[0-9]{1,8}$",
          }),
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Sprouts Product asynchronous parameters.",
      {
        url: s.string("Public HTTPS product URL on this retailer's site.", {
          minLength: 1,
          maxLength: 4096,
        }),
        store_id: s.string("Sprouts store location ID, such as 17650. Selects that store's in-store catalog.", {
          minLength: 1,
          maxLength: 8,
          pattern: "^[0-9]{1,8}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Sprouts Product response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      product: s.looseObject("product value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "sprouts_search",
    path: "/api/sprouts/search",
    description: "Search Sprouts products with prices and availability. This upstream API is Alpha.",
    input: s.object(
      "Sprouts Search parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("One-based result page.", { minimum: 1, maximum: 100 }),
        store_id: s.nullable(
          s.string("Sprouts store location ID, such as 17650. Selects that store's in-store catalog.", {
            minLength: 1,
            maxLength: 8,
            pattern: "^[0-9]{1,8}$",
          }),
        ),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Sprouts Search asynchronous parameters.",
      {
        query: s.string("Product keywords to search for.", { minLength: 1, maxLength: 500 }),
        page: s.integer("One-based result page.", { minimum: 1, maximum: 100 }),
        store_id: s.string("Sprouts store location ID, such as 17650. Selects that store's in-store catalog.", {
          minLength: 1,
          maxLength: 8,
          pattern: "^[0-9]{1,8}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Sprouts Search response.", {
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
