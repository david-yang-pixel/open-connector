import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { octenInputs } from "./inputs.ts";
export const octenRoutes: Record<
  string,
  {
    path: string;
    method: string;
  }
> = {
  search: {
    path: "/search",
    method: "POST",
  },
  broad_search: {
    path: "/broad-search",
    method: "POST",
  },
  search_news: {
    path: "/news-search",
    method: "POST",
  },
  search_business: {
    path: "/business-search",
    method: "POST",
  },
  search_images: {
    path: "/image-search",
    method: "POST",
  },
  search_videos: {
    path: "/video-search",
    method: "POST",
  },
  extract: {
    path: "/extract",
    method: "POST",
  },
  embed_text: {
    path: "/embedding",
    method: "POST",
  },
  embed_multimodal: {
    path: "/vl-embedding",
    method: "POST",
  },
  chat: {
    path: "/v1/chat/completions",
    method: "POST",
  },
  messages: {
    path: "/v1/messages",
    method: "POST",
  },
  answer: {
    path: "/answer",
    method: "POST",
  },
  research: {
    path: "/v1/research",
    method: "POST",
  },
  generate_images: {
    path: "/v1/images/generations",
    method: "POST",
  },
  generate_video: {
    path: "/v1/videos",
    method: "POST",
  },
  get_video: {
    path: "/v1/videos/{id}",
    method: "GET",
  },
  generate_grounded: {
    path: "/v1/grounded-generation",
    method: "POST",
  },
  get_grounded_generation: {
    path: "/v1/grounded-generation/{generation_id}",
    method: "GET",
  },
};
const search = defineProviderAction("octen", {
  name: "search",
  description: "Search the live web with domain, time, language, highlight and full-content options.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.search!,
  outputSchema: {
    type: "object",
    description: "Octen search response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const broad_search = defineProviderAction("octen", {
  name: "broad_search",
  description: "Decompose a question into concurrent web searches and return the combined results.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.broad_search!,
  outputSchema: {
    type: "object",
    description: "Octen broad search response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const search_news = defineProviderAction("octen", {
  name: "search_news",
  description: "Search recent news and optionally group related coverage into subjects.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.search_news!,
  outputSchema: {
    type: "object",
    description: "Octen search news response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const search_business = defineProviderAction("octen", {
  name: "search_business",
  description: "Search business news and retrieve company and person entity cards.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.search_business!,
  outputSchema: {
    type: "object",
    description: "Octen search business response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload. Fields without data are omitted, at every level.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const search_images = defineProviderAction("octen", {
  name: "search_images",
  description: "Search images by text or reference image, with domain and safe-search filters.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.search_images!,
  outputSchema: {
    type: "object",
    description: "Octen search images response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the Image Search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const search_videos = defineProviderAction("octen", {
  name: "search_videos",
  description: "Search videos by text. Requires Octen invite-only beta access.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.search_videos!,
  outputSchema: {
    type: "object",
    description: "Octen search videos response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the Video Search request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const extract = defineProviderAction("octen", {
  name: "extract",
  description: "Extract clean text or Markdown and media from URLs, preserving per-URL failures.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.extract!,
  outputSchema: {
    type: "object",
    description: "Octen extract response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main extract response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the extract request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const embed_text = defineProviderAction("octen", {
  name: "embed_text",
  description: "Create semantic vectors for text queries or documents.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.embed_text!,
  outputSchema: {
    type: "object",
    description: "Octen embed text response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main embedding response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the embedding request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const embed_multimodal = defineProviderAction("octen", {
  name: "embed_multimodal",
  description: "Embed text, images and video into a shared vector space, optionally fusing inputs.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.embed_multimodal!,
  outputSchema: {
    type: "object",
    description: "Octen embed multimodal response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      code: {
        description: "Business status code. 0 indicates success.",
        type: "integer",
      },
      msg: {
        description: "A message describing the result.",
        type: "string",
      },
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      data: {
        description: "The main VL embedding response payload.",
        type: "object",
        additionalProperties: true,
      },
      meta: {
        description: "Additional metadata for the VL embedding request.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const chat = defineProviderAction("octen", {
  name: "chat",
  description:
    "Run an OpenAI-compatible model conversation with tools and optional live web search. Returns the complete non-streaming response.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.chat!,
  outputSchema: {
    type: "object",
    description: "Octen chat response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      object: {
        description: "The object type, always `chat.completion` for non-streaming responses.",
        type: "string",
      },
      created: {
        description: "Unix timestamp (in seconds) of when the completion was created.",
        type: "integer",
      },
      model: {
        description: "The model used for this completion.",
        type: "string",
      },
      choices: {
        description: "A list of completion choices.",
        type: "array",
        items: {
          description: "A single completion choice in a non-streaming response.",
          type: "object",
          additionalProperties: true,
        },
      },
      search_results: {
        description: "Search results. Present only when `octen_search` was actually triggered.",
        type: "array",
        items: {
          description: "Search results for a single auto-generated query. One element per search.",
          type: "object",
          additionalProperties: true,
        },
      },
      usage: {
        description: "Token usage information. When `stream=true`, returned only in the final `usage` chunk.",
        type: "object",
        additionalProperties: true,
      },
      warning: {
        description: "Warning message, if any.",
        type: "string",
      },
    },
  },
});
const messages = defineProviderAction("octen", {
  name: "messages",
  description:
    "Run an Anthropic-compatible model conversation with tools, thinking and optional live web search. Returns the complete response.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.messages!,
  outputSchema: {
    type: "object",
    description: "Octen messages response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      type: {
        description: "The response type. `message` on success.",
        type: "string",
      },
      role: {
        description: "Always `assistant`.",
        type: "string",
      },
      model: {
        description: "The model used for this response.",
        type: "string",
      },
      content: {
        description: "The response content, as a list of content blocks.",
        type: "array",
        items: {
          description: "A content block in the response. The fields present depend on `type`.",
          type: "object",
          additionalProperties: true,
        },
      },
      stop_reason: {
        description: "Why the model stopped.",
        type: "string",
      },
      stop_details: {
        description: "Additional detail about why the model stopped. Returned only when `stop_reason` is `refusal`.",
        type: "object",
        additionalProperties: true,
      },
      stop_sequence: {
        description: "The stop sequence that was hit, or `null`.",
        type: ["string", "null"],
      },
      usage: {
        description: "Token usage information.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const answer = defineProviderAction("octen", {
  name: "answer",
  description: "Generate a grounded answer with citations from live search. Returns the complete response.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.answer!,
  outputSchema: {
    type: "object",
    description: "Octen answer response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      request_id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      object: {
        description: "The object type, always `chat.completion` for non-streaming responses.",
        type: "string",
      },
      created: {
        description: "Unix timestamp (in seconds) of when the completion was created.",
        type: "number",
      },
      model: {
        description: "The model used for this completion.",
        type: "string",
      },
      choices: {
        description: "A list of completion choices containing the synthesized response.",
        type: "array",
        items: {
          description: "A single completion choice in a non-streaming response.",
          type: "object",
          additionalProperties: true,
        },
      },
      queries: {
        description: "The list of sub-queries automatically generated from the user message by the system.",
        type: "array",
        items: {
          description: "queries item",
          type: "string",
        },
      },
      search_results: {
        description: "Search results grouped by query. Each sub-query has a corresponding result group.",
        type: "array",
        items: {
          description: "A group of search results for a single sub-query.",
          type: "object",
          additionalProperties: true,
        },
      },
      meta: {
        description: "Metadata for the Answer response.",
        type: "object",
        additionalProperties: true,
      },
      warning: {
        description: "Warning message, if any.",
        type: ["string", "null"],
      },
    },
  },
});
const research = defineProviderAction("octen", {
  name: "research",
  description:
    "Research a question and collect the SSE report and evidence as JSON. May return a plan requiring caller selections; resume with plan_id and selections.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.research!,
  outputSchema: {
    type: "object",
    description: "Collected research events and final report.",
    additionalProperties: true,
    required: ["status", "events", "report"],
    properties: {
      status: {
        type: "string",
        enum: ["completed", "requires_selection"],
        description: "Whether the report completed or the plan requires user selections.",
      },
      report: {
        type: "string",
        description: "Accumulated Markdown report text.",
      },
      events: {
        type: "array",
        description: "Original research events, including plans, citations, HTML and usage.",
        items: {
          type: "object",
          additionalProperties: true,
          description: "One original research event.",
        },
      },
      plan_id: {
        type: "string",
        description: "Plan ID for a continuation request, retained by Octen for 30 minutes.",
      },
    },
  },
});
const generate_images = defineProviderAction("octen", {
  name: "generate_images",
  description:
    "Generate or edit images, downloading reference image URLs and returning temporary file URLs instead of base64.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: octenInputs.generate_images!,
  outputSchema: {
    type: "object",
    description: "Octen generate images response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      id: {
        description: "The unique identifier for this request.",
        type: "string",
      },
      created: {
        description: "Unix timestamp (in seconds) of when the request was created.",
        type: "integer",
      },
      background: {
        description: "(GPT only) The background setting actually applied.",
        type: "string",
      },
      output_format: {
        description: "The output format actually applied; for Gemini, derived from the mimeType.",
        type: "string",
      },
      quality: {
        description: "(GPT only) The quality tier actually applied.",
        type: "string",
      },
      size: {
        description: "(GPT only) The output size actually applied; useful when `size` was `auto`.",
        type: "string",
      },
      data: {
        type: "array",
        description: "Generated images with temporary file URLs instead of base64.",
        items: {
          type: "object",
          additionalProperties: true,
          description: "One generated image.",
          properties: {
            url: {
              type: "string",
              description: "Temporary connector file URL.",
            },
          },
        },
      },
      text: {
        description:
          "(Gemini only) Plain-text summary of text the model produced alongside the image. For exact interleaving, read `parts`.",
        type: "string",
      },
      parts: {
        description: "(Gemini only) Content parts in the model's original order, preserving text/image interleaving.",
        type: "array",
        items: {
          description: "An ordered content part preserving the original text/image interleaving.",
          type: "object",
          additionalProperties: true,
        },
      },
      usage: {
        description: "Token usage information.",
        type: "object",
        additionalProperties: true,
      },
    },
  },
});
const generate_video = defineProviderAction("octen", {
  name: "generate_video",
  description: "Start video generation from text and optional reference images; wait with get_video.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: octenInputs.generate_video!,
  outputSchema: {
    type: "object",
    description: "Octen generate video response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      id: {
        description: "Unique task id, used to download the video.",
        type: "string",
      },
      model: {
        description: "The model used for this task.",
        type: "string",
      },
      status: {
        description: "Task state.",
        type: "string",
      },
      created: {
        description: "Unix timestamp in seconds when the task was created.",
        type: "integer",
      },
    },
    required: ["id"],
  },
  asyncLifecycle: {
    startActionId: "octen.generate_video",
    statusActionId: "octen.get_video",
  },
});
const get_video = defineProviderAction("octen", {
  name: "get_video",
  description: "Read a video generation task and its signed download URL when completed.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("Task lookup parameters.", {
    id: s.string("Task identifier returned by submission.", {
      minLength: 1,
      not: { enum: [".", ".."] },
    }),
  }),
  outputSchema: {
    type: "object",
    description: "Octen get video response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      id: {
        description: "Unique task id, used to download the video.",
        type: "string",
      },
      model: {
        description: "The model used for this task.",
        type: "string",
      },
      status: {
        description: "Task state.",
        type: "string",
      },
      created: {
        description: "Unix timestamp in seconds when the task was created.",
        type: "integer",
      },
      video_url: {
        description:
          "Signed download URL for the video file, present when `status` is `completed`. Valid for 7 days after generation.",
        type: "string",
      },
      expires_at: {
        description: "Unix timestamp in seconds when `video_url` expires. Present when `status` is `completed`.",
        type: "integer",
      },
      duration: {
        description: "Length of the generated video in seconds. Present when `status` is `completed`.",
        type: "integer",
      },
      resolution: {
        description: "Resolution of the generated video. Present when `status` is `completed`.",
        type: "string",
      },
      usage: {
        description: "Metering for the task. Present only when `status` is `completed`.",
        type: "object",
        additionalProperties: true,
      },
      error: {
        description: "Failure reason, present when `status` is `failed`.",
        type: "string",
      },
      code: {
        description: "Machine-readable failure code, present when `status` is `failed`.",
        type: "string",
      },
    },
    required: ["status"],
  },
});
const generate_grounded = defineProviderAction("octen", {
  name: "generate_grounded",
  description: "Start image or video generation grounded in live web references; wait with get_grounded_generation.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: octenInputs.generate_grounded!,
  outputSchema: {
    type: "object",
    description: "Octen generate grounded response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      request_id: {
        description: "Unique identifier for the request.",
        type: "string",
      },
      generation_id: {
        description: "Unique task id, used to retrieve the result.",
        type: "string",
      },
      modality: {
        description: "The type of output this task generates.",
        type: "string",
      },
      status: {
        description: "Task state.",
        type: "string",
      },
      created_at: {
        description: "Unix timestamp in seconds when the task was created.",
        type: "integer",
      },
    },
    required: ["generation_id"],
  },
  asyncLifecycle: {
    startActionId: "octen.generate_grounded",
    statusActionId: "octen.get_grounded_generation",
  },
});
const get_grounded_generation = defineProviderAction("octen", {
  name: "get_grounded_generation",
  description: "Read grounded generation status, result URL and source references.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.requiredObject("Task lookup parameters.", {
    generation_id: s.string("Task identifier returned by submission.", {
      minLength: 1,
      not: { enum: [".", ".."] },
    }),
  }),
  outputSchema: {
    type: "object",
    description: "Octen get grounded generation response with upstream fields preserved.",
    additionalProperties: true,
    properties: {
      request_id: {
        description: "Unique identifier for the request.",
        type: "string",
      },
      generation_id: {
        description: "Unique task id.",
        type: "string",
      },
      modality: {
        description: "The type of output this task generates.",
        type: "string",
      },
      status: {
        description: "Task state.",
        type: "string",
      },
      output_url: {
        description:
          "Signed download URL for the output, present when `status` is `succeeded`. Requires no API key, and is valid for 7 days after the task was created.",
        type: "string",
      },
      references: {
        description: "The reference material used to generate the output.",
        type: "array",
        items: {
          description: "A single piece of reference material.",
          type: "object",
          additionalProperties: true,
        },
      },
      search_results: {
        description: "The search results the references were selected from, grouped by query.",
        type: "array",
        items: {
          description: "The results for one search query.",
          type: "object",
          additionalProperties: true,
        },
      },
      error: {
        description: "Failure reason, present when `status` is `failed`. Failed tasks are not billed.",
        type: "object",
        additionalProperties: true,
      },
      created_at: {
        description: "Unix timestamp in seconds when the task was created.",
        type: "integer",
      },
      updated_at: {
        description: "Unix timestamp in seconds when the task was last updated.",
        type: "integer",
      },
      usage: {
        description: "Metering for the task. Present only when `status` is `succeeded`.",
        type: "object",
        additionalProperties: true,
      },
    },
    required: ["status"],
  },
});
export const octenActions: ActionDefinition[] = [
  search,
  broad_search,
  search_news,
  search_business,
  search_images,
  search_videos,
  extract,
  embed_text,
  embed_multimodal,
  chat,
  messages,
  answer,
  research,
  generate_images,
  generate_video,
  get_video,
  generate_grounded,
  get_grounded_generation,
];
