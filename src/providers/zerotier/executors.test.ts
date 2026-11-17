import { describe, expect, it, vi } from "vitest";
import { validateActionInput } from "../../core/validation.ts";
import { ProviderRequestError } from "../provider-runtime.ts";
import { zerotierActions } from "./actions.ts";
import { credentialValidators } from "./executors.ts";
import { zerotierV1BaseUrl, zerotierV2BaseUrl } from "./runtime.ts";

const jsonFetcher = (payload: unknown, assert?: (url: string, init?: RequestInit) => void): typeof fetch =>
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    assert?.(input.toString(), init);
    return Response.json(payload);
  }) as unknown as typeof fetch;

describe("ZeroTier credential validation", () => {
  it("validates v1 credentials via GET /status and identifies the token user", async () => {
    const status = { type: "CentralStatus", clock: 1, user: { id: "user-1", displayName: "Joe User" } };
    const fetcher = jsonFetcher(status, (url, init) => {
      expect(url).toBe(`${zerotierV1BaseUrl}/status`);
      expect(new Headers(init?.headers).get("authorization")).toBe("token v1-key");
    });
    const result = await credentialValidators.customCredential!(
      { values: { apiVersion: "v1", apiKey: "v1-key" } },
      { fetcher },
    );
    expect(result?.profile).toEqual({ accountId: "user-1", displayName: "Joe User" });
    expect(result?.metadata?.apiBaseUrl).toBe(zerotierV1BaseUrl);
  });

  it("rejects v1 credentials whose status carries no user", async () => {
    const fetcher = jsonFetcher({ type: "CentralStatus", clock: 1, user: null });
    const error = await credentialValidators.customCredential!(
      { values: { apiVersion: "v1", apiKey: "bad-key" } },
      { fetcher },
    ).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ProviderRequestError);
    expect((error as ProviderRequestError).status).toBe(401);
  });

  it("validates v2 credentials via GET /org and identifies the service account organization", async () => {
    const fetcher = jsonFetcher({ items: [{ id: "org1", name: "Acme Org" }] }, (url, init) => {
      expect(url).toBe(`${zerotierV2BaseUrl}/org`);
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer v2-key");
    });
    const result = await credentialValidators.customCredential!(
      { values: { apiVersion: "v2", apiKey: "v2-key" } },
      { fetcher },
    );
    expect(result?.profile).toEqual({ accountId: "org1", displayName: "Acme Org" });
    expect(result?.metadata?.apiBaseUrl).toBe(zerotierV2BaseUrl);
  });

  it("uses the configured orgId to pick among several v2 organizations", async () => {
    const orgs = {
      items: [
        { id: "org1", name: "Acme Org" },
        { id: "org2", name: "Beta Org" },
      ],
    };
    const result = await credentialValidators.customCredential!(
      { values: { apiVersion: "v2", apiKey: "v2-key", orgId: "org2" } },
      { fetcher: jsonFetcher(orgs) },
    );
    expect(result?.profile).toEqual({ accountId: "org2", displayName: "Beta Org" });
  });

  const routedFetcher = (routes: Record<string, () => Response>) =>
    vi.fn(async (input: RequestInfo | URL) => {
      const route = routes[input.toString()];
      if (!route) throw new Error(`unexpected request ${input.toString()}`);
      return route();
    }) as unknown as typeof fetch;

  it.each([
    { label: "one listed organization", items: [{ id: "org-real", name: "Real Org" }] },
    {
      label: "several listed organizations",
      items: [
        { id: "org1", name: "Acme Org" },
        { id: "org2", name: "Beta Org" },
      ],
    },
  ])("rejects a configured v2 orgId the key cannot reach with $label", async ({ items }) => {
    const fetcher = routedFetcher({
      [`${zerotierV2BaseUrl}/org`]: () => Response.json({ items }),
      [`${zerotierV2BaseUrl}/org/org-typo`]: () => Response.json({ message: "forbidden" }, { status: 403 }),
    });
    const error = await credentialValidators.customCredential!(
      { values: { apiVersion: "v2", apiKey: "v2-key", orgId: "org-typo" } },
      { fetcher },
    ).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ProviderRequestError);
    expect((error as ProviderRequestError).status).toBe(403);
  });

  it("looks up a configured v2 orgId that GET /org does not list", async () => {
    const fetcher = routedFetcher({
      [`${zerotierV2BaseUrl}/org`]: () => Response.json({ items: [{ id: "org1", name: "Acme Org" }] }),
      [`${zerotierV2BaseUrl}/org/org2`]: () => Response.json({ id: "org2", name: "Beta Org" }),
    });
    const result = await credentialValidators.customCredential!(
      { values: { apiVersion: "v2", apiKey: "v2-key", orgId: "org2" } },
      { fetcher },
    );
    expect(result?.profile).toEqual({ accountId: "org2", displayName: "Beta Org" });
  });

  it("leaves the v2 account id to the runtime default when no single organization is identified", async () => {
    const orgs = {
      items: [
        { id: "org1", name: "Acme Org" },
        { id: "org2", name: "Beta Org" },
      ],
    };
    const result = await credentialValidators.customCredential!(
      { values: { apiVersion: "v2", apiKey: "v2-key" } },
      { fetcher: jsonFetcher(orgs) },
    );
    expect(result?.profile).toEqual({ accountId: undefined, displayName: "ZeroTier New Central v2" });
  });
});

