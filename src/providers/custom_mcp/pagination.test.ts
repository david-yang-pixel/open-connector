import type { CallToolResult } from "@modelcontextprotocol/client";

import { describe, expect, it, vi } from "vitest";
import { callPaginatedCustomMcpTool, readCustomMcpPaginationRules } from "./pagination.ts";

describe("custom MCP pagination", () => {
  it("collects cursor pages, merges items, and reports complete continuation metadata", async () => {
    const call = vi.fn(async (args: Record<string, unknown>): Promise<CallToolResult> => {
      const cursor = args.after;
      const body = cursor === "next-2" ? { rows: [3], next: null } : { rows: [1, 2], next: "next-2" };
      return { content: [{ type: "text", text: JSON.stringify(body) }], structuredContent: body };
    });
    const result = await callPaginatedCustomMcpTool({
      toolName: "query_logs",
      arguments: {},
      rule: {
        mode: "cursor",
        requestCursorField: "after",
        requestLimitField: "limit",
        responseItemsPath: "rows",
        responseNextCursorPath: "next",
        maxPages: 10,
        stable: true,
      },
      control: { mode: "all", pageSize: 2 },
      call,
    });

    expect(call).toHaveBeenNthCalledWith(1, { limit: 2 });
    expect(call).toHaveBeenNthCalledWith(2, { after: "next-2", limit: 2 });
    expect(result.structuredContent).toEqual({
      rows: [1, 2, 3],
      next: null,
      "io.oomol.open-connector/pagination": expect.objectContaining({ hasMore: false, stable: true }),
    });
    expect(result.content).toEqual([
      {
        type: "text",
        text: expect.stringContaining('"io.oomol.open-connector/pagination"'),
        annotations: undefined,
      },
    ]);
    expect(result._meta?.["io.oomol.open-connector/pagination"]).toEqual({
      mode: "cursor",
      pagesFetched: 2,
      recordCount: 3,
      hasMore: false,
      nextCursor: null,
      truncated: false,
      remainingRecords: null,
      stable: true,
      interruptionReason: null,
      warning: null,
    });
  });

  it("continues cursor pagination across attachment-free conversation pages", async () => {
    const call = vi.fn(async (args: Record<string, unknown>): Promise<CallToolResult> => {
      const cursor = args.conversation_after;
      const body =
        cursor === "event-1"
          ? {
              data: {
                attachments: [{ id: "attachment-1" }],
                meta: { has_more: false, after_cursor: null },
              },
            }
          : {
              data: {
                attachments: [],
                meta: { has_more: true, after_cursor: "event-1" },
              },
            };
      return { content: [{ type: "text", text: JSON.stringify(body) }], structuredContent: body };
    });

    const result = await callPaginatedCustomMcpTool({
      toolName: "list_attachments",
      arguments: { ticket_id: 3726 },
      rule: {
        mode: "cursor",
        requestCursorField: "conversation_after",
        requestLimitField: "conversation_page_size",
        responseItemsPath: "data.attachments",
        responseNextCursorPath: "data.meta.after_cursor",
        responseHasMorePath: "data.meta.has_more",
      },
      control: { mode: "all", pageSize: 1 },
      call,
    });

    expect(call).toHaveBeenNthCalledWith(1, { ticket_id: 3726, conversation_page_size: 1 });
    expect(call).toHaveBeenNthCalledWith(2, {
      ticket_id: 3726,
      conversation_after: "event-1",
      conversation_page_size: 1,
    });
    expect(result.structuredContent).toMatchObject({
      data: { attachments: [{ id: "attachment-1" }], meta: { has_more: false, after_cursor: null } },
      "io.oomol.open-connector/pagination": { pagesFetched: 2, recordCount: 1, hasMore: false },
    });
  });

  it("returns collected pages and a continuation cursor at the hosting subrequest limit", async () => {
    const call = vi.fn(async (args: Record<string, unknown>): Promise<CallToolResult> => {
      if (args.after === "cursor-2") {
        throw new Error("Too many subrequests by single Worker invocation.");
      }
      const body =
        args.after === "cursor-1"
          ? { rows: [2], next: "cursor-2", has_more: true }
          : { rows: [1], next: "cursor-1", has_more: true };
      return { content: [{ type: "text", text: JSON.stringify(body) }], structuredContent: body };
    });

    const result = await callPaginatedCustomMcpTool({
      toolName: "query_logs",
      arguments: {},
      rule: {
        mode: "cursor",
        requestCursorField: "after",
        responseItemsPath: "rows",
        responseNextCursorPath: "next",
        responseHasMorePath: "has_more",
      },
      control: { mode: "all" },
      call,
    });

    expect(result.structuredContent).toMatchObject({
      rows: [1, 2],
      "io.oomol.open-connector/pagination": {
        pagesFetched: 2,
        hasMore: true,
        truncated: true,
        interruptionReason: "subrequest_limit",
        warning: "Automatic collection reached the hosting platform subrequest limit. Resume with nextCursor.",
      },
    });
    const structured = result.structuredContent as Record<string, unknown>;
    const pagination = structured["io.oomol.open-connector/pagination"] as Record<string, unknown>;
    expect(pagination.nextCursor).toMatch(/^ocmcp1\./);
  });

  it("returns an opaque cursor when a bounded offset collection has more data", async () => {
    const call = vi.fn(async (args: Record<string, unknown>): Promise<CallToolResult> => {
      const offset = Number(args.offset ?? 0);
      const body = { data: [offset, offset + 1], has_more: true, total: 10 };
      return { content: [{ type: "text", text: JSON.stringify(body) }], structuredContent: body };
    });
    const rule = {
      mode: "offset" as const,
      requestOffsetField: "offset",
      requestLimitField: "limit",
      responseItemsPath: "data",
      responseHasMorePath: "has_more",
      responseTotalPath: "total",
      maxPages: 5,
    };
    const first = await callPaginatedCustomMcpTool({
      toolName: "conversation_log",
      arguments: {},
      rule,
      control: { mode: "all", pageSize: 2, maxPages: 1 },
      call,
    });
    const meta = first._meta?.["io.oomol.open-connector/pagination"] as {
      nextCursor: string;
      truncated: boolean;
      remainingRecords: number;
    };
    expect(meta).toMatchObject({ truncated: true, remainingRecords: 8 });
    expect(meta.nextCursor).toMatch(/^ocmcp1\./);

    const resumed = await callPaginatedCustomMcpTool({
      toolName: "conversation_log",
      arguments: {},
      rule,
      control: { mode: "single", cursor: meta.nextCursor, pageSize: 2 },
      call,
    });
    expect(call).toHaveBeenLastCalledWith({ offset: 2, limit: 2 });
    expect(resumed._meta?.["io.oomol.open-connector/pagination"]).toMatchObject({ remainingRecords: 6 });
    const resumedStructured = resumed.structuredContent as Record<string, unknown>;
    expect(resumedStructured["io.oomol.open-connector/pagination"]).toMatchObject({
      remainingRecords: 6,
      hasMore: true,
    });
  });

  it("collects page-number results and resumes with the next page", async () => {
    const call = vi.fn(async (args: Record<string, unknown>): Promise<CallToolResult> => {
      const page = Number(args.page ?? 1);
      const body = {
        data: {
          rows: [`page-${page}-a`, `page-${page}-b`],
          next_page: `https://example.test?page=${page + 1}`,
          count: 10,
        },
      };
      return { content: [{ type: "text", text: JSON.stringify(body) }], structuredContent: body };
    });
    const rule = {
      mode: "page" as const,
      requestPageField: "page",
      requestLimitField: "per_page",
      responseItemsPath: "data.rows",
      responseNextPagePath: "data.next_page",
      responseTotalPath: "data.count",
      maxPages: 10,
    };

    const first = await callPaginatedCustomMcpTool({
      toolName: "list_rows",
      arguments: {},
      rule,
      control: { mode: "all", pageSize: 2, maxPages: 2 },
      call,
    });
    const structured = first.structuredContent as Record<string, unknown>;
    const pagination = structured["io.oomol.open-connector/pagination"] as Record<string, unknown>;
    expect(call).toHaveBeenNthCalledWith(1, { page: 1, per_page: 2 });
    expect(call).toHaveBeenNthCalledWith(2, { page: 2, per_page: 2 });
    expect(first.structuredContent).toMatchObject({
      data: { rows: ["page-1-a", "page-1-b", "page-2-a", "page-2-b"], next_page: null, count: 10 },
    });
    expect(pagination).toMatchObject({ mode: "page", pagesFetched: 2, recordCount: 4, hasMore: true });
    expect(pagination.nextCursor).toMatch(/^ocmcp1\./);

    await callPaginatedCustomMcpTool({
      toolName: "list_rows",
      arguments: {},
      rule,
      control: { mode: "single", cursor: String(pagination.nextCursor), pageSize: 2 },
      call,
    });
    expect(call).toHaveBeenLastCalledWith({ page: 3, per_page: 2 });
  });

  it("rejects remote pagination that cannot advance", async () => {
    const call = vi.fn(
      async (): Promise<CallToolResult> => ({
        content: [{ type: "text", text: '{"rows":[1],"next":"same"}' }],
        structuredContent: { rows: [1], next: "same" },
      }),
    );

    await expect(
      callPaginatedCustomMcpTool({
        toolName: "query_logs",
        arguments: { after: "same" },
        rule: {
          mode: "cursor",
          requestCursorField: "after",
          responseItemsPath: "rows",
          responseNextCursorPath: "next",
        },
        control: { mode: "all" },
        call,
      }),
    ).rejects.toThrow("did not advance");
    expect(call).toHaveBeenCalledOnce();
  });

  it("validates configured pagination contracts", () => {
    expect(
      readCustomMcpPaginationRules(
        JSON.stringify({
          messages: {
            mode: "cursor",
            requestCursorField: "after",
            responseItemsPath: "messages",
            responseNextCursorPath: "next",
          },
        }),
      ),
    ).toMatchObject({ messages: { mode: "cursor", responseItemsPath: "messages" } });
    expect(() => readCustomMcpPaginationRules('{"messages":{"mode":"cursor"}}')).toThrow(
      "requires mode and responseItemsPath",
    );
    expect(() =>
      readCustomMcpPaginationRules(
        '{"messages":{"mode":"offset","requestOffsetField":"offset","responseItemsPath":"__proto__.rows"}}',
      ),
    ).toThrow("safe dot-separated object path");
    expect(() => readCustomMcpPaginationRules('{"messages":{"mode":"page","responseItemsPath":"rows"}}')).toThrow(
      "page mode requires requestPageField",
    );
  });
});
