import type { CallToolResult } from "@modelcontextprotocol/client";

import { Buffer } from "node:buffer";
import { optionalRecord, optionalString } from "../../core/cast.ts";
import { providerInputError, ProviderRequestError } from "../provider-runtime.ts";

export const customMcpPaginationKey = "io.oomol.open-connector/pagination";
const cursorPrefix = "ocmcp1.";
const maximumPageBudget = 1_000;
const maximumRuleCount = 1_000;
const maximumPathLength = 512;
const forbiddenPathSegments = new Set(["__proto__", "constructor", "prototype"]);

export interface CustomMcpPaginationRule {
  mode: "cursor" | "offset" | "page";
  responseItemsPath: string;
  requestCursorField?: string;
  responseNextCursorPath?: string;
  requestOffsetField?: string;
  requestPageField?: string;
  responseNextPagePath?: string;
  requestLimitField?: string;
  responseHasMorePath?: string;
  responseTotalPath?: string;
  maxPages?: number;
  stable?: boolean;
}

export interface CustomMcpPaginationControl {
  mode: "single" | "all";
  cursor?: string;
  pageSize?: number;
  maxPages?: number;
}

export interface CustomMcpPaginationArgumentsInput {
  toolName: string;
  arguments: Record<string, unknown>;
  rule: CustomMcpPaginationRule;
  control?: CustomMcpPaginationControl;
}

export type CustomMcpPaginationRules = Record<string, CustomMcpPaginationRule>;

interface PaginationState {
  kind: "cursor" | "offset" | "page";
  toolName: string;
  value: unknown;
  consumed: number;
}

interface InitialPaginationState {
  value: unknown;
  consumed: number;
}

interface ParsedResult {
  value: Record<string, unknown>;
  source: "structured" | "text";
  textBlockIndex?: number;
}

export function readCustomMcpPaginationRules(value: string | undefined): CustomMcpPaginationRules {
  if (!value?.trim()) return Object.create(null) as CustomMcpPaginationRules;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw providerInputError("paginationRules must contain valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw providerInputError("paginationRules must be a JSON object keyed by remote tool name.");
  }
  if (Object.keys(parsed).length > maximumRuleCount) {
    throw providerInputError(`paginationRules must not contain more than ${maximumRuleCount} entries.`);
  }
  const rules = Object.create(null) as CustomMcpPaginationRules;
  for (const [toolName, candidate] of Object.entries(parsed)) {
    const rule = optionalRecord(candidate);
    const mode = optionalString(rule?.mode);
    const responseItemsPath = readSafePath(rule?.responseItemsPath, `paginationRules.${toolName}.responseItemsPath`);
    if ((mode !== "cursor" && mode !== "offset" && mode !== "page") || !responseItemsPath) {
      throw providerInputError(`paginationRules.${toolName} requires mode and responseItemsPath.`);
    }
    const normalized: CustomMcpPaginationRule = {
      mode,
      responseItemsPath,
      requestCursorField: readSafeField(rule?.requestCursorField, `paginationRules.${toolName}.requestCursorField`),
      responseNextCursorPath: readSafePath(
        rule?.responseNextCursorPath,
        `paginationRules.${toolName}.responseNextCursorPath`,
      ),
      requestOffsetField: readSafeField(rule?.requestOffsetField, `paginationRules.${toolName}.requestOffsetField`),
      requestPageField: readSafeField(rule?.requestPageField, `paginationRules.${toolName}.requestPageField`),
      responseNextPagePath: readSafePath(
        rule?.responseNextPagePath,
        `paginationRules.${toolName}.responseNextPagePath`,
      ),
      requestLimitField: readSafeField(rule?.requestLimitField, `paginationRules.${toolName}.requestLimitField`),
      responseHasMorePath: readSafePath(rule?.responseHasMorePath, `paginationRules.${toolName}.responseHasMorePath`),
      responseTotalPath: readSafePath(rule?.responseTotalPath, `paginationRules.${toolName}.responseTotalPath`),
      maxPages: boundedPositiveInteger(rule?.maxPages, `paginationRules.${toolName}.maxPages`, 100),
      stable: rule?.stable === true,
    };
    if (mode === "cursor" && (!normalized.requestCursorField || !normalized.responseNextCursorPath)) {
      throw providerInputError(
        `paginationRules.${toolName} cursor mode requires requestCursorField and responseNextCursorPath.`,
      );
    }
    if (mode === "offset" && !normalized.requestOffsetField) {
      throw providerInputError(`paginationRules.${toolName} offset mode requires requestOffsetField.`);
    }
    if (mode === "page" && !normalized.requestPageField) {
      throw providerInputError(`paginationRules.${toolName} page mode requires requestPageField.`);
    }
    rules[toolName] = normalized;
  }
  return rules;
}

