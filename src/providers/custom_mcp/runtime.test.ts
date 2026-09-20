import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  listTools: vi.fn(),
  callTool: vi.fn(),
}));
const mcpClient = vi.hoisted(() => ({
  withMcpClient: vi.fn(),
}));

vi.mock("../mcp-client.ts", () => ({
  withMcpClient: mcpClient.withMcpClient,
}));

import { callCustomMcpTool, createCustomMcpContext, listCustomMcpTools } from "./runtime.ts";

describe("custom MCP runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mcpClient.withMcpClient.mockImplementation(
      async (_options: unknown, run: (value: typeof client) => Promise<unknown>) => run(client),
    );
    client.listTools.mockResolvedValue({
      tools: [
        {
          name: "query_logs",
          description: "Query logs.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, destructiveHint: false },
        },
      ],
    });
    client.callTool.mockResolvedValue({
      content: [{ type: "text", text: '{"rows":[1]}' }],
      structuredContent: { rows: [1] },
    });
  });

  it("discovers live schemas, risk annotations, and dynamic action ids", async () => {
    const tools = await listCustomMcpTools(context());
    expect(tools).toEqual([
      expect.objectContaining({
        name: "query_logs",
        actionId: "custom_mcp.remote.query_logs",
        operationType: "read",
        confirmationRequired: false,
      }),
    ]);
  });

  it("tries each primary transport before using a configured fallback endpoint", async () => {
    mcpClient.withMcpClient.mockImplementation(
      async (
        options: { endpoint: URL; transport: string },
        run: (value: typeof client) => Promise<unknown>,
      ): Promise<unknown> => {
        if (options.endpoint.host === "mcp.example.com") throw new Error("primary unavailable");
        return run(client);
      },
    );
    const customContext = createCustomMcpContext(
      {
        serverUrl: "https://mcp.example.com/mcp",
        fallbackServerUrls: '["https://fallback.example.com/mcp"]',
      },
      fetch,
    );

    await expect(listCustomMcpTools(customContext)).resolves.toHaveLength(1);
    expect(
      mcpClient.withMcpClient.mock.calls.map(([options]) => ({
        endpoint: (options as { endpoint: URL }).endpoint.host,
        transport: (options as { transport: string }).transport,
      })),
    ).toEqual([
      { endpoint: "mcp.example.com", transport: "streamable_http" },
      { endpoint: "mcp.example.com", transport: "sse" },
      { endpoint: "fallback.example.com", transport: "streamable_http" },
    ]);
  });

  it("uses trusted per-tool risk overrides when the remote server omits annotations", async () => {
    client.listTools.mockResolvedValueOnce({
      tools: [{ name: "query_logs", inputSchema: { type: "object" } }],
    });
    const customContext = createCustomMcpContext(
      {
        serverUrl: "https://mcp.example.com/mcp",
        toolOperationTypes: '{"query_logs":"read"}',
      },
      fetch,
      { authorizeAction: () => ({ allowed: true }) },
    );

    await expect(listCustomMcpTools(customContext)).resolves.toEqual([
      expect.objectContaining({ name: "query_logs", operationType: "read", confirmationRequired: false }),
    ]);
  });

  it("treats prototype-like remote tool names as ordinary unknown-risk tools", async () => {
    client.listTools.mockResolvedValueOnce({
      tools: [{ name: "__proto__", inputSchema: { type: "object" } }],
    });

    await expect(listCustomMcpTools(context())).resolves.toEqual([
      expect.objectContaining({ name: "__proto__", operationType: "write", confirmationRequired: true }),
    ]);
  });

  it("follows remote tools/list cursors before reporting the directory", async () => {
    client.listTools
      .mockResolvedValueOnce({
        tools: [{ name: "first", inputSchema: { type: "object" }, annotations: { readOnlyHint: true } }],
        nextCursor: "page-2",
      })
      .mockResolvedValueOnce({
        tools: [{ name: "second", inputSchema: { type: "object" }, annotations: { readOnlyHint: true } }],
      });

    const tools = await listCustomMcpTools(context());
    expect(tools.map((tool) => tool.name)).toEqual(["first", "second"]);
    expect(client.listTools).toHaveBeenNthCalledWith(2, { cursor: "page-2" }, { timeout: 60000, signal: undefined });
  });

  it("validates and authorizes the live tool before returning native content", async () => {
    const authorizeAction = vi.fn(() => ({ allowed: true as const }));
    const result = await callCustomMcpTool(context({ authorizeAction }), {
      toolName: "query_logs",
      arguments: { query: "error" },
    });

    expect(authorizeAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: "custom_mcp.remote.query_logs", operationType: "read" }),
    );
    expect(client.callTool).toHaveBeenCalledWith(
      { name: "query_logs", arguments: { query: "error" } },
      { timeout: 120000, signal: undefined },
    );
    expect(result.content).toEqual([{ type: "text", text: '{"rows":[1]}' }]);
    expect(result.structuredContent).toEqual({ rows: [1] });
  });

  it("validates the pagination fields that OpenConnector injects into the remote call", async () => {
    client.listTools.mockResolvedValueOnce({
      tools: [
        {
          name: "query_logs",
          inputSchema: {
            type: "object",
            properties: { offset: { type: "integer" }, limit: { type: "integer" } },
            required: ["offset", "limit"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
        },
      ],
    });
    const customContext = createCustomMcpContext(
      {
        serverUrl: "https://mcp.example.com/mcp",
        paginationRules:
          '{"query_logs":{"mode":"offset","requestOffsetField":"offset","requestLimitField":"limit","responseItemsPath":"rows"}}',
      },
      fetch,
      { authorizeAction: () => ({ allowed: true }) },
    );

    await callCustomMcpTool(customContext, {
      toolName: "query_logs",
      pagination: { mode: "single", pageSize: 25 },
    });

    expect(client.callTool).toHaveBeenCalledWith(
      { name: "query_logs", arguments: { offset: 0, limit: 25 } },
      { timeout: 60000, signal: undefined },
    );
  });

  it("does not call the remote tool when arguments or confirmation are invalid", async () => {
    await expect(callCustomMcpTool(context(), { toolName: "query_logs", arguments: {} })).rejects.toMatchObject({
      status: 400,
      details: { reason: "invalid_input" },
    });
    expect(client.callTool).not.toHaveBeenCalled();

    client.listTools.mockResolvedValueOnce({
      tools: [
        {
          name: "update_ticket",
          inputSchema: { type: "object", additionalProperties: true },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
      ],
    });
    await expect(callCustomMcpTool(context(), { toolName: "update_ticket", arguments: {} })).rejects.toMatchObject({
      status: 400,
      details: { reason: "confirmation_required" },
    });
    expect(client.callTool).not.toHaveBeenCalled();
  });

  it("preserves remote stale-snapshot conflicts and client validation statuses", async () => {
    client.callTool.mockResolvedValueOnce({
      isError: true,
      content: [],
      structuredContent: {
        success: false,
        code: "STALE_TICKET_SNAPSHOT",
        error: "Refresh the ticket before updating it.",
      },
    });
    await expect(
      callCustomMcpTool(context(), { toolName: "query_logs", arguments: { query: "error" } }),
    ).rejects.toMatchObject({
      status: 409,
      message: "Refresh the ticket before updating it.",
      details: { remoteCode: "STALE_TICKET_SNAPSHOT" },
    });

    client.callTool.mockResolvedValueOnce({
      isError: true,
      content: [{ type: "text", text: '{"success":false,"status_code":422,"detail":"RecordInvalid"}' }],
    });
    await expect(
      callCustomMcpTool(context(), { toolName: "query_logs", arguments: { query: "error" } }),
    ).rejects.toMatchObject({
      status: 422,
      message: "RecordInvalid",
      details: { remoteStatus: 422 },
    });
  });

  it("rejects a successful write result whose diff disagrees with its after snapshot", async () => {
    client.listTools.mockResolvedValue({
      tools: [
        {
          name: "update_ticket",
          inputSchema: { type: "object", additionalProperties: true },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
      ],
    });
    client.callTool.mockResolvedValueOnce({
      content: [],
      structuredContent: {
        success: true,
        diff: { tags: { before: ["existing"], after: ["existing", "requested"] } },
        after: { tags: ["existing"] },
      },
    });

    await expect(
      callCustomMcpTool(context(), {
        toolName: "update_ticket",
        arguments: {},
        confirmOperation: "write",
      }),
    ).rejects.toMatchObject({
      status: 502,
      details: {
        reason: "remote_result_inconsistent",
        fields: ["tags"],
        mismatches: { tags: { expected: ["existing", "requested"], actual: ["existing"] } },
      },
    });
  });

  it("accepts a successful write result whose diff matches its after snapshot", async () => {
    client.listTools.mockResolvedValue({
      tools: [
        {
          name: "update_ticket",
          inputSchema: { type: "object", additionalProperties: true },
          annotations: { readOnlyHint: false, destructiveHint: false },
        },
      ],
    });
    client.callTool.mockResolvedValueOnce({
      content: [],
      structuredContent: {
        success: true,
        diff: { priority: { before: "low", after: "normal" } },
        after: { priority: "normal" },
      },
    });

    await expect(
      callCustomMcpTool(context(), {
        toolName: "update_ticket",
        arguments: {},
        confirmOperation: "write",
      }),
    ).resolves.toMatchObject({ structuredContent: { success: true } });
  });
});

function context(host: Parameters<typeof createCustomMcpContext>[2] = {}) {
  return createCustomMcpContext(
    {
      serverUrl: "https://mcp.example.com/mcp",
      requestTimeoutMs: "60000",
      toolTimeouts: '{"query_logs":120000}',
      inlineResultMaxBytes: "4096",
    },
    fetch,
    { authorizeAction: () => ({ allowed: true }), ...host },
  );
}
