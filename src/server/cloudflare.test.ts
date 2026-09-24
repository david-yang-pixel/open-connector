import type {
  AssetsBinding,
  D1DatabaseBinding,
  D1PreparedStatementBinding,
  KVNamespaceBinding,
  R2BucketBinding,
  R2ObjectBinding,
} from "./cloudflare/cloudflare-bindings.ts";
import type { CloudflareEnv } from "./cloudflare/cloudflare-env.ts";

import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./cloudflare.ts";
import { hashRuntimeToken } from "./storage/runtime-token-service.ts";

const provider = {
  service: "example",
  displayName: "Example",
  categories: ["Developer Tools"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  actions: [],
};

describe("cloudflare worker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deduplicates concurrent app creation and retries after a transient catalog failure", async () => {
    // The app and catalog caches live in module state, so this test needs an isolate of its own:
    // the shared `worker` above has already cached a healthy catalog. The reimported copy also
    // gets a fresh `guarded-fetch` module, which `vitest.setup.ts` no longer holds off real DNS —
    // keep this instance on local routes that perform no provider egress.
    vi.resetModules();
    const { default: isolatedWorker } = await import("./cloudflare.ts");
    const fallback = memoryAssets(chunkedCatalog());
    let indexAttempts = 0;
    const assets: AssetsBinding = {
      async fetch(request) {
        if (new URL(request.url).pathname === "/catalog/index.json" && ++indexAttempts === 1) {
          return new Response("upstream", { status: 500 });
        }
        return fallback.fetch(request);
      },
    };
    const env: CloudflareEnv = {
      DB: new EmptyMarketplaceD1Database(),
      TRANSIT_FILES: new UnusedR2Bucket(),
      ASSETS: assets,
    };
    const request = (): Request => new Request("https://catalog-retry.example.com/api/auth/session");
    const failures = await Promise.allSettled([
      isolatedWorker.fetch(request(), env, createExecutionContext()),
      isolatedWorker.fetch(request(), env, createExecutionContext()),
    ]);

    for (const failure of failures) {
      expect(failure).toMatchObject({
        status: "rejected",
        reason: {
          message: "Cloudflare asset catalog request failed: /catalog/index.json returned 500",
        },
      });
    }
    expect(indexAttempts).toBe(1);

    const response = await isolatedWorker.fetch(request(), env, createExecutionContext());
    expect(response.status).toBe(200);
    expect(indexAttempts).toBe(2);
  });

  it("writes connection logs to console", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const response = await worker.fetch(
      new Request("https://connect.example.com/api/connections/example", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authType: "no_auth",
          connectionName: "work",
          values: {
            apiKey: "unused-secret",
          },
        }),
      }),
      createEnv(),
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    expect(info).toHaveBeenCalledWith(
      "connection started",
      expect.objectContaining({
        service: "example",
        authType: "no_auth",
        connectionName: "work",
      }),
    );
    expect(info).toHaveBeenCalledWith(
      "connection completed",
      expect.objectContaining({
        service: "example",
        authType: "no_auth",
        connectionName: "work",
      }),
    );
    expect(JSON.stringify(info.mock.calls)).not.toContain("unused-secret");
  });

  it("leaves dashboard JSON uncompressed for edge compression", async () => {
    const response = await worker.fetch(
      new Request("https://compression.example.com/api/auth/session", {
        headers: { "accept-encoding": "gzip" },
      }),
      createEnv(),
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-encoding")).toBeNull();
    await expect(response.json()).resolves.toEqual({
      adminAuthConfigured: false,
      authenticated: true,
    });
  });

  it("loads runtime providers from configured D1 services and refreshes when that set changes", async () => {
    const database = new RuntimeServicesD1Database(["zulu"]);
    const env: CloudflareEnv = {
      DB: database,
      TRANSIT_FILES: new UnusedR2Bucket(),
      ASSETS: memoryAssets({
        ...chunkedCatalog(),
        "/catalog/providers/example.json": provider,
        "/catalog/providers/zulu.json": { ...provider, service: "zulu" },
      }),
      OOMOL_CONNECT_RUNTIME_TOKEN: "runtime-secret",
    };
    const request = (): Request =>
      new Request("https://runtime-catalog.example.com/v1/providers", {
        headers: { authorization: "Bearer runtime-secret" },
      });

    const first = await worker.fetch(request(), env, createExecutionContext());
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ data: [{ service: "zulu" }] });

    database.setServices(["example"]);
    const second = await worker.fetch(request(), env, createExecutionContext());
    expect(second.status).toBe(200);
    await expect(second.json()).resolves.toMatchObject({ data: [{ service: "example" }] });
  });

  it("loads only providers reachable through an explicitly restricted stored token", async () => {
    const token = "oct_restricted";
    const env: CloudflareEnv = {
      DB: new TokenScopedRuntimeServicesD1Database(token),
      TRANSIT_FILES: new UnusedR2Bucket(),
      ASSETS: memoryAssets({
        ...chunkedCatalog(),
        "/catalog/providers/custom_mcp.json": { ...provider, service: "custom_mcp" },
        "/catalog/providers/example.json": provider,
      }),
      OOMOL_CONNECT_RUNTIME_TOKEN: token,
    };

    const response = await worker.fetch(
      new Request("https://token-runtime-catalog.example.com/v1/providers", {
        headers: { authorization: `Bearer ${token}` },
      }),
      env,
      createExecutionContext(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: [{ service: "custom_mcp" }] });
  });

  it("returns a structured MCP error when runtime bootstrap storage is unavailable", async () => {
    const env: CloudflareEnv = {
      DB: new FailingD1Database(new Error("D1_ERROR: Your account has exceeded D1's free tier daily row read limit.")),
      TRANSIT_FILES: new UnusedR2Bucket(),
      ASSETS: memoryAssets(chunkedCatalog()),
    };
    const response = await worker.fetch(
      new Request("https://runtime-storage-failure.example.com/mcp", {
        method: "POST",
        headers: {
          authorization: "Bearer oct_runtime",
          "content-type": "application/json",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 42, method: "tools/list", params: {} }),
      }),
      env,
      createExecutionContext(),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32_001,
        message: "OpenConnector runtime storage is temporarily unavailable.",
        data: {
          errorCode: "runtime_storage_quota_exceeded",
          retryable: false,
        },
      },
      retryable: false,
    });
  });

  it("revalidates provider summaries in browsers while retaining the edge cache", async () => {
    const env: CloudflareEnv = {
      DB: new EmptyMarketplaceD1Database(),
      TRANSIT_FILES: new UnusedR2Bucket(),
      ASSETS: memoryAssets({
        ...chunkedCatalog(),
        "/catalog/provider-summaries.json": [provider],
      }),
    };
    const url = "https://catalog-cache.example.com/api/providers";

    const response = await worker.fetch(new Request(url), env, createExecutionContext());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("cloudflare-cdn-cache-control")).toBe(
      "public, max-age=31536000, stale-while-revalidate=86400",
    );
    expect(response.headers.get("vary")).toBe("Authorization, Cookie, Accept-Encoding");
    await expect(response.json()).resolves.toEqual([provider]);

    const revalidated = await worker.fetch(
      new Request(url, { headers: { "if-none-match": 'W/"provider-summaries"' } }),
      env,
      createExecutionContext(),
    );

    expect(revalidated.status).toBe(304);
    expect(revalidated.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(revalidated.headers.get("vary")).toBe("Authorization, Cookie, Accept-Encoding");
  });

  it("selects the KV backend and round-trips a file when TRANSIT_FILES_BACKEND is kv", async () => {
    const namespace = new MemoryKVNamespace();
    // A distinct host keeps this out of the R2 test's cached app instance.
    const origin = "https://kv.example.com";
    const env: CloudflareEnv = {
      DB: new EmptyMarketplaceD1Database(),
      TRANSIT_FILES: namespace,
      TRANSIT_FILES_BACKEND: "kv",
      ASSETS: memoryAssets(chunkedCatalog()),
    };

    const form = new FormData();
    form.set("file", new File(["kv-payload"], "note.txt", { type: "text/plain" }));
    const uploadResponse = await worker.fetch(
      new Request(`${origin}/api/files`, { method: "POST", body: form }),
      env,
      createExecutionContext(),
    );
    expect(uploadResponse.status).toBe(200);
    const upload = (await uploadResponse.json()) as { fileId: string };
    expect(upload.fileId).toMatch(/^[a-f0-9]{32}\.txt$/);

    // Only KVTransitFileService writes an expirationTtl; its presence proves the KV
    // backend (not R2) was selected end-to-end from the TRANSIT_FILES_BACKEND flag.
    expect(namespace.entry(`transit/${upload.fileId}`)?.expirationTtl).toBe(86_400);

    const getResponse = await worker.fetch(
      new Request(`${origin}/api/files/${upload.fileId}`),
      env,
      createExecutionContext(),
    );
    expect(getResponse.status).toBe(200);
    await expect(getResponse.text()).resolves.toBe("kv-payload");
  });

  it("defaults to the R2 backend when TRANSIT_FILES_BACKEND is unset and round-trips a file", async () => {
    const bucket = new MemoryR2Bucket();
    // A distinct host keeps this out of the other tests' cached app instances.
    const origin = "https://r2.example.com";
    const env: CloudflareEnv = {
      DB: new EmptyMarketplaceD1Database(),
      TRANSIT_FILES: bucket,
      // TRANSIT_FILES_BACKEND intentionally omitted -> must fall back to R2.
      ASSETS: memoryAssets(chunkedCatalog()),
    };

    const form = new FormData();
    form.set("file", new File(["r2-payload"], "note.txt", { type: "text/plain" }));
    const uploadResponse = await worker.fetch(
      new Request(`${origin}/api/files`, { method: "POST", body: form }),
      env,
      createExecutionContext(),
    );
    expect(uploadResponse.status).toBe(200);
    const upload = (await uploadResponse.json()) as { fileId: string };
    expect(upload.fileId).toMatch(/^[a-f0-9]{32}\.txt$/);

    // Only R2TransitFileService writes httpMetadata.contentType (KV never does); its
    // presence proves the R2 backend was selected by default from an absent flag.
    expect(bucket.stored(`transit/${upload.fileId}`)?.httpMetadata?.contentType).toBe("text/plain");

    const getResponse = await worker.fetch(
      new Request(`${origin}/api/files/${upload.fileId}`),
      env,
      createExecutionContext(),
    );
    expect(getResponse.status).toBe(200);
    await expect(getResponse.text()).resolves.toBe("r2-payload");
  });
});

