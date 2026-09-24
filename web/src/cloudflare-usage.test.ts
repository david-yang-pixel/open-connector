import { describe, expect, it } from "vitest";
import { availableCloudflareMcpConnections, cloudflareQuotaPercent } from "./cloudflare-usage";

describe("Cloudflare usage display", () => {
  it("uses only configured Cloudflare MCP connections", () => {
    expect(
      availableCloudflareMcpConnections([
        { service: "cloudflare_worker", connectionName: "worker", authType: "custom_credential", metadata: {} },
        { service: "cloudflare_mcp", connectionName: "default", authType: "api_key", metadata: {} },
        { service: "cloudflare_mcp", connectionName: "primary", authType: "api_key", metadata: {} },
        {
          service: "cloudflare_mcp",
          connectionName: "removed",
          authType: "api_key",
          configured: false,
          metadata: {},
        },
      ]),
    ).toEqual(["primary", "default"]);
  });

  it("shows small and zero usage without rounding a nonzero amount to zero", () => {
    expect(cloudflareQuotaPercent({ used: 0, limit: 5_000_000 })).toBe("0.00%");
    expect(cloudflareQuotaPercent({ used: 90, limit: 100_000 })).toBe("0.09%");
    expect(cloudflareQuotaPercent({ used: 1, limit: 5_000_000 })).toBe("<0.01%");
  });
});
