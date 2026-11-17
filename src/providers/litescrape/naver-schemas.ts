import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const naverTools: DataTool[] = [
  {
    name: "naver_ai_overview",
    path: "/api/naver/ai-overview",
    description: "Get Naver AI Briefing answers with citations.",
    input: s.object(
      "Naver AI Overview parameters.",
      {
        query: s.nullable(
          s.string("Query for an AI Briefing; excludes page_token.", {
            minLength: 1,
            maxLength: 4096,
          }),
        ),
        page_token: s.nullable(
          s.string("Business AI Briefing continuation from ai_briefing.page_token; excludes query.", {
            minLength: 1,
            maxLength: 2048,
          }),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Naver AI Overview asynchronous parameters.",
      {
        query: s.string("Query for an AI Briefing; excludes page_token.", {
          minLength: 1,
          maxLength: 4096,
        }),
        page_token: s.string("Business AI Briefing continuation from ai_briefing.page_token; excludes query.", {
          minLength: 1,
          maxLength: 2048,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Naver AI Overview response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      markdown: s.nullable(s.string("markdown value.")),
      text_blocks: s.array("text blocks value.", s.looseObject("text blocks value. item.", {})),
      references: s.array("references value.", s.looseObject("references value. item.", {})),
      media: s.array("media value.", s.looseObject("media value. item.", {})),
      related_questions: s.nullable(
        s.array("related questions value.", s.looseObject("related questions value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "naver_search",
    path: "/api/naver/search",
    description: "Search Naver web, news, video and image results.",
    input: s.object(
      "Naver Search parameters.",
      {
        query: s.string("Search query, including Naver search operators.", {
          minLength: 1,
          maxLength: 4096,
        }),
        start: s.nullable(s.integer("Result offset; takes precedence over page.", { minimum: 0 })),
        page: s.nullable(s.integer("Page number, starting at 1.", { minimum: 1 })),
        num: s.nullable(s.integer("Image result limit; defaults to 50 for images.", { minimum: 1, maximum: 100 })),
        where: s.withEnum(s.unknown("Search type: nexearch (general search), web, video, news, or image."), [
          "nexearch",
          "web",
          "video",
          "news",
          "image",
        ]),
        sort_by: s.nullable(
          s.withEnum(
            s.unknown(
              "News: 0 relevance (default), 1 latest, 2 oldest. Other types: r relevance (default), dd latest.",
            ),
            ["r", "dd", "0", "1", "2"],
          ),
        ),
        period: s.string(
          "Time window: all, 1h, 1d, 1w, 1m, 3m, 6m, 1y, or fromYYYYMMDDtoYYYYMMDD. News also accepts 2h, 3h, 4h, 5h, and 6h.",
        ),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Naver Search asynchronous parameters.",
      {
        query: s.string("Search query, including Naver search operators.", {
          minLength: 1,
          maxLength: 4096,
        }),
        start: s.integer("Result offset; takes precedence over page.", { minimum: 0 }),
        page: s.integer("Page number, starting at 1.", { minimum: 1 }),
        num: s.integer("Image result limit; defaults to 50 for images.", {
          minimum: 1,
          maximum: 100,
        }),
        where: s.withEnum(s.unknown("Search type: nexearch (general search), web, video, news, or image."), [
          "nexearch",
          "web",
          "video",
          "news",
          "image",
        ]),
        sort_by: s.withEnum(
          s.unknown("News: 0 relevance (default), 1 latest, 2 oldest. Other types: r relevance (default), dd latest."),
          ["r", "dd", "0", "1", "2"],
        ),
        period: s.string(
          "Time window: all, 1h, 1d, 1w, 1m, 3m, 6m, 1y, or fromYYYYMMDDtoYYYYMMDD. News also accepts 2h, 3h, 4h, 5h, and 6h.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Naver Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      news_results: s.nullable(s.array("news results value.", s.looseObject("news results value. item.", {}))),
      video_results: s.nullable(s.array("video results value.", s.looseObject("video results value. item.", {}))),
      images_results: s.nullable(s.array("images results value.", s.looseObject("images results value. item.", {}))),
      ads_results: s.nullable(s.array("ads results value.", s.looseObject("ads results value. item.", {}))),
      post_results: s.nullable(s.array("post results value.", s.looseObject("post results value. item.", {}))),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      booking_results: s.nullable(s.array("booking results value.", s.looseObject("booking results value. item.", {}))),
      dictionary_results: s.nullable(
        s.array("dictionary results value.", s.looseObject("dictionary results value. item.", {})),
      ),
      knowledge_graph: s.nullable(s.looseObject("knowledge graph value.", {})),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      related_results: s.nullable(s.array("related results value.", s.looseObject("related results value. item.", {}))),
      ai_briefing: s.nullable(s.looseObject("ai briefing value.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
