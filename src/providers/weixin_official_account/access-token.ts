import type { ProviderFetch } from "../provider-runtime.ts";

import { createHash } from "node:crypto";
import { optionalInteger, optionalNumber, optionalRecord, optionalString } from "../../core/cast.ts";
import {
  ProviderRequestError,
  providerResponseError,
  providerUserAgent,
  requiredInputString,
  runProviderRequest,
} from "../provider-runtime.ts";

const wechatStableTokenUrl = "https://api.weixin.qq.com/cgi-bin/stable_token";
const defaultAccessTokenTtlSeconds = 7200;
const accessTokenRefreshSkewMs = 120_000;
const ipWhitelistHint =
  "Add this runtime's public egress IP to the official account's API IP whitelist in the 微信开发者平台 console (公众号 → 基础信息 → 开发密钥 → API IP白名单) and try again.";

export interface WechatOfficialAccountCredential {
  appId: string;
  appSecret: string;
}

interface WechatAccessTokenRequest {
  credential: WechatOfficialAccountCredential;
  fetcher: ProviderFetch;
  signal?: AbortSignal;
  /** Mint a fresh token instead of serving the cached one, used after a token-invalid API error. */
  forceRefresh?: boolean;
}

/** A WeChat API response reduced to its HTTP status, parsed JSON envelope, and raw text. */
export interface WechatApiResult {
  status: number;
  record: Record<string, unknown> | undefined;
  rawText: string;
}

interface WechatAccessTokenCacheEntry {
  token: string;
  expiresAtMs: number;
}

const accessTokenCache = new Map<string, WechatAccessTokenCacheEntry>();
const accessTokenInFlight = new Map<string, Promise<string>>();
const accessTokenRefreshInFlight = new Map<string, Promise<string>>();

function accessTokenCacheKey(credential: WechatOfficialAccountCredential): string {
  return createHash("sha256").update(credential.appId).update("\0").update(credential.appSecret).digest("hex");
}

export function readWechatOfficialAccountCredential(values: Record<string, string>): WechatOfficialAccountCredential {
  return {
    appId: requiredInputString(values.appId, "appId"),
    appSecret: requiredInputString(values.appSecret, "appSecret"),
  };
}

/**
 * Return a stable access token for the credential, served from the module-level
 * cache until 120 seconds before its WeChat expiry and minted through the
 * stable_token endpoint otherwise. Concurrent callers share one in-flight mint
 * per credential: forced refreshes are limited to 20 per day by WeChat and each
 * one invalidates the previous token, so duplicate mints must not happen.
 */
export async function getWechatAccessToken(input: WechatAccessTokenRequest): Promise<string> {
  const cacheKey = accessTokenCacheKey(input.credential);
  const refreshPending = accessTokenRefreshInFlight.get(cacheKey);
  if (refreshPending) return refreshPending;

  const pending = accessTokenInFlight.get(cacheKey);
  if (!input.forceRefresh) {
    if (pending) return pending;
    const request = mintAndCacheAccessToken(input, cacheKey);
    accessTokenInFlight.set(cacheKey, request);
    try {
      return await request;
    } finally {
      if (accessTokenInFlight.get(cacheKey) === request) accessTokenInFlight.delete(cacheKey);
    }
  }

  const refresh = (async () => {
    if (pending) await pending.catch(() => undefined);
    return mintAndCacheAccessToken(input, cacheKey);
  })();
  accessTokenRefreshInFlight.set(cacheKey, refresh);
  try {
    return await refresh;
  } finally {
    if (accessTokenRefreshInFlight.get(cacheKey) === refresh) {
      accessTokenRefreshInFlight.delete(cacheKey);
    }
  }
}

async function mintAndCacheAccessToken(input: WechatAccessTokenRequest, cacheKey: string): Promise<string> {
  if (input.forceRefresh) {
    accessTokenCache.delete(cacheKey);
  } else {
    const cached = accessTokenCache.get(cacheKey);
    if (cached && cached.expiresAtMs > Date.now()) {
      return cached.token;
    }
  }

  const result = await runProviderRequest(
    { signal: input.signal, label: "WeChat stable_token" },
    async (signal): Promise<WechatApiResult> => {
      const response = await input.fetcher(wechatStableTokenUrl, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": providerUserAgent },
        body: JSON.stringify({
          grant_type: "client_credential",
          appid: input.credential.appId,
          secret: input.credential.appSecret,
          force_refresh: input.forceRefresh === true,
        }),
        signal,
      });
      const rawText = await response.text();
      return { status: response.status, record: parseWechatJson(rawText), rawText };
    },
  );
  const errcode = readWechatErrcode(result.record);
  if (errcode !== null && errcode !== 0) {
    throw normalizeWechatApiError(result);
  }

  const token = optionalString(result.record?.access_token);
  if (!token) {
    throw providerResponseError("WeChat stable_token response is missing access_token");
  }
  const expiresInSeconds = optionalNumber(result.record?.expires_in) ?? defaultAccessTokenTtlSeconds;
  const nowMs = Date.now();
  accessTokenCache.set(cacheKey, {
    token,
    expiresAtMs: Math.max(nowMs, nowMs + expiresInSeconds * 1000 - accessTokenRefreshSkewMs),
  });
  return token;
}

/** Parse a WeChat JSON response body; non-object payloads read as undefined. */
export function parseWechatJson(rawText: string): Record<string, unknown> | undefined {
  try {
    return optionalRecord(JSON.parse(rawText));
  } catch {
    return undefined;
  }
}

/** Read the numeric errcode of a WeChat envelope; absent or non-numeric reads as null. */
export function readWechatErrcode(record: Record<string, unknown> | undefined): number | null {
  return optionalInteger(record?.errcode) ?? null;
}

/** Whether the errcode marks the access token as invalid, so the caller can refresh and retry once. */
export function isWechatTokenError(errcode: number | null): boolean {
  return errcode === 40001 || errcode === 40014 || errcode === 42001;
}

/**
 * Map a failed WeChat API call to the shared provider error. Rate limits
 * (45009/45011) become 429, the missing-permission 48001 becomes 403, the
 * 4xxxx client errcodes become 400, and everything else becomes a 502.
 */
export function normalizeWechatApiError(result: WechatApiResult): ProviderRequestError {
  const errcode = readWechatErrcode(result.record);
  const errmsg = optionalString(result.record?.errmsg);
  let message =
    errcode === null
      ? (errmsg ?? (result.rawText.trim().slice(0, 500) || `WeChat API request failed with status ${result.status}`))
      : `WeChat API error ${errcode}: ${errmsg ?? "unknown error"}`;
  if (errcode === 40164) {
    message = `${message}. ${ipWhitelistHint}`;
  }
  if (result.status === 429 || errcode === 45009 || errcode === 45011) {
    return new ProviderRequestError(429, message, result.record);
  }
  if (errcode === 48001) {
    return new ProviderRequestError(403, message, result.record);
  }
  if (errcode !== null && errcode >= 40000 && errcode < 50000) {
    return new ProviderRequestError(400, message, result.record);
  }
  if (result.status >= 400 && result.status < 500) {
    return new ProviderRequestError(result.status, message, result.record);
  }
  return providerResponseError(message);
}
