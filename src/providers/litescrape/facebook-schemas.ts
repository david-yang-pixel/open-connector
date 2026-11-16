import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const facebookTools: DataTool[] = [
  {
    name: "facebook_hashtag_posts",
    path: "/api/facebook/hashtag-posts",
    description: "Get public Facebook posts for a hashtag. This upstream API is Alpha.",
    input: s.object(
      "Facebook Hashtag Posts parameters.",
      {
        tag: s.string("Hashtag made of letters, digits or underscores, with an optional leading #.", {
          pattern: "^#?[A-Za-z0-9_]{1,100}$",
        }),
        limit: s.integer("Maximum posts per response; fewer may be available.", {
          minimum: 1,
          maximum: 20,
        }),
        continuation_token: s.nullable(
          s.string(
            "Token from pagination.continuation_token in the preceding response. Keep the same hashtag; limit may change. Tokens can expire.",
            { minLength: 1, maxLength: 32768 },
          ),
        ),
      },
      { required: ["tag"] },
    ),
    asyncInput: s.object(
      "Facebook Hashtag Posts asynchronous parameters.",
      {
        tag: s.string("Hashtag made of letters, digits or underscores, with an optional leading #.", {
          pattern: "^#?[A-Za-z0-9_]{1,100}$",
        }),
        limit: s.integer("Maximum posts per response; fewer may be available.", {
          minimum: 1,
          maximum: 20,
        }),
        continuation_token: s.string(
          "Token from pagination.continuation_token in the preceding response. Keep the same hashtag; limit may change. Tokens can expire.",
          { minLength: 1, maxLength: 32768 },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["tag"] },
    ),
    output: s.looseObject("Facebook Hashtag Posts response.", {
      source_url: s.string("Public page URL associated with these results."),
      coverage: s.withEnum(s.unknown("Whether this response starts the feed or continues it."), [
        "initial",
        "continuation",
      ]),
      incomplete: s.boolean("Whether some results or fields could not be returned."),
      posts: s.array("posts value.", s.looseObject("posts value. item.", {})),
      pagination: s.nullable(s.looseObject("Whether more posts can be requested and the token to continue.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_marketplace_browse",
    path: "/api/facebook/marketplace-browse",
    description: "Browse or search Facebook Marketplace listings by city. This upstream API is Alpha.",
    input: s.object(
      "Facebook Marketplace Browse parameters.",
      {
        limit: s.integer("Maximum listings per response; fewer may be available.", {
          minimum: 1,
          maximum: 26,
        }),
        location: s.nullable(
          s.string(
            "Marketplace city slug or numeric city ID, such as austin or london. Required for keyword search and radius filtering.",
            { pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$" },
          ),
        ),
        query: s.nullable(
          s.string("Listing search keywords. Supply location to keep the search geography fixed.", {
            minLength: 1,
            maxLength: 200,
            pattern: "^\\S(?:.*\\S)?$",
          }),
        ),
        radius_km: s.nullable(
          s.integer(
            "Search radius in kilometers, from 1 to 500. Requires location; defaults to 65 km when omitted. Shipped or promoted listings may fall outside this radius.",
            { minimum: 1, maximum: 500 },
          ),
        ),
        min_price: s.nullable(
          s.number("Minimum listing price in local currency units. Requires query and location.", {
            minimum: 0,
            maximum: 10000000,
          }),
        ),
        max_price: s.nullable(
          s.number("Maximum listing price in local currency units, at least min_price. Requires query and location.", {
            minimum: 0,
            maximum: 10000000,
          }),
        ),
        sort_by: s.nullable(
          s.withEnum(
            s.unknown("Search ordering: lowest price, highest price or newest listings. Requires query and location."),
            ["price_ascend", "price_descend", "creation_time_descend"],
          ),
        ),
        condition: s.nullable(
          s.withEnum(s.unknown("Item condition for keyword search. Requires query and location."), [
            "new",
            "used_like_new",
            "used_good",
            "used_fair",
          ]),
        ),
        days_since_listed: s.nullable(
          s.integer("Restrict keyword search to recent listings, from 1 to 30 days. Requires query and location.", {
            minimum: 1,
            maximum: 30,
          }),
        ),
        continuation_token: s.nullable(
          s.string(
            "Token from pagination.continuation_token in the preceding response. Repeat the same query, location and filters; limit may change. Keyword search only. Later requests may fail or be rate limited.",
            { minLength: 1, maxLength: 32768, pattern: "^m1\\.[A-Za-z0-9_-]+$" },
          ),
        ),
      },
      { required: [] },
    ),
    asyncInput: s.object(
      "Facebook Marketplace Browse asynchronous parameters.",
      {
        limit: s.integer("Maximum listings per response; fewer may be available.", {
          minimum: 1,
          maximum: 26,
        }),
        location: s.string(
          "Marketplace city slug or numeric city ID, such as austin or london. Required for keyword search and radius filtering.",
          { pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$" },
        ),
        query: s.string("Listing search keywords. Supply location to keep the search geography fixed.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S(?:.*\\S)?$",
        }),
        radius_km: s.integer(
          "Search radius in kilometers, from 1 to 500. Requires location; defaults to 65 km when omitted. Shipped or promoted listings may fall outside this radius.",
          { minimum: 1, maximum: 500 },
        ),
        min_price: s.number("Minimum listing price in local currency units. Requires query and location.", {
          minimum: 0,
          maximum: 10000000,
        }),
        max_price: s.number(
          "Maximum listing price in local currency units, at least min_price. Requires query and location.",
          { minimum: 0, maximum: 10000000 },
        ),
        sort_by: s.withEnum(
          s.unknown("Search ordering: lowest price, highest price or newest listings. Requires query and location."),
          ["price_ascend", "price_descend", "creation_time_descend"],
        ),
        condition: s.withEnum(s.unknown("Item condition for keyword search. Requires query and location."), [
          "new",
          "used_like_new",
          "used_good",
          "used_fair",
        ]),
        days_since_listed: s.integer(
          "Restrict keyword search to recent listings, from 1 to 30 days. Requires query and location.",
          { minimum: 1, maximum: 30 },
        ),
        continuation_token: s.string(
          "Token from pagination.continuation_token in the preceding response. Repeat the same query, location and filters; limit may change. Keyword search only. Later requests may fail or be rate limited.",
          { minLength: 1, maxLength: 32768, pattern: "^m1\\.[A-Za-z0-9_-]+$" },
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: [] },
    ),
    output: s.looseObject("Facebook Marketplace Browse response.", {
      source_url: s.string("Public page URL associated with these results."),
      coverage: s.withEnum(
        s.unknown("Whether this response contains initial results or continues an earlier request."),
        ["initial", "continuation"],
      ),
      incomplete: s.boolean("Whether some results or fields could not be returned."),
      listings: s.array("listings value.", s.looseObject("listings value. item.", {})),
      applied_filters: s.nullable(s.looseObject("Filters, location and radius applied to the search.", {})),
      pagination: s.nullable(
        s.looseObject("Continuation state for keyword search. Further results may be unavailable or rate limited.", {}),
      ),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_page_posts",
    path: "/api/facebook/page-posts",
    description: "Get recent public posts from a Facebook Page. This upstream API is Alpha.",
    input: s.object(
      "Facebook Page Posts parameters.",
      {
        handle: s.string("Public page handle without a URL, such as NASA.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$",
        }),
      },
      { required: ["handle"] },
    ),
    asyncInput: s.object(
      "Facebook Page Posts asynchronous parameters.",
      {
        handle: s.string("Public page handle without a URL, such as NASA.", {
          pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["handle"] },
    ),
    output: s.looseObject("Facebook Page Posts response.", {
      source_url: s.string("Public page URL associated with these results."),
      coverage: s.literal("initial", {
        description: "This response contains the initial results only.",
      }),
      incomplete: s.boolean("Whether some results or fields could not be returned."),
      posts: s.array("posts value.", s.looseObject("posts value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_post",
    path: "/api/facebook/post",
    description: "Get a public Facebook post by its URL. This upstream API is Alpha.",
    input: s.object(
      "Facebook Post Details parameters.",
      {
        url: s.string("Public www.facebook.com post permalink containing a page and post identifier.", {
          maxLength: 400,
          pattern: "^https://www\\.facebook\\.com/[A-Za-z0-9][A-Za-z0-9._-]*/posts/(?:[0-9]+|pfbid[A-Za-z0-9]+)/?$",
        }),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Facebook Post Details asynchronous parameters.",
      {
        url: s.string("Public www.facebook.com post permalink containing a page and post identifier.", {
          maxLength: 400,
          pattern: "^https://www\\.facebook\\.com/[A-Za-z0-9][A-Za-z0-9._-]*/posts/(?:[0-9]+|pfbid[A-Za-z0-9]+)/?$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Facebook Post Details response.", {
      source_url: s.string("source url value."),
      post: s.looseObject("post value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_reel",
    path: "/api/facebook/reel",
    description: "Get a public Facebook reel by its URL. This upstream API is Alpha.",
    input: s.object(
      "Facebook Reel Details parameters.",
      {
        url: s.string("Public reel address in the form https://www.facebook.com/reel/123456789/.", {
          maxLength: 150,
          pattern: "^https://www\\.facebook\\.com/reel/[0-9]{1,30}/?$",
        }),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Facebook Reel Details asynchronous parameters.",
      {
        url: s.string("Public reel address in the form https://www.facebook.com/reel/123456789/.", {
          maxLength: 150,
          pattern: "^https://www\\.facebook\\.com/reel/[0-9]{1,30}/?$",
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Facebook Reel Details response.", {
      source_url: s.string("source url value."),
      reel: s.looseObject("reel value.", {}),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_search_pages",
    path: "/api/facebook/search-pages",
    description: "Search public Facebook Pages by name. This upstream API is Alpha.",
    input: s.object(
      "Facebook Search Pages parameters.",
      {
        query: s.string("Page name or phrase to look up.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S(?:.*\\S)?$",
        }),
        limit: s.integer("Maximum Page suggestions per response; fewer may be available.", {
          minimum: 1,
          maximum: 15,
        }),
        country: s.string(
          "Two-letter country preference for Page suggestions, such as US, GB or CA. Does not restrict a Page's location.",
          { pattern: "^[A-Z]{2}$" },
        ),
        ad_type: s.withEnum(s.unknown("Ad category for Page suggestions: all ads or political and issue ads."), [
          "ALL",
          "POLITICAL_AND_ISSUE_ADS",
        ]),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Facebook Search Pages asynchronous parameters.",
      {
        query: s.string("Page name or phrase to look up.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S(?:.*\\S)?$",
        }),
        limit: s.integer("Maximum Page suggestions per response; fewer may be available.", {
          minimum: 1,
          maximum: 15,
        }),
        country: s.string(
          "Two-letter country preference for Page suggestions, such as US, GB or CA. Does not restrict a Page's location.",
          { pattern: "^[A-Z]{2}$" },
        ),
        ad_type: s.withEnum(s.unknown("Ad category for Page suggestions: all ads or political and issue ads."), [
          "ALL",
          "POLITICAL_AND_ISSUE_ADS",
        ]),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Facebook Search Pages response.", {
      source_url: s.string("source url value."),
      source: s.literal("page_suggestions", {
        description: "source value.",
      }),
      pages: s.array("pages value.", s.looseObject("pages value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "facebook_search_profiles",
    path: "/api/facebook/search-profiles",
    description: "Search public Facebook profiles by name. This upstream API is Alpha.",
    input: s.object(
      "Facebook Search Profiles parameters.",
      {
        query: s.string("Name to search for.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S(?:.*\\S)?$",
        }),
        limit: s.integer("Maximum profiles per response; fewer may be available.", {
          minimum: 1,
          maximum: 12,
        }),
      },
      { required: ["query"] },
    ),
    asyncInput: s.object(
      "Facebook Search Profiles asynchronous parameters.",
      {
        query: s.string("Name to search for.", {
          minLength: 1,
          maxLength: 200,
          pattern: "^\\S(?:.*\\S)?$",
        }),
        limit: s.integer("Maximum profiles per response; fewer may be available.", {
          minimum: 1,
          maximum: 12,
        }),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["query"] },
    ),
    output: s.looseObject("Facebook Search Profiles response.", {
      source_url: s.string("Public page URL associated with these results."),
      coverage: s.literal("initial", {
        description: "This response contains the initial results only.",
      }),
      incomplete: s.boolean("Whether some results or fields could not be returned."),
      profiles: s.array("profiles value.", s.looseObject("profiles value. item.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