describe("ZeroTier action schemas", () => {
  const action = (name: string) => zerotierActions.find((candidate) => candidate.name === name)!;

  it("treats check_permissions as a read and accepts the v2 resource types", () => {
    const checkPermissions = action("check_permissions");
    const check = (resourceType: string) => ({ checks: [{ permission: "read", resourceType, resourceId: "r1" }] });

    expect(checkPermissions.operationType).toBe("read");
    expect(validateActionInput(checkPermissions, check("network_group")).valid).toBe(true);
    expect(validateActionInput(checkPermissions, check("networkGroup")).valid).toBe(false);
  });

  it("marks IAM and network permission revocation or replacement as destructive", () => {
    expect(action("replace_iam").operationType).toBe("destructive");
    expect(action("remove_iam").operationType).toBe("destructive");
    expect(action("set_network_user_permissions").operationType).toBe("destructive");
    expect(action("add_iam").operationType).toBe("write");
  });

  it("accepts only upstream IAM roles and email principals", () => {
    const addIam = action("add_iam");
    const input = (principal: string, roles: string[]) => ({
      resourceType: "org",
      resourceId: "org1",
      principal,
      roles,
    });
    expect(validateActionInput(addIam, input("alice@example.com", ["Admin", "NetworkViewer"])).valid).toBe(true);
    expect(validateActionInput(addIam, input("alice@example.com", [])).valid).toBe(false);
    expect(validateActionInput(addIam, input("alice@example.com", ["Superuser"])).valid).toBe(false);
    expect(validateActionInput(addIam, input("alice@example.com", ["Admin", "Admin"])).valid).toBe(false);
    expect(validateActionInput(addIam, input("alice", ["Admin"])).valid).toBe(false);
    expect(
      validateActionInput(action("replace_iam"), {
        resourceType: "network",
        resourceId: "nw1",
        assignments: [{ principal: "bob@example.com", roles: ["Owner"] }],
      }).valid,
    ).toBe(true);
    expect(
      validateActionInput(action("replace_iam"), {
        resourceType: "network",
        resourceId: "nw1",
        assignments: [{ principal: "bob@example.com", roles: ["Root"] }],
      }).valid,
    ).toBe(false);
  });

  it("limits principal searches to the user principal type", () => {
    const searchPrincipals = action("search_principals");
    const input = (principalType: string[]) => ({ orgId: "org1", search: "alice", principalType });
    expect(validateActionInput(searchPrincipals, input(["user"])).valid).toBe(true);
    expect(validateActionInput(searchPrincipals, input(["service_account"])).valid).toBe(false);
  });

  it("applies the upstream webhook limits", () => {
    const createWebhook = action("create_webhook");
    const webhook = { orgId: "org1", url: "https://hooks.example.com/zt", eventList: ["network.created"] };
    expect(validateActionInput(createWebhook, webhook).valid).toBe(true);
    expect(validateActionInput(createWebhook, { ...webhook, eventList: [] }).valid).toBe(false);
    expect(validateActionInput(createWebhook, { ...webhook, description: "x".repeat(256) }).valid).toBe(false);
    expect(validateActionInput(action("update_webhook"), { webhookId: "wh1", eventList: [] }).valid).toBe(false);

    const rotate = action("rotate_webhook_secret");
    expect(validateActionInput(rotate, { webhookId: "wh1", overlapHours: 0 }).valid).toBe(true);
    expect(validateActionInput(rotate, { webhookId: "wh1", overlapHours: 720 }).valid).toBe(true);
    expect(validateActionInput(rotate, { webhookId: "wh1", overlapHours: 721 }).valid).toBe(false);
    expect(validateActionInput(rotate, { webhookId: "wh1", overlapHours: -1 }).valid).toBe(false);
  });

  it("requires 10-hex-digit device IDs for the v2 batch member actions", () => {
    expect(validateActionInput(action("remove_members"), { networkId: "nw1", deviceIds: ["abcdef0123"] }).valid).toBe(
      true,
    );
    expect(validateActionInput(action("authorize_members"), { networkId: "nw1", deviceIds: [".."] }).valid).toBe(false);
    expect(
      validateActionInput(action("add_members"), { networkId: "nw1", members: [{ deviceId: "abcdef012" }] }).valid,
    ).toBe(false);
  });

  it("only requires deviceId for each member added in bulk", () => {
    const addMembers = action("add_members");
    expect(validateActionInput(addMembers, { networkId: "nw1", members: [{ deviceId: "abcdef0123" }] }).valid).toBe(
      true,
    );
    expect(validateActionInput(addMembers, { networkId: "nw1", members: [{ name: "laptop" }] }).valid).toBe(false);
  });

  it("requires a token value of at least 32 characters for add_user_token", () => {
    const addUserToken = action("add_user_token");
    expect(validateActionInput(addUserToken, { userId: "u1", tokenName: "ci" }).valid).toBe(false);
    expect(validateActionInput(addUserToken, { userId: "u1", tokenName: "ci", token: "short" }).valid).toBe(false);
    expect(validateActionInput(addUserToken, { userId: "u1", tokenName: "ci", token: "x".repeat(32) }).valid).toBe(
      true,
    );
  });
});
