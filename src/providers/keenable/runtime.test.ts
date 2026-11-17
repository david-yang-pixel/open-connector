import { expect, it, vi } from "vitest";
import { keenableActionHandlers } from "./runtime.ts";

it("routes keyless search through the public endpoint with its required app title", async () => {
  const payload = { results: [{ snippet: "text", acquired_at: "2026-10-21", extra: true }], query: "query" };
  const fetcher = vi.fn<typeof fetch>(async () => Response.json(payload));
  const input = { query: "query", max_results: 5, published_after: "7d", mode: "realtime" };
  expect(await keenableActionHandlers.search!(input, { fetcher })).toEqual(payload);
  const [url, init] = fetcher.mock.calls[0]!;
  expect(String(url)).toBe("https://api.keenable.ai/v1/search/public");
  expect(new Headers(init?.headers).get("x-keenable-title")).toBe("OpenConnector");
  expect(new Headers(init?.headers).has("x-api-key")).toBe(false);
  expect(JSON.parse(String(init?.body))).toEqual(input);
});
it("routes keyless fetch through the public endpoint and forwards query options", async () => {
  const fetcher = vi.fn<typeof fetch>(async () => Response.json({ content: "page", extra: 1 }));
  await keenableActionHandlers.fetch!({ url: "https://example.com", query_time: "2026-10-21" }, { fetcher });
  const url = new URL(String(fetcher.mock.calls[0]![0]));
  expect(url.pathname).toBe("/v1/fetch/public");
  expect(url.searchParams.get("url")).toBe("https://example.com");
  expect(url.searchParams.get("query_time")).toBe("2026-10-21");
});
it("does not turn a keyless 401 into credential recovery", async () => {
  const fetcher: typeof fetch = async () => Response.json({ error: "unavailable" }, { status: 401 });
  await expect(keenableActionHandlers.search!({ query: "query" }, { fetcher })).rejects.toMatchObject({
    code: "provider_error",
    status: 401,
  });
});
