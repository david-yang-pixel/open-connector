import type { McpOAuthClient } from "./mcp-oauth-store.ts";
import type { RuntimeDatabase } from "./runtime-database.ts";

import { describe, expect, it } from "vitest";

function client(overrides: Partial<McpOAuthClient> = {}): McpOAuthClient {
  return {
    clientId: crypto.randomUUID(),
    clientName: "ChatGPT",
    redirectUris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
    tokenEndpointAuthMethod: "client_secret_post",
    clientSecretHash: "secret-hash",
    createdAt: "2026-10-13T00:00:00.000Z",
    lastUsedAt: null,
    ...overrides,
  };
}

/** The MCP OAuth storage contract must hold on every persistent backend. */
export function mcpOAuthStoreTests(getDatabase: () => RuntimeDatabase): void {
  describe("MCP OAuth store", () => {
    it("registers clients up to the cap after pruning stale unused clients", async () => {
      const { mcpOAuthStore: store } = getDatabase();
      const stale = client({ createdAt: "2026-10-01T00:00:00.000Z" });
      const used = client({ createdAt: "2026-10-01T00:00:00.000Z", lastUsedAt: "2026-10-02T00:00:00.000Z" });
      const registration = { staleBefore: "2026-09-01T00:00:00.000Z", maxClients: 2 };
      expect(await store.registerClient({ ...registration, client: stale })).toBe(true);
      expect(await store.registerClient({ ...registration, client: used })).toBe(true);
      expect(await store.registerClient({ ...registration, client: client() })).toBe(false);

      const fresh = client();
      expect(
        await store.registerClient({ staleBefore: "2026-10-12T00:00:00.000Z", maxClients: 2, client: fresh }),
      ).toBe(true);
      expect(await store.getClient(stale.clientId)).toBeUndefined();
      expect(await store.getClient(used.clientId)).toEqual(used);
      expect(await store.getClient(fresh.clientId)).toEqual(fresh);
    });

    it("records client use and reads public clients without a secret", async () => {
      const { mcpOAuthStore: store } = getDatabase();
      const registered = client({ tokenEndpointAuthMethod: "none", clientSecretHash: null });
      await store.registerClient({ client: registered, staleBefore: registered.createdAt, maxClients: 10 });
      await store.markClientUsed(registered.clientId, "2026-10-13T01:00:00.000Z");
      expect(await store.getClient(registered.clientId)).toEqual({
        ...registered,
        lastUsedAt: "2026-10-13T01:00:00.000Z",
      });
    });

    it("consumes each state exactly once and keeps the issued token for replay detection", async () => {
      const { mcpOAuthStore: store } = getDatabase();
      const now = "2026-10-13T00:00:00.000Z";
      await store.putState({
        id: "code:a",
        value: '{"ok":true}',
        expiresAt: "2026-10-13T00:01:00.000Z",
        purgeBefore: now,
      });
      expect(await store.readState("code:a", now)).toBe('{"ok":true}');
      expect(await store.readIssuedTokenId("code:a")).toBeUndefined();

      const consumed = await Promise.all([store.consumeState("code:a", now), store.consumeState("code:a", now)]);
      expect(consumed.filter(Boolean)).toEqual(['{"ok":true}']);
      expect(await store.readState("code:a", now)).toBeUndefined();

      await store.recordIssuedToken("code:a", "token-1");
      expect(await store.readIssuedTokenId("code:a")).toBe("token-1");
    });

    it("ignores expired states and purges them on the next write", async () => {
      const { mcpOAuthStore: store } = getDatabase();
      await store.putState({
        id: "request:old",
        value: "{}",
        expiresAt: "2026-10-13T00:00:00.000Z",
        purgeBefore: "2026-10-12T00:00:00.000Z",
      });
      expect(await store.readState("request:old", "2026-10-13T00:00:00.000Z")).toBeUndefined();
      expect(await store.consumeState("request:old", "2026-10-13T00:00:00.000Z")).toBeUndefined();

      await store.putState({
        id: "request:new",
        value: "{}",
        expiresAt: "2026-10-14T00:00:00.000Z",
        purgeBefore: "2026-10-13T00:00:01.000Z",
      });
      expect(await store.consumeState("request:old", "2026-10-12T00:00:00.000Z")).toBeUndefined();
      expect(await store.readState("request:new", "2026-10-13T00:00:01.000Z")).toBe("{}");
    });
  });
}
