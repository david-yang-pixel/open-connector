import type { SalesforceHandler } from "./context.ts";

import { recordOrEmpty, optionalString, requiredString } from "../../core/cast.ts";
import { providerInputError, providerResponseError, requiredResponseRecord } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
import { downloadSalesforceSource, requireSalesforceTransit, saveSalesforceDownload } from "./media.ts";

export const salesforceFileHandlers: Record<string, SalesforceHandler> = {
  async upload_file(d, c) {
    const filename = String(d.filename);
    if (
      ["\r", "\n", "\0", '"', "\\", "/"].some((char) => filename.includes(char)) ||
      filename === "." ||
      filename === ".."
    )
      throw providerInputError("filename must be a plain file name without header control characters");
    const metadata = recordOrEmpty(d.metadata);
    if (Object.keys(metadata).some((key) => ["versiondata", "id", "attributes"].includes(key.toLowerCase())))
      throw providerInputError("metadata cannot include VersionData, Id or attributes");
    const source = await downloadSalesforceSource(String(d.fileUrl), 2 * 1024 ** 3, c);
    const boundary = `salesforce-${Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    const encoder = new TextEncoder();
    const prefix = encoder.encode(
      `--${boundary}\r\nContent-Disposition: form-data; name="entity_content"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ Title: filename, PathOnClient: filename, ...metadata })}\r\n--${boundary}\r\nContent-Disposition: form-data; name="VersionData"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
    );
    const suffix = encoder.encode(`\r\n--${boundary}--\r\n`);
    const reader = source.body.getReader();
    let started = false;
    const body = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (!started) {
          started = true;
          controller.enqueue(prefix);
          return;
        }
        const chunk = await reader.read();
        if (chunk.done) {
          controller.enqueue(suffix);
          controller.close();
          reader.releaseLock();
        } else controller.enqueue(chunk.value);
      },
      async cancel(reason) {
        await reader.cancel(reason);
        reader.releaseLock();
      },
    });
    try {
      return await c.response(
        `${c.base}/sobjects/ContentVersion`,
        {
          method: "POST",
          headers: {
            "content-type": `multipart/form-data; boundary=${boundary}`,
            "content-length": String(prefix.byteLength + source.sizeBytes + suffix.byteLength),
          },
          body,
        },
        async (response) => requiredResponseRecord(await response.json(), "ContentVersion result"),
      );
    } finally {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
      await source.cleanup();
    }
  },
  async get_file(d, c) {
    return { record: await c.object(`${c.base}/sobjects/ContentDocument/${segment(d.fileId)}`) };
  },
  async download_file(d, c) {
    requireSalesforceTransit(c);
    const document = await c.object(
      queryPath(`${c.base}/sobjects/ContentDocument/${segment(d.fileId)}`, {
        fields: "Id,Title,LatestPublishedVersionId,FileExtension",
      }),
    );
    const versionId =
      d.versionId ?? requiredString(document.LatestPublishedVersionId, "latest file version ID", providerResponseError);
    if (d.versionId) {
      const version = await c.object(
        queryPath(`${c.base}/sobjects/ContentVersion/${segment(versionId)}`, { fields: "ContentDocumentId" }),
      );
      if (!sameSalesforceId(String(version.ContentDocumentId), String(d.fileId)))
        throw providerInputError("versionId does not belong to fileId");
    }
    const extension = optionalString(document.FileExtension);
    const name = `${optionalString(document.Title) ?? String(d.fileId)}${extension ? `.${extension}` : ""}`;
    return c.response(
      `${c.base}/sobjects/ContentVersion/${segment(versionId)}/VersionData`,
      { method: "GET", headers: { accept: "application/octet-stream" } },
      (response, signal) =>
        saveSalesforceDownload(
          c,
          response,
          name,
          response.headers.get("content-type") ?? "application/octet-stream",
          signal,
        ),
    );
  },
  async list_record_files(d, c) {
    return c.object(
      queryPath(`${c.base}/query`, {
        q: `SELECT Id, ContentDocumentId, LinkedEntityId, ShareType, Visibility, ContentDocument.Title, ContentDocument.LatestPublishedVersionId FROM ContentDocumentLink WHERE LinkedEntityId = '${d.recordId}'`,
      }),
    );
  },
  async list_file_shares(d, c) {
    return c.object(
      queryPath(`${c.base}/query`, {
        q: `SELECT Id, ContentDocumentId, LinkedEntityId, ShareType, Visibility FROM ContentDocumentLink WHERE ContentDocumentId = '${d.fileId}'`,
      }),
    );
  },
  async link_file(d, c) {
    return c.object(`${c.base}/sobjects/ContentDocumentLink`, "POST", {
      ContentDocumentId: d.fileId,
      LinkedEntityId: d.recordId,
      ShareType: d.shareType ?? "V",
      Visibility: d.visibility,
    });
  },
  async unlink_file(d, c) {
    await c.request(`${c.base}/sobjects/ContentDocumentLink/${segment(d.linkId)}`, "DELETE");
    return { success: true };
  },
  async delete_file(d, c) {
    await c.request(`${c.base}/sobjects/ContentDocument/${segment(d.fileId)}`, "DELETE");
    return { success: true };
  },
};
function sameSalesforceId(left: string, right: string): boolean {
  return left.length === 18 && right.length === 18
    ? left.toLowerCase() === right.toLowerCase()
    : left.slice(0, 15) === right.slice(0, 15);
}
