import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const youtubeTools: DataTool[] = [
  {
    name: "youtube_channel",
    path: "/api/youtube/channel",
    description: "Get a YouTube channel's profile, videos, Shorts, playlists and posts.",
    input: s.object(
      "YouTube Channel parameters.",
      {
        channel_id: s.nullable(
          s.string(
            "Channel handle (with or without @) or a UC channel ID. Required on the first page; omit with next_page_token.\n\nRequired on the first page. Use a handle such as @veritasium or a UC channel ID; full URLs are not accepted.",
            { minLength: 1, maxLength: 100 },
          ),
        ),
        tab: s.nullable(
          s.withEnum(
            s.unknown(
              "Channel content tab. Defaults to videos. Omit when using search_query or next_page_token. Not every channel offers every tab.\n\nA channel without the requested tab returns an empty content group with search_information.tab_available set to false.",
            ),
            ["videos", "shorts", "streams", "podcasts", "playlists", "posts"],
          ),
        ),
        sort: s.nullable(
          s.withEnum(
            s.unknown(
              "videos, shorts and streams accept latest, popular or oldest; playlists accept dd (newest playlist) or lad (last video added). Omit with podcasts, posts, search_query or next_page_token.\n\nVideos, Shorts and streams default to latest. Playlists default to dd. Sorting uses the choices offered by YouTube.",
            ),
            ["latest", "popular", "oldest", "dd", "lad"],
          ),
        ),
        search_query: s.nullable(
          s.string(
            "Search within this channel for matching videos and playlists. Cannot be combined with tab or sort. Omit with next_page_token.\n\nOmit tab and sort when searching. Matching videos and playlists appear in search_results.",
            { minLength: 1, maxLength: 2048 },
          ),
        ),
        hl: s.nullable(
          s.string("Interface language, such as en or pt-BR. Defaults to en. Omit with next_page_token.", {
            pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,2}$",
          }),
        ),
        gl: s.nullable(
          s.string("Two-letter country code. Defaults to US. Omit with next_page_token.", {
            pattern: "^[A-Za-z]{2}$",
          }),
        ),
        about: s.nullable(
          s.boolean(
            "Include additional public channel details, such as country, join date, total views and links. Defaults to false. Omit with next_page_token.\n\nChannel profile data is returned on the first page. about=true includes additional public details. Continuation pages return content only.",
          ),
        ),
        next_page_token: s.nullable(
          s.string(
            "Opaque pagination.next_page_token from this endpoint. Send it alone to continue the channel feed with its original settings. Tokens expire after one hour.\n\nSend next_page_token alone. The token preserves the channel, selected tab or search, sorting and locale. Use POST for long tokens. Stop when pagination.next_page_token is absent.",
            { minLength: 1, maxLength: 32768, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "YouTube Channel asynchronous parameters.",
      {
        channel_id: s.string(
          "Channel handle (with or without @) or a UC channel ID. Required on the first page; omit with next_page_token.\n\nRequired on the first page. Use a handle such as @veritasium or a UC channel ID; full URLs are not accepted.",
          { minLength: 1, maxLength: 100 },
        ),
        tab: s.withEnum(
          s.unknown(
            "Channel content tab. Defaults to videos. Omit when using search_query or next_page_token. Not every channel offers every tab.\n\nA channel without the requested tab returns an empty content group with search_information.tab_available set to false.",
          ),
          ["videos", "shorts", "streams", "podcasts", "playlists", "posts"],
        ),
        sort: s.withEnum(
          s.unknown(
            "videos, shorts and streams accept latest, popular or oldest; playlists accept dd (newest playlist) or lad (last video added). Omit with podcasts, posts, search_query or next_page_token.\n\nVideos, Shorts and streams default to latest. Playlists default to dd. Sorting uses the choices offered by YouTube.",
          ),
          ["latest", "popular", "oldest", "dd", "lad"],
        ),
        search_query: s.string(
          "Search within this channel for matching videos and playlists. Cannot be combined with tab or sort. Omit with next_page_token.\n\nOmit tab and sort when searching. Matching videos and playlists appear in search_results.",
          { minLength: 1, maxLength: 2048 },
        ),
        hl: s.string("Interface language, such as en or pt-BR. Defaults to en. Omit with next_page_token.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,2}$",
        }),
        gl: s.string("Two-letter country code. Defaults to US. Omit with next_page_token.", {
          pattern: "^[A-Za-z]{2}$",
        }),
        about: s.boolean(
          "Include additional public channel details, such as country, join date, total views and links. Defaults to false. Omit with next_page_token.\n\nChannel profile data is returned on the first page. about=true includes additional public details. Continuation pages return content only.",
        ),
        next_page_token: s.string(
          "Opaque pagination.next_page_token from this endpoint. Send it alone to continue the channel feed with its original settings. Tokens expire after one hour.\n\nSend next_page_token alone. The token preserves the channel, selected tab or search, sorting and locale. Use POST for long tokens. Stop when pagination.next_page_token is absent.",
          { minLength: 1, maxLength: 32768, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("YouTube Channel response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      search_information: s.looseObject("search information value.", {}),
      channel_results: s.nullable(s.looseObject("channel results value.", {})),
      videos_results: s.nullable(s.array("videos results value.", s.looseObject("videos results value. item.", {}))),
      shorts_results: s.nullable(s.array("shorts results value.", s.looseObject("shorts results value. item.", {}))),
      streams_results: s.nullable(s.array("streams results value.", s.looseObject("streams results value. item.", {}))),
      podcasts_results: s.nullable(
        s.array("podcasts results value.", s.looseObject("podcasts results value. item.", {})),
      ),
      playlists_results: s.nullable(
        s.array("playlists results value.", s.looseObject("playlists results value. item.", {})),
      ),
      posts_results: s.nullable(s.array("posts results value.", s.looseObject("posts results value. item.", {}))),
      search_results: s.nullable(
        s.array(
          "search results value.",
          s.anyOf("search results value. item.", [
            s.looseObject("search results value. item.", {}),
            s.looseObject("search results value. item.", {}),
          ]),
        ),
      ),
      filters: s.nullable(s.array("filters value.", s.looseObject("filters value. item.", {}))),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "youtube_search",
    path: "/api/youtube/search",
    description: "Search YouTube videos, channels, playlists and Shorts.",
    input: s.object(
      "YouTube Search parameters.",
      {
        type: s.nullable(
          s.withEnum(
            s.unknown(
              "Result type. Omit for mixed results. Movies appear in video_results.\n\nChannels and playlists cannot use upload_date, duration or features. Shorts cannot use duration. Movies cannot use live, subtitles, creative_commons or 3d features.",
            ),
            ["video", "shorts", "channel", "playlist", "movie"],
          ),
        ),
        upload_date: s.nullable(
          s.withEnum(s.unknown("Limit results by upload date."), ["today", "this_week", "this_month", "this_year"]),
        ),
        duration: s.nullable(
          s.withEnum(s.unknown("Video duration: under 3 minutes, 3–20 minutes, or over 20 minutes."), [
            "under_3_min",
            "between_3_and_20_min",
            "over_20_min",
          ]),
        ),
        features: s.nullable(
          s.string(
            "Comma-separated features: live, 4k, hd, subtitles, creative_commons, 360, vr180, 3d, hdr, location. Combined features must all match.",
            { minLength: 1, maxLength: 160 },
          ),
        ),
        sort_by: s.nullable(
          s.withEnum(
            s.unknown(
              "YouTube ranking: relevance (default) or popularity. Popularity is not a strict numerical view-count sort.\n\nUses YouTube's current ranking choices. The removed upload-date/rating sorts and last-hour upload filter are not supported named values.",
            ),
            ["relevance", "popularity"],
          ),
        ),
        q: s.nullable(
          s.string("Search query. Required for the first page; omit with page_token.\n\nRequired on the first page.", {
            minLength: 1,
            maxLength: 2048,
          }),
        ),
        hl: s.nullable(
          s.string("YouTube interface language, such as en or pt-BR. Defaults to en. Omit with page_token.", {
            pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,2}$",
          }),
        ),
        gl: s.nullable(
          s.string("Two-letter country code. Defaults to US. Omit with page_token.", {
            pattern: "^[A-Za-z]{2}$",
          }),
        ),
        sp: s.nullable(
          s.string(
            "Advanced YouTube filter token from a results URL. Use either sp or named filters, never both. Omit with page_token.\n\nUse either sp or named filters, never both. Raw or once-URL-encoded values from a YouTube results URL are accepted.",
            { minLength: 1, maxLength: 2048, pattern: "^[a-zA-Z0-9_+/=%-]+$" },
          ),
        ),
        page_token: s.nullable(
          s.string(
            "Opaque next_page_token from the preceding response. Send it alone to continue the same search; tokens expire after one hour.\n\nSend page_token alone, without query, locale or filter parameters. It preserves all filters. Use POST for long tokens. Pagination ends when pagination.next_page_token is absent.",
            { minLength: 1, maxLength: 32768, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "YouTube Search asynchronous parameters.",
      {
        type: s.withEnum(
          s.unknown(
            "Result type. Omit for mixed results. Movies appear in video_results.\n\nChannels and playlists cannot use upload_date, duration or features. Shorts cannot use duration. Movies cannot use live, subtitles, creative_commons or 3d features.",
          ),
          ["video", "shorts", "channel", "playlist", "movie"],
        ),
        upload_date: s.withEnum(s.unknown("Limit results by upload date."), [
          "today",
          "this_week",
          "this_month",
          "this_year",
        ]),
        duration: s.withEnum(s.unknown("Video duration: under 3 minutes, 3–20 minutes, or over 20 minutes."), [
          "under_3_min",
          "between_3_and_20_min",
          "over_20_min",
        ]),
        features: s.string(
          "Comma-separated features: live, 4k, hd, subtitles, creative_commons, 360, vr180, 3d, hdr, location. Combined features must all match.",
          { minLength: 1, maxLength: 160 },
        ),
        sort_by: s.withEnum(
          s.unknown(
            "YouTube ranking: relevance (default) or popularity. Popularity is not a strict numerical view-count sort.\n\nUses YouTube's current ranking choices. The removed upload-date/rating sorts and last-hour upload filter are not supported named values.",
          ),
          ["relevance", "popularity"],
        ),
        q: s.string("Search query. Required for the first page; omit with page_token.\n\nRequired on the first page.", {
          minLength: 1,
          maxLength: 2048,
        }),
        hl: s.string("YouTube interface language, such as en or pt-BR. Defaults to en. Omit with page_token.", {
          pattern: "^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8}){0,2}$",
        }),
        gl: s.string("Two-letter country code. Defaults to US. Omit with page_token.", {
          pattern: "^[A-Za-z]{2}$",
        }),
        sp: s.string(
          "Advanced YouTube filter token from a results URL. Use either sp or named filters, never both. Omit with page_token.\n\nUse either sp or named filters, never both. Raw or once-URL-encoded values from a YouTube results URL are accepted.",
          { minLength: 1, maxLength: 2048, pattern: "^[a-zA-Z0-9_+/=%-]+$" },
        ),
        page_token: s.string(
          "Opaque next_page_token from the preceding response. Send it alone to continue the same search; tokens expire after one hour.\n\nSend page_token alone, without query, locale or filter parameters. It preserves all filters. Use POST for long tokens. Pagination ends when pagination.next_page_token is absent.",
          { minLength: 1, maxLength: 32768, pattern: "^ct2_[A-Za-z0-9_-]{100,}$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("YouTube Search response.", {
      search_metadata: s.looseObject("search metadata value.", {}),
      search_parameters: s.looseObject("search parameters value.", {}),
      search_information: s.looseObject("search information value.", {}),
      video_results: s.array("video results value.", s.looseObject("video results value. item.", {})),
      channel_results: s.array("channel results value.", s.looseObject("channel results value. item.", {})),
      playlist_results: s.array("playlist results value.", s.looseObject("playlist results value. item.", {})),
      shorts_results: s.array("shorts results value.", s.looseObject("shorts results value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
