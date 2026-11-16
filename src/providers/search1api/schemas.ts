import type { JsonSchema } from "../../core/types.ts";
export const search1apiInputs: Record<string, JsonSchema> = {
  feedback: {
    type: "object",
    properties: {
      message: {
        type: "string",
        minLength: 1,
        maxLength: 4000,
        description: "Human-readable message.",
      },
      intent: {
        type: "string",
        maxLength: 2000,
        description: "Task intent or interpreted search intent.",
      },
      category: {
        type: "string",
        enum: ["bug", "feature_request", "docs", "other"],
        description: "Feedback category.",
      },
      request_id: {
        type: "string",
        maxLength: 256,
        description: "Original request identifier.",
      },
      agent: {
        type: "object",
        properties: {
          name: {
            type: "string",
            maxLength: 128,
            description: "Agent name.",
          },
          model: {
            type: "string",
            maxLength: 128,
            description: "Agent model.",
          },
        },
        additionalProperties: false,
        description: "Agent name and model; do not include credentials or private content.",
      },
    },
    required: ["message"],
    additionalProperties: false,
    description: "Product feedback parameters.",
  },
  screenshot: {
    type: "object",
    properties: {
      url: {
        type: "string",
        format: "uri",
        maxLength: 4096,
        description: "Public source URL for Search1API to retrieve.",
      },
      format: {
        type: "string",
        enum: ["png", "jpeg", "webp"],
        description: "Screenshot image format.",
      },
      full_page: {
        type: "boolean",
        description: "Capture the full page; cannot be combined with selector.",
      },
      viewport: {
        type: "object",
        properties: {
          width: {
            type: "integer",
            minimum: 320,
            maximum: 2560,
            description: "Viewport width in CSS pixels.",
          },
          height: {
            type: "integer",
            minimum: 200,
            maximum: 1440,
            description: "Viewport height in CSS pixels.",
          },
          device_scale_factor: {
            type: "number",
            minimum: 1,
            maximum: 2,
            description: "Device pixel ratio.",
          },
        },
        additionalProperties: false,
        description: "Browser viewport settings.",
      },
      wait_until: {
        type: "string",
        enum: ["domcontentloaded", "load", "networkidle"],
        description: "Browser lifecycle event to wait for.",
      },
      wait_for_selector: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        description: "Wait until this CSS selector is visible.",
      },
      selector: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        description: "Capture the element matching this CSS selector.",
      },
      delay_ms: {
        type: "integer",
        minimum: 0,
        maximum: 5000,
        description: "Additional delay before capture, in milliseconds.",
      },
      timeout_ms: {
        type: "integer",
        minimum: 1000,
        maximum: 30000,
        description: "Upstream screenshot deadline, in milliseconds.",
      },
      quality: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "JPEG or WebP quality.",
      },
      omit_background: {
        type: "boolean",
        description: "Omit the page background where supported.",
      },
      color_scheme: {
        type: "string",
        enum: ["light", "dark"],
        description: "Preferred page color scheme.",
      },
      animations: {
        type: "string",
        enum: ["disabled", "allow"],
        description: "Animation handling during capture.",
      },
    },
    required: ["url"],
    additionalProperties: false,
    description: "Screenshot capture parameters.",
    not: {
      additionalProperties: true,
      required: ["full_page", "selector"],
      properties: {
        full_page: {
          const: true,
        },
      },
    },
  },
  search_batch: {
    type: "object",
    properties: {
      requests: {
        type: "array",
        items: {
          type: "object",
          properties: {
            query: {
              type: "string",
              minLength: 1,
              description: "Search query.",
            },
            search_service: {
              type: "string",
              enum: [
                "google",
                "bing",
                "bingcn",
                "duckduckgo",
                "yahoo",
                "yandex",
                "youtube",
                "x",
                "reddit",
                "github",
                "arxiv",
                "wechat",
                "bilibili",
                "imdb",
                "wikipedia",
                "grokipedia",
                "",
                "baidu",
                "360",
                "quark",
              ],
              description: "Search engine or trending source.",
            },
            max_results: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              description: "Maximum number of results.",
            },
            page: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Native search result page, starting at 1.",
            },
            crawl_results: {
              type: "integer",
              minimum: 0,
              maximum: 50,
              description: "Number of result pages to read; each page may consume additional credits.",
            },
            image: {
              type: "boolean",
              description: "Include image results.",
            },
            include_sites: {
              type: "array",
              items: {
                type: "string",
                description: "One item: Restrict results to these sites.",
              },
              description: "Restrict results to these sites.",
            },
            exclude_sites: {
              type: "array",
              items: {
                type: "string",
                description: "One item: Exclude these sites.",
              },
              description: "Exclude these sites.",
            },
            language: {
              type: "string",
              description: "Preferred result language.",
            },
            time_range: {
              type: "string",
              enum: ["day", "week", "month", "year", ""],
              description: "Publication time window.",
            },
          },
          required: ["query"],
          additionalProperties: false,
          description: "One item: Requests processed as one upstream batch; individual failures are preserved.",
        },
        minItems: 1,
        description: "Requests processed as one upstream batch; individual failures are preserved.",
      },
    },
    required: ["requests"],
    additionalProperties: false,
    description: "Requests processed as one upstream batch; individual failures are preserved.",
  },
  search: {
    type: "object",
    properties: {
      query: {
        type: "string",
        minLength: 1,
        description: "Search query.",
      },
      search_service: {
        type: "string",
        enum: [
          "google",
          "bing",
          "bingcn",
          "duckduckgo",
          "yahoo",
          "yandex",
          "youtube",
          "x",
          "reddit",
          "github",
          "arxiv",
          "wechat",
          "bilibili",
          "imdb",
          "wikipedia",
          "grokipedia",
          "",
          "baidu",
          "360",
          "quark",
        ],
        description: "Search engine or trending source.",
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        description: "Maximum number of results.",
      },
      page: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description: "Native search result page, starting at 1.",
      },
      crawl_results: {
        type: "integer",
        minimum: 0,
        maximum: 50,
        description: "Number of result pages to read; each page may consume additional credits.",
      },
      image: {
        type: "boolean",
        description: "Include image results.",
      },
      include_sites: {
        type: "array",
        items: {
          type: "string",
          description: "One item: Restrict results to these sites.",
        },
        description: "Restrict results to these sites.",
      },
      exclude_sites: {
        type: "array",
        items: {
          type: "string",
          description: "One item: Exclude these sites.",
        },
        description: "Exclude these sites.",
      },
      language: {
        type: "string",
        description: "Preferred result language.",
      },
      time_range: {
        type: "string",
        enum: ["day", "week", "month", "year", ""],
        description: "Publication time window.",
      },
    },
    required: ["query"],
    additionalProperties: false,
    description: "Web search parameters.",
  },
  news_batch: {
    type: "object",
    properties: {
      requests: {
        type: "array",
        items: {
          type: "object",
          properties: {
            query: {
              type: "string",
              minLength: 1,
              description: "Search query.",
            },
            search_service: {
              type: "string",
              enum: ["google", "bing", "duckduckgo", "yahoo", "hackernews", "", "reuters"],
              description: "Search engine or trending source.",
            },
            max_results: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              description: "Maximum number of results.",
            },
            crawl_results: {
              type: "integer",
              minimum: 0,
              maximum: 50,
              description: "Number of result pages to read; each page may consume additional credits.",
            },
            image: {
              type: "boolean",
              description: "Include image results.",
            },
            include_sites: {
              type: "array",
              items: {
                type: "string",
                description: "One item: Restrict results to these sites.",
              },
              description: "Restrict results to these sites.",
            },
            exclude_sites: {
              type: "array",
              items: {
                type: "string",
                description: "One item: Exclude these sites.",
              },
              description: "Exclude these sites.",
            },
            language: {
              type: "string",
              description: "Preferred result language.",
            },
            time_range: {
              type: "string",
              enum: ["day", "week", "month", "year", ""],
              description: "Publication time window.",
            },
          },
          required: ["query"],
          additionalProperties: false,
          description: "One item: Requests processed as one upstream batch; individual failures are preserved.",
        },
        minItems: 1,
        description: "Requests processed as one upstream batch; individual failures are preserved.",
      },
    },
    required: ["requests"],
    additionalProperties: false,
    description: "Requests processed as one upstream batch; individual failures are preserved.",
  },
  news: {
    type: "object",
    properties: {
      query: {
        type: "string",
        minLength: 1,
        description: "Search query.",
      },
      search_service: {
        type: "string",
        enum: ["google", "bing", "duckduckgo", "yahoo", "hackernews", "", "reuters"],
        description: "Search engine or trending source.",
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        description: "Maximum number of results.",
      },
      crawl_results: {
        type: "integer",
        minimum: 0,
        maximum: 50,
        description: "Number of result pages to read; each page may consume additional credits.",
      },
      image: {
        type: "boolean",
        description: "Include image results.",
      },
      include_sites: {
        type: "array",
        items: {
          type: "string",
          description: "One item: Restrict results to these sites.",
        },
        description: "Restrict results to these sites.",
      },
      exclude_sites: {
        type: "array",
        items: {
          type: "string",
          description: "One item: Exclude these sites.",
        },
        description: "Exclude these sites.",
      },
      language: {
        type: "string",
        description: "Preferred result language.",
      },
      time_range: {
        type: "string",
        enum: ["day", "week", "month", "year", ""],
        description: "Publication time window.",
      },
    },
    required: ["query"],
    additionalProperties: false,
    description: "News search parameters.",
  },
  ask: {
    type: "object",
    properties: {
      query: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        description:
          'What you are looking for, in natural language. Platform hints ("on Reddit", "papers") and time hints ("this week") steer engine and time-range selection.',
      },
    },
    required: ["query"],
    additionalProperties: false,
    description: "Agentic search parameters.",
  },
  crawl_batch: {
    type: "object",
    properties: {
      requests: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: {
              type: "string",
              format: "uri",
              minLength: 1,
              description: "Public source URL for Search1API to retrieve.",
            },
            enableFallback: {
              type: "boolean",
              description: "Enable fallback retrieval when the initial crawl fails; defaults to true.",
            },
          },
          required: ["url"],
          additionalProperties: false,
          description: "One item: Requests processed as one upstream batch; individual failures are preserved.",
        },
        minItems: 1,
        description: "Requests processed as one upstream batch; individual failures are preserved.",
      },
    },
    required: ["requests"],
    additionalProperties: false,
    description: "Requests processed as one upstream batch; individual failures are preserved.",
  },
  crawl: {
    type: "object",
    properties: {
      url: {
        type: "string",
        format: "uri",
        minLength: 1,
        description: "Public source URL for Search1API to retrieve.",
      },
      enableFallback: {
        type: "boolean",
        description: "Enable fallback retrieval when the initial crawl fails; defaults to true.",
      },
    },
    required: ["url"],
    additionalProperties: false,
    description: "Page retrieval parameters.",
  },
  sitemap: {
    type: "object",
    properties: {
      url: {
        type: "string",
        format: "uri",
        description: "Public source URL for Search1API to retrieve.",
      },
      type: {
        type: "string",
        enum: ["sitemap", "all"],
        description: "Use sitemap discovery or discover all links.",
      },
    },
    required: ["url"],
    additionalProperties: false,
    description: "Link discovery parameters.",
  },
  trending: {
    type: "object",
    properties: {
      search_service: {
        type: "string",
        minLength: 1,
        description: "Search engine or trending source.",
      },
      max_results: {
        type: "integer",
        minimum: 1,
        description: "Maximum number of results.",
      },
    },
    required: ["search_service"],
    additionalProperties: false,
    description: "Trending topic parameters.",
  },
  extract: {
    type: "object",
    properties: {
      url: {
        type: "string",
        format: "uri",
        description: "Public source URL for Search1API to retrieve.",
      },
      prompt: {
        type: "string",
        description: "Instructions describing which fields to extract.",
      },
      response_format: {
        type: "object",
        additionalProperties: {
          description: "JSON schema or response format defining the extracted data.",
        },
        description: "JSON schema or response format defining the extracted data.",
      },
    },
    required: ["url"],
    additionalProperties: false,
    description: "Structured extraction parameters.",
  },
  deepcrawl: {
    type: "object",
    properties: {
      url: {
        type: "string",
        format: "uri",
        description: "Public source URL for Search1API to retrieve.",
      },
      type: {
        type: "string",
        enum: ["sitemap", "all"],
        description: "Use sitemap discovery or discover all links.",
      },
    },
    required: ["url"],
    additionalProperties: false,
    description: "Deepcrawl submission parameters.",
  },
  get_deepcrawl: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        minLength: 1,
        description: "Deepcrawl task identifier.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    additionalProperties: false,
    required: ["taskId"],
    description: "Deepcrawl task lookup parameters.",
  },
  health: {
    type: "object",
    properties: {},
    additionalProperties: false,
    description: "Health check parameters.",
  },
  usage: {
    type: "object",
    properties: {
      period: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "Usage reporting period.",
      },
    },
    additionalProperties: false,
    required: [],
    description: "Account usage parameters.",
  },
};
export const search1apiOutputs: Record<string, JsonSchema> = {
  feedback: {
    type: "object",
    required: ["id", "status"],
    properties: {
      id: {
        type: "string",
        pattern: "^fb_[a-zA-Z0-9_-]+$",
        maxLength: 80,
        description: "Feedback identifier.",
      },
      status: {
        type: "string",
        enum: ["new"],
        description: "Current operation status.",
      },
    },
    additionalProperties: true,
    description: "Returned results, including partial batch outcomes where applicable.",
  },
  search: {
    type: "object",
    required: ["searchParameters", "results"],
    properties: {
      searchParameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            minLength: 1,
            description: "Search query.",
          },
          search_service: {
            type: "string",
            enum: [
              "google",
              "bing",
              "bingcn",
              "duckduckgo",
              "yahoo",
              "yandex",
              "youtube",
              "x",
              "reddit",
              "github",
              "arxiv",
              "wechat",
              "bilibili",
              "imdb",
              "wikipedia",
              "grokipedia",
              "",
              "baidu",
              "360",
              "quark",
            ],
            description: "Search engine or trending source.",
          },
          max_results: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            description: "Maximum number of results.",
          },
          page: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            description: "Native search result page, starting at 1.",
          },
          crawl_results: {
            type: "integer",
            minimum: 0,
            maximum: 50,
            description: "Number of result pages to read; each page may consume additional credits.",
          },
          image: {
            type: "boolean",
            description: "Include image results.",
          },
          include_sites: {
            type: "array",
            items: {
              type: "string",
              description: "One item: Restrict results to these sites.",
            },
            description: "Restrict results to these sites.",
          },
          exclude_sites: {
            type: "array",
            items: {
              type: "string",
              description: "One item: Exclude these sites.",
            },
            description: "Exclude these sites.",
          },
          language: {
            type: "string",
            description: "Preferred result language.",
          },
          time_range: {
            type: "string",
            enum: ["day", "week", "month", "year", ""],
            description: "Publication time window.",
          },
        },
        required: ["query"],
        additionalProperties: true,
        description: "Effective search parameters.",
      },
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "link", "snippet"],
          properties: {
            title: {
              type: "string",
              description: "Result title.",
            },
            link: {
              type: "string",
              format: "uri",
              description: "Result source URL.",
            },
            snippet: {
              type: "string",
              description: "Relevant source excerpt.",
            },
            content: {
              type: "string",
              description: "Retrieved page content.",
            },
            published_date: {
              type: "string",
              description: "Source publication date or UTC timestamp; omitted when unknown.",
            },
            metadata: {
              type: "object",
              description: "Source-specific metadata; additional fields are preserved.",
              properties: {
                kind: {
                  type: "string",
                  enum: ["repo", "issue", "pr", "discussion"],
                  description: "GitHub result kind.",
                },
                stars: {
                  type: "integer",
                  description: "Repository star count.",
                },
                language: {
                  type: "string",
                  description: "Preferred result language.",
                },
                num_comments: {
                  type: "integer",
                  description: "Source comment count.",
                },
                story_url: {
                  type: "string",
                  format: "uri",
                  description: "Original article URL for a Hacker News discussion.",
                },
                points: {
                  type: "integer",
                  description: "Hacker News vote count.",
                },
              },
              additionalProperties: true,
            },
          },
          additionalProperties: true,
          description: "One item: Returned results, including partial batch outcomes where applicable.",
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
      images: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
          description: "One item: Image URLs.",
        },
        description: "Image URLs.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  search_batch: {
    type: "object",
    required: ["results", "summary"],
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["success", "cost"],
          properties: {
            success: {
              type: "boolean",
              description: "Whether this operation succeeded.",
            },
            data: {
              type: "object",
              required: ["searchParameters", "results"],
              properties: {
                searchParameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      minLength: 1,
                      description: "Search query.",
                    },
                    search_service: {
                      type: "string",
                      enum: [
                        "google",
                        "bing",
                        "bingcn",
                        "duckduckgo",
                        "yahoo",
                        "yandex",
                        "youtube",
                        "x",
                        "reddit",
                        "github",
                        "arxiv",
                        "wechat",
                        "bilibili",
                        "imdb",
                        "wikipedia",
                        "grokipedia",
                        "",
                        "baidu",
                        "360",
                        "quark",
                      ],
                      description: "Search engine or trending source.",
                    },
                    max_results: {
                      type: "integer",
                      minimum: 1,
                      maximum: 50,
                      description: "Maximum number of results.",
                    },
                    page: {
                      type: "integer",
                      minimum: 1,
                      maximum: 100,
                      description: "Native search result page, starting at 1.",
                    },
                    crawl_results: {
                      type: "integer",
                      minimum: 0,
                      maximum: 50,
                      description: "Number of result pages to read; each page may consume additional credits.",
                    },
                    image: {
                      type: "boolean",
                      description: "Include image results.",
                    },
                    include_sites: {
                      type: "array",
                      items: {
                        type: "string",
                        description: "One item: Restrict results to these sites.",
                      },
                      description: "Restrict results to these sites.",
                    },
                    exclude_sites: {
                      type: "array",
                      items: {
                        type: "string",
                        description: "One item: Exclude these sites.",
                      },
                      description: "Exclude these sites.",
                    },
                    language: {
                      type: "string",
                      description: "Preferred result language.",
                    },
                    time_range: {
                      type: "string",
                      enum: ["day", "week", "month", "year", ""],
                      description: "Publication time window.",
                    },
                  },
                  required: ["query"],
                  additionalProperties: true,
                  description: "Effective search parameters.",
                },
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["title", "link", "snippet"],
                    properties: {
                      title: {
                        type: "string",
                        description: "Result title.",
                      },
                      link: {
                        type: "string",
                        format: "uri",
                        description: "Result source URL.",
                      },
                      snippet: {
                        type: "string",
                        description: "Relevant source excerpt.",
                      },
                      content: {
                        type: "string",
                        description: "Retrieved page content.",
                      },
                      published_date: {
                        type: "string",
                        description: "Source publication date or UTC timestamp; omitted when unknown.",
                      },
                      metadata: {
                        type: "object",
                        description: "Source-specific metadata; additional fields are preserved.",
                        properties: {
                          kind: {
                            type: "string",
                            enum: ["repo", "issue", "pr", "discussion"],
                            description: "GitHub result kind.",
                          },
                          stars: {
                            type: "integer",
                            description: "Repository star count.",
                          },
                          language: {
                            type: "string",
                            description: "Preferred result language.",
                          },
                          num_comments: {
                            type: "integer",
                            description: "Source comment count.",
                          },
                          story_url: {
                            type: "string",
                            format: "uri",
                            description: "Original article URL for a Hacker News discussion.",
                          },
                          points: {
                            type: "integer",
                            description: "Hacker News vote count.",
                          },
                        },
                        additionalProperties: true,
                      },
                    },
                    additionalProperties: true,
                    description: "One item: Returned results, including partial batch outcomes where applicable.",
                  },
                  description: "Returned results, including partial batch outcomes where applicable.",
                },
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uri",
                    description: "One item: Image URLs.",
                  },
                  description: "Image URLs.",
                },
              },
              description: "Successful item response.",
              additionalProperties: true,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Human-readable message.",
                },
                statusCode: {
                  type: "integer",
                  description: "Upstream HTTP status code.",
                },
              },
              description: "Upstream error or failure details.",
              additionalProperties: true,
            },
            cost: {
              type: "integer",
              minimum: 0,
              description: "Credits charged for this item.",
            },
          },
          description: "One item: Returned results, including partial batch outcomes where applicable.",
          additionalProperties: true,
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
      summary: {
        type: "object",
        required: ["total", "successful", "failed", "totalCost"],
        properties: {
          total: {
            type: "integer",
            minimum: 0,
            description: "Total batch items.",
          },
          successful: {
            type: "integer",
            minimum: 0,
            description: "Number of successful items.",
          },
          failed: {
            type: "integer",
            minimum: 0,
            description: "Number of failed items.",
          },
          totalCost: {
            type: "integer",
            minimum: 0,
            description: "Total credits charged.",
          },
        },
        description: "Batch totals, successful and failed counts, and credits.",
        additionalProperties: true,
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  news: {
    type: "object",
    required: ["searchParameters", "results"],
    properties: {
      searchParameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            minLength: 1,
            description: "Search query.",
          },
          search_service: {
            type: "string",
            enum: ["google", "bing", "duckduckgo", "yahoo", "hackernews", "", "reuters"],
            description: "Search engine or trending source.",
          },
          max_results: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            description: "Maximum number of results.",
          },
          crawl_results: {
            type: "integer",
            minimum: 0,
            maximum: 50,
            description: "Number of result pages to read; each page may consume additional credits.",
          },
          image: {
            type: "boolean",
            description: "Include image results.",
          },
          include_sites: {
            type: "array",
            items: {
              type: "string",
              description: "One item: Restrict results to these sites.",
            },
            description: "Restrict results to these sites.",
          },
          exclude_sites: {
            type: "array",
            items: {
              type: "string",
              description: "One item: Exclude these sites.",
            },
            description: "Exclude these sites.",
          },
          language: {
            type: "string",
            description: "Preferred result language.",
          },
          time_range: {
            type: "string",
            enum: ["day", "week", "month", "year", ""],
            description: "Publication time window.",
          },
        },
        required: ["query"],
        additionalProperties: true,
        description: "Effective search parameters.",
      },
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "link", "snippet"],
          properties: {
            title: {
              type: "string",
              description: "Result title.",
            },
            link: {
              type: "string",
              format: "uri",
              description: "Result source URL.",
            },
            snippet: {
              type: "string",
              description: "Relevant source excerpt.",
            },
            content: {
              type: "string",
              description: "Retrieved page content.",
            },
            published_date: {
              type: "string",
              description: "Source publication date or UTC timestamp; omitted when unknown.",
            },
            metadata: {
              type: "object",
              description: "Source-specific metadata; additional fields are preserved.",
              properties: {
                kind: {
                  type: "string",
                  enum: ["repo", "issue", "pr", "discussion"],
                  description: "GitHub result kind.",
                },
                stars: {
                  type: "integer",
                  description: "Repository star count.",
                },
                language: {
                  type: "string",
                  description: "Preferred result language.",
                },
                num_comments: {
                  type: "integer",
                  description: "Source comment count.",
                },
                story_url: {
                  type: "string",
                  format: "uri",
                  description: "Original article URL for a Hacker News discussion.",
                },
                points: {
                  type: "integer",
                  description: "Hacker News vote count.",
                },
              },
              additionalProperties: true,
            },
          },
          additionalProperties: true,
          description: "One item: Returned results, including partial batch outcomes where applicable.",
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
      images: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
          description: "One item: Image URLs.",
        },
        description: "Image URLs.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  news_batch: {
    type: "object",
    required: ["results", "summary"],
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["success", "cost"],
          properties: {
            success: {
              type: "boolean",
              description: "Whether this operation succeeded.",
            },
            data: {
              type: "object",
              required: ["searchParameters", "results"],
              properties: {
                searchParameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      minLength: 1,
                      description: "Search query.",
                    },
                    search_service: {
                      type: "string",
                      enum: ["google", "bing", "duckduckgo", "yahoo", "hackernews", "", "reuters"],
                      description: "Search engine or trending source.",
                    },
                    max_results: {
                      type: "integer",
                      minimum: 1,
                      maximum: 50,
                      description: "Maximum number of results.",
                    },
                    crawl_results: {
                      type: "integer",
                      minimum: 0,
                      maximum: 50,
                      description: "Number of result pages to read; each page may consume additional credits.",
                    },
                    image: {
                      type: "boolean",
                      description: "Include image results.",
                    },
                    include_sites: {
                      type: "array",
                      items: {
                        type: "string",
                        description: "One item: Restrict results to these sites.",
                      },
                      description: "Restrict results to these sites.",
                    },
                    exclude_sites: {
                      type: "array",
                      items: {
                        type: "string",
                        description: "One item: Exclude these sites.",
                      },
                      description: "Exclude these sites.",
                    },
                    language: {
                      type: "string",
                      description: "Preferred result language.",
                    },
                    time_range: {
                      type: "string",
                      enum: ["day", "week", "month", "year", ""],
                      description: "Publication time window.",
                    },
                  },
                  required: ["query"],
                  additionalProperties: true,
                  description: "Effective search parameters.",
                },
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["title", "link", "snippet"],
                    properties: {
                      title: {
                        type: "string",
                        description: "Result title.",
                      },
                      link: {
                        type: "string",
                        format: "uri",
                        description: "Result source URL.",
                      },
                      snippet: {
                        type: "string",
                        description: "Relevant source excerpt.",
                      },
                      content: {
                        type: "string",
                        description: "Retrieved page content.",
                      },
                      published_date: {
                        type: "string",
                        description: "Source publication date or UTC timestamp; omitted when unknown.",
                      },
                      metadata: {
                        type: "object",
                        description: "Source-specific metadata; additional fields are preserved.",
                        properties: {
                          kind: {
                            type: "string",
                            enum: ["repo", "issue", "pr", "discussion"],
                            description: "GitHub result kind.",
                          },
                          stars: {
                            type: "integer",
                            description: "Repository star count.",
                          },
                          language: {
                            type: "string",
                            description: "Preferred result language.",
                          },
                          num_comments: {
                            type: "integer",
                            description: "Source comment count.",
                          },
                          story_url: {
                            type: "string",
                            format: "uri",
                            description: "Original article URL for a Hacker News discussion.",
                          },
                          points: {
                            type: "integer",
                            description: "Hacker News vote count.",
                          },
                        },
                        additionalProperties: true,
                      },
                    },
                    additionalProperties: true,
                    description: "One item: Returned results, including partial batch outcomes where applicable.",
                  },
                  description: "Returned results, including partial batch outcomes where applicable.",
                },
                images: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uri",
                    description: "One item: Image URLs.",
                  },
                  description: "Image URLs.",
                },
              },
              description: "Successful item response.",
              additionalProperties: true,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Human-readable message.",
                },
                statusCode: {
                  type: "integer",
                  description: "Upstream HTTP status code.",
                },
              },
              description: "Upstream error or failure details.",
              additionalProperties: true,
            },
            cost: {
              type: "integer",
              minimum: 0,
              description: "Credits charged for this item.",
            },
          },
          description: "One item: Returned results, including partial batch outcomes where applicable.",
          additionalProperties: true,
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
      summary: {
        type: "object",
        required: ["total", "successful", "failed", "totalCost"],
        properties: {
          total: {
            type: "integer",
            minimum: 0,
            description: "Total batch items.",
          },
          successful: {
            type: "integer",
            minimum: 0,
            description: "Number of successful items.",
          },
          failed: {
            type: "integer",
            minimum: 0,
            description: "Number of failed items.",
          },
          totalCost: {
            type: "integer",
            minimum: 0,
            description: "Total credits charged.",
          },
        },
        description: "Batch totals, successful and failed counts, and credits.",
        additionalProperties: true,
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  ask: {
    type: "object",
    required: ["query", "intent", "results", "errors"],
    properties: {
      query: {
        type: "string",
        description: "Search query.",
      },
      intent: {
        type: "object",
        required: ["search_query", "sources", "time_range"],
        description: "Task intent or interpreted search intent.",
        properties: {
          search_query: {
            type: "string",
            description: "Query sent to the selected engine.",
          },
          sources: {
            type: "array",
            items: {
              type: "string",
              description: "One item: Selected engines.",
            },
            description: "Selected engines.",
          },
          time_range: {
            type: ["string", "null"],
            enum: ["day", "week", "month", "year", null],
            description: "Publication time window.",
          },
        },
        additionalProperties: true,
      },
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "link", "snippet", "source", "relevance"],
          properties: {
            title: {
              type: "string",
              description: "Result title.",
            },
            link: {
              type: "string",
              format: "uri",
              description: "Result source URL.",
            },
            snippet: {
              type: "string",
              description: "Relevant source excerpt.",
            },
            published_date: {
              type: "string",
              description: "Source publication date or UTC timestamp; omitted when unknown.",
            },
            source: {
              type: "string",
              description: "Source engine.",
            },
            relevance: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Relevance score between 0 and 1.",
            },
          },
          description: "One item: Returned results, including partial batch outcomes where applicable.",
          additionalProperties: true,
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
      errors: {
        type: "array",
        description: "Partial engine failures; successful results remain available.",
        items: {
          type: "object",
          required: ["source", "message"],
          properties: {
            source: {
              type: "string",
              description: "Source engine.",
            },
            message: {
              type: "string",
              description: "Human-readable message.",
            },
          },
          description: "One item: Partial engine failures; successful results remain available.",
          additionalProperties: true,
        },
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  crawl: {
    type: "object",
    required: ["crawlParameters", "results"],
    properties: {
      crawlParameters: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Public source URL for Search1API to retrieve.",
          },
        },
        description: "Effective page retrieval parameters.",
        additionalProperties: true,
      },
      results: {
        type: "object",
        required: ["title", "link", "content"],
        properties: {
          title: {
            type: "string",
            description: "Result title.",
          },
          link: {
            type: "string",
            format: "uri",
            description: "Result source URL.",
          },
          content: {
            type: "string",
            description: "Retrieved page content.",
          },
          metadata: {
            type: "object",
            additionalProperties: true,
            description: "Source-specific metadata; additional fields are preserved.",
          },
        },
        additionalProperties: true,
        description: "Returned results, including partial batch outcomes where applicable.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  crawl_batch: {
    type: "object",
    description: "Batch page retrieval responses.",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["crawlParameters", "results"],
          properties: {
            crawlParameters: {
              type: "object",
              required: ["url"],
              properties: {
                url: {
                  type: "string",
                  format: "uri",
                  description: "Public source URL for Search1API to retrieve.",
                },
              },
              description: "Effective page retrieval parameters.",
              additionalProperties: true,
            },
            results: {
              type: "object",
              required: ["title", "link", "content"],
              properties: {
                title: {
                  type: "string",
                  description: "Result title.",
                },
                link: {
                  type: "string",
                  format: "uri",
                  description: "Result source URL.",
                },
                content: {
                  type: "string",
                  description: "Retrieved page content.",
                },
                metadata: {
                  type: "object",
                  additionalProperties: true,
                  description: "Source-specific metadata; additional fields are preserved.",
                },
              },
              additionalProperties: true,
              description: "Returned results, including partial batch outcomes where applicable.",
            },
          },
          description: "One item: Returned results, including partial batch outcomes where applicable.",
          additionalProperties: true,
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
    },
    required: ["results"],
    additionalProperties: false,
  },
  sitemap: {
    type: "object",
    required: ["links"],
    properties: {
      links: {
        type: "array",
        items: {
          type: "string",
          format: "uri",
          description: "One item: Discovered page URLs.",
        },
        description: "Discovered page URLs.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  trending: {
    type: "object",
    required: ["trendingParameters", "results"],
    properties: {
      trendingParameters: {
        type: "object",
        properties: {
          search_service: {
            type: "string",
            minLength: 1,
            description: "Search engine or trending source.",
          },
          max_results: {
            type: "integer",
            minimum: 1,
            description: "Maximum number of results.",
          },
        },
        required: ["search_service"],
        additionalProperties: true,
        description: "Effective trending parameters.",
      },
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "url"],
          properties: {
            title: {
              type: "string",
              description: "Result title.",
            },
            url: {
              type: "string",
              format: "uri",
              description: "Public source URL for Search1API to retrieve.",
            },
            description: {
              type: ["string", "null"],
              description: "Result description.",
            },
          },
          description: "One item: Returned results, including partial batch outcomes where applicable.",
          additionalProperties: true,
        },
        description: "Returned results, including partial batch outcomes where applicable.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  extract: {
    type: "object",
    required: ["success", "extractParameters", "results"],
    properties: {
      success: {
        type: "boolean",
        enum: [true],
        description: "Whether this operation succeeded.",
      },
      extractParameters: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "Public source URL for Search1API to retrieve.",
          },
        },
        description: "Effective extraction parameters.",
        additionalProperties: true,
      },
      results: {
        description: "Returned results, including partial batch outcomes where applicable.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  deepcrawl: {
    type: "object",
    required: ["taskId", "status"],
    properties: {
      taskId: {
        type: "string",
        description: "Deepcrawl task identifier.",
      },
      status: {
        type: "string",
        enum: ["queued"],
        description: "Current operation status.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  get_deepcrawl: {
    type: "object",
    required: ["taskId"],
    properties: {
      taskId: {
        type: "string",
        description: "Deepcrawl task identifier.",
      },
      status: {
        type: "string",
        enum: ["queued", "waiting", "processing", "completed", "failed", "not_found"],
        description: "Current operation status.",
      },
      success: {
        type: "boolean",
        description: "Whether this operation succeeded.",
      },
      message: {
        type: "string",
        description: "Human-readable message.",
      },
      error: {
        type: ["string", "null"],
        description: "Upstream error or failure details.",
      },
      r2Key: {
        type: "string",
        description: "Upstream archive storage key.",
      },
      zipUrl: {
        type: ["string", "null"],
        format: "uri",
        description: "Download URL for the completed crawl archive.",
      },
    },
    additionalProperties: true,
    description: "Returned results, including partial batch outcomes where applicable.",
  },
  health: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        description: "Current operation status.",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "Server timestamp.",
      },
      version: {
        type: "string",
        description: "Server version.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
  usage: {
    type: "object",
    required: ["usage", "credential_type"],
    properties: {
      usage: {
        type: "integer",
        minimum: 0,
        description: "Remaining account credits.",
      },
      user_id: {
        type: ["string", "null"],
        description: "Account user identifier, when available.",
      },
      credential_type: {
        type: "string",
        enum: ["api_key", "oauth"],
        description: "Credential mode recognized by Search1API.",
      },
      client_id: {
        type: ["string", "null"],
        description: "OAuth client identifier, when available.",
      },
    },
    description: "Returned results, including partial batch outcomes where applicable.",
    additionalProperties: true,
  },
};
