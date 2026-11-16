import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const xTools: DataTool[] = [
  {
    name: "x_community",
    path: "/api/x/community",
    description: "Get X community details, including its creator, member count and rules. This upstream API is Alpha.",
    input: s.object(
      "X Community parameters.",
      {
        community_id: s.string("Numeric X community ID as a string.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
      },
      { required: ["community_id"] },
    ),
    asyncInput: s.object(
      "X Community asynchronous parameters.",
      {
        community_id: s.string("Numeric X community ID as a string.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["community_id"] },
    ),
    output: s.looseObject("X Community response.", {
      community: s.looseObject("community value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "x_community_posts",
    path: "/api/x/community-posts",
    description: "Get posts from an X community, including authors, engagement and media. This upstream API is Alpha.",
    input: s.object(
      "X Community Posts parameters.",
      {
        community_id: s.string("Numeric X community ID as a string, from its /i/communities/ URL.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
      },
      { required: ["community_id"] },
    ),
    asyncInput: s.object(
      "X Community Posts asynchronous parameters.",
      {
        community_id: s.string("Numeric X community ID as a string, from its /i/communities/ URL.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["community_id"] },
    ),
    output: s.looseObject("X Community Posts response.", {
      community_id: s.string("community id value."),
      posts: s.array("posts value.", s.looseObject("posts value. item.", {})),
      order: s.literal("ranked", {
        description: "X's ranked public preview; no chronological ordering or pagination.",
      }),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "x_post",
    path: "/api/x/post",
    description: "Get an X post with its text, author, engagement counts and media. This upstream API is Alpha.",
    input: s.object(
      "X Post parameters.",
      {
        post_id: s.string("Numeric X post ID as a string, taken from its /status/ URL.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
      },
      { required: ["post_id"] },
    ),
    asyncInput: s.object(
      "X Post asynchronous parameters.",
      {
        post_id: s.string("Numeric X post ID as a string, taken from its /status/ URL.", {
          pattern: "^[1-9][0-9]{0,19}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["post_id"] },
    ),
    output: s.looseObject("X Post response.", {
      post: s.looseObject("post value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "x_profile",
    path: "/api/x/profile",
    description:
      "Get a public X profile, including its bio, follower counts and profile images. This upstream API is Alpha.",
    input: s.object(
      "X Profile parameters.",
      {
        username: s.string("X username, with or without a leading @. Profile URLs are not accepted.", {
          pattern: "^[A-Za-z0-9_]{1,15}$",
        }),
      },
      { required: ["username"] },
    ),
    asyncInput: s.object(
      "X Profile asynchronous parameters.",
      {
        username: s.string("X username, with or without a leading @. Profile URLs are not accepted.", {
          pattern: "^[A-Za-z0-9_]{1,15}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["username"] },
    ),
    output: s.looseObject("X Profile response.", {
      profile: s.looseObject("profile value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "x_user_posts",
    path: "/api/x/user-posts",
    description: "Get posts from an X user. This upstream API is Alpha.",
    input: s.object(
      "X User Posts parameters.",
      {
        username: s.string("X username, with or without a leading @. Profile URLs are not accepted.", {
          pattern: "^[A-Za-z0-9_]{1,15}$",
        }),
        cursor: s.nullable(
          s.string("Continuation cursor returned for the same username.", {
            minLength: 1,
            maxLength: 4096,
            pattern: "^[A-Za-z0-9_+/=-]+$",
          }),
        ),
      },
      { required: ["username"] },
    ),
    asyncInput: s.object(
      "X User Posts asynchronous parameters.",
      {
        username: s.string("X username, with or without a leading @. Profile URLs are not accepted.", {
          pattern: "^[A-Za-z0-9_]{1,15}$",
        }),
        cursor: s.string("Continuation cursor returned for the same username.", {
          minLength: 1,
          maxLength: 4096,
          pattern: "^[A-Za-z0-9_+/=-]+$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["username"] },
    ),
    output: s.looseObject("X User Posts response.", {
      posts: s.array("posts value.", s.looseObject("posts value. item.", {})),
      pagination: s.looseObject("pagination value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
