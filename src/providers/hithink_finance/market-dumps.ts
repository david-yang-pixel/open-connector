import type { TransitFileWriter } from "../../core/types.ts";

import { optionalRecord, requiredString } from "../../core/cast.ts";
import { storeResponseInTransit } from "../../core/request.ts";
import { ProviderRequestError, providerResponseError } from "../provider-runtime.ts";

interface MarketDumpContext {
  apiKey: string;
  fetcher: typeof fetch;
  transitFiles?: TransitFileWriter;
  signal?: AbortSignal;
}

type MarketDumpGet = (
  path: string,
  query: Record<string, string | number | undefined>,
  context: MarketDumpContext,
) => Promise<unknown>;

const mimeType = "application/vnd.apache.parquet";
const timeoutMs = 10 * 60 * 1_000;

export function createMarketDumpHandlers(
  get: MarketDumpGet,
): Record<string, (input: Record<string, unknown>, context: MarketDumpContext) => Promise<unknown>> {
  return {
    export_full_market_daily_history(_input, context) {
      return exportMarketDump(
        get,
        "/api/dump/market-dumps/daily-k/download-url",
        "tonghuashun-a-share-daily-k-10y.parquet",
        context,
      );
    },
    export_recent_market_daily_history(_input, context) {
      return exportMarketDump(
        get,
        "/api/dump/market-dumps/daily-k-10d/download-url",
        "tonghuashun-a-share-daily-k-10d.parquet",
        context,
      );
    },
    export_market_adjustment_factors(_input, context) {
      return exportMarketDump(
        get,
        "/api/dump/market-dumps/adjustment-factors/download-url",
        "tonghuashun-a-share-adjustment-factors.parquet",
        context,
      );
    },
  };
}

async function exportMarketDump(get: MarketDumpGet, path: string, name: string, context: MarketDumpContext) {
  if (!context.transitFiles) throw new ProviderRequestError(500, "market dump export requires local transit storage");
  const signed = optionalRecord(await get(path, {}, context));
  if (!signed) throw new ProviderRequestError(502, "market dump signing response must be an object");
  const sourceUrl = requiredString(signed.presigned_url, "presigned_url", providerResponseError);
  const sourceExpiresAt = requiredDateTime(signed.presigned_url_expires_at, "presigned_url_expires_at");
  const url = parseHttpsUrl(sourceUrl, "presigned_url");
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = context.signal ? AbortSignal.any([context.signal, timeout]) : timeout;
  const response = await context.fetcher(url, {
    headers: { accept: mimeType },
    signal,
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new ProviderRequestError(502, `market dump download failed with HTTP ${response.status}`);
  }
  if (!response.body) throw new ProviderRequestError(502, "market dump does not have a valid Parquet envelope");
  const stored = await storeResponseInTransit(
    new Response(response.body.pipeThrough(validateParquetEnvelopeStream()), { headers: response.headers }),
    context.transitFiles,
    {
      name,
      mimeType,
      fieldName: "market dump",
      createError: (message) => new ProviderRequestError(502, message),
      signal,
    },
  );
  return {
    file: {
      fileId: stored.fileId,
      downloadUrl: stored.downloadUrl,
      sizeBytes: stored.sizeBytes,
      name,
      mimeType,
    },
    sourceExpiresAt,
  };
}

/**
 * Validate the Parquet envelope while the body streams to transit storage: the
 * file starts and ends with `PAR1`, and the four bytes before the footer hold a
 * metadata length within the file. Only the first four and the last eight bytes
 * are ever buffered, so a market dump of any size costs a constant amount of
 * memory. A violation errors the stream, and the store discards the partial
 * file.
 */
function validateParquetEnvelopeStream(): TransformStream<Uint8Array, Uint8Array> {
  const magicLength = 4;
  let header = new Uint8Array(0);
  let tail = new Uint8Array(0);
  let total = 0;
  return new TransformStream({
    transform(chunk, controller) {
      if (header.byteLength < magicLength) {
        const length = Math.min(magicLength, header.byteLength + chunk.byteLength);
        const merged = new Uint8Array(length);
        merged.set(header);
        merged.set(chunk.subarray(0, length - header.byteLength), header.byteLength);
        header = merged;
      }
      total += chunk.byteLength;
      if (chunk.byteLength >= 8) {
        tail = new Uint8Array(chunk.subarray(chunk.byteLength - 8));
      } else {
        const merged = new Uint8Array(tail.byteLength + chunk.byteLength);
        merged.set(tail);
        merged.set(chunk, tail.byteLength);
        tail = new Uint8Array(merged.subarray(Math.max(0, merged.byteLength - 8)));
      }
      controller.enqueue(chunk);
    },
    flush(controller) {
      try {
        assertParquetEnvelope(header, tail, total);
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function assertParquetEnvelope(header: Uint8Array, tail: Uint8Array, total: number): void {
  const magic = [0x50, 0x41, 0x52, 0x31];
  const hasHeader = magic.every((byte, index) => header[index] === byte);
  const hasFooter = magic.every((byte, index) => tail[tail.byteLength - 4 + index] === byte);
  if (total < 13 || !hasHeader || !hasFooter) {
    throw new ProviderRequestError(502, "market dump does not have a valid Parquet envelope");
  }
  const footer = tail.subarray(tail.byteLength - 8, tail.byteLength - 4);
  const metadataLength = (footer[0]! | (footer[1]! << 8) | (footer[2]! << 16) | (footer[3]! << 24)) >>> 0;
  if (metadataLength === 0 || metadataLength > total - 12) {
    throw new ProviderRequestError(502, "market dump does not have valid Parquet metadata bounds");
  }
}

function requiredDateTime(value: unknown, field: string): string {
  const text = requiredString(value, field, providerResponseError);
  if (!Number.isFinite(Date.parse(text))) throw new ProviderRequestError(502, `${field} must be an ISO 8601 date-time`);
  return text;
}

function parseHttpsUrl(value: string, field: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ProviderRequestError(502, `${field} must be a valid URL`);
  }
  if (url.protocol !== "https:") throw new ProviderRequestError(502, `${field} must use HTTPS`);
  return url;
}