export function readCustomMcpPaginationControl(value: unknown): CustomMcpPaginationControl | undefined {
  if (value === undefined) return undefined;
  const record = optionalRecord(value);
  if (!record) throw providerInputError("pagination must be an object.");
  const mode = optionalString(record.mode) ?? "single";
  if (mode !== "single" && mode !== "all") throw providerInputError("pagination.mode must be single or all.");
  return {
    mode,
    cursor: optionalString(record.cursor),
    pageSize: optionalPositiveInteger(record.pageSize, "pagination.pageSize"),
    maxPages: optionalPositiveInteger(record.maxPages, "pagination.maxPages"),
  };
}

export async function callPaginatedCustomMcpTool(input: {
  toolName: string;
  arguments: Record<string, unknown>;
  rule: CustomMcpPaginationRule;
  control?: CustomMcpPaginationControl;
  call(arguments_: Record<string, unknown>): Promise<CallToolResult>;
}): Promise<CallToolResult> {
  const control = input.control ?? { mode: "single" };
  const configuredMaxPages = Math.min(input.rule.maxPages ?? 100, maximumPageBudget);
  const maxPages = Math.min(control.maxPages ?? configuredMaxPages, configuredMaxPages);
  const pageSize = effectivePageSize(input.arguments, input.rule.requestLimitField, control.pageSize);
  const initial = initialPaginationState(input.toolName, input.rule, control, input.arguments, pageSize);
  let remoteValue = initial.value;
  let arguments_ = prepareCustomMcpPaginationArguments(input);
  const first = await input.call(arguments_);
  const firstParsed = parseResult(first, input.rule.responseItemsPath);
  const mergedItems = [...readItems(firstParsed.value, input.rule.responseItemsPath)];
  let pageCount = 1;
  let page = pageState(input.toolName, input.rule, firstParsed.value, remoteValue, mergedItems.length, pageSize);
  const seenCursorValues = new Set<string>();
  let interruptionReason: "subrequest_limit" | null = null;

  while (control.mode === "all" && page.hasMore && pageCount < maxPages) {
    const pageKey = `${input.rule.mode}:${String(page.nextValue)}`;
    if (seenCursorValues.has(pageKey) || page.nextValue === remoteValue) {
      throw new ProviderRequestError(502, `Remote MCP pagination for ${input.toolName} did not advance.`);
    }
    seenCursorValues.add(pageKey);
    remoteValue = page.nextValue;
    arguments_ = applyPaginationArguments(input.arguments, input.rule, remoteValue, control.pageSize);
    let result: CallToolResult;
    try {
      result = await input.call(arguments_);
    } catch (error) {
      if (!isSubrequestLimitError(error)) throw error;
      interruptionReason = "subrequest_limit";
      break;
    }
    const parsed = parseResult(result, input.rule.responseItemsPath);
    const items = readItems(parsed.value, input.rule.responseItemsPath);
    mergedItems.push(...items);
    pageCount += 1;
    page = pageState(input.toolName, input.rule, parsed.value, remoteValue, items.length, pageSize);
  }

  const truncated = page.hasMore;
  const consumed = initial.consumed + mergedItems.length;
  const nextCursor = page.hasMore
    ? encodePaginationCursor({ kind: input.rule.mode, toolName: input.toolName, value: page.nextValue, consumed })
    : null;
  const total = readOptionalNumber(firstParsed.value, input.rule.responseTotalPath);
  const pagination = {
    mode: input.rule.mode,
    pagesFetched: pageCount,
    recordCount: mergedItems.length,
    hasMore: page.hasMore,
    nextCursor,
    truncated,
    remainingRecords: total === undefined ? null : Math.max(0, total - consumed),
    stable: input.rule.stable === true,
    interruptionReason,
    warning:
      interruptionReason === "subrequest_limit"
        ? "Automatic collection reached the hosting platform subrequest limit. Resume with nextCursor."
        : null,
  };

  if (control.mode === "single") {
    const visibleValue = withVisiblePagination(firstParsed.value, pagination);
    return {
      ...first,
      content: replacePaginatedText(first.content, firstParsed, visibleValue, input.rule.responseItemsPath),
      structuredContent: visibleValue,
      _meta: { ...(first._meta ?? {}), [customMcpPaginationKey]: pagination },
    };
  }

  const mergedValue = structuredClone(firstParsed.value);
  setPath(mergedValue, input.rule.responseItemsPath, mergedItems);
  if (input.rule.responseNextCursorPath) setPath(mergedValue, input.rule.responseNextCursorPath, null);
  if (input.rule.responseNextPagePath) setPath(mergedValue, input.rule.responseNextPagePath, null);
  if (input.rule.responseHasMorePath) setPath(mergedValue, input.rule.responseHasMorePath, page.hasMore);
  const visibleValue = withVisiblePagination(mergedValue, pagination);
  return {
    ...first,
    content: replacePaginatedText(first.content, firstParsed, visibleValue, input.rule.responseItemsPath),
    structuredContent: visibleValue,
    _meta: { ...(first._meta ?? {}), [customMcpPaginationKey]: pagination },
  };
}

