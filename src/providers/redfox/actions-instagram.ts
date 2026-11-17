import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const instagramActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_instagram",
    operationType: "read",
    description: "Search Instagram by keyword, with pagination.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        keyword: s.nonEmptyString("Search keyword."),
        paginationToken: s.nonEmptyString(
          "Pagination token returned by the previous response. Omit on the first page.",
        ),
      },
      { optional: ["paginationToken"] },
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_instagram_user",
    operationType: "read",
    description: "Get an Instagram account by username or user ID.",
    requiredScopes: [],
    inputSchema: s.requireAnyProperty(
      s.object(
        "Request parameters.",
        {
          username: s.nonEmptyString("Username. Ignored when userId is provided."),
          userId: s.nonEmptyString("User ID."),
        },
        { optional: ["username", "userId"] },
      ),
      ["username", "userId"],
    ),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "get_instagram_post",
    operationType: "read",
    description: "Get an Instagram post by shortcode or URL.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      codeOrUrl: s.nonEmptyString("Instagram shortcode or full post URL."),
    }),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_instagram_post_comments",
    operationType: "read",
    description: "List comments on an Instagram post.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        codeOrUrl: s.nonEmptyString("Instagram shortcode or full post URL."),
        sortBy: s.withDefault(s.stringEnum("Sort order.", ["recent", "popular"]), "recent"),
        paginationToken: s.nonEmptyString(
          "Pagination token returned by the previous response. Omit on the first page.",
        ),
      },
      { optional: ["sortBy", "paginationToken"] },
    ),
    outputSchema: responseSchema,
  }),
];