function createEnv(): CloudflareEnv {
  return {
    DB: new EmptyMarketplaceD1Database(),
    TRANSIT_FILES: new UnusedR2Bucket(),
    ASSETS: memoryAssets(chunkedCatalog()),
  };
}

function createExecutionContext(): Parameters<typeof worker.fetch>[2] {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}

/** The asset layout `scripts/copy-catalog-assets.ts` emits, so the worker tests boot the shipped path. */
function chunkedCatalog(): Record<string, unknown> {
  return {
    "/catalog/index.json": { version: 1, providerCount: 1, chunks: ["apps-0000.json"] },
    "/catalog/apps-0000.json": [provider],
  };
}

function memoryAssets(files: Record<string, unknown>): AssetsBinding {
  return {
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      if (!(pathname in files)) {
        return new Response("not found", { status: 404 });
      }

      return Response.json(files[pathname]);
    },
  };
}

class EmptyMarketplaceD1Database implements D1DatabaseBinding {
  async batch(): Promise<{ results: Record<string, unknown>[] }[]> {
    throw new Error("Unexpected D1 batch");
  }
  prepare(query: string): D1PreparedStatementBinding {
    if (query === "select value from marketplace_config where id = 1") {
      return new EmptyMarketplaceConfigStatement();
    }
    throw new Error(`Unexpected D1 query: ${query}`);
  }
}

