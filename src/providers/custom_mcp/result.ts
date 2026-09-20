import type { ForwardedMcpToolResult } from "../../core/mcp-tool-result.ts";
import type { TransitFileUpload, TransitFileWriter } from "../../core/types.ts";
import type { CallToolResult, ContentBlock, ResourceLink } from "@modelcontextprotocol/client";

import { Buffer } from "node:buffer";
import { optionalRecord } from "../../core/cast.ts";
import { forwardedMcpToolResult } from "../../core/mcp-tool-result.ts";
import { ProviderRequestError } from "../provider-runtime.ts";
import { customMcpPaginationKey } from "./pagination.ts";

const resultMetaKey = "io.oomol.open-connector/result";
const storedResultKey = "io.oomol.open-connector/stored-result";

export interface CustomMcpResultOptions {
  toolName: string;
  inlineMaxBytes: number;
  transitFiles?: TransitFileWriter;
}

/** Preserve native MCP blocks and move oversized blocks into the shared transit-file store. */
export async function processCustomMcpResult(
  result: CallToolResult,
  options: CustomMcpResultOptions,
): Promise<ForwardedMcpToolResult> {
  const storedFiles: TransitFileUpload[] = [];
  const binaryReplacements = new Map<string, string>();
  const processedNonText = new Map<number, ContentBlock[]>();
  for (const [index, block] of (result.content ?? []).entries()) {
    if (block.type === "text") continue;
    processedNonText.set(index, await processBlock(block, index, options, storedFiles, binaryReplacements));
  }

  const originalStructuredContent = result.structuredContent;
  const replacedStructured = replaceStoredBinaryCopies(originalStructuredContent, binaryReplacements);
  let structuredContent = replacedStructured.value;
  const structuredText = structuredContent === undefined ? undefined : JSON.stringify(structuredContent);
  const originalStructuredText =
    originalStructuredContent === undefined ? undefined : JSON.stringify(originalStructuredContent);
  const deduplicateStructuredText =
    structuredText !== undefined &&
    (binaryReplacements.size > 0 || byteLength(originalStructuredText ?? "") > options.inlineMaxBytes);

  const content: ContentBlock[] = [];
  for (const [index, block] of (result.content ?? []).entries()) {
    if (block.type !== "text") {
      content.push(...(processedNonText.get(index) ?? [block]));
      continue;
    }
    if (
      deduplicateStructuredText &&
      textMatchesStructuredContent(block.text, originalStructuredContent, structuredContent)
    ) {
      replacedStructured.deduplicatedCopies += 1;
      continue;
    }
    content.push(...(await processBlock(block, index, options, storedFiles, binaryReplacements)));
  }

  if (structuredText !== undefined) {
    if (byteLength(structuredText) > options.inlineMaxBytes) {
      const stored = await storeFile(
        structuredText,
        `${safeToolName(options.toolName)}-structured.json`,
        "application/json",
        options,
      );
      storedFiles.push(stored);
      content.push(resourceLink(stored, "Structured tool result stored by OpenConnector."));
      structuredContent = storedStructuredSummary(originalStructuredContent, stored);
    }
  }

  const candidate: CallToolResult = {
    ...result,
    content,
    structuredContent,
    _meta: {
      ...(result._meta ?? {}),
      [resultMetaKey]: resultMetadata(
        options,
        storedFiles,
        byteLength(JSON.stringify({ content, structuredContent })),
        replacedStructured.deduplicatedCopies,
      ),
    },
  };
  if (byteLength(JSON.stringify(candidate)) <= options.inlineMaxBytes) {
    return forwardedMcpToolResult(candidate);
  }

  const stored = await storeFile(
    JSON.stringify(candidate, null, 2),
    `${safeToolName(options.toolName)}-result.json`,
    "application/json",
    options,
  );
  storedFiles.push(stored);
  return forwardedMcpToolResult({
    content: [
      {
        type: "text",
        text: `The complete ${options.toolName} result was stored because it exceeded the inline limit.`,
      },
      resourceLink(stored, "Complete remote MCP result stored by OpenConnector."),
    ],
    structuredContent: storedStructuredSummary(originalStructuredContent, stored),
    isError: result.isError,
    _meta: {
      ...(result._meta ?? {}),
      [resultMetaKey]: resultMetadata(options, storedFiles, 0, replacedStructured.deduplicatedCopies),
    },
  });
}

function storedStructuredSummary(
  original: CallToolResult["structuredContent"],
  stored: TransitFileUpload,
): Record<string, unknown> {
  const pagination = optionalRecord(original)?.[customMcpPaginationKey];
  return {
    [storedResultKey]: {
      name: stored.name,
      uri: stored.downloadUrl,
      mimeType: stored.mimeType,
      size: stored.sizeBytes,
    },
    [customMcpPaginationKey]: pagination,
  };
}

