import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const googleTools: DataTool[] = [
  {
    name: "google_ads",
    path: "/api/google/ads",
    description: "Get the ads shown on a Google search results page. This upstream API is Alpha.",
    input: s.object(
      "Google Ads parameters.",
      {
        q: s.string("Google Ads search query, up to 2,048 characters with no controls."),
        location: s.string(
          "Human-readable location where the ad search originates, up to 63 UTF-8 bytes once Google-encoded.\n\nExample: Austin, Texas, United States.",
        ),
        hl: s.string("Google interface and result language, such as en, en-GB, or de."),
        safe: s.nullable(s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"])),
        nfpr: s.nullable(
          s.withEnum(s.unknown("Google spelling auto-correction control. Set 1 to exclude corrected queries."), [
            "0",
            "1",
          ]),
        ),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
      },
      { required: ["q", "location"] },
    ),
    asyncInput: s.object(
      "Google Ads asynchronous parameters.",
      {
        q: s.string("Google Ads search query, up to 2,048 characters with no controls."),
        location: s.string(
          "Human-readable location where the ad search originates, up to 63 UTF-8 bytes once Google-encoded.\n\nExample: Austin, Texas, United States.",
        ),
        hl: s.string("Google interface and result language, such as en, en-GB, or de."),
        safe: s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"]),
        nfpr: s.withEnum(s.unknown("Google spelling auto-correction control. Set 1 to exclude corrected queries."), [
          "0",
          "1",
        ]),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q", "location"] },
    ),
    output: s.looseObject("Google Ads response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      dmca_messages: s.nullable(s.looseObject("dmca messages value.", {})),
      find_results_on: s.nullable(s.array("find results on value.", s.looseObject("find results on value. item.", {}))),
      latest_posts: s.nullable(s.array("latest posts value.", s.looseObject("latest posts value. item.", {}))),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      ads: s.nullable(s.array("ads value.", s.looseObject("ads value. item.", {}))),
      ai_overview: s.nullable(s.looseObject("ai overview value.", {})),
      answer_box: s.nullable(s.looseObject("answer box value.", {})),
      knowledge_graph: s.nullable(s.looseObject("knowledge graph value.", {})),
      local_map: s.nullable(s.looseObject("local map value.", {})),
      local_results: s.nullable(s.looseObject("local results value.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      related_questions: s.nullable(
        s.array("related questions value.", s.looseObject("related questions value. item.", {})),
      ),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      ask_ai_mode: s.nullable(s.array("ask ai mode value.", s.looseObject("ask ai mode value. item.", {}))),
      available_on: s.nullable(s.array("available on value.", s.looseObject("available on value. item.", {}))),
      broaden_searches: s.nullable(
        s.array("broaden searches value.", s.looseObject("broaden searches value. item.", {})),
      ),
      complementary_results: s.nullable(
        s.array("complementary results value.", s.looseObject("complementary results value. item.", {})),
      ),
      discover_more_places: s.nullable(
        s.array("discover more places value.", s.looseObject("discover more places value. item.", {})),
      ),
      discussions_and_forums: s.nullable(
        s.array("discussions and forums value.", s.looseObject("discussions and forums value. item.", {})),
      ),
      episode_guide: s.nullable(s.array("episode guide value.", s.looseObject("episode guide value. item.", {}))),
      events_results: s.nullable(s.array("events results value.", s.looseObject("events results value. item.", {}))),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      flight_result: s.nullable(s.looseObject("flight result value.", {})),
      immersive_products: s.nullable(
        s.array("immersive products value.", s.looseObject("immersive products value. item.", {})),
      ),
      inline_images: s.nullable(s.array("inline images value.", s.looseObject("inline images value. item.", {}))),
      inline_videos: s.nullable(s.array("inline videos value.", s.looseObject("inline videos value. item.", {}))),
      jobs_results: s.nullable(s.looseObject("jobs results value.", {})),
      news_results: s.nullable(s.array("news results value.", s.looseObject("news results value. item.", {}))),
      perspectives: s.nullable(s.array("perspectives value.", s.looseObject("perspectives value. item.", {}))),
      places_sites: s.nullable(s.array("places sites value.", s.looseObject("places sites value. item.", {}))),
      recipes_results: s.nullable(s.array("recipes results value.", s.looseObject("recipes results value. item.", {}))),
      refine_by: s.nullable(s.array("refine by value.", s.looseObject("refine by value. item.", {}))),
      related_brands: s.nullable(s.array("related brands value.", s.looseObject("related brands value. item.", {}))),
      related_categories: s.nullable(
        s.array("related categories value.", s.looseObject("related categories value. item.", {})),
      ),
      scholarly_articles: s.nullable(s.looseObject("scholarly articles value.", {})),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      categorized_shopping_results: s.nullable(
        s.array("categorized shopping results value.", s.looseObject("categorized shopping results value. item.", {})),
      ),
      short_videos: s.nullable(s.array("short videos value.", s.looseObject("short videos value. item.", {}))),
      sports_results: s.nullable(s.looseObject("sports results value.", {})),
      top_sights: s.nullable(s.looseObject("top sights value.", {})),
      top_stories: s.anyOf("top stories value.", [
        s.array("top stories value.", s.looseObject("top stories value. item.", {})),
        s.looseObject("top stories value.", {}),
        s.literal(null, {
          description: "top stories value.",
        }),
      ]),
      video_results: s.nullable(s.array("video results value.", s.looseObject("video results value. item.", {}))),
      finance_results: s.nullable(s.looseObject("finance results value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_ai_mode",
    path: "/api/google/ai-mode",
    description: "Get Google AI Mode answers with cited sources.",
    input: s.object(
      "Google AI Mode parameters.",
      {
        q: s.string("The question to ask Google AI Mode, up to 2,048 characters with no controls."),
        location: s.nullable(
          s.string(
            "Named search origin, up to 512 characters and 63 UTF-8 bytes once Google-encoded. Conflicts with uule.",
          ),
        ),
        uule: s.nullable(s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location.")),
        google_domain: s.string("Validated first-party Google domain the request is served from."),
        gl: s.nullable(s.string("Two-letter country localization, normalized to lowercase.")),
        hl: s.string("Language code such as en, en-GB, or de."),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        continuable: s.boolean("Return a subsequent_request_token so this answer can be followed up."),
        subsequent_request_token: s.nullable(
          s.string(
            "Continue a conversation from a previous continuable response. Requires a new question, and cannot be combined with image_url. Expires after 30 minutes.",
          ),
        ),
        image_url: s.nullable(
          s.string(
            "Public http or https image to include in the prompt, up to 2,048 characters and 20 MB. Google Lens receives the image; the answer still comes from AI Mode.",
          ),
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Google AI Mode asynchronous parameters.",
      {
        q: s.string("The question to ask Google AI Mode, up to 2,048 characters with no controls."),
        location: s.string(
          "Named search origin, up to 512 characters and 63 UTF-8 bytes once Google-encoded. Conflicts with uule.",
        ),
        uule: s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location."),
        google_domain: s.string("Validated first-party Google domain the request is served from."),
        gl: s.string("Two-letter country localization, normalized to lowercase."),
        hl: s.string("Language code such as en, en-GB, or de."),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        continuable: s.boolean("Return a subsequent_request_token so this answer can be followed up."),
        subsequent_request_token: s.string(
          "Continue a conversation from a previous continuable response. Requires a new question, and cannot be combined with image_url. Expires after 30 minutes.",
        ),
        image_url: s.string(
          "Public http or https image to include in the prompt, up to 2,048 characters and 20 MB. Google Lens receives the image; the answer still comes from AI Mode.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Google AI Mode response.", {
      references: s.nullable(s.array("references value.", s.looseObject("references value. item.", {}))),
      text_blocks: s.nullable(s.array("text blocks value.", s.looseObject("text blocks value. item.", {}))),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      subsequent_request_token: s.nullable(s.string("subsequent request token value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_ai_overview",
    path: "/api/google/ai-overview",
    description: "Get Google's AI Overview for a query, with cited sources.",
    input: s.object(
      "Google AI Overview parameters.",
      {
        q: s.nullable(
          s.string("Google Search query, up to 2,048 characters.\n\nRequired unless ludocid or kgmid is supplied.", {
            maxLength: 2048,
          }),
        ),
        location: s.nullable(
          s.string(
            "Human-readable city-level location encoded to UULE by Litescrape.\n\nConflicts with uule and lat/lon.",
            { maxLength: 512 },
          ),
        ),
        uule: s.nullable(
          s.string("Pre-encoded Google location value.\n\nConflicts with location and lat/lon.", {
            maxLength: 2048,
          }),
        ),
        lat: s.nullable(
          s.number("Latitude from -90 through 90.\n\nRequires lon and conflicts with location and uule.", {
            minimum: -90,
            maximum: 90,
          }),
        ),
        lon: s.nullable(
          s.number("Longitude from -180 through 180.\n\nRequires lat and conflicts with location and uule.", {
            minimum: -180,
            maximum: 180,
          }),
        ),
        radius: s.nullable(
          s.number(
            "Decimal search-bias radius in meters.\n\nRequires location or lat/lon. Desktop: 1–199; tablet/mobile: 1–1,000.",
            { minimum: 1, maximum: 1000 },
          ),
        ),
        ludocid: s.nullable(
          s.string("Google local CID used to search for one entity.", {
            maxLength: 128,
            pattern: "^\\d+$",
          }),
        ),
        lsig: s.nullable(s.string("Opaque Knowledge Graph or local-pack signature.", { maxLength: 4096 })),
        kgmid: s.nullable(s.string("Google Knowledge Graph machine ID, such as /m/0k8z.", { maxLength: 512 })),
        si: s.nullable(s.string("Opaque cached Google search context.", { maxLength: 4096 })),
        ibp: s.nullable(s.string("Google layout or expansion control.", { maxLength: 4096 })),
        uds: s.nullable(s.string("Opaque Google filter token.", { maxLength: 4096 })),
        color_scheme: s.nullable(s.withEnum(s.unknown("Google result color presentation."), ["light", "dark"])),
        google_domain: s.string("Results use google.com. Use gl, hl, cr, lr or geography for localization."),
        gl: s.nullable(s.string("Lowercase two-letter country localization code.", { pattern: "^[a-z]{2}$" })),
        hl: s.string("Google interface and result language code.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        cr: s.nullable(
          s.string("One or more countryXX restrictions joined with |.", {
            pattern: "^country[A-Z]{2}(?:\\|country[A-Z]{2})*$",
          }),
        ),
        lr: s.nullable(
          s.string("One or more lang_xx restrictions joined with |.", {
            pattern: "^lang_[a-z]{2,3}(?:\\|lang_[a-z]{2,3})*$",
          }),
        ),
        tbs: s.nullable(s.string("Google native date or search filter string.", { maxLength: 4096 })),
        safe: s.nullable(s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"])),
        nfpr: s.nullable(s.withEnum(s.unknown("Google auto-correction control."), ["0", "1"])),
        filter: s.nullable(s.withEnum(s.unknown("Google similar-result filtering control."), ["0", "1"])),
        pws: s.nullable(
          s.withEnum(s.unknown("Google personalization control; 0 asks for non-personalized results."), ["0", "1"]),
        ),
        peek_pws: s.nullable(
          s.withEnum(s.unknown("Google personalization peek flag, forwarded unchanged."), ["0", "1"]),
        ),
        tbm: s.nullable(
          s.withEnum(
            s.unknown("Google vertical: lcl, vid, nws, shop, or pts. For image searches, use /api/google/images."),
            ["lcl", "vid", "nws", "shop", "pts"],
          ),
        ),
        start: s.integer("Non-negative Google result offset.", { minimum: 0 }),
        num: s.nullable(s.integer("Best-effort first-page result count, 1 to 10.", { minimum: 1, maximum: 10 })),
        device: s.withEnum(s.unknown("Request device profile and radius bound."), ["desktop", "tablet", "mobile"]),
        oq: s.nullable(
          s.string("Original query associated with an autocomplete selection.", {
            maxLength: 2048,
          }),
        ),
        gs_lp: s.nullable(
          s.string("Google gs_lp value associated with an autocomplete selection.", {
            maxLength: 4096,
          }),
        ),
        sclient: s.nullable(
          s.string("Google client identifier such as gws-wiz-serp.", {
            maxLength: 64,
            pattern: "^[A-Za-z0-9._-]+$",
          }),
        ),
        as_dt: s.nullable(
          s.withEnum(s.unknown("Includes or excludes as_sitesearch.\n\nRequires as_sitesearch."), ["i", "e"]),
        ),
        as_epq: s.nullable(s.string("Exact phrase query.", { maxLength: 2048 })),
        as_eq: s.nullable(s.string("Excluded phrase query.", { maxLength: 2048 })),
        as_lq: s.nullable(s.string("Require results that link to this URL.", { maxLength: 4096 })),
        as_nlo: s.nullable(s.integer("Inclusive range lower bound.\n\nRequires as_nhi.", { minimum: 0 })),
        as_nhi: s.nullable(s.integer("Inclusive range upper bound.\n\nRequires as_nlo.", { minimum: 0 })),
        as_oq: s.nullable(s.string("Any-of search terms.", { maxLength: 2048 })),
        as_q: s.nullable(s.string("Additional all-of search terms.", { maxLength: 2048 })),
        as_qdr: s.nullable(
          s.string("Quick range d, w, m, or y with an optional positive count.", {
            pattern: "^[dwmy](?:[1-9][0-9]*)?$",
          }),
        ),
        as_rq: s.nullable(s.string("Find pages related to this URL.", { maxLength: 4096 })),
        as_sitesearch: s.nullable(s.string("Site hostname to include or exclude.", { maxLength: 253 })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google AI Overview asynchronous parameters.",
      {
        q: s.string("Google Search query, up to 2,048 characters.\n\nRequired unless ludocid or kgmid is supplied.", {
          maxLength: 2048,
        }),
        location: s.string(
          "Human-readable city-level location encoded to UULE by Litescrape.\n\nConflicts with uule and lat/lon.",
          { maxLength: 512 },
        ),
        uule: s.string("Pre-encoded Google location value.\n\nConflicts with location and lat/lon.", {
          maxLength: 2048,
        }),
        lat: s.number("Latitude from -90 through 90.\n\nRequires lon and conflicts with location and uule.", {
          minimum: -90,
          maximum: 90,
        }),
        lon: s.number("Longitude from -180 through 180.\n\nRequires lat and conflicts with location and uule.", {
          minimum: -180,
          maximum: 180,
        }),
        radius: s.number(
          "Decimal search-bias radius in meters.\n\nRequires location or lat/lon. Desktop: 1–199; tablet/mobile: 1–1,000.",
          { minimum: 1, maximum: 1000 },
        ),
        ludocid: s.string("Google local CID used to search for one entity.", {
          maxLength: 128,
          pattern: "^\\d+$",
        }),
        lsig: s.string("Opaque Knowledge Graph or local-pack signature.", { maxLength: 4096 }),
        kgmid: s.string("Google Knowledge Graph machine ID, such as /m/0k8z.", { maxLength: 512 }),
        si: s.string("Opaque cached Google search context.", { maxLength: 4096 }),
        ibp: s.string("Google layout or expansion control.", { maxLength: 4096 }),
        uds: s.string("Opaque Google filter token.", { maxLength: 4096 }),
        color_scheme: s.withEnum(s.unknown("Google result color presentation."), ["light", "dark"]),
        google_domain: s.string("Results use google.com. Use gl, hl, cr, lr or geography for localization."),
        gl: s.string("Lowercase two-letter country localization code.", { pattern: "^[a-z]{2}$" }),
        hl: s.string("Google interface and result language code.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        cr: s.string("One or more countryXX restrictions joined with |.", {
          pattern: "^country[A-Z]{2}(?:\\|country[A-Z]{2})*$",
        }),
        lr: s.string("One or more lang_xx restrictions joined with |.", {
          pattern: "^lang_[a-z]{2,3}(?:\\|lang_[a-z]{2,3})*$",
        }),
        tbs: s.string("Google native date or search filter string.", { maxLength: 4096 }),
        safe: s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"]),
        nfpr: s.withEnum(s.unknown("Google auto-correction control."), ["0", "1"]),
        filter: s.withEnum(s.unknown("Google similar-result filtering control."), ["0", "1"]),
        pws: s.withEnum(s.unknown("Google personalization control; 0 asks for non-personalized results."), ["0", "1"]),
        peek_pws: s.withEnum(s.unknown("Google personalization peek flag, forwarded unchanged."), ["0", "1"]),
        tbm: s.withEnum(
          s.unknown("Google vertical: lcl, vid, nws, shop, or pts. For image searches, use /api/google/images."),
          ["lcl", "vid", "nws", "shop", "pts"],
        ),
        start: s.integer("Non-negative Google result offset.", { minimum: 0 }),
        num: s.integer("Best-effort first-page result count, 1 to 10.", {
          minimum: 1,
          maximum: 10,
        }),
        device: s.withEnum(s.unknown("Request device profile and radius bound."), ["desktop", "tablet", "mobile"]),
        oq: s.string("Original query associated with an autocomplete selection.", {
          maxLength: 2048,
        }),
        gs_lp: s.string("Google gs_lp value associated with an autocomplete selection.", {
          maxLength: 4096,
        }),
        sclient: s.string("Google client identifier such as gws-wiz-serp.", {
          maxLength: 64,
          pattern: "^[A-Za-z0-9._-]+$",
        }),
        as_dt: s.withEnum(s.unknown("Includes or excludes as_sitesearch.\n\nRequires as_sitesearch."), ["i", "e"]),
        as_epq: s.string("Exact phrase query.", { maxLength: 2048 }),
        as_eq: s.string("Excluded phrase query.", { maxLength: 2048 }),
        as_lq: s.string("Require results that link to this URL.", { maxLength: 4096 }),
        as_nlo: s.integer("Inclusive range lower bound.\n\nRequires as_nhi.", { minimum: 0 }),
        as_nhi: s.integer("Inclusive range upper bound.\n\nRequires as_nlo.", { minimum: 0 }),
        as_oq: s.string("Any-of search terms.", { maxLength: 2048 }),
        as_q: s.string("Additional all-of search terms.", { maxLength: 2048 }),
        as_qdr: s.string("Quick range d, w, m, or y with an optional positive count.", {
          pattern: "^[dwmy](?:[1-9][0-9]*)?$",
        }),
        as_rq: s.string("Find pages related to this URL.", { maxLength: 4096 }),
        as_sitesearch: s.string("Site hostname to include or exclude.", { maxLength: 253 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google AI Overview response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      dmca_messages: s.nullable(s.looseObject("dmca messages value.", {})),
      find_results_on: s.nullable(s.array("find results on value.", s.looseObject("find results on value. item.", {}))),
      latest_posts: s.nullable(s.array("latest posts value.", s.looseObject("latest posts value. item.", {}))),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      ads: s.nullable(s.array("ads value.", s.looseObject("ads value. item.", {}))),
      ai_overview: s.nullable(s.looseObject("ai overview value.", {})),
      answer_box: s.nullable(s.looseObject("answer box value.", {})),
      knowledge_graph: s.nullable(s.looseObject("knowledge graph value.", {})),
      local_map: s.nullable(s.looseObject("local map value.", {})),
      local_results: s.nullable(s.looseObject("local results value.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      related_questions: s.nullable(
        s.array("related questions value.", s.looseObject("related questions value. item.", {})),
      ),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      ask_ai_mode: s.nullable(s.array("ask ai mode value.", s.looseObject("ask ai mode value. item.", {}))),
      available_on: s.nullable(s.array("available on value.", s.looseObject("available on value. item.", {}))),
      broaden_searches: s.nullable(
        s.array("broaden searches value.", s.looseObject("broaden searches value. item.", {})),
      ),
      complementary_results: s.nullable(
        s.array("complementary results value.", s.looseObject("complementary results value. item.", {})),
      ),
      discover_more_places: s.nullable(
        s.array("discover more places value.", s.looseObject("discover more places value. item.", {})),
      ),
      discussions_and_forums: s.nullable(
        s.array("discussions and forums value.", s.looseObject("discussions and forums value. item.", {})),
      ),
      episode_guide: s.nullable(s.array("episode guide value.", s.looseObject("episode guide value. item.", {}))),
      events_results: s.nullable(s.array("events results value.", s.looseObject("events results value. item.", {}))),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      flight_result: s.nullable(s.looseObject("flight result value.", {})),
      immersive_products: s.nullable(
        s.array("immersive products value.", s.looseObject("immersive products value. item.", {})),
      ),
      inline_images: s.nullable(s.array("inline images value.", s.looseObject("inline images value. item.", {}))),
      inline_videos: s.nullable(s.array("inline videos value.", s.looseObject("inline videos value. item.", {}))),
      jobs_results: s.nullable(s.looseObject("jobs results value.", {})),
      news_results: s.nullable(s.array("news results value.", s.looseObject("news results value. item.", {}))),
      perspectives: s.nullable(s.array("perspectives value.", s.looseObject("perspectives value. item.", {}))),
      places_sites: s.nullable(s.array("places sites value.", s.looseObject("places sites value. item.", {}))),
      recipes_results: s.nullable(s.array("recipes results value.", s.looseObject("recipes results value. item.", {}))),
      refine_by: s.nullable(s.array("refine by value.", s.looseObject("refine by value. item.", {}))),
      related_brands: s.nullable(s.array("related brands value.", s.looseObject("related brands value. item.", {}))),
      related_categories: s.nullable(
        s.array("related categories value.", s.looseObject("related categories value. item.", {})),
      ),
      scholarly_articles: s.nullable(s.looseObject("scholarly articles value.", {})),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      categorized_shopping_results: s.nullable(
        s.array("categorized shopping results value.", s.looseObject("categorized shopping results value. item.", {})),
      ),
      short_videos: s.nullable(s.array("short videos value.", s.looseObject("short videos value. item.", {}))),
      sports_results: s.nullable(s.looseObject("sports results value.", {})),
      top_sights: s.nullable(s.looseObject("top sights value.", {})),
      top_stories: s.anyOf("top stories value.", [
        s.array("top stories value.", s.looseObject("top stories value. item.", {})),
        s.looseObject("top stories value.", {}),
        s.literal(null, {
          description: "top stories value.",
        }),
      ]),
      video_results: s.nullable(s.array("video results value.", s.looseObject("video results value. item.", {}))),
      finance_results: s.nullable(s.looseObject("finance results value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_contributor_reviews",
    path: "/api/google/contributor-reviews",
    description: "Get reviews written by a Google Maps contributor.",
    input: s.object(
      "Google Contributor Reviews parameters.",
      {
        contributor_id: s.string("Required 10 to 32 digit ID from a Google Maps contributor URL."),
        hl: s.string("Review and interface language such as en, en-US, or fr."),
        gl: s.string("Two-letter country localization."),
        limit: s.integer("Review count from 1 through the anonymous source maximum of 200."),
      },
      { required: ["contributor_id"] },
    ),
    asyncInput: s.object(
      "Google Contributor Reviews asynchronous parameters.",
      {
        contributor_id: s.string("Required 10 to 32 digit ID from a Google Maps contributor URL."),
        hl: s.string("Review and interface language such as en, en-US, or fr."),
        gl: s.string("Two-letter country localization."),
        limit: s.integer("Review count from 1 through the anonymous source maximum of 200."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["contributor_id"] },
    ),
    output: s.looseObject("Google Contributor Reviews response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      contributor: s.nullable(s.looseObject("contributor value.", {})),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_gemini",
    path: "/api/google/gemini",
    description: "Get a completed text reply from Gemini.",
    input: s.object(
      "Gemini Chat parameters.",
      {
        prompt: s.string(
          "Text prompt for a new or continued Gemini conversation, up to 32,000 characters.\n\nText only. Use subsequent_request_token to continue a conversation. Uploads, Google account cookies and model selection are not accepted.",
          { minLength: 1, maxLength: 32000 },
        ),
        hl: s.string("Gemini web interface language code. Defaults to en; request a reply language in the prompt.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$",
        }),
        continuable: s.boolean(
          "Return a subsequent_request_token for continuing this conversation. Defaults to false.\n\nSet to true on the first request and on each follow-up that needs another token.",
        ),
        subsequent_request_token: s.nullable(
          s.string(
            "Token from the previous reply. Send it with your next prompt using the same API key.\n\nUse the newest token for each follow-up. Tokens expire one hour after they are issued; an upstream conversation can become unavailable sooner. Treat tokens as sensitive. Invalid, expired or unavailable continuations fail without starting a new conversation and are not billed.",
            { minLength: 1, maxLength: 32768 },
          ),
        ),
      },
      { required: ["prompt"] },
    ),
    asyncInput: s.object(
      "Gemini Chat asynchronous parameters.",
      {
        prompt: s.string(
          "Text prompt for a new or continued Gemini conversation, up to 32,000 characters.\n\nText only. Use subsequent_request_token to continue a conversation. Uploads, Google account cookies and model selection are not accepted.",
          { minLength: 1, maxLength: 32000 },
        ),
        hl: s.string("Gemini web interface language code. Defaults to en; request a reply language in the prompt.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$",
        }),
        continuable: s.boolean(
          "Return a subsequent_request_token for continuing this conversation. Defaults to false.\n\nSet to true on the first request and on each follow-up that needs another token.",
        ),
        subsequent_request_token: s.string(
          "Token from the previous reply. Send it with your next prompt using the same API key.\n\nUse the newest token for each follow-up. Tokens expire one hour after they are issued; an upstream conversation can become unavailable sooner. Treat tokens as sensitive. Invalid, expired or unavailable continuations fail without starting a new conversation and are not billed.",
          { minLength: 1, maxLength: 32768 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["prompt"] },
    ),
    output: s.looseObject("Gemini Chat response.", {
      text: s.string("Gemini's completed text reply, preserving Markdown formatting.", {
        minLength: 1,
      }),
      subsequent_request_token: s.nullable(
        s.string(
          "Continuation token returned when continuable is true. Use the newest token for each follow-up; tokens expire after one hour.",
        ),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_images",
    path: "/api/google/images",
    description: "Search Google Images.",
    input: s.object(
      "Google Images parameters.",
      {
        q: s.string("Image search query, up to 2,048 characters.", {
          minLength: 1,
          maxLength: 2048,
        }),
        hl: s.string("Language of the Google Images interface.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        gl: s.nullable(s.string("Two-letter country code used to localize results.", { pattern: "^[a-z]{2}$" })),
        safe: s.nullable(
          s.withEnum(s.unknown("Set active to filter explicit images, or off to disable SafeSearch."), [
            "active",
            "off",
          ]),
        ),
        tbs: s.nullable(
          s.string(
            "Google image filters, such as isz:l for large images, itp:photo for photographs, or ic:trans for transparent images.",
            { maxLength: 4096 },
          ),
        ),
        start: s.integer(
          "Google's page offset. For the next page, use pagination.next_start from the response and keep the same query and filters. This offset is independent of num and the number of returned images.",
          { minimum: 0, maximum: 1000 },
        ),
        num: s.integer(
          "Maximum number of images returned from this page, from 1 to 100. This limits the parsed response; Google may supply fewer images.",
          { minimum: 1, maximum: 100 },
        ),
        device: s.withEnum(s.unknown("Device profile used for the image search."), ["desktop", "tablet", "mobile"]),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Google Images asynchronous parameters.",
      {
        q: s.string("Image search query, up to 2,048 characters.", {
          minLength: 1,
          maxLength: 2048,
        }),
        hl: s.string("Language of the Google Images interface.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        gl: s.string("Two-letter country code used to localize results.", {
          pattern: "^[a-z]{2}$",
        }),
        safe: s.withEnum(s.unknown("Set active to filter explicit images, or off to disable SafeSearch."), [
          "active",
          "off",
        ]),
        tbs: s.string(
          "Google image filters, such as isz:l for large images, itp:photo for photographs, or ic:trans for transparent images.",
          { maxLength: 4096 },
        ),
        start: s.integer(
          "Google's page offset. For the next page, use pagination.next_start from the response and keep the same query and filters. This offset is independent of num and the number of returned images.",
          { minimum: 0, maximum: 1000 },
        ),
        num: s.integer(
          "Maximum number of images returned from this page, from 1 to 100. This limits the parsed response; Google may supply fewer images.",
          { minimum: 1, maximum: 100 },
        ),
        device: s.withEnum(s.unknown("Device profile used for the image search."), ["desktop", "tablet", "mobile"]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Google Images response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      images_results: s.array("images results value.", s.looseObject("images results value. item.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_jobs",
    path: "/api/google/jobs",
    description: "Search Google Jobs listings by query and location.",
    input: s.object(
      "Google Jobs parameters.",
      {
        q: s.string("Job search query, for example software engineer jobs in New York.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        page_token: s.nullable(
          s.string("Copy next_page_token with next_page and the same query to fetch the next batch directly.", {
            minLength: 1,
            maxLength: 32768,
            pattern: "^[A-Za-z0-9+/=_-]+$",
          }),
        ),
        hl: s.string("Google interface language, for example en, de, fr, es or pt-BR.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-z]{2}$" }),
        location: s.nullable(
          s.string(
            "Canonical Google location, such as London,England,United Kingdom. Use one of location, uule or lat/lon.",
            { minLength: 1, maxLength: 512 },
          ),
        ),
        uule: s.nullable(
          s.string("Explicit Google UULE location value. Mutually exclusive with location and coordinates.", {
            minLength: 1,
            maxLength: 2048,
          }),
        ),
        lat: s.nullable(s.number("Latitude of the search origin. Requires lon.", { minimum: -90, maximum: 90 })),
        lon: s.nullable(
          s.number("Longitude of the search origin. Requires lat.", {
            minimum: -180,
            maximum: 180,
          }),
        ),
        radius: s.nullable(
          s.number(
            "Coordinate accuracy radius in meters, requiring lat/lon. This locates the search origin; it is not a job-distance filter.",
            { minimum: 1, maximum: 199 },
          ),
        ),
        uds: s.nullable(
          s.string(
            "Opaque Google refinement value returned in available_filters. Copy its q and uds together; filter choices vary by query and market.",
            { minLength: 1, maxLength: 16384 },
          ),
        ),
        tbs: s.nullable(
          s.string(
            "Google search refinement string, for example qdr:w for the past week. Keep it unchanged through pagination.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        include_filters: s.boolean(
          "Return available Google Jobs filters with the q and uds parameters needed to apply each one.",
        ),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Google Jobs asynchronous parameters.",
      {
        q: s.string("Job search query, for example software engineer jobs in New York.", {
          minLength: 1,
          maxLength: 512,
        }),
        page: s.integer("One-based results page. Use next_page from the response to continue.", {
          minimum: 1,
        }),
        page_token: s.string(
          "Copy next_page_token with next_page and the same query to fetch the next batch directly.",
          { minLength: 1, maxLength: 32768, pattern: "^[A-Za-z0-9+/=_-]+$" },
        ),
        hl: s.string("Google interface language, for example en, de, fr, es or pt-BR.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-z]{2}$" }),
        location: s.string(
          "Canonical Google location, such as London,England,United Kingdom. Use one of location, uule or lat/lon.",
          { minLength: 1, maxLength: 512 },
        ),
        uule: s.string("Explicit Google UULE location value. Mutually exclusive with location and coordinates.", {
          minLength: 1,
          maxLength: 2048,
        }),
        lat: s.number("Latitude of the search origin. Requires lon.", {
          minimum: -90,
          maximum: 90,
        }),
        lon: s.number("Longitude of the search origin. Requires lat.", {
          minimum: -180,
          maximum: 180,
        }),
        radius: s.number(
          "Coordinate accuracy radius in meters, requiring lat/lon. This locates the search origin; it is not a job-distance filter.",
          { minimum: 1, maximum: 199 },
        ),
        uds: s.string(
          "Opaque Google refinement value returned in available_filters. Copy its q and uds together; filter choices vary by query and market.",
          { minLength: 1, maxLength: 16384 },
        ),
        tbs: s.string(
          "Google search refinement string, for example qdr:w for the past week. Keep it unchanged through pagination.",
          { minLength: 1, maxLength: 2048 },
        ),
        include_filters: s.boolean(
          "Return available Google Jobs filters with the q and uds parameters needed to apply each one.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["q"] },
    ),
    output: s.looseObject("Google Jobs response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      jobs_results: s.array("jobs results value.", s.looseObject("jobs results value. item.", {})),
      search_information: s.looseObject("search information value.", {}),
      pagination: s.looseObject("pagination value.", {}),
      litescrape_pagination: s.looseObject("litescrape pagination value.", {}),
      available_filters: s.nullable(
        s.array("available filters value.", s.looseObject("available filters value. item.", {})),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_local",
    path: "/api/google/local",
    description: "Get Google local results for a query and location.",
    input: s.object(
      "Google Local parameters.",
      {
        q: s.string("Google Local query, up to 2,048 characters with no controls."),
        location: s.nullable(
          s.string("Human-readable location, up to 512 characters.\n\nCannot be combined with uule."),
        ),
        uule: s.nullable(
          s.string(
            "Canonical Google named-location token, up to 2,048 characters.\n\nCannot be combined with location.",
          ),
        ),
        google_domain: s.string("Validated Google domain.\n\nExamples: google.com, google.co.uk, google.fr."),
        gl: s.nullable(s.string("Country localization normalized to lowercase.")),
        hl: s.string("Google interface and result language."),
        ludocid: s.nullable(s.string("Google local CID, up to 128 digits.")),
        tbs: s.nullable(
          s.string("Google compatibility token forwarded unchanged; the provider may leave ranking unchanged."),
        ),
        start: s.integer("Local-result offset through 10,000; source-exhausted offsets above 1,000 return empty."),
        device: s.withEnum(s.unknown("Compatibility value over device-invariant Maps data."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
      },
      { required: ["q"] },
    ),
    asyncInput: s.object(
      "Google Local asynchronous parameters.",
      {
        q: s.string("Google Local query, up to 2,048 characters with no controls."),
        location: s.string("Human-readable location, up to 512 characters.\n\nCannot be combined with uule."),
        uule: s.string(
          "Canonical Google named-location token, up to 2,048 characters.\n\nCannot be combined with location.",
        ),
        google_domain: s.string("Validated Google domain.\n\nExamples: google.com, google.co.uk, google.fr."),
        gl: s.string("Country localization normalized to lowercase."),
        hl: s.string("Google interface and result language."),
        ludocid: s.string("Google local CID, up to 128 digits."),
        tbs: s.string("Google compatibility token forwarded unchanged; the provider may leave ranking unchanged."),
        start: s.integer("Local-result offset through 10,000; source-exhausted offsets above 1,000 return empty."),
        device: s.withEnum(s.unknown("Compatibility value over device-invariant Maps data."), [
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
    output: s.looseObject("Google Local response.", {
      local_results: s.nullable(s.array("local results value.", s.looseObject("local results value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      ads_results: s.nullable(s.array("ads results value.", s.looseObject("ads results value. item.", {}))),
      discover_more_places: s.nullable(
        s.array("discover more places value.", s.looseObject("discover more places value. item.", {})),
      ),
      local_map: s.nullable(s.looseObject("local map value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      litescrape_pagination: s.nullable(s.looseObject("litescrape pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_maps",
    path: "/api/google/maps",
    description: "Search Google Maps places, or get one place by ID.",
    input: s.object(
      "Google Maps parameters.",
      {
        q: s.nullable(
          s.string(
            "The business, category, address, or natural-language query to search. Required when type is search.\n\nExamples: coffee shops in Austin, dentist near Denver",
          ),
        ),
        ll: s.nullable(
          s.string(
            "A complete viewport containing latitude, longitude, and either zoom or radius.\n\nFormat: @lat,lon,14z or @lat,lon,5000m",
          ),
        ),
        location: s.nullable(
          s.string(
            "A named geographic location resolved by the API. Cannot be combined with ll or lat/lon.\n\nRequires z or m.",
          ),
        ),
        lat: s.anyOf("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m.", [
          s.string("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m."),
          s.number("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m."),
          s.literal(null, {
            description: "Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m.",
          }),
        ]),
        lon: s.anyOf("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m.", [
          s.string("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m."),
          s.number("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m."),
          s.literal(null, {
            description: "Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m.",
          }),
        ]),
        z: s.anyOf(
          "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
          [
            s.string(
              "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
            ),
            s.number(
              "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
            ),
            s.literal(null, {
              description:
                "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
            }),
          ],
        ),
        m: s.anyOf(
          "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
          [
            s.string(
              "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
            ),
            s.integer(
              "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
            ),
            s.literal(null, {
              description:
                "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
            }),
          ],
        ),
        nearby: s.nullable(
          s.boolean(
            "Uses the supplied geography as a nearby-search scope.\n\nRequires ll, location, or a lat/lon pair.",
          ),
        ),
        data: s.nullable(
          s.string(
            "A Google Maps protobuf parameter sequence for search filters or an exact place.\n\nMaximum length: 8,192 characters. Exact-place data requires type=place.",
          ),
        ),
        place_id: s.nullable(
          s.string(
            "A Google place identifier used to resolve one exact place or request live foot traffic.\n\nCannot be combined with data_cid or exact-place data on the primary Maps endpoint. It is the only required parameter on /api/google/maps/popular-times. Every response is fetched live; places without published data return popular_times: null.",
          ),
        ),
        data_cid: s.anyOf(
          "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
          [
            s.string(
              "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
            ),
            s.integer(
              "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
            ),
            s.literal(null, {
              description:
                "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
            }),
          ],
        ),
        type: s.nullable(
          s.withEnum(
            s.unknown(
              "Chooses a result search or an exact place response. Required for query and filter searches.\n\nUse place when sending an exact-place data sequence.",
            ),
            ["search", "place"],
          ),
        ),
        hl: s.nullable(s.string("Language used for Google Maps labels and returned text.\n\nExamples: en, es, fr, de")),
        gl: s.nullable(
          s.string("Two-letter country code used for regional result localization.\n\nExamples: us, gb, ca, au"),
        ),
        google_domain: s.nullable(
          s.string("Validated Google domain used for the request.\n\nExamples: google.com, google.co.uk, google.ca"),
        ),
        start: s.anyOf(
          "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
          [
            s.string(
              "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
            ),
            s.integer(
              "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
            ),
            s.literal(null, {
              description:
                "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
            }),
          ],
        ),
        min_price: s.anyOf(
          "Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price.",
          [
            s.string("Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price."),
            s.integer("Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price."),
            s.literal(null, {
              description:
                "Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price.",
            }),
          ],
        ),
        max_price: s.anyOf(
          "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
          [
            s.string(
              "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
            ),
            s.integer(
              "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
            ),
            s.literal(null, {
              description:
                "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
            }),
          ],
        ),
        min_rating: s.anyOf("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference.", [
          s.string("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference."),
          s.number("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference."),
          s.literal(null, {
            description: "Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference.",
          }),
        ]),
        open_state: s.nullable(
          s.withEnum(
            s.unknown("Filters by the current open state.\n\nCannot be combined with open_on_day or open_at_hour."),
            ["now", "24h"],
          ),
        ),
        open_on_day: s.nullable(
          s.withEnum(s.unknown("Filters for places open on a specific day."), [
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat",
            "sun",
          ]),
        ),
        open_at_hour: s.anyOf(
          "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
          [
            s.string(
              "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
            ),
            s.integer(
              "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
            ),
            s.literal(null, {
              description:
                "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
            }),
          ],
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Maps asynchronous parameters.",
      {
        q: s.string(
          "The business, category, address, or natural-language query to search. Required when type is search.\n\nExamples: coffee shops in Austin, dentist near Denver",
        ),
        ll: s.string(
          "A complete viewport containing latitude, longitude, and either zoom or radius.\n\nFormat: @lat,lon,14z or @lat,lon,5000m",
        ),
        location: s.string(
          "A named geographic location resolved by the API. Cannot be combined with ll or lat/lon.\n\nRequires z or m.",
        ),
        lat: s.anyOf("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m.", [
          s.string("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m."),
          s.number("Latitude for a coordinate-based viewport. Must be supplied with lon and either z or m."),
        ]),
        lon: s.anyOf("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m.", [
          s.string("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m."),
          s.number("Longitude for a coordinate-based viewport. Must be supplied with lat and either z or m."),
        ]),
        z: s.anyOf(
          "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
          [
            s.string(
              "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
            ),
            s.number(
              "Google Maps zoom level for location or lat/lon geography.\n\nAccepted range: 3 through 30. Cannot be combined with m.",
            ),
          ],
        ),
        m: s.anyOf(
          "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
          [
            s.string(
              "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
            ),
            s.integer(
              "Search radius in meters for location or lat/lon geography.\n\nAccepted range: 1 through 15,028,132. Cannot be combined with z.",
            ),
          ],
        ),
        nearby: s.boolean(
          "Uses the supplied geography as a nearby-search scope.\n\nRequires ll, location, or a lat/lon pair.",
        ),
        data: s.string(
          "A Google Maps protobuf parameter sequence for search filters or an exact place.\n\nMaximum length: 8,192 characters. Exact-place data requires type=place.",
        ),
        place_id: s.string(
          "A Google place identifier used to resolve one exact place or request live foot traffic.\n\nCannot be combined with data_cid or exact-place data on the primary Maps endpoint. It is the only required parameter on /api/google/maps/popular-times. Every response is fetched live; places without published data return popular_times: null.",
        ),
        data_cid: s.anyOf(
          "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
          [
            s.string(
              "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
            ),
            s.integer(
              "A decimal Google CID used to resolve one exact place.\n\nCannot be combined with place_id or exact-place data.",
            ),
          ],
        ),
        type: s.withEnum(
          s.unknown(
            "Chooses a result search or an exact place response. Required for query and filter searches.\n\nUse place when sending an exact-place data sequence.",
          ),
          ["search", "place"],
        ),
        hl: s.string("Language used for Google Maps labels and returned text.\n\nExamples: en, es, fr, de"),
        gl: s.string("Two-letter country code used for regional result localization.\n\nExamples: us, gb, ca, au"),
        google_domain: s.string(
          "Validated Google domain used for the request.\n\nExamples: google.com, google.co.uk, google.ca",
        ),
        start: s.anyOf(
          "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
          [
            s.string(
              "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
            ),
            s.integer(
              "Native Maps result offset: 0, 20, 40, and so on. Each request returns up to 20 places and each successful request costs one credit.\n\nUse pagination.next when it is present instead of constructing the next request manually.",
            ),
          ],
        ),
        min_price: s.anyOf(
          "Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price.",
          [
            s.string("Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price."),
            s.integer("Minimum price level for returned places.\n\nMust be non-negative and cannot exceed max_price."),
          ],
        ),
        max_price: s.anyOf(
          "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
          [
            s.string(
              "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
            ),
            s.integer(
              "Maximum price level for returned places.\n\nMust be non-negative and cannot be lower than min_price.",
            ),
          ],
        ),
        min_rating: s.anyOf("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference.", [
          s.string("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference."),
          s.number("Preferred minimum Google rating.\n\nGoogle treats this as a relevance preference."),
        ]),
        open_state: s.withEnum(
          s.unknown("Filters by the current open state.\n\nCannot be combined with open_on_day or open_at_hour."),
          ["now", "24h"],
        ),
        open_on_day: s.withEnum(s.unknown("Filters for places open on a specific day."), [
          "mon",
          "tue",
          "wed",
          "thu",
          "fri",
          "sat",
          "sun",
        ]),
        open_at_hour: s.anyOf(
          "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
          [
            s.string(
              "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
            ),
            s.integer(
              "Filters for places open at a specific hour using 24-hour time.\n\nAccepted range: 0 through 23. Requires open_on_day.",
            ),
          ],
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Maps response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      local_results: s.nullable(s.array("local results value.", s.looseObject("local results value. item.", {}))),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_maps_photo_meta",
    path: "/api/google/maps/photo-meta",
    description: "Get the place, contributor, and date of a Maps photo.",
    input: s.object(
      "Google Maps Photo Metadata parameters.",
      {
        data_id: s.string("Required Google Maps photo ID. Follow photo_meta_link from a Maps place response."),
        hl: s.nullable(s.string("Google interface and result language.")),
        gl: s.nullable(s.string("Two-letter country localization code.")),
        google_domain: s.nullable(s.string("A Google domain such as google.com or google.co.uk.")),
      },
      { required: ["data_id"] },
    ),
    asyncInput: s.object(
      "Google Maps Photo Metadata asynchronous parameters.",
      {
        data_id: s.string("Required Google Maps photo ID. Follow photo_meta_link from a Maps place response."),
        hl: s.string("Google interface and result language."),
        gl: s.string("Two-letter country localization code."),
        google_domain: s.string("A Google domain such as google.com or google.co.uk."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["data_id"] },
    ),
    output: s.looseObject("Google Maps Photo Metadata response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      user: s.nullable(s.looseObject("user value.", {})),
      location: s.nullable(s.looseObject("location value.", {})),
      date: s.nullable(s.string("date value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_maps_popular_times",
    path: "/api/google/maps/popular-times",
    description: "See how busy a place is right now.",
    input: s.object(
      "Google Maps Popular Times parameters.",
      {
        place_id: s.string("Required Google Place ID. Every response is fetched live."),
        hl: s.nullable(s.string("Google interface and result language.")),
        gl: s.nullable(s.string("Two-letter country localization code.")),
        google_domain: s.nullable(s.string("A Google domain such as google.com or google.co.uk.")),
      },
      { required: ["place_id"] },
    ),
    asyncInput: s.object(
      "Google Maps Popular Times asynchronous parameters.",
      {
        place_id: s.string("Required Google Place ID. Every response is fetched live."),
        hl: s.string("Google interface and result language."),
        gl: s.string("Two-letter country localization code."),
        google_domain: s.string("A Google domain such as google.com or google.co.uk."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["place_id"] },
    ),
    output: s.looseObject("Google Maps Popular Times response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      place: s.nullable(s.looseObject("place value.", {})),
      popular_times: s.nullable(s.looseObject("popular times value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_maps_posts",
    path: "/api/google/maps/posts",
    description: "Read the posts published by a business.",
    input: s.object(
      "Google Maps Posts parameters.",
      {
        data_id: s.string("Required hexadecimal Maps feature ID. Follow posts_link from a Maps place response."),
        hl: s.nullable(s.string("Google interface and result language.")),
        gl: s.nullable(s.string("Two-letter country localization code.")),
        google_domain: s.nullable(s.string("A Google domain such as google.com or google.co.uk.")),
        next_page_token: s.nullable(s.string("Continue a posts response with its opaque token.")),
      },
      { required: ["data_id"] },
    ),
    asyncInput: s.object(
      "Google Maps Posts asynchronous parameters.",
      {
        data_id: s.string("Required hexadecimal Maps feature ID. Follow posts_link from a Maps place response."),
        hl: s.string("Google interface and result language."),
        gl: s.string("Two-letter country localization code."),
        google_domain: s.string("A Google domain such as google.com or google.co.uk."),
        next_page_token: s.string("Continue a posts response with its opaque token."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["data_id"] },
    ),
    output: s.looseObject("Google Maps Posts response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      posts: s.nullable(s.array("posts value.", s.looseObject("posts value. item.", {}))),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_apps",
    path: "/api/google/play/apps",
    description: "Search and browse Google Play apps.",
    input: s.object(
      "Google Play Apps parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.nullable(
          s.string(
            "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        chart: s.nullable(
          s.string(
            "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
            { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
          ),
        ),
        next_page_token: s.nullable(
          s.string(
            "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        section_page_token: s.nullable(
          s.string(
            "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        see_more_token: s.nullable(
          s.string(
            "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        apps_category: s.nullable(
          s.string("Native app category identifier, such as MEDICAL. Excludes q and an explicit store_device.", {
            minLength: 1,
            maxLength: 128,
            pattern: "^[a-zA-Z0-9_-]+$",
          }),
        ),
        store_device: s.nullable(
          s.withEnum(
            s.unknown("Omit for the default phone storefront. An explicit selection excludes q and category."),
            ["phone", "tablet", "tv", "chromebook", "watch", "car"],
          ),
        ),
        age: s.nullable(
          s.withEnum(s.unknown("Children's age range. Requires apps_category=FAMILY."), [
            "AGE_RANGE1",
            "AGE_RANGE2",
            "AGE_RANGE3",
          ]),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Play Apps asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.string(
          "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
          { minLength: 1, maxLength: 2048 },
        ),
        chart: s.string(
          "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        next_page_token: s.string(
          "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        section_page_token: s.string(
          "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        see_more_token: s.string(
          "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        apps_category: s.string(
          "Native app category identifier, such as MEDICAL. Excludes q and an explicit store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        store_device: s.withEnum(
          s.unknown("Omit for the default phone storefront. An explicit selection excludes q and category."),
          ["phone", "tablet", "tv", "chromebook", "watch", "car"],
        ),
        age: s.withEnum(s.unknown("Children's age range. Requires apps_category=FAMILY."), [
          "AGE_RANGE1",
          "AGE_RANGE2",
          "AGE_RANGE3",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Play Apps response.", {
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      _page_token: s.nullable(s.string(" page token value.")),
      charts: s.nullable(s.array("charts value.", s.looseObject("charts value. item.", {}))),
      items_highlight: s.nullable(
        s.array(
          "items highlight value.",
          s.array("items highlight value. item.", s.looseObject("items highlight value. item. item.", {})),
        ),
      ),
      app_highlight: s.nullable(s.looseObject("app highlight value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_books",
    path: "/api/google/play/books",
    description: "Search and browse Google Play ebooks and audiobooks.",
    input: s.object(
      "Google Play Books parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.nullable(
          s.string(
            "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        chart: s.nullable(
          s.string(
            "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
            { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
          ),
        ),
        next_page_token: s.nullable(
          s.string(
            "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        section_page_token: s.nullable(
          s.string(
            "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        see_more_token: s.nullable(
          s.string(
            "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        books_category: s.nullable(
          s.string("Native book category identifier, such as coll_1689 for children's books. Excludes q.", {
            minLength: 1,
            maxLength: 128,
            pattern: "^[a-zA-Z0-9_-]+$",
          }),
        ),
        age: s.nullable(
          s.withEnum(s.unknown("Children's age range. Requires books_category=coll_1689."), [
            "AGE_RANGE1",
            "AGE_RANGE2",
            "AGE_RANGE3",
          ]),
        ),
        price: s.nullable(
          s.integer("1 for free books or 2 for paid books. Requires q.", {
            minimum: 1,
            maximum: 2,
          }),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Play Books asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.string(
          "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
          { minLength: 1, maxLength: 2048 },
        ),
        chart: s.string(
          "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        next_page_token: s.string(
          "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        section_page_token: s.string(
          "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        see_more_token: s.string(
          "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        books_category: s.string(
          "Native book category identifier, such as coll_1689 for children's books. Excludes q.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        age: s.withEnum(s.unknown("Children's age range. Requires books_category=coll_1689."), [
          "AGE_RANGE1",
          "AGE_RANGE2",
          "AGE_RANGE3",
        ]),
        price: s.integer("1 for free books or 2 for paid books. Requires q.", {
          minimum: 1,
          maximum: 2,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Play Books response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_games",
    path: "/api/google/play/games",
    description: "Browse Google Play games by category and chart.",
    input: s.object(
      "Google Play Games parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.nullable(
          s.string(
            "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        chart: s.nullable(
          s.string(
            "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
            { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
          ),
        ),
        next_page_token: s.nullable(
          s.string(
            "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        section_page_token: s.nullable(
          s.string(
            "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        see_more_token: s.nullable(
          s.string(
            "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        games_category: s.nullable(
          s.string("Native game category identifier, such as GAME_PUZZLE. Excludes q and an explicit store_device.", {
            minLength: 1,
            maxLength: 128,
            pattern: "^[a-zA-Z0-9_-]+$",
          }),
        ),
        store_device: s.nullable(
          s.withEnum(
            s.unknown("Omit for the default phone storefront. An explicit selection excludes q and category."),
            ["phone", "tablet", "tv", "chromebook", "watch", "windows"],
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Play Games asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.string(
          "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
          { minLength: 1, maxLength: 2048 },
        ),
        chart: s.string(
          "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        next_page_token: s.string(
          "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        section_page_token: s.string(
          "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        see_more_token: s.string(
          "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        games_category: s.string(
          "Native game category identifier, such as GAME_PUZZLE. Excludes q and an explicit store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        store_device: s.withEnum(
          s.unknown("Omit for the default phone storefront. An explicit selection excludes q and category."),
          ["phone", "tablet", "tv", "chromebook", "watch", "windows"],
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Play Games response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_movies",
    path: "/api/google/play/movies",
    description: "Search and browse Google Play movies and TV shows.",
    input: s.object(
      "Google Play Movies parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.nullable(
          s.string(
            "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        chart: s.nullable(
          s.string(
            "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
            { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
          ),
        ),
        next_page_token: s.nullable(
          s.string(
            "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        section_page_token: s.nullable(
          s.string(
            "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        see_more_token: s.nullable(
          s.string(
            "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
        movies_category: s.nullable(
          s.string("Native movie category identifier, such as FAMILY for family movies. Excludes q.", {
            minLength: 1,
            maxLength: 128,
            pattern: "^[a-zA-Z0-9_-]+$",
          }),
        ),
        age: s.nullable(
          s.withEnum(s.unknown("Children's age range. Requires movies_category=FAMILY."), [
            "AGE_RANGE1",
            "AGE_RANGE2",
            "AGE_RANGE3",
          ]),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Play Movies asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        q: s.string(
          "Optional query with 1 to 2,048 UTF-8 bytes of printable text. Excludes category. Omit it to browse the storefront. On the games endpoint, q uses shared Android app search; omit q or choose games_category to browse games.",
          { minLength: 1, maxLength: 2048 },
        ),
        chart: s.string(
          "Chart identifier such as topselling_free, topselling_paid, or topgrossing. Excludes q and all pagination selectors. Apps and games charts require phone or an omitted store_device.",
          { minLength: 1, maxLength: 128, pattern: "^[a-zA-Z0-9_-]+$" },
        ),
        next_page_token: s.string(
          "Use the returned next_page_token with the same parameters. Excludes chart, section_page_token, and see_more_token.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        section_page_token: s.string(
          "Continue one result group using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        see_more_token: s.string(
          "Open a result collection using its returned token and the same parameters. Excludes the other pagination selectors and chart.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        movies_category: s.string("Native movie category identifier, such as FAMILY for family movies. Excludes q.", {
          minLength: 1,
          maxLength: 128,
          pattern: "^[a-zA-Z0-9_-]+$",
        }),
        age: s.withEnum(s.unknown("Children's age range. Requires movies_category=FAMILY."), [
          "AGE_RANGE1",
          "AGE_RANGE2",
          "AGE_RANGE3",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Play Movies response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_product",
    path: "/api/google/play/product",
    description: "Get a Google Play app, book, movie or show by ID.",
    input: s.object(
      "Google Play Product parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        product_id: s.string(
          "Native Google Play product identifier, with 1 to 512 letters, digits, underscores, dots, or hyphens.",
          { minLength: 1, maxLength: 512, pattern: "^[a-zA-Z0-9_.-]+$" },
        ),
        store: s.withEnum(s.unknown("Product catalog containing this identifier."), [
          "apps",
          "books",
          "audiobooks",
          "movies",
          "tv",
        ]),
        season_id: s.nullable(
          s.string("Native season identifier, such as tvseason-OVPad1njPzI.P. Requires store=tv.", {
            minLength: 1,
            maxLength: 512,
            pattern: "^[a-zA-Z0-9_.-]+$",
          }),
        ),
      },
      { required: ["product_id"] },
    ),
    asyncInput: s.object(
      "Google Play Product asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        product_id: s.string(
          "Native Google Play product identifier, with 1 to 512 letters, digits, underscores, dots, or hyphens.",
          { minLength: 1, maxLength: 512, pattern: "^[a-zA-Z0-9_.-]+$" },
        ),
        store: s.withEnum(s.unknown("Product catalog containing this identifier."), [
          "apps",
          "books",
          "audiobooks",
          "movies",
          "tv",
        ]),
        season_id: s.string("Native season identifier, such as tvseason-OVPad1njPzI.P. Requires store=tv.", {
          minLength: 1,
          maxLength: 512,
          pattern: "^[a-zA-Z0-9_.-]+$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_id"] },
    ),
    output: s.looseObject("Google Play Product response.", {
      about_this_app: s.nullable(s.looseObject("about this app value.", {})),
      badges: s.nullable(s.array("badges value.", s.looseObject("badges value. item.", {}))),
      categories: s.nullable(s.array("categories value.", s.looseObject("categories value. item.", {}))),
      data_safety: s.nullable(s.array("data safety value.", s.looseObject("data safety value. item.", {}))),
      developer_contact: s.nullable(s.looseObject("developer contact value.", {})),
      media: s.nullable(s.looseObject("media value.", {})),
      permissions: s.nullable(s.array("permissions value.", s.looseObject("permissions value. item.", {}))),
      product_info: s.nullable(s.looseObject("product info value.", {})),
      ratings: s.nullable(s.array("ratings value.", s.looseObject("ratings value. item.", {}))),
      released_on: s.nullable(s.string("released on value.")),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      similar_results: s.nullable(s.array("similar results value.", s.looseObject("similar results value. item.", {}))),
      updated_on: s.nullable(s.string("updated on value.")),
      what_s_new: s.nullable(s.looseObject("what s new value.", {})),
      about_the_author: s.nullable(s.looseObject("about the author value.", {})),
      about_this_audiobook: s.nullable(s.looseObject("about this audiobook value.", {})),
      information: s.nullable(s.array("information value.", s.looseObject("information value. item.", {}))),
      listening_information: s.nullable(
        s.array("listening information value.", s.looseObject("listening information value. item.", {})),
      ),
      about_this_ebook: s.nullable(s.looseObject("about this ebook value.", {})),
      reading_information: s.nullable(
        s.array("reading information value.", s.looseObject("reading information value. item.", {})),
      ),
      about_this_movie: s.nullable(s.looseObject("about this movie value.", {})),
      cast: s.nullable(s.array("cast value.", s.looseObject("cast value. item.", {}))),
      directors: s.nullable(s.array("directors value.", s.looseObject("directors value. item.", {}))),
      producers: s.nullable(s.array("producers value.", s.looseObject("producers value. item.", {}))),
      writers: s.nullable(s.array("writers value.", s.looseObject("writers value. item.", {}))),
      about_this_show: s.nullable(s.looseObject("about this show value.", {})),
      episodes: s.nullable(s.looseObject("episodes value.", {})),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_play_reviews",
    path: "/api/google/play/reviews",
    description: "Get reviews for a Google Play app.",
    input: s.object(
      "Google Play Reviews parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        product_id: s.string(
          "Native Google Play product identifier, with 1 to 512 letters, digits, underscores, dots, or hyphens.",
          { minLength: 1, maxLength: 512, pattern: "^[a-zA-Z0-9_.-]+$" },
        ),
        store: s.withEnum(s.unknown("Product catalog containing this identifier."), [
          "apps",
          "books",
          "audiobooks",
          "movies",
          "tv",
        ]),
        platform: s.withEnum(s.unknown("Platform associated with the reviews."), [
          "phone",
          "tablet",
          "watch",
          "chromebook",
          "tv",
        ]),
        rating: s.nullable(s.integer("Only reviews with this rating, from 1 through 5.", { minimum: 1, maximum: 5 })),
        sort_by: s.integer("1 for relevant, 2 for newest, or 3 for rating.", {
          minimum: 1,
          maximum: 3,
        }),
        num: s.integer("Number of reviews, from 1 through 199.", { minimum: 1, maximum: 199 }),
        next_page_token: s.nullable(
          s.string(
            "Returned review continuation. Preserve product, store, language, country, platform, rating, sort order, and count.",
            { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
          ),
        ),
      },
      { required: ["product_id"] },
    ),
    asyncInput: s.object(
      "Google Play Reviews asynchronous parameters.",
      {
        hl: s.string("Storefront language, such as en, de, or zh-TW. Maximum 32 characters.", {
          maxLength: 32,
          pattern: "^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8}){0,3}$",
        }),
        gl: s.string("Two-letter country code.", { pattern: "^[a-zA-Z]{2}$" }),
        product_id: s.string(
          "Native Google Play product identifier, with 1 to 512 letters, digits, underscores, dots, or hyphens.",
          { minLength: 1, maxLength: 512, pattern: "^[a-zA-Z0-9_.-]+$" },
        ),
        store: s.withEnum(s.unknown("Product catalog containing this identifier."), [
          "apps",
          "books",
          "audiobooks",
          "movies",
          "tv",
        ]),
        platform: s.withEnum(s.unknown("Platform associated with the reviews."), [
          "phone",
          "tablet",
          "watch",
          "chromebook",
          "tv",
        ]),
        rating: s.integer("Only reviews with this rating, from 1 through 5.", {
          minimum: 1,
          maximum: 5,
        }),
        sort_by: s.integer("1 for relevant, 2 for newest, or 3 for rating.", {
          minimum: 1,
          maximum: 3,
        }),
        num: s.integer("Number of reviews, from 1 through 199.", { minimum: 1, maximum: 199 }),
        next_page_token: s.string(
          "Returned review continuation. Preserve product, store, language, country, platform, rating, sort order, and count.",
          { minLength: 1, maxLength: 65536, pattern: "^[a-zA-Z0-9_=+/:.-]+$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["product_id"] },
    ),
    output: s.looseObject("Google Play Reviews response.", {
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_reviews",
    path: "/api/google/reviews",
    description: "Get reviews for a Google Maps place.",
    input: s.object(
      "Google Maps Reviews parameters.",
      {
        data_id: s.nullable(
          s.string(
            "Hexadecimal Google Maps feature identifier.\n\nFormat: 0x123:0x456 Exactly one of data_id or place_id is required.",
          ),
        ),
        place_id: s.nullable(
          s.string(
            "Google place identifier for the business whose reviews should be returned.\n\nExactly one of place_id or data_id is required.",
          ),
        ),
        hl: s.nullable(s.string("Language used for returned review labels and place context.")),
        gl: s.nullable(s.string("Lowercase two-letter country code used for regional localization.")),
        sort_by: s.nullable(
          s.withEnum(s.unknown("Controls the order of returned reviews."), [
            "qualityScore",
            "newestFirst",
            "ratingHigh",
            "ratingLow",
          ]),
        ),
        topic_id: s.nullable(
          s.string(
            "Returns reviews associated with a topic ID from the topics response group.\n\nCannot be combined with query.",
          ),
        ),
        query: s.nullable(s.string("Returns reviews matching a free-text query.\n\nCannot be combined with topic_id.")),
        num: s.anyOf(
          "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
          [
            s.integer(
              "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
            ),
            s.string(
              "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
            ),
            s.literal(null, {
              description:
                "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
            }),
          ],
        ),
        next_page_token: s.nullable(
          s.string(
            "Opaque continuation token from pagination.next_page_token.\n\nPass the token back unchanged. Continuation requests default to ten reviews unless num is provided.",
          ),
        ),
        source_metadata: s.anyOf("Includes additional review-provider icon and scale metadata when available.", [
          s.string("Includes additional review-provider icon and scale metadata when available."),
          s.boolean("Includes additional review-provider icon and scale metadata when available."),
          s.literal(null, {
            description: "Includes additional review-provider icon and scale metadata when available.",
          }),
        ]),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Maps Reviews asynchronous parameters.",
      {
        data_id: s.string(
          "Hexadecimal Google Maps feature identifier.\n\nFormat: 0x123:0x456 Exactly one of data_id or place_id is required.",
        ),
        place_id: s.string(
          "Google place identifier for the business whose reviews should be returned.\n\nExactly one of place_id or data_id is required.",
        ),
        hl: s.string("Language used for returned review labels and place context."),
        gl: s.string("Lowercase two-letter country code used for regional localization."),
        sort_by: s.withEnum(s.unknown("Controls the order of returned reviews."), [
          "qualityScore",
          "newestFirst",
          "ratingHigh",
          "ratingLow",
        ]),
        topic_id: s.string(
          "Returns reviews associated with a topic ID from the topics response group.\n\nCannot be combined with query.",
        ),
        query: s.string("Returns reviews matching a free-text query.\n\nCannot be combined with topic_id."),
        num: s.anyOf(
          "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
          [
            s.integer(
              "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
            ),
            s.string(
              "Requested number of unique reviews to return.\n\nInitial unfiltered requests accept 1 through 100; the default remains eight. Requests return one response with up to the requested number of available reviews. Filtered and continuation requests accept 1 through 20.",
            ),
          ],
        ),
        next_page_token: s.string(
          "Opaque continuation token from pagination.next_page_token.\n\nPass the token back unchanged. Continuation requests default to ten reviews unless num is provided.",
        ),
        source_metadata: s.anyOf("Includes additional review-provider icon and scale metadata when available.", [
          s.string("Includes additional review-provider icon and scale metadata when available."),
          s.boolean("Includes additional review-provider icon and scale metadata when available."),
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Maps Reviews response.", {
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      place_info: s.nullable(s.looseObject("place info value.", {})),
      reviews: s.nullable(s.array("reviews value.", s.looseObject("reviews value. item.", {}))),
      topics: s.nullable(s.array("topics value.", s.looseObject("topics value. item.", {}))),
      source_summaries: s.nullable(
        s.array("source summaries value.", s.looseObject("source summaries value. item.", {})),
      ),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_search",
    path: "/api/google/search",
    description: "Get Google search results, including the AI Overview and People also ask.",
    input: s.object(
      "Google Search parameters.",
      {
        page_token: s.nullable(
          s.string(
            "Opaque token from pagination.next_page_token. Send it alone to fetch the next page with the original search parameters.\n\nPrefer page_token to repeating the same search with start=10, start=20, or another offset. Send the token as soon as possible and no later than 5 minutes after receiving it. Available for ordinary Google Search, including fast mode; not available for tbm verticals. search_metadata.continuation is followed for a direct request. If Google omits a required link or the deadline expires, the request fails without billing.",
            { maxLength: 32768 },
          ),
        ),
        q: s.nullable(
          s.string(
            "Google Search query, up to 2,048 characters.\n\nRequired unless ludocid, kgmid, or page_token is supplied.",
            { maxLength: 2048 },
          ),
        ),
        fast_mode: s.boolean(
          "Return organic results only, skipping AI Overview and all other result groups.\n\nKeeps search metadata and parameters. Omits cross-module position_absolute.",
        ),
        location: s.nullable(
          s.string(
            "Human-readable city-level location encoded to UULE by Litescrape.\n\nConflicts with uule and lat/lon.",
            { maxLength: 512 },
          ),
        ),
        uule: s.nullable(
          s.string("Pre-encoded Google location value.\n\nConflicts with location and lat/lon.", {
            maxLength: 2048,
          }),
        ),
        lat: s.nullable(
          s.number("Latitude from -90 through 90.\n\nRequires lon and conflicts with location and uule.", {
            minimum: -90,
            maximum: 90,
          }),
        ),
        lon: s.nullable(
          s.number("Longitude from -180 through 180.\n\nRequires lat and conflicts with location and uule.", {
            minimum: -180,
            maximum: 180,
          }),
        ),
        radius: s.nullable(
          s.number(
            "Decimal search-bias radius in meters.\n\nRequires location or lat/lon. Desktop: 1–199; tablet/mobile: 1–1,000.",
            { minimum: 1, maximum: 1000 },
          ),
        ),
        ludocid: s.nullable(
          s.string("Google local CID used to search for one entity.", {
            maxLength: 128,
            pattern: "^\\d+$",
          }),
        ),
        lsig: s.nullable(s.string("Opaque Knowledge Graph or local-pack signature.", { maxLength: 4096 })),
        kgmid: s.nullable(s.string("Google Knowledge Graph machine ID, such as /m/0k8z.", { maxLength: 512 })),
        si: s.nullable(s.string("Opaque cached Google search context.", { maxLength: 4096 })),
        ibp: s.nullable(s.string("Google layout or expansion control.", { maxLength: 4096 })),
        uds: s.nullable(s.string("Opaque Google filter token.", { maxLength: 4096 })),
        color_scheme: s.nullable(s.withEnum(s.unknown("Google result color presentation."), ["light", "dark"])),
        google_domain: s.string("Results use google.com. Use gl, hl, cr, lr or geography for localization."),
        gl: s.nullable(s.string("Lowercase two-letter country localization code.", { pattern: "^[a-z]{2}$" })),
        hl: s.string("Google interface and result language code.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        cr: s.nullable(
          s.string("One or more countryXX restrictions joined with |.", {
            pattern: "^country[A-Z]{2}(?:\\|country[A-Z]{2})*$",
          }),
        ),
        lr: s.nullable(
          s.string("One or more lang_xx restrictions joined with |.", {
            pattern: "^lang_[a-z]{2,3}(?:\\|lang_[a-z]{2,3})*$",
          }),
        ),
        tbs: s.nullable(s.string("Google native date or search filter string.", { maxLength: 4096 })),
        safe: s.nullable(s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"])),
        nfpr: s.nullable(s.withEnum(s.unknown("Google auto-correction control."), ["0", "1"])),
        filter: s.nullable(s.withEnum(s.unknown("Google similar-result filtering control."), ["0", "1"])),
        pws: s.nullable(
          s.withEnum(s.unknown("Google personalization control; 0 asks for non-personalized results."), ["0", "1"]),
        ),
        peek_pws: s.nullable(
          s.withEnum(s.unknown("Google personalization peek flag, forwarded unchanged."), ["0", "1"]),
        ),
        tbm: s.nullable(
          s.withEnum(
            s.unknown("Google vertical: lcl, vid, nws, shop, or pts. For image searches, use /api/google/images."),
            ["lcl", "vid", "nws", "shop", "pts"],
          ),
        ),
        start: s.integer(
          "Non-negative Google result offset.\n\nPrefer page_token to repeating the same search with start=10, start=20, or another offset.",
          { minimum: 0 },
        ),
        num: s.nullable(s.integer("Best-effort first-page result count, 1 to 10.", { minimum: 1, maximum: 10 })),
        device: s.withEnum(s.unknown("Request device profile and radius bound."), ["desktop", "tablet", "mobile"]),
        oq: s.nullable(
          s.string("Original query associated with an autocomplete selection.", {
            maxLength: 2048,
          }),
        ),
        gs_lp: s.nullable(
          s.string("Google gs_lp value associated with an autocomplete selection.", {
            maxLength: 4096,
          }),
        ),
        sclient: s.nullable(
          s.string("Google client identifier such as gws-wiz-serp.", {
            maxLength: 64,
            pattern: "^[A-Za-z0-9._-]+$",
          }),
        ),
        as_dt: s.nullable(
          s.withEnum(s.unknown("Includes or excludes as_sitesearch.\n\nRequires as_sitesearch."), ["i", "e"]),
        ),
        as_epq: s.nullable(s.string("Exact phrase query.", { maxLength: 2048 })),
        as_eq: s.nullable(s.string("Excluded phrase query.", { maxLength: 2048 })),
        as_lq: s.nullable(s.string("Require results that link to this URL.", { maxLength: 4096 })),
        as_nlo: s.nullable(s.integer("Inclusive range lower bound.\n\nRequires as_nhi.", { minimum: 0 })),
        as_nhi: s.nullable(s.integer("Inclusive range upper bound.\n\nRequires as_nlo.", { minimum: 0 })),
        as_oq: s.nullable(s.string("Any-of search terms.", { maxLength: 2048 })),
        as_q: s.nullable(s.string("Additional all-of search terms.", { maxLength: 2048 })),
        as_qdr: s.nullable(
          s.string("Quick range d, w, m, or y with an optional positive count.", {
            pattern: "^[dwmy](?:[1-9][0-9]*)?$",
          }),
        ),
        as_rq: s.nullable(s.string("Find pages related to this URL.", { maxLength: 4096 })),
        as_sitesearch: s.nullable(s.string("Site hostname to include or exclude.", { maxLength: 253 })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Search asynchronous parameters.",
      {
        page_token: s.string(
          "Opaque token from pagination.next_page_token. Send it alone to fetch the next page with the original search parameters.\n\nPrefer page_token to repeating the same search with start=10, start=20, or another offset. Send the token as soon as possible and no later than 5 minutes after receiving it. Available for ordinary Google Search, including fast mode; not available for tbm verticals. search_metadata.continuation is followed for a direct request. If Google omits a required link or the deadline expires, the request fails without billing.",
          { maxLength: 32768 },
        ),
        q: s.string(
          "Google Search query, up to 2,048 characters.\n\nRequired unless ludocid, kgmid, or page_token is supplied.",
          { maxLength: 2048 },
        ),
        fast_mode: s.boolean(
          "Return organic results only, skipping AI Overview and all other result groups.\n\nKeeps search metadata and parameters. Omits cross-module position_absolute.",
        ),
        location: s.string(
          "Human-readable city-level location encoded to UULE by Litescrape.\n\nConflicts with uule and lat/lon.",
          { maxLength: 512 },
        ),
        uule: s.string("Pre-encoded Google location value.\n\nConflicts with location and lat/lon.", {
          maxLength: 2048,
        }),
        lat: s.number("Latitude from -90 through 90.\n\nRequires lon and conflicts with location and uule.", {
          minimum: -90,
          maximum: 90,
        }),
        lon: s.number("Longitude from -180 through 180.\n\nRequires lat and conflicts with location and uule.", {
          minimum: -180,
          maximum: 180,
        }),
        radius: s.number(
          "Decimal search-bias radius in meters.\n\nRequires location or lat/lon. Desktop: 1–199; tablet/mobile: 1–1,000.",
          { minimum: 1, maximum: 1000 },
        ),
        ludocid: s.string("Google local CID used to search for one entity.", {
          maxLength: 128,
          pattern: "^\\d+$",
        }),
        lsig: s.string("Opaque Knowledge Graph or local-pack signature.", { maxLength: 4096 }),
        kgmid: s.string("Google Knowledge Graph machine ID, such as /m/0k8z.", { maxLength: 512 }),
        si: s.string("Opaque cached Google search context.", { maxLength: 4096 }),
        ibp: s.string("Google layout or expansion control.", { maxLength: 4096 }),
        uds: s.string("Opaque Google filter token.", { maxLength: 4096 }),
        color_scheme: s.withEnum(s.unknown("Google result color presentation."), ["light", "dark"]),
        google_domain: s.string("Results use google.com. Use gl, hl, cr, lr or geography for localization."),
        gl: s.string("Lowercase two-letter country localization code.", { pattern: "^[a-z]{2}$" }),
        hl: s.string("Google interface and result language code.", {
          pattern: "^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$",
        }),
        cr: s.string("One or more countryXX restrictions joined with |.", {
          pattern: "^country[A-Z]{2}(?:\\|country[A-Z]{2})*$",
        }),
        lr: s.string("One or more lang_xx restrictions joined with |.", {
          pattern: "^lang_[a-z]{2,3}(?:\\|lang_[a-z]{2,3})*$",
        }),
        tbs: s.string("Google native date or search filter string.", { maxLength: 4096 }),
        safe: s.withEnum(s.unknown("Google adult-content filtering."), ["active", "off"]),
        nfpr: s.withEnum(s.unknown("Google auto-correction control."), ["0", "1"]),
        filter: s.withEnum(s.unknown("Google similar-result filtering control."), ["0", "1"]),
        pws: s.withEnum(s.unknown("Google personalization control; 0 asks for non-personalized results."), ["0", "1"]),
        peek_pws: s.withEnum(s.unknown("Google personalization peek flag, forwarded unchanged."), ["0", "1"]),
        tbm: s.withEnum(
          s.unknown("Google vertical: lcl, vid, nws, shop, or pts. For image searches, use /api/google/images."),
          ["lcl", "vid", "nws", "shop", "pts"],
        ),
        start: s.integer(
          "Non-negative Google result offset.\n\nPrefer page_token to repeating the same search with start=10, start=20, or another offset.",
          { minimum: 0 },
        ),
        num: s.integer("Best-effort first-page result count, 1 to 10.", {
          minimum: 1,
          maximum: 10,
        }),
        device: s.withEnum(s.unknown("Request device profile and radius bound."), ["desktop", "tablet", "mobile"]),
        oq: s.string("Original query associated with an autocomplete selection.", {
          maxLength: 2048,
        }),
        gs_lp: s.string("Google gs_lp value associated with an autocomplete selection.", {
          maxLength: 4096,
        }),
        sclient: s.string("Google client identifier such as gws-wiz-serp.", {
          maxLength: 64,
          pattern: "^[A-Za-z0-9._-]+$",
        }),
        as_dt: s.withEnum(s.unknown("Includes or excludes as_sitesearch.\n\nRequires as_sitesearch."), ["i", "e"]),
        as_epq: s.string("Exact phrase query.", { maxLength: 2048 }),
        as_eq: s.string("Excluded phrase query.", { maxLength: 2048 }),
        as_lq: s.string("Require results that link to this URL.", { maxLength: 4096 }),
        as_nlo: s.integer("Inclusive range lower bound.\n\nRequires as_nhi.", { minimum: 0 }),
        as_nhi: s.integer("Inclusive range upper bound.\n\nRequires as_nlo.", { minimum: 0 }),
        as_oq: s.string("Any-of search terms.", { maxLength: 2048 }),
        as_q: s.string("Additional all-of search terms.", { maxLength: 2048 }),
        as_qdr: s.string("Quick range d, w, m, or y with an optional positive count.", {
          pattern: "^[dwmy](?:[1-9][0-9]*)?$",
        }),
        as_rq: s.string("Find pages related to this URL.", { maxLength: 4096 }),
        as_sitesearch: s.string("Site hostname to include or exclude.", { maxLength: 253 }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      dmca_messages: s.nullable(s.looseObject("dmca messages value.", {})),
      find_results_on: s.nullable(s.array("find results on value.", s.looseObject("find results on value. item.", {}))),
      latest_posts: s.nullable(s.array("latest posts value.", s.looseObject("latest posts value. item.", {}))),
      organic_results: s.nullable(s.array("organic results value.", s.looseObject("organic results value. item.", {}))),
      ads: s.nullable(s.array("ads value.", s.looseObject("ads value. item.", {}))),
      ai_overview: s.nullable(s.looseObject("ai overview value.", {})),
      answer_box: s.nullable(s.looseObject("answer box value.", {})),
      knowledge_graph: s.nullable(s.looseObject("knowledge graph value.", {})),
      local_map: s.nullable(s.looseObject("local map value.", {})),
      local_results: s.nullable(s.looseObject("local results value.", {})),
      pagination: s.nullable(s.looseObject("pagination value.", {})),
      related_questions: s.nullable(
        s.array("related questions value.", s.looseObject("related questions value. item.", {})),
      ),
      related_searches: s.nullable(
        s.array("related searches value.", s.looseObject("related searches value. item.", {})),
      ),
      ask_ai_mode: s.nullable(s.array("ask ai mode value.", s.looseObject("ask ai mode value. item.", {}))),
      available_on: s.nullable(s.array("available on value.", s.looseObject("available on value. item.", {}))),
      broaden_searches: s.nullable(
        s.array("broaden searches value.", s.looseObject("broaden searches value. item.", {})),
      ),
      complementary_results: s.nullable(
        s.array("complementary results value.", s.looseObject("complementary results value. item.", {})),
      ),
      discover_more_places: s.nullable(
        s.array("discover more places value.", s.looseObject("discover more places value. item.", {})),
      ),
      discussions_and_forums: s.nullable(
        s.array("discussions and forums value.", s.looseObject("discussions and forums value. item.", {})),
      ),
      episode_guide: s.nullable(s.array("episode guide value.", s.looseObject("episode guide value. item.", {}))),
      events_results: s.nullable(s.array("events results value.", s.looseObject("events results value. item.", {}))),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      flight_result: s.nullable(s.looseObject("flight result value.", {})),
      immersive_products: s.nullable(
        s.array("immersive products value.", s.looseObject("immersive products value. item.", {})),
      ),
      inline_images: s.nullable(s.array("inline images value.", s.looseObject("inline images value. item.", {}))),
      inline_videos: s.nullable(s.array("inline videos value.", s.looseObject("inline videos value. item.", {}))),
      jobs_results: s.nullable(s.looseObject("jobs results value.", {})),
      news_results: s.nullable(s.array("news results value.", s.looseObject("news results value. item.", {}))),
      perspectives: s.nullable(s.array("perspectives value.", s.looseObject("perspectives value. item.", {}))),
      places_sites: s.nullable(s.array("places sites value.", s.looseObject("places sites value. item.", {}))),
      recipes_results: s.nullable(s.array("recipes results value.", s.looseObject("recipes results value. item.", {}))),
      refine_by: s.nullable(s.array("refine by value.", s.looseObject("refine by value. item.", {}))),
      related_brands: s.nullable(s.array("related brands value.", s.looseObject("related brands value. item.", {}))),
      related_categories: s.nullable(
        s.array("related categories value.", s.looseObject("related categories value. item.", {})),
      ),
      scholarly_articles: s.nullable(s.looseObject("scholarly articles value.", {})),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      categorized_shopping_results: s.nullable(
        s.array("categorized shopping results value.", s.looseObject("categorized shopping results value. item.", {})),
      ),
      short_videos: s.nullable(s.array("short videos value.", s.looseObject("short videos value. item.", {}))),
      sports_results: s.nullable(s.looseObject("sports results value.", {})),
      top_sights: s.nullable(s.looseObject("top sights value.", {})),
      top_stories: s.anyOf("top stories value.", [
        s.array("top stories value.", s.looseObject("top stories value. item.", {})),
        s.looseObject("top stories value.", {}),
        s.literal(null, {
          description: "top stories value.",
        }),
      ]),
      video_results: s.nullable(s.array("video results value.", s.looseObject("video results value. item.", {}))),
      finance_results: s.nullable(s.looseObject("finance results value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_shopping",
    path: "/api/google/shopping",
    description: "Search Google Shopping products.",
    input: s.object(
      "Google Shopping parameters.",
      {
        q: s.nullable(
          s.string("Product query, up to 2,048 characters with no controls. Optional when a shoprs token is supplied."),
        ),
        location: s.nullable(
          s.string("Named search origin, up to 512 characters and 63 UTF-8 bytes once encoded. Conflicts with uule."),
        ),
        uule: s.nullable(s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location.")),
        google_domain: s.string("Validated first-party Google domain."),
        gl: s.nullable(s.string("Two-letter country code, normalized to lowercase.")),
        hl: s.nullable(s.string("Language code such as en, en-GB, or de.")),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        shoprs: s.nullable(
          s.string(
            "Google refinement token from a previous response, up to 4,096 characters. An explicit refinement replaces the one it carries.",
          ),
        ),
        min_price: s.nullable(s.number("Lower price bound, 0 through 1,000,000,000. Excludes the other refinements.")),
        max_price: s.nullable(s.number("Upper price bound, at or above min_price. Excludes the other refinements.")),
        sort_by: s.nullable(
          s.withEnum(
            s.unknown(
              "Price low to high, price high to low, rating high to low, or Google’s default relevance. Combines with one refinement.",
            ),
            ["", "1", "2", "3", "4"],
          ),
        ),
        free_shipping: s.boolean("Only products with free shipping. Excludes the other refinements."),
        on_sale: s.boolean("Only products Google marks as on sale. Excludes the other refinements."),
        small_business: s.boolean("Only products from small businesses. Excludes the other refinements."),
        start: s.nullable(s.integer("Result offset from 0 through 1,000.")),
        num: s.nullable(
          s.integer(
            "1 through 100. Responses are capped to this count and transparently consume Google’s fixed 40-product pages when needed.",
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Shopping asynchronous parameters.",
      {
        q: s.string(
          "Product query, up to 2,048 characters with no controls. Optional when a shoprs token is supplied.",
        ),
        location: s.string(
          "Named search origin, up to 512 characters and 63 UTF-8 bytes once encoded. Conflicts with uule.",
        ),
        uule: s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location."),
        google_domain: s.string("Validated first-party Google domain."),
        gl: s.string("Two-letter country code, normalized to lowercase."),
        hl: s.string("Language code such as en, en-GB, or de."),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        shoprs: s.string(
          "Google refinement token from a previous response, up to 4,096 characters. An explicit refinement replaces the one it carries.",
        ),
        min_price: s.number("Lower price bound, 0 through 1,000,000,000. Excludes the other refinements."),
        max_price: s.number("Upper price bound, at or above min_price. Excludes the other refinements."),
        sort_by: s.withEnum(
          s.unknown(
            "Price low to high, price high to low, rating high to low, or Google’s default relevance. Combines with one refinement.",
          ),
          ["", "1", "2", "3", "4"],
        ),
        free_shipping: s.boolean("Only products with free shipping. Excludes the other refinements."),
        on_sale: s.boolean("Only products Google marks as on sale. Excludes the other refinements."),
        small_business: s.boolean("Only products from small businesses. Excludes the other refinements."),
        start: s.integer("Result offset from 0 through 1,000."),
        num: s.integer(
          "1 through 100. Responses are capped to this count and transparently consume Google’s fixed 40-product pages when needed.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Shopping response.", {
      inline_shopping_results: s.nullable(
        s.array("inline shopping results value.", s.looseObject("inline shopping results value. item.", {})),
      ),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      product_result: s.nullable(s.looseObject("product result value.", {})),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      categorized_shopping_results: s.nullable(
        s.array("categorized shopping results value.", s.looseObject("categorized shopping results value. item.", {})),
      ),
      carousel_filters: s.nullable(
        s.array("carousel filters value.", s.looseObject("carousel filters value. item.", {})),
      ),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      offers: s.nullable(s.array("offers value.", s.looseObject("offers value. item.", {}))),
      product_reviews: s.nullable(s.array("product reviews value.", s.looseObject("product reviews value. item.", {}))),
      related_products: s.nullable(
        s.array("related products value.", s.looseObject("related products value. item.", {})),
      ),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_shopping_merchant_urls",
    path: "/api/google/shopping/merchant-urls",
    description: "Get direct merchant URLs for Google Shopping offers.",
    input: s.object(
      "Google Shopping Merchant URLs parameters.",
      {
        products: s.array(
          "Send 1–100 headline offers. Each item requires merchant and headline_offer_docid from Shopping Search.",
          s.object(
            "products value. item.",
            {
              gpcid: s.nullable(
                s.string("Optional product ID for correlation; not used for lookup.", {
                  pattern: "^[0-9]{1,20}$",
                }),
              ),
              headline_offer_docid: s.string("Exact offer ID from Shopping Search; required.", {
                pattern: "^[0-9]{1,20}$",
              }),
              merchant: s.string("Copy source from Shopping Search; required for grouping offer lookups.", {
                minLength: 1,
                maxLength: 200,
              }),
            },
            { required: ["headline_offer_docid", "merchant"] },
          ),
          { minItems: 1, maxItems: 100 },
        ),
        gl: s.string("Use the same country code as the original Shopping Search. Defaults to us.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        hl: s.string("Use the same language code as the original Shopping Search. Defaults to en.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$",
        }),
      },
      { required: ["products"] },
    ),
    asyncInput: s.object(
      "Google Shopping Merchant URLs asynchronous parameters.",
      {
        products: s.array(
          "Send 1–100 headline offers. Each item requires merchant and headline_offer_docid from Shopping Search.",
          s.object(
            "products value. item.",
            {
              gpcid: s.nullable(
                s.string("Optional product ID for correlation; not used for lookup.", {
                  pattern: "^[0-9]{1,20}$",
                }),
              ),
              headline_offer_docid: s.string("Exact offer ID from Shopping Search; required.", {
                pattern: "^[0-9]{1,20}$",
              }),
              merchant: s.string("Copy source from Shopping Search; required for grouping offer lookups.", {
                minLength: 1,
                maxLength: 200,
              }),
            },
            { required: ["headline_offer_docid", "merchant"] },
          ),
          { minItems: 1, maxItems: 100 },
        ),
        gl: s.string("Use the same country code as the original Shopping Search. Defaults to us.", {
          pattern: "^[a-zA-Z]{2}$",
        }),
        hl: s.string("Use the same language code as the original Shopping Search. Defaults to en.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["products"] },
    ),
    output: s.looseObject("Google Shopping Merchant URLs response.", {
      results: s.array("results value.", s.looseObject("results value. item.", {})),
      summary: s.looseObject("summary value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "google_shopping_product",
    path: "/api/google/shopping/product",
    description: "Get every merchant offer for a Google Shopping product.",
    input: s.object(
      "Google Shopping Product parameters.",
      {
        q: s.nullable(
          s.string(
            "The search term this product was found with, up to 2,048 characters. Google resolves the product viewer against it as well as the identifiers.",
          ),
        ),
        location: s.nullable(
          s.string("Named search origin, up to 512 characters and 63 UTF-8 bytes once encoded. Conflicts with uule."),
        ),
        uule: s.nullable(s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location.")),
        google_domain: s.string("Validated first-party Google domain."),
        gl: s.nullable(s.string("Two-letter country code, normalized to lowercase.")),
        hl: s.nullable(s.string("Language code such as en, en-GB, or de.")),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        gpcid: s.nullable(
          s.string(
            "Product cluster ID from a shopping result, 1 to 20 decimal digits. Optional when a prds token is supplied.\n\nEvery Shopping result with a gpcid includes a ready-made litescrape_product_link.",
          ),
        ),
        headline_offer_docid: s.nullable(
          s.string(
            "Headline merchant offer document ID from the same shopping result, 1 to 20 decimal digits. Goes with gpcid rather than prds.",
          ),
        ),
        image_docid: s.nullable(
          s.string(
            "Image document ID from the same shopping result, 1 to 20 decimal digits. Goes with gpcid rather than prds.",
          ),
        ),
        prds: s.nullable(
          s.string(
            "Google product selector token from a previous response, up to 2,048 characters. Conflicts with gpcid and the identifiers above.",
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Google Shopping Product asynchronous parameters.",
      {
        q: s.string(
          "The search term this product was found with, up to 2,048 characters. Google resolves the product viewer against it as well as the identifiers.",
        ),
        location: s.string(
          "Named search origin, up to 512 characters and 63 UTF-8 bytes once encoded. Conflicts with uule.",
        ),
        uule: s.string("Canonical Google location token, up to 2,048 characters. Conflicts with location."),
        google_domain: s.string("Validated first-party Google domain."),
        gl: s.string("Two-letter country code, normalized to lowercase."),
        hl: s.string("Language code such as en, en-GB, or de."),
        device: s.withEnum(s.unknown("Google returns its real layout for the selected device."), [
          "desktop",
          "tablet",
          "mobile",
        ]),
        gpcid: s.string(
          "Product cluster ID from a shopping result, 1 to 20 decimal digits. Optional when a prds token is supplied.\n\nEvery Shopping result with a gpcid includes a ready-made litescrape_product_link.",
        ),
        headline_offer_docid: s.string(
          "Headline merchant offer document ID from the same shopping result, 1 to 20 decimal digits. Goes with gpcid rather than prds.",
        ),
        image_docid: s.string(
          "Image document ID from the same shopping result, 1 to 20 decimal digits. Goes with gpcid rather than prds.",
        ),
        prds: s.string(
          "Google product selector token from a previous response, up to 2,048 characters. Conflicts with gpcid and the identifiers above.",
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Google Shopping Product response.", {
      inline_shopping_results: s.nullable(
        s.array("inline shopping results value.", s.looseObject("inline shopping results value. item.", {})),
      ),
      search_information: s.nullable(s.looseObject("search information value.", {})),
      product_result: s.nullable(s.looseObject("product result value.", {})),
      shopping_results: s.nullable(
        s.array("shopping results value.", s.looseObject("shopping results value. item.", {})),
      ),
      categorized_shopping_results: s.nullable(
        s.array("categorized shopping results value.", s.looseObject("categorized shopping results value. item.", {})),
      ),
      carousel_filters: s.nullable(
        s.array("carousel filters value.", s.looseObject("carousel filters value. item.", {})),
      ),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      offers: s.nullable(s.array("offers value.", s.looseObject("offers value. item.", {}))),
      product_reviews: s.nullable(s.array("product reviews value.", s.looseObject("product reviews value. item.", {}))),
      related_products: s.nullable(
        s.array("related products value.", s.looseObject("related products value. item.", {})),
      ),
      search_metadata: s.nullable(s.looseObject("search metadata value.", {})),
      search_parameters: s.nullable(s.looseObject("search parameters value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
