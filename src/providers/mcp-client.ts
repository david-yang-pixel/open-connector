import type { VersionNegotiationMode } from "@modelcontextprotocol/client";

import { Client } from "@modelcontextprotocol/client";
import { SSEClientTransport } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/client/validators/cf-worker";

const mcpConnectTimeoutMs = 60_000;
const modernMcpProtocolVersion = "2026-07-28";
const mcpJsonSchemaValidator = new CfWorkerJsonSchemaValidator();

export type McpHttpTransport = "streamable_http" | "sse";
export type McpProtocolVersion = "legacy" | "modern";

export interface McpClientOptions {
  endpoint: URL;
  transport: McpHttpTransport;
  fetcher?: typeof fetch;
  headers?: HeadersInit;
  redirect?: RequestRedirect;
  signal?: AbortSignal;
  connectTimeoutMs?: number;
  protocolVersion?: McpProtocolVersion;
  terminateSession?: boolean;
  mapError?: (error: unknown) => unknown;
}

function toPlainHeaders(headers?: HeadersInit): Record<string, string> | undefined {
  if (!headers) return undefined;
  const result: Record<string, string> = {};
  if (typeof (headers as any).entries === "function") {
    for (const [key, value] of (headers as any).entries()) {
      result[key.toLowerCase()] = String(value);
    }
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      result[key.toLowerCase()] = String(value);
    }
  } else if (typeof headers === "object") {
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        result[key.toLowerCase()] = String(value);
      }
    }
  }
  return result;
}

export async function withMcpClient<T>(options: McpClientOptions, run: (client: Client) => Promise<T>): Promise<T> {
  const transportOptions = {
    fetch: options.fetcher,
    requestInit: {
      headers: toPlainHeaders(options.headers),
      redirect: options.redirect,
      signal: options.signal,
    },
  };
  const transport =
    options.transport === "sse"
      ? new SSEClientTransport(options.endpoint, transportOptions)
      : new StreamableHTTPClientTransport(options.endpoint, transportOptions);
  const client = new Client(
    { name: "open-connector", version: "1.0.0" },
    {
      jsonSchemaValidator: mcpJsonSchemaValidator,
      versionNegotiation: { mode: resolveVersionNegotiationMode(options.protocolVersion) },
    },
  );

  try {
    await client.connect(transport, {
      timeout: options.connectTimeoutMs ?? mcpConnectTimeoutMs,
      signal: options.signal,
    });
    return await run(client);
  } catch (error) {
    throw options.mapError ? options.mapError(error) : error;
  } finally {
    if (options.terminateSession && transport instanceof StreamableHTTPClientTransport) {
      await terminateMcpSession(transport);
    }
    await client.close().catch(() => undefined);
  }
}

async function terminateMcpSession(transport: StreamableHTTPClientTransport): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const termination = Promise.resolve()
    .then(() => transport.terminateSession())
    .catch(() => undefined);
  try {
    await Promise.race([
      termination,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, 2_000);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function resolveVersionNegotiationMode(protocolVersion: McpProtocolVersion | undefined): VersionNegotiationMode {
  return protocolVersion === "modern" ? { pin: modernMcpProtocolVersion } : "legacy";
}
