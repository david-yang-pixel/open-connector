import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const tiktokTools: DataTool[] = [
  {
    name: "tiktok_collection_videos",
    path: "/api/tiktok/collection-videos",
    description: "Page through posts saved in a public TikTok collection. This upstream API is Alpha.",
    input: s.object(
      "TikTok Collection Videos parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.nullable(
          s.string("Public TikTok collection URL; supply this or collection_id.", {
            maxLength: 2048,
          }),
        ),
        collection_id: s.nullable(
          s.string("Numeric public saved-collection ID; supply this or url.", {
            pattern: "^[0-9]{1,25}$",
          }),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Collection Videos asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.string("Public TikTok collection URL; supply this or collection_id.", {
          maxLength: 2048,
        }),
        collection_id: s.string("Numeric public saved-collection ID; supply this or url.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Collection Videos response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_comment_replies",
    path: "/api/tiktok/comment-replies",
    description: "Page through replies to a TikTok comment. This upstream API is Alpha.",
    input: s.object(
      "TikTok Comment Replies parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.nullable(s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", { maxLength: 2048 })),
        video_id: s.nullable(s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" })),
        comment_id: s.string("ID of the parent TikTok comment; obtain cid from the comments endpoint.", {
          pattern: "^[0-9]{1,25}$",
        }),
      },
      { required: ["comment_id"] },
    ),
    asyncInput: s.object(
      "TikTok Comment Replies asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", {
          maxLength: 2048,
        }),
        video_id: s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" }),
        comment_id: s.string("ID of the parent TikTok comment; obtain cid from the comments endpoint.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["comment_id"] },
    ),
    output: s.looseObject("TikTok Comment Replies response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      comments: s.array("Public comments or replies in upstream order.", s.looseObject("comments value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_comments",
    path: "/api/tiktok/comments",
    description: "Page through public comments on a TikTok post. This upstream API is Alpha.",
    input: s.object(
      "TikTok Comments parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.nullable(s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", { maxLength: 2048 })),
        video_id: s.nullable(s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Comments asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        url: s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", {
          maxLength: 2048,
        }),
        video_id: s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Comments response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      comments: s.array("Public comments or replies in upstream order.", s.looseObject("comments value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_followers",
    path: "/api/tiktok/followers",
    description: "Page through public followers of a TikTok user. This upstream API is Alpha.",
    input: s.object(
      "TikTok Followers parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.nullable(
          s.string("Public TikTok handle, with or without @; supply this or user_id.", {
            pattern: "^@?[A-Za-z0-9_.]{1,24}$",
          }),
        ),
        user_id: s.nullable(s.string("Numeric TikTok user ID; supply this or handle.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Followers asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.string("Public TikTok handle, with or without @; supply this or user_id.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
        user_id: s.string("Numeric TikTok user ID; supply this or handle.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Followers response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      users: s.array("Public user and statistics records in upstream order.", s.looseObject("users value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_following",
    path: "/api/tiktok/following",
    description: "Page through the public accounts a TikTok user follows. This upstream API is Alpha.",
    input: s.object(
      "TikTok Following parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.nullable(
          s.string("Public TikTok handle, with or without @; supply this or user_id.", {
            pattern: "^@?[A-Za-z0-9_.]{1,24}$",
          }),
        ),
        user_id: s.nullable(s.string("Numeric TikTok user ID; supply this or handle.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Following asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.string("Public TikTok handle, with or without @; supply this or user_id.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
        user_id: s.string("Numeric TikTok user ID; supply this or handle.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Following response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      users: s.array("Public user and statistics records in upstream order.", s.looseObject("users value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_live",
    path: "/api/tiktok/live",
    description: "Get a TikTok live room's status and metrics. This upstream API is Alpha.",
    input: s.object(
      "TikTok Live Room parameters.",
      {
        room_id: s.string("Numeric TikTok live-room ID, obtainable from user-live.", {
          pattern: "^[0-9]{1,25}$",
        }),
      },
      { required: ["room_id"] },
    ),
    asyncInput: s.object(
      "TikTok Live Room asynchronous parameters.",
      {
        room_id: s.string("Numeric TikTok live-room ID, obtainable from user-live.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["room_id"] },
    ),
    output: s.looseObject("TikTok Live Room response.", {
      room: s.looseObject("Public room data including status, owner, metrics and stream metadata.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_profile",
    path: "/api/tiktok/profile",
    description:
      "Get public TikTok profile fields and statistics by handle or numeric user ID. This upstream API is Alpha.",
    input: s.object(
      "TikTok Profile parameters.",
      {
        handle: s.nullable(
          s.string("Public TikTok handle, with or without @; supply this or user_id.", {
            pattern: "^@?[A-Za-z0-9_.]{1,24}$",
          }),
        ),
        user_id: s.nullable(s.string("Numeric TikTok user ID; supply this or handle.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Profile asynchronous parameters.",
      {
        handle: s.string("Public TikTok handle, with or without @; supply this or user_id.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
        user_id: s.string("Numeric TikTok user ID; supply this or handle.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Profile response.", {
      user: s.looseObject("TikTok's public user fields, preserving upstream names.", {}),
      stats: s.looseObject("Public follower, following, heart and video counts.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_profile_videos",
    path: "/api/tiktok/profile-videos",
    description:
      "Page through posts from a public TikTok profile by handle or numeric user ID. This upstream API is Alpha.",
    input: s.object(
      "TikTok Profile Videos parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.nullable(
          s.string("Public TikTok handle, with or without @; supply this or user_id.", {
            pattern: "^@?[A-Za-z0-9_.]{1,24}$",
          }),
        ),
        user_id: s.nullable(s.string("Numeric TikTok user ID; supply this or handle.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Profile Videos asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        handle: s.string("Public TikTok handle, with or without @; supply this or user_id.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
        user_id: s.string("Numeric TikTok user ID; supply this or handle.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Profile Videos response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_search_hashtag",
    path: "/api/tiktok/search-hashtag",
    description: "Resolve a public hashtag and page through its posts. This upstream API is Alpha.",
    input: s.object(
      "TikTok Search Hashtag parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        hashtag: s.string("TikTok hashtag name, with or without the leading #.", {
          minLength: 1,
          maxLength: 100,
          pattern: "^#?[^\\s#/&?=]+$",
        }),
      },
      { required: ["hashtag"] },
    ),
    asyncInput: s.object(
      "TikTok Search Hashtag asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        hashtag: s.string("TikTok hashtag name, with or without the leading #.", {
          minLength: 1,
          maxLength: 100,
          pattern: "^#?[^\\s#/&?=]+$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["hashtag"] },
    ),
    output: s.looseObject("TikTok Search Hashtag response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_search_keyword",
    path: "/api/tiktok/search-keyword",
    description:
      "Search public TikTok posts by keyword with pagination and search-session IDs. This upstream API is Alpha.",
    input: s.object(
      "TikTok Search Keyword parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        query: s.string("TikTok video search query.", { minLength: 1, maxLength: 500 }),
        search_id: s.nullable(
          s.string("Upstream search session ID from the preceding page, when supplied.", {
            pattern: "^[A-Za-z0-9_-]{1,128}$",
          }),
        ),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "TikTok Search Keyword asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        query: s.string("TikTok video search query.", { minLength: 1, maxLength: 500 }),
        search_id: s.string("Upstream search session ID from the preceding page, when supplied.", {
          pattern: "^[A-Za-z0-9_-]{1,128}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("TikTok Search Keyword response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      search_id: s.nullable(s.string("Upstream search session ID to send with the next cursor when present.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_search_suggestions",
    path: "/api/tiktok/search-suggestions",
    description: "Get public TikTok autocomplete suggestions in order. This upstream API is Alpha.",
    input: s.object(
      "TikTok Search Suggestions parameters.",
      {
        query: s.string("Search text for TikTok autocomplete suggestions.", {
          minLength: 1,
          maxLength: 500,
        }),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "TikTok Search Suggestions asynchronous parameters.",
      {
        query: s.string("Search text for TikTok autocomplete suggestions.", {
          minLength: 1,
          maxLength: 500,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("TikTok Search Suggestions response.", {
      suggestions: s.array(
        "Suggestion records in TikTok's returned order.",
        s.looseObject("suggestions value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_search_top",
    path: "/api/tiktok/search-top",
    description: "Get TikTok's top search results. This upstream API is Alpha.",
    input: s.object(
      "TikTok Search Top parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        query: s.string("TikTok video search query.", { minLength: 1, maxLength: 500 }),
        search_id: s.nullable(
          s.string("Upstream search session ID from the preceding page, when supplied.", {
            pattern: "^[A-Za-z0-9_-]{1,128}$",
          }),
        ),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "TikTok Search Top asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        query: s.string("TikTok video search query.", { minLength: 1, maxLength: 500 }),
        search_id: s.string("Upstream search session ID from the preceding page, when supplied.", {
          pattern: "^[A-Za-z0-9_-]{1,128}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("TikTok Search Top response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      results: s.array(
        "Top-search result wrappers in upstream order, including each record's type and content.",
        s.looseObject("results value. item.", {}),
      ),
      search_id: s.nullable(s.string("Upstream search session ID to send with the next cursor when present.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_song",
    path: "/api/tiktok/song",
    description: "Get a TikTok sound's details and usage count. This upstream API is Alpha.",
    input: s.object(
      "TikTok Song parameters.",
      {
        clip_id: s.string("TikTok music clip ID, the numeric suffix of a /music/ URL.", {
          pattern: "^[0-9]{1,25}$",
        }),
      },
      { required: ["clip_id"] },
    ),
    asyncInput: s.object(
      "TikTok Song asynchronous parameters.",
      {
        clip_id: s.string("TikTok music clip ID, the numeric suffix of a /music/ URL.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["clip_id"] },
    ),
    output: s.looseObject("TikTok Song response.", {
      music: s.looseObject(
        "Public music embed details, including clip ID, artist, cover and usage count when available.",
        {},
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_song_videos",
    path: "/api/tiktok/song-videos",
    description: "Page through TikTok posts that use a sound. This upstream API is Alpha.",
    input: s.object(
      "TikTok Song Videos parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        clip_id: s.string("Numeric TikTok music clip ID, the suffix of a /music/ URL.", {
          pattern: "^[0-9]{1,25}$",
        }),
      },
      { required: ["clip_id"] },
    ),
    asyncInput: s.object(
      "TikTok Song Videos asynchronous parameters.",
      {
        cursor: s.anyOf("Upstream pagination cursor from the preceding response; 0 starts a new feed.", [
          s.string("Upstream pagination cursor from the preceding response; 0 starts a new feed.", {
            pattern: "^[0-9]{1,25}$",
          }),
          s.integer("Upstream pagination cursor from the preceding response; 0 starts a new feed.", { minimum: 0 }),
        ]),
        count: s.integer("Requested page size, between 1 and 35.", { minimum: 1, maximum: 35 }),
        clip_id: s.string("Numeric TikTok music clip ID, the suffix of a /music/ URL.", {
          pattern: "^[0-9]{1,25}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["clip_id"] },
    ),
    output: s.looseObject("TikTok Song Videos response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_transcript",
    path: "/api/tiktok/transcript",
    description: "Get public TikTok captions with timed segments. This upstream API is Alpha.",
    input: s.object(
      "TikTok Transcript parameters.",
      {
        url: s.nullable(s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", { maxLength: 2048 })),
        video_id: s.nullable(s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" })),
        language: s.nullable(
          s.string("Caption language code, for example eng-US. Defaults to the first available track.", {
            pattern: "^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$",
          }),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Transcript asynchronous parameters.",
      {
        url: s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", {
          maxLength: 2048,
        }),
        video_id: s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" }),
        language: s.string("Caption language code, for example eng-US. Defaults to the first available track.", {
          pattern: "^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Transcript response.", {
      language: s.string("Language code of the selected upstream subtitle track."),
      text: s.string("Caption text joined in track order."),
      segments: s.array("Timed caption cues in upstream order.", s.looseObject("segments value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_trending_feed",
    path: "/api/tiktok/trending-feed",
    description: "Get TikTok's trending feed. This upstream API is Alpha.",
    input: s.object(
      "TikTok Trending Feed parameters.",
      {
        count: s.integer("Requested number of recommended posts, between 1 and 35.", {
          minimum: 1,
          maximum: 35,
        }),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Trending Feed asynchronous parameters.",
      {
        count: s.integer("Requested number of recommended posts, between 1 and 35.", {
          minimum: 1,
          maximum: 35,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Trending Feed response.", {
      has_more: s.boolean("Whether TikTok reports additional results for this list."),
      cursor: s.nullable(s.string("Upstream cursor for the next page; pass it unchanged to the same endpoint.")),
      total: s.nullable(
        s.integer("Total reported by TikTok when supplied, which may differ from globally available results."),
      ),
      items: s.array(
        "Public post metadata in upstream order, preserving upstream field names.",
        s.looseObject("items value. item.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_user_live",
    path: "/api/tiktok/user-live",
    description: "Get a TikTok user's live status and room metadata. This upstream API is Alpha.",
    input: s.object(
      "TikTok User Live parameters.",
      {
        handle: s.string("Public TikTok handle, with or without the leading @.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "TikTok User Live asynchronous parameters.",
      {
        handle: s.string("Public TikTok handle, with or without the leading @.", {
          pattern: "^@?[A-Za-z0-9_.]{1,24}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("TikTok User Live response.", {
      is_live: s.boolean("Whether TikTok reports the room as currently broadcasting (status 2)."),
      user: s.looseObject("Public user details from the live page.", {}),
      room: s.nullable(s.looseObject("Room metadata when TikTok supplies it.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "tiktok_video",
    path: "/api/tiktok/video",
    description: "Get a TikTok video or photo post with its media and metrics. This upstream API is Alpha.",
    input: s.object(
      "TikTok Video parameters.",
      {
        url: s.nullable(s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", { maxLength: 2048 })),
        video_id: s.nullable(s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" })),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "TikTok Video asynchronous parameters.",
      {
        url: s.string("TikTok video, photo/slideshow or vm/vt short-link URL.", {
          maxLength: 2048,
        }),
        video_id: s.string("TikTok post ID; supply this or url.", { pattern: "^[0-9]{1,25}$" }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("TikTok Video response.", {
      item: s.looseObject("Full public post metadata, including author, media and metrics.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
