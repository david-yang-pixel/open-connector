import type { TransitFileUpload, TransitFileWriter } from "../../core/types.ts";
import type { SalesforceContext } from "./context.ts";

import { assertPublicHttpUrl, storeResponseInTransit } from "../../core/request.ts";
import {
  providerFetch,
  providerInputError,
  providerResponseError,
  ProviderRequestError,
  runProviderRequest,
} from "../provider-runtime.ts";
import { salesforceFileRequestTimeoutMs } from "./transport.ts";

export function requireSalesforceTransit(context: SalesforceContext): TransitFileWriter {
  const store = context.transitFiles;
  if (!store?.createFromStream)
    throw providerInputError("Salesforce file transfers require a streaming transit file backend (filesystem).");
  return store;
}

export async function downloadSalesforceSource(
  fileUrl: string,
  maximumBytes: number,
  context: SalesforceContext,
): Promise<{ body: ReadableStream<Uint8Array>; sizeBytes: number; cleanup(): Promise<void> }> {
  const store = requireSalesforceTransit(context);
  if (!store.response) throw providerInputError("Salesforce uploads require a transit backend with streaming reads.");
  const url = assertPublicHttpUrl(fileUrl, { fieldName: "fileUrl", createError: providerInputError });
  if (url.protocol !== "https:") throw providerInputError("fileUrl must use HTTPS");
  return runProviderRequest(
    { label: "Salesforce file source", timeoutMs: salesforceFileRequestTimeoutMs, signal: context.signal },
    async (signal) => {
      const response = await providerFetch(url, { signal });
      if (!response.ok || !response.body) {
        await response.body?.cancel();
        throw new ProviderRequestError(
          response.status,
          `File source returned HTTP ${response.status}`,
          undefined,
          "provider_error",
        );
      }
      const file = await storeResponseInTransit(response, store, {
        name: "source",
        mimeType: "application/octet-stream",
        fieldName: "Salesforce file source",
        createError: (message) => new ProviderRequestError(413, message),
        maxBytes: maximumBytes,
        signal,
      });
      let body: ReadableStream<Uint8Array> | null = null;
      try {
        if (!file.sizeBytes) throw providerInputError("The file source is empty");
        const source = await store.response!(file.fileId);
        body = source.body;
        if (!source.ok || !body) throw providerResponseError("Salesforce transit source could not be read");
        const sourceBody = body;
        return {
          body: sourceBody,
          sizeBytes: file.sizeBytes,
          async cleanup() {
            await sourceBody.cancel().catch(() => undefined);
            await store.delete(file.fileId);
          },
        };
      } catch (error) {
        await body?.cancel().catch(() => undefined);
        await store.delete(file.fileId);
        throw error;
      }
    },
  );
}

export async function saveSalesforceDownload(
  context: SalesforceContext,
  response: Response,
  name: string,
  mimeType: string,
  signal: AbortSignal,
): Promise<TransitFileUpload> {
  const store = requireSalesforceTransit(context);
  return storeResponseInTransit(response, store, {
    name,
    mimeType,
    signal,
    maxBytes: 2 * 1024 ** 3,
    fieldName: "Salesforce file",
    createError: (message) => new ProviderRequestError(413, message),
  });
}
