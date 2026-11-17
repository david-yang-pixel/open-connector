import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const youtubeActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_youtube_transcript",
    operationType: "read",
    description: "Get the transcript of a YouTube video.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        videoUrl: s.nonEmptyString("Video URL or YouTube video ID."),
        format: s.stringEnum("Transcript format: json or text; defaults to json.", ["json", "text"]),
        includeTimestamp: s.boolean("Include timestamps; defaults to true."),
        sendMetadata: s.boolean("Include video metadata; defaults to false."),
        language: s.nonEmptyString("Comma-separated language priorities, for example zh,en,asr."),
      },
      { optional: ["format", "includeTimestamp", "sendMetadata", "language"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "search_youtube_videos",
    operationType: "read",
    description: "Search YouTube videos by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        searchQuery: s.nonEmptyString("Search keyword."),
        continuationToken: s.nonEmptyString(
          "Continuation token returned by the previous response. Omit on the first page.",
        ),
      },
      { optional: ["continuationToken"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_youtube_video",
    operationType: "read",
    description: "Get details of a YouTube video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      videoId: s.nonEmptyString("Video ID."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_youtube_video_comments",
    operationType: "read",
    description: "List comments on a YouTube video.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        videoId: s.nonEmptyString("Video ID."),
        languageCode: s.nonEmptyString("Language code; defaults to zh-CN."),
        countryCode: s.nonEmptyString("Country code; defaults to US."),
        sortBy: s.stringEnum("Sort order.", ["top", "newest"]),
        continuationToken: s.nonEmptyString(
          "Continuation token returned by the previous response. Omit on the first page.",
        ),
      },
      { optional: ["languageCode", "countryCode", "sortBy", "continuationToken"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_youtube_subtitles",
    operationType: "read",
    description: "Get subtitle tracks for a YouTube video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      videoUrl: s.nonEmptyString("Video URL or YouTube video ID."),
    }),
    outputSchema: responseSchema,
  }),
];
