import type {
  ActionDefinition,
  ActionOperationType,
  CredentialValidationResult,
  TransitFileWriter,
} from "../../core/types.ts";
import type { CustomMcpPaginationRules, CustomMcpPaginationRule } from "./pagination.ts";
import type { CustomMcpToolDescriptor } from "./tool-contract.ts";
import type { CallToolResult, Client, Tool } from "@modelcontextprotocol/client";

import { ProtocolError, SdkHttpError, UnauthorizedError } from "@modelcontextprotocol/client";
import { createHash } from "node:crypto";
import { optionalInteger, optionalRecord, optionalString, requiredString } from "../../core/cast.ts";
import { assertPublicHttpUrl, isPrivateNetworkAccessAllowed } from "../../core/request.ts";
import { withMcpClient } from "../mcp-client.ts";
import { providerInputError, providerUserAgent, ProviderRequestError } from "../provider-runtime.ts";
import {
  callPaginatedCustomMcpTool,
  prepareCustomMcpPaginationArguments,
  readCustomMcpPaginationControl,
  readCustomMcpPaginationRules,
} from "./pagination.ts";
import { processCustomMcpResult } from "./result.ts";
import {
  authorizeCustomMcpTool,
  customMcpToolActionDefinition,
  describeCustomMcpTool,
  validateCustomMcpToolArguments,
} from "./tool-contract.ts";

const defaultRequestTimeoutMs = 60_000;
const minRequestTimeoutMs = 1_000;
const maxRequestTimeoutMs = 15 * 60_000;
const defaultInlineResultMaxBytes = 256 * 1024;
const minInlineResultMaxBytes = 4 * 1024;
const maxInlineResultMaxBytes = 16 * 1024 * 1024;
const maxFallbackEndpointCount = 10;
const maxToolTimeoutCount = 1_000;
const toolCatalogCacheTtlMs = 5 * 60_000;
const maxToolCatalogCacheEntries = 128;

interface CustomMcpToolCatalogCacheEntry {
  expiresAt: number;
  value: Promise<Tool[]>;
}

const toolCatalogCache = new Map<string, CustomMcpToolCatalogCacheEntry>();

interface CustomMcpHostContext {
  connectionId?: string;
  connectionRevision?: string;
  signal?: AbortSignal;
  transitFiles?: TransitFileWriter;
  authorizeAction?(action: ActionDefinition): { allowed: true } | { allowed: false; code: string; message: string };
}

export interface CustomMcpContext {
  endpoint: URL;
  fallbackEndpoints: URL[];
  authorizationToken?: string;
  fetcher: typeof fetch;
  signal?: AbortSignal;
  transitFiles?: TransitFileWriter;
  authorizeAction?: CustomMcpHostContext["authorizeAction"];
  requestTimeoutMs: number;
  toolTimeouts: Record<string, number>;
  toolOperationTypes: Record<string, ActionOperationType>;
  inlineResultMaxBytes: number;
  paginationRules: CustomMcpPaginationRules;
  toolCatalogCacheKey?: string;
}

export interface CustomMcpPublishedTool extends CustomMcpToolDescriptor {
  pagination?: CustomMcpPaginationRule;
}

export function createCustomMcpContext(
  values: Record<string, string>,
  fetcher: typeof fetch,
  host: CustomMcpHostContext = {},
): CustomMcpContext {
  const endpoint = normalizeCustomMcpEndpoint(values.serverUrl);
  return {
    endpoint,
    fallbackEndpoints: readFallbackEndpoints(values.fallbackServerUrls, endpoint),
    authorizationToken: optionalString(values.authorizationToken),
    fetcher,
    signal: host.signal,
    transitFiles: host.transitFiles,
    authorizeAction: host.authorizeAction,
    requestTimeoutMs: readBoundedInteger(
      values.requestTimeoutMs,
      "requestTimeoutMs",
      defaultRequestTimeoutMs,
      minRequestTimeoutMs,
      maxRequestTimeoutMs,
    ),
    toolTimeouts: readToolTimeouts(values.toolTimeouts),
    toolOperationTypes: readToolOperationTypes(values.toolOperationTypes),
    inlineResultMaxBytes: readBoundedInteger(
      values.inlineResultMaxBytes,
      "inlineResultMaxBytes",
      defaultInlineResultMaxBytes,
      minInlineResultMaxBytes,
      maxInlineResultMaxBytes,
    ),
    paginationRules: readCustomMcpPaginationRules(values.paginationRules),
    toolCatalogCacheKey:
      host.connectionId && host.connectionRevision ? `${host.connectionId}:${host.connectionRevision}` : undefined,
  };
}

