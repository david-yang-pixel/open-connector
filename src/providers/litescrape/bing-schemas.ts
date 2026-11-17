import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const bingTools: DataTool[] = [
  {
    name: "bing_images",
    path: "/api/bing/images",
    description: "Search Bing Images with size, color, date and license filters.",
    input: s.object(
      "Bing Images parameters.",
      {
        q: s.string(
          "Image search query, from 1 through 2,048 characters after trimming. Control characters are rejected.",
          { minLength: 1, maxLength: 2048 },
        ),
        first: s.integer(
          "One-based Bing result offset, from 1 through 10,000.\n\nPrefer litescrape_pagination.next when returned. Bing may reorder or repeat images between requests.",
          { minimum: 1, maximum: 10000 },
        ),
        count: s.integer(
          "Maximum images to return, from 1 through 100. Defaults to 35.\n\nBing may return fewer images. Follow the pagination link to retrieve another batch.",
          { minimum: 1, maximum: 100 },
        ),
        mkt: s.nullable(
          s.string("Optional language-country market, such as en-US. Cannot be combined with cc.", {
            pattern: "^[a-zA-Z]{2}-[a-zA-Z]{2}$",
          }),
        ),
        cc: s.nullable(
          s.string("Optional two-letter country code. Cannot be combined with mkt.", {
            pattern: "^[a-zA-Z]{2}$",
          }),
        ),
        safeSearch: s.withEnum(
          s.unknown(
            "Bing content filter: off, moderate, or strict. Case-insensitive; defaults to moderate.\n\nBing may enforce stricter filtering for some markets.",
          ),
          ["off", "moderate", "strict"],
        ),
        imagesize: s.nullable(
          s.withEnum(s.unknown("Bing image size bucket: small, medium, large or wallpaper (extra large)."), [
            "small",
            "medium",
            "large",
            "wallpaper",
          ]),
        ),
        photo: s.nullable(
          s.withEnum(
            s.unknown("Photographs, clipart, line drawings, animated GIFs or images with transparent backgrounds."),
            ["photo", "clipart", "linedrawing", "animatedgif", "transparent"],
          ),
        ),
        aspect: s.nullable(s.withEnum(s.unknown("Filter to square, wide or tall images."), ["square", "wide", "tall"])),
        color2: s.nullable(
          s.withEnum(
            s.unknown(
              "Use color for any color, bw for black and white, or a dominant color: FGcls_RED, FGcls_ORANGE, FGcls_YELLOW, FGcls_GREEN, FGcls_TEAL, FGcls_BLUE, FGcls_PURPLE, FGcls_PINK, FGcls_BROWN, FGcls_BLACK, FGcls_GRAY or FGcls_WHITE.",
            ),
            [
              "color",
              "bw",
              "FGcls_RED",
              "FGcls_ORANGE",
              "FGcls_YELLOW",
              "FGcls_GREEN",
              "FGcls_TEAL",
              "FGcls_BLUE",
              "FGcls_PURPLE",
              "FGcls_PINK",
              "FGcls_BROWN",
              "FGcls_BLACK",
              "FGcls_GRAY",
              "FGcls_WHITE",
            ],
          ),
        ),
        face: s.nullable(
          s.withEnum(s.unknown("Use face for just faces or portrait for head-and-shoulders images."), [
            "face",
            "portrait",
          ]),
        ),
        age: s.nullable(
          s.withEnum(
            s.unknown(
              "Bing date filter: lt1440 (past 24 hours), lt10080 (past week), lt43200 (past month) or lt525600 (past year).",
            ),
            ["lt1440", "lt10080", "lt43200", "lt525600"],
          ),
        ),
        license: s.nullable(
          s.withEnum(
            s.unknown(
              "Use creativecommons for all Creative Commons results, L1 for public domain, or native license categories L2 through L7. Bing also supports grouped categories.\n\nL2_L3_L4_L5_L6_L7: free to share and use. L2_L3_L4: free to share and use commercially. L2_L3_L5_L6: free to modify, share and use. L2_L3: free to modify, share and use commercially. Bing classifies usage rights; confirm the license on the source page before reusing an image.",
            ),
            [
              "L1",
              "L2",
              "L3",
              "L4",
              "L5",
              "L6",
              "L7",
              "L2_L3",
              "L2_L3_L4",
              "L2_L3_L5_L6",
              "L2_L3_L4_L5_L6_L7",
              "creativecommons",
            ],
          ),
        ),
        qft: s.nullable(
          s.string(
            "Optional native Bing Images qft filter expression, up to 2,048 characters without control characters.\n\nNamed image filters override the same category in qft and preserve unrelated categories. Without named filters, qft is passed through unchanged. Filter matching and availability are controlled by Bing.",
            { maxLength: 2048 },
          ),
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Bing Images asynchronous parameters.",
      {
        q: s.string(
          "Image search query, from 1 through 2,048 characters after trimming. Control characters are rejected.",
          { minLength: 1, maxLength: 2048 },
        ),
        first: s.integer(
          "One-based Bing result offset, from 1 through 10,000.\n\nPrefer litescrape_pagination.next when returned. Bing may reorder or repeat images between requests.",
          { minimum: 1, maximum: 10000 },
        ),
        count: s.integer(
          "Maximum images to return, from 1 through 100. Defaults to 35.\n\nBing may return fewer images. Follow the pagination link to retrieve another batch.",
          { minimum: 1, maximum: 100 },
        ),
        mkt: s.string("Optional language-country market, such as en-US. Cannot be combined with cc.", {
          pattern: "^[a-zA-Z]{2}-[a-zA-Z]{2}$",
        }),
        cc: s.string("Optional two-letter country code. Cannot be combined with mkt.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        safeSearch: s.withEnum(
          s.unknown(
            "Bing content filter: off, moderate, or strict. Case-insensitive; defaults to moderate.\n\nBing may enforce stricter filtering for some markets.",
          ),
          ["off", "moderate", "strict"],
        ),
        imagesize: s.withEnum(s.unknown("Bing image size bucket: small, medium, large or wallpaper (extra large)."), [
          "small",
          "medium",
          "large",
          "wallpaper",
        ]),
        photo: s.withEnum(
          s.unknown("Photographs, clipart, line drawings, animated GIFs or images with transparent backgrounds."),
          ["photo", "clipart", "linedrawing", "animatedgif", "transparent"],
        ),
        aspect: s.withEnum(s.unknown("Filter to square, wide or tall images."), ["square", "wide", "tall"]),
        color2: s.withEnum(
          s.unknown(
            "Use color for any color, bw for black and white, or a dominant color: FGcls_RED, FGcls_ORANGE, FGcls_YELLOW, FGcls_GREEN, FGcls_TEAL, FGcls_BLUE, FGcls_PURPLE, FGcls_PINK, FGcls_BROWN, FGcls_BLACK, FGcls_GRAY or FGcls_WHITE.",
          ),
          [
            "color",
            "bw",
            "FGcls_RED",
            "FGcls_ORANGE",
            "FGcls_YELLOW",
            "FGcls_GREEN",
            "FGcls_TEAL",
            "FGcls_BLUE",
            "FGcls_PURPLE",
            "FGcls_PINK",
            "FGcls_BROWN",
            "FGcls_BLACK",
            "FGcls_GRAY",
            "FGcls_WHITE",
          ],
        ),
        face: s.withEnum(s.unknown("Use face for just faces or portrait for head-and-shoulders images."), [
          "face",
          "portrait",
        ]),
        age: s.withEnum(
          s.unknown(
            "Bing date filter: lt1440 (past 24 hours), lt10080 (past week), lt43200 (past month) or lt525600 (past year).",
          ),
          ["lt1440", "lt10080", "lt43200", "lt525600"],
        ),
        license: s.withEnum(
          s.unknown(
            "Use creativecommons for all Creative Commons results, L1 for public domain, or native license categories L2 through L7. Bing also supports grouped categories.\n\nL2_L3_L4_L5_L6_L7: free to share and use. L2_L3_L4: free to share and use commercially. L2_L3_L5_L6: free to modify, share and use. L2_L3: free to modify, share and use commercially. Bing classifies usage rights; confirm the license on the source page before reusing an image.",
          ),
          [
            "L1",
            "L2",
            "L3",
            "L4",
            "L5",
            "L6",
            "L7",
            "L2_L3",
            "L2_L3_L4",
            "L2_L3_L5_L6",
            "L2_L3_L4_L5_L6_L7",
            "creativecommons",
          ],
        ),
        qft: s.string(
          "Optional native Bing Images qft filter expression, up to 2,048 characters without control characters.\n\nNamed image filters override the same category in qft and preserve unrelated categories. Without named filters, qft is passed through unchanged. Filter matching and availability are controlled by Bing.",
          { maxLength: 2048 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Bing Images response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      images_results: s.array("images results value.", s.looseObject("images results value. item.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "bing_maps",
    path: "/api/bing/maps",
    description: "Search Bing Maps places, or get one place by ID.",
    input: s.object(
      "Bing Maps parameters.",
      {
        q: s.nullable(s.string("Search query; required unless place_id is supplied.")),
        place_id: s.nullable(s.string("Native Bing Maps entity identifier for a detail lookup.")),
        cp: s.nullable(s.string("Optional map center in latitude~longitude form.")),
        setlang: s.nullable(s.string("Bing Maps interface language, such as en-US.")),
        first: s.integer("Listing offset from 0 through 10,000."),
        count: s.integer("Number of listings from 1 through 30."),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Bing Maps asynchronous parameters.",
      {
        q: s.string("Search query; required unless place_id is supplied."),
        place_id: s.string("Native Bing Maps entity identifier for a detail lookup."),
        cp: s.string("Optional map center in latitude~longitude form."),
        setlang: s.string("Bing Maps interface language, such as en-US."),
        first: s.integer("Listing offset from 0 through 10,000."),
        count: s.integer("Number of listings from 1 through 30."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Bing Maps response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      local_results: s.nullable(s.array("local results value.", s.looseObject("local results value. item.", {}))),
      place_results: s.nullable(s.looseObject("place results value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "bing_product",
    path: "/api/bing/product",
    description: "Get a Bing Shopping product's details using its product token.",
    input: s.object(
      "Bing Product parameters.",
      {
        product_token: s.string(
          "Product token returned in shopping_results by the Bing Shopping API. Copy the complete token into this request; tokens from other providers are not interchangeable.",
          { minLength: 1, maxLength: 24000 },
        ),
      },
      { required: ["product_token"] },
    ),
    asyncInput: s.object(
      "Bing Product asynchronous parameters.",
      {
        product_token: s.string(
          "Product token returned in shopping_results by the Bing Shopping API. Copy the complete token into this request; tokens from other providers are not interchangeable.",
          { minLength: 1, maxLength: 24000 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_token"] },
    ),
    output: s.looseObject("Bing Product response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      product_results: s.looseObject("product results value.", {}),
      buying_options: s.nullable(s.array("buying options value.", s.looseObject("buying options value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "bing_search",
    path: "/api/bing/search",
    description: "Get Bing web search results.",
    input: s.object(
      "Bing Search parameters.",
      {
        q: s.string(
          "Bing search query after trimming.\n\nAccepted length: 1 through 2,048 characters. Control characters are rejected. Bing query syntax such as quoted phrases and exclusions remains available.",
        ),
        engine: s.literal("bing", {
          description: "Selects the Bing web-search engine.",
        }),
        location: s.nullable(
          s.string(
            "Named city-level origin used to localize the Bing request.\n\nMaximum length: 256 characters. Control characters are rejected.",
          ),
        ),
        lat: s.nullable(s.number("Latitude from -90 through 90.\n\nMay be supplied independently or with lon.")),
        lon: s.nullable(s.number("Longitude from -180 through 180.\n\nMay be supplied independently or with lat.")),
        mkt: s.nullable(
          s.string(
            "Case-insensitive Bing language-country market token.\n\nFormat: two-letter language and country, such as en-US. Cannot be combined with cc.",
          ),
        ),
        cc: s.nullable(
          s.string("Case-insensitive two-letter country of origin.\n\nFormat: US or GB. Cannot be combined with mkt."),
        ),
        first: s.integer(
          "One-based native offset for organic results.\n\nRange: 1 through 9,007,199,254,740,991. Prefer litescrape_pagination.next when it is returned.",
        ),
        safeSearch: s.withEnum(s.unknown("Bing adult-content policy; values are case-insensitive."), [
          "off",
          "moderate",
          "strict",
        ]),
        filters: s.nullable(
          s.string(
            "Native Bing display or date filter expression.\n\nMaximum length: 8,192 characters. Control characters are rejected.",
          ),
        ),
        device: s.withEnum(s.unknown("Selects desktop, tablet, or mobile result behavior."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Bing Search asynchronous parameters.",
      {
        q: s.string(
          "Bing search query after trimming.\n\nAccepted length: 1 through 2,048 characters. Control characters are rejected. Bing query syntax such as quoted phrases and exclusions remains available.",
        ),
        engine: s.literal("bing", {
          description: "Selects the Bing web-search engine.",
        }),
        location: s.string(
          "Named city-level origin used to localize the Bing request.\n\nMaximum length: 256 characters. Control characters are rejected.",
        ),
        lat: s.number("Latitude from -90 through 90.\n\nMay be supplied independently or with lon."),
        lon: s.number("Longitude from -180 through 180.\n\nMay be supplied independently or with lat."),
        mkt: s.string(
          "Case-insensitive Bing language-country market token.\n\nFormat: two-letter language and country, such as en-US. Cannot be combined with cc.",
        ),
        cc: s.string(
          "Case-insensitive two-letter country of origin.\n\nFormat: US or GB. Cannot be combined with mkt.",
        ),
        first: s.integer(
          "One-based native offset for organic results.\n\nRange: 1 through 9,007,199,254,740,991. Prefer litescrape_pagination.next when it is returned.",
        ),
        safeSearch: s.withEnum(s.unknown("Bing adult-content policy; values are case-insensitive."), [
          "off",
          "moderate",
          "strict",
        ]),
        filters: s.string(
          "Native Bing display or date filter expression.\n\nMaximum length: 8,192 characters. Control characters are rejected.",
        ),
        device: s.withEnum(s.unknown("Selects desktop, tablet, or mobile result behavior."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Bing Search response.", {
      ads: s.nullable(s.array("ads value.", s.looseObject("ads value. item.", {}))),
      inline_videos: s.nullable(s.looseObject("inline videos value.", {})),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      knowledge_graph: s.nullable(s.looseObject("knowledge graph value.", {})),
      knowledge_graph_list: s.nullable(
        s.array("knowledge graph list value.", s.looseObject("knowledge graph list value. item.", {})),
      ),
      answer_box: s.nullable(s.looseObject("answer box value.", {})),
      answer_box_list: s.nullable(s.array("answer box list value.", s.looseObject("answer box list value. item.", {}))),
      carousel_results: s.nullable(s.looseObject("carousel results value.", {})),
      copilot_answer: s.nullable(s.looseObject("copilot answer value.", {})),
      coupons_results: s.nullable(s.looseObject("coupons results value.", {})),
      events_results: s.nullable(s.looseObject("events results value.", {})),
      inline_images: s.nullable(s.looseObject("inline images value.", {})),
      inline_shopping_results: s.nullable(
        s.array("inline shopping results value.", s.looseObject("inline shopping results value. item.", {})),
      ),
      local_map: s.nullable(s.looseObject("local map value.", {})),
      local_results: s.nullable(s.looseObject("local results value.", {})),
      recipes_results: s.nullable(s.looseObject("recipes results value.", {})),
      related_questions: s.nullable(
        s.array("related questions value.", s.looseObject("related questions value. item.", {})),
      ),
      short_videos: s.nullable(s.array("short videos value.", s.looseObject("short videos value. item.", {}))),
      top_shopping_results: s.nullable(s.looseObject("top shopping results value.", {})),
      top_stories: s.nullable(s.looseObject("top stories value.", {})),
      top_stories_link: s.nullable(s.string("top stories link value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "bing_shopping",
    path: "/api/bing/shopping",
    description: "Search Bing Shopping products.",
    input: s.object(
      "Bing Shopping parameters.",
      {
        q: s.string("Product search query, up to 2,048 characters with no control characters.", {
          minLength: 1,
          maxLength: 2048,
        }),
        mkt: s.nullable(
          s.string("Case-insensitive language-country market code, such as en-US. Supply either mkt or cc.", {
            pattern: "^[A-Za-z]{2}-[A-Za-z]{2}$",
          }),
        ),
        cc: s.nullable(
          s.string("Two-letter country code, such as us or gb. Supply either cc or mkt.", {
            pattern: "^[A-Za-z]{2}$",
          }),
        ),
        efirst: s.nullable(
          s.integer("Nonnegative shopping result offset. For example, efirst=10 starts at the tenth shopping result.", {
            minimum: 0,
            maximum: 9007199254740991,
          }),
        ),
        filters: s.nullable(
          s.string("Bing Shopping filter expression, up to 6,000 characters. Copy filters from a Bing Shopping URL.", {
            maxLength: 6000,
          }),
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Bing Shopping asynchronous parameters.",
      {
        q: s.string("Product search query, up to 2,048 characters with no control characters.", {
          minLength: 1,
          maxLength: 2048,
        }),
        mkt: s.string("Case-insensitive language-country market code, such as en-US. Supply either mkt or cc.", {
          pattern: "^[A-Za-z]{2}-[A-Za-z]{2}$",
        }),
        cc: s.string("Two-letter country code, such as us or gb. Supply either cc or mkt.", {
          pattern: "^[A-Za-z]{2}$",
        }),
        efirst: s.integer(
          "Nonnegative shopping result offset. For example, efirst=10 starts at the tenth shopping result.",
          { minimum: 0, maximum: 9007199254740991 },
        ),
        filters: s.string(
          "Bing Shopping filter expression, up to 6,000 characters. Copy filters from a Bing Shopping URL.",
          { maxLength: 6000 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Bing Shopping response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      shopping_results: s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