async function processBlock(
  block: ContentBlock,
  index: number,
  options: CustomMcpResultOptions,
  storedFiles: TransitFileUpload[],
  binaryReplacements: Map<string, string>,
): Promise<ContentBlock[]> {
  if (block.type === "text") {
    if (byteLength(block.text) <= options.inlineMaxBytes) return [block];
    const stored = await storeFile(block.text, `${safeToolName(options.toolName)}-${index}.txt`, "text/plain", options);
    storedFiles.push(stored);
    return [resourceLink(stored, "Large text result stored by OpenConnector.", block.annotations)];
  }
  if (block.type === "image" || block.type === "audio") {
    const bytes = decodeBase64(block.data, `${block.type} content`);
    if (bytes.byteLength <= options.inlineMaxBytes) return [block];
    const stored = await storeFile(
      bytes,
      `${safeToolName(options.toolName)}-${index}.${extensionForMimeType(block.mimeType)}`,
      block.mimeType,
      options,
    );
    storedFiles.push(stored);
    binaryReplacements.set(block.data, stored.downloadUrl);
    return [resourceLink(stored, `Large ${block.type} result stored by OpenConnector.`, block.annotations)];
  }
  if (block.type === "resource" && "blob" in block.resource) {
    const bytes = decodeBase64(block.resource.blob, "resource content");
    if (bytes.byteLength <= options.inlineMaxBytes) return [block];
    const mimeType = block.resource.mimeType ?? "application/octet-stream";
    const stored = await storeFile(
      bytes,
      resourceName(block.resource.uri, `${safeToolName(options.toolName)}-${index}.${extensionForMimeType(mimeType)}`),
      mimeType,
      options,
    );
    storedFiles.push(stored);
    binaryReplacements.set(block.resource.blob, stored.downloadUrl);
    return [resourceLink(stored, "Large embedded resource stored by OpenConnector.", block.annotations)];
  }
  if (block.type === "resource" && "text" in block.resource) {
    if (byteLength(block.resource.text) <= options.inlineMaxBytes) return [block];
    const mimeType = block.resource.mimeType ?? "text/plain";
    const stored = await storeFile(
      block.resource.text,
      resourceName(block.resource.uri, `${safeToolName(options.toolName)}-${index}.txt`),
      mimeType,
      options,
    );
    storedFiles.push(stored);
    return [resourceLink(stored, "Large embedded resource stored by OpenConnector.", block.annotations)];
  }
  return [block];
}

async function storeFile(
  contents: BlobPart,
  name: string,
  mimeType: string,
  options: CustomMcpResultOptions,
): Promise<TransitFileUpload> {
  if (!options.transitFiles) {
    throw new ProviderRequestError(
      413,
      `Remote MCP result exceeds the ${options.inlineMaxBytes}-byte inline limit and transit files are unavailable.`,
      { reason: "result_too_large", inlineMaxBytes: options.inlineMaxBytes },
    );
  }
  try {
    return await options.transitFiles.create(new File([contents], name, { type: mimeType }));
  } catch (error) {
    throw new ProviderRequestError(413, "Remote MCP result is too large for the configured transit-file store.", {
      reason: "result_too_large",
      cause: error instanceof Error ? error.message : error,
    });
  }
}

function resourceLink(
  stored: TransitFileUpload,
  description: string,
  annotations?: ResourceLink["annotations"],
): ResourceLink {
  return {
    type: "resource_link",
    uri: stored.downloadUrl,
    name: stored.name,
    title: stored.name,
    description,
    mimeType: stored.mimeType,
    size: stored.sizeBytes,
    annotations,
  };
}

function resultMetadata(
  options: CustomMcpResultOptions,
  storedFiles: TransitFileUpload[],
  inlineBytes: number,
  deduplicatedCopies: number,
): unknown {
  return {
    truncated: false,
    inlineBytes,
    inlineMaxBytes: options.inlineMaxBytes,
    storedFiles,
    deduplicatedCopies,
  };
}

function replaceStoredBinaryCopies(
  value: CallToolResult["structuredContent"],
  replacements: ReadonlyMap<string, string>,
): { value: CallToolResult["structuredContent"]; deduplicatedCopies: number } {
  if (value === undefined || replacements.size === 0) return { value, deduplicatedCopies: 0 };
  let deduplicatedCopies = 0;
  const replace = (candidate: unknown): unknown => {
    if (typeof candidate === "string") {
      const replacement = replacements.get(candidate);
      if (replacement) {
        deduplicatedCopies += 1;
        return replacement;
      }
      return candidate;
    }
    if (Array.isArray(candidate)) return candidate.map(replace);
    if (!candidate || typeof candidate !== "object") return candidate;
    const output: Record<string, unknown> = Object.create(null);
    for (const [key, child] of Object.entries(candidate)) output[key] = replace(child);
    return output;
  };
  return { value: replace(value) as CallToolResult["structuredContent"], deduplicatedCopies };
}

function textMatchesStructuredContent(
  text: string,
  original: CallToolResult["structuredContent"],
  replaced: CallToolResult["structuredContent"],
): boolean {
  try {
    const parsed = JSON.parse(text) as unknown;
    const comparable = canonicalJson(parsed);
    return comparable === canonicalJson(original) || comparable === canonicalJson(replaced);
  } catch {
    return false;
  }
}

function canonicalJson(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  const normalize = (candidate: unknown): unknown => {
    if (Array.isArray(candidate)) return candidate.map(normalize);
    if (!candidate || typeof candidate !== "object") return candidate;
    const output: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(candidate).sort()) {
      output[key] = normalize((candidate as Record<string, unknown>)[key]);
    }
    return output;
  };
  return JSON.stringify(normalize(value));
}

function decodeBase64(value: string, label: string): Uint8Array<ArrayBuffer> {
  try {
    return Uint8Array.from(Buffer.from(value, "base64"));
  } catch (error) {
    throw new ProviderRequestError(
      502,
      `Remote MCP returned invalid base64 ${label}.`,
      error instanceof Error ? error.message : error,
    );
  }
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function safeToolName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "remote-mcp";
}

function resourceName(uri: string, fallback: string): string {
  try {
    const name = new URL(uri).pathname.split("/").filter(Boolean).at(-1);
    return name ? decodeURIComponent(name).slice(0, 180) : fallback;
  } catch {
    return fallback;
  }
}

function extensionForMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(";", 1)[0];
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/webm": "webm",
    "application/pdf": "pdf",
    "application/json": "json",
  };
  return extensions[normalized] ?? "bin";
}