export async function validateCustomMcpCredential(
  values: Record<string, string>,
  fetcher: typeof fetch,
  signal?: AbortSignal,
): Promise<CredentialValidationResult> {
  const context = createCustomMcpContext(values, fetcher, { signal });
  const tools = await listCustomMcpTools(context);
  const endpointHash = createHash("sha256").update(context.endpoint.origin).digest("hex").slice(0, 16);
  return {
    profile: {
      accountId: `custom_mcp:${endpointHash}`,
      displayName: `Custom MCP (${context.endpoint.host})`,
    },
    grantedScopes: [],
    metadata: {
      mcpEndpoint: context.endpoint.toString(),
      discoveredToolCount: tools.length,
    },
  };
}

export async function listCustomMcpTools(context: CustomMcpContext): Promise<CustomMcpPublishedTool[]> {
  const published: CustomMcpPublishedTool[] = [];
  for (const tool of await getCustomMcpToolCatalog(context)) {
    const descriptor = describeCustomMcpTool(tool, context.toolOperationTypes[tool.name]);
    if (context.authorizeAction && !context.authorizeAction(customMcpToolActionDefinition(tool, descriptor)).allowed) {
      continue;
    }
    published.push({ ...descriptor, pagination: context.paginationRules[tool.name] });
  }
  return published;
}

export async function callCustomMcpTool(
  context: CustomMcpContext,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const toolName = requiredString(input.toolName, "toolName", providerInputError);
  const args = optionalRecord(input.arguments) ?? {};
  return withCustomMcpClient(context, async (client) => {
    const tools = await getCustomMcpToolCatalog(context, client);
    const tool = tools.find((candidate) => candidate.name === toolName);
    if (!tool) {
      throw new ProviderRequestError(404, `Remote MCP tool was not found: ${toolName}.`, {
        reason: "unknown_remote_tool",
        toolName,
      });
    }
    const pagination = readCustomMcpPaginationControl(input.pagination);
    const rule = context.paginationRules[toolName];
    if (pagination && !rule) {
      throw providerInputError(`Remote MCP tool ${toolName} does not have a configured pagination rule.`);
    }
    const firstCallArguments = rule
      ? prepareCustomMcpPaginationArguments({ toolName, arguments: args, rule, control: pagination })
      : args;
    const descriptor = authorizeCustomMcpTool(tool, firstCallArguments, input, {
      authorizeAction: context.authorizeAction,
      operationTypeOverride: context.toolOperationTypes[toolName],
    });
    if (pagination?.mode === "all" && descriptor.operationType !== "read") {
      throw providerInputError("Automatic multi-page collection is only available for read-only remote MCP tools.");
    }
    const timeout = context.toolTimeouts[toolName] ?? context.requestTimeoutMs;
    const call = async (arguments_: Record<string, unknown>) => {
      validateCustomMcpToolArguments(tool, arguments_, descriptor.actionId);
      const result = await client.callTool(
        { name: toolName, arguments: arguments_ },
        { timeout, signal: context.signal },
      );
      if (!("toolResult" in result)) {
        assertCustomMcpToolSucceeded(result, toolName);
        if (descriptor.operationType !== "read") {
          assertCustomMcpWriteResultConsistent(result, toolName);
        }
      }
      return result;
    };
    const result = rule
      ? await callPaginatedCustomMcpTool({ toolName, arguments: args, rule, control: pagination, call })
      : await call(args);
    return processCustomMcpResult(result, {
      toolName,
      inlineMaxBytes: context.inlineResultMaxBytes,
      transitFiles: context.transitFiles,
      ...descriptor,
    });
  });
}

