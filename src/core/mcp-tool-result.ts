import type { CallToolResult } from "@modelcontextprotocol/client";

const forwardedResultMarker = "io.oomol.open-connector/forwarded-mcp-result";

/** MCP tool result retained as structured content instead of flattened into provider JSON text. */
export interface ForwardedMcpToolResult extends CallToolResult {
  _meta: Record<string, unknown> & {
    [forwardedResultMarker]: true;
  };
}

export function forwardedMcpToolResult(result: CallToolResult): ForwardedMcpToolResult {
  return {
    ...result,
    content: result.content ?? [],
    _meta: {
      ...(result._meta ?? {}),
      [forwardedResultMarker]: true,
    },
  };
}

export function isForwardedMcpToolResult(value: unknown): value is ForwardedMcpToolResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<ForwardedMcpToolResult>;
  return Array.isArray(result.content) && result._meta?.[forwardedResultMarker] === true;
}
