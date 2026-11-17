import type { JsonSchema } from "../../core/types.ts";
const querySchema: JsonSchema = {
  type: "string",
  maxLength: 500,
  description:
    "The search query.\n\n**Operators**\n\n- `site:<domain>`: restrict results to a single domain. For multiple domains, use `include_domains` and `exclude_domains`.\n- `-site:<domain>`: exclude a single domain from the results.",
};
const excludeDomainsSchema: JsonSchema = {
  type: "array",
  maxItems: 1200,
  description:
    "A list of domains to specifically exclude from the search results. The `-site:` query operator adds to this list. If a domain appears in both `include_domains` and `exclude_domains`, `exclude_domains` takes precedence.",
  items: {
    type: "string",
    maxLength: 60,
    description: "exclude domains item.",
  },
};
const timeBasisSchema: JsonSchema = {
  type: "string",
  enum: ["auto", "published", "crawled"],
  description:
    "Determines which time field is used for time filtering. `published` uses time_published; `crawled` uses time_last_crawled. Results missing this field are excluded when filtering by time.",
};
const timeRangeSchema: JsonSchema = {
  type: "string",
  enum: ["day", "week", "month", "year", "d", "w", "m", "y"],
  description:
    "Relative time window counting back from the current time based on `time_basis`. Mutually exclusive with `start_time`/`end_time` — if both are provided, `start_time`/`end_time` take precedence.",
};
const languageSchema: JsonSchema = {
  type: "array",
  description:
    "A list of languages to restrict results to, as ISO 639-1 codes. By default, no language filter is applied.",
  items: {
    type: "string",
    enum: ["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl", "pt", "ru", "th", "tr", "vi", "zh"],
    description: "language item.",
  },
};
const highlightSchema: JsonSchema = {
  type: "object",
  description: "Controls highlight extraction from result pages.",
  properties: {
    enable: {
      type: "boolean",
      description: "If true, returns query-relevant highlight in each result.",
    },
    max_tokens: {
      type: "integer",
      minimum: 100,
      maximum: 20000,
      description: "Max tokens returned per highlight.",
    },
  },
  required: [],
  additionalProperties: false,
};
const fullContentSchema: JsonSchema = {
  type: "object",
  description: "Controls whether to return the full raw content of each result page.",
  properties: {
    enable: {
      type: "boolean",
      description: "If true, returns full_content for each result.",
    },
    max_tokens: {
      type: "integer",
      minimum: 100,
      maximum: 100000,
      description: "Maximum tokens of full content included per result.",
    },
  },
  required: [],
  additionalProperties: false,
};
const timeRangeSchema2: JsonSchema = {
  type: "string",
  enum: ["day", "week", "month", "year", "d", "w", "m", "y"],
  description:
    "Relative time window counting back from the current time based on `time_basis`. Mutually exclusive with `start_time`/`end_time`: if both are provided, `start_time`/`end_time` take precedence.",
};
const cacheControlSchema: JsonSchema = {
  type: "object",
  description: "Prompt caching marker. Sets a cache breakpoint so the stable prefix up to this block can be reused.",
  properties: {
    type: {
      type: "string",
      enum: ["ephemeral"],
      description: "The cache control type. Always `ephemeral`.",
    },
    ttl: {
      type: "string",
      enum: ["5m", "1h"],
      description: "Cache lifetime.",
    },
  },
  required: ["type"],
  additionalProperties: false,
};
const contentItemSchema: JsonSchema = {
  type: "object",
  description: "A content block within a message.",
  properties: {
    type: {
      type: "string",
      enum: ["text", "image", "image_url"],
      description: "The type of content block.",
    },
    text: {
      type: "string",
      description: "The text content. Required when `type` is `text`.",
    },
    image: {
      type: "string",
      description: "Base64-encoded image. Required when `type` is `image`.",
    },
    image_url: {
      type: "object",
      description: "Image URL object. Required when `type` is `image_url`.",
      properties: {
        url: {
          type: "string",
          description: "The URL of the image.",
        },
      },
      required: ["url"],
      additionalProperties: false,
    },
    cache_control: cacheControlSchema,
  },
  required: ["type"],
  additionalProperties: false,
};
const contentSchema2: JsonSchema = {
  type: "array",
  description: "content.",
  items: contentItemSchema,
};
const contentSchema: JsonSchema = {
  description: "The system prompt content. A plain string or an array of content blocks.",
  oneOf: [
    {
      type: "string",
      description: "content.",
    },
    contentSchema2,
  ],
};
const messagesItemSchema2: JsonSchema = {
  type: "object",
  description: "messages item.",
  properties: {
    role: {
      type: "string",
      enum: ["system"],
      description: "The role of the message author. Always `system`.",
    },
    content: contentSchema,
  },
  required: ["role", "content"],
  additionalProperties: false,
};
const contentSchema3: JsonSchema = {
  description: "The content. A plain string or an array of content blocks.",
  oneOf: [
    {
      type: "string",
      description: "content.",
    },
    contentSchema2,
  ],
};
const messagesItemSchema3: JsonSchema = {
  type: "object",
  description:
    "A developer message. The OpenAI-protocol equivalent of `system` (sent by newer OpenAI SDKs); handled as `system`.",
  properties: {
    role: {
      type: "string",
      enum: ["developer"],
      description: "The role of the message author. Always `developer`.",
    },
    content: contentSchema3,
  },
  required: ["role", "content"],
  additionalProperties: false,
};
const contentSchema4: JsonSchema = {
  description: "The content of the message. A plain string or an array of content blocks.",
  oneOf: [
    {
      type: "string",
      description: "content.",
    },
    contentSchema2,
  ],
};
const messagesItemSchema4: JsonSchema = {
  type: "object",
  description: "messages item.",
  properties: {
    role: {
      type: "string",
      enum: ["user"],
      description: "The role of the message author. Always `user`.",
    },
    content: contentSchema4,
  },
  required: ["role", "content"],
  additionalProperties: false,
};
const functionSchema: JsonSchema = {
  type: "object",
  description: "The function invocation details within a tool call.",
  properties: {
    name: {
      type: "string",
      description: "The name of the function to call.",
    },
    arguments: {
      type: "string",
      description: "The arguments to the function, as a JSON string generated by the model.",
    },
  },
  required: ["name", "arguments"],
  additionalProperties: false,
};
const toolCallsItemSchema: JsonSchema = {
  type: "object",
  description: "A custom function call generated by the model.",
  properties: {
    index: {
      type: "integer",
      description: "The index of this tool call in the array.",
    },
    id: {
      type: "string",
      description:
        "A unique identifier for this tool call. Referenced by the corresponding `tool` message's `tool_call_id`.",
    },
    type: {
      type: "string",
      enum: ["function"],
      description: "The type of tool call. Always `function`.",
    },
    function: functionSchema,
    thought_signature: {
      type: "string",
      description:
        "Encrypted reasoning state, replayed verbatim. Required when the request ends with a `tool` message.",
    },
  },
  required: ["id", "type", "function"],
  additionalProperties: false,
};
const toolCallsSchema: JsonSchema = {
  type: "array",
  description:
    "Tool calls generated by the model in a previous turn, replayed verbatim. Only valid when `role` is `assistant`.",
  items: toolCallsItemSchema,
};
const messagesItemSchema5: JsonSchema = {
  type: "object",
  description: "messages item.",
  properties: {
    role: {
      type: "string",
      enum: ["assistant"],
      description: "The role of the message author. Always `assistant`.",
    },
    content: {
      type: ["string", "null"],
      description:
        "The assistant's text content. May be `null` or omitted when the assistant only produces tool calls.",
    },
    tool_calls: toolCallsSchema,
  },
  required: ["role"],
  additionalProperties: false,
};
const messagesItemSchema6: JsonSchema = {
  type: "object",
  description: "messages item.",
  properties: {
    role: {
      type: "string",
      enum: ["tool"],
      description: "The role of the message author. Always `tool`.",
    },
    tool_call_id: {
      type: "string",
      description: "The ID of the tool call this message responds to.",
    },
    content: {
      type: "string",
      description: "The tool output, typically a JSON string with the function result.",
    },
  },
  required: ["role", "tool_call_id", "content"],
  additionalProperties: false,
};
const messagesItemSchema: JsonSchema = {
  description: "messages item.",
  oneOf: [messagesItemSchema2, messagesItemSchema3, messagesItemSchema4, messagesItemSchema5, messagesItemSchema6],
};
const parametersSchema: JsonSchema = {
  type: "object",
  description: "Broad search behavior configuration. Optional.",
  properties: {
    max_queries: {
      type: "integer",
      minimum: 1,
      maximum: 30,
      description: "Upper bound on the number of sub-queries generated.",
    },
    count: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Number of results to return.",
    },
    include_domains: {
      type: "array",
      maxItems: 1200,
      description:
        "A list of domains to specifically include in the search results. The `site:` query operator adds to this list.",
      items: {
        type: "string",
        maxLength: 60,
        description: "include domains item.",
      },
    },
    exclude_domains: excludeDomainsSchema,
    include_text: {
      type: "array",
      maxItems: 5,
      description: "Strings that must appear in the result page text.",
      items: {
        type: "string",
        maxLength: 30,
        description: "include text item.",
      },
    },
    exclude_text: {
      type: "array",
      maxItems: 5,
      description: "Strings that must not appear in the result page text.",
      items: {
        type: "string",
        maxLength: 30,
        description: "exclude text item.",
      },
    },
    time_basis: timeBasisSchema,
    time_range: timeRangeSchema,
    start_time: {
      type: "string",
      format: "date-time",
      description: "Start time for filtering results. ISO 8601 format.",
    },
    end_time: {
      type: "string",
      format: "date-time",
      description: "End time for filtering results. ISO 8601 format.",
    },
    language: languageSchema,
    highlight: highlightSchema,
    full_content: fullContentSchema,
    format: {
      type: "string",
      enum: ["markdown", "text"],
      description: "Controls the formatting of highlight outputs.",
    },
    safesearch: {
      type: "string",
      enum: ["off", "strict"],
      description:
        "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
    },
    include_images: {
      type: "boolean",
      description: "Whether to include images in each result.",
    },
  },
  required: [],
  additionalProperties: false,
};
const parametersSchema2: JsonSchema = {
  type: "object",
  description: "Search behavior configuration. Optional.",
  properties: {
    max_searches: {
      type: "integer",
      description: "Maximum number of searches allowed in a single request.",
    },
    count: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Number of results to return.",
    },
    include_domains: {
      type: "array",
      maxItems: 1200,
      description:
        "A list of domains to specifically include in the search results. The `site:` query operator adds to this list.",
      items: {
        type: "string",
        maxLength: 60,
        description: "include domains item.",
      },
    },
    exclude_domains: excludeDomainsSchema,
    include_text: {
      type: "array",
      maxItems: 5,
      description: "Strings that must appear in the result page text.",
      items: {
        type: "string",
        maxLength: 30,
        description: "include text item.",
      },
    },
    exclude_text: {
      type: "array",
      maxItems: 5,
      description: "Strings that must not appear in the result page text.",
      items: {
        type: "string",
        maxLength: 30,
        description: "exclude text item.",
      },
    },
    time_basis: timeBasisSchema,
    time_range: timeRangeSchema,
    start_time: {
      type: "string",
      format: "date-time",
      description: "Start time for filtering results. ISO 8601 format.",
    },
    end_time: {
      type: "string",
      format: "date-time",
      description: "End time for filtering results. ISO 8601 format.",
    },
    language: languageSchema,
    highlight: highlightSchema,
    full_content: fullContentSchema,
    format: {
      type: "string",
      enum: ["markdown", "text"],
      description: "Controls the formatting of highlight outputs.",
    },
    safesearch: {
      type: "string",
      enum: ["off", "strict"],
      description:
        "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
    },
    include_images: {
      type: "boolean",
      description: "Whether to include images in each result.",
    },
  },
  required: [],
  additionalProperties: false,
};
export const octenInputs: Record<string, JsonSchema> = {
  search: {
    type: "object",
    description: "search parameters.",
    properties: {
      query: querySchema,
      count: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of results to return.",
      },
      include_domains: {
        type: "array",
        maxItems: 1200,
        description:
          "A list of domains to specifically include in the search results. The `site:` query operator adds to this list.",
        items: {
          type: "string",
          maxLength: 60,
          description: "include domains item.",
        },
      },
      exclude_domains: excludeDomainsSchema,
      include_text: {
        type: "array",
        maxItems: 5,
        description: "Strings that must appear in the result page text.",
        items: {
          type: "string",
          maxLength: 30,
          description: "include text item.",
        },
      },
      exclude_text: {
        type: "array",
        maxItems: 5,
        description: "Strings that must not appear in the result page text.",
        items: {
          type: "string",
          maxLength: 30,
          description: "exclude text item.",
        },
      },
      time_basis: timeBasisSchema,
      time_range: timeRangeSchema,
      start_time: {
        type: "string",
        format: "date-time",
        description: "Start time for filtering results. ISO 8601 format.",
      },
      end_time: {
        type: "string",
        format: "date-time",
        description: "End time for filtering results. ISO 8601 format.",
      },
      language: languageSchema,
      highlight: highlightSchema,
      full_content: fullContentSchema,
      format: {
        type: "string",
        enum: ["markdown", "text"],
        description: "Controls the formatting of highlight outputs.",
      },
      safesearch: {
        type: "string",
        enum: ["off", "strict"],
        description:
          "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
      },
      include_images: {
        type: "boolean",
        description: "Whether to include images in each result.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  search_news: {
    type: "object",
    description: "search news parameters.",
    properties: {
      query: querySchema,
      count: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of results to return.",
      },
      include_domains: {
        type: "array",
        maxItems: 1200,
        description:
          "A list of domains to specifically include in the search results. The `site:` query operator adds to this list. Applies to `results` only; subject grouping does not support domain filtering.",
        items: {
          type: "string",
          maxLength: 60,
          description: "include domains item.",
        },
      },
      exclude_domains: {
        type: "array",
        maxItems: 1200,
        description:
          "A list of domains to specifically exclude from the search results. The `-site:` query operator adds to this list. If a domain appears in both `include_domains` and `exclude_domains`, `exclude_domains` takes precedence. Applies to `results` only; subject grouping does not support domain filtering.",
        items: {
          type: "string",
          maxLength: 60,
          description: "exclude domains item.",
        },
      },
      time_basis: timeBasisSchema,
      time_range: timeRangeSchema2,
      start_time: {
        type: "string",
        format: "date-time",
        description: "Start time for filtering results. ISO 8601 format.",
      },
      end_time: {
        type: "string",
        format: "date-time",
        description: "End time for filtering results. ISO 8601 format.",
      },
      language: {
        type: "array",
        description:
          "A list of languages to restrict results to, as ISO 639-1 codes. Applies to both `results` and `subjects`.",
        items: {
          type: "string",
          enum: [
            "ar",
            "de",
            "en",
            "es",
            "fr",
            "hi",
            "id",
            "it",
            "ja",
            "ko",
            "nl",
            "pl",
            "pt",
            "ru",
            "th",
            "tr",
            "vi",
            "zh",
          ],
          description: "language item.",
        },
      },
      highlight: highlightSchema,
      full_content: fullContentSchema,
      subjects: {
        type: "object",
        description: "Controls subject grouping, which clusters related articles into events.",
        properties: {
          enable: {
            type: "boolean",
            description: "If true, returns data.subjects.",
          },
          count: {
            type: "integer",
            minimum: 1,
            maximum: 5,
            description: "Maximum number of subjects to return.",
          },
          max_sub_news: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Maximum number of sub-events to return per subject.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  search_business: {
    type: "object",
    description: "search business parameters.",
    properties: {
      query: querySchema,
      count: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Number of results to return.",
      },
      include_domains: {
        type: "array",
        maxItems: 1200,
        description:
          "A list of domains to specifically include in the search results. The `site:` query operator adds to this list. Applies to `results` only; entity cards do not support domain filtering.",
        items: {
          type: "string",
          maxLength: 60,
          description: "include domains item.",
        },
      },
      exclude_domains: {
        type: "array",
        maxItems: 1200,
        description:
          "A list of domains to specifically exclude from the search results. The `-site:` query operator adds to this list. If a domain appears in both `include_domains` and `exclude_domains`, `exclude_domains` takes precedence. Applies to `results` only; entity cards do not support domain filtering.",
        items: {
          type: "string",
          maxLength: 60,
          description: "exclude domains item.",
        },
      },
      time_basis: {
        type: "string",
        enum: ["auto", "published", "crawled"],
        description:
          "Determines which time field is used for time filtering. `published` uses time_published; `crawled` uses time_last_crawled. Results missing this field are excluded when filtering by time. Applies to `results` only; entity cards do not support time filtering.",
      },
      time_range: timeRangeSchema2,
      start_time: {
        type: "string",
        format: "date-time",
        description: "Start time for filtering results. ISO 8601 format.",
      },
      end_time: {
        type: "string",
        format: "date-time",
        description: "End time for filtering results. ISO 8601 format.",
      },
      language: {
        type: "array",
        description:
          "A list of languages to restrict results to, as ISO 639-1 codes. Applies to `results` only; entity cards do not support language filtering.",
        items: {
          type: "string",
          enum: [
            "ar",
            "de",
            "en",
            "es",
            "fr",
            "hi",
            "id",
            "it",
            "ja",
            "ko",
            "nl",
            "pl",
            "pt",
            "ru",
            "th",
            "tr",
            "vi",
            "zh",
          ],
          description: "language item.",
        },
      },
      highlight: highlightSchema,
      full_content: fullContentSchema,
      entities: {
        type: "object",
        description: "Controls the entity cards returned for companies and people.",
        properties: {
          enable: {
            type: "boolean",
            description: "If true, returns data.entities.",
          },
          count: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Maximum number of entity cards to return.",
          },
          max_activities: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Maximum number of recent activities to return per entity card.",
          },
          max_news: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Maximum number of related news items to return per entity card.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  search_images: {
    type: "object",
    description: "Request body for the Image Search API.",
    properties: {
      inputs: {
        type: "array",
        minItems: 1,
        maxItems: 1,
        description:
          "Multimodal input array. Currently only a single input is supported: either one text input or one image input.",
        items: {
          type: "object",
          description:
            "A single multimodal input. Currently each request accepts exactly one input: either one text input or one image input.",
          properties: {
            type: {
              type: "string",
              enum: ["text", "image"],
              description:
                "The input type. A single image must be at most 5MB and one of: JPEG, PNG, WEBP, BMP, TIFF, ICO, DIB, ICNS, SGI.",
            },
            url: {
              type: "string",
              description: "Image input as a public URL. For an image input, provide either `url` or `data`, not both.",
            },
            data: {
              type: "string",
              description:
                "When `type` is `text`: the query content, max 500 characters. When `type` is `image`: base64-encoded image data, at most 5MB after encoding.",
            },
          },
          required: ["type"],
          additionalProperties: false,
        },
      },
      count: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "Number of results to return.",
      },
      include_domains: {
        type: "array",
        description: "Domains to include, matched against each result's `source_page` URL.",
        items: {
          type: "string",
          description: "include domains item.",
        },
      },
      exclude_domains: {
        type: "array",
        description: "Domains to exclude, matched against each result's `source_page` URL.",
        items: {
          type: "string",
          description: "exclude domains item.",
        },
      },
      safesearch: {
        type: "string",
        enum: ["off", "strict"],
        description:
          "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
      },
    },
    required: ["inputs"],
    additionalProperties: false,
  },
  search_videos: {
    type: "object",
    description: "Request body for the Video Search API.",
    properties: {
      inputs: {
        type: "array",
        maxItems: 1,
        description: "Input array carrying a text query (at most 1).",
        items: {
          type: "object",
          description: "A single text input. At most one input per request.",
          properties: {
            type: {
              type: "string",
              enum: ["text"],
              description: "The input type.",
            },
            data: {
              type: "string",
              description: "The query content, max 500 characters.",
            },
          },
          required: ["type"],
          additionalProperties: false,
        },
      },
      count: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "Number of results to return.",
      },
      time_range: {
        type: "string",
        enum: ["day", "week", "month", "year", "d", "w", "m", "y"],
        description:
          "Relative time window counting back from the current time, filtered by publish time. Mutually exclusive with `start_time`/`end_time` — if both are provided, `start_time`/`end_time` take precedence.",
      },
      start_time: {
        type: "string",
        format: "date-time",
        description: "Start time for filtering results by publish time. ISO 8601 format.",
      },
      end_time: {
        type: "string",
        format: "date-time",
        description: "End time for filtering results by publish time. ISO 8601 format.",
      },
      safesearch: {
        type: "string",
        enum: ["off", "strict"],
        description:
          "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
      },
    },
    required: ["inputs"],
    additionalProperties: false,
  },
  extract: {
    type: "object",
    description: "Request body for the Extract API.",
    properties: {
      urls: {
        type: "array",
        description:
          "List of URLs to extract content from. Maximum URLs per request: 20. Maximum length per URL: 2048. Failed URLs are not billed.",
        items: {
          type: "string",
          description: "urls item.",
        },
      },
      mode: {
        type: "string",
        enum: ["standard", "advanced", "auto"],
        description:
          "Processing mode. `standard` prioritizes speed, `advanced` prioritizes success rate on hard-to-reach pages, and `auto` picks one per URL. `advanced` and `auto` can take longer, so raise `timeout` accordingly.",
      },
      query: {
        type: "string",
        maxLength: 500,
        description:
          "Intent-focused keywords. When provided, returns query-relevant highlights per URL; otherwise returns the complete page content.",
      },
      max_age_seconds: {
        type: "integer",
        minimum: 300,
        maximum: 31536000,
        description:
          "Maximum age (in seconds) of cached content. URLs whose cached version exceeds this threshold will be re-fetched. Values outside the allowed range are adjusted to the nearest bound.",
      },
      format: {
        type: "string",
        enum: ["markdown", "text"],
        description: "Format of the returned content.",
      },
      timeout: {
        type: "integer",
        minimum: 1,
        maximum: 60,
        description:
          "Per-URL extraction timeout in seconds. Values outside the allowed range are adjusted to the nearest bound.",
      },
      include_images: {
        type: "boolean",
        description: "Whether to return image URLs detected on the page.",
      },
      include_videos: {
        type: "boolean",
        description: "Whether to return video URLs detected on the page.",
      },
      include_audio: {
        type: "boolean",
        description: "Whether to return audio URLs detected on the page.",
      },
      include_links: {
        type: "object",
        description: "Controls whether to return links detected on the page.",
        properties: {
          scope: {
            type: "string",
            enum: ["prefer_internal", "prefer_external"],
            description:
              "Which links to prioritize. `prefer_internal` favors links within the page's registered domain; `prefer_external` favors external links. Prioritized links come first, and links of the same kind keep their order on the page.",
          },
          max_links: {
            type: "integer",
            minimum: 1,
            maximum: 1000,
            description: "Maximum number of links to return per URL.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: ["urls"],
    additionalProperties: false,
  },
  embed_text: {
    type: "object",
    description: "embed text parameters.",
    properties: {
      input: {
        type: "array",
        maxItems: 1000,
        description:
          "The text to be converted into embeddings. Maximum characters per element: 10000. Maximum request body size: 2MB",
        items: {
          type: "string",
          description: "input item.",
          maxLength: 10000,
        },
        minItems: 1,
      },
      model: {
        type: "string",
        enum: ["octen-embedding-0.6b", "octen-embedding-4b", "octen-embedding-8b"],
        description:
          "The embedding model used for this request. `octen-embedding-0.6b` (max dim: 1024) for cost/throughput priority; `octen-embedding-4b` (max dim: 2560) for most applications; `octen-embedding-8b` (max dim: 4096) for accuracy-critical tasks.",
      },
      dimension: {
        type: "integer",
        description:
          "The dimensionality of the output embedding vectors. Defaults to the model's max dimension (0.6b: 1024, 4b: 2560, 8b: 4096). If set to a value smaller than the model default, the embedding will be truncated to the first N values. Any positive integer ≤ model default dimension is allowed.",
        minimum: 1,
      },
      input_type: {
        type: ["string", "null"],
        enum: ["query", "document"],
        description:
          'Specifies whether the input is a query or a document for retrieval. Different values apply different internal prompts: `query` → "Represent the query for retrieving supporting" (prepended and counted in input_tokens); `document` and `null` mean no special prompt is applied.',
      },
    },
    required: ["input"],
    additionalProperties: false,
  },
  embed_multimodal: {
    type: "object",
    description: "embed multimodal parameters.",
    properties: {
      model: {
        type: "string",
        enum: ["octen-vl-embedding", "octen-vl-embedding-large"],
        description: "The multimodal embedding model used for this request.",
      },
      input: {
        type: "object",
        description:
          "The multimodal content to be vectorized. Supports text, images, videos, and combinations. Maximum total elements per request: 20. Maximum images per request: 5. Maximum videos per request: 1.",
        properties: {
          contents: {
            type: "array",
            maxItems: 20,
            description: "The list of content elements to process.",
            items: {
              type: "object",
              description:
                "A single content element. Each object should provide exactly one of `text`, `image`, or `video`. For multiple images, include multiple content objects (one image per object).",
              properties: {
                text: {
                  type: "string",
                  description: "Text input. Maximum 10,000 characters per entry.",
                },
                image: {
                  type: "string",
                  description:
                    "Image input. Supports a URL or a Base64 string. Maximum 5MB per image. Supported formats: JPEG, PNG, WEBP, BMP, TIFF, ICO, DIB, ICNS, SGI.",
                },
                video: {
                  type: "string",
                  description: "Video input. URL only. Maximum 50MB per file. Supported formats: MP4, AVI, MOV.",
                },
              },
              required: [],
              additionalProperties: false,
            },
          },
        },
        required: ["contents"],
        additionalProperties: false,
      },
      enable_fusion: {
        type: "boolean",
        description:
          "Whether to generate a fused embedding. When `true`, all elements in `contents` are fused into a single vector; when `false`, each element produces an independent vector.",
      },
      dimension: {
        type: "integer",
        description:
          "The dimensionality of the output embedding vectors. Defaults to the model's max dimension (octen-vl-embedding: 2048, octen-vl-embedding-large: 4096). Any positive integer ≤ the model's max dimension is allowed.",
        minimum: 1,
      },
      fps: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "Frames sampled per second of video. For example, `0.5` samples one frame every two seconds. Lower values sample fewer frames and reduce video token consumption. Each video is sampled to at most 64 frames.",
      },
      instruct: {
        type: "string",
        description:
          "Custom task description used to guide the model in understanding the query intent. Its length counts toward `input_tokens` and shares the 10,000-character total limit with `contents`.",
      },
    },
    required: ["model", "input"],
    additionalProperties: false,
  },
  chat: {
    type: "object",
    description:
      "Request body for the Chat Completions API. Some parameters apply only to certain models; unsupported parameters are ignored for the selected model.",
    properties: {
      model: {
        type: "string",
        enum: [
          "openai/gpt-6.1-sol",
          "openai/gpt-6-astra",
          "openai/gpt-5.6-sol",
          "openai/gpt-5.6-terra",
          "openai/gpt-5.6-luna",
          "openai/gpt-5.4",
          "anthropic/claude-fable-5.1",
          "anthropic/claude-fable-5",
          "anthropic/claude-opus-5.5",
          "anthropic/claude-opus-5",
          "anthropic/claude-opus-4.8",
          "anthropic/claude-opus-4.6",
          "anthropic/claude-sonnet-5.5",
          "anthropic/claude-sonnet-5",
          "anthropic/claude-sonnet-4.6",
          "anthropic/claude-haiku-5.5",
          "anthropic/claude-haiku-4.5",
          "google/gemini-4-argon",
          "google/gemini-3.8-flash",
          "google/gemini-3.5-flash",
          "google/gemini-3.5-flash-lite",
          "google/gemini-3.1-pro-preview",
          "google/gemini-3.1-flash-lite",
          "google/gemini-3-flash-preview",
          "moonshotai/kimi-k3",
          "moonshotai/kimi-k2.6",
          "moonshotai/kimi-k2.5",
          "minimax/minimax-m2.5",
          "qwen/qwen3.6-plus",
          "deepseek/deepseek-v4-pro",
          "deepseek/deepseek-v4-flash-0731",
        ],
        description: "The model to use for chat completion.",
      },
      messages: {
        type: "array",
        description: "The conversation so far. System prompt plus user and assistant messages in chronological order.",
        items: messagesItemSchema,
      },
      tools: {
        type: "array",
        description: "tools.",
        items: {
          description:
            "A tool definition. One of a custom `function` tool, the built-in `octen_broad_search` tool, or the `octen_search` tool.",
          oneOf: [
            {
              type: "object",
              description: "A custom function tool, executed by the caller.",
              properties: {
                type: {
                  type: "string",
                  enum: ["function"],
                  description: "The type of tool. Always `function` for a custom tool.",
                },
                function: {
                  type: "object",
                  description: "The function definition.",
                  properties: {
                    name: {
                      type: "string",
                      description: "The name of the function.",
                    },
                    description: {
                      type: "string",
                      description: "A description of what the function does.",
                    },
                    parameters: {
                      type: "object",
                      description: "The function's parameter definition in JSON Schema format.",
                      additionalProperties: true,
                    },
                    strict: {
                      type: "boolean",
                      description:
                        "Whether to enable strict mode. When enabled, generated arguments strictly conform to `parameters`.",
                    },
                  },
                  required: ["name"],
                  additionalProperties: false,
                },
              },
              required: ["type", "function"],
              additionalProperties: false,
            },
            {
              type: "object",
              description: "The built-in `octen_broad_search` server tool, executed by Octen.",
              properties: {
                type: {
                  type: "string",
                  enum: ["octen_broad_search"],
                  description: "The type of tool. Always `octen_broad_search`.",
                },
                parameters: parametersSchema,
              },
              required: ["type"],
              additionalProperties: false,
            },
            {
              type: "object",
              description: "The built-in `octen_search` server tool, executed by Octen.",
              properties: {
                type: {
                  type: "string",
                  enum: ["octen_search"],
                  description: "The type of tool. Always `octen_search`.",
                },
                parameters: parametersSchema2,
              },
              required: ["type"],
              additionalProperties: false,
            },
          ],
        },
      },
      tool_choice: {
        description:
          "Controls tool invocation. `none`: never call tools; `auto`: model decides (default); `required`: must call a tool. Can also be an object to force a specific tool. Only valid when `tools` is set.",
        oneOf: [
          {
            type: "string",
            enum: ["none", "auto", "required"],
            description: "tool choice.",
          },
          {
            type: "object",
            description: "Forces a specific tool. The named tool must be declared in `tools`.",
            properties: {
              type: {
                type: "string",
                enum: ["function", "octen_broad_search", "octen_search"],
                description: "The type of tool to force.",
              },
              function: {
                type: "object",
                description: "The function to call. Required when `type` is `function`.",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the function to call.",
                  },
                },
                required: ["name"],
                additionalProperties: false,
              },
            },
            required: ["type"],
            additionalProperties: false,
          },
        ],
      },
      parallel_tool_calls: {
        type: "boolean",
        description:
          "Whether the model may issue multiple tool calls in one reply. When `false`, at most one tool call per turn.",
      },
      max_tokens: {
        type: "integer",
        minimum: 1,
        description:
          "Maximum number of tokens the model can output. If not set, the model's internal default limit is used.",
      },
      max_completion_tokens: {
        type: "integer",
        minimum: 1,
        description:
          "Maximum completion tokens, including reasoning and visible output tokens. If not set, the model's internal default limit is used.",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        description:
          "Controls randomness in generation. Higher values produce more diverse output; lower values produce more deterministic output.",
      },
      top_p: {
        type: "number",
        exclusiveMinimum: 0,
        maximum: 1,
        description: "Nucleus sampling. Only tokens with cumulative probability up to `top_p` are considered.",
      },
      top_k: {
        type: "integer",
        minimum: 0,
        description: "Sample only from the top K most probable tokens. `0` disables it.",
      },
      min_p: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "Minimum probability threshold relative to the most probable token. Tokens below it are filtered out. `0` disables it.",
      },
      top_a: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Dynamic filtering threshold based on the most probable token. `0` disables it.",
      },
      repetition_penalty: {
        type: "number",
        exclusiveMinimum: 0,
        maximum: 2,
        description:
          "Penalizes tokens already present in the input. Above 1 suppresses repetition; below 1 encourages it.",
      },
      frequency_penalty: {
        type: "number",
        minimum: -2,
        maximum: 2,
        description: "Penalizes tokens by their frequency in the output so far. Positive values reduce repetition.",
      },
      presence_penalty: {
        type: "number",
        minimum: -2,
        maximum: 2,
        description: "Penalizes tokens that have already appeared. Positive values encourage new topics.",
      },
      response_format: {
        type: "object",
        description:
          "Controls the output format. Some models may not support structured output and will automatically fall back to `text`.",
        properties: {
          type: {
            type: "string",
            enum: ["text", "json_object", "json_schema"],
            description: "The output format type.",
          },
          json_schema: {
            type: "object",
            description:
              "JSON Schema specification for structured output. Required when `response_format.type` is `json_schema`.",
            properties: {
              name: {
                type: "string",
                description: "A user-defined name for the schema.",
              },
              strict: {
                type: "boolean",
                description: "Whether the model output must strictly conform to the schema.",
              },
              description: {
                type: "string",
                description: "A description of the schema.",
              },
              schema: {
                type: "object",
                description:
                  "The JSON Schema definition object. May contain `type`, `properties`, `required`, `additionalProperties`, etc.",
                additionalProperties: true,
              },
            },
            required: ["name"],
            additionalProperties: false,
          },
        },
        required: [],
        additionalProperties: false,
      },
      stop: {
        type: "array",
        description: "Stop sequences. Generation stops when any of these strings is encountered.",
        items: {
          type: "string",
          description: "stop item.",
        },
      },
      seed: {
        type: "integer",
        description:
          "Seed for reproducibility. With the same parameters and model version, output should be as consistent as possible.",
      },
      reasoning: {
        type: "object",
        description: "Options for reasoning models. Turns thinking on or off and sets the effort and budget.",
        properties: {
          enabled: {
            type: "boolean",
            description: "Set to `false` to turn off thinking. Overrides `effort` and `max_tokens`.",
          },
          effort: {
            type: "string",
            enum: ["max", "xhigh", "high", "medium", "low", "minimal", "none"],
            description: "The reasoning effort level.",
          },
          max_tokens: {
            type: "integer",
            minimum: 1024,
            description: "Thinking token budget.",
          },
        },
        required: [],
        additionalProperties: false,
      },
      reasoning_effort: {
        type: "string",
        enum: ["none", "minimal", "low", "medium", "high", "xhigh", "max"],
        description: "Top-level alias for `reasoning.effort`. If both are set, `reasoning` takes precedence.",
      },
      verbosity: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Controls how verbose the reply is.",
      },
      logit_bias: {
        type: "object",
        description:
          "A JSON object mapping token IDs to bias values (-100 to 100), added to the logits before sampling.",
        additionalProperties: {
          type: "number",
          minimum: -100,
          maximum: 100,
          description: "Additional value.",
        },
      },
      logprobs: {
        type: "boolean",
        description: "Whether to return the log probabilities of the output tokens.",
      },
      top_logprobs: {
        type: "integer",
        minimum: 0,
        maximum: 20,
        description: "Number of most likely tokens to return at each position. Requires `logprobs` to be `true`.",
      },
      user: {
        type: "string",
        description:
          "A unique identifier for the end user. Use hashed or pseudonymous identifiers to avoid passing personally identifiable information.",
      },
      modalities: {
        type: "array",
        description: "Requested output modalities.",
        items: {
          type: "string",
          description: "modalities item.",
        },
      },
      prompt_cache_key: {
        type: "string",
        description: "Cache key for prompt caching.",
      },
      prompt_cache_options: {
        type: "object",
        description: "Prompt caching controls.",
        properties: {
          mode: {
            type: "string",
            enum: ["implicit", "explicit"],
            description:
              "`implicit` caches automatically; `explicit` caches only prefixes marked with a cache breakpoint.",
          },
          ttl: {
            type: "string",
            enum: ["30m"],
            description: "How long a cache entry is retained.",
          },
        },
        required: [],
        additionalProperties: false,
      },
      prompt_cache_retention: {
        type: "string",
        enum: ["in_memory", "24h"],
        description: "Prompt cache retention policy.",
      },
      previous_response_id: {
        type: "string",
        description: "The `id` of a previous response, used to chain state across turns.",
      },
    },
    required: ["model", "messages"],
    additionalProperties: false,
  },
  answer: {
    type: "object",
    description: "Request body for the Answer API.",
    properties: {
      model: {
        type: "string",
        enum: [
          "openai/gpt-6.1-sol",
          "openai/gpt-6-astra",
          "openai/gpt-5.6-sol",
          "openai/gpt-5.6-terra",
          "openai/gpt-5.6-luna",
          "openai/gpt-5.4",
          "anthropic/claude-fable-5.1",
          "anthropic/claude-fable-5",
          "anthropic/claude-opus-5.5",
          "anthropic/claude-opus-5",
          "anthropic/claude-opus-4.8",
          "anthropic/claude-opus-4.6",
          "anthropic/claude-sonnet-5.5",
          "anthropic/claude-sonnet-5",
          "anthropic/claude-sonnet-4.6",
          "anthropic/claude-haiku-5.5",
          "anthropic/claude-haiku-4.5",
          "google/gemini-4-argon",
          "google/gemini-3.8-flash",
          "google/gemini-3.5-flash",
          "google/gemini-3.5-flash-lite",
          "google/gemini-3.1-pro-preview",
          "google/gemini-3.1-flash-lite",
          "google/gemini-3-flash-preview",
          "moonshotai/kimi-k3",
          "moonshotai/kimi-k2.6",
          "moonshotai/kimi-k2.5",
          "minimax/minimax-m2.5",
          "qwen/qwen3.6-plus",
          "deepseek/deepseek-v4-pro",
          "deepseek/deepseek-v4-flash-0731",
        ],
        description: "The model to use for query decomposition and response synthesis.",
      },
      messages: {
        type: "array",
        description:
          "A list of messages comprising the conversation so far. User and assistant messages in chronological order for multi-turn conversations.",
        items: messagesItemSchema,
      },
      mode: {
        type: "string",
        enum: ["queries_only", "queries_and_search", "full"],
        description:
          "Controls the execution depth. `queries_only`: only decompose the message into sub-queries without performing searches; `queries_and_search`: decompose into sub-queries and return search results without LLM synthesis; `full`: decompose, search, and synthesize a final response using the LLM.",
      },
      max_queries: {
        type: "integer",
        minimum: 1,
        maximum: 30,
        description: "Maximum number of sub-queries to generate.",
      },
      web_search_options: {
        type: "object",
        description:
          "Search options. Shares the same parameters and defaults as the Web Search API, except `highlight.max_tokens` defaults to 256. Queries are automatically generated from the messages.",
        properties: {
          count: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            description: "Number of results to return.",
          },
          include_domains: {
            type: "array",
            maxItems: 1200,
            description:
              "A list of domains to specifically include in the search results. The `site:` query operator adds to this list.",
            items: {
              type: "string",
              maxLength: 60,
              description: "include domains item.",
            },
          },
          exclude_domains: excludeDomainsSchema,
          include_text: {
            type: "array",
            maxItems: 5,
            description: "Strings that must appear in the result page text.",
            items: {
              type: "string",
              maxLength: 30,
              description: "include text item.",
            },
          },
          exclude_text: {
            type: "array",
            maxItems: 5,
            description: "Strings that must not appear in the result page text.",
            items: {
              type: "string",
              maxLength: 30,
              description: "exclude text item.",
            },
          },
          time_basis: timeBasisSchema,
          time_range: timeRangeSchema,
          start_time: {
            type: "string",
            format: "date-time",
            description: "Start time for filtering results. ISO 8601 format.",
          },
          end_time: {
            type: "string",
            format: "date-time",
            description: "End time for filtering results. ISO 8601 format.",
          },
          language: languageSchema,
          highlight: highlightSchema,
          full_content: fullContentSchema,
          format: {
            type: "string",
            enum: ["markdown", "text"],
            description: "Controls the formatting of highlight outputs.",
          },
          safesearch: {
            type: "string",
            enum: ["off", "strict"],
            description:
              "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
          },
          include_images: {
            type: "boolean",
            description: "Whether to include images in each result.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: ["messages"],
    additionalProperties: false,
  },
  broad_search: {
    type: "object",
    description: "broad search parameters.",
    properties: {
      query: {
        type: "string",
        maxLength: 500,
        description: "The original search query.",
      },
      max_queries: {
        type: "integer",
        minimum: 1,
        maximum: 30,
        description: "Upper bound on the number of sub-queries generated.",
      },
      search_options: {
        type: "object",
        description:
          "Search options applied to each sub-query. Shares the same parameters and defaults as the Web Search API.",
        properties: {
          count: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            description: "Number of results to return.",
          },
          include_domains: {
            type: "array",
            maxItems: 1200,
            description:
              "A list of domains to specifically include in the search results. The `site:` query operator adds to this list.",
            items: {
              type: "string",
              maxLength: 60,
              description: "include domains item.",
            },
          },
          exclude_domains: excludeDomainsSchema,
          include_text: {
            type: "array",
            maxItems: 5,
            description: "Strings that must appear in the result page text.",
            items: {
              type: "string",
              maxLength: 30,
              description: "include text item.",
            },
          },
          exclude_text: {
            type: "array",
            maxItems: 5,
            description: "Strings that must not appear in the result page text.",
            items: {
              type: "string",
              maxLength: 30,
              description: "exclude text item.",
            },
          },
          time_basis: timeBasisSchema,
          time_range: timeRangeSchema,
          start_time: {
            type: "string",
            format: "date-time",
            description: "Start time for filtering results. ISO 8601 format.",
          },
          end_time: {
            type: "string",
            format: "date-time",
            description: "End time for filtering results. ISO 8601 format.",
          },
          language: languageSchema,
          highlight: highlightSchema,
          full_content: fullContentSchema,
          format: {
            type: "string",
            enum: ["markdown", "text"],
            description: "Controls the formatting of highlight outputs.",
          },
          safesearch: {
            type: "string",
            enum: ["off", "strict"],
            description:
              "Controls filtering of explicit/adult content. `off` disables filtering; `strict` drops all adult content.",
          },
          include_images: {
            type: "boolean",
            description: "Whether to include images in each result.",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  research: {
    type: "object",
    description: "Request body for the Deep Research API.",
    properties: {
      tier: {
        type: "string",
        enum: ["lite", "standard", "pro", "pro-visual"],
        description:
          "The research tier. `lite`, `standard`, and `pro` increase research depth, cost, and time in that order. `pro-visual` additionally illustrates each report section with images and videos and streams an HTML version of the report.",
      },
      messages: {
        type: "array",
        description:
          "Conversation messages. Only the last `role=user` message is used as the research question; other messages are ignored and do not enter plan generation, search, analysis, or report writing.",
        items: {
          type: "object",
          description: "A single message in the Deep Research request.",
          properties: {
            role: {
              type: "string",
              enum: ["system", "user", "assistant"],
              description: "The role of the message author.",
            },
            content: {
              description: "The content of the message. Can be a plain string, or an array of text content blocks.",
              oneOf: [
                {
                  type: "string",
                  description: "content.",
                },
                {
                  type: "array",
                  description: "content.",
                  items: {
                    type: "object",
                    description: "A text content block.",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["text"],
                        description: "The block type. Always `text` for Deep Research.",
                      },
                      text: {
                        type: "string",
                        description: "The text content.",
                      },
                    },
                    required: ["type"],
                    additionalProperties: false,
                  },
                },
              ],
            },
          },
          required: ["role", "content"],
          additionalProperties: false,
        },
      },
      extra_context: {
        type: "string",
        description:
          "Additional research background, constraints, or preferences, used as extra context for query rewriting and research direction supplementation.",
      },
      skip_brief: {
        type: "boolean",
        description:
          "Skip the Research Brief stage and write the final report directly from raw search and analysis results.\n\nNote: when enabled, no `brief` event is emitted. Clients can rebuild the citation index by accumulating `search_results` events in the order they arrive (round-by-round / query-by-query / result-by-result) into a global index, then look up the corresponding url/title by the `N` in `[^N]`.",
      },
      skip_plan: {
        type: "boolean",
        description:
          "Phase 1 only. Skip the Research Plan stage and proceed straight to the search loop. With `skip_plan=true`, the call never enters the Phase 2 pause mechanism.",
      },
      skip_plan_confirm: {
        type: "boolean",
        description:
          "Phase 1 only. When `true`, the run continues with all angles even if the plan is ambiguous, instead of pausing and waiting for the user to confirm a selection.",
      },
      plan_id: {
        type: "string",
        description:
          "Phase 2 only. The plan ID returned by a Phase 1 `plan` event with `requires_selection=true`. When provided, the server skips plan generation and applies the supplied `selections` against the stored plan. Each `plan_id` is retained for 30 minutes; after expiry the plan is regenerated.",
      },
      selections: {
        type: "array",
        description: "Phase 2 only. The user's corrections and angle filtering against the Phase 1 plan.",
        items: {
          type: "object",
          description: "A single user correction or angle filter applied against a Phase 1 plan.",
          properties: {
            term: {
              type: "string",
              description:
                "An ambiguous term, matching `plan.interpretations[].term`. When present, overrides the LLM's default `chosen` meaning.",
            },
            chosen: {
              type: "string",
              description:
                'The selected meaning ID (from `plan.interpretations[].meanings[].id`, e.g. `"nasa_program"`). Pass `"all"` to keep every meaning. When used as an angle filter, this carries the `interpretation_id` of the angles to keep.',
            },
            indices: {
              type: "array",
              description:
                "0-based angle indices within the group identified by `chosen`. Absent means keep every angle in that group.",
              items: {
                type: "integer",
                description: "indices item.",
              },
            },
          },
          required: [],
          additionalProperties: false,
        },
      },
    },
    required: [],
    additionalProperties: false,
    anyOf: [
      {
        required: ["messages"],
      },
      {
        required: ["plan_id", "selections"],
      },
    ],
  },
  messages: {
    type: "object",
    description:
      "Request body for the Messages API. Some parameters apply only to certain models; unsupported parameters are ignored.",
    properties: {
      model: {
        type: "string",
        enum: [
          "openai/gpt-6.1-sol",
          "openai/gpt-6-astra",
          "openai/gpt-5.6-sol",
          "openai/gpt-5.6-terra",
          "openai/gpt-5.6-luna",
          "openai/gpt-5.4",
          "anthropic/claude-fable-5.1",
          "anthropic/claude-fable-5",
          "anthropic/claude-opus-5.5",
          "anthropic/claude-opus-5",
          "anthropic/claude-opus-4.8",
          "anthropic/claude-opus-4.6",
          "anthropic/claude-sonnet-5.5",
          "anthropic/claude-sonnet-5",
          "anthropic/claude-sonnet-4.6",
          "anthropic/claude-haiku-5.5",
          "anthropic/claude-haiku-4.5",
          "claude-fable-5-1",
          "claude-fable-5",
          "claude-opus-5-5",
          "claude-opus-5",
          "claude-opus-4-8",
          "claude-opus-4-6",
          "claude-sonnet-5-5",
          "claude-sonnet-5",
          "claude-sonnet-4-6",
          "claude-haiku-5-5",
          "claude-haiku-4-5",
          "google/gemini-4-argon",
          "google/gemini-3.8-flash",
          "google/gemini-3.5-flash",
          "google/gemini-3.5-flash-lite",
          "google/gemini-3.1-pro-preview",
          "google/gemini-3.1-flash-lite",
          "google/gemini-3-flash-preview",
          "moonshotai/kimi-k3",
          "moonshotai/kimi-k2.6",
          "moonshotai/kimi-k2.5",
          "minimax/minimax-m2.5",
          "qwen/qwen3.6-plus",
          "deepseek/deepseek-v4-pro",
          "deepseek/deepseek-v4-flash-0731",
        ],
        description:
          "The model to use. Anthropic models also accept their native ids (e.g. `claude-opus-4-8`), which map to `anthropic/claude-opus-4.8`.",
      },
      max_tokens: {
        type: "integer",
        minimum: 1,
        description: "Maximum number of tokens to generate, including thinking and visible output tokens.",
      },
      messages: {
        type: "array",
        description: "The conversation so far, in chronological order.",
        items: {
          type: "object",
          description:
            "A message in the conversation. Tool results are returned via a `tool_result` content block in a `user` message.",
          properties: {
            role: {
              type: "string",
              enum: ["user", "assistant"],
              description: "The role of the message author.",
            },
            content: {
              description: "The content. A plain string or an array of content blocks.",
              oneOf: [
                {
                  type: "string",
                  description: "content.",
                },
                {
                  type: "array",
                  description: "content.",
                  items: {
                    type: "object",
                    description:
                      "A content block within a message. The fields used depend on `type`. For replaying a multi-turn conversation, blocks such as `tool_use`, `tool_result`, `thinking`, `redacted_thinking`, `server_tool_use`, and `web_search_tool_result` are returned verbatim.",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "text",
                          "image",
                          "tool_use",
                          "tool_result",
                          "thinking",
                          "redacted_thinking",
                          "server_tool_use",
                          "web_search_tool_result",
                        ],
                        description: "The type of content block.",
                      },
                      text: {
                        type: "string",
                        description: "Text content. Required when `type` is `text`.",
                      },
                      source: {
                        type: "object",
                        description: "Image source. Required when `type` is `image`.",
                        properties: {
                          type: {
                            type: "string",
                            enum: ["url", "base64"],
                            description: "How the image is provided.",
                          },
                          url: {
                            type: "string",
                            description: "Image URL. Required when `source.type` is `url`.",
                          },
                          media_type: {
                            type: "string",
                            enum: ["image/jpeg", "image/png", "image/gif", "image/webp"],
                            description: "Image MIME type. Required when `source.type` is `base64`.",
                          },
                          data: {
                            type: "string",
                            description: "Base64-encoded image. Required when `source.type` is `base64`.",
                          },
                        },
                        required: [],
                        additionalProperties: false,
                      },
                      id: {
                        type: "string",
                        description: "Block id, replayed verbatim. Used by `tool_use` and `server_tool_use` blocks.",
                      },
                      name: {
                        type: "string",
                        description:
                          "Tool name, replayed verbatim. For `server_tool_use` it is `octen_search`. Used by `tool_use` and `server_tool_use` blocks.",
                      },
                      input: {
                        type: "object",
                        description:
                          "Tool call arguments, replayed verbatim. Used by `tool_use` and `server_tool_use` blocks.",
                        additionalProperties: true,
                      },
                      tool_use_id: {
                        type: "string",
                        description:
                          "The id of the corresponding `tool_use` or `server_tool_use` block. Used by `tool_result` and `web_search_tool_result` blocks.",
                      },
                      content: {
                        description:
                          "Result content. A string or content blocks for `tool_result`; the array of `web_search_result` blocks for `web_search_tool_result`.",
                        oneOf: [
                          {
                            type: "string",
                            description: "content.",
                          },
                          {
                            type: "array",
                            description: "content.",
                            items: {
                              type: "object",
                              description: "content item.",
                              additionalProperties: true,
                            },
                          },
                        ],
                      },
                      is_error: {
                        type: "boolean",
                        description: "Whether the tool execution failed. Used by `tool_result` blocks.",
                      },
                      thinking: {
                        type: "string",
                        description: "Thinking content, replayed verbatim. Required when `type` is `thinking`.",
                      },
                      signature: {
                        type: "string",
                        description: "Thinking signature, replayed verbatim. Required when `type` is `thinking`.",
                      },
                      thought_signature: {
                        type: "string",
                        description:
                          "Encrypted reasoning state, replayed verbatim. Required when the request ends with a `tool_result`.",
                      },
                      data: {
                        type: "string",
                        description:
                          "Encrypted thinking content, replayed verbatim. Required when `type` is `redacted_thinking`.",
                      },
                      citations: {
                        type: "array",
                        description:
                          "Citations returned with assistant text. Replay every citation unchanged, including encrypted_index.",
                        items: {
                          type: "object",
                          description:
                            "A citation into a search result. Returned only when `octen_search` was used and the text cites a result.",
                          properties: {
                            type: {
                              type: "string",
                              enum: ["web_search_result_location"],
                              description: "The citation type.",
                            },
                            url: {
                              type: "string",
                              description: "The URL of the cited source.",
                            },
                            title: {
                              type: "string",
                              description: "The title of the cited source.",
                            },
                            cited_text: {
                              type: "string",
                              description: "The cited source snippet.",
                            },
                            encrypted_index: {
                              type: "string",
                              description:
                                "Encrypted index of the citation location. Replay verbatim when returning text blocks with citations.",
                            },
                          },
                          additionalProperties: true,
                        },
                      },
                      cache_control: cacheControlSchema,
                    },
                    required: ["type"],
                    additionalProperties: false,
                  },
                },
              ],
            },
          },
          required: ["role", "content"],
          additionalProperties: false,
        },
      },
      system: {
        description: "System prompt. A plain string or an array of text blocks supporting `cache_control`.",
        oneOf: [
          {
            type: "string",
            description: "system.",
          },
          {
            type: "array",
            description: "system.",
            items: {
              type: "object",
              description: "A system prompt text block.",
              properties: {
                type: {
                  type: "string",
                  enum: ["text"],
                  description: "The block type. Always `text`.",
                },
                text: {
                  type: "string",
                  description: "The system prompt content.",
                },
                cache_control: cacheControlSchema,
              },
              required: ["type", "text"],
              additionalProperties: false,
            },
          },
        ],
      },
      tools: {
        type: "array",
        description: "tools.",
        items: {
          description:
            "A tool definition. One of a custom tool, the built-in `octen_broad_search` tool, or the `octen_search` tool.",
          oneOf: [
            {
              type: "object",
              description: "A custom tool, executed by the caller and returned via a `tool_result` block.",
              properties: {
                name: {
                  type: "string",
                  description: "The tool name.",
                },
                description: {
                  type: "string",
                  description: "A description of what the custom tool does.",
                },
                input_schema: {
                  type: "object",
                  description: "The custom tool's parameter definition in JSON Schema format.",
                  additionalProperties: true,
                },
                strict: {
                  type: "boolean",
                  description: "Whether to enable strict mode for a custom tool.",
                },
                cache_control: cacheControlSchema,
              },
              required: ["name"],
              additionalProperties: false,
            },
            {
              type: "object",
              description: "The built-in `octen_broad_search` server tool, executed by Octen.",
              properties: {
                type: {
                  type: "string",
                  enum: ["octen_broad_search"],
                  description: "The type of tool. Always `octen_broad_search`.",
                },
                name: {
                  type: "string",
                  enum: ["octen_broad_search"],
                  description: "The tool name. Always `octen_broad_search`.",
                },
                parameters: parametersSchema,
                cache_control: cacheControlSchema,
              },
              required: ["type", "name"],
              additionalProperties: false,
            },
            {
              type: "object",
              description: "The built-in `octen_search` server tool, executed by Octen.",
              properties: {
                type: {
                  type: "string",
                  enum: ["octen_search"],
                  description: "The type of tool. Always `octen_search`.",
                },
                name: {
                  type: "string",
                  enum: ["octen_search"],
                  description: "The tool name. Always `octen_search`.",
                },
                parameters: parametersSchema2,
                cache_control: cacheControlSchema,
              },
              required: ["type", "name"],
              additionalProperties: false,
            },
          ],
        },
      },
      tool_choice: {
        type: "object",
        description: "Controls whether and how the model calls tools.",
        properties: {
          type: {
            type: "string",
            enum: ["auto", "any", "tool", "none"],
            description:
              "`auto`: model decides; `any`: must call a tool; `tool`: call a specific tool; `none`: no tools.",
          },
          name: {
            type: "string",
            description:
              "The tool name to force. Required when `type` is `tool` (e.g. `octen_broad_search` or `octen_search`).",
          },
          disable_parallel_tool_use: {
            type: "boolean",
            description: "When `true`, the model issues at most one tool call per turn.",
          },
        },
        required: [],
        additionalProperties: false,
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Controls randomness.",
      },
      top_p: {
        type: "number",
        exclusiveMinimum: 0,
        maximum: 1,
        description:
          "Nucleus sampling. If unset, no nucleus truncation is applied. Set only one of `temperature` and `top_p`.",
      },
      top_k: {
        type: "integer",
        minimum: 0,
        description: "Sample only from the top K tokens. If unset, top-k filtering is disabled.",
      },
      stop_sequences: {
        type: "array",
        description: "Stop sequences.",
        items: {
          type: "string",
          description: "stop sequences item.",
        },
      },
      thinking: {
        type: "object",
        description: "Thinking options for reasoning models.",
        properties: {
          type: {
            type: "string",
            enum: ["enabled", "disabled", "adaptive", "between_tools"],
            description: "`adaptive` lets the model decide the thinking depth.",
          },
          budget_tokens: {
            type: "integer",
            minimum: 1024,
            description:
              "Thinking token budget. Required when `type` is `enabled`; must be less than `max_tokens`. Not allowed when `type` is `adaptive`, `disabled`, or `between_tools`.",
          },
          display: {
            type: "string",
            enum: ["summarized", "omitted"],
            description:
              "Controls how thinking is shown. `summarized` returns thinking blocks; `omitted` returns only the signature so blocks can be replayed. Valid only when `type` is `enabled` or `adaptive`.",
          },
        },
        required: [],
        additionalProperties: false,
      },
      metadata: {
        type: "object",
        description: "Request metadata.",
        properties: {
          user_id: {
            type: "string",
            description:
              "A unique identifier for the end user. Use hashed or pseudonymous identifiers to avoid passing personally identifiable information.",
          },
        },
        required: [],
        additionalProperties: false,
      },
      output_config: {
        type: "object",
        description: "Controls how the model produces its output.",
        properties: {
          effort: {
            type: "string",
            enum: ["low", "medium", "high", "xhigh", "max"],
            description: "Reasoning effort for reasoning models.",
          },
          format: {
            type: "object",
            description: "Structured output. Constrains the model to return content matching a JSON Schema.",
            properties: {
              type: {
                type: "string",
                enum: ["json_schema"],
                description: "The structured output type. Always `json_schema`.",
              },
              schema: {
                type: "object",
                description: "The JSON Schema the output must conform to.",
                additionalProperties: true,
              },
            },
            required: ["type", "schema"],
            additionalProperties: false,
          },
        },
        required: [],
        additionalProperties: false,
      },
      cache_control: {
        type: "object",
        description:
          "Top-level prompt caching marker. Sets a cache breakpoint on the last cacheable content block in the request, equivalent to setting `cache_control` on that block directly.",
        properties: {
          type: {
            type: "string",
            enum: ["ephemeral"],
            description: "The cache control type. Always `ephemeral`.",
          },
          ttl: {
            type: "string",
            enum: ["5m", "1h"],
            description: "Cache lifetime.",
          },
        },
        required: ["type"],
        additionalProperties: false,
      },
    },
    required: ["model", "max_tokens", "messages"],
    additionalProperties: false,
  },
  generate_images: {
    type: "object",
    description: "JSON request body for the Image Generation API.",
    properties: {
      model: {
        type: "string",
        enum: [
          "openai/gpt-image-2.5-flare",
          "openai/gpt-image-2.5-sunburst",
          "openai/gpt-image-2",
          "openai/gpt-image-1-mini",
          "google/gemini-3-pro-image",
          "google/gemini-3.1-flash-image",
          "nano-banana-pro",
          "nano-banana-2",
        ],
        description:
          "The model to use. Aliases `nano-banana-pro` (= `google/gemini-3-pro-image`) and `nano-banana-2` (= `google/gemini-3.1-flash-image`) are also accepted.",
      },
      prompt: {
        type: "string",
        description: "The text description for the model. The length limit is set by the model.",
      },
      n: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description:
          "(GPT only) Number of images to generate. For Gemini, request multiple images in the `prompt` instead.",
      },
      size: {
        type: "string",
        description: "Output size as `width x height` (e.g. `1024x1024`) or `auto`.",
      },
      quality: {
        type: "string",
        enum: ["low", "medium", "high", "xhigh", "max", "auto"],
        description: "(GPT only) Generation quality.",
      },
      background: {
        type: "string",
        enum: ["transparent", "opaque", "auto"],
        description: "(GPT only) Background setting.",
      },
      output_format: {
        type: "string",
        enum: ["png", "jpeg", "webp"],
        description:
          "Output image format. GPT supports png/jpeg/webp; Gemini supports png/jpeg (webp falls back to png).",
      },
      output_compression: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "(GPT only) Compression level (percent). Effective only when `output_format` is jpeg or webp.",
      },
      moderation: {
        type: "string",
        enum: ["low", "auto"],
        description: "(GPT only) Content moderation strength.",
      },
      thinking_level: {
        type: "string",
        enum: ["minimal", "high"],
        description: "(Gemini only) Thinking effort before generation.",
      },
      response_modalities: {
        type: "array",
        description:
          '(Gemini only) Controls returned modalities. `["text","image"]` returns the image plus accompanying text; `["image"]` returns only the image.',
        items: {
          type: "string",
          enum: ["text", "image"],
          description: "response modalities item.",
        },
      },
      media_resolution: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "(Gemini only) Processing resolution for input reference images.",
      },
      user: {
        type: "string",
        description:
          "A unique identifier for the end user. Use hashed or pseudonymous identifiers to avoid passing personally identifiable information.",
      },
      image_urls: {
        type: "array",
        description: "Public reference image URLs. The connector downloads them for editing; do not pass base64.",
        items: {
          type: "string",
          format: "uri",
          description: "Public reference image URL.",
        },
        minItems: 1,
      },
      mask_url: {
        type: "string",
        format: "uri",
        description: "Public PNG mask URL matching the reference image dimensions; transparent areas are repainted.",
      },
    },
    required: ["model", "prompt"],
    additionalProperties: false,
    dependentRequired: {
      mask_url: ["image_urls"],
    },
  },
  generate_video: {
    type: "object",
    description: "JSON request body for the Video Generation API.",
    properties: {
      model: {
        type: "string",
        enum: [
          "minimax/minimax-h3",
          "bytedance/seedance-2.5",
          "google/veo-3.1",
          "google/veo-3.1-fast",
          "google/veo-3.1-lite",
        ],
        description: "The model to use.",
      },
      prompt: {
        type: "string",
        description: "The text description of the video.",
      },
      duration: {
        type: "integer",
        description: "Video length in seconds. When omitted, the model default applies.",
      },
      resolution: {
        type: "string",
        enum: ["480p", "720p", "768p", "1080p", "2K"],
        description: "Output resolution. When omitted, the model default applies.",
      },
      aspect_ratio: {
        type: "string",
        enum: ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "adaptive"],
        description:
          "Aspect ratio. `adaptive` lets the model follow the input. When omitted, the model default applies.",
      },
      frame_images: {
        type: "array",
        description: "Images to use as the first and last frames of the video.",
        items: {
          type: "object",
          description: "frame images item.",
          properties: {
            image: {
              type: "string",
              description: "Image URL or base64 data.",
            },
            frame_type: {
              type: "string",
              enum: ["first_frame", "last_frame"],
              description: "Whether the image is the first or the last frame.",
            },
          },
          required: ["image", "frame_type"],
          additionalProperties: false,
        },
      },
      input_references: {
        type: "array",
        description: "Reference images that guide generation without locking specific frames.",
        items: {
          type: "object",
          description: "input references item.",
          properties: {
            image: {
              type: "string",
              description: "Image URL or base64 data.",
            },
          },
          required: ["image"],
          additionalProperties: false,
        },
      },
      generate_audio: {
        type: "boolean",
        description: "Whether to generate audio along with the video.",
      },
      seed: {
        type: "integer",
        description: "Random seed, for more reproducible results.",
      },
      extra_params: {
        type: "object",
        description:
          "Vendor-specific parameters, passed through to the upstream model without validation. Keys that duplicate a unified parameter, or that control upstream storage, notification, sample count, or platform behavior, are rejected.",
        additionalProperties: true,
      },
    },
    required: ["model", "prompt"],
    additionalProperties: false,
  },
  generate_grounded: {
    type: "object",
    description: "Request body for the Grounded Generation API.",
    properties: {
      modality: {
        type: "string",
        enum: ["image", "video"],
        description: "The type of output to generate.",
      },
      prompt: {
        type: "string",
        minLength: 1,
        maxLength: 8000,
        description: "The text description of what to generate.",
      },
      model: {
        type: "string",
        enum: ["google/gemini-3-pro-image", "google/gemini-3.1-flash-image", "minimax/hailuo-3"],
        description: "The model to use. When omitted, the model default applies.",
      },
      aspect_ratio: {
        type: "string",
        enum: ["16:9", "1:1", "9:16"],
        description: "Aspect ratio of the output.",
      },
      duration: {
        type: "integer",
        minimum: 5,
        maximum: 10,
        description:
          "Video length in seconds. Applies when `modality` is `video`. Values outside the allowed range are adjusted to the nearest bound.",
      },
    },
    required: ["modality", "prompt"],
    additionalProperties: false,
  },
};
