import type { SalesforceHandler } from "./context.ts";

import { providerInputError } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
export const salesforcePlatformHandlers: Record<string, SalesforceHandler> = {
  async get_record_create_defaults(d, c) {
    return c.object(
      queryPath(`${c.base}/ui-api/record-defaults/create/${segment(d.objectName)}`, {
        recordTypeId: d.recordTypeId,
        formFactor: d.formFactor,
        optionalFields: d.optionalFields,
      }),
    );
  },
  async get_record_layout(d, c) {
    return {
      layout: await c.object(
        queryPath(`${c.base}/ui-api/layout/${segment(d.objectName)}`, {
          recordTypeId: d.recordTypeId,
          formFactor: d.formFactor,
          layoutType: d.layoutType,
          mode: d.mode,
        }),
      ),
    };
  },
  async get_lookup_suggestions(d, c) {
    const q = String(d.q ?? "");
    if (
      (d.searchType === "Search" && q.length < 2) ||
      (d.searchType === "TypeAhead" && (q.length < 3 || q.includes("?")))
    )
      throw providerInputError("Lookup search text does not meet the selected searchType requirements");
    if (Number(c.version) < 60 || (d.orderBy !== undefined && Number(c.version) < 63))
      throw providerInputError("Lookup POST requires API 60.0; orderBy requires API 63.0");
    return {
      result: await c.object(
        queryPath(`${c.base}/ui-api/lookups/${segment(d.objectName)}/${segment(d.fieldName)}`, {
          searchType: d.searchType,
          q: d.q,
          page: d.page,
          pageSize: d.pageSize,
          targetApiName: d.targetApiName,
        }),
        "POST",
        { sourceRecord: { fields: d.sourceFields }, orderBy: d.orderBy },
      ),
    };
  },
  async create_report(d, c) {
    return c.object(`${c.base}/analytics/reports`, "POST", { reportMetadata: d.reportMetadata });
  },
  async clone_report(d, c) {
    return c.object(queryPath(`${c.base}/analytics/reports`, { cloneId: d.reportId }), "POST", {
      reportMetadata: d.reportMetadata ?? {},
    });
  },
  async save_report(d, c) {
    return c.object(`${c.base}/analytics/reports/${segment(d.reportId)}`, "PATCH", {
      reportMetadata: d.reportMetadata,
    });
  },
  async tooling_query(d, c) {
    return c.object(queryPath(`${c.base}/tooling/query`, { q: d.soql }));
  },
  async tooling_query_more(d, c) {
    return c.object(String(d.nextRecordsUrl));
  },
  async get_tooling_record(d, c) {
    return {
      record: await c.object(
        queryPath(`${c.base}/tooling/sobjects/${segment(d.objectName)}/${segment(d.recordId)}`, {
          fields: d.fields,
        }),
      ),
    };
  },
  async get_apex_log(d, c) {
    return c.response(
      `${c.base}/tooling/sobjects/ApexLog/${segment(d.logId)}/Body`,
      { headers: { accept: "text/plain" } },
      async (response) => ({ body: await response.text() }),
    );
  },
};
