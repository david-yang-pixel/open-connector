import type { SansanActionHandler, SansanContext } from "./request.ts";

import { optionalNumber, optionalString } from "../../core/cast.ts";
import { providerResponseError, requiredResponseRecord } from "../provider-runtime.ts";
import { downloadSansanSource, encodeSansanMultipart, requireSansanTransit, uploadSansanDownload } from "./files.ts";
import { sansanDepartmentColumns, sansanUserColumns } from "./organization-columns.ts";
import { requestSansan, requestSansanJson, sansanPathId } from "./request.ts";

export const sansanOrganizationHandlers: Record<string, SansanActionHandler> = {
  async export_organization_users(input, context) {
    return exportOrganization("users", input, context);
  },
  async export_organization_departments(input, context) {
    return exportOrganization("departments", input, context);
  },
  async check_organization_import(input, context) {
    const multipart = await buildOrganizationMultipart(input, context);
    return requestSansan(
      "/organization/check",
      { method: "POST", query: { delimiter: input.delimiter }, ...multipart },
      context,
      async (response) => {
        const csv = await response.text();
        if (!csv.trim()) return { valid: true, report: null };
        requireSansanTransit(context);
        const report = await uploadSansanDownload(
          new Response(csv, { headers: { "content-type": "text/csv" } }),
          "sansan-import-validation.csv",
          "text/csv",
          context,
        );
        return { valid: false, report };
      },
    );
  },
  async submit_organization_import(input, context) {
    const multipart = await buildOrganizationMultipart(input, context);
    const result = await requestSansanJson(
      "/organization/jobs",
      { method: "POST", query: { delimiter: input.delimiter }, ...multipart },
      context,
    );
    if (!optionalString(result.importId)) throw providerResponseError("Sansan import response is missing importId");
    return result;
  },
  async get_organization_import_status(input, context) {
    return getImportStatus(input, context);
  },
  async get_organization_import_result(input, context) {
    const result = await getImportStatus(input, context);
    let report = null;
    if (result.status === "completed" || result.status === "failed") {
      requireSansanTransit(context);
      const id = sansanPathId(input.importId, "importId");
      report = await requestSansan(`/organization/jobs/${id}/result`, {}, context, (response) =>
        uploadSansanDownload(response, "sansan-import-result.csv", "text/csv", context),
      );
    }
    return { ...result, importId: input.importId, report };
  },
};

async function exportOrganization(resource: string, input: Record<string, unknown>, context: SansanContext) {
  requireSansanTransit(context);
  return requestSansan(`/organization/${resource}`, { query: { delimiter: input.delimiter } }, context, (response) =>
    uploadSansanDownload(response, `sansan-${resource}.csv`, "text/csv", context),
  );
}

async function getImportStatus(input: Record<string, unknown>, context: SansanContext) {
  const id = sansanPathId(input.importId, "importId");
  const result = await requestSansanJson(`/organization/jobs/${id}`, {}, context);
  const code = optionalNumber(result.importStatus);
  const states: Record<number, string> = { 0: "queued", 1: "running", 2: "completed", 9: "failed" };
  const status = code === undefined ? undefined : states[code];
  if (!status) throw providerResponseError("Sansan returned an unknown importStatus");
  return { ...result, importStatus: code!, status };
}

async function buildOrganizationMultipart(input: Record<string, unknown>, context: SansanContext) {
  const form = new FormData();
  const separators: Record<string, string> = { comma: ",", semicolon: ";", tab: "\t", space: " " };
  const separator = separators[optionalString(input.delimiter) ?? "comma"]!;
  for (const [field, part, columns] of [
    ["users", "user", sansanUserColumns],
    ["departments", "department", sansanDepartmentColumns],
  ] as const) {
    const urlField = `${field}FileUrl`;
    if (input[urlField] !== undefined) {
      const bytes = await downloadSansanSource(String(input[urlField]), urlField, context);
      form.append(part, new Blob([bytes as BlobPart], { type: "text/csv" }), `${field}.csv`);
    } else if (Array.isArray(input[field])) {
      const rows = (input[field] as unknown[]).map((row) => requiredResponseRecord(row, "Sansan import row"));
      const csv =
        [
          columns.join(separator),
          ...rows.map((row) => columns.map((column) => csvCell(row[column], separator)).join(separator)),
        ].join("\r\n") + "\r\n";
      form.append(part, new Blob([csv], { type: "text/csv; charset=utf-8" }), `${field}.csv`);
    }
  }
  return encodeSansanMultipart(form);
}

function csvCell(value: unknown, separator: string) {
  const text = value === undefined || value === null ? "" : String(value);
  return [separator, '"', "\r", "\n"].some((character) => text.includes(character))
    ? `"${text.split('"').join('""')}"`
    : text;
}
