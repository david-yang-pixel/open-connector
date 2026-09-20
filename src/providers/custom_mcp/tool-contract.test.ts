import type { Tool } from "@modelcontextprotocol/client";

import { describe, expect, it, vi } from "vitest";
import { authorizeCustomMcpTool, describeCustomMcpTool } from "./tool-contract.ts";

const readTool: Tool = {
  name: "query_logs",
  description: "Query logs.",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string" } },
    required: ["query"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
};

describe("custom MCP tool contracts", () => {
  it("derives stable action ids and conservative operation types from annotations", () => {
    expect(describeCustomMcpTool(readTool)).toMatchObject({
      actionId: "custom_mcp.remote.query_logs",
      operationType: "read",
      confirmationRequired: false,
    });
    expect(describeCustomMcpTool({ ...readTool, name: "update/ticket", annotations: {} })).toMatchObject({
      actionId: "custom_mcp.remote.update%2Fticket",
      operationType: "write",
      confirmationRequired: true,
    });
    expect(
      describeCustomMcpTool({ ...readTool, annotations: { readOnlyHint: true, destructiveHint: true } }),
    ).toMatchObject({ operationType: "destructive", confirmationRequired: true });
  });

  it("validates arguments locally before policy or remote execution", () => {
    const authorizeAction = vi.fn(() => ({ allowed: true as const }));
    expect(() => authorizeCustomMcpTool(readTool, {}, {}, { authorizeAction })).toThrow(
      "do not match its input schema",
    );
    expect(authorizeAction).not.toHaveBeenCalled();
  });

  it("requires confirmation and applies the dynamic tool policy", () => {
    const writeTool: Tool = { ...readTool, name: "update_ticket", annotations: { readOnlyHint: false } };
    const allow = vi.fn(() => ({ allowed: true as const }));
    expect(() =>
      authorizeCustomMcpTool(writeTool, { query: "x" }, { confirmOperation: "read" }, { authorizeAction: allow }),
    ).toThrow("confirmOperation must be write");
    expect(allow).not.toHaveBeenCalled();

    const deny = vi.fn(() => ({
      allowed: false as const,
      code: "action_blocked",
      message: "remote write blocked",
    }));
    expect(() =>
      authorizeCustomMcpTool(writeTool, { query: "x" }, { confirmOperation: "write" }, { authorizeAction: deny }),
    ).toThrow("remote write blocked");
    expect(deny).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom_mcp.remote.update_ticket",
        operationType: "write",
      }),
    );
  });
});
