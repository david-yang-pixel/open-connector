import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { afterEach, expect, it, vi } from "vitest";
import * as z from "zod/v4";
import { callMcpTool } from "./mcp-tools.ts";

afterEach(() => vi.useRealTimers());

it.each([
  ["allows a slow tool to finish within its configured request timeout", 130_000, undefined, true],
  ["keeps the default provider timeout", undefined, undefined, false],
  ["honors a shorter configured request timeout", 10_000, undefined, false],
  ["honors caller cancellation before a longer request timeout", 130_000, 5_000, false],
] as const)("%s", async (_name, requestTimeoutMs, cancelAfterMs, shouldFinish) => {
  vi.useFakeTimers();
  const started = Promise.withResolvers<void>();
  const controller = new AbortController();
  const handler = createMcpHandler(
    () => {
      const server = new McpServer({ name: "slow-tool", version: "1.0.0" });
      server.registerTool("query", { inputSchema: z.object({}) }, async () => {
        started.resolve();
        await new Promise<void>((resolve) => setTimeout(resolve, 90_000));
        return { content: [{ type: "text", text: "finished" }], structuredContent: { finished: true } };
      });
      return server;
    },
    { legacy: "stateless", responseMode: "json" },
  );
  const elapsedMs = shouldFinish ? 90_000 : (cancelAfterMs ?? requestTimeoutMs ?? 30_000);
  try {
    let settled = false;
    const result = callMcpTool({
      endpoint: "https://example.com/mcp",
      service: "Example",
      fetcher: (input, init) => handler.fetch(new Request(input, init)),
      toolName: "query",
      arguments: {},
      requestTimeoutMs,
      signal: controller.signal,
    }).then(
      (value) => {
        settled = true;
        return { ok: true, value };
      },
      (error: unknown) => {
        settled = true;
        return { ok: false, error };
      },
    );
    await started.promise;
    if (cancelAfterMs !== undefined) setTimeout(() => controller.abort(), cancelAfterMs);
    await vi.advanceTimersByTimeAsync(elapsedMs - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
    if (shouldFinish) expect(await result).toEqual({ ok: true, value: { finished: true } });
    else expect(await result).toMatchObject({ ok: false, error: { code: "provider_error", status: 504 } });
  } finally {
    await vi.advanceTimersByTimeAsync(90_000 - elapsedMs);
    await handler.close();
  }
});
