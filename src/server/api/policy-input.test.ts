import { describe, expect, it } from "vitest";
import {
  connectionToolListMaxItems,
  policyRuleListMaxItems,
  policyRuleMaxBytes,
  readRuntimePolicyRules,
  readTokenPolicy,
} from "./policy-input.ts";

describe("policy input", () => {
  it("trims and stably deduplicates complete Runtime policy rules", () => {
    expect(
      readRuntimePolicyRules({
        allowedActions: [" github.* ", "github.*", "github.create_issue"],
        blockedActions: [],
        allowedProxies: [" github ", "github"],
        blockedProxies: ["*"],
      }),
    ).toEqual({
      allowedActions: ["github.*", "github.create_issue"],
      blockedActions: [],
      allowedProxies: ["github"],
      blockedProxies: ["*"],
    });
  });

  it("allows omitted token rules only during creation", () => {
    expect(readTokenPolicy({}, true)).toEqual({
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
      connectionPermissions: [],
    });
    expect(() => readTokenPolicy({})).toThrow("allowedActions must be an array of strings");
  });

  it("accepts action operation rules and rejects unknown operation names", () => {
    expect(
      readTokenPolicy({
        allowedActions: ["@operation:read"],
        blockedActions: ["@operation:write", "@operation:destructive"],
        allowedProxies: [],
        allowedConnections: [],
      }),
    ).toMatchObject({
      allowedActions: ["@operation:read"],
      blockedActions: ["@operation:write", "@operation:destructive"],
    });
    expect(() =>
      readTokenPolicy({ allowedActions: ["@operation:unknown"], blockedActions: [], allowedProxies: [] }),
    ).toThrow("contains an invalid action rule");
  });

  it("treats omitted and empty allowedConnections as unrestricted on create", () => {
    expect(readTokenPolicy({ allowedActions: [], blockedActions: [], allowedProxies: [] }, true)).toEqual({
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
      connectionPermissions: [],
    });
    expect(
      readTokenPolicy({ allowedActions: [], blockedActions: [], allowedProxies: [], allowedConnections: [] }),
    ).toEqual({
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
      connectionPermissions: [],
    });
  });

  it("requires allowedConnections on update so a PUT cannot drop an existing grant", () => {
    expect(() => readTokenPolicy({ allowedActions: [], blockedActions: [], allowedProxies: [] })).toThrow(
      "allowedConnections must be an array of strings",
    );
  });

  it("trims and stably deduplicates allowed connection IDs", () => {
    expect(
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [" connection-work ", "connection-work", "01J0CONNECTIONPERSONAL"],
      }),
    ).toEqual({
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: ["connection-work", "01J0CONNECTIONPERSONAL"],
      connectionPermissions: [],
    });
  });

  it("validates per-connection access levels and rejects duplicate grants", () => {
    expect(
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [],
        connectionPermissions: [
          { connectionId: " work ", access: "read" },
          { connectionId: "personal", access: "full" },
        ],
      }),
    ).toMatchObject({
      connectionPermissions: [
        { connectionId: "work", access: "read" },
        { connectionId: "personal", access: "full" },
      ],
    });
    expect(() =>
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [],
        connectionPermissions: [
          { connectionId: "work", access: "read" },
          { connectionId: "work", access: "write" },
        ],
      }),
    ).toThrow("duplicate connection ID");
    expect(() =>
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [],
        connectionPermissions: [{ connectionId: "work", access: "admin" }],
      }),
    ).toThrow("must be read, write, or full");
  });

  it("accepts connection-scoped selected and excluded tool policies", () => {
    expect(
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [],
        connectionPermissions: [
          {
            connectionId: "work",
            access: "write",
            allowProxy: false,
            toolPolicy: {
              mode: "selected",
              allowedActionIds: ["github.get_repository", "github.create_issue", "github.get_repository"],
            },
          },
          {
            connectionId: "archive",
            access: "read",
            toolPolicy: { mode: "all", excludedActionIds: ["github.get_audit_log"] },
          },
        ],
      }),
    ).toMatchObject({
      connectionPermissions: [
        {
          connectionId: "work",
          access: "write",
          allowProxy: false,
          toolPolicy: {
            mode: "selected",
            allowedActionIds: ["github.get_repository", "github.create_issue"],
          },
        },
        {
          connectionId: "archive",
          access: "read",
          toolPolicy: { mode: "all", excludedActionIds: ["github.get_audit_log"] },
        },
      ],
    });
  });

  it("rejects empty selected tool policies, wildcard IDs, invalid proxy flags, and oversized tool lists", () => {
    const base = {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
    };
    expect(() =>
      readTokenPolicy({
        ...base,
        connectionPermissions: [
          { connectionId: "work", access: "read", toolPolicy: { mode: "selected", allowedActionIds: [] } },
        ],
      }),
    ).toThrow("at least one allowed action ID");
    expect(() =>
      readTokenPolicy({
        ...base,
        connectionPermissions: [
          {
            connectionId: "work",
            access: "read",
            toolPolicy: { mode: "selected", allowedActionIds: ["github.*"] },
          },
        ],
      }),
    ).toThrow("exact action IDs");
    expect(() =>
      readTokenPolicy({
        ...base,
        connectionPermissions: [{ connectionId: "work", access: "full", allowProxy: "yes" }],
      }),
    ).toThrow("allowProxy must be a boolean");
    expect(() =>
      readTokenPolicy({
        ...base,
        connectionPermissions: [
          {
            connectionId: "work",
            access: "read",
            toolPolicy: {
              mode: "selected",
              allowedActionIds: Array.from(
                { length: connectionToolListMaxItems + 1 },
                (_, index) => `github.action_${index}`,
              ),
            },
          },
        ],
      }),
    ).toThrow(`more than ${connectionToolListMaxItems}`);
  });

  it.each(["", " "])("rejects empty allowedConnections value %s", (connectionId) => {
    expect(() =>
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: [connectionId],
      }),
    ).toThrow(/empty/);
  });

  it("enforces allowedConnections item and UTF-8 byte limits", () => {
    const connectionIds = Array.from({ length: policyRuleListMaxItems + 1 }, (_, index) => `connection-${index}`);
    expect(() =>
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: connectionIds,
      }),
    ).toThrow(`more than ${policyRuleListMaxItems}`);
    expect(() =>
      readTokenPolicy({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: [],
        allowedConnections: ["a".repeat(policyRuleMaxBytes + 1)],
      }),
    ).toThrow(`${policyRuleMaxBytes} UTF-8 bytes`);
  });

  it.each(["github*", "github.*.issues", "github.", ".create_issue", "github create_issue"])(
    "rejects invalid action rule %s",
    (rule) => {
      expect(() => readTokenPolicy({ allowedActions: [rule], blockedActions: [], allowedProxies: [] })).toThrow(
        "contains an invalid action rule",
      );
    },
  );

  it("rejects invalid proxy wildcards", () => {
    expect(() =>
      readRuntimePolicyRules({
        allowedActions: [],
        blockedActions: [],
        allowedProxies: ["git*"],
        blockedProxies: [],
      }),
    ).toThrow("contains an invalid proxy rule");
    expect(() => readTokenPolicy({ allowedActions: [], blockedActions: [], allowedProxies: ["git*"] })).toThrow(
      "contains an invalid proxy rule",
    );
    expect(() =>
      readTokenPolicy({ allowedActions: [], blockedActions: [], allowedProxies: [], blockedProxies: ["github"] }),
    ).toThrow("does not support proxy block rules");
  });

  it("enforces normalized item and UTF-8 byte limits", () => {
    const rules = Array.from({ length: policyRuleListMaxItems + 1 }, (_, index) => `github.action_${index}`);
    expect(() => readTokenPolicy({ allowedActions: rules, blockedActions: [], allowedProxies: [] })).toThrow(
      `more than ${policyRuleListMaxItems}`,
    );
    expect(() =>
      readTokenPolicy({
        allowedActions: [`github.${"界".repeat(policyRuleMaxBytes)}`],
        blockedActions: [],
        allowedProxies: [],
      }),
    ).toThrow(`${policyRuleMaxBytes} UTF-8 bytes`);
  });
});