async function getCustomMcpToolCatalog(context: CustomMcpContext, client?: Client): Promise<Tool[]> {
  const cacheKey = context.toolCatalogCacheKey;
  if (!cacheKey) {
    return client
      ? listAllCustomMcpTools(client, context)
      : withCustomMcpClient(context, (connectedClient) => listAllCustomMcpTools(connectedClient, context));
  }

  const now = Date.now();
  const cached = toolCatalogCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  if (cached) toolCatalogCache.delete(cacheKey);

  const value = client
    ? listAllCustomMcpTools(client, context)
    : withCustomMcpClient(context, (connectedClient) => listAllCustomMcpTools(connectedClient, context));
  const entry = { expiresAt: now + toolCatalogCacheTtlMs, value };
  toolCatalogCache.set(cacheKey, entry);
  trimToolCatalogCache();
  void value.catch(() => {
    if (toolCatalogCache.get(cacheKey) === entry) toolCatalogCache.delete(cacheKey);
  });
  return value;
}

function trimToolCatalogCache(): void {
  while (toolCatalogCache.size > maxToolCatalogCacheEntries) {
    const oldestKey = toolCatalogCache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    toolCatalogCache.delete(oldestKey);
  }
}

function assertCustomMcpToolSucceeded(result: CallToolResult, toolName: string): void {
  const payload = readCustomMcpToolPayload(result);
  if (!result.isError && payload?.success !== false) return;

  const remoteCode = optionalString(payload?.code);
  const remoteStatus = optionalInteger(payload?.status_code) ?? optionalInteger(payload?.status);
  const status = remoteCode === "STALE_TICKET_SNAPSHOT" ? 409 : normalizeRemoteErrorStatus(remoteStatus);
  const message =
    optionalString(payload?.error) ??
    optionalString(payload?.message) ??
    optionalString(payload?.detail) ??
    `Custom MCP tool ${toolName} returned an error`;
  throw new ProviderRequestError(status, message, {
    remoteCode,
    remoteStatus,
    result,
  });
}

function assertCustomMcpWriteResultConsistent(result: CallToolResult, toolName: string): void {
  const payload = readCustomMcpToolPayload(result);
  if (payload?.success !== true) return;
  const diff = optionalRecord(payload.diff);
  const after = optionalRecord(payload.after);
  if (!diff || !after) return;

  const mismatches: Record<string, { expected: unknown; actual: unknown }> = {};
  for (const [field, value] of Object.entries(diff)) {
    const change = optionalRecord(value);
    if (!change || !Object.hasOwn(change, "after") || !Object.hasOwn(after, field)) continue;
    if (!jsonValuesEqual(change.after, after[field])) {
      mismatches[field] = { expected: change.after, actual: after[field] };
    }
  }
  const fields = Object.keys(mismatches);
  if (fields.length === 0) return;
  throw new ProviderRequestError(
    502,
    `Custom MCP tool ${toolName} reported success but returned an inconsistent after snapshot.`,
    {
      reason: "remote_result_inconsistent",
      fields,
      mismatches,
    },
  );
}

function readCustomMcpToolPayload(result: CallToolResult): Record<string, unknown> | undefined {
  let payload = optionalRecord(result.structuredContent);
  if (!payload) {
    for (const block of result.content ?? []) {
      if (block.type !== "text") continue;
      try {
        payload = optionalRecord(JSON.parse(block.text));
      } catch {
        continue;
      }
      if (payload) break;
    }
  }
  for (let depth = 0; payload && depth < 3; depth += 1) {
    if (Object.hasOwn(payload, "success") || Object.hasOwn(payload, "diff") || Object.hasOwn(payload, "code")) {
      return payload;
    }
    payload = optionalRecord(payload.result) ?? optionalRecord(payload.data);
  }
  return payload;
}

