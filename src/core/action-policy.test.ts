import type { ActionDefinition } from "./types.ts";

import { describe, expect, it } from "vitest";
import { ActionPolicyService, parseActionPolicyList } from "./action-policy.ts";

const action: ActionDefinition = {
  id: "github.create_issue",
  service: "github",
  name: "create_issue",
  description: "Create an issue.",
  operationType: "write",
  requiredScopes: [],
  providerPermissions: [],
  inputSchema: { type: "object" },
  outputSchema: { type: "object" },
};
const defaultConnectionId = "11111111-1111-4111-8111-111111111111";
const workConnectionId = "22222222-2222-4222-8222-222222222222";
const otherConnectionId = "33333333-3333-4333-8333-333333333333";

describe("ActionPolicyService", () => {
  it("allows actions by default", () => {
    expect(new ActionPolicyService().createSnapshot().evaluate(action)).toEqual({ allowed: true, checks: [] });
  });

  it("enforces exact and provider-wide allowlists", () => {
    expect(new ActionPolicyService({ allowedActions: ["gmail.*"] }).createSnapshot().evaluate(action)).toMatchObject({
      allowed: false,
      code: "action_not_allowed",
    });
    expect(new ActionPolicyService({ allowedActions: ["github.*"] }).createSnapshot().evaluate(action)).toEqual({
      allowed: true,
      checks: [{ source: "deployment", outcome: "allow_match", rule: "github.*" }],
    });
    expect(
      new ActionPolicyService({ allowedActions: ["github.create_issue"] }).createSnapshot().evaluate(action),
    ).toEqual({
      allowed: true,
      checks: [{ source: "deployment", outcome: "allow_match", rule: "github.create_issue" }],
    });
  });

  it("supports bare wildcard to match all actions", () => {
    expect(new ActionPolicyService({ allowedActions: ["*"] }).createSnapshot().evaluate(action)).toEqual({
      allowed: true,
      checks: [{ source: "deployment", outcome: "allow_match", rule: "*" }],
    });
    expect(new ActionPolicyService({ blockedActions: ["*"] }).createSnapshot().evaluate(action)).toMatchObject({
      allowed: false,
      code: "action_blocked",
    });
  });

  it("matches action operation types without relying on action-name verbs", () => {
    const snapshot = new ActionPolicyService({
      blockedActions: ["@operation:write", "@operation:destructive"],
    }).createSnapshot();

    expect(snapshot.evaluate(action)).toMatchObject({
      allowed: false,
      code: "action_blocked",
      checks: [{ source: "deployment", outcome: "block_match", rule: "@operation:write" }],
    });
    expect(snapshot.evaluate({ ...action, id: "github.publish_release", operationType: "read" })).toEqual({
      allowed: true,
      checks: [],
    });
  });

  it("blocks actions even when they are also allowed", () => {
    expect(
      new ActionPolicyService({
        allowedActions: ["github.*"],
        blockedActions: ["github.create_issue"],
      })
        .createSnapshot()
        .evaluate(action),
    ).toMatchObject({
      allowed: false,
      code: "action_blocked",
    });
  });

  it("allows proxies by default", () => {
    expect(new ActionPolicyService().createSnapshot().evaluateProxy("github")).toEqual({ allowed: true, checks: [] });
  });

  it("ignores action policy when evaluating proxies", () => {
    expect(
      new ActionPolicyService({ allowedActions: ["github.get_current_user"] }).createSnapshot().evaluateProxy("github"),
    ).toEqual({
      allowed: true,
      checks: [],
    });
    expect(
      new ActionPolicyService({ blockedActions: ["github.delete_repository"] })
        .createSnapshot()
        .evaluateProxy("github"),
    ).toEqual({
      allowed: true,
      checks: [],
    });
    expect(new ActionPolicyService({ allowedActions: ["*"] }).createSnapshot().evaluateProxy("github")).toEqual({
      allowed: true,
      checks: [],
    });
    expect(new ActionPolicyService({ blockedActions: ["*"] }).createSnapshot().evaluateProxy("github")).toEqual({
      allowed: true,
      checks: [],
    });
  });

  it("ignores proxy policy when evaluating actions", () => {
    expect(new ActionPolicyService({ blockedProxies: ["*"] }).createSnapshot().evaluate(action)).toEqual({
      allowed: true,
      checks: [],
    });
    expect(new ActionPolicyService({ allowedProxies: ["slack"] }).createSnapshot().evaluate(action)).toEqual({
      allowed: true,
      checks: [],
    });
  });

  it("disables every proxy with a blocked wildcard", () => {
    expect(new ActionPolicyService({ blockedProxies: ["*"] }).createSnapshot().evaluateProxy("github")).toMatchObject({
      allowed: false,
      code: "proxy_blocked",
    });
  });

  it("enforces exact and wildcard proxy allowlists", () => {
    expect(
      new ActionPolicyService({ allowedProxies: ["slack"] }).createSnapshot().evaluateProxy("github"),
    ).toMatchObject({
      allowed: false,
      code: "proxy_not_allowed",
    });
    expect(new ActionPolicyService({ allowedProxies: ["github"] }).createSnapshot().evaluateProxy("github")).toEqual({
      allowed: true,
      checks: [{ source: "deployment", outcome: "allow_match", rule: "github" }],
    });
    expect(new ActionPolicyService({ allowedProxies: ["*"] }).createSnapshot().evaluateProxy("github")).toEqual({
      allowed: true,
      checks: [{ source: "deployment", outcome: "allow_match", rule: "*" }],
    });
  });

  it("blocks proxies even when they are also allowed", () => {
    expect(
      new ActionPolicyService({
        allowedProxies: ["*"],
        blockedProxies: ["github"],
      })
        .createSnapshot()
        .evaluateProxy("github"),
    ).toMatchObject({
      allowed: false,
      code: "proxy_blocked",
    });
  });

  it("parses comma-separated environment lists", () => {
    expect(parseActionPolicyList(" github.* , gmail.send_email ,, ")).toEqual(["github.*", "gmail.send_email"]);
  });

  it("intersects deployment, runtime, and token action allowlists", () => {
    const snapshot = new ActionPolicyService({ allowedActions: ["github.*"] }).createSnapshot(
      {
        allowedActions: ["github.create_issue"],
        blockedActions: [],
        allowedProxies: [],
        blockedProxies: [],
      },
      { allowedActions: ["github.*"], blockedActions: [], allowedProxies: [], allowedConnections: [] },
    );

    expect(snapshot.evaluate(action)).toEqual({
      allowed: true,
      checks: [
        { source: "deployment", outcome: "allow_match", rule: "github.*" },
        { source: "runtime", outcome: "allow_match", rule: "github.create_issue" },
        { source: "token", outcome: "allow_match", rule: "github.*" },
      ],
    });
  });

  it("reports the decisive layer when a lower allowlist rejects", () => {
    const snapshot = new ActionPolicyService({ allowedActions: ["github.*"] }).createSnapshot({
      allowedActions: ["gmail.*"],
      blockedActions: [],
      allowedProxies: [],
      blockedProxies: [],
    });

    expect(snapshot.evaluate(action)).toMatchObject({
      allowed: false,
      code: "action_not_allowed",
      checks: [
        { source: "deployment", outcome: "allow_match", rule: "github.*" },
        { source: "runtime", outcome: "allow_miss" },
      ],
    });
  });

  it("applies Runtime and token block rules before every allowlist", () => {
    const service = new ActionPolicyService({ allowedActions: ["*"] });
    const runtimeBlocked = service.createSnapshot({
      allowedActions: ["github.*"],
      blockedActions: ["github.create_issue"],
      allowedProxies: [],
      blockedProxies: [],
    });
    expect(runtimeBlocked.evaluate(action)).toMatchObject({
      allowed: false,
      code: "action_blocked",
      checks: [{ source: "runtime", outcome: "block_match", rule: "github.create_issue" }],
    });

    const tokenBlocked = service.createSnapshot(
      {
        allowedActions: ["github.*"],
        blockedActions: [],
        allowedProxies: [],
        blockedProxies: [],
      },
      {
        allowedActions: ["github.*"],
        blockedActions: ["github.create_issue"],
        allowedProxies: [],
        allowedConnections: [],
      },
    );
    expect(tokenBlocked.evaluate(action)).toMatchObject({
      allowed: false,
      checks: [{ source: "token", outcome: "block_match", rule: "github.create_issue" }],
    });
  });

  it("records only the first matching rule from each layer", () => {
    const decision = new ActionPolicyService({ allowedActions: ["github.*", "*"] })
      .createSnapshot({
        allowedActions: ["github.create_issue", "github.*"],
        blockedActions: [],
        allowedProxies: [],
        blockedProxies: [],
      })
      .evaluate(action);

    expect(decision).toEqual({
      allowed: true,
      checks: [
        { source: "deployment", outcome: "allow_match", rule: "github.*" },
        { source: "runtime", outcome: "allow_match", rule: "github.create_issue" },
      ],
    });
  });

  it("requires runtime tokens to grant proxies independently of action rules", () => {
    const service = new ActionPolicyService({ allowedProxies: ["github"] });
    const runtime = {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      blockedProxies: [],
    };

    expect(
      service
        .createSnapshot(runtime, {
          allowedActions: ["*"],
          blockedActions: [],
          allowedProxies: [],
          allowedConnections: [],
        })
        .evaluateProxy("github"),
    ).toMatchObject({
      allowed: false,
      code: "proxy_not_allowed",
      checks: [
        { source: "deployment", outcome: "allow_match", rule: "github" },
        { source: "token", outcome: "allow_miss" },
      ],
    });

    expect(
      service
        .createSnapshot(runtime, {
          allowedActions: ["gmail.send_email"],
          blockedActions: ["github.create_issue"],
          allowedProxies: ["github"],
          allowedConnections: [workConnectionId],
        })
        .evaluateProxy("github"),
    ).toEqual({
      allowed: true,
      checks: [
        { source: "deployment", outcome: "allow_match", rule: "github" },
        { source: "token", outcome: "allow_match", rule: "github" },
      ],
    });
  });

  it("keeps allowedConnections on the token policy without changing deployment rules", () => {
    const snapshot = new ActionPolicyService().createSnapshot(
      {
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        blockedProxies: [],
      },
      {
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [workConnectionId],
      },
    );

    expect(snapshot.state.deployment).not.toHaveProperty("allowedConnections");
    expect(snapshot.state.runtime).not.toHaveProperty("allowedConnections");
    expect(snapshot.evaluate(action)).toEqual({ allowed: true, checks: [] });
    expect(snapshot.evaluateProxy("github")).toMatchObject({
      allowed: false,
      code: "proxy_not_allowed",
    });
  });

  it("treats omitted and empty allowedConnections as unrestricted connection access", () => {
    const unrestricted = [
      new ActionPolicyService().createSnapshot(),
      new ActionPolicyService().createSnapshot(undefined, {
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
      }),
      new ActionPolicyService().createSnapshot(undefined, {
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [],
      }),
    ];

    for (const snapshot of unrestricted) {
      expect(snapshot.evaluateConnection()).toEqual({ allowed: true, checks: [] });
      expect(snapshot.evaluateConnection(workConnectionId)).toEqual({ allowed: true, checks: [] });
      expect(snapshot.evaluate(action)).toEqual({ allowed: true, checks: [] });
    }
  });

  it("matches restricted connections by exact stable IDs", () => {
    const snapshot = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: ["github.*"],
      blockedActions: [],
      allowedProxies: ["github"],
      allowedConnections: [workConnectionId, defaultConnectionId],
    });

    expect(snapshot.evaluateConnection(workConnectionId)).toEqual({
      allowed: true,
      checks: [{ source: "token", outcome: "allow_match", rule: workConnectionId }],
    });
    expect(snapshot.evaluateConnection(defaultConnectionId)).toEqual({
      allowed: true,
      checks: [{ source: "token", outcome: "allow_match", rule: defaultConnectionId }],
    });
    expect(snapshot.evaluateConnection(otherConnectionId)).toMatchObject({
      allowed: false,
      code: "connection_not_allowed",
      checks: [{ source: "token", outcome: "allow_miss" }],
    });
    expect(snapshot.evaluateConnection()).toMatchObject({
      allowed: false,
      code: "connection_not_allowed",
    });
    expect(snapshot.evaluate(action)).toMatchObject({ allowed: true });
    expect(snapshot.evaluateProxy("github")).toMatchObject({ allowed: true });
  });

  it("requires restricted tokens to grant the exact selected connection ID", () => {
    const snapshot = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [workConnectionId],
    });

    expect(snapshot.evaluateConnection()).toMatchObject({
      allowed: false,
      code: "connection_not_allowed",
    });
    expect(snapshot.evaluateConnection(defaultConnectionId)).toMatchObject({
      allowed: false,
      code: "connection_not_allowed",
    });
    expect(snapshot.evaluateConnection(workConnectionId)).toMatchObject({ allowed: true });
  });

  it("enforces per-connection read, write, full, and proxy access", () => {
    const readConnection = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["github"],
      connectionPermissions: [{ connectionId: workConnectionId, access: "read" }],
    });
    const writeConnection = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["github"],
      connectionPermissions: [{ connectionId: workConnectionId, access: "write" }],
    });
    const fullConnection = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["github"],
      connectionPermissions: [{ connectionId: workConnectionId, access: "full" }],
    });
    const readAction = { ...action, operationType: "read" as const };
    const destructiveAction = { ...action, operationType: "destructive" as const };

    expect(readConnection.evaluateConnection(workConnectionId, readAction)).toMatchObject({ allowed: true });
    expect(readConnection.evaluateConnection(workConnectionId, "discovery")).toMatchObject({ allowed: true });
    expect(writeConnection.evaluateConnection(workConnectionId, "discovery")).toMatchObject({ allowed: true });
    expect(readConnection.evaluateConnection(workConnectionId, action)).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(writeConnection.evaluateConnection(workConnectionId, action)).toMatchObject({ allowed: true });
    expect(writeConnection.evaluateConnection(workConnectionId, destructiveAction)).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(fullConnection.evaluateConnection(workConnectionId, destructiveAction)).toMatchObject({ allowed: true });
    expect(readConnection.evaluateConnection(workConnectionId, "proxy")).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(fullConnection.evaluateConnection(workConnectionId, "proxy")).toMatchObject({ allowed: true });
    expect(readConnection.evaluateConnection(otherConnectionId, readAction)).toMatchObject({
      allowed: false,
      code: "connection_not_allowed",
    });
  });

  it("enforces exact tool policies independently for each connection", () => {
    const firstConnection = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      connectionPermissions: [
        {
          connectionId: workConnectionId,
          access: "write",
          toolPolicy: { mode: "selected", allowedActionIds: ["github.create_issue"] },
          allowProxy: false,
        },
        {
          connectionId: otherConnectionId,
          access: "write",
          toolPolicy: { mode: "selected", allowedActionIds: ["github.other"] },
          allowProxy: false,
        },
      ],
    });
    const otherAction = { ...action, id: "github.other" };

    expect(firstConnection.evaluateConnection(workConnectionId, action)).toMatchObject({ allowed: true });
    expect(firstConnection.evaluateConnection(workConnectionId, otherAction)).toMatchObject({
      allowed: false,
      code: "connection_tool_not_allowed",
    });
    expect(firstConnection.evaluateConnection(otherConnectionId, action)).toMatchObject({
      allowed: false,
      code: "connection_tool_not_allowed",
    });
    expect(firstConnection.evaluateConnection(otherConnectionId, otherAction)).toMatchObject({ allowed: true });
  });

  it("applies operation risk before tool selection and keeps raw proxy access separate", () => {
    const readOnly = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["example"],
      connectionPermissions: [
        {
          connectionId: workConnectionId,
          access: "read",
          toolPolicy: { mode: "selected", allowedActionIds: ["github.create_issue"] },
          allowProxy: false,
        },
      ],
    });
    const proxyDisabled = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["example"],
      connectionPermissions: [{ connectionId: workConnectionId, access: "full", allowProxy: false }],
    });
    const proxyEnabled = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: ["example"],
      connectionPermissions: [{ connectionId: workConnectionId, access: "full", allowProxy: true }],
    });

    expect(readOnly.evaluateConnection(workConnectionId, action)).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(readOnly.evaluateConnection(workConnectionId, "proxy")).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(proxyDisabled.evaluateConnection(workConnectionId, "proxy")).toMatchObject({
      allowed: false,
      code: "connection_operation_not_allowed",
    });
    expect(proxyEnabled.evaluateConnection(workConnectionId, "proxy")).toMatchObject({ allowed: true });
  });

  it("lets Custom MCP transport actions reach the connection-scoped dynamic tool check", () => {
    const snapshot = new ActionPolicyService().createSnapshot(undefined, {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      connectionPermissions: [
        {
          connectionId: workConnectionId,
          access: "read",
          toolPolicy: { mode: "selected", allowedActionIds: ["custom_mcp.remote.query_logs"] },
        },
      ],
    });
    const wrapper = { ...action, id: "custom_mcp.call_tool", operationType: "read" as const };
    const selectedTool = { ...action, id: "custom_mcp.remote.query_logs", operationType: "read" as const };
    const unselectedTool = { ...action, id: "custom_mcp.remote.other", operationType: "read" as const };

    expect(snapshot.evaluateConnection(workConnectionId, wrapper)).toMatchObject({ allowed: true });
    expect(snapshot.evaluateConnection(workConnectionId, selectedTool)).toMatchObject({ allowed: true });
    expect(snapshot.evaluateConnection(workConnectionId, unselectedTool)).toMatchObject({
      allowed: false,
      code: "connection_tool_not_allowed",
    });
  });
});