class FailingD1Database implements D1DatabaseBinding {
  private readonly error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  async batch(): Promise<{ results: Record<string, unknown>[] }[]> {
    throw this.error;
  }

  prepare(): D1PreparedStatementBinding {
    return new FailingD1Statement(this.error);
  }
}

class FailingD1Statement implements D1PreparedStatementBinding {
  private readonly error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  bind(): D1PreparedStatementBinding {
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    throw this.error;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    throw this.error;
  }

  async run(): Promise<{ success: boolean; meta: { changes?: number } }> {
    throw this.error;
  }
}

class RuntimeServicesD1Database implements D1DatabaseBinding {
  private services: string[];

  constructor(services: string[]) {
    this.services = services;
  }

  setServices(services: string[]): void {
    this.services = services;
  }

  async batch(): Promise<{ results: Record<string, unknown>[] }[]> {
    throw new Error("Unexpected D1 batch");
  }

  prepare(query: string): D1PreparedStatementBinding {
    if (query === "select value from marketplace_config where id = 1") {
      return new EmptyMarketplaceConfigStatement();
    }
    if (query.includes("select service from connections") && query.includes("provider_preferences")) {
      return new RuntimeServicesStatement(() => this.services);
    }
    throw new Error(`Unexpected D1 query: ${query}`);
  }
}

class TokenScopedRuntimeServicesD1Database implements D1DatabaseBinding {
  private readonly tokenHash: string;

  constructor(token: string) {
    this.tokenHash = hashRuntimeToken(token);
  }

  async batch(): Promise<{ results: Record<string, unknown>[] }[]> {
    throw new Error("Unexpected D1 batch");
  }

  prepare(query: string): D1PreparedStatementBinding {
    if (query === "select value from marketplace_config where id = 1") {
      return new EmptyMarketplaceConfigStatement();
    }
    if (query.includes("select service from connections") && query.includes("provider_preferences")) {
      return new RuntimeServicesStatement(() => ["custom_mcp", "example"]);
    }
    if (query.includes("from runtime_tokens") && query.includes("where token_hash = ?")) {
      return new BoundD1Statement((values) =>
        values[0] === this.tokenHash
          ? {
              id: "token-id",
              name: "Restricted token",
              token_hash: this.tokenHash,
              allowed_actions: "[]",
              blocked_actions: "[]",
              allowed_proxies: "[]",
              allowed_connections: '["connection-custom"]',
              connection_permissions: "[]",
              created_at: "2026-09-22T00:00:00.000Z",
              last_used_at: null,
            }
          : null,
      );
    }
    if (query.includes("select distinct service from connections where id in")) {
      return new BoundD1Statement(
        () => null,
        () => [{ service: "custom_mcp" }],
      );
    }
    throw new Error(`Unexpected D1 query: ${query}`);
  }
}

