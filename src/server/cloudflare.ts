import type { CatalogStore } from "../catalog-store.ts";
import type { ExecutorModules } from "../providers/provider-loader.ts";
import type { AssetsBinding, KVNamespaceBinding, R2BucketBinding } from "./cloudflare/cloudflare-bindings.ts";
import type { CloudflareEnv } from "./cloudflare/cloudflare-env.ts";
import type { McpOAuthHandler } from "./cloudflare/mcp-oauth.ts";
import type { ConnectApp } from "./connect-app.ts";
import type { Logger } from "./logger.ts";
import type { ISecretCodec } from "./secrets/secret-codec-core.ts";

import { ActionPolicyService, parseActionPolicyList } from "../core/action-policy.ts";
import { PromiseCache } from "../core/promise-cache.ts";
import { parseEgressTrustedHosts, parsePrivateNetworkAccessFlag } from "../core/request.ts";
import { readMcpOAuthClientMetadata } from "../custom-mcp/definition.ts";
import { ProviderLoader } from "../providers/provider-loader.ts";
import { executorModules } from "../providers/registry.cloudflare.generated.ts";
import { SaasCleanupService } from "../saas/saas-cleanup-service.ts";
import { readBearerTokenFromAuthorizationHeader } from "./api/auth.ts";
import { isConsoleShellPath } from "./api/console-paths.ts";
import { DEFAULT_OAUTH_CLOSE_DELAY_SECONDS, parseOAuthResultOrigins } from "./api/oauth-completion-page.ts";
import { loadCatalogFromAssets } from "./cloudflare/catalog-assets.ts";
import {
  readBooleanFlag,
  readNonNegativeInteger,
  readPositiveInteger,
  resolvePublicOrigin,
} from "./cloudflare/cloudflare-env.ts";
import { createConnectApp } from "./connect-app.ts";
import { KVTransitFileService } from "./files/kv-transit-files.ts";
import { R2TransitFileService } from "./files/r2-transit-files.ts";
import { parseMcpOutputMode } from "./mcp-settings.ts";
import { createWorkerSecretCodec } from "./secrets/worker-secret-codec.ts";
import { D1RuntimeDatabase, listD1RuntimeServices, listD1RuntimeServicesForToken } from "./storage/d1/runtime-store.ts";
import { DEFAULT_RUN_LIMIT } from "./storage/runtime-store.ts";

interface CloudflareExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const adminCatalogCache = new PromiseCache<CatalogStore>();
const runtimeCatalogCache = new PromiseCache<CatalogStore>();
const secretCodecCache = new PromiseCache<ISecretCodec>();
const adminAppCache = new PromiseCache<ConnectApp>();
const runtimeAppCache = new PromiseCache<ConnectApp>();
const mcpOAuthCache = new PromiseCache<McpOAuthHandler>();

export default {
  async scheduled(_event: unknown, env: CloudflareEnv, ctx: CloudflareExecutionContext): Promise<void> {
    const database = new D1RuntimeDatabase(env.DB, {
      secretCodec: await createSecretCodec(env.OOMOL_CONNECT_ENCRYPTION_KEY),
    });
    const cleanup = new SaasCleanupService({
      network: {
        allowPrivateNetwork: parsePrivateNetworkAccessFlag(env.OOMOL_CONNECT_ALLOW_PRIVATE_NETWORK),
        trustedHosts: parseEgressTrustedHosts(env.OOMOL_CONNECT_EGRESS_TRUSTED_HOSTS),
      },
      store: database.saasProjectStore,
      requests: database.connectionRequestStore,
      logger: workerLogger,
    });
    const triggerCleanup = async () => {
      if (!(await database.triggerStore.listFlowTriggersForMaintenance(Date.now(), 1)).length) return;
      const origin = env.OOMOL_CONNECT_ORIGIN ?? "https://connector.invalid";
      const { triggerMaintenance } = await adminAppCache.get(createCacheKey(env, origin), () =>
        createCloudflareApp(env, origin),
      );
      await triggerMaintenance.run();
    };
    ctx.waitUntil(Promise.all([cleanup.run(), triggerCleanup()]).then(() => undefined));
  },
  async fetch(request: Request, env: CloudflareEnv, ctx: CloudflareExecutionContext): Promise<Response> {
    if (env.OAUTH_KV) {
      if (
        !env.OOMOL_CONNECT_ORIGIN?.trim() ||
        !env.OOMOL_CONNECT_ADMIN_TOKEN?.trim() ||
        !env.OOMOL_CONNECT_ENCRYPTION_KEY?.trim()
      ) {
        return new Response("MCP OAuth requires a configured origin, administrator token, and encryption key.", {
          status: 503,
        });
      }
      const origin = env.OOMOL_CONNECT_ORIGIN.trim().replace(/\/+$/, "");
      const oauth = await mcpOAuthCache.get(origin, async () => {
        const { createMcpOAuthHandler } = await import("./cloudflare/mcp-oauth.ts");
        return createMcpOAuthHandler(origin, fetchRuntime);
      });
      return oauth.fetch(request, env, ctx);
    }
    return fetchRuntime(request, env);
  },
};

