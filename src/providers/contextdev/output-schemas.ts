import type { JsonSchema } from "../../core/types.ts";

import { readSchemaProperties } from "../../core/json-schema.ts";
import { s } from "../../core/json-schema.ts";
const keyMetadataSchema = s.looseObject("Credits this request used and your remaining balance.", {
  credits_consumed: s.integer("Credits charged for this request."),
  credits_remaining: s.integer("Credits remaining for your organization."),
});
export const submit_feedbackOutputSchema: JsonSchema = s.looseObject("Submit agent feedback response.", {
  feedback_id: s.string("ID of the stored feedback."),
  already_submitted: s.boolean(
    "True when feedback for this request_id was already recorded; the original feedback_id is returned.",
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_logsOutputSchema: JsonSchema = s.looseObject("List request logs response.", {
  data: s.array(
    "Log entries, newest first.",
    s.looseObject("data entry value.", {
      request_id: s.string("Request ID of the logged API call."),
      timestamp: s.string("When the request completed."),
      method: s.string("HTTP method, or `MONITOR` / `BATCH` for monitor-run and batch-settlement entries."),
      path: s.string("Endpoint path as called."),
      status_code: s.integer("HTTP status code returned."),
      error_code: s.nullable(s.string("The `error_code` from the response, or null on success.")),
      latency_ms: s.number("Server-side processing time in milliseconds."),
      credits_used: s.integer("Credits charged for this request."),
      key_id: s.nullable(s.string("ID of the API key that made the request.")),
      tags: s.array("Request tags supplied by the caller.", s.string("tags entry value.")),
      zdr: s.boolean("Whether the request was made under zero data retention."),
    }),
  ),
  page: s.integer("Current page number."),
  limit: s.integer("Entries per page."),
  has_more: s.boolean("Whether a next page exists."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_logOutputSchema: JsonSchema = s.looseObject("Retrieve a request log response.", {
  data: s.looseObject("data value.", {
    request_id: s.string("Request ID of the logged API call."),
    timestamp: s.string("When the request completed."),
    method: s.string("HTTP method, or `MONITOR` / `BATCH` for monitor-run and batch-settlement entries."),
    path: s.string("Endpoint path as called."),
    status_code: s.integer("HTTP status code returned."),
    error_code: s.nullable(s.string("The `error_code` from the response, or null on success.")),
    latency_ms: s.number("Server-side processing time in milliseconds."),
    credits_used: s.integer("Credits charged for this request."),
    key_id: s.nullable(s.string("ID of the API key that made the request.")),
    tags: s.array("Request tags supplied by the caller.", s.string("tags entry value.")),
    zdr: s.boolean("Whether the request was made under zero data retention."),
    input: s.looseObject("What was sent with the request.", {}),
    response: s.unknown("The retained JSON response with credentials redacted, or null when unavailable."),
    user_agent: s.nullable(s.string("User-Agent header of the request.")),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_profilesOutputSchema: JsonSchema = s.looseObject("List browser profiles response.", {
  data: s.array(
    "Browser profiles, newest first.",
    s.looseObject("data entry value.", {
      id: s.string("Profile ID to pass as `sharedParams.profile.profileId` on `/web/scrape`."),
      description: s.nullable(s.string("The description supplied when the profile was created, or null.")),
      created_at: s.string("When the profile was created."),
    }),
  ),
  has_more: s.boolean("Whether a next page exists."),
  next_cursor: s.nullable(s.string("Pass as `cursor` to fetch the next page.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_usageOutputSchema: JsonSchema = s.looseObject("Retrieve credit usage response.", {
  credits_remaining: s.integer("Credits available to your organization right now."),
  period: s.nullable(
    s.looseObject(
      "The current monthly credit period, or null when your organization has no monthly credits or billing is paused.",
      {
        start: s.string("When the current credit period started."),
        credits_used: s.integer("Credits charged since `start`."),
      },
    ),
  ),
  next_refill: s.nullable(
    s.looseObject(
      "The next monthly refill, or null when no refill is scheduled. While billing is paused, this is when billing resumes.",
      {
        at: s.string("When your credits next refill."),
        credits: s.integer("Your balance is reset to this amount at the refill. Unused credits do not carry over."),
      },
    ),
  ),
  auto_topup: s.looseObject("Auto-Topup settings and spend.", {
    enabled: s.boolean("Whether credits are added automatically when your balance runs out."),
    credits_used_this_period: s.integer("Credits added by Auto-Topup in the current period."),
    monthly_budget_credits: s.nullable(
      s.integer("Monthly Auto-Topup budget you are alerted against, or null when none is set."),
    ),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_usage_historyOutputSchema: JsonSchema = s.looseObject("Retrieve usage history response.", {
  data: s.array(
    "One bucket per interval, oldest first. Intervals without usage are included with zero totals.",
    s.looseObject("data entry value.", {
      start: s.string("Start of the bucket, in UTC."),
      credits_used: s.integer("Credits charged."),
      request_count: s.integer("Requests made."),
      groups: s.array(
        "Per-group totals, highest credits first. Present only when `group_by` is set.",
        s.looseObject("groups entry value.", {}),
      ),
    }),
  ),
  total_credits_used: s.integer("Credits charged across the range."),
  total_request_count: s.integer("Requests made across the range."),
  interval: s.string("Bucket size used."),
  from: s.string("Start of the range."),
  to: s.string("End of the range."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_webhook_deliveriesOutputSchema: JsonSchema = s.looseObject("List webhook deliveries response.", {
  data: s.array(
    "Webhook deliveries.",
    s.looseObject("data entry value.", {
      id: s.string("Delivery ID."),
      event: s.string("Webhook event type."),
      source: s.anyOf("Batch or monitor run that produced the event.", [
        s.looseObject("Batch", {}),
        s.looseObject("Monitor", {}),
      ]),
      url: s.string("Webhook destination URL."),
      status: s.string(
        "`pending`, `delivering`, `retrying`, `delivered`, `failed`, or `cancelled` (source or its webhook was removed).",
      ),
      created_at: s.string("Event creation time."),
      retry_expires_at: s.string("Last time you can retry manually (7 days after the event)."),
      delivered_at: s.nullable(s.string("Last successful delivery time, or null if never delivered.")),
      next_attempt_at: s.nullable(s.string("Next scheduled attempt, or null if none.")),
      last_error: s.nullable(s.looseObject("Latest delivery error, or null if none.", {})),
    }),
  ),
  has_more: s.boolean("Whether more deliveries are available."),
  next_cursor: s.nullable(s.string("Next page cursor, or null on the last page.")),
  key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
    credits_consumed: s.integer("Credits charged for this request."),
    credits_remaining: s.integer("Credits remaining for your organization."),
  }),
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_webhook_deliveryOutputSchema: JsonSchema = s.looseObject("Retrieve a webhook delivery response.", {
  id: s.string("Delivery ID."),
  event: s.string("Webhook event type."),
  source: s.anyOf("Batch or monitor run that produced the event.", [
    s.looseObject("Batch", {
      type: s.string("Which deliveries to list: `batch` or `monitor`."),
      batch_id: s.string("Batch ID."),
    }),
    s.looseObject("Monitor", {
      type: s.string("Which deliveries to list: `batch` or `monitor`."),
      monitor_id: s.string("Monitor ID."),
      run_id: s.string("Monitor run ID."),
    }),
  ]),
  url: s.string("Webhook destination URL."),
  status: s.string(
    "`pending`, `delivering`, `retrying`, `delivered`, `failed`, or `cancelled` (source or its webhook was removed).",
  ),
  created_at: s.string("Event creation time."),
  retry_expires_at: s.string("Last time you can retry manually (7 days after the event)."),
  delivered_at: s.nullable(s.string("Last successful delivery time, or null if never delivered.")),
  next_attempt_at: s.nullable(s.string("Next scheduled attempt, or null if none.")),
  last_error: s.nullable(
    s.looseObject("Latest delivery error, or null if none.", {
      code: s.string("Error code."),
      message: s.string("Error details."),
    }),
  ),
  event_id: s.string("Stable event ID for deduplicating received webhooks."),
  retry: s.looseObject("retry value.", {
    delays_seconds: s.array(
      "Retry delays in seconds, totaling at most 72 hours. Use [] to disable automatic retries.",
      s.integer("delays seconds entry value."),
    ),
  }),
  last_attempt: s.anyOf("Latest attempt, or null if none.", [
    s.looseObject("last attempt value.", {
      attempt: s.integer("Attempt number, starting at 1."),
      trigger: s.string("`initial`, `automatic` (scheduled retry), or `manual` (Retry endpoint)."),
      url: s.string("URL used for this attempt."),
      started_at: s.string("Attempt start time."),
      completed_at: s.nullable(s.string("Completion time, or null while in progress.")),
      http_status: s.nullable(s.integer("HTTP response status, or null if no response was received.")),
      error: s.nullable(s.looseObject("Attempt error, or null if none.", {})),
    }),
    s.literal(null, {
      description: "last attempt value.",
    }),
  ]),
  key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
    credits_consumed: s.integer("Credits charged for this request."),
    credits_remaining: s.integer("Credits remaining for your organization."),
  }),
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_webhook_delivery_attemptsOutputSchema: JsonSchema = s.looseObject(
  "List webhook delivery attempts response.",
  {
    data: s.array(
      "Delivery attempts.",
      s.looseObject("data entry value.", {
        attempt: s.integer("Attempt number, starting at 1."),
        trigger: s.string("`initial`, `automatic` (scheduled retry), or `manual` (Retry endpoint)."),
        url: s.string("URL used for this attempt."),
        started_at: s.string("Attempt start time."),
        completed_at: s.nullable(s.string("Completion time, or null while in progress.")),
        http_status: s.nullable(s.integer("HTTP response status, or null if no response was received.")),
        error: s.nullable(s.looseObject("Attempt error, or null if none.", {})),
      }),
    ),
    has_more: s.boolean("Whether more attempts are available."),
    next_cursor: s.nullable(s.string("Next page cursor, or null on the last page.")),
    key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
      credits_consumed: s.integer("Credits charged for this request."),
      credits_remaining: s.integer("Credits remaining for your organization."),
    }),
    request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
  },
);
export const retry_webhook_deliveryOutputSchema: JsonSchema = s.looseObject("Retry a webhook delivery response.", {
  id: s.string("Delivery ID."),
  key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
    credits_consumed: s.integer("Credits charged for this request."),
    credits_remaining: s.integer("Credits remaining for your organization."),
  }),
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
function scrapeFormat(description: string, data: JsonSchema) {
  return s.looseObject(description, {
    requested: s.boolean("Whether this output was requested."),
    success: s.nullable(
      s.boolean("True when this output succeeded, false when it failed, or null when not requested."),
    ),
    data: s.nullable(data),
    error_code: s.string("Machine-readable failure code when this output failed."),
    message: s.string("Failure explanation and possible next steps."),
  });
}
const transferredFile = s.looseObject("Downloadable file stored by Connector.", {
  url: s.string("Download URL for the transferred file.", { format: "uri" }),
  mimeType: s.string("MIME type of the transferred file."),
});
const scrapeFormats = {
  html: scrapeFormat("Rendered HTML after content filters.", s.string("Rendered HTML content.")),
  markdown: scrapeFormat("Markdown after content filters.", s.string("Page content as Markdown.")),
  screenshot: scrapeFormat("Screenshot transferred to a downloadable file.", transferredFile),
  images: scrapeFormat(
    "Images after content filters. `[]` when none are found.",
    s.array(
      "Images discovered on the page.",
      s.looseObject("An image and its optional enrichment.", {
        url: s.string("Image URL or an inline image data URI."),
        alt: s.nullable(s.string("Alternative image text, when present.")),
        width: s.integer("Image width in pixels."),
        height: s.integer("Image height in pixels."),
        classification: s.string("Image classification returned by the provider."),
        fileUrl: s.string("Hosted image URL, valid for 24 hours after capture when file enrichment is enabled."),
      }),
    ),
  ),
  bytes: scrapeFormat(
    "Original response body transferred to a downloadable file.",
    s.looseObject("Downloaded original response body.", {
      url: s.string("Download URL for the transferred file.", { format: "uri" }),
      mimeType: s.string("MIME type of the transferred file."),
      contentType: s.string("Original response Content-Type, including any charset."),
    }),
  ),
  parsed: s.looseObject("Custom or prebuilt parser output.", {
    ...readSchemaProperties(
      scrapeFormat(
        "Parser output envelope.",
        s.looseObject("Extracted fields; structure depends on the requested parser or custom rules.", {}),
      ),
    ),
    type: s.string("Parser used for this output, including custom for CSS extraction rules."),
  }),
  highlights: scrapeFormat(
    "Relevant Markdown excerpts in page order. `[Heading]` adds context; `…` marks omitted text.",
    s.array("Relevant excerpts in page order.", s.string("One Markdown excerpt.")),
  ),
  json: scrapeFormat(
    "Object matching `jsonParams.schema`.",
    s.looseObject("Extracted object following the supplied JSON Schema.", {}),
  ),
  product: scrapeFormat(
    "Product details found on the page.",
    s.looseObject("Product-page detection and extracted product.", {
      isProductPage: s.boolean("Whether the page is a product detail page."),
      product: s.nullable(s.looseObject("Extracted product details, or null for a non-product page.", {})),
    }),
  ),
};
export const scrape_webOutputSchema: JsonSchema = s.looseObject("Scrape Anything response.", {
  url: s.string("Final URL after redirects and browser actions."),
  ...scrapeFormats,
  profile: s.nullable(
    s.looseObject(
      "Authenticated browser profile used for this scrape, or null when no profile was requested. New and existing profile requests both return the profile ID.",
      {
        id: s.string(
          'Save this ID after creating a profile, then reuse it as sharedParams.profile.profileId with type "existing".',
        ),
      },
    ),
  ),
  isPartial: s.boolean(
    "True when at least one requested output succeeds but the response has failed or incomplete outputs. Absent when all requested outputs fail.",
  ),
  metadata: s.looseObject("Page metadata. Fields are omitted when not found.", {
    title: s.string("Best title extracted from the page."),
    description: s.string("Best description extracted from standard, Open Graph, or Twitter metadata."),
    language: s.string("Language extracted from html lang or language meta tags."),
    keywords: s.array("Keywords extracted from the page's keywords meta tag.", s.string("keywords entry value.")),
    canonicalUrl: s.string("Resolved canonical URL, when present."),
    author: s.string("Author metadata, when present."),
    siteName: s.string("Site or application name from page metadata."),
    image: s.string("Primary resolved preview image from Open Graph, Twitter, or image metadata."),
    favicon: s.string("Resolved favicon URL, when present."),
    publishedTime: s.string("Published timestamp/date from page metadata, when present."),
    modifiedTime: s.string("Modified timestamp/date from page metadata, when present."),
    robots: s.string("Robots meta directive, when present."),
    openGraph: s.looseObject("Open Graph metadata with the og: prefix removed and keys camel-cased.", {}),
    twitter: s.looseObject("Twitter card metadata with the twitter: prefix removed and keys camel-cased.", {}),
    alternates: s.array(
      "Resolved alternate links from link rel=alternate tags.",
      s.looseObject("alternates entry value.", {}),
    ),
    headings: s.array(
      "Up to 500 h1–h6 headings in document order, before content filtering.",
      s.looseObject("headings entry value.", {}),
    ),
    jsonLd: s.array("JSON-LD structured data blocks parsed from the page.", s.looseObject("jsonLd entry value.", {})),
    additionalMeta: s.looseObject("Additional non-social meta tags not promoted to top-level metadata fields.", {}),
  }),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const search_newsOutputSchema: JsonSchema = s.looseObject("Search news response.", {
  data: s.array(
    "Articles matching the search, in the requested order.",
    s.looseObject("data entry value.", {
      id: s.string(
        "Stable unique identifier for this article. Use it to deduplicate or reference an article across requests.",
      ),
      story_id: s.string(
        "Shared by articles covering the same story on the same day. Use it to group or collapse syndicated copies of one announcement across outlets.",
      ),
      url: s.string("Link to the article on the publisher site."),
      title: s.string("Article headline."),
      description: s.nullable(
        s.string(
          "Article summary or excerpt. Natural-language search descriptions include matching passages and are capped at 2,000 characters.",
        ),
      ),
      language: s.nullable(
        s.string("Language the article is written in, as a lowercase ISO 639-1 code such as en. Null when unknown."),
      ),
      authors: s.array("Bylined authors. Empty when no byline is available.", s.string("authors entry value.")),
      image_url: s.nullable(s.string("Lead image for the article, when one is available.")),
      published_at: s.nullable(
        s.string(
          "When the article was published, as an ISO 8601 timestamp. Null when the publisher does not state a reliable date.",
        ),
      ),
      type: s.string(
        "Kind of coverage. Use it to separate independent reporting (editorial) from company-issued content (press_release, regulatory_filing, advisory).",
      ),
      source: s.looseObject("The publication that published the article.", {}),
      match: s.nullable(
        s.looseObject(
          "How the article relates to the company you searched for. Null for natural-language searches.",
          {},
        ),
      ),
    }),
  ),
  has_more: s.boolean("True when more results are available beyond this page."),
  next_cursor: s.nullable(
    s.string("Pass as cursor in the next request to fetch the following page. Null when there are no more results."),
  ),
  meta: s.looseObject("Summary information about this response.", {
    count: s.integer("Number of articles in this page."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const answer_researchOutputSchema: JsonSchema = s.looseObject("Answer a research task response.", {
  partial: s.boolean(
    "True when the request deadline ended research and the answer uses the evidence collected so far.",
  ),
  json_content: s.looseObject("The answer, in the shape requested by json_format.", {}),
  sources: s.array(
    "URLs of the pages and company/profile records read for the answer, followed by URLs cited in json_content.",
    s.string("sources entry value."),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const parse_fileOutputSchema: JsonSchema = s.looseObject("Parse a file response.", {
  success: s.boolean("Indicates success"),
  markdown: s.string("Input bytes converted to GitHub Flavored Markdown"),
  type: s.string("Detected content type used for parsing"),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const map_urlsOutputSchema: JsonSchema = s.looseObject("Map URLs response.", {
  success: s.boolean("success value."),
  domain: s.string("domain value."),
  urls: s.array(
    "urls value.",
    s.looseObject("urls entry value.", {
      url: s.string("url value."),
      title: s.string("title value."),
      description: s.string("description value."),
      keywords: s.array("keywords value.", s.string("keywords entry value.")),
      language: s.string("language value."),
    }),
  ),
  partial: s.boolean("partial value."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const crawl_websiteOutputSchema: JsonSchema = s.looseObject("Crawl a website response.", {
  partial: s.boolean(
    "True when timeoutOpts.behavior=return-partial returned the usable results collected before the deadline. Partial collections are not cached as complete results.",
  ),
  results: s.array(
    "results value.",
    s.looseObject("results entry value.", {
      markdown: s.string("Extracted page content as Markdown (empty string on failure)"),
      metadata: s.looseObject("metadata value.", {}),
    }),
  ),
  metadata: s.looseObject("metadata value.", {
    numUrls: s.integer("Total number of URLs crawled"),
    maxCrawlDepth: s.integer("Maximum crawl depth reached during the crawl"),
    numSucceeded: s.integer("Number of pages successfully crawled"),
    numFailed: s.integer("Number of pages that failed to crawl"),
    numSkipped: s.integer(
      "Number of URLs skipped (PDFs when pdf.shouldParse=false, URLs not matching urlRegex, or URLs matching excludeUrlRegex)",
    ),
  }),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const extract_dataOutputSchema: JsonSchema = s.looseObject("Extract structured data response.", {
  partial: s.boolean(
    "True when the timeout ended processing and this response contains only usable results completed so far. Unfinished results are omitted.",
  ),
  status: s.string("Always `ok` on success."),
  url: s.string("The starting URL that was analyzed"),
  urls_analyzed: s.array("List of URLs whose Markdown was used for extraction", s.string("urls analyzed entry value.")),
  data: s.looseObject("Extracted data matching the request schema", {}),
  metadata: s.looseObject("metadata value.", {
    numUrls: s.integer("numUrls value."),
    maxCrawlDepth: s.integer("maxCrawlDepth value."),
    numSucceeded: s.integer("numSucceeded value."),
    numFailed: s.integer("numFailed value."),
    numSkipped: s.integer("numSkipped value."),
    numBlocked: s.integer(
      "Number of crawled pages excluded because they were anti-bot challenges, error pages, or parked-domain placeholders.",
    ),
    actionsApplied: s.array(
      "One verified outcome per requested browser action, in request order.",
      s.looseObject("actionsApplied entry value.", {}),
    ),
  }),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const search_webOutputSchema: JsonSchema = s.looseObject("Search the web response.", {
  partial: s.boolean(
    "True when timeoutOpts.behavior=return-partial returned the usable results collected before the deadline. Partial collections are not cached as complete results.",
  ),
  results: s.array(
    "results value.",
    s.looseObject("results entry value.", {
      url: s.string("Canonical result URL."),
      title: s.string("Page title."),
      description: s.string(
        "Snippet excerpt from the page. Empty string when the search provider does not supply a snippet.",
      ),
      relevance: s.string("Relevance to the original query."),
      markdown: s.looseObject("Markdown scrape status and content for this result.", {}),
      highlights: s.looseObject("Highlights status and passages for this result.", {}),
    }),
  ),
  query: s.string("Echo of the original query (useful when fanout was enabled)."),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const enrich_personOutputSchema: JsonSchema = s.looseObject("Enrich a person response.", {
  partial: s.boolean(
    "True when the timeout ended processing and this response contains the usable data completed so far. Unfinished fields are omitted.",
  ),
  match: s.anyOf("match value.", [
    s.looseObject("The highest-scoring person candidate.", {
      status: s.string("status value."),
      score: s.integer("score value."),
      person: s.looseObject("person value.", {}),
    }),
    s.looseObject("No usable person candidate was found.", {
      status: s.string("status value."),
      score: s.literal(null, {
        description: "score value.",
      }),
      person: s.literal(null, {
        description: "person value.",
      }),
    }),
  ]),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const retrieve_brandOutputSchema: JsonSchema = s.looseObject("Retrieve a brand response.", {
  partial: s.boolean(
    "True when the timeout ended processing and this response contains the usable data completed so far. Unfinished fields are omitted.",
  ),
  status: s.string("Always `ok` on success."),
  brand: s.looseObject("Detailed brand information", {
    domain: s.string("The domain name of the brand"),
    title: s.string("The title or name of the brand"),
    description: s.string("A brief description of the brand"),
    slogan: s.string("The brand's slogan"),
    colors: s.array("An array of brand colors", s.looseObject("colors entry value.", {})),
    logos: s.array(
      "An array of logos associated with the brand. When a similarly shaped SVG variant exists, it is returned ahead of its raster equivalent; otherwise relevance order is preserved",
      s.looseObject("logos entry value.", {}),
    ),
    backdrops: s.array("An array of backdrop images for the brand", s.looseObject("backdrops entry value.", {})),
    socials: s.array("An array of social media links for the brand", s.looseObject("socials entry value.", {})),
    address: s.looseObject("Physical address of the brand", {}),
    stock: s.looseObject("Stock market information for this brand (will be null if not a publicly traded company)", {}),
    employees: s.looseObject("Employee headcount information for the brand (will be null if unknown)", {}),
    is_nsfw: s.boolean("Indicates whether the brand content is not safe for work (NSFW)"),
    email: s.string("Company email address"),
    phone: s.string("Company phone number"),
    industries: s.looseObject("Industry classification information for the brand", {}),
    links: s.looseObject("Important website links for the brand", {}),
    primary_language: s.anyOf(
      "The primary language of the brand's website content. Detected from the HTML lang tag, page content analysis, or social media descriptions.",
      [
        s.looseObject("primary language value.", {}),
        s.literal(null, {
          description: "primary language value.",
        }),
      ],
    ),
  }),
  code: s.integer("HTTP status code"),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const search_brandsOutputSchema: JsonSchema = s.looseObject("Auto-complete Brand response.", {
  results: s.array(
    "Up to 10 matching brands, name matches first, then domain matches, most popular first within each group. Empty when nothing matches.",
    s.looseObject("results entry value.", {
      domain: s.string("The brand's domain."),
      name: s.string("The brand's name. Empty string when unknown."),
      description: s.string("The brand's description, when available."),
      country: s.string("The brand's country, when available, as an uppercase ISO 3166-1 alpha-2 code."),
      language: s.string("The brand's primary language, when available."),
      logo: s.string("Logo link URL that serves the brand's logo, generated per request for the calling organization."),
    }),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const extract_styleguideOutputSchema: JsonSchema = s.looseObject("Extract a styleguide response.", {
  finalDOMState: s.string("`loaded`, or `still-loading` when capture ended before the page finished loading."),
  status: s.string("Always `ok` on success."),
  domain: s.string("The normalized domain that was processed"),
  styleguide: s.looseObject("Comprehensive styleguide data extracted from the website", {
    mode: s.string("The primary color mode of the website design"),
    colors: s.looseObject("Primary colors used on the website", {}),
    typography: s.looseObject("Typography styles used on the website", {}),
    elementSpacing: s.looseObject("Spacing system used on the website", {}),
    shadows: s.looseObject("Shadow styles used on the website", {}),
    fontLinks: s.looseObject(
      "Font assets keyed by family name as it appears in fontFamily/fontFallbacks (non-generic names only). Clients match typography.fontFamily / fontWeight or button styles to pick a file URL from files.",
      {},
    ),
    components: s.looseObject("UI component styles", {}),
  }),
  code: s.integer("HTTP status code"),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const extract_fontsOutputSchema: JsonSchema = s.looseObject("Extract fonts response.", {
  finalDOMState: s.string("`loaded`, or `still-loading` when capture ended before the page finished loading."),
  status: s.string("Always `ok` on success."),
  domain: s.string("The normalized domain that was processed"),
  fonts: s.array(
    "Array of font usage information",
    s.looseObject("fonts entry value.", {
      font: s.string("Font family name"),
      uses: s.array("Array of CSS selectors or element types where this font is used", s.string("uses entry value.")),
      fallbacks: s.array("Array of fallback font families", s.string("fallbacks entry value.")),
      num_elements: s.number("Number of elements using this font"),
      num_words: s.number("Number of words using this font"),
      percent_words: s.number("Percentage of words using this font"),
      percent_elements: s.number("Percentage of elements using this font"),
    }),
  ),
  fontLinks: s.looseObject(
    "Available font files keyed by family name. Omitted when no downloadable fonts are found.",
    {},
  ),
  code: s.integer("HTTP status code, e.g., 200"),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const classify_naicsOutputSchema: JsonSchema = s.looseObject("Classify NAICS codes response.", {
  partial: s.boolean(
    "True when the timeout ended processing and this response contains only usable results completed so far. Unfinished results are omitted.",
  ),
  status: s.string("Always `ok` on success."),
  domain: s.string("Domain found for the brand"),
  type: s.string("Industry classification type, for naics api it will be `naics`"),
  codes: s.array(
    "Array of NAICS codes and titles.",
    s.looseObject("codes entry value.", {
      code: s.string("NAICS code"),
      name: s.string("NAICS title"),
      confidence: s.string("Confidence level for how well this NAICS code matches the company description"),
    }),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const classify_sicOutputSchema: JsonSchema = s.looseObject("Classify SIC codes response.", {
  partial: s.boolean(
    "True when the timeout ended processing and this response contains only usable results completed so far. Unfinished results are omitted.",
  ),
  status: s.string("Always `ok` on success."),
  domain: s.string("Domain found for the brand"),
  type: s.string("Industry classification type, for sic api it will be `sic`"),
  classification: s.string("Echoes back which SIC dataset was used to classify the brand."),
  codes: s.array(
    "Array of SIC codes with confidence scores. Extra fields depend on the requested classification: `original_sic` results include `majorGroup` and `majorGroupName`; `latest_sec` results include `office`.",
    s.looseObject("codes entry value.", {
      code: s.string("SIC code (4-digit)."),
      name: s.string("SIC industry title."),
      confidence: s.string("Confidence level for how well this SIC code matches the company description."),
      majorGroup: s.string(
        "2-digit major group identifier (the leading two digits of the code). Only present when `classification` is `original_sic`.",
      ),
      majorGroupName: s.string(
        "Description of the 2-digit major group. Only present when `classification` is `original_sic`.",
      ),
      office: s.string(
        "SEC review office responsible for filings under this code. Only present when `classification` is `latest_sec`.",
      ),
    }),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const prefetch_brandOutputSchema: JsonSchema = s.looseObject("Prefetch brand data response.", {
  status: s.string("Always `ok` on success."),
  message: s.string("Success message"),
  type: s.string("The type of prefetch that was queued, echoed from the request"),
  domain: s.string("The domain that was queued for prefetching"),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const create_monitorOutputSchema: JsonSchema = s.looseObject("Create a monitor response.", {
  mode: s.string("Always `web`. Optional."),
  id: s.string("id value."),
  name: s.string("name value."),
  target: s.anyOf("What to watch: a page, a sitemap, or data extracted from a site.", [
    s.looseObject(
      "Watch a single web page. Exact detection reports visible-text diffs; semantic detection judges confirmed stable diffs against `instructions`.",
      {
        type: s.string("Use `page` to watch one web page."),
        url: s.string("Public HTTP(S) page URL to monitor."),
        instructions: s.string(
          "Plain-language goal describing which page changes matter. When provided without change_detection, semantic detection is inferred.",
        ),
        normalize_whitespace: s.boolean("Normalize whitespace before comparing or analyzing text."),
        include_selectors: s.array(
          "Monitor these CSS-selected regions. Empty or omitted uses main content. Changes create a new baseline.",
          s.string("include selectors entry value."),
        ),
        exclude_selectors: s.array(
          "Remove matching regions after inclusions. Changes create a new baseline.",
          s.string("exclude selectors entry value."),
        ),
        actions: s.nullable(
          s.array(
            "Optional browser actions executed in array order after the page loads, before content is captured, on every run. Requires a paid plan. Maximum: 5 actions. Changes create a new baseline.",
            s.anyOf("Browser action discriminated by `do`. Each variant exposes only its applicable fields.", [
              s.looseObject("Pause for a fixed number of milliseconds before continuing to the next action.", {}),
              s.looseObject("Resolve and perform one natural-language browser action.", {}),
              s.looseObject(
                "Scroll the page or a selected scrollable container, waiting adaptively for content and dimensions to settle after each iteration.",
                {},
              ),
            ]),
          ),
        ),
      },
    ),
    s.looseObject("Watch a site’s URL inventory for confirmed additions and removals.", {
      type: s.string("Use `sitemap` to watch a site for added or removed URLs."),
      url: s.string("Sitemap URL to monitor."),
      include: s.array("URL path patterns to include (max 50).", s.string("include entry value.")),
      exclude: s.array("URL path patterns to exclude (max 50).", s.string("exclude entry value.")),
      max_urls: s.integer("Maximum number of sitemap URLs to track (capped at 10,000)."),
    }),
    s.looseObject("target value.", {
      type: s.string("Use `extract` to watch structured data across selected pages."),
      url: s.string("Root URL to extract structured data from."),
      schema: s.looseObject(
        "JSON Schema for page selection and the baseline snapshot. Changes return diffs and evidence.",
        {},
      ),
      instructions: s.string(
        "Natural-language instructions guiding which pages and facts to track and which changes to report.",
      ),
      max_pages: s.integer("Maximum number of pages to track."),
      max_depth: s.integer("Optional maximum link depth from the starting URL (0 = only the starting page)."),
      follow_subdomains: s.boolean("Allow page discovery on subdomains of the target site."),
    }),
  ]),
  change_detection: s.anyOf(
    "How changes are judged. Defaults to `semantic` for extract targets and page targets with `instructions`, otherwise `exact`.",
    [
      s.looseObject(
        "Detect exact changes. For page targets, this means visible text diffs. For sitemap targets, this means URL additions and removals.",
        {
          type: s.string("Use `exact` to compare visible text or sitemap URLs."),
        },
      ),
      s.looseObject("Detect meaningful content changes using the target’s instructions and optional schema.", {
        type: s.string("Use `semantic` to judge changes against the target instructions."),
        confidence_threshold: s.number("Minimum confidence required to report a meaningful change, from 0 to 1."),
      }),
    ],
  ),
  schedule: s.anyOf("How often the monitor runs. Defaults to once a day.", [
    s.looseObject(
      "Run the monitor on a fixed interval defined by a frequency and a unit, e.g. every 6 hours or every 2 days. The total interval (frequency × unit) must be between 10 minutes and 1 year.",
      {
        type: s.string("Use `interval` to run on a repeating schedule."),
        frequency: s.integer(
          "Number of units between runs. The resulting interval (frequency × unit) must be at least 10 minutes and at most 1 year (e.g. minimum 10 when unit is minutes; maximum 365 when unit is days).",
        ),
        unit: s.string("Time unit used with `frequency` to set the run interval."),
      },
    ),
  ]),
  webhook: s.anyOf("Webhook destination and delivery settings. Null means no webhook is configured.", [
    s.looseObject("webhook value.", {
      url: s.string("Public HTTP(S) URL that receives events. Slack and GovSlack URLs get formatted messages."),
      events: s.array(
        "Events to deliver. Defaults to `change.detected`; `run.completed` also includes unchanged runs.",
        s.string("events entry value."),
      ),
      retry: s.looseObject("Webhook retry settings. Use {} for the default schedule.", {}),
      secret: s.string("API-generated signing secret. Visible only with full access or `monitors:write` permission."),
    }),
    s.literal(null, {
      description: "webhook value.",
    }),
  ]),
  status: s.string(
    'Current state. Failed monitors keep running; paused monitors must be resumed with `status: "active"`.',
  ),
  last_run_at: s.nullable(s.string("last run at value.")),
  last_change_at: s.nullable(s.string("last change at value.")),
  next_run_at: s.nullable(s.string("When the next scheduled run is due; null while paused.")),
  last_error: s.anyOf("Error from the most recent failed run; null when the last run succeeded.", [
    s.looseObject("last error value.", {
      code: s.string("code value."),
      message: s.string("message value."),
    }),
    s.literal(null, {
      description: "last error value.",
    }),
  ]),
  webhook_failure: s.anyOf(
    "Present while webhook deliveries are failing consecutively; null when deliveries are healthy or no webhook is configured. Cleared on the next successful delivery and when the webhook URL changes.",
    [
      s.looseObject("webhook failure value.", {
        consecutive_failures: s.integer("Number of consecutive delivery attempts that did not succeed."),
        last_status: s.string(
          "Outcome of the most recent failed delivery. rejected means a non-2xx response; failed means no HTTP response was received; skipped_unsafe_url means the URL failed the public-endpoint safety check.",
        ),
        last_message: s.string("Human-readable description of the most recent failure."),
        last_failed_at: s.string("last failed at value."),
      }),
      s.literal(null, {
        description: "webhook failure value.",
      }),
    ],
  ),
  created_at: s.string("created at value."),
  updated_at: s.string("updated at value."),
  tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
  baseline: s.anyOf(
    "Comparison baseline, included on Retrieve. Null until capture completes or after target changes.",
    [
      s.looseObject("Current baseline of a `page` monitor: the visible page text as last observed.", {
        text: s.string("The page's visible text as last observed."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject("Current baseline of a `sitemap` monitor: the normalized URL set as last observed.", {
        urls: s.array("The sitemap URLs as last observed (sorted, normalized).", s.string("urls entry value.")),
        url_count: s.integer("Number of URLs in the baseline."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject(
        "Current baseline of an `extract` monitor: the pages it tracks and the structured data as last extracted.",
        {
          data: s.unknown(
            "Latest structured snapshot matching the extraction schema, refreshed at most daily; `null` before capture.",
          ),
          urls_analyzed: s.array(
            "The page URLs the monitor tracks and analyzes for changes.",
            s.string("urls analyzed entry value."),
          ),
          captured_at: s.string("When this baseline was last captured or replaced."),
        },
      ),
      s.literal(null, {
        description: "baseline value.",
      }),
    ],
  ),
  initial_run_id: s.nullable(
    s.string("ID of the baseline run queued at creation; null if it will start on the next scheduled tick."),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_monitorsOutputSchema: JsonSchema = s.looseObject("List monitors response.", {
  data: s.array(
    "data value.",
    s.looseObject(
      "A web monitor. `mode` is the constant `web`; behavior is described by `target` (page/sitemap/extract) and `change_detection` (exact/semantic).",
      {
        mode: s.string("Always `web`. Optional."),
        id: s.string("id value."),
        name: s.string("name value."),
        target: s.anyOf("What to watch: a page, a sitemap, or data extracted from a site.", [
          s.looseObject(
            "Watch a single web page. Exact detection reports visible-text diffs; semantic detection judges confirmed stable diffs against `instructions`.",
            {},
          ),
          s.looseObject("Watch a site’s URL inventory for confirmed additions and removals.", {}),
          s.looseObject("target value.", {}),
        ]),
        change_detection: s.anyOf(
          "How changes are judged. Defaults to `semantic` for extract targets and page targets with `instructions`, otherwise `exact`.",
          [
            s.looseObject(
              "Detect exact changes. For page targets, this means visible text diffs. For sitemap targets, this means URL additions and removals.",
              {},
            ),
            s.looseObject("Detect meaningful content changes using the target’s instructions and optional schema.", {}),
          ],
        ),
        schedule: s.anyOf("How often the monitor runs. Defaults to once a day.", [
          s.looseObject(
            "Run the monitor on a fixed interval defined by a frequency and a unit, e.g. every 6 hours or every 2 days. The total interval (frequency × unit) must be between 10 minutes and 1 year.",
            {},
          ),
        ]),
        webhook: s.anyOf("Webhook destination and delivery settings. Null means no webhook is configured.", [
          s.looseObject("webhook value.", {}),
          s.literal(null, {
            description: "webhook value.",
          }),
        ]),
        status: s.string(
          'Current state. Failed monitors keep running; paused monitors must be resumed with `status: "active"`.',
        ),
        last_run_at: s.nullable(s.string("last run at value.")),
        last_change_at: s.nullable(s.string("last change at value.")),
        next_run_at: s.nullable(s.string("When the next scheduled run is due; null while paused.")),
        last_error: s.anyOf("Error from the most recent failed run; null when the last run succeeded.", [
          s.looseObject("last error value.", {}),
          s.literal(null, {
            description: "last error value.",
          }),
        ]),
        webhook_failure: s.anyOf(
          "Present while webhook deliveries are failing consecutively; null when deliveries are healthy or no webhook is configured. Cleared on the next successful delivery and when the webhook URL changes.",
          [
            s.looseObject("webhook failure value.", {}),
            s.literal(null, {
              description: "webhook failure value.",
            }),
          ],
        ),
        created_at: s.string("created at value."),
        updated_at: s.string("updated at value."),
        tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
        baseline: s.anyOf(
          "Comparison baseline, included on Retrieve. Null until capture completes or after target changes.",
          [
            s.looseObject("Current baseline of a `page` monitor: the visible page text as last observed.", {}),
            s.looseObject("Current baseline of a `sitemap` monitor: the normalized URL set as last observed.", {}),
            s.looseObject(
              "Current baseline of an `extract` monitor: the pages it tracks and the structured data as last extracted.",
              {},
            ),
            s.literal(null, {
              description: "baseline value.",
            }),
          ],
        ),
      },
    ),
  ),
  has_more: s.boolean("has more value."),
  next_cursor: s.nullable(s.string("next cursor value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_monitorOutputSchema: JsonSchema = s.looseObject("Retrieve a monitor response.", {
  mode: s.string("Always `web`. Optional."),
  id: s.string("id value."),
  name: s.string("name value."),
  target: s.anyOf("What to watch: a page, a sitemap, or data extracted from a site.", [
    s.looseObject(
      "Watch a single web page. Exact detection reports visible-text diffs; semantic detection judges confirmed stable diffs against `instructions`.",
      {
        type: s.string("Use `page` to watch one web page."),
        url: s.string("Public HTTP(S) page URL to monitor."),
        instructions: s.string(
          "Plain-language goal describing which page changes matter. When provided without change_detection, semantic detection is inferred.",
        ),
        normalize_whitespace: s.boolean("Normalize whitespace before comparing or analyzing text."),
        include_selectors: s.array(
          "Monitor these CSS-selected regions. Empty or omitted uses main content. Changes create a new baseline.",
          s.string("include selectors entry value."),
        ),
        exclude_selectors: s.array(
          "Remove matching regions after inclusions. Changes create a new baseline.",
          s.string("exclude selectors entry value."),
        ),
        actions: s.nullable(
          s.array(
            "Optional browser actions executed in array order after the page loads, before content is captured, on every run. Requires a paid plan. Maximum: 5 actions. Changes create a new baseline.",
            s.anyOf("Browser action discriminated by `do`. Each variant exposes only its applicable fields.", [
              s.looseObject("Pause for a fixed number of milliseconds before continuing to the next action.", {}),
              s.looseObject("Resolve and perform one natural-language browser action.", {}),
              s.looseObject(
                "Scroll the page or a selected scrollable container, waiting adaptively for content and dimensions to settle after each iteration.",
                {},
              ),
            ]),
          ),
        ),
      },
    ),
    s.looseObject("Watch a site’s URL inventory for confirmed additions and removals.", {
      type: s.string("Use `sitemap` to watch a site for added or removed URLs."),
      url: s.string("Sitemap URL to monitor."),
      include: s.array("URL path patterns to include (max 50).", s.string("include entry value.")),
      exclude: s.array("URL path patterns to exclude (max 50).", s.string("exclude entry value.")),
      max_urls: s.integer("Maximum number of sitemap URLs to track (capped at 10,000)."),
    }),
    s.looseObject("target value.", {
      type: s.string("Use `extract` to watch structured data across selected pages."),
      url: s.string("Root URL to extract structured data from."),
      schema: s.looseObject(
        "JSON Schema for page selection and the baseline snapshot. Changes return diffs and evidence.",
        {},
      ),
      instructions: s.string(
        "Natural-language instructions guiding which pages and facts to track and which changes to report.",
      ),
      max_pages: s.integer("Maximum number of pages to track."),
      max_depth: s.integer("Optional maximum link depth from the starting URL (0 = only the starting page)."),
      follow_subdomains: s.boolean("Allow page discovery on subdomains of the target site."),
    }),
  ]),
  change_detection: s.anyOf(
    "How changes are judged. Defaults to `semantic` for extract targets and page targets with `instructions`, otherwise `exact`.",
    [
      s.looseObject(
        "Detect exact changes. For page targets, this means visible text diffs. For sitemap targets, this means URL additions and removals.",
        {
          type: s.string("Use `exact` to compare visible text or sitemap URLs."),
        },
      ),
      s.looseObject("Detect meaningful content changes using the target’s instructions and optional schema.", {
        type: s.string("Use `semantic` to judge changes against the target instructions."),
        confidence_threshold: s.number("Minimum confidence required to report a meaningful change, from 0 to 1."),
      }),
    ],
  ),
  schedule: s.anyOf("How often the monitor runs. Defaults to once a day.", [
    s.looseObject(
      "Run the monitor on a fixed interval defined by a frequency and a unit, e.g. every 6 hours or every 2 days. The total interval (frequency × unit) must be between 10 minutes and 1 year.",
      {
        type: s.string("Use `interval` to run on a repeating schedule."),
        frequency: s.integer(
          "Number of units between runs. The resulting interval (frequency × unit) must be at least 10 minutes and at most 1 year (e.g. minimum 10 when unit is minutes; maximum 365 when unit is days).",
        ),
        unit: s.string("Time unit used with `frequency` to set the run interval."),
      },
    ),
  ]),
  webhook: s.anyOf("Webhook destination and delivery settings. Null means no webhook is configured.", [
    s.looseObject("webhook value.", {
      url: s.string("Public HTTP(S) URL that receives events. Slack and GovSlack URLs get formatted messages."),
      events: s.array(
        "Events to deliver. Defaults to `change.detected`; `run.completed` also includes unchanged runs.",
        s.string("events entry value."),
      ),
      retry: s.looseObject("Webhook retry settings. Use {} for the default schedule.", {}),
      secret: s.string("API-generated signing secret. Visible only with full access or `monitors:write` permission."),
    }),
    s.literal(null, {
      description: "webhook value.",
    }),
  ]),
  status: s.string(
    'Current state. Failed monitors keep running; paused monitors must be resumed with `status: "active"`.',
  ),
  last_run_at: s.nullable(s.string("last run at value.")),
  last_change_at: s.nullable(s.string("last change at value.")),
  next_run_at: s.nullable(s.string("When the next scheduled run is due; null while paused.")),
  last_error: s.anyOf("Error from the most recent failed run; null when the last run succeeded.", [
    s.looseObject("last error value.", {
      code: s.string("code value."),
      message: s.string("message value."),
    }),
    s.literal(null, {
      description: "last error value.",
    }),
  ]),
  webhook_failure: s.anyOf(
    "Present while webhook deliveries are failing consecutively; null when deliveries are healthy or no webhook is configured. Cleared on the next successful delivery and when the webhook URL changes.",
    [
      s.looseObject("webhook failure value.", {
        consecutive_failures: s.integer("Number of consecutive delivery attempts that did not succeed."),
        last_status: s.string(
          "Outcome of the most recent failed delivery. rejected means a non-2xx response; failed means no HTTP response was received; skipped_unsafe_url means the URL failed the public-endpoint safety check.",
        ),
        last_message: s.string("Human-readable description of the most recent failure."),
        last_failed_at: s.string("last failed at value."),
      }),
      s.literal(null, {
        description: "webhook failure value.",
      }),
    ],
  ),
  created_at: s.string("created at value."),
  updated_at: s.string("updated at value."),
  tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
  baseline: s.anyOf(
    "Comparison baseline, included on Retrieve. Null until capture completes or after target changes.",
    [
      s.looseObject("Current baseline of a `page` monitor: the visible page text as last observed.", {
        text: s.string("The page's visible text as last observed."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject("Current baseline of a `sitemap` monitor: the normalized URL set as last observed.", {
        urls: s.array("The sitemap URLs as last observed (sorted, normalized).", s.string("urls entry value.")),
        url_count: s.integer("Number of URLs in the baseline."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject(
        "Current baseline of an `extract` monitor: the pages it tracks and the structured data as last extracted.",
        {
          data: s.unknown(
            "Latest structured snapshot matching the extraction schema, refreshed at most daily; `null` before capture.",
          ),
          urls_analyzed: s.array(
            "The page URLs the monitor tracks and analyzes for changes.",
            s.string("urls analyzed entry value."),
          ),
          captured_at: s.string("When this baseline was last captured or replaced."),
        },
      ),
      s.literal(null, {
        description: "baseline value.",
      }),
    ],
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const update_monitorOutputSchema: JsonSchema = s.looseObject("Update a monitor response.", {
  mode: s.string("Always `web`. Optional."),
  id: s.string("id value."),
  name: s.string("name value."),
  target: s.anyOf("What to watch: a page, a sitemap, or data extracted from a site.", [
    s.looseObject(
      "Watch a single web page. Exact detection reports visible-text diffs; semantic detection judges confirmed stable diffs against `instructions`.",
      {
        type: s.string("Use `page` to watch one web page."),
        url: s.string("Public HTTP(S) page URL to monitor."),
        instructions: s.string(
          "Plain-language goal describing which page changes matter. When provided without change_detection, semantic detection is inferred.",
        ),
        normalize_whitespace: s.boolean("Normalize whitespace before comparing or analyzing text."),
        include_selectors: s.array(
          "Monitor these CSS-selected regions. Empty or omitted uses main content. Changes create a new baseline.",
          s.string("include selectors entry value."),
        ),
        exclude_selectors: s.array(
          "Remove matching regions after inclusions. Changes create a new baseline.",
          s.string("exclude selectors entry value."),
        ),
        actions: s.nullable(
          s.array(
            "Optional browser actions executed in array order after the page loads, before content is captured, on every run. Requires a paid plan. Maximum: 5 actions. Changes create a new baseline.",
            s.anyOf("Browser action discriminated by `do`. Each variant exposes only its applicable fields.", [
              s.looseObject("Pause for a fixed number of milliseconds before continuing to the next action.", {}),
              s.looseObject("Resolve and perform one natural-language browser action.", {}),
              s.looseObject(
                "Scroll the page or a selected scrollable container, waiting adaptively for content and dimensions to settle after each iteration.",
                {},
              ),
            ]),
          ),
        ),
      },
    ),
    s.looseObject("Watch a site’s URL inventory for confirmed additions and removals.", {
      type: s.string("Use `sitemap` to watch a site for added or removed URLs."),
      url: s.string("Sitemap URL to monitor."),
      include: s.array("URL path patterns to include (max 50).", s.string("include entry value.")),
      exclude: s.array("URL path patterns to exclude (max 50).", s.string("exclude entry value.")),
      max_urls: s.integer("Maximum number of sitemap URLs to track (capped at 10,000)."),
    }),
    s.looseObject("target value.", {
      type: s.string("Use `extract` to watch structured data across selected pages."),
      url: s.string("Root URL to extract structured data from."),
      schema: s.looseObject(
        "JSON Schema for page selection and the baseline snapshot. Changes return diffs and evidence.",
        {},
      ),
      instructions: s.string(
        "Natural-language instructions guiding which pages and facts to track and which changes to report.",
      ),
      max_pages: s.integer("Maximum number of pages to track."),
      max_depth: s.integer("Optional maximum link depth from the starting URL (0 = only the starting page)."),
      follow_subdomains: s.boolean("Allow page discovery on subdomains of the target site."),
    }),
  ]),
  change_detection: s.anyOf(
    "How changes are judged. Defaults to `semantic` for extract targets and page targets with `instructions`, otherwise `exact`.",
    [
      s.looseObject(
        "Detect exact changes. For page targets, this means visible text diffs. For sitemap targets, this means URL additions and removals.",
        {
          type: s.string("Use `exact` to compare visible text or sitemap URLs."),
        },
      ),
      s.looseObject("Detect meaningful content changes using the target’s instructions and optional schema.", {
        type: s.string("Use `semantic` to judge changes against the target instructions."),
        confidence_threshold: s.number("Minimum confidence required to report a meaningful change, from 0 to 1."),
      }),
    ],
  ),
  schedule: s.anyOf("How often the monitor runs. Defaults to once a day.", [
    s.looseObject(
      "Run the monitor on a fixed interval defined by a frequency and a unit, e.g. every 6 hours or every 2 days. The total interval (frequency × unit) must be between 10 minutes and 1 year.",
      {
        type: s.string("Use `interval` to run on a repeating schedule."),
        frequency: s.integer(
          "Number of units between runs. The resulting interval (frequency × unit) must be at least 10 minutes and at most 1 year (e.g. minimum 10 when unit is minutes; maximum 365 when unit is days).",
        ),
        unit: s.string("Time unit used with `frequency` to set the run interval."),
      },
    ),
  ]),
  webhook: s.anyOf("Webhook destination and delivery settings. Null means no webhook is configured.", [
    s.looseObject("webhook value.", {
      url: s.string("Public HTTP(S) URL that receives events. Slack and GovSlack URLs get formatted messages."),
      events: s.array(
        "Events to deliver. Defaults to `change.detected`; `run.completed` also includes unchanged runs.",
        s.string("events entry value."),
      ),
      retry: s.looseObject("Webhook retry settings. Use {} for the default schedule.", {}),
      secret: s.string("API-generated signing secret. Visible only with full access or `monitors:write` permission."),
    }),
    s.literal(null, {
      description: "webhook value.",
    }),
  ]),
  status: s.string(
    'Current state. Failed monitors keep running; paused monitors must be resumed with `status: "active"`.',
  ),
  last_run_at: s.nullable(s.string("last run at value.")),
  last_change_at: s.nullable(s.string("last change at value.")),
  next_run_at: s.nullable(s.string("When the next scheduled run is due; null while paused.")),
  last_error: s.anyOf("Error from the most recent failed run; null when the last run succeeded.", [
    s.looseObject("last error value.", {
      code: s.string("code value."),
      message: s.string("message value."),
    }),
    s.literal(null, {
      description: "last error value.",
    }),
  ]),
  webhook_failure: s.anyOf(
    "Present while webhook deliveries are failing consecutively; null when deliveries are healthy or no webhook is configured. Cleared on the next successful delivery and when the webhook URL changes.",
    [
      s.looseObject("webhook failure value.", {
        consecutive_failures: s.integer("Number of consecutive delivery attempts that did not succeed."),
        last_status: s.string(
          "Outcome of the most recent failed delivery. rejected means a non-2xx response; failed means no HTTP response was received; skipped_unsafe_url means the URL failed the public-endpoint safety check.",
        ),
        last_message: s.string("Human-readable description of the most recent failure."),
        last_failed_at: s.string("last failed at value."),
      }),
      s.literal(null, {
        description: "webhook failure value.",
      }),
    ],
  ),
  created_at: s.string("created at value."),
  updated_at: s.string("updated at value."),
  tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
  baseline: s.anyOf(
    "Comparison baseline, included on Retrieve. Null until capture completes or after target changes.",
    [
      s.looseObject("Current baseline of a `page` monitor: the visible page text as last observed.", {
        text: s.string("The page's visible text as last observed."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject("Current baseline of a `sitemap` monitor: the normalized URL set as last observed.", {
        urls: s.array("The sitemap URLs as last observed (sorted, normalized).", s.string("urls entry value.")),
        url_count: s.integer("Number of URLs in the baseline."),
        captured_at: s.string("When this baseline was last captured or replaced."),
      }),
      s.looseObject(
        "Current baseline of an `extract` monitor: the pages it tracks and the structured data as last extracted.",
        {
          data: s.unknown(
            "Latest structured snapshot matching the extraction schema, refreshed at most daily; `null` before capture.",
          ),
          urls_analyzed: s.array(
            "The page URLs the monitor tracks and analyzes for changes.",
            s.string("urls analyzed entry value."),
          ),
          captured_at: s.string("When this baseline was last captured or replaced."),
        },
      ),
      s.literal(null, {
        description: "baseline value.",
      }),
    ],
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const delete_monitorOutputSchema: JsonSchema = s.looseObject("Delete a monitor response.", {
  id: s.string("id value."),
  deleted: s.boolean("deleted value."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_monitor_runsOutputSchema: JsonSchema = s.looseObject("List monitor runs response.", {
  data: s.array(
    "data value.",
    s.looseObject("data entry value.", {
      webhook_delivery_ids: s.array(
        "Webhook delivery IDs for this run.",
        s.string("webhook delivery ids entry value."),
      ),
      id: s.string("id value."),
      monitor_id: s.string("monitor id value."),
      status: s.string(
        "Lifecycle status of a run. `skipped` runs never executed — see `skip_reason` (insufficient credits, monitor paused, or superseded by a concurrent run).",
      ),
      run_type: s.string("A baseline run follows creation or a target or detection change."),
      target_type: s.string("target type value."),
      change_detection_type: s.string("change detection type value."),
      started_at: s.nullable(s.string("started at value.")),
      completed_at: s.nullable(s.string("completed at value.")),
      change_detected: s.boolean("change detected value."),
      change_id: s.nullable(s.string("change id value.")),
      baseline_created: s.boolean(
        "True when this run established the monitor's initial baseline; baseline runs perform no change detection.",
      ),
      credits_charged: s.integer("Credits charged for this run (0 for skipped/failed runs)."),
      skip_reason: s.nullable(s.string("Why a skipped run never executed; null unless status is `skipped`.")),
      error: s.anyOf("error value.", [
        s.looseObject("error value.", {}),
        s.literal(null, {
          description: "error value.",
        }),
      ]),
      webhook_delivery: s.looseObject("Deprecated. Use `webhook_deliveries` for all attempts.", {}),
      webhook_deliveries: s.array(
        "All webhook deliveries attempted by this run — one per subscribed event that fired. Omitted when no webhook was attempted, including runs created before event selection was added.",
        s.looseObject("webhook deliveries entry value.", {}),
      ),
    }),
  ),
  has_more: s.boolean("has more value."),
  next_cursor: s.nullable(s.string("next cursor value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_monitor_runOutputSchema: JsonSchema = s.looseObject("Retrieve a monitor run response.", {
  webhook_delivery_ids: s.array("Webhook delivery IDs for this run.", s.string("webhook delivery ids entry value.")),
  id: s.string("id value."),
  monitor_id: s.string("monitor id value."),
  status: s.string(
    "Lifecycle status of a run. `skipped` runs never executed — see `skip_reason` (insufficient credits, monitor paused, or superseded by a concurrent run).",
  ),
  run_type: s.string("A baseline run follows creation or a target or detection change."),
  target_type: s.string("target type value."),
  change_detection_type: s.string("change detection type value."),
  started_at: s.nullable(s.string("started at value.")),
  completed_at: s.nullable(s.string("completed at value.")),
  change_detected: s.boolean("change detected value."),
  change_id: s.nullable(s.string("change id value.")),
  baseline_created: s.boolean(
    "True when this run established the monitor's initial baseline; baseline runs perform no change detection.",
  ),
  credits_charged: s.integer("Credits charged for this run (0 for skipped/failed runs)."),
  skip_reason: s.nullable(s.string("Why a skipped run never executed; null unless status is `skipped`.")),
  error: s.anyOf("error value.", [
    s.looseObject("error value.", {
      code: s.string("code value."),
      message: s.string("message value."),
    }),
    s.literal(null, {
      description: "error value.",
    }),
  ]),
  webhook_delivery: s.looseObject("Deprecated. Use `webhook_deliveries` for all attempts.", {
    delivery_id: s.string("Delivery ID for status checks and retries, when available."),
    event_id: s.string("Identifier sent in the X-Context-Id header."),
    event: s.string(
      "The event this delivery carried. Deliveries recorded before event selection existed report change.detected.",
    ),
    status: s.string("Outcome of the delivery attempt. Any 2xx response counts as delivered."),
    http_status: s.nullable(
      s.integer("The endpoint's final HTTP response status, or null when no response was received."),
    ),
    attempted_at: s.string("attempted at value."),
    error: s.anyOf("error value.", [
      s.looseObject("error value.", {}),
      s.literal(null, {
        description: "error value.",
      }),
    ]),
  }),
  webhook_deliveries: s.array(
    "All webhook deliveries attempted by this run — one per subscribed event that fired. Omitted when no webhook was attempted, including runs created before event selection was added.",
    s.looseObject("webhook deliveries entry value.", {
      delivery_id: s.string("Delivery ID for status checks and retries, when available."),
      event_id: s.string("Identifier sent in the X-Context-Id header."),
      event: s.string(
        "The event this delivery carried. Deliveries recorded before event selection existed report change.detected.",
      ),
      status: s.string("Outcome of the delivery attempt. Any 2xx response counts as delivered."),
      http_status: s.nullable(
        s.integer("The endpoint's final HTTP response status, or null when no response was received."),
      ),
      attempted_at: s.string("attempted at value."),
      error: s.anyOf("error value.", [
        s.looseObject("error value.", {}),
        s.literal(null, {
          description: "error value.",
        }),
      ]),
    }),
  ),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_monitor_changesOutputSchema: JsonSchema = s.looseObject("List monitor changes response.", {
  data: s.array(
    "data value.",
    s.looseObject("Detected change, including applicable diffs, URLs, and supporting evidence.", {
      mode: s.string("Always `web`. Optional."),
      id: s.string("id value."),
      monitor_id: s.string("monitor id value."),
      run_id: s.string("The run that detected this change."),
      target_type: s.string("target type value."),
      change_detection_type: s.string("change detection type value."),
      title: s.string("title value."),
      summary: s.string("summary value."),
      detected_at: s.string("detected at value."),
      url: s.string("url value."),
      importance: s.string("importance value."),
      confidence: s.number("confidence value."),
      diff: s.string("Text diff between the previous and current page baseline (page targets)."),
      before_text_excerpt: s.string("before text excerpt value."),
      after_text_excerpt: s.string("after text excerpt value."),
      added_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("added urls entry value."),
      ),
      removed_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("removed urls entry value."),
      ),
      added_url_count: s.integer("added url count value."),
      removed_url_count: s.integer("removed url count value."),
      matched_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("matched urls entry value."),
      ),
      matched_url_count: s.integer("matched url count value."),
      evidence: s.array("evidence value.", s.looseObject("evidence entry value.", {})),
      tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
    }),
  ),
  has_more: s.boolean("has more value."),
  next_cursor: s.nullable(s.string("next cursor value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_account_runsOutputSchema: JsonSchema = s.looseObject("List runs for all monitors response.", {
  data: s.array(
    "data value.",
    s.looseObject("data entry value.", {
      webhook_delivery_ids: s.array(
        "Webhook delivery IDs for this run.",
        s.string("webhook delivery ids entry value."),
      ),
      id: s.string("id value."),
      monitor_id: s.string("monitor id value."),
      status: s.string(
        "Lifecycle status of a run. `skipped` runs never executed — see `skip_reason` (insufficient credits, monitor paused, or superseded by a concurrent run).",
      ),
      run_type: s.string("A baseline run follows creation or a target or detection change."),
      target_type: s.string("target type value."),
      change_detection_type: s.string("change detection type value."),
      started_at: s.nullable(s.string("started at value.")),
      completed_at: s.nullable(s.string("completed at value.")),
      change_detected: s.boolean("change detected value."),
      change_id: s.nullable(s.string("change id value.")),
      baseline_created: s.boolean(
        "True when this run established the monitor's initial baseline; baseline runs perform no change detection.",
      ),
      credits_charged: s.integer("Credits charged for this run (0 for skipped/failed runs)."),
      skip_reason: s.nullable(s.string("Why a skipped run never executed; null unless status is `skipped`.")),
      error: s.anyOf("error value.", [
        s.looseObject("error value.", {}),
        s.literal(null, {
          description: "error value.",
        }),
      ]),
      webhook_delivery: s.looseObject("Deprecated. Use `webhook_deliveries` for all attempts.", {}),
      webhook_deliveries: s.array(
        "All webhook deliveries attempted by this run — one per subscribed event that fired. Omitted when no webhook was attempted, including runs created before event selection was added.",
        s.looseObject("webhook deliveries entry value.", {}),
      ),
    }),
  ),
  has_more: s.boolean("has more value."),
  next_cursor: s.nullable(s.string("next cursor value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_monitor_credit_usageOutputSchema: JsonSchema = s.looseObject(
  "Retrieve monitor credit usage response.",
  {
    data: s.array(
      "data value.",
      s.looseObject("Monitor credit usage", {
        monitor_id: s.string("monitor id value."),
        name: s.string("Monitor name (falls back to the id when the monitor was deleted)."),
        credits: s.integer("Credits charged to this monitor over the window."),
        runs: s.integer("Number of billed runs over the window."),
      }),
    ),
    total_credits: s.integer("Sum of credits across all monitors in the window."),
    key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
      credits_consumed: s.integer("Credits charged for this request."),
      credits_remaining: s.integer("Credits remaining for your organization."),
    }),
    request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
  },
);
export const get_monitor_limitsOutputSchema: JsonSchema = s.looseObject("Retrieve monitor limits response.", {
  monitors_used: s.integer("Number of monitors the account currently has."),
  monitors_limit: s.integer("Most monitors you can have: your plan's allowance or a custom limit."),
  plan: s.string("`starter` means Developer; `pro` means Pro or Growth; `scale` means Scale or Enterprise."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_changesOutputSchema: JsonSchema = s.looseObject("List changes for all monitors response.", {
  data: s.array(
    "data value.",
    s.looseObject("Detected change, including applicable diffs, URLs, and supporting evidence.", {
      mode: s.string("Always `web`. Optional."),
      id: s.string("id value."),
      monitor_id: s.string("monitor id value."),
      run_id: s.string("The run that detected this change."),
      target_type: s.string("target type value."),
      change_detection_type: s.string("change detection type value."),
      title: s.string("title value."),
      summary: s.string("summary value."),
      detected_at: s.string("detected at value."),
      url: s.string("url value."),
      importance: s.string("importance value."),
      confidence: s.number("confidence value."),
      diff: s.string("Text diff between the previous and current page baseline (page targets)."),
      before_text_excerpt: s.string("before text excerpt value."),
      after_text_excerpt: s.string("after text excerpt value."),
      added_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("added urls entry value."),
      ),
      removed_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("removed urls entry value."),
      ),
      added_url_count: s.integer("added url count value."),
      removed_url_count: s.integer("removed url count value."),
      matched_urls: s.array(
        "At most 500 URLs are included; the corresponding count field is always exact.",
        s.string("matched urls entry value."),
      ),
      matched_url_count: s.integer("matched url count value."),
      evidence: s.array("evidence value.", s.looseObject("evidence entry value.", {})),
      tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
    }),
  ),
  has_more: s.boolean("has more value."),
  next_cursor: s.nullable(s.string("next cursor value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_changeOutputSchema: JsonSchema = s.looseObject("Retrieve a monitor change response.", {
  mode: s.string("Always `web`. Optional."),
  id: s.string("id value."),
  monitor_id: s.string("monitor id value."),
  run_id: s.string("The run that detected this change."),
  target_type: s.string("target type value."),
  change_detection_type: s.string("change detection type value."),
  title: s.string("title value."),
  summary: s.string("summary value."),
  detected_at: s.string("detected at value."),
  url: s.string("url value."),
  importance: s.string("importance value."),
  confidence: s.number("confidence value."),
  diff: s.string("Text diff between the previous and current page baseline (page targets)."),
  before_text_excerpt: s.string("before text excerpt value."),
  after_text_excerpt: s.string("after text excerpt value."),
  added_urls: s.array(
    "At most 500 URLs are included; the corresponding count field is always exact.",
    s.string("added urls entry value."),
  ),
  removed_urls: s.array(
    "At most 500 URLs are included; the corresponding count field is always exact.",
    s.string("removed urls entry value."),
  ),
  added_url_count: s.integer("added url count value."),
  removed_url_count: s.integer("removed url count value."),
  matched_urls: s.array(
    "At most 500 URLs are included; the corresponding count field is always exact.",
    s.string("matched urls entry value."),
  ),
  matched_url_count: s.integer("matched url count value."),
  evidence: s.array(
    "evidence value.",
    s.looseObject("evidence entry value.", {
      url: s.string("Optional URL the evidence relates to. Absent for whole-target diffs."),
      before: s.string("Snapshot of the content before the change."),
      after: s.string("Snapshot of the content after the change."),
    }),
  ),
  tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const run_monitor_nowOutputSchema: JsonSchema = s.looseObject("Run a monitor now response.", {
  monitor_id: s.string("monitor id value."),
  run_id: s.string("ID of the queued run; pass it to Retrieve a monitor run."),
  queued: s.boolean("queued value."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const rotate_monitor_webhook_secretOutputSchema: JsonSchema = s.looseObject(
  "Rotate a monitor webhook secret response.",
  {
    mode: s.string("Always `web`. Optional."),
    id: s.string("id value."),
    name: s.string("name value."),
    target: s.anyOf("What to watch: a page, a sitemap, or data extracted from a site.", [
      s.looseObject(
        "Watch a single web page. Exact detection reports visible-text diffs; semantic detection judges confirmed stable diffs against `instructions`.",
        {
          type: s.string("Use `page` to watch one web page."),
          url: s.string("Public HTTP(S) page URL to monitor."),
          instructions: s.string(
            "Plain-language goal describing which page changes matter. When provided without change_detection, semantic detection is inferred.",
          ),
          normalize_whitespace: s.boolean("Normalize whitespace before comparing or analyzing text."),
          include_selectors: s.array(
            "Monitor these CSS-selected regions. Empty or omitted uses main content. Changes create a new baseline.",
            s.string("include selectors entry value."),
          ),
          exclude_selectors: s.array(
            "Remove matching regions after inclusions. Changes create a new baseline.",
            s.string("exclude selectors entry value."),
          ),
          actions: s.nullable(
            s.array(
              "Optional browser actions executed in array order after the page loads, before content is captured, on every run. Requires a paid plan. Maximum: 5 actions. Changes create a new baseline.",
              s.anyOf("Browser action discriminated by `do`. Each variant exposes only its applicable fields.", [
                s.looseObject("Pause for a fixed number of milliseconds before continuing to the next action.", {}),
                s.looseObject("Resolve and perform one natural-language browser action.", {}),
                s.looseObject(
                  "Scroll the page or a selected scrollable container, waiting adaptively for content and dimensions to settle after each iteration.",
                  {},
                ),
              ]),
            ),
          ),
        },
      ),
      s.looseObject("Watch a site’s URL inventory for confirmed additions and removals.", {
        type: s.string("Use `sitemap` to watch a site for added or removed URLs."),
        url: s.string("Sitemap URL to monitor."),
        include: s.array("URL path patterns to include (max 50).", s.string("include entry value.")),
        exclude: s.array("URL path patterns to exclude (max 50).", s.string("exclude entry value.")),
        max_urls: s.integer("Maximum number of sitemap URLs to track (capped at 10,000)."),
      }),
      s.looseObject("target value.", {
        type: s.string("Use `extract` to watch structured data across selected pages."),
        url: s.string("Root URL to extract structured data from."),
        schema: s.looseObject(
          "JSON Schema for page selection and the baseline snapshot. Changes return diffs and evidence.",
          {},
        ),
        instructions: s.string(
          "Natural-language instructions guiding which pages and facts to track and which changes to report.",
        ),
        max_pages: s.integer("Maximum number of pages to track."),
        max_depth: s.integer("Optional maximum link depth from the starting URL (0 = only the starting page)."),
        follow_subdomains: s.boolean("Allow page discovery on subdomains of the target site."),
      }),
    ]),
    change_detection: s.anyOf(
      "How changes are judged. Defaults to `semantic` for extract targets and page targets with `instructions`, otherwise `exact`.",
      [
        s.looseObject(
          "Detect exact changes. For page targets, this means visible text diffs. For sitemap targets, this means URL additions and removals.",
          {
            type: s.string("Use `exact` to compare visible text or sitemap URLs."),
          },
        ),
        s.looseObject("Detect meaningful content changes using the target’s instructions and optional schema.", {
          type: s.string("Use `semantic` to judge changes against the target instructions."),
          confidence_threshold: s.number("Minimum confidence required to report a meaningful change, from 0 to 1."),
        }),
      ],
    ),
    schedule: s.anyOf("How often the monitor runs. Defaults to once a day.", [
      s.looseObject(
        "Run the monitor on a fixed interval defined by a frequency and a unit, e.g. every 6 hours or every 2 days. The total interval (frequency × unit) must be between 10 minutes and 1 year.",
        {
          type: s.string("Use `interval` to run on a repeating schedule."),
          frequency: s.integer(
            "Number of units between runs. The resulting interval (frequency × unit) must be at least 10 minutes and at most 1 year (e.g. minimum 10 when unit is minutes; maximum 365 when unit is days).",
          ),
          unit: s.string("Time unit used with `frequency` to set the run interval."),
        },
      ),
    ]),
    webhook: s.anyOf("Webhook destination and delivery settings. Null means no webhook is configured.", [
      s.looseObject("webhook value.", {
        url: s.string("Public HTTP(S) URL that receives events. Slack and GovSlack URLs get formatted messages."),
        events: s.array(
          "Events to deliver. Defaults to `change.detected`; `run.completed` also includes unchanged runs.",
          s.string("events entry value."),
        ),
        retry: s.looseObject("Webhook retry settings. Use {} for the default schedule.", {}),
        secret: s.string("API-generated signing secret. Visible only with full access or `monitors:write` permission."),
      }),
      s.literal(null, {
        description: "webhook value.",
      }),
    ]),
    status: s.string(
      'Current state. Failed monitors keep running; paused monitors must be resumed with `status: "active"`.',
    ),
    last_run_at: s.nullable(s.string("last run at value.")),
    last_change_at: s.nullable(s.string("last change at value.")),
    next_run_at: s.nullable(s.string("When the next scheduled run is due; null while paused.")),
    last_error: s.anyOf("Error from the most recent failed run; null when the last run succeeded.", [
      s.looseObject("last error value.", {
        code: s.string("code value."),
        message: s.string("message value."),
      }),
      s.literal(null, {
        description: "last error value.",
      }),
    ]),
    webhook_failure: s.anyOf(
      "Present while webhook deliveries are failing consecutively; null when deliveries are healthy or no webhook is configured. Cleared on the next successful delivery and when the webhook URL changes.",
      [
        s.looseObject("webhook failure value.", {
          consecutive_failures: s.integer("Number of consecutive delivery attempts that did not succeed."),
          last_status: s.string(
            "Outcome of the most recent failed delivery. rejected means a non-2xx response; failed means no HTTP response was received; skipped_unsafe_url means the URL failed the public-endpoint safety check.",
          ),
          last_message: s.string("Human-readable description of the most recent failure."),
          last_failed_at: s.string("last failed at value."),
        }),
        s.literal(null, {
          description: "webhook failure value.",
        }),
      ],
    ),
    created_at: s.string("created at value."),
    updated_at: s.string("updated at value."),
    tags: s.array("Labels for filtering monitors, their changes, and their usage.", s.string("tags entry value.")),
    baseline: s.anyOf(
      "Comparison baseline, included on Retrieve. Null until capture completes or after target changes.",
      [
        s.looseObject("Current baseline of a `page` monitor: the visible page text as last observed.", {
          text: s.string("The page's visible text as last observed."),
          captured_at: s.string("When this baseline was last captured or replaced."),
        }),
        s.looseObject("Current baseline of a `sitemap` monitor: the normalized URL set as last observed.", {
          urls: s.array("The sitemap URLs as last observed (sorted, normalized).", s.string("urls entry value.")),
          url_count: s.integer("Number of URLs in the baseline."),
          captured_at: s.string("When this baseline was last captured or replaced."),
        }),
        s.looseObject(
          "Current baseline of an `extract` monitor: the pages it tracks and the structured data as last extracted.",
          {
            data: s.unknown(
              "Latest structured snapshot matching the extraction schema, refreshed at most daily; `null` before capture.",
            ),
            urls_analyzed: s.array(
              "The page URLs the monitor tracks and analyzes for changes.",
              s.string("urls analyzed entry value."),
            ),
            captured_at: s.string("When this baseline was last captured or replaced."),
          },
        ),
        s.literal(null, {
          description: "baseline value.",
        }),
      ],
    ),
    key_metadata: s.looseObject("Credits this request used and your remaining balance.", {
      credits_consumed: s.integer("Credits charged for this request."),
      credits_remaining: s.integer("Credits remaining for your organization."),
    }),
    request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
  },
);
export const submit_batchOutputSchema: JsonSchema = s.looseObject("Submit a batch response.", {
  id: s.string("Batch ID. Poll GET /batch/{batch_id} with it."),
  status: s.string("Always `queued`. An accepted batch has not started yet."),
  mode: s.string("How pages will be selected."),
  tags: s.array("Tags stored on the batch.", s.string("tags entry value.")),
  crawl: s.anyOf("How the crawl was configured. Null for scrape batches.", [
    s.looseObject("crawl value.", {
      source: s.anyOf("Where the crawl started.", [
        s.looseObject("The crawl discovered pages by following links from one URL.", {}),
        s.looseObject("The crawl scraped the pages listed in the domain's sitemap.", {}),
      ]),
      max_pages: s.integer(
        "The `maxUrls` submitted with the crawl. A sitemap crawl scrapes only the URLs its sitemap actually lists, up to this many, so `input.reserved` is often lower.",
      ),
      max_depth: s.nullable(
        s.integer(
          "Link depth limit. Always 0 for a sitemap crawl, which never follows links off its URLs; null when a `start_url` crawl set no limit.",
        ),
      ),
      follow_subdomains: s.boolean("Whether links to subdomains were followed. Always false for a sitemap crawl."),
      url_pattern: s.nullable(s.string("Regex pattern URLs had to match to be crawled. Null when the crawl set none.")),
      exclude_url_pattern: s.nullable(
        s.string("Regex pattern URLs must not match to be crawled. Null when the crawl set none."),
      ),
      languages: s.anyOf("Languages whose pages were followed; null when all languages were.", [
        s.string("languages value."),
        s.array("languages value.", s.string("languages entry value.")),
        s.literal(null, {
          description: "languages value.",
        }),
      ]),
    }),
    s.literal(null, {
      description: "crawl value.",
    }),
  ]),
  input: s.looseObject("What the submission accepted.", {
    reserved: s.integer("Pages accepted; progress counts toward this total."),
    reserved_is_ceiling: s.boolean("True when `reserved` is a crawl ceiling; false when it is an exact URL count."),
    submitted: s.nullable(
      s.integer(
        "URLs in the list you sent, before validation and de-duplication. Null for a crawl, which is given a source rather than a list.",
      ),
    ),
    duplicates: s.integer(
      "URLs dropped before reserving because another entry resolved to the same page. Non-zero for sitemap crawls too, whose sitemaps routinely list a page more than once.",
    ),
    invalid: s.nullable(s.integer("Rejected input URLs; `null` for a crawl.")),
  }),
  credits: s.looseObject("What accepting this batch cost.", {
    reserved: s.integer("Credits held at submission."),
  }),
  created_at: s.string("When the batch was created."),
  invalid_urls: s.array(
    "Rejected URLs (first 100).",
    s.looseObject("invalid urls entry value.", {
      url: s.string("Rejected URL."),
      reason: s.string("Why it was rejected."),
    }),
  ),
  cache_metadata: s.looseObject("Whether this response came from cache.", {
    status: s.string(
      "Whether the response was served from cache, required fresh work, or honored zero-data-retention cache bypass.",
    ),
    age_ms: s.integer("Age of the cached data in milliseconds. Zero for miss and zdr responses."),
  }),
  webhook_secret: s.string("Secret for verifying `X-Context-Signature`. Only submit returns it, so store it."),
  formats: s.looseObject("Outputs requested for each page. Matches input.data.formats on submission.", {
    html: s.boolean("Rendered HTML."),
    markdown: s.boolean("Page content as Markdown."),
    screenshot: s.boolean("A screenshot of the page."),
    images: s.boolean("Images found on the page."),
    bytes: s.boolean("The original HTTP response body."),
    parse: s.boolean("Fields extracted with custom rules or a prebuilt parser, returned as `parsed`."),
    highlights: s.boolean("Markdown excerpts relevant to `highlightsParams.query`."),
    json: s.boolean("An object matching `jsonParams.schema`, extracted from the page."),
    product: s.boolean("Product details such as name, price, and availability."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const list_batchesOutputSchema: JsonSchema = s.looseObject("List batches response.", {
  data: s.array(
    "Batches on this page.",
    s.looseObject("An asynchronous web scraping job.", {
      id: s.string("Batch ID."),
      status: s.string("Current state. `completed`, `cancelled`, and `failed` are final."),
      mode: s.string("`scrape` (URL list) or `crawl`."),
      tags: s.array("Tags stored on the batch at submission.", s.string("tags entry value.")),
      crawl: s.anyOf("How the crawl was configured. Null for scrape batches.", [
        s.looseObject("crawl value.", {}),
        s.literal(null, {
          description: "crawl value.",
        }),
      ]),
      input: s.looseObject("What the submission accepted.", {}),
      progress: s.looseObject("Pages attempted so far. Use `status` to check completion.", {
        succeeded: s.integer("Pages scraped successfully."),
        failed: s.integer("Pages that could not be scraped."),
        pending: s.integer("Accepted pages not yet attempted. Unused crawl capacity is excluded after completion."),
      }),
      credits: s.looseObject("Batch credit usage and settlement.", {
        reserved: s.integer("Credits held when the batch was accepted."),
        refunded: s.integer("Credits returned for unsuccessful pages when the batch settles."),
        ocr_charged: s.integer("OCR usage charged when the batch settles."),
        net: s.integer("`reserved` minus `refunded` plus `ocr_charged`."),
      }),
      timing: s.looseObject("timing value.", {
        created_at: s.string("When the batch was created."),
        started_at: s.nullable(s.string("When processing started. Null while queued.")),
        completed_at: s.nullable(s.string("When processing finished. Null while active.")),
      }),
      page_errors: s.array(
        "Individual page failures grouped by error code, sorted by count. Unrelated to `failure`, which is the batch itself failing.",
        s.looseObject("Page failures sharing one error code.", {}),
      ),
      failure: s.anyOf(
        "Why the batch as a whole stopped. Null unless `status` is `failed`. Individual pages that failed are counted in `page_errors` instead.",
        [
          s.looseObject("failure value.", {}),
          s.literal(null, {
            description: "failure value.",
          }),
        ],
      ),
      results: s.nullable(
        s.looseObject(
          "Result download links; null until the batch finishes. Files are deleted 180 days after the batch finishes.",
          {
            expires_at: s.string("When these links expire (24 hours after this response)."),
            files: s.array(
              "Result files. Order is not guaranteed.",
              s.looseObject("files entry value.", {
                url: s.string("Temporary URL for a gzipped NDJSON file."),
                items: s.integer("Results in this file."),
                bytes: s.integer("Compressed file size in bytes."),
              }),
            ),
          },
        ),
      ),
      formats: s.looseObject("Outputs requested for each page. Matches input.data.formats on submission.", {}),
    }),
  ),
  has_more: s.boolean("Whether another page is available."),
  next_cursor: s.nullable(s.string("Cursor for the next page.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_batchOutputSchema: JsonSchema = s.looseObject("Retrieve a batch response.", {
  id: s.string("Batch ID."),
  status: s.string("Current state. `completed`, `cancelled`, and `failed` are final."),
  mode: s.string("`scrape` (URL list) or `crawl`."),
  tags: s.array("Tags stored on the batch at submission.", s.string("tags entry value.")),
  crawl: s.anyOf("How the crawl was configured. Null for scrape batches.", [
    s.looseObject("crawl value.", {
      source: s.anyOf("Where the crawl started.", [
        s.looseObject("The crawl discovered pages by following links from one URL.", {}),
        s.looseObject("The crawl scraped the pages listed in the domain's sitemap.", {}),
      ]),
      max_pages: s.integer(
        "The `maxUrls` submitted with the crawl. A sitemap crawl scrapes only the URLs its sitemap actually lists, up to this many, so `input.reserved` is often lower.",
      ),
      max_depth: s.nullable(
        s.integer(
          "Link depth limit. Always 0 for a sitemap crawl, which never follows links off its URLs; null when a `start_url` crawl set no limit.",
        ),
      ),
      follow_subdomains: s.boolean("Whether links to subdomains were followed. Always false for a sitemap crawl."),
      url_pattern: s.nullable(s.string("Regex pattern URLs had to match to be crawled. Null when the crawl set none.")),
      exclude_url_pattern: s.nullable(
        s.string("Regex pattern URLs must not match to be crawled. Null when the crawl set none."),
      ),
      languages: s.anyOf("Languages whose pages were followed; null when all languages were.", [
        s.string("languages value."),
        s.array("languages value.", s.string("languages entry value.")),
        s.literal(null, {
          description: "languages value.",
        }),
      ]),
    }),
    s.literal(null, {
      description: "crawl value.",
    }),
  ]),
  input: s.looseObject("What the submission accepted.", {
    reserved: s.integer("Pages accepted; progress counts toward this total."),
    reserved_is_ceiling: s.boolean("True when `reserved` is a crawl ceiling; false when it is an exact URL count."),
    submitted: s.nullable(
      s.integer(
        "URLs in the list you sent, before validation and de-duplication. Null for a crawl, which is given a source rather than a list.",
      ),
    ),
    duplicates: s.integer(
      "URLs dropped before reserving because another entry resolved to the same page. Non-zero for sitemap crawls too, whose sitemaps routinely list a page more than once.",
    ),
    invalid: s.nullable(s.integer("Rejected input URLs; `null` for a crawl.")),
  }),
  progress: s.looseObject("Pages attempted so far. Use `status` to check completion.", {
    succeeded: s.integer("Pages scraped successfully."),
    failed: s.integer("Pages that could not be scraped."),
    pending: s.integer("Accepted pages not yet attempted. Unused crawl capacity is excluded after completion."),
  }),
  credits: s.looseObject("Batch credit usage and settlement.", {
    reserved: s.integer("Credits held when the batch was accepted."),
    refunded: s.integer("Credits returned for unsuccessful pages when the batch settles."),
    ocr_charged: s.integer("OCR usage charged when the batch settles."),
    net: s.integer("`reserved` minus `refunded` plus `ocr_charged`."),
  }),
  timing: s.looseObject("timing value.", {
    created_at: s.string("When the batch was created."),
    started_at: s.nullable(s.string("When processing started. Null while queued.")),
    completed_at: s.nullable(s.string("When processing finished. Null while active.")),
  }),
  page_errors: s.array(
    "Individual page failures grouped by error code, sorted by count. Unrelated to `failure`, which is the batch itself failing.",
    s.looseObject("Page failures sharing one error code.", {
      code: s.string("Error code for these failures."),
      count: s.integer("Pages that failed with this code."),
    }),
  ),
  failure: s.anyOf(
    "Why the batch as a whole stopped. Null unless `status` is `failed`. Individual pages that failed are counted in `page_errors` instead.",
    [
      s.looseObject("failure value.", {
        code: s.string("Why the batch itself stopped."),
        message: s.string("Human-readable explanation."),
      }),
      s.literal(null, {
        description: "failure value.",
      }),
    ],
  ),
  results: s.nullable(
    s.looseObject(
      "Result download links; null until the batch finishes. Files are deleted 180 days after the batch finishes.",
      {
        expires_at: s.string("When these links expire (24 hours after this response)."),
        files: s.array(
          "Result files. Order is not guaranteed.",
          s.looseObject("files entry value.", {
            url: s.string("Temporary URL for a gzipped NDJSON file."),
            items: s.integer("Results in this file."),
            bytes: s.integer("Compressed file size in bytes."),
          }),
        ),
      },
    ),
  ),
  formats: s.looseObject("Outputs requested for each page. Matches input.data.formats on submission.", {
    html: s.boolean("Rendered HTML."),
    markdown: s.boolean("Page content as Markdown."),
    screenshot: s.boolean("A screenshot of the page."),
    images: s.boolean("Images found on the page."),
    bytes: s.boolean("The original HTTP response body."),
    parse: s.boolean("Fields extracted with custom rules or a prebuilt parser, returned as `parsed`."),
    highlights: s.boolean("Markdown excerpts relevant to `highlightsParams.query`."),
    json: s.boolean("An object matching `jsonParams.schema`, extracted from the page."),
    product: s.boolean("Product details such as name, price, and availability."),
  }),
  invalid_urls: s.array(
    "Rejected URLs (first 100).",
    s.looseObject("invalid urls entry value.", {
      url: s.string("Rejected URL."),
      reason: s.string("Why it was rejected."),
    }),
  ),
  webhook_delivery_id: s.string("Batch completion delivery ID, when available."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const delete_batchOutputSchema: JsonSchema = s.looseObject("Delete a batch response.", {
  id: s.string("ID of the deleted batch."),
  deleted: s.boolean("Always true on success."),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const get_batch_resultsOutputSchema: JsonSchema = s.looseObject("List batch results response.", {
  data: s.array(
    "Result records on this page.",
    s.anyOf(
      "One scrape outcome. result uses the single Scrape Anything response schema; itemId and meta identify your input.",
      [
        s.looseObject(
          "At least one requested output succeeded. Check result.isPartial and each output success for incomplete results.",
          {
            url: s.string("URL as submitted, or as discovered by the crawl."),
            itemId: s.string("Your `itemId` from submission."),
            meta: s.looseObject("Caller-supplied metadata echoed from submission.", {}),
            status: s.string("status value."),
            result: {
              ...scrape_webOutputSchema,
              description:
                "The same response as POST /web/scrape, including per-format success, failure, and partial results.",
            },
            credits_used: s.integer(
              "Credits charged for this page, including OCR. Cached outputs use the same pricing as POST /web/scrape.",
            ),
            ocr_pages: s.integer("PDF pages recovered by OCR. Omitted when OCR did not run."),
          },
        ),
        s.looseObject("A page the batch could not fetch.", {
          url: s.string("URL as submitted, or as discovered by the crawl."),
          itemId: s.string("Your `itemId` from submission."),
          meta: s.looseObject("Caller-supplied metadata echoed from submission.", {}),
          status: s.string("The page could not be scraped."),
          error_code: s.string("Why the page failed."),
          message: s.string("Human-readable failure detail."),
          result: {
            ...scrape_webOutputSchema,
            description:
              "Per-format failures when scraping returned a structured response. Omitted for errors that prevent scraping.",
          },
          credits_used: s.integer(
            "Credits charged for this page, including OCR. Cached outputs use the same pricing as POST /web/scrape.",
          ),
          ocr_pages: s.integer("PDF pages recovered by OCR. Omitted when OCR did not run."),
        }),
      ],
    ),
  ),
  has_more: s.boolean("Whether another page is available."),
  next_cursor: s.nullable(s.string("Cursor for the next page.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const cancel_batchOutputSchema: JsonSchema = s.looseObject("Cancel a batch response.", {
  id: s.string("Batch ID."),
  status: s.string(
    "Always `cancelling`. Work already in flight finishes; the batch reaches `cancelled` shortly after.",
  ),
  mode: s.string("How pages were selected."),
  tags: s.array("Tags stored on the batch at submission.", s.string("tags entry value.")),
  crawl: s.anyOf("How the crawl was configured. Null for scrape batches.", [
    s.looseObject("crawl value.", {
      source: s.anyOf("Where the crawl started.", [
        s.looseObject("The crawl discovered pages by following links from one URL.", {}),
        s.looseObject("The crawl scraped the pages listed in the domain's sitemap.", {}),
      ]),
      max_pages: s.integer(
        "The `maxUrls` submitted with the crawl. A sitemap crawl scrapes only the URLs its sitemap actually lists, up to this many, so `input.reserved` is often lower.",
      ),
      max_depth: s.nullable(
        s.integer(
          "Link depth limit. Always 0 for a sitemap crawl, which never follows links off its URLs; null when a `start_url` crawl set no limit.",
        ),
      ),
      follow_subdomains: s.boolean("Whether links to subdomains were followed. Always false for a sitemap crawl."),
      url_pattern: s.nullable(s.string("Regex pattern URLs had to match to be crawled. Null when the crawl set none.")),
      exclude_url_pattern: s.nullable(
        s.string("Regex pattern URLs must not match to be crawled. Null when the crawl set none."),
      ),
      languages: s.anyOf("Languages whose pages were followed; null when all languages were.", [
        s.string("languages value."),
        s.array("languages value.", s.string("languages entry value.")),
        s.literal(null, {
          description: "languages value.",
        }),
      ]),
    }),
    s.literal(null, {
      description: "crawl value.",
    }),
  ]),
  input: s.looseObject("What the submission accepted.", {
    reserved: s.integer("Pages accepted; progress counts toward this total."),
    reserved_is_ceiling: s.boolean("True when `reserved` is a crawl ceiling; false when it is an exact URL count."),
    submitted: s.nullable(
      s.integer(
        "URLs in the list you sent, before validation and de-duplication. Null for a crawl, which is given a source rather than a list.",
      ),
    ),
    duplicates: s.integer(
      "URLs dropped before reserving because another entry resolved to the same page. Non-zero for sitemap crawls too, whose sitemaps routinely list a page more than once.",
    ),
    invalid: s.nullable(s.integer("Rejected input URLs; `null` for a crawl.")),
  }),
  progress: s.looseObject("How far the batch got before cancellation.", {
    succeeded: s.integer("Pages scraped successfully before the request landed."),
    failed: s.integer("Pages that could not be scraped before the request landed."),
    pending: s.integer("Pages that will be skipped."),
  }),
  credits: s.looseObject("What this batch cost so far.", {
    reserved: s.integer("Credits held at submission; unused credits are refunded when the batch settles."),
  }),
  timing: s.looseObject("Batch timestamps.", {
    created_at: s.string("When the batch was created."),
    started_at: s.nullable(s.string("When processing started. Null if it was cancelled while still queued.")),
  }),
  page_errors: s.array(
    "Page failures so far, grouped by error code and sorted by count.",
    s.looseObject("Page failures sharing one error code.", {
      code: s.string("Error code for these failures."),
      count: s.integer("Pages that failed with this code."),
    }),
  ),
  formats: s.looseObject("Outputs requested for each page. Matches input.data.formats on submission.", {
    html: s.boolean("Rendered HTML."),
    markdown: s.boolean("Page content as Markdown."),
    screenshot: s.boolean("A screenshot of the page."),
    images: s.boolean("Images found on the page."),
    bytes: s.boolean("The original HTTP response body."),
    parse: s.boolean("Fields extracted with custom rules or a prebuilt parser, returned as `parsed`."),
    highlights: s.boolean("Markdown excerpts relevant to `highlightsParams.query`."),
    json: s.boolean("An object matching `jsonParams.schema`, extracted from the page."),
    product: s.boolean("Product details such as name, price, and availability."),
  }),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
export const search_companiesOutputSchema: JsonSchema = s.looseObject("Search companies response.", {
  results: s.array(
    "Matching companies, most relevant first by default.",
    s.looseObject("results entry value.", {
      name: s.string("Company name."),
      domain: s.string("The company's website domain."),
      description: s.nullable(s.string("What the company does.")),
      industries: s.array("Industries the company operates in.", s.string("industries entry value.")),
      founded_year: s.nullable(s.integer("Year the company was founded.")),
      headquarters: s.looseObject("Where the company is headquartered.", {}),
      employees: s.looseObject("How many people the company employs.", {}),
      funding: s.looseObject("Known funding history.", {}),
    }),
  ),
  next_cursor: s.nullable(s.string("Pass as cursor to fetch the next page; null when there are no more results.")),
  key_metadata: keyMetadataSchema,
  request_id: s.string("Unique ID of this request, also in `X-Request-Id`. Include it when contacting support."),
});
