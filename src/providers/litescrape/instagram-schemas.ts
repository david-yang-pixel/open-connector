import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const instagramTools: DataTool[] = [
  {
    name: "instagram_embed",
    path: "/api/instagram/embed",
    description: "Retrieve public Instagram embed data. This upstream API is Alpha.",
    input: s.object(
      "Instagram Embed parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "Instagram Embed asynchronous parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("Instagram Embed response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "instagram_post",
    path: "/api/instagram/post",
    description: "Retrieve public Instagram post data. This upstream API is Alpha.",
    input: s.object(
      "Instagram Post parameters.",
      {
        url: s.string("HTTPS Instagram post, reel or TV URL."),
        trim: s.boolean("Return compact media details."),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Instagram Post asynchronous parameters.",
      {
        url: s.string("HTTPS Instagram post, reel or TV URL."),
        trim: s.boolean("Return compact media details."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Instagram Post response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "instagram_posts",
    path: "/api/instagram/posts",
    description: "Retrieve public Instagram posts data. This upstream API is Alpha.",
    input: s.object(
      "Instagram Posts parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        trim: s.boolean("Return a compact profile containing public identity and counts."),
        next_max_id: s.nullable(s.string("next_max_id from the previous page.", { minLength: 1, maxLength: 8192 })),
        num: s.integer("Maximum number of posts requested from Instagram.", {
          minimum: 1,
          maximum: 50,
        }),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "Instagram Posts asynchronous parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        trim: s.boolean("Return a compact profile containing public identity and counts."),
        next_max_id: s.string("next_max_id from the previous page.", {
          minLength: 1,
          maxLength: 8192,
        }),
        num: s.integer("Maximum number of posts requested from Instagram.", {
          minimum: 1,
          maximum: 50,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("Instagram Posts response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "instagram_profile",
    path: "/api/instagram/profile",
    description: "Retrieve public Instagram profile data. This upstream API is Alpha.",
    input: s.object(
      "Instagram Profile parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        trim: s.boolean("Return a compact profile containing public identity and counts."),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "Instagram Profile asynchronous parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        trim: s.boolean("Return a compact profile containing public identity and counts."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("Instagram Profile response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "instagram_profile_post_count",
    path: "/api/instagram/profile-post-count",
    description: "Retrieve public Instagram profile post count data. This upstream API is Alpha.",
    input: s.object(
      "Instagram Profile Post Count parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "Instagram Profile Post Count asynchronous parameters.",
      {
        handle: s.string("Instagram username without @.", { pattern: "^[A-Za-z0-9_.]{1,30}$" }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("Instagram Profile Post Count response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "instagram_search_popular",
    path: "/api/instagram/search-popular",
    description: "Get popular Instagram posts for a search topic. This upstream API is Alpha.",
    input: s.object(
      "Instagram Search Popular parameters.",
      {
        query: s.string("Popular topic text or URL slug; spaces become hyphens.", {
          minLength: 1,
          maxLength: 200,
        }),
        cursor: s.nullable(
          s.string("Opaque cursor returned by search-popular for the same query.", {
            minLength: 1,
            maxLength: 8192,
          }),
        ),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Instagram Search Popular asynchronous parameters.",
      {
        query: s.string("Popular topic text or URL slug; spaces become hyphens.", {
          minLength: 1,
          maxLength: 200,
        }),
        cursor: s.string("Opaque cursor returned by search-popular for the same query.", {
          minLength: 1,
          maxLength: 8192,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Instagram Search Popular response.", {
      query: s.nullable(s.string("query value.")),
      title: s.nullable(s.string("title value.")),
      total_media_count: s.nullable(s.integer("total media count value.")),
      description: s.nullable(s.looseObject("description value.", {})),
      suggested_terms: s.nullable(s.array("suggested terms value.", s.string("suggested terms value. item."))),
      posts: s.nullable(s.array("posts value.", s.unknown("posts value. item."))),
      sections: s.nullable(s.array("sections value.", s.unknown("sections value. item."))),
      data: s.nullable(s.looseObject("data value.", {})),
      items: s.nullable(s.array("items value.", s.unknown("items value. item."))),
      next_max_id: s.nullable(s.string("next max id value.")),
      cursor: s.nullable(s.string("cursor value.")),
      has_more: s.nullable(s.boolean("has more value.")),
      handle: s.nullable(s.string("handle value.")),
      media_count: s.nullable(s.integer("media count value.")),
      is_estimated: s.nullable(s.boolean("is estimated value.")),
      html: s.nullable(s.string("html value.")),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
