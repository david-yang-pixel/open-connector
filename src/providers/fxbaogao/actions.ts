import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const reportId = s.integer("Report ID returned by search_reports.");
const raw = s.looseObject("Original upstream response, including additional fields.", {});
const paragraph = s.looseObject("A matching report paragraph.", {
  content: s.string("Paragraph text, possibly containing highlight markup."),
  pageNum: s.integer("Page number within the report."),
});
export const fxbaogaoActions: ActionDefinition[] = [
  defineProviderAction("fxbaogao", {
    name: "search_reports",
    description:
      "Search research reports by keywords, institutions, and publication time. Provide keywords or at least one institution; pages range from 1 to 10.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Report search filters.",
        {
          keywords: s.nonEmptyString("Search keywords; required unless orgNames contains an institution."),
          orgNames: s.array(
            "Institution names; required unless keywords is provided.",
            s.nonEmptyString("Institution name."),
          ),
          startTime: s.string(
            "Start time as a millisecond timestamp string or last3day, last7day, last1mon, last3mon, last1year.",
          ),
          endTime: s.string("End time as a millisecond timestamp string."),
          pageNum: s.integer("Result page from 1 to 10; defaults to 1.", { minimum: 1, maximum: 10 }),
        },
        { required: [] },
      ),
      anyOf: [{ required: ["keywords"] }, { required: ["orgNames"], properties: { orgNames: { minItems: 1 } } }],
    },
    outputSchema: s.requiredObject("Search results with the original response retained.", {
      reports: s.array(
        "Matching research reports.",
        s.looseObject("Report metadata with upstream extension fields preserved.", {
          reportId,
          title: s.string("Report title, possibly containing highlight markup."),
          orgName: s.string("Publishing institution, possibly containing highlight markup."),
          pubTime: s.unknown("Publication timestamp as returned by the provider."),
          pubTimeStr: s.string("Formatted publication date."),
          industryName: s.string("Industry name."),
          pageNum: s.integer("Number of pages in the report."),
          paragraphs: s.array("Matching text excerpts.", paragraph),
          reportUrl: s.string("Official report reading URL."),
        }),
      ),
      raw,
    }),
  }),
  defineProviderAction("fxbaogao", {
    name: "get_paragraphs",
    description:
      "Read a report's summary and matching paragraphs. Use the PDF for full reading and original-source citations.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Report and optional context keyword.",
      {
        reportId,
        keyword: s.string("Keyword used to locate relevant context within the report."),
      },
      { optional: ["keyword"] },
    ),
    outputSchema: s.object(
      "Original report paragraph response.",
      {
        code: s.integer("Upstream result code; zero indicates success."),
        msg: s.string("Upstream message."),
        data: s.looseObject("Report summary and matching passages.", {
          title: s.string("Report title."),
          summary: s.string("Report summary."),
          paragraphs: s.array("Matching report paragraphs.", paragraph),
        }),
      },
      { required: ["code", "data"], additionalProperties: true },
    ),
  }),
  defineProviderAction("fxbaogao", {
    name: "get_pdf_url",
    description:
      "Get downloadable PDF URLs for a report without transferring binary content through the action response.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requiredObject("Report to download.", { reportId }),
    outputSchema: s.requiredObject("PDF resources and original upstream response.", {
      reportId,
      resources: s.array(
        "Available PDF resources; empty when upstream returns no download URL.",
        s.requiredObject("A PDF resource.", {
          field: s.string("Upstream field containing this resource."),
          url: s.string("Absolute PDF download URL; it may expire."),
        }),
      ),
      raw,
    }),
  }),
];
