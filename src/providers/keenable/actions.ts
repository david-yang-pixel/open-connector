import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const timeBound = (description: string) =>
  s.string(
    `${description} Accepts YYYY-MM-DD, an ISO 8601 timestamp, or a relative delta such as 7d, 30min, 2h, 1mo, or 1y. Dates cover the whole UTC day; relative deltas use query_time when supplied.`,
  );
const search = defineProviderAction("keenable", {
  name: "search",
  operationType: "read",
  description:
    "Search the web with Keenable, including site, publication date, indexing date, and point-in-time filters.",
  requiredScopes: [],
  inputSchema: s.object(
    "Web search parameters.",
    {
      query: s.string("The search query."),
      mode: s.stringEnum("Search mode: pro for deeper retrieval (default), or realtime for faster results.", [
        "pro",
        "realtime",
      ]),
      site: s.string("Restrict results to a specific domain, such as techcrunch.com."),
      acquired_after: timeBound("Include pages indexed at or after this time."),
      acquired_before: timeBound("Include pages indexed at or before this time."),
      published_after: timeBound("Include pages published at or after this time."),
      published_before: timeBound("Include pages published at or before this time."),
      query_time: s.string(
        "Search the index as it stood at this timestamp or date. A date resolves to midnight UTC. Relative date filters are calculated from this time.",
      ),
      snippet_max_length: s.integer("Maximum snippet length in characters; omitted uses the upstream default.", {
        minimum: 180,
        maximum: 10000,
      }),
      max_results: s.integer("Maximum number of results; defaults to 10.", {
        minimum: 1,
        maximum: 50,
      }),
    },
    {
      optional: [
        "mode",
        "site",
        "acquired_after",
        "acquired_before",
        "published_after",
        "published_before",
        "query_time",
        "snippet_max_length",
        "max_results",
      ],
    },
  ),
  outputSchema: s.looseRequiredObject("Search results returned by Keenable.", {
    query: s.string("The searched query."),
    mode: s.string("The search mode used."),
    results: s.array(
      "Ranked web results.",
      s.object(
        "One search result.",
        {
          title: s.string("Page title."),
          url: s.string("Page URL."),
          description: s.string("Page description."),
          snippet: s.string("Relevant page excerpt, when available."),
          published_at: s.string("Publication time as an ISO 8601 timestamp, when available."),
          acquired_at: s.string("Indexing time as an ISO 8601 timestamp, when available."),
        },
        {
          optional: ["snippet", "published_at", "acquired_at"],
          additionalProperties: true,
        },
      ),
    ),
  }),
});
const fetchPage = defineProviderAction("keenable", {
  name: "fetch",
  operationType: "read",
  description:
    "Read a webpage from Keenable's index or live source as Markdown, optionally extracting content with an instruction.",
  requiredScopes: [],
  inputSchema: s.object(
    "Webpage retrieval parameters.",
    {
      url: s.string("The webpage URL for Keenable to retrieve.", { format: "uri" }),
      max_chars: s.integer(
        "Maximum returned content characters; defaults to 50000. A truncation notice may extend beyond this limit.",
        { minimum: 1 },
      ),
      live: s.boolean(
        "Fetch from the live source instead of the index. Defaults to false; use true for pages outside the index.",
      ),
      prompt: s.string(
        "Extraction instruction. When supplied, content contains the instruction result instead of the full page.",
        { maxLength: 2000 },
      ),
    },
    { optional: ["max_chars", "live", "prompt"] },
  ),
  outputSchema: s.object(
    "Retrieved webpage content and metadata.",
    {
      url: s.string("Fetched URL, which may differ after redirects."),
      content: s.string("Page Markdown, or the extraction instruction result."),
      title: s.string("Page title, when available."),
      description: s.string("Page description, when available."),
      author: s.string("Page author, when available."),
      published_at: s.anyOf("Publication time; official sources describe Unix seconds or an ISO timestamp.", [
        s.integer("Publication time in Unix seconds."),
        s.string("Publication time as an ISO 8601 timestamp."),
      ]),
    },
    {
      optional: ["title", "description", "author", "published_at"],
      additionalProperties: true,
    },
  ),
});
export const keenableActions: ActionDefinition[] = [search, fetchPage];
