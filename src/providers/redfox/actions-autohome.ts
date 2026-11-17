import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const autohomeActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_autohome_works",
    operationType: "read",
    description: "Search Autohome posts by keyword.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      keyword: s.nonEmptyString("Search keyword."),
      offset: s.nonEmptyString("Pagination offset. Start with 0 and increase by 10."),
      page: s.nonEmptyString("Page number, starting at 1."),
      sourceType: s.stringEnum("Content source type.", ["club", "article", "video"]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_autohome_article",
    operationType: "read",
    description: "Get the content and metadata of an Autohome article.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        workId: s.nonEmptyString("Work ID."),
        page: s.withDefault(s.integer("Page number, starting at 0.", { minimum: 0 }), 0),
      },
      { optional: ["page"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_autohome_video",
    operationType: "read",
    description: "Get details of an Autohome video.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      videoId: s.nonEmptyString("Video ID."),
      videoType: s.withEnum(s.integer("Video type: 0 = original account, 4 = Chejiahao."), [0, 4]),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_autohome_user_works",
    operationType: "read",
    description: "List posts published by an Autohome account.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        authorId: s.nonEmptyString("Author ID."),
        page: s.withDefault(s.integer("Page number, starting at 0.", { minimum: 0 }), 0),
      },
      { optional: ["page"] },
    ),
    outputSchema: responseSchema,
  }),
];