class BoundD1Statement implements D1PreparedStatementBinding {
  private readonly allResults: (values: unknown[]) => Record<string, unknown>[];
  private readonly firstResult: (values: unknown[]) => Record<string, unknown> | null;
  private values: unknown[] = [];

  constructor(
    firstResult: (values: unknown[]) => Record<string, unknown> | null,
    allResults: (values: unknown[]) => Record<string, unknown>[] = () => [],
  ) {
    this.firstResult = firstResult;
    this.allResults = allResults;
  }

  bind(...values: unknown[]): D1PreparedStatementBinding {
    this.values = values;
    return this;
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return this.firstResult(this.values) as T | null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    return { results: this.allResults(this.values) as T[] };
  }

  async run(): Promise<{ success: boolean; meta: { changes?: number } }> {
    throw new Error("Unexpected D1 run");
  }
}

class RuntimeServicesStatement implements D1PreparedStatementBinding {
  private readonly services: () => string[];

  constructor(services: () => string[]) {
    this.services = services;
  }

  bind(): D1PreparedStatementBinding {
    throw new Error("Unexpected D1 bind");
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    throw new Error("Unexpected D1 first");
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    return { results: this.services().map((service) => ({ service })) as T[] };
  }

  async run(): Promise<{ success: boolean; meta: { changes?: number } }> {
    throw new Error("Unexpected D1 run");
  }
}

class EmptyMarketplaceConfigStatement implements D1PreparedStatementBinding {
  bind(): D1PreparedStatementBinding {
    throw new Error("Unexpected D1 bind");
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    throw new Error("Unexpected D1 all");
  }

  async run(): Promise<{ success: boolean; meta: { changes?: number } }> {
    throw new Error("Unexpected D1 run");
  }
}

class UnusedR2Bucket implements R2BucketBinding {
  async put(): Promise<unknown> {
    throw new Error("Unexpected R2 put");
  }

  async get(): Promise<R2ObjectBinding | null> {
    throw new Error("Unexpected R2 get");
  }

  async delete(): Promise<void> {
    throw new Error("Unexpected R2 delete");
  }
}

class MemoryKVNamespace implements KVNamespaceBinding {
  private readonly store = new Map<string, { bytes: ArrayBuffer; expirationTtl?: number }>();

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { expirationTtl?: number; expiration?: number },
  ): Promise<void> {
    this.store.set(key, { bytes: await toArrayBuffer(value), expirationTtl: options?.expirationTtl });
  }

  get(key: string, type: "text"): Promise<string | null>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  async get(key: string, type: "text" | "arrayBuffer"): Promise<string | ArrayBuffer | null> {
    const stored = this.store.get(key);
    if (!stored) {
      return null;
    }
    return type === "text" ? new TextDecoder().decode(stored.bytes) : stored.bytes.slice(0);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  entry(key: string): { bytes: ArrayBuffer; expirationTtl?: number } | undefined {
    return this.store.get(key);
  }
}

class MemoryR2Bucket implements R2BucketBinding {
  private readonly objects = new Map<string, MemoryR2Object>();

  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown> {
    this.objects.set(key, new MemoryR2Object(await toArrayBuffer(value), options?.httpMetadata));
    return {};
  }

  async get(key: string): Promise<R2ObjectBinding | null> {
    return this.objects.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }

  stored(key: string): MemoryR2Object | undefined {
    return this.objects.get(key);
  }
}

class MemoryR2Object implements R2ObjectBinding {
  readonly body: ReadableStream;
  readonly httpMetadata?: { contentType?: string };

  private readonly bytes: ArrayBuffer;

  constructor(bytes: ArrayBuffer, httpMetadata?: { contentType?: string }) {
    this.bytes = bytes;
    this.body = new Blob([bytes]).stream();
    this.httpMetadata = httpMetadata;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.bytes.slice(0);
  }
}

async function toArrayBuffer(
  value: string | ArrayBuffer | ArrayBufferView | ReadableStream | Blob,
): Promise<ArrayBuffer> {
  if (typeof value === "string") {
    return new TextEncoder().encode(value).buffer;
  }
  if (value instanceof Blob) {
    return await value.arrayBuffer();
  }
  if (value instanceof ArrayBuffer) {
    return value.slice(0);
  }
  if (ArrayBuffer.isView(value)) {
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return new Uint8Array(bytes).buffer;
  }

  return await new Response(value).arrayBuffer();
}