async function fetchRuntime(request: Request, env: CloudflareEnv): Promise<Response> {
  const url = new URL(request.url);
  const runtimeRequest = isRuntimeRequest(url.pathname);
  try {
    const publicOrigin = resolvePublicOrigin(request, env);
    const runtimeServices = runtimeRequest ? await resolveRuntimeServices(request, env.DB) : undefined;
    const appKey = createCacheKey(env, publicOrigin, runtimeServices);
    const cache = runtimeRequest ? runtimeAppCache : adminAppCache;
    const { app } = await cache.get(appKey, () => createCloudflareApp(env, publicOrigin, runtimeServices));
    const response = await app.fetch(request, env);
    if (response.status === 404 && env.ASSETS && shouldServeAsset(request)) {
      return env.ASSETS.fetch(request);
    }

    return response;
  } catch (error) {
    if (!runtimeRequest) throw error;
    return runtimeExceptionResponse(url.pathname, error);
  }
}

async function createCloudflareApp(
  env: CloudflareEnv,
  publicOrigin: string,
  runtimeServices?: readonly string[],
): Promise<ConnectApp> {
  const assets = env.ASSETS;
  if (!assets) {
    throw new Error("Cloudflare ASSETS binding is required to load the catalog");
  }
  // The Node server defers the MCP and docs modules to their first request so its startup graph stays small.
  // Workers keep paying their evaluation here, at app creation, so the first /mcp or /docs request of an isolate
  // is served the same way as every later one.
  const secretCodec = await createSecretCodec(env.OOMOL_CONNECT_ENCRYPTION_KEY);
  const selectedExecutorModules = selectExecutorModules(runtimeServices);
  return await createConnectApp({
    network: {
      allowPrivateNetwork: parsePrivateNetworkAccessFlag(env.OOMOL_CONNECT_ALLOW_PRIVATE_NETWORK),
      trustedHosts: parseEgressTrustedHosts(env.OOMOL_CONNECT_EGRESS_TRUSTED_HOSTS),
    },
    catalog: await loadCatalogOnce(assets, runtimeServices, Object.keys(selectedExecutorModules)),
    providerLoader: new ProviderLoader(selectedExecutorModules),
    runtimeDatabase: new D1RuntimeDatabase(env.DB, {
      secretCodec,
      runLimit: readPositiveInteger(env.OOMOL_CONNECT_RUN_LIMIT, DEFAULT_RUN_LIMIT),
    }),
    transitFiles: (() => {
      const transitFileOptions = {
        publicOrigin,
        ttlSeconds: readPositiveInteger(env.OOMOL_CONNECT_TRANSIT_FILE_TTL_SECONDS, 86_400),
        maxBytes: readPositiveInteger(env.OOMOL_CONNECT_TRANSIT_FILE_MAX_BYTES, 100 * 1024 * 1024),
      };
      return env.TRANSIT_FILES_BACKEND === "kv"
        ? new KVTransitFileService({
            namespace: env.TRANSIT_FILES as KVNamespaceBinding,
            ...transitFileOptions,
          })
        : new R2TransitFileService({
            bucket: env.TRANSIT_FILES as R2BucketBinding,
            ...transitFileOptions,
          });
    })(),
    publicOrigin,
    configuredOrigin: env.OOMOL_CONNECT_ORIGIN,
    secretCodec,
    adminToken: env.OOMOL_CONNECT_ADMIN_TOKEN,
    runtimeToken: env.OOMOL_CONNECT_RUNTIME_TOKEN,
    mcpOAuth: readBooleanFlag(env.OOMOL_CONNECT_MCP_OAUTH),
    mcpOAuthRedirectUris: parseActionPolicyList(env.OOMOL_CONNECT_MCP_OAUTH_REDIRECT_URIS),
    eventVerifyToken: env.OOMOL_CONNECT_EVENT_VERIFY_TOKEN,
    mcpOutputMode: parseMcpOutputMode(env.OOMOL_CONNECT_MCP_OUTPUT_MODE),
    requireRuntimeAuth: Boolean(env.OAUTH_KV),
    actionPolicy: new ActionPolicyService({
      allowedActions: parseActionPolicyList(env.OOMOL_CONNECT_ALLOWED_ACTIONS),
      blockedActions: parseActionPolicyList(env.OOMOL_CONNECT_BLOCKED_ACTIONS),
      allowedProxies: parseActionPolicyList(env.OOMOL_CONNECT_ALLOWED_PROXIES),
      blockedProxies: parseActionPolicyList(env.OOMOL_CONNECT_BLOCKED_PROXIES),
      allowedTriggers: parseActionPolicyList(env.OOMOL_CONNECT_ALLOWED_TRIGGERS),
      blockedTriggers: parseActionPolicyList(env.OOMOL_CONNECT_BLOCKED_TRIGGERS),
    }),
    allowedCustomOAuth: parseActionPolicyList(env.OOMOL_CONNECT_ALLOWED_CUSTOM_OAUTH),
    oauthResultOrigins: parseOAuthResultOrigins(env.OOMOL_CONNECT_OAUTH_RESULT_ORIGINS),
    customMcpOAuthClient: readMcpOAuthClientMetadata({
      clientName: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_NAME,
      logoUri: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_LOGO_URI,
      clientUri: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_URI,
    }),
    logger: workerLogger,
    computeRuntimeAuthConfigured: false,
    // Cloudflare compresses on egress itself: Response defaults to
    // `encodeBody: "automatic"`, so the runtime re-encodes a body that Hono's
    // compress() already gzipped. Depending on what the client negotiates, the
    // wire then carries gzip-in-gzip or gzip bytes with no Content-Encoding at
    // all, and dashboard JSON stops parsing either way. Hono's middleware
    // rebuilds the Response from the previous one and cannot pass
    // `encodeBody: "manual"`, so application-level compression stays off here.
    // https://developers.cloudflare.com/workers/runtime-apis/response/
    compressApiResponses: false,
    oauthCloseDelaySeconds: readNonNegativeInteger(
      env.OOMOL_CONNECT_OAUTH_CLOSE_DELAY_SECONDS,
      DEFAULT_OAUTH_CLOSE_DELAY_SECONDS,
    ),
  });
}