function normalizeRemoteErrorStatus(status: number | undefined): number {
  return status !== undefined && status >= 400 && status < 500 ? status : 502;
}

function jsonValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValuesEqual(value, right[index]))
    );
  }
  const leftRecord = optionalRecord(left);
  const rightRecord = optionalRecord(right);
  if (!leftRecord || !rightRecord) return false;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && jsonValuesEqual(leftRecord[key], rightRecord[key]))
  );
}

async function listAllCustomMcpTools(client: Client, context: CustomMcpContext): Promise<Tool[]> {
  const tools: Tool[] = [];
  const names = new Set<string>();
  const cursors = new Set<string>();
  let cursor: string | undefined;
  for (let page = 0; page < 1_000; page += 1) {
    const result = await client.listTools(cursor ? { cursor } : {}, {
      timeout: context.requestTimeoutMs,
      signal: context.signal,
    });
    for (const tool of result.tools) {
      if (names.has(tool.name)) {
        throw new ProviderRequestError(502, `Remote MCP published duplicate tool name ${tool.name}.`);
      }
      names.add(tool.name);
      tools.push(tool);
    }
    cursor = result.nextCursor;
    if (!cursor) return tools;
    if (cursors.has(cursor)) {
      throw new ProviderRequestError(502, "Remote MCP tools/list returned a repeated pagination cursor.");
    }
    cursors.add(cursor);
  }
  throw new ProviderRequestError(502, "Remote MCP tools/list exceeded the 1000-page safety limit.");
}

export function normalizeCustomMcpEndpoint(value: unknown): URL {
  const allowPrivateNetwork = isPrivateNetworkAccessAllowed();
  const url = assertPublicHttpUrl(requiredString(value, "serverUrl", providerInputError), {
    fieldName: "serverUrl",
    createError: providerInputError,
    allowPrivateNetwork,
  });
  if (url.username || url.password) throw providerInputError("serverUrl must not include credentials");
  if (url.protocol === "http:" && !allowPrivateNetwork) {
    throw providerInputError("http serverUrl values require private-network access to be enabled");
  }
  url.hash = "";
  return url;
}

async function withCustomMcpClient<T>(context: CustomMcpContext, run: (client: Client) => Promise<T>): Promise<T> {
  const headers: Record<string, string> = {
    "user-agent": providerUserAgent,
  };
  if (context.authorizationToken) {
    const token = context.authorizationToken.startsWith("Bearer ")
      ? context.authorizationToken
      : `Bearer ${context.authorizationToken}`;
    headers["authorization"] = token;
  }

  let lastError: unknown;
  for (const endpoint of [context.endpoint, ...context.fallbackEndpoints]) {
    const transports = endpoint.pathname.endsWith("/sse") ? (["sse"] as const) : (["streamable_http", "sse"] as const);
    for (const transport of transports) {
      try {
        return await withMcpClient(
          {
            endpoint,
            transport,
            fetcher: context.fetcher,
            headers,
            signal: context.signal,
            connectTimeoutMs: context.requestTimeoutMs,
          },
          async (client) => {
            try {
              return await run(client);
            } catch (error) {
              throw new CustomMcpCallbackError(error);
            }
          },
        );
      } catch (error) {
        if (error instanceof CustomMcpCallbackError) throw mapCustomMcpError(error.cause, context);
        lastError = error;
      }
    }
  }
  throw mapCustomMcpError(lastError, context);
}

class CustomMcpCallbackError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("Custom MCP callback failed");
    this.cause = cause;
  }
}

