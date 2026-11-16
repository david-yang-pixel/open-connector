import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const usageInput: JsonSchema = s.object(
  "Usage filters.",
  {
    start_after: s.string("Start timestamp, exclusive.", { format: "date-time" }),
    end_before: s.string("End timestamp, exclusive.", { format: "date-time" }),
    status: s.stringEnum("Usage outcome.", ["completed", "failed"]),
    limit: s.integer("Records per page; defaults to 100.", { minimum: 1, maximum: 1000 }),
    page: s.integer("Page number, starting at 1.", { minimum: 1 }),
  },
  { required: [] },
);
export const usageOutput: JsonSchema = s.looseObject("Paginated usage records.", {
  items: s.array("Usage records.", s.looseObject("Usage record.")),
  total: s.integer("Total records."),
  limit: s.integer("Page size."),
  page: s.integer("Current page."),
  total_pages: s.integer("Total pages."),
  has_more: s.boolean("Whether another page exists."),
});
const fetchOptions = {
  purpose: s.string("Underlying task used to tailor extraction.", {
    minLength: 1,
    maxLength: 2000,
  }),
  format: s.stringEnum("Extracted content format; defaults to markdown.", ["markdown", "html", "json"]),
  links: s.boolean("Extract outbound links."),
  image_links: s.boolean("Extract image URLs."),
  iframe_links: s.boolean("Extract iframe URLs; browser-rendered frames require browser rendering."),
  page_metadata: s.boolean("Include canonical URL, favicon, robots, Open Graph, Twitter and other page metadata."),
  ttl: s.integer(
    "Cache freshness tolerance in seconds; 0 prefers live fetch, but origin caching may extend tolerance.",
    { minimum: 0 },
  ),
  per_url_timeout_ms: s.integer("Independent timeout budget per URL in milliseconds.", {
    minimum: 1,
    maximum: 110000,
  }),
  if_none_match: s.string("ETag to replay; valid only with one URL.", { minLength: 1 }),
  if_modified_since: s.string("Last-Modified validator to replay; valid only with one URL.", {
    minLength: 1,
  }),
  include_etag_and_last_modified: s.boolean("Include validators and conditional not_modified results."),
  include_selectors: s.array(
    "Extract only matching CSS regions; total misses return selector_not_matched with retry hints.",
    s.string("CSS selector.", { minLength: 1, maxLength: 1000 }),
    { minItems: 1, maxItems: 20 },
  ),
  exclude_selectors: s.array(
    "Remove matching CSS regions before extraction; direct PDF/CSV returns selector_unsupported.",
    s.string("CSS selector.", { minLength: 1, maxLength: 1000 }),
    { minItems: 1, maxItems: 20 },
  ),
};
export const fetchInput: JsonSchema = {
  ...s.object(
    "Fetch one or more URLs independently.",
    {
      urls: s.array("URLs fetched by TinyFish.", s.string("Public URL.", { format: "uri" }), {
        minItems: 1,
        maxItems: 10,
      }),
      ...fetchOptions,
    },
    { required: ["urls"] },
  ),
  anyOf: [
    { not: { anyOf: [{ required: ["if_none_match"] }, { required: ["if_modified_since"] }] } },
    { properties: { urls: { maxItems: 1 } } },
  ],
};
export const fetchOutput: JsonSchema = s.looseObject("Fetch results with independent per-URL errors.", {
  results: s.array(
    "Successfully fetched URLs including conditional results.",
    s.looseObject("Fetched page.", {
      url: s.string("Requested URL."),
      final_url: s.nullable(s.string("Final URL.")),
      title: s.nullable(s.string("Page title.")),
      text: s.unknown("Extracted markdown, HTML or structured JSON; may be null."),
      format: s.stringEnum("Content format.", ["markdown", "html", "json"]),
      not_modified: s.boolean("True when the origin returned 304."),
      etag: s.string("ETag validator."),
      last_modified: s.string("Last-Modified validator."),
      unmatched_selectors: s.stringArray("Selectors that did not match while others succeeded."),
    }),
  ),
  errors: s.array(
    "Failures for individual URLs.",
    s.looseObject("Fetch failure.", {
      url: s.string("Failed URL."),
      error: s.string("Provider error code."),
      status: s.integer("Origin HTTP status when applicable."),
      unmatched_selectors: s.stringArray("Selectors with no match."),
      candidate_selectors: s.stringArray("Suggested selectors for a retry."),
    }),
  ),
  request_id: s.string("Correlation ID, present for failed URLs."),
});
export const searchInput: JsonSchema = s.object(
  "Search query and filters.",
  {
    query: s.string("Search query.", { minLength: 1, maxLength: 2000 }),
    purpose: s.string("Underlying task used to rank results.", { minLength: 1, maxLength: 2000 }),
    location: s.string("Country code; inferred from language when omitted."),
    language: s.string("Language code; inferred from location when omitted."),
    include_domains: s.string("Comma-separated domains to include."),
    exclude_domains: s.string("Comma-separated domains to exclude."),
    domain_type: s.stringEnum("Search source pool.", ["web", "news", "research_paper"]),
    after_date: s.string("Return results after YYYY-MM-DD."),
    before_date: s.string("Return results before YYYY-MM-DD."),
    recency_minutes: s.integer("Freshness window in minutes.", { minimum: 1, maximum: 5256000 }),
    pub_year_min: s.integer("Minimum research-paper publication year. Only supported for domain_type=research_paper.", {
      minimum: 0,
      maximum: 9999,
    }),
    pub_year_max: s.integer("Maximum research-paper publication year. Only supported for domain_type=research_paper.", {
      minimum: 0,
      maximum: 9999,
    }),
    page: s.nullable(s.integer("Page index, starting at 0.", { minimum: 0, maximum: 10 })),
    include_thumbnail: s.stringEnum("Include available thumbnails.", ["true", "false"]),
    fetch: s.looseObject("Fetch configuration; encoded as JSON in the query string, maximum 256 encoded characters."),
  },
  { required: ["query"] },
);
export const searchOutput: JsonSchema = s.looseObject("Search results.", {
  query: s.string("Executed query."),
  results: s.array("Ranked results with optional fetched content and fetch_error.", s.looseObject("Search result.")),
  total_results: s.integer("Total results."),
  page: s.integer("Current zero-based page."),
  request_id: s.string("Correlation ID when any fetch failed."),
});
