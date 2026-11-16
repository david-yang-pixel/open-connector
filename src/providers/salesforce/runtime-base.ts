import type { SalesforceHandler } from "./context.ts";

import { requiredResponseRecord } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
import { salesforceRequest } from "./transport.ts";
export const salesforceBaseHandlers: Record<string, SalesforceHandler> = {
  async list_objects(_d, c) {
    return c.object(`${c.base}/sobjects/`);
  },
  async describe_object(d, c) {
    return c.object(`${c.base}/sobjects/${segment(d.objectName)}/describe`);
  },
  async query(d, c) {
    const headers = new Headers({ authorization: `Bearer ${c.accessToken}` });
    if (d.batchSize !== undefined) headers.set("Sforce-Query-Options", `batchSize=${d.batchSize}`);
    return requiredResponseRecord(
      (
        await salesforceRequest(
          new URL(queryPath(`${c.base}/${d.includeDeleted ? "queryAll" : "query"}`, { q: d.soql }), c.origin),
          { headers },
          c.fetcher,
          c.signal,
        )
      ).body,
      "Salesforce query",
    );
  },
  async query_more(d, c) {
    const headers = new Headers({ authorization: `Bearer ${c.accessToken}` });
    if (d.batchSize !== undefined) headers.set("Sforce-Query-Options", `batchSize=${d.batchSize}`);
    return requiredResponseRecord(
      (await salesforceRequest(new URL(String(d.nextRecordsUrl), c.origin), { headers }, c.fetcher, c.signal)).body,
      "Salesforce query",
    );
  },
  async get_record(d, c) {
    return {
      record: await c.object(
        queryPath(`${c.base}/sobjects/${segment(d.objectName)}/${segment(d.recordId)}`, { fields: d.fields }),
      ),
    };
  },
  async create_record(d, c) {
    return c.object(`${c.base}/sobjects/${segment(d.objectName)}`, "POST", d.fields, writeHeaders(d));
  },
  async update_record(d, c) {
    const result = await c.request(
      `${c.base}/sobjects/${segment(d.objectName)}/${segment(d.recordId)}`,
      "PATCH",
      d.fields,
      writeHeaders(d),
    );
    return result === undefined
      ? { success: true, id: d.recordId }
      : requiredResponseRecord(result, "Salesforce response");
  },
  async delete_record(d, c) {
    const result = await c.request(`${c.base}/sobjects/${segment(d.objectName)}/${segment(d.recordId)}`, "DELETE");
    return result === undefined
      ? { success: true, id: d.recordId }
      : requiredResponseRecord(result, "Salesforce response");
  },
  async upsert_record(d, c) {
    const result = await c.request(
      queryPath(`${c.base}/sobjects/${segment(d.objectName)}/${segment(d.externalIdField)}/${segment(d.externalId)}`, {
        updateOnly: d.updateOnly,
      }),
      "PATCH",
      d.fields,
      writeHeaders(d),
    );
    return result === undefined
      ? { success: true, created: false }
      : requiredResponseRecord(result, "Salesforce response");
  },
};
function writeHeaders(input: Record<string, unknown>): Headers {
  const headers = new Headers();
  if (input.assignmentRule !== undefined) headers.set("Sforce-Auto-Assign", String(input.assignmentRule));
  if (input.duplicateRule !== undefined) {
    const options = Object.entries(input.duplicateRule as Record<string, boolean>);
    if (options.length)
      headers.set("Sforce-Duplicate-Rule-Header", options.map(([name, value]) => `${name}=${value}`).join("; "));
  }
  return headers;
}