function isSubrequestLimitError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes("too many subrequests");
}

/** Build the first remote call arguments so schema validation sees injected pagination fields. */
export function prepareCustomMcpPaginationArguments(input: CustomMcpPaginationArgumentsInput): Record<string, unknown> {
  const control = input.control ?? { mode: "single" };
  const pageSize = effectivePageSize(input.arguments, input.rule.requestLimitField, control.pageSize);
  const initial = initialPaginationState(input.toolName, input.rule, control, input.arguments, pageSize);
  return applyPaginationArguments(input.arguments, input.rule, initial.value, control.pageSize);
}

function initialPaginationState(
  toolName: string,
  rule: CustomMcpPaginationRule,
  control: CustomMcpPaginationControl,
  args: Record<string, unknown>,
  pageSize: number | undefined,
): InitialPaginationState {
  if (control.cursor) {
    const cursor = decodePaginationCursor(control.cursor);
    if (!cursor || cursor.toolName !== toolName || cursor.kind !== rule.mode) {
      throw providerInputError("pagination.cursor is invalid or belongs to another tool.");
    }
    return { value: cursor.value, consumed: cursor.consumed };
  }
  const value =
    rule.mode === "cursor"
      ? args[rule.requestCursorField!]
      : rule.mode === "page"
        ? (args[rule.requestPageField!] ?? 1)
        : (args[rule.requestOffsetField!] ?? 0);
  const numericValue = Number(value);
  const consumed =
    rule.mode === "offset" && Number.isSafeInteger(numericValue)
      ? numericValue
      : rule.mode === "page" && Number.isSafeInteger(numericValue) && pageSize !== undefined
        ? Math.max(0, numericValue - 1) * pageSize
        : 0;
  return { value, consumed };
}

function applyPaginationArguments(
  input: Record<string, unknown>,
  rule: CustomMcpPaginationRule,
  value: unknown,
  pageSize: number | undefined,
): Record<string, unknown> {
  const result = { ...input };
  if (rule.mode === "cursor") {
    if (value === undefined || value === null || value === "") delete result[rule.requestCursorField!];
    else result[rule.requestCursorField!] = value;
  } else if (rule.mode === "offset") {
    result[rule.requestOffsetField!] = value;
  } else {
    result[rule.requestPageField!] = value;
  }
  if (pageSize !== undefined && rule.requestLimitField) result[rule.requestLimitField] = pageSize;
  return result;
}