function mapCustomMcpError(error: unknown, context?: CustomMcpContext): ProviderRequestError {
  if (error instanceof ProviderRequestError) return error;
  if (error instanceof UnauthorizedError) {
    return customMcpTransportError(401, "Custom MCP credential is invalid or unauthorized", error, context);
  }
  if (error instanceof Error && error.message.includes("Invalid URL: undefined")) {
    return customMcpTransportError(
      401,
      "Custom MCP server authentication failed (HTTP 401 unauthorized). Please verify the auth token.",
      error,
      context,
    );
  }
  if (error instanceof SdkHttpError) {
    const status = error.status;
    return customMcpTransportError(
      status === 401 || status === 403 ? 401 : status && status >= 400 && status < 500 ? 400 : 502,
      `Custom MCP request failed: ${error.message}`,
      error,
      context,
    );
  }
  if (error instanceof ProtocolError) {
    return customMcpTransportError(502, `Custom MCP request failed: ${error.message}`, error, context);
  }
  return customMcpTransportError(
    502,
    error instanceof Error ? `Custom MCP request failed: ${error.message}` : "Custom MCP request failed",
    error,
    context,
  );
}

function customMcpTransportError(
  status: number,
  message: string,
  cause: unknown,
  context: CustomMcpContext | undefined,
): ProviderRequestError {
  return new ProviderRequestError(status, message, {
    source: "remote_mcp",
    phase: "transport",
    endpointCount: context ? 1 + context.fallbackEndpoints.length : 1,
    retryable: status >= 500,
    cause: cause instanceof Error ? cause.message : cause,
  });
}

function readFallbackEndpoints(value: string | undefined, primary: URL): URL[] {
  const parsed = readJson(value, "fallbackServerUrls", []);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw providerInputError("fallbackServerUrls must be a JSON array of URL strings.");
  }
  if (parsed.length > maxFallbackEndpointCount) {
    throw providerInputError(`fallbackServerUrls must not contain more than ${maxFallbackEndpointCount} URLs.`);
  }
  return parsed
    .map((item) => normalizeCustomMcpEndpoint(item))
    .filter((endpoint) => endpoint.toString() !== primary.toString());
}

function readToolTimeouts(value: string | undefined): Record<string, number> {
  const parsed = readJson(value, "toolTimeouts", {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw providerInputError("toolTimeouts must be a JSON object keyed by remote tool name.");
  }
  if (Object.keys(parsed).length > maxToolTimeoutCount) {
    throw providerInputError(`toolTimeouts must not contain more than ${maxToolTimeoutCount} entries.`);
  }
  const result = Object.create(null) as Record<string, number>;
  for (const [toolName, timeout] of Object.entries(parsed)) {
    result[toolName] = readBoundedInteger(
      timeout,
      `toolTimeouts.${toolName}`,
      defaultRequestTimeoutMs,
      minRequestTimeoutMs,
      maxRequestTimeoutMs,
    );
  }
  return result;
}

function readToolOperationTypes(value: string | undefined): Record<string, ActionOperationType> {
  const parsed = readJson(value, "toolOperationTypes", {});
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw providerInputError("toolOperationTypes must be a JSON object keyed by remote tool name.");
  }
  if (Object.keys(parsed).length > maxToolTimeoutCount) {
    throw providerInputError(`toolOperationTypes must not contain more than ${maxToolTimeoutCount} entries.`);
  }
  const result = Object.create(null) as Record<string, ActionOperationType>;
  for (const [toolName, operationType] of Object.entries(parsed)) {
    if (operationType !== "read" && operationType !== "write" && operationType !== "destructive") {
      throw providerInputError(`toolOperationTypes.${toolName} must be read, write, or destructive.`);
    }
    result[toolName] = operationType;
  }
  return result;
}

function readBoundedInteger(value: unknown, field: string, fallback: number, minimum: number, maximum: number): number {
  if (value === undefined || value === "") return fallback;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw providerInputError(`${field} must be an integer between ${minimum} and ${maximum}.`);
  }
  return number;
}

function readJson(value: string | undefined, field: string, fallback: unknown): unknown {
  if (!value?.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw providerInputError(`${field} must contain valid JSON.`);
  }
}