const workerLogger = {
  error: writeWorkerLog("error"),
  info: writeWorkerLog("info"),
  warn: writeWorkerLog("warn"),
} as unknown as Logger;

function writeWorkerLog(level: "error" | "info" | "warn"): (fields: unknown, message?: string) => void {
  return (fields, message) => {
    const write = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    if (message) {
      write(message, fields);
      return;
    }

    write(fields);
  };
}

function loadCatalogOnce(
  assets: AssetsBinding,
  runtimeServices?: readonly string[],
  executableServices: readonly string[] = Object.keys(executorModules),
): Promise<CatalogStore> {
  if (runtimeServices !== undefined) {
    const key = runtimeServices.join("\0");
    return runtimeCatalogCache.get(key, () =>
      loadCatalogFromAssets(assets, {
        executableServices,
        services: runtimeServices,
      }),
    );
  }
  return adminCatalogCache.get("", () =>
    loadCatalogFromAssets(assets, {
      executableServices: Object.keys(executorModules),
    }),
  );
}

function selectExecutorModules(runtimeServices?: readonly string[]): ExecutorModules {
  if (runtimeServices === undefined) {
    return executorModules;
  }

  return Object.fromEntries(
    runtimeServices.flatMap((service) => {
      const load = executorModules[service];
      return load ? [[service, load]] : [];
    }),
  );
}

function createSecretCodec(encryptionKey: string | undefined): Promise<ISecretCodec> {
  return secretCodecCache.get(encryptionKey ?? "", () => createWorkerSecretCodec(encryptionKey));
}