function pageState(
  toolName: string,
  rule: CustomMcpPaginationRule,
  value: Record<string, unknown>,
  currentValue: unknown,
  itemCount: number,
  pageSize: number | undefined,
): { hasMore: boolean; nextValue: unknown } {
  const explicitHasMore = readOptionalBoolean(value, rule.responseHasMorePath);
  if (rule.mode === "cursor") {
    const nextValue = readPath(value, rule.responseNextCursorPath!);
    if (nextValue !== undefined && nextValue !== null && typeof nextValue !== "string") {
      throw new ProviderRequestError(502, `Remote MCP pagination cursor for ${toolName} is not a string.`);
    }
    const hasNextCursor = typeof nextValue === "string" && nextValue.length > 0;
    if (hasNextCursor && nextValue.length > 2_048) {
      throw new ProviderRequestError(502, `Remote MCP pagination cursor for ${toolName} is too long.`);
    }
    if (explicitHasMore === true && !hasNextCursor) {
      throw new ProviderRequestError(502, `Remote MCP pagination for ${toolName} reports more data without a cursor.`);
    }
    return { hasMore: explicitHasMore ?? hasNextCursor, nextValue };
  }
  const numericValue = typeof currentValue === "number" ? currentValue : Number(currentValue);
  const total = readOptionalNumber(value, rule.responseTotalPath);
  if (rule.mode === "page") {
    if (!Number.isSafeInteger(numericValue) || numericValue < 1) {
      throw new ProviderRequestError(502, `Remote MCP pagination page for ${toolName} is invalid.`);
    }
    const nextMarker = readPath(value, rule.responseNextPagePath ?? "");
    const hasNextMarker =
      rule.responseNextPagePath !== undefined && nextMarker !== undefined && nextMarker !== null && nextMarker !== "";
    const hasMoreFromTotal =
      total !== undefined && pageSize !== undefined ? numericValue * pageSize < total : undefined;
    const hasMore =
      explicitHasMore ??
      (rule.responseNextPagePath ? hasNextMarker : undefined) ??
      hasMoreFromTotal ??
      (pageSize !== undefined && itemCount >= pageSize);
    if (hasMore && itemCount === 0) {
      throw new ProviderRequestError(502, `Remote MCP pagination for ${toolName} reports more data without advancing.`);
    }
    return { hasMore, nextValue: numericValue + 1 };
  }
  const offset = numericValue;
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new ProviderRequestError(502, `Remote MCP pagination offset for ${toolName} is invalid.`);
  }
  const hasMoreFromTotal = total !== undefined ? offset + itemCount < total : undefined;
  const hasMore = explicitHasMore ?? hasMoreFromTotal ?? (pageSize !== undefined && itemCount >= pageSize);
  if (hasMore && itemCount === 0) {
    throw new ProviderRequestError(502, `Remote MCP pagination for ${toolName} reports more data without advancing.`);
  }
  return { hasMore, nextValue: offset + itemCount };
}

