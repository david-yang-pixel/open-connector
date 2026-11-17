import type { SalesforceContext, SalesforceHandler } from "./context.ts";

import { recordOrEmpty, requiredString } from "../../core/cast.ts";
import { providerInputError, providerResponseError, ProviderRequestError } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
import { downloadSalesforceSource, requireSalesforceTransit, saveSalesforceDownload } from "./media.ts";
function jobResult(job: Record<string, unknown>, kind: string, version: string) {
  return {
    handle: { jobId: requiredString(job.id, "Bulk job ID", providerResponseError), kind, apiVersion: version },
    state: requiredString(job.state, "Bulk job state", providerResponseError),
    job,
  };
}
function jobPath(handle: Record<string, unknown>): string {
  return `/services/data/v${segment(handle.apiVersion)}/jobs/${segment(handle.kind)}/${segment(handle.jobId)}`;
}
async function readJob(d: Record<string, unknown>, c: SalesforceContext) {
  const handle = recordOrEmpty(d.handle);
  const job = await c.object(jobPath(handle));
  return { ...jobResult(job, String(handle.kind), String(handle.apiVersion)), path: jobPath(handle) };
}
export const salesforceBulkHandlers: Record<string, SalesforceHandler> = {
  async submit_bulk_query(d, c) {
    return jobResult(
      await c.object(`${c.base}/jobs/query`, "POST", {
        operation: d.includeDeleted ? "queryAll" : "query",
        query: d.soql,
        contentType: "CSV",
        columnDelimiter: d.columnDelimiter,
        lineEnding: d.lineEnding,
      }),
      "query",
      c.version,
    );
  },
  async get_bulk_query_result(d, c) {
    const { path, ...output } = await readJob(d, c);
    if (output.state !== "JobComplete" || d.download === false) return output;
    requireSalesforceTransit(c);
    const downloaded = await c.response(
      queryPath(`${path}/results`, { locator: d.locator, maxRecords: d.maxRecords }),
      { headers: { accept: "text/csv" } },
      async (response, signal) => {
        const locator = response.headers.get("Sforce-Locator");
        if (!locator) {
          await response.body?.cancel();
          throw providerResponseError(
            "Salesforce query results are missing Sforce-Locator; pagination completeness is unknown",
          );
        }
        const count = response.headers.get("Sforce-NumberOfRecords");
        const result = await saveSalesforceDownload(c, response, `${output.handle.jobId}.csv`, "text/csv", signal);
        return {
          result,
          nextLocator: locator === "null" ? null : locator,
          numberOfRecords: count !== null && Number.isFinite(Number(count)) ? Number(count) : undefined,
        };
      },
    );
    return { ...output, ...downloaded };
  },
  async submit_bulk_ingest(d, c) {
    if (d.operation === "upsert" && !d.externalIdField)
      throw providerInputError("Bulk upsert requires externalIdField");
    const source = await downloadSalesforceSource(String(d.csvUrl), 100_000_000, c);
    let created: Record<string, unknown> | undefined;
    try {
      created = await c.object(`${c.base}/jobs/ingest`, "POST", {
        object: d.objectName,
        operation: d.operation,
        contentType: "CSV",
        externalIdFieldName: d.externalIdField,
        assignmentRuleId: d.assignmentRuleId,
        columnDelimiter: d.columnDelimiter,
        lineEnding: d.lineEnding,
      });
      const id = requiredString(created.id, "Bulk job ID", providerResponseError);
      await c.response(
        `${c.base}/jobs/ingest/${segment(id)}/batches`,
        {
          method: "PUT",
          headers: { "content-type": "text/csv", "content-length": String(source.sizeBytes) },
          body: source.body,
        },
        async (response) => {
          await response.body?.cancel();
        },
      );
      return jobResult(
        await c.object(`${c.base}/jobs/ingest/${segment(id)}`, "PATCH", { state: "UploadComplete" }),
        "ingest",
        c.version,
      );
    } catch (error) {
      if (!created) throw error;
      throw new ProviderRequestError(
        error instanceof ProviderRequestError ? error.status : 502,
        `Salesforce ingest job ${String(created.id)} was created but submission failed. Inspect or cancel this ingest job with API ${c.version} before resubmitting. ${error instanceof Error ? error.message : "Unknown failure"}`,
        undefined,
        error instanceof ProviderRequestError ? error.code : "provider_error",
      );
    } finally {
      await source.cleanup();
    }
  },
  async get_bulk_ingest_result(d, c) {
    const { path, ...output } = await readJob(d, c);
    if (!["JobComplete", "Failed", "Aborted"].includes(output.state) || d.download === false) return output;
    requireSalesforceTransit(c);
    const type = String(d.resultType ?? (output.state === "JobComplete" ? "failedResults" : "unprocessedrecords"));
    const result = await c.response(`${path}/${type}`, { headers: { accept: "text/csv" } }, (response, signal) =>
      saveSalesforceDownload(c, response, `${output.handle.jobId}-${type}.csv`, "text/csv", signal),
    );
    return { ...output, result };
  },
  async cancel_bulk_job(d, c) {
    const handle = recordOrEmpty(d.handle);
    return jobResult(
      await c.object(jobPath(handle), "PATCH", { state: "Aborted" }),
      String(handle.kind),
      String(handle.apiVersion),
    );
  },
};