function createCacheKey(env: CloudflareEnv, publicOrigin: string, runtimeServices?: readonly string[]): string {
  return JSON.stringify({
    runtimeServices,
    publicOrigin,
    allowPrivateNetwork: parsePrivateNetworkAccessFlag(env.OOMOL_CONNECT_ALLOW_PRIVATE_NETWORK),
    trustedHosts: parseEgressTrustedHosts(env.OOMOL_CONNECT_EGRESS_TRUSTED_HOSTS),
    configuredOrigin: env.OOMOL_CONNECT_ORIGIN ?? null,
    adminToken: env.OOMOL_CONNECT_ADMIN_TOKEN ?? "",
    runtimeToken: env.OOMOL_CONNECT_RUNTIME_TOKEN ?? "",
    eventVerifyToken: env.OOMOL_CONNECT_EVENT_VERIFY_TOKEN ?? "",
    mcpOutputMode: env.OOMOL_CONNECT_MCP_OUTPUT_MODE ?? "",
    requireRuntimeAuth: Boolean(env.OAUTH_KV),
    encryptionKey: env.OOMOL_CONNECT_ENCRYPTION_KEY ?? "",
    allowedActions: env.OOMOL_CONNECT_ALLOWED_ACTIONS ?? "",
    blockedActions: env.OOMOL_CONNECT_BLOCKED_ACTIONS ?? "",
    allowedProxies: env.OOMOL_CONNECT_ALLOWED_PROXIES ?? "",
    allowedTriggers: env.OOMOL_CONNECT_ALLOWED_TRIGGERS ?? "",
    blockedTriggers: env.OOMOL_CONNECT_BLOCKED_TRIGGERS ?? "",
    blockedProxies: env.OOMOL_CONNECT_BLOCKED_PROXIES ?? "",
    allowedCustomOAuth: env.OOMOL_CONNECT_ALLOWED_CUSTOM_OAUTH ?? "",
    oauthResultOrigins: env.OOMOL_CONNECT_OAUTH_RESULT_ORIGINS ?? "",
    customMcpClientName: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_NAME ?? "",
    customMcpClientLogoUri: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_LOGO_URI ?? "",
    customMcpClientUri: env.OOMOL_CONNECT_CUSTOM_MCP_CLIENT_URI ?? "",
    transitFileTtlSeconds: env.OOMOL_CONNECT_TRANSIT_FILE_TTL_SECONDS ?? "",
    transitFileMaxBytes: env.OOMOL_CONNECT_TRANSIT_FILE_MAX_BYTES ?? "",
    runLimit: env.OOMOL_CONNECT_RUN_LIMIT ?? "",
    mcpOAuth: env.OOMOL_CONNECT_MCP_OAUTH ?? "",
    mcpOAuthRedirectUris: env.OOMOL_CONNECT_MCP_OAUTH_REDIRECT_URIS ?? "",
    oauthCloseDelaySeconds: env.OOMOL_CONNECT_OAUTH_CLOSE_DELAY_SECONDS ?? "",
  });
}

function isRuntimeRequest(pathname: string): boolean {
  return pathname === "/mcp" || pathname.startsWith("/mcp/") || pathname === "/v1" || pathname.startsWith("/v1/");
}

async function resolveRuntimeServices(request: Request, database: CloudflareEnv["DB"]): Promise<string[]> {
  const token = readBearerTokenFromAuthorizationHeader(request.headers.get("authorization"));
  if (token) {
    const grantedServices = await listD1RuntimeServicesForToken(database, token);
    if (grantedServices !== undefined) {
      return grantedServices;
    }
  }

  return listD1RuntimeServices(database);
}

function runtimeExceptionResponse(pathname: string, error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : "";
  const storageUnavailable = errorMessage.includes("D1_ERROR:");
  const storageQuotaExceeded = storageUnavailable && errorMessage.includes("daily row read limit");
  const status = storageUnavailable ? 503 : 500;
  const errorCode = storageQuotaExceeded
    ? "runtime_storage_quota_exceeded"
    : storageUnavailable
      ? "runtime_storage_unavailable"
      : "runtime_internal_error";
  const message = storageUnavailable
    ? "OpenConnector runtime storage is temporarily unavailable."
    : "OpenConnector encountered an internal runtime error.";
  const retryable = storageUnavailable && !storageQuotaExceeded;
  workerLogger.error({ err: error, errorCode, pathname }, "runtime request failed before a response was produced");

  if (pathname === "/mcp" || pathname.startsWith("/mcp/")) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: storageUnavailable ? -32_001 : -32_603,
          message,
          data: { errorCode, retryable },
        },
        retryable,
      },
      { status },
    );
  }

  return Response.json(
    {
      success: false,
      message,
      error: { code: errorCode, message },
      retryable,
    },
    { status },
  );
}

function shouldServeAsset(request: Request): boolean {
  const { pathname } = new URL(request.url);
  return !pathname.startsWith("/catalog") && isConsoleShellPath(pathname);
}
