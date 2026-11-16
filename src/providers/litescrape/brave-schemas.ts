import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const braveTools: DataTool[] = [
  {
    name: "brave_ai_mode",
    path: "/api/brave/ai-mode",
    description: "Get Brave AI answers with citations.",
    input: s.object(
      "Brave AI Mode parameters.",
      {
        location: s.nullable(
          s.string(
            "City or postal code from the location catalog, such as Berlin, Germany or Austin, Texas, United States.\n\nQualify ambiguous names with a state or country. Unknown locations fail; lat and lon take precedence when supplied together. On follow-ups, a supplied location replaces inherited coordinates. Send location: null in JSON to clear an inherited location. Resolved coordinates are returned in search_parameters.",
            { minLength: 1, maxLength: 256 },
          ),
        ),
        lat: s.nullable(
          s.number("Latitude from -90 to 90. Supply with lon; explicit coordinates take precedence over location.", {
            minimum: -90,
            maximum: 90,
          }),
        ),
        lon: s.nullable(s.number("Longitude from -180 to 180. Supply with lat.", { minimum: -180, maximum: 180 })),
        country: s.string(
          "Two-letter country preference, or all for all regions. Brave determines regional availability.",
          { pattern: "^(?:[a-z]{2}|all)$" },
        ),
        language: s.string(
          "Search language preference such as en, de or de-de. Brave also considers the language of your question when generating its answer.",
          { pattern: "^[a-z]{2}(?:-[a-z]{2})?$" },
        ),
        safeSearch: s.withEnum(s.unknown("Adult-content filtering preference: off, moderate or strict."), [
          "off",
          "moderate",
          "strict",
        ]),
        units_of_measurement: s.withEnum(
          s.unknown("Unit preference: us for US customary units or metric for metric units."),
          ["us", "metric"],
        ),
        q: s.string("Question for Brave AI Mode. Required for both a new conversation and each follow-up.", {
          minLength: 1,
          maxLength: 2048,
        }),
        continuation_token: s.nullable(
          s.string(
            "Token from the previous response. Send with a new q to continue that conversation.\n\nOmitted preferences carry over from the token; supplied preferences override them. Use the latest token returned by each successful response. Treat this token as a conversation credential and keep it private. Prefer JSON POST for follow-ups. Tokens expire after one hour and require the same API key and endpoint; omit the token to start again.",
            { minLength: 1, maxLength: 4096, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
          ),
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Brave AI Mode asynchronous parameters.",
      {
        location: s.string(
          "City or postal code from the location catalog, such as Berlin, Germany or Austin, Texas, United States.\n\nQualify ambiguous names with a state or country. Unknown locations fail; lat and lon take precedence when supplied together. On follow-ups, a supplied location replaces inherited coordinates. Send location: null in JSON to clear an inherited location. Resolved coordinates are returned in search_parameters.",
          { minLength: 1, maxLength: 256 },
        ),
        lat: s.number("Latitude from -90 to 90. Supply with lon; explicit coordinates take precedence over location.", {
          minimum: -90,
          maximum: 90,
        }),
        lon: s.number("Longitude from -180 to 180. Supply with lat.", {
          minimum: -180,
          maximum: 180,
        }),
        country: s.string(
          "Two-letter country preference, or all for all regions. Brave determines regional availability.",
          { pattern: "^(?:[a-z]{2}|all)$" },
        ),
        language: s.string(
          "Search language preference such as en, de or de-de. Brave also considers the language of your question when generating its answer.",
          { pattern: "^[a-z]{2}(?:-[a-z]{2})?$" },
        ),
        safeSearch: s.withEnum(s.unknown("Adult-content filtering preference: off, moderate or strict."), [
          "off",
          "moderate",
          "strict",
        ]),
        units_of_measurement: s.withEnum(
          s.unknown("Unit preference: us for US customary units or metric for metric units."),
          ["us", "metric"],
        ),
        q: s.string("Question for Brave AI Mode. Required for both a new conversation and each follow-up.", {
          minLength: 1,
          maxLength: 2048,
        }),
        continuation_token: s.string(
          "Token from the previous response. Send with a new q to continue that conversation.\n\nOmitted preferences carry over from the token; supplied preferences override them. Use the latest token returned by each successful response. Treat this token as a conversation credential and keep it private. Prefer JSON POST for follow-ups. Tokens expire after one hour and require the same API key and endpoint; omit the token to start again.",
          { minLength: 1, maxLength: 4096, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Brave AI Mode response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      answer: s.string("answer value."),
      text_blocks: s.array("text blocks value.", s.looseObject("text blocks value. item.", {})),
      references: s.array("references value.", s.looseObject("references value. item.", {})),
      follow_up_questions: s.array("follow up questions value.", s.string("follow up questions value. item.")),
      continuation_token: s.string("continuation token value."),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "brave_search",
    path: "/api/brave/search",
    description: "Get Brave web search results.",
    input: s.object(
      "Brave Search parameters.",
      {
        q: s.string(
          "Search text. Brave query operators are supported; Brave may relax them when there are few matches.",
          { minLength: 1, maxLength: 2048 },
        ),
        offset: s.integer(
          "Zero-based page number, not a result offset. Follow litescrape_pagination.next when present.\n\nResults per page depend on Brave. Organic positions start at 1 within each page.",
          { minimum: 0, maximum: 9 },
        ),
        country: s.string(
          "Two-letter country preference, or all for all regions. Brave determines regional availability.",
          { pattern: "^(?:[a-z]{2}|all)$" },
        ),
        ui_lang: s.string(
          "Interface language preference such as en-us or de-de. This does not restrict result languages.",
          { pattern: "^[a-z]{2}(?:-[a-z]{2})?$" },
        ),
        safesearch: s.withEnum(s.unknown("Adult-content filtering preference."), ["off", "moderate", "strict"]),
        tf: s.nullable(
          s.withEnum(
            s.unknown("Optional date window: pd for past day, pw for past week, pm for past month, py for past year."),
            ["pd", "pw", "pm", "py"],
          ),
        ),
        spellcheck: s.boolean("Allow Brave to correct the query spelling."),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Brave Search asynchronous parameters.",
      {
        q: s.string(
          "Search text. Brave query operators are supported; Brave may relax them when there are few matches.",
          { minLength: 1, maxLength: 2048 },
        ),
        offset: s.integer(
          "Zero-based page number, not a result offset. Follow litescrape_pagination.next when present.\n\nResults per page depend on Brave. Organic positions start at 1 within each page.",
          { minimum: 0, maximum: 9 },
        ),
        country: s.string(
          "Two-letter country preference, or all for all regions. Brave determines regional availability.",
          { pattern: "^(?:[a-z]{2}|all)$" },
        ),
        ui_lang: s.string(
          "Interface language preference such as en-us or de-de. This does not restrict result languages.",
          { pattern: "^[a-z]{2}(?:-[a-z]{2})?$" },
        ),
        safesearch: s.withEnum(s.unknown("Adult-content filtering preference."), ["off", "moderate", "strict"]),
        tf: s.withEnum(
          s.unknown("Optional date window: pd for past day, pw for past week, pm for past month, py for past year."),
          ["pd", "pw", "pm", "py"],
        ),
        spellcheck: s.boolean("Allow Brave to correct the query spelling."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Brave Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      organic_results: s.array("organic results value.", s.looseObject("organic results value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.looseObject("litescrape pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
