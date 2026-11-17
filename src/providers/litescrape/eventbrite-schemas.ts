import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const eventbriteTools: DataTool[] = [
  {
    name: "eventbrite_search",
    path: "/api/eventbrite/search",
    description: "Search Eventbrite events by location and keyword.",
    input: s.object(
      "Eventbrite Search parameters.",
      {
        location: s.string("Eventbrite location slug, such as tx--austin, ny--new-york, or online.", {
          maxLength: 150,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+|--[a-z0-9]+)*$",
        }),
        q: s.string("Search keywords, such as music or python workshops.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S+(?: \\S+)*$",
        }),
        page: s.integer("Results page, starting at 1.", { minimum: 1, maximum: 100 }),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Eventbrite Search asynchronous parameters.",
      {
        location: s.string("Eventbrite location slug, such as tx--austin, ny--new-york, or online.", {
          maxLength: 150,
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+|--[a-z0-9]+)*$",
        }),
        q: s.string("Search keywords, such as music or python workshops.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S+(?: \\S+)*$",
        }),
        page: s.integer("Results page, starting at 1.", { minimum: 1, maximum: 100 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Eventbrite Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      organic_results: s.array("organic results value.", s.looseObject("organic results value. item.", {})),
      promoted_results: s.array("promoted results value.", s.looseObject("promoted results value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
