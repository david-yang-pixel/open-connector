import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const yahooTools: DataTool[] = [
  {
    name: "yahoo_images",
    path: "/api/yahoo/images",
    description: "Search Yahoo Images.",
    input: s.object(
      "Yahoo Images parameters.",
      {
        p: s.string("Text or search operators to send to Yahoo.", {
          minLength: 1,
          maxLength: 2000,
        }),
        yahoo_domain: s.string(
          "Yahoo regional search host, for example fr.search.yahoo.com. A regional prefix such as fr is also accepted.",
        ),
        b: s.integer("One-based starting result. Web pages usually advance by 10; image pages usually advance by 60.", {
          minimum: 1,
          maximum: 10001,
        }),
        device: s.withEnum(s.unknown("Device profile used for the Yahoo result page."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        imgsz: s.nullable(
          s.withEnum(s.unknown("Image size category; wallpaper selects extra-large images."), [
            "small",
            "medium",
            "large",
            "wallpaper",
          ]),
        ),
        imgc: s.nullable(
          s.withEnum(s.unknown("Select color images, monochrome images (bw), or a dominant color."), [
            "color",
            "bw",
            "red",
            "orange",
            "yellow",
            "green",
            "teal",
            "blue",
            "purple",
            "pink",
            "brown",
            "black",
            "gray",
            "white",
          ]),
        ),
        imgty: s.nullable(
          s.withEnum(s.unknown("Image style or format to include."), [
            "photo",
            "clipart",
            "linedrawing",
            "gif",
            "transparent",
          ]),
        ),
        imga: s.nullable(
          s.withEnum(s.unknown("Image shape: square, landscape (wide), or portrait (tall)."), [
            "square",
            "wide",
            "tall",
          ]),
        ),
        imgf: s.nullable(
          s.withEnum(s.unknown("People filter: faces, head-and-shoulders portraits, or images without people."), [
            "face",
            "portrait",
            "nonportrait",
          ]),
        ),
        imgt: s.nullable(
          s.withEnum(s.unknown("Limit images to a recent day, week, month, or year."), [
            "day",
            "week",
            "month",
            "year",
          ]),
        ),
        imgl: s.nullable(
          s.withEnum(
            s.unknown(
              "Usage-rights category: Creative Commons (cc), public domain (pd), sharing (fsu), commercial sharing (fsuc), modification (fmsu), or commercial modification (fmsuc).",
            ),
            ["cc", "pd", "fsu", "fsuc", "fmsu", "fmsuc"],
          ),
        ),
      },
      { required: ["p"] },
    ),
    asyncInput: s.object(
      "Yahoo Images asynchronous parameters.",
      {
        p: s.string("Text or search operators to send to Yahoo.", {
          minLength: 1,
          maxLength: 2000,
        }),
        yahoo_domain: s.string(
          "Yahoo regional search host, for example fr.search.yahoo.com. A regional prefix such as fr is also accepted.",
        ),
        b: s.integer("One-based starting result. Web pages usually advance by 10; image pages usually advance by 60.", {
          minimum: 1,
          maximum: 10001,
        }),
        device: s.withEnum(s.unknown("Device profile used for the Yahoo result page."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        imgsz: s.withEnum(s.unknown("Image size category; wallpaper selects extra-large images."), [
          "small",
          "medium",
          "large",
          "wallpaper",
        ]),
        imgc: s.withEnum(s.unknown("Select color images, monochrome images (bw), or a dominant color."), [
          "color",
          "bw",
          "red",
          "orange",
          "yellow",
          "green",
          "teal",
          "blue",
          "purple",
          "pink",
          "brown",
          "black",
          "gray",
          "white",
        ]),
        imgty: s.withEnum(s.unknown("Image style or format to include."), [
          "photo",
          "clipart",
          "linedrawing",
          "gif",
          "transparent",
        ]),
        imga: s.withEnum(s.unknown("Image shape: square, landscape (wide), or portrait (tall)."), [
          "square",
          "wide",
          "tall",
        ]),
        imgf: s.withEnum(s.unknown("People filter: faces, head-and-shoulders portraits, or images without people."), [
          "face",
          "portrait",
          "nonportrait",
        ]),
        imgt: s.withEnum(s.unknown("Limit images to a recent day, week, month, or year."), [
          "day",
          "week",
          "month",
          "year",
        ]),
        imgl: s.withEnum(
          s.unknown(
            "Usage-rights category: Creative Commons (cc), public domain (pd), sharing (fsu), commercial sharing (fsuc), modification (fmsu), or commercial modification (fmsuc).",
          ),
          ["cc", "pd", "fsu", "fsuc", "fmsu", "fmsuc"],
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["p"] },
    ),
    output: s.looseObject("Yahoo Images response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      images_results: s.array("images results value.", s.looseObject("images results value. item.", {})),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "yahoo_search",
    path: "/api/yahoo/search",
    description: "Get Yahoo web search results.",
    input: s.object(
      "Yahoo Search parameters.",
      {
        p: s.string("Text or search operators to send to Yahoo.", {
          minLength: 1,
          maxLength: 2000,
        }),
        yahoo_domain: s.string(
          "Yahoo regional search host, for example fr.search.yahoo.com. A regional prefix such as fr is also accepted.",
        ),
        b: s.integer("One-based starting result. Web pages usually advance by 10; image pages usually advance by 60.", {
          minimum: 1,
          maximum: 10001,
        }),
        device: s.withEnum(s.unknown("Device profile used for the Yahoo result page."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        vc: s.nullable(
          s.string("Country code for regional results, such as us or uk.", {
            pattern: "^[a-z]{2}$",
          }),
        ),
        vl: s.nullable(
          s.string(
            "Restrict matches to a language, such as lang_fr, lang_zh_chs, or lang_zh_cht. Enables Yahoo's language filter.",
            { pattern: "^lang_(?:[a-z]{2}|zh_chs|zh_cht)$" },
          ),
        ),
        vm: s.nullable(
          s.withEnum(s.unknown("Adult-content filtering: r for strict, i for moderate, p for unfiltered."), [
            "r",
            "i",
            "p",
          ]),
        ),
        vs: s.nullable(
          s.string("Comma-separated domain suffixes to search, such as .com,.org.", {
            maxLength: 500,
          }),
        ),
        vf: s.nullable(
          s.string("Document format to match, such as pdf, txt, or all formats.", {
            maxLength: 80,
          }),
        ),
        fr2: s.nullable(
          s.string("Yahoo display token controlling result module placement and expansion.", {
            maxLength: 1000,
          }),
        ),
        d: s.nullable(
          s.string("Yahoo related-topic destination token, passed through as a string.", {
            maxLength: 4096,
          }),
        ),
      },
      { required: ["p"] },
    ),
    asyncInput: s.object(
      "Yahoo Search asynchronous parameters.",
      {
        p: s.string("Text or search operators to send to Yahoo.", {
          minLength: 1,
          maxLength: 2000,
        }),
        yahoo_domain: s.string(
          "Yahoo regional search host, for example fr.search.yahoo.com. A regional prefix such as fr is also accepted.",
        ),
        b: s.integer("One-based starting result. Web pages usually advance by 10; image pages usually advance by 60.", {
          minimum: 1,
          maximum: 10001,
        }),
        device: s.withEnum(s.unknown("Device profile used for the Yahoo result page."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        vc: s.string("Country code for regional results, such as us or uk.", {
          pattern: "^[a-z]{2}$",
        }),
        vl: s.string(
          "Restrict matches to a language, such as lang_fr, lang_zh_chs, or lang_zh_cht. Enables Yahoo's language filter.",
          { pattern: "^lang_(?:[a-z]{2}|zh_chs|zh_cht)$" },
        ),
        vm: s.withEnum(s.unknown("Adult-content filtering: r for strict, i for moderate, p for unfiltered."), [
          "r",
          "i",
          "p",
        ]),
        vs: s.string("Comma-separated domain suffixes to search, such as .com,.org.", {
          maxLength: 500,
        }),
        vf: s.string("Document format to match, such as pdf, txt, or all formats.", {
          maxLength: 80,
        }),
        fr2: s.string("Yahoo display token controlling result module placement and expansion.", {
          maxLength: 1000,
        }),
        d: s.string("Yahoo related-topic destination token, passed through as a string.", {
          maxLength: 4096,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["p"] },
    ),
    output: s.looseObject("Yahoo Search response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      organic_results: s.array("organic results value.", s.looseObject("organic results value. item.", {})),
      ads_results: s.nullable(s.array("ads results value.", s.looseObject("ads results value. item.", {}))),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
