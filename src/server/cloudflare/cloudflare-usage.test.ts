import { describe, expect, it, vi } from "vitest";
import { CloudflareUsageError, loadCloudflareUsage } from "./cloudflare-usage.ts";

const accountId = "a9c9046b7c7a5337e3eba67622ec303d";
const now = new Date("2026-09-24T02:23:33.000Z");

describe("Cloudflare usage", () => {
  it("sums account-wide Worker and D1 rows for the current UTC day", async () => {
    const fetcher = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer private-token");
      if (String(request).includes("/accounts?")) {
        return Response.json({
          success: true,
          result: [{ id: accountId, name: "Example account" }],
          result_info: { total_pages: 1 },
        });
      }
      const query = (JSON.parse(String(init?.body)) as { query: string }).query;
      expect(query).toContain('date_geq: "2026-09-24"');
      expect(query).toContain('datetime_geq: "2026-09-24T00:00:00.000Z"');
      expect(query).toContain(`accountTag: "${accountId}"`);
      return Response.json({
        data: {
          viewer: {
            accounts: [
              {
                d1AnalyticsAdaptiveGroups: [
                  { sum: { rowsRead: 2000, rowsWritten: 100 } },
                  { sum: { rowsRead: 826, rowsWritten: 12 } },
                ],
                workersInvocationsAdaptive: [{ sum: { requests: 80 } }, { sum: { requests: 10 } }],
              },
            ],
          },
        },
        errors: [],
      });
    });

    await expect(loadCloudflareUsage("private-token", { fetcher, now })).resolves.toEqual({
      periodStart: "2026-09-24T00:00:00.000Z",
      observedAt: "2026-09-24T02:23:33.000Z",
      accounts: [
        {
          accountId,
          accountName: "Example account",
          workerRequests: { used: 90, limit: 100_000 },
          d1RowsRead: { used: 2826, limit: 5_000_000 },
          d1RowsWritten: { used: 112, limit: 100_000 },
        },
      ],
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not report partial usage when Cloudflare returns an analytics error", async () => {
    const fetcher = vi.fn(async (request: RequestInfo | URL) =>
      Response.json(
        String(request).includes("/accounts?")
          ? { success: true, result: [{ id: accountId, name: "Example account" }] }
          : { data: null, errors: [{ message: "Analytics permission denied" }] },
      ),
    );
    await expect(loadCloudflareUsage("private-token", { fetcher, now })).rejects.toThrow(CloudflareUsageError);
  });

  it("does not silently omit additional account pages", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        success: true,
        result: [{ id: accountId, name: "Example account" }],
        result_info: { total_pages: 2 },
      }),
    );
    await expect(loadCloudflareUsage("private-token", { fetcher, now })).rejects.toThrow(/pagination/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not display missing analytics fields as zero usage", async () => {
    const fetcher = vi.fn(async (request: RequestInfo | URL) =>
      Response.json(
        String(request).includes("/accounts?")
          ? { success: true, result: [{ id: accountId, name: "Example account" }] }
          : { data: { viewer: { accounts: [{ d1AnalyticsAdaptiveGroups: [] }] } } },
      ),
    );
    await expect(loadCloudflareUsage("private-token", { fetcher, now })).rejects.toThrow(/incomplete/);
  });

  it("rejects a failed account response even when Cloudflare returns HTTP 200", async () => {
    const fetcher = vi.fn(async () => Response.json({ success: false, result: [] }));
    await expect(loadCloudflareUsage("private-token", { fetcher, now })).rejects.toThrow(/invalid account list/);
  });
});
