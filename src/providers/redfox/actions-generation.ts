import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { taskInputSchema, taskSubmissionSchema, videoResultSchema, imageResultSchema } from "./schemas.ts";

export const generationActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "submit_gpt_image_2_generation",
    operationType: "write",
    description: "Start a GPT Image 2 generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        resolution: s.stringEnum("Output resolution.", ["1k", "2k", "4k"]),
        size: s.stringEnum("Output image aspect ratio or dimensions.", [
          "1:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "5:4",
          "4:5",
          "16:9",
          "9:16",
          "2:1",
          "1:2",
          "21:9",
          "9:21",
        ]),
        n: s.withDefault(s.integer("Number of images to generate, from 1 to 4.", { minimum: 1, maximum: 4 }), 1),
        referenceImages: s.withDefault(
          s.array("Reference image URLs for image-to-image generation.", s.string("Reference image URL."), {
            maxItems: 2,
          }),
          [],
        ),
      },
      { optional: ["referenceImages"] },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gpt_image_2_generation",
      statusActionId: "redfox.get_gpt_image_2_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_gpt_image_2_generation",
    operationType: "read",
    description: "Get the status and output of a GPT Image 2 generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: imageResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gpt_image_2_generation",
      statusActionId: "redfox.get_gpt_image_2_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_gpt_image_2_5_generation",
    operationType: "write",
    description: "Start a GPT Image 2.5 generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        resolution: s.withDefault(s.stringEnum("Output resolution.", ["1k", "2k", "4k", "1K", "2K", "4K"]), "1K"),
        size: s.withDefault(
          s.stringEnum("Output image aspect ratio or dimensions.", [
            "1:1",
            "3:2",
            "2:3",
            "4:3",
            "3:4",
            "5:4",
            "4:5",
            "16:9",
            "9:16",
            "21:9",
          ]),
          "1:1",
        ),
        referenceImages: s.withDefault(
          s.array("Reference image URLs for image-to-image generation.", s.string("Reference image URL.")),
          [],
        ),
        background: s.stringEnum("Set to transparent for transparent output; omit for ordinary image generation.", [
          "transparent",
        ]),
      },
      { optional: ["resolution", "size", "referenceImages", "background"] },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gpt_image_2_5_generation",
      statusActionId: "redfox.get_gpt_image_2_5_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_gpt_image_2_5_generation",
    operationType: "read",
    description: "Get the status and output of a GPT Image 2.5 generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: imageResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gpt_image_2_5_generation",
      statusActionId: "redfox.get_gpt_image_2_5_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_gemini_banana_2_1_generation",
    operationType: "write",
    description: "Start a Gemini Banana 2.1 generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        size: s.stringEnum("Output image aspect ratio or dimensions.", [
          "1:1",
          "3:2",
          "2:3",
          "4:3",
          "3:4",
          "16:9",
          "9:16",
          "5:4",
          "4:5",
          "21:9",
          "1:4",
          "4:1",
          "1:8",
          "8:1",
        ]),
        imageUrls: s.withDefault(
          s.array("Reference image URLs for image-to-image generation.", s.string("Reference image URL.")),
          [],
        ),
        metadata: s.requiredObject("Image generation options.", {
          resolution: s.stringEnum("Output resolution.", ["1K", "2K", "4K"]),
        }),
      },
      { optional: ["imageUrls"] },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gemini_banana_2_1_generation",
      statusActionId: "redfox.get_gemini_banana_2_1_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_gemini_banana_2_1_generation",
    operationType: "read",
    description: "Get the status and output of a Gemini Banana 2.1 generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: imageResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_gemini_banana_2_1_generation",
      statusActionId: "redfox.get_gemini_banana_2_1_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_seedream_pro_generation",
    operationType: "write",
    description: "Start a Seedream Pro generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        image: s.anyOf("Reference image URL or Base64 string, or a list of up to 4 reference images. Prefer URLs.", [
          s.string("Single reference image URL or Base64 string."),
          s.array("Reference images.", s.string("Reference image URL or Base64 string."), {
            maxItems: 4,
          }),
        ]),
        size: s.nonEmptyString("Image resolution: 1K or 2K, or WIDTHxHEIGHT; aspect ratio from 1:16 to 16:1."),
        outputFormat: s.stringEnum("Image format: png or jpeg.", ["png", "jpeg"]),
        responseFormat: s.withDefault(
          s.stringEnum("Output format: url (links valid for 24 hours) or b64_json. Defaults to url.", [
            "url",
            "b64_json",
          ]),
          "url",
        ),
        watermark: s.boolean("Whether to add an AI-generated watermark."),
        optimizePromptOptions: s.object(
          "Prompt optimization options.",
          {
            mode: s.stringEnum("Prompt optimization mode: standard or fast.", ["standard", "fast"]),
          },
          { optional: ["mode"] },
        ),
      },
      {
        optional: ["image", "outputFormat", "responseFormat", "watermark", "optimizePromptOptions"],
      },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedream_pro_generation",
      statusActionId: "redfox.get_seedream_pro_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_seedream_pro_generation",
    operationType: "read",
    description: "Get the status and output of a Seedream Pro generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: imageResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedream_pro_generation",
      statusActionId: "redfox.get_seedream_pro_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_seedream_lite_generation",
    operationType: "write",
    description: "Start a Seedream Lite generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        image: s.anyOf("Reference image URL or Base64 string, or a list of up to 4 reference images. Prefer URLs.", [
          s.string("Single reference image URL or Base64 string."),
          s.array("Reference images.", s.string("Reference image URL or Base64 string."), {
            maxItems: 4,
          }),
        ]),
        size: s.nonEmptyString(
          "Image resolution: 2K, 3K or 4K, or WIDTHxHEIGHT. Total pixels from 3686400 to 16777216; aspect ratio from 1:16 to 16:1.",
        ),
        sequentialImageGeneration: s.stringEnum("Image series mode: auto or disabled.", ["auto", "disabled"]),
        sequentialImageGenerationOptions: s.object(
          "Options used when sequentialImageGeneration is auto.",
          {
            maxImages: s.integer("Maximum number of images in the series, from 1 to 10.", {
              minimum: 1,
              maximum: 10,
            }),
          },
          { optional: ["maxImages"] },
        ),
        outputFormat: s.stringEnum("Image format: png or jpeg.", ["png", "jpeg"]),
        responseFormat: s.withDefault(
          s.stringEnum("Output format: url (links valid for 24 hours) or b64_json. Defaults to url.", [
            "url",
            "b64_json",
          ]),
          "url",
        ),
        watermark: s.boolean("Whether to add an AI-generated watermark."),
        optimizePromptOptions: s.object(
          "Prompt optimization options.",
          {
            mode: s.stringEnum("Prompt optimization mode: standard or fast.", ["standard", "fast"]),
          },
          { optional: ["mode"] },
        ),
      },
      {
        optional: [
          "image",
          "sequentialImageGeneration",
          "sequentialImageGenerationOptions",
          "outputFormat",
          "responseFormat",
          "watermark",
          "optimizePromptOptions",
        ],
      },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedream_lite_generation",
      statusActionId: "redfox.get_seedream_lite_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_seedream_lite_generation",
    operationType: "read",
    description: "Get the status and output of a Seedream Lite generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: imageResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedream_lite_generation",
      statusActionId: "redfox.get_seedream_lite_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_seedance_video_generation",
    operationType: "write",
    description: "Start a Seedance video generation task and return its task ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        prompt: s.nonEmptyString(
          "Generation prompt. With reference images, describe what to preserve and what to change.",
        ),
        aspectRatio: s.stringEnum("Video aspect ratio; adaptive lets the upstream choose based on the input.", [
          "21:9",
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16",
          "adaptive",
        ]),
        duration: s.integer("Video duration in seconds, from 4 to 15.", {
          minimum: 4,
          maximum: 15,
        }),
        resolution: s.stringEnum("Output resolution.", ["480p", "720p"]),
        generateAudio: s.boolean("Generate audio or background music."),
        returnLastFrame: s.boolean("Return the last video frame as an image."),
        imageWithRoles: s.withDefault(
          s.array(
            "Reference images with frame roles. Use an empty list for text-to-video.",
            s.requiredObject("Reference image and its role.", {
              url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
              role: s.stringEnum("Image role: first_frame, last_frame or reference_image.", [
                "first_frame",
                "last_frame",
                "reference_image",
              ]),
            }),
          ),
          [],
        ),
      },
      { optional: ["aspectRatio", "resolution", "imageWithRoles"] },
    ),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedance_video_generation",
      statusActionId: "redfox.get_seedance_video_generation",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_seedance_video_generation",
    operationType: "read",
    description: "Get the status and output of a Seedance video generation task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: videoResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_seedance_video_generation",
      statusActionId: "redfox.get_seedance_video_generation",
    },
  }),
];
