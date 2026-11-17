import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const searchInputSchema = s.object(
  "Search webpages with DeepSeek.",
  {
    query: s.string(
      "Search query, 1–128 Unicode characters, not blank. Supports site:, -site:, quoted phrases, exclusions, lang:, after: and before: operators.",
      { minLength: 1, maxLength: 128, pattern: "\\S" },
    ),
    count: s.integer("Maximum number of results. Defaults to 10.", { minimum: 1, maximum: 50 }),
    ori_question: s.nullable(
      s.string("Original user question to clarify search intent. Null means omitted.", {
        minLength: 1,
        maxLength: 128,
      }),
    ),
    localization: s.string("IP address used to prioritize local results. Defaults to an empty string."),
    need_content: s.boolean("Include webpage body text in results. Defaults to false."),
  },
  { optional: ["count", "ori_question", "localization", "need_content"] },
);
const searchOutputSchema = s.looseObject("Web search results.", {
  results: s.array(
    "Matching webpages, or an empty array when no results match.",
    s.looseObject("A matching webpage.", {
      rerank_score: s.number("Ranking score from 0 to 3; scores of at least 1.5 indicate high-quality results."),
      title: s.string("Webpage title."),
      url: s.string("Webpage URL."),
      snippet: s.string("Short query-relevant excerpt for display."),
      summary: s.string("Long query-relevant summary for model context."),
      content: s.string("Webpage body text; empty when not requested or unavailable."),
      site_name: s.nullable(s.string("Site name, or null when unavailable.")),
      site_icon: s.nullable(s.string("Site icon URL, or null when unavailable.")),
      date: s.nullable(s.string("Publication time in UTC RFC 3339 format, or null when unknown.")),
      authority: s.integer("Authority score from 0 to 4; -1 means unknown and at least 3 means highly authoritative."),
    }),
  ),
});
const fetchInputSchema = s.object(
  "Fetch a webpage with DeepSeek.",
  {
    url: s.string("HTTP or HTTPS webpage URL with a host and no username or password, up to 8192 characters.", {
      minLength: 1,
      maxLength: 8192,
      format: "uri",
    }),
  },
  {
    optional: [],
  },
);
const fetchOutputSchema = s.looseObject("Fetched webpage content.", {
  title: s.string("Page title, or an empty string when unavailable."),
  content: s.string("Extracted webpage body in Markdown format."),
});
export const deepseekWebActions: ActionDefinition[] = [
  defineProviderAction("deepseek", {
    name: "search",
    operationType: "read",
    description: "Search webpages with DeepSeek and return ranked results, summaries and optional body text.",
    requiredScopes: [],
    inputSchema: searchInputSchema,
    outputSchema: searchOutputSchema,
  }),
  defineProviderAction("deepseek", {
    name: "fetch",
    operationType: "read",
    description: "Fetch a webpage with DeepSeek and return its title and Markdown content.",
    requiredScopes: [],
    inputSchema: fetchInputSchema,
    outputSchema: fetchOutputSchema,
  }),
];
