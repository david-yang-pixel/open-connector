import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { search1apiInputs, search1apiOutputs } from "./schemas.ts";
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  deepcrawl: { startActionId: "search1api.deepcrawl", statusActionId: "search1api.get_deepcrawl" },
};
const descriptions: Record<string, string> = {
  search: "Search the web with engine, site, language, time, pagination, image and full-content options.",
  search_batch: "Run multiple web searches in one batch, preserving each success, failure and credit cost.",
  news: "Search recent news with source, site, language, time, image and full-content options.",
  news_batch: "Run multiple news searches in one batch, preserving each success, failure and credit cost.",
  ask: "Select search engines and rank relevant sources from a natural-language query. Returns sources, not a generated answer; partial engine failures are preserved.",
  crawl: "Read a public webpage as clean content, with optional fallback retrieval.",
  crawl_batch: "Read multiple public webpages in one batch, preserving individual results and failures.",
  sitemap: "Discover page URLs from a site's sitemap or all available links.",
  trending: "Retrieve trending topics from the requested source.",
  extract: "Extract structured data from a webpage using a prompt and response schema. This upstream API is in beta.",
  deepcrawl:
    "Start an asynchronous whole-site crawl. Use get_deepcrawl to wait for the archive download URL. This upstream API is in beta.",
  get_deepcrawl: "Read the state and archive download URL of a deepcrawl task.",
  screenshot: "Capture a public webpage or element as PNG, JPEG or WebP and return a temporary file URL.",
  usage: "Read the authenticated account's remaining credits without consuming credits.",
  health: "Check public API health. This does not validate credentials.",
  feedback:
    "Submit product feedback. Do not include credentials, personal data or private content; do not automatically repeat the same report.",
};
export const search1apiActions: ActionDefinition[] = Object.entries(descriptions).map(([name, description]) =>
  defineProviderAction("search1api", {
    name,
    description,
    operationType: name === "deepcrawl" || name === "feedback" ? "write" : "read",
    requiredScopes: [],
    inputSchema: search1apiInputs[name]!,
    outputSchema:
      name === "screenshot"
        ? s.requiredObject("Captured screenshot file.", {
            url: s.string("Temporary download URL for the screenshot."),
            mimeType: s.string("Screenshot MIME type."),
            requestId: s.nullable(s.string("Upstream request identifier, when available.")),
          })
        : search1apiOutputs[name]!,
    asyncLifecycle: actionLifecycles[name],
  }),
);