function effectivePageSize(
  args: Record<string, unknown>,
  requestLimitField: string | undefined,
  configuredPageSize: number | undefined,
): number | undefined {
  if (configuredPageSize !== undefined) return configuredPageSize;
  if (!requestLimitField) return undefined;
  const value = Number(args[requestLimitField]);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function withVisiblePagination(
  value: Record<string, unknown>,
  pagination: Record<string, unknown>,
): Record<string, unknown> {
  const visible = structuredClone(value);
  visible[customMcpPaginationKey] = pagination;
  return visible;
}

function replacePaginatedText(
  original: CallToolResult["content"],
  parsed: ParsedResult,
  visibleValue: Record<string, unknown>,
  itemsPath: string,
): CallToolResult["content"] {
  const content = [...(original ?? [])];
  const textBlockIndex =
    parsed.source === "text" && parsed.textBlockIndex !== undefined
      ? parsed.textBlockIndex
      : findPaginatedTextBlock(content, itemsPath);
  if (textBlockIndex === undefined) return content;
  const block = content[textBlockIndex];
  content[textBlockIndex] = {
    type: "text",
    text: JSON.stringify(visibleValue),
    annotations: block.type === "text" ? block.annotations : undefined,
  };
  return content;
}

function parseResult(result: CallToolResult, itemsPath: string): ParsedResult {
  if (
    result.structuredContent &&
    typeof result.structuredContent === "object" &&
    !Array.isArray(result.structuredContent)
  ) {
    return { value: result.structuredContent as Record<string, unknown>, source: "structured" };
  }
  for (const [index, block] of (result.content ?? []).entries()) {
    if (block.type !== "text") continue;
    try {
      const parsed = JSON.parse(block.text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { value: parsed as Record<string, unknown>, source: "text", textBlockIndex: index };
      }
    } catch {
      // Continue to another text block; pagination requires one JSON object result.
    }
  }
  throw new ProviderRequestError(502, `Remote MCP result does not expose JSON pagination path ${itemsPath}.`);
}

function readItems(value: Record<string, unknown>, path: string): unknown[] {
  const items = readPath(value, path);
  if (!Array.isArray(items)) {
    throw new ProviderRequestError(502, `Remote MCP pagination path ${path} is not an array.`);
  }
  return items;
}

function findPaginatedTextBlock(content: CallToolResult["content"], itemsPath: string): number | undefined {
  for (const [index, block] of (content ?? []).entries()) {
    if (block.type !== "text") continue;
    try {
      const value = JSON.parse(block.text);
      if (value && typeof value === "object" && !Array.isArray(value) && Array.isArray(readPath(value, itemsPath))) {
        return index;
      }
    } catch {
      // Native non-JSON text blocks remain unchanged.
    }
  }
  return undefined;
}

function readPath(value: Record<string, unknown>, path: string): unknown {
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setPath(value: Record<string, unknown>, path: string, replacement: unknown): void {
  const segments = path.split(".");
  let current = value;
  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      throw new ProviderRequestError(502, `Remote MCP pagination path ${path} cannot be updated.`);
    }
    current = next as Record<string, unknown>;
  }
  current[segments.at(-1)!] = replacement;
}

function readOptionalBoolean(value: Record<string, unknown>, path: string | undefined): boolean | undefined {
  if (!path) return undefined;
  const candidate = readPath(value, path);
  return typeof candidate === "boolean" ? candidate : undefined;
}

function readOptionalNumber(value: Record<string, unknown>, path: string | undefined): number | undefined {
  if (!path) return undefined;
  const candidate = readPath(value, path);
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : undefined;
}

function encodePaginationCursor(state: PaginationState): string {
  return `${cursorPrefix}${Buffer.from(JSON.stringify(state), "utf8").toString("base64url")}`;
}

function decodePaginationCursor(value: string): PaginationState | undefined {
  if (!value.startsWith(cursorPrefix) || value.length > 4096) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(value.slice(cursorPrefix.length), "base64url").toString("utf8")) as {
      kind?: unknown;
      toolName?: unknown;
      value?: unknown;
      consumed?: unknown;
    };
    if (
      (parsed.kind !== "cursor" && parsed.kind !== "offset" && parsed.kind !== "page") ||
      typeof parsed.toolName !== "string"
    ) {
      return undefined;
    }
    if (!Number.isSafeInteger(parsed.consumed) || (parsed.consumed as number) < 0) return undefined;
    return { kind: parsed.kind, toolName: parsed.toolName, value: parsed.value, consumed: parsed.consumed as number };
  } catch {
    return undefined;
  }
}

function optionalPositiveInteger(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  return boundedPositiveInteger(value, field, 1);
}

function boundedPositiveInteger(value: unknown, field: string, fallback: number): number {
  if (value === undefined) return fallback;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > maximumPageBudget) {
    throw providerInputError(`${field} must be an integer between 1 and ${maximumPageBudget}.`);
  }
  return number;
}

function readSafeField(value: unknown, field: string): string | undefined {
  const candidate = optionalString(value);
  if (candidate === undefined) return undefined;
  if (candidate.length > maximumPathLength || candidate.includes(".") || forbiddenPathSegments.has(candidate)) {
    throw providerInputError(`${field} must be a safe top-level field name.`);
  }
  return candidate;
}

function readSafePath(value: unknown, field: string): string | undefined {
  const candidate = optionalString(value);
  if (candidate === undefined) return undefined;
  const segments = candidate.split(".");
  if (
    candidate.length > maximumPathLength ||
    segments.some((segment) => !segment || forbiddenPathSegments.has(segment))
  ) {
    throw providerInputError(`${field} must be a safe dot-separated object path.`);
  }
  return candidate;
}
