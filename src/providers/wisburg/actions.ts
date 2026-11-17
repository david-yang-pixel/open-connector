import type { ActionDefinition } from "../../core/types.ts";
import type { WisburgDetailKey } from "./runtime.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "wisburg";

const reportSchema = s.requiredObject("A Wisburg research report list item.", {
  id: s.integer("The report ID."),
  title: s.string("The report title."),
  datetime: s.string("The publication time in ISO 8601 format."),
});

const reportDetailSchema = s.requiredObject("A Wisburg research report detail.", {
  id: s.integer("The report ID."),
  title: s.string("The report title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  url: s.optional(s.string("The original report download URL. Not returned for every report.")),
  summary: s.optional(s.string("The report summary in Markdown.")),
  meta: s.optional(
    s.looseObject("Report metadata.", {
      name: s.optional(s.string("The metadata name.")),
      description: s.optional(s.string("The metadata description.")),
    }),
  ),
});

// Earnings call minutes are the only report family whose detail omits `meta`.
const earningsCallDetailSchema = s.requiredObject("A Wisburg earnings call minutes detail.", {
  id: s.integer("The earnings call minutes ID."),
  title: s.string("The title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  url: s.optional(s.string("The original download URL. Not returned for every document.")),
  summary: s.optional(s.string("The summary in Markdown.")),
});

const articleSchema = s.requiredObject("A Wisburg column article list item.", {
  id: s.integer("The article ID."),
  title: s.string("The article title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  description: s.optional(s.string("The article introduction.")),
});

const articleDetailSchema = s.requiredObject("A Wisburg column article detail.", {
  id: s.integer("The article ID."),
  title: s.string("The article title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  description: s.optional(s.string("The article introduction.")),
  body: s.string("The article body in HTML."),
});

const feedItemSchema = s.requiredObject("A Wisburg news feed item.", {
  id: s.integer("The feed item ID."),
  title: s.string("The feed item title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  content: s.string("The feed item body in Markdown."),
});

const imageItemSchema = s.requiredObject("A Wisburg image feed item.", {
  title: s.string("The image title."),
  datetime: s.string("The publication time in ISO 8601 format."),
  description: s.string("The image description."),
  cover_url: s.string("The cover image URL."),
});

const mikkoLogSchema = s.requiredObject("A Wisburg Mikko log entry. Logs have no title.", {
  id: s.integer("The log ID."),
  datetime: s.string("The publication time in ISO 8601 format."),
  content: s.string("The log body in Markdown."),
  images: s.array("Attached image URLs; empty when the log has no images.", s.string("One image URL.")),
});

const pageInfoSchema = s.object("Cursor pagination details for the current page.", {
  endCursor: s.optional(s.string("The cursor for the next page; absent when there is no next page.")),
});

const requestIdSchema = s.string("The Wisburg request ID used for troubleshooting.");

const listInputSchema = s.object(
  "Pagination, keyword, and time-range filters supported by Wisburg list endpoints.",
  {
    first: s.integer("The number of items per page, up to 100. Defaults to 20.", { minimum: 1, maximum: 100 }),
    after: s.string("The pagination cursor from `pageInfo.endCursor` of the previous page."),
    query: s.string(
      "The search keyword. Without a keyword items are sorted by publication time descending; with one by relevance.",
    ),
    startTime: s.string("The start of the time range as a Unix timestamp or an ISO 8601 string."),
    endTime: s.string("The end of the time range as a Unix timestamp or an ISO 8601 string."),
  },
  { optional: ["first", "after", "query", "startTime", "endTime"] },
);

function listOutputSchema(description: string, itemsDescription: string, itemSchema: ReturnType<typeof s.object>) {
  return s.requiredObject(description, {
    requestId: requestIdSchema,
    items: s.array(itemsDescription, itemSchema),
    pageInfo: pageInfoSchema,
  });
}

function detailInputSchema(idDescription: string) {
  return s.requiredObject("Input for reading one item by ID.", {
    id: s.integer(idDescription),
  });
}

function detailOutputSchema(description: string, key: WisburgDetailKey, itemSchema: ReturnType<typeof s.object>) {
  return s.requiredObject(description, {
    requestId: requestIdSchema,
    [key]: itemSchema,
  });
}

const reportListOutput = listOutputSchema(
  "A page of Wisburg research reports.",
  "Research reports on this page.",
  reportSchema,
);
const reportDetailOutput = detailOutputSchema("A Wisburg research report detail.", "report", reportDetailSchema);
const earningsCallDetailOutput = detailOutputSchema(
  "A Wisburg earnings call minutes detail.",
  "report",
  earningsCallDetailSchema,
);

export const wisburgActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "list_reports",
    operationType: "read",
    description: "List Wisburg research notes (研报笔记) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "get_report",
    operationType: "read",
    description: "Get one Wisburg research note (研报笔记) by report ID, including the Markdown summary.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The report ID."),
    outputSchema: reportDetailOutput,
  }),
  defineProviderAction(service, {
    name: "list_archives",
    operationType: "read",
    description:
      "List Wisburg literature research reports (文献) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "get_archive",
    operationType: "read",
    description:
      "Get one Wisburg literature research report (文献) by report ID, including the download URL and Markdown summary.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The report ID."),
    outputSchema: reportDetailOutput,
  }),
  defineProviderAction(service, {
    name: "list_company_reports",
    operationType: "read",
    description:
      "List Wisburg single-company research reports (企业研究) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "get_company_report",
    operationType: "read",
    description:
      "Get one Wisburg single-company research report (企业研究) by report ID, including the download URL and Markdown summary.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The report ID."),
    outputSchema: reportDetailOutput,
  }),
  defineProviderAction(service, {
    name: "list_earnings_calls",
    operationType: "read",
    description:
      "List Wisburg earnings call minutes (电话会纪要) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "get_earnings_call",
    operationType: "read",
    description:
      "Get one Wisburg earnings call minutes document (电话会纪要) by ID, including the download URL and Markdown summary.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The earnings call minutes ID."),
    outputSchema: earningsCallDetailOutput,
  }),
  defineProviderAction(service, {
    name: "list_articles",
    operationType: "read",
    description:
      "List Wisburg column articles (文章) with cursor pagination, keyword search, and time filters. Mikko logs are not included; use list_mikko_logs for those.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: listOutputSchema(
      "A page of Wisburg column articles.",
      "Column articles on this page.",
      articleSchema,
    ),
  }),
  defineProviderAction(service, {
    name: "get_article",
    operationType: "read",
    description: "Get one Wisburg column article (文章) by article ID, including the HTML body.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The article ID."),
    outputSchema: detailOutputSchema("A Wisburg column article detail.", "article", articleDetailSchema),
  }),
  defineProviderAction(service, {
    name: "list_market_daily",
    operationType: "read",
    description:
      "List the Wisburg AI market daily (AI 市场日报) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "list_feed",
    operationType: "read",
    description:
      "List the Wisburg news feed (资讯流) with cursor pagination, keyword search, and time filters. Feed items carry the full Markdown body in `content`.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: listOutputSchema(
      "A page of Wisburg news feed items.",
      "News feed items on this page.",
      feedItemSchema,
    ),
  }),
  defineProviderAction(service, {
    name: "list_images",
    operationType: "read",
    description: "List the Wisburg image feed (图片流) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: listOutputSchema(
      "A page of Wisburg image feed items.",
      "Image feed items on this page.",
      imageItemSchema,
    ),
  }),
  defineProviderAction(service, {
    name: "list_am_reports",
    operationType: "read",
    description:
      "List Wisburg asset-management research reports (资管报告) with cursor pagination, keyword search, and time filters.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: reportListOutput,
  }),
  defineProviderAction(service, {
    name: "get_am_report",
    operationType: "read",
    description:
      "Get one Wisburg asset-management research report (资管报告) by report ID, including the download URL and Markdown summary.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The report ID."),
    outputSchema: reportDetailOutput,
  }),
  defineProviderAction(service, {
    name: "list_mikko_logs",
    operationType: "read",
    description:
      "List Wisburg Mikko log entries (Mikko 日志), newest first. Each entry is a short Markdown note; the list already returns the full content.",
    requiredScopes: [],
    inputSchema: listInputSchema,
    outputSchema: listOutputSchema(
      "A page of Wisburg Mikko log entries.",
      "Mikko log entries on this page.",
      mikkoLogSchema,
    ),
  }),
  defineProviderAction(service, {
    name: "get_mikko_log",
    operationType: "read",
    description: "Get one Wisburg Mikko log entry (Mikko 日志) by log ID. Returns the same fields as the list.",
    requiredScopes: [],
    inputSchema: detailInputSchema("The log ID."),
    outputSchema: detailOutputSchema("A Wisburg Mikko log entry.", "log", mikkoLogSchema),
  }),
];
