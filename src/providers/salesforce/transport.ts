import { optionalRecord, optionalString } from "../../core/cast.ts";
import { assertPublicHttpUrl } from "../../core/request.ts";
import {
  isAbortLikeError,
  providerInputError,
  providerResponseError,
  ProviderRequestError,
  providerUserAgent,
  runProviderRequest,
} from "../provider-runtime.ts";

// File transfers have a deliberate five-minute budget; JSON uses the shared default.
export const salesforceFileRequestTimeoutMs = 300_000;

export function salesforceOrigin(value: string, fieldName: string): string {
  const url = assertPublicHttpUrl(value, { fieldName, createError: providerInputError });
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".salesforce.com") ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw providerInputError(`${fieldName} must be a Salesforce HTTPS origin`);
  }
  return url.origin;
}

export async function withSalesforceResponse<T>(
  url: URL,
  init: RequestInit,
  fetcher: typeof fetch,
  consume: (response: Response, signal: AbortSignal) => Promise<T>,
  timeoutMs?: number,
  parentSignal?: AbortSignal,
): Promise<T> {
  return runProviderRequest({ label: "Salesforce", timeoutMs, signal: parentSignal }, async (signal) => {
    const headers = new Headers(init.headers);
    if (!headers.has("accept")) headers.set("accept", "application/json");
    headers.set("user-agent", providerUserAgent);
    const request: RequestInit & { duplex?: "half" } = {
      ...init,
      headers,
      signal,
      redirect: "manual",
      duplex: init.body instanceof ReadableStream ? "half" : undefined,
    };
    const response = await fetcher(url, request);
    if (!response.ok) throw await readSalesforceError(response);
    return consume(response, signal);
  });
}

export async function readSalesforceError(response: Response): Promise<ProviderRequestError> {
  const payload: unknown = await response.json().catch((error: unknown) => {
    if (isAbortLikeError(error)) throw error;
    return undefined;
  });
  const error = optionalRecord(Array.isArray(payload) ? payload[0] : payload);
  const code = optionalString(error?.errorCode) ?? optionalString(error?.error);
  const message = optionalString(error?.message) ?? optionalString(error?.error_description);
  // INVALID_SESSION_ID proves only the access token expired, not the refresh token.
  return new ProviderRequestError(
    response.status,
    ["Salesforce", code, message ?? `HTTP ${response.status}`].filter(Boolean).join(": "),
    { errorCode: code, errorDescription: message },
    "provider_error",
  );
}

export function salesforceRequest(
  url: URL,
  init: RequestInit,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<{ status: number; body: unknown }> {
  return withSalesforceResponse(
    url,
    init,
    fetcher,
    async (response) => {
      const text = response.status === 204 ? "" : await response.text();
      let body: unknown;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          throw providerResponseError("Salesforce returned invalid JSON");
        }
      }
      return { status: response.status, body };
    },
    undefined,
    signal,
  );
}
