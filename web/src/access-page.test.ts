import type { ConnectionRecord, ProviderDefinition } from "./model";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AccessPage,
  allowedConnectionsFromDraft,
  ConnectionGrantEditor,
  connectionPermissionsFromDraft,
  connectionGrantOptions,
  createConnectionGrantDraft,
  createRecommendedConnectionGrantDraft,
  policyDraftFromRules,
  policyRulesFromDraft,
  runtimeTokenPolicyBody,
  TokenPermissionEditor,
} from "./access-page";

vi.mock("@embra/i18n/react", () => ({
  useTranslate() {
    return (key: string, values?: { names?: string }) => (values?.names === undefined ? key : `${key} ${values.names}`);
  },
}));

const githubDefaultId = "11111111-1111-4111-8111-111111111111";
const githubWorkId = "22222222-2222-4222-8222-222222222222";
const slackWorkId = "33333333-3333-4333-8333-333333333333";
const retiredConnectionId = "44444444-4444-4444-8444-444444444444";

describe("AccessPage", () => {
  it("shows deployment, Runtime, and token policy state", () => {
    const providers: ProviderDefinition[] = [
      {
        service: "github",
        displayName: "GitHub",
        categories: [],
        authTypes: [],
        auth: [],
        actions: [
          {
            id: "github.create_issue",
            service: "github",
            name: "create_issue",
            description: "Create an issue",
            requiredScopes: [],
            inputSchema: {},
            outputSchema: {},
            execution: {
              locallyExecutable: true,
              catalogOnly: false,
              requiredAuthTypes: [],
              noAuthRunnable: true,
              needsCredential: false,
            },
          },
        ],
      },
    ];
    const markup = renderToStaticMarkup(
      createElement(AccessPage, {
        providers,
        policy: {
          deployment: {
            allowedActions: ["github.*"],
            blockedActions: ["github.delete_repository"],
            allowedProxies: [],
            blockedProxies: ["*"],
          },
          runtime: {
            allowedActions: ["github.create_issue"],
            blockedActions: [],
            allowedProxies: ["github"],
            blockedProxies: [],
          },
        },
        tokens: [
          {
            id: "token-1",
            name: "Issue bot",
            allowedActions: ["github.*"],
            blockedActions: ["github.delete_repository"],
            allowedProxies: ["github"],
            allowedConnections: [],
            createdAt: "2026-07-20T00:00:00.000Z",
          },
          {
            id: "token-2",
            name: "Work bot",
            allowedActions: [],
            blockedActions: [],
            allowedProxies: [],
            allowedConnections: [githubWorkId, slackWorkId, retiredConnectionId],
            createdAt: "2026-07-20T00:00:00.000Z",
          },
        ],
        connections: [
          { id: githubDefaultId, service: "github", connectionName: "default", authType: "oauth2", metadata: {} },
          { id: githubWorkId, service: "github", connectionName: "work", authType: "oauth2", metadata: {} },
          { id: slackWorkId, service: "slack", connectionName: "work", authType: "oauth2", metadata: {} },
        ],
        onRefresh: vi.fn(),
      }),
    );

    expect(markup).toContain("access.policy.baseline.title");
    expect(markup).toContain("access.policy.deploymentSummary.title");
    expect(markup).toContain("access.policy.runtimeSummary.title");
    expect(markup).not.toContain("github.create_issue");
    expect(markup).toContain("github.delete_repository");
    expect(markup).toContain("Issue bot");
    expect(markup).toContain("Work bot");
    expect(markup).toContain("access.policy.connectionsUnrestricted");
    expect(markup).toContain("access.policy.connectionsRestricted");
    expect(markup).toContain("work");
    expect(markup).toContain("token-policy-connections");
    expect(markup).toContain("GitHub · work, slack · work +1");
    expect(markup).toContain(`title="GitHub · work, slack · work, ${retiredConnectionId}"`);
    expect(markup).not.toContain(`<code>${githubWorkId}</code>`);
    expect(markup).toContain("access.policy.edit");
    expect(markup).toContain('role="combobox"');
    expect(markup).not.toContain("<datalist");
    expect(markup).not.toContain("access.policy.tester.trace");
    expect(markup).not.toContain("access.policy.editor.title");
  });

  it("treats omitted and empty allowedConnections as unrestricted token grants", () => {
    expect(createConnectionGrantDraft()).toEqual({
      mode: "unrestricted",
      ids: [],
      accessById: {},
      toolPolicyById: {},
      allowProxyById: {},
    });
    expect(createConnectionGrantDraft([])).toEqual({
      mode: "unrestricted",
      ids: [],
      accessById: {},
      toolPolicyById: {},
      allowProxyById: {},
    });
    expect(
      allowedConnectionsFromDraft({
        mode: "unrestricted",
        ids: [githubWorkId],
        accessById: { [githubWorkId]: "read" },
        toolPolicyById: {},
        allowProxyById: {},
      }),
    ).toEqual([]);
    expect(
      runtimeTokenPolicyBody(
        { allowedActions: ["github.*"], blockedActions: [], allowedProxies: [] },
        {
          mode: "unrestricted",
          ids: [githubWorkId],
          accessById: { [githubWorkId]: "read" },
          toolPolicyById: {},
          allowProxyById: {},
        },
      ),
    ).toEqual({
      allowedActions: ["github.*"],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
      connectionPermissions: [],
    });
  });

  it("keeps restricted connection grants as exact stable connection IDs", () => {
    expect(createConnectionGrantDraft([githubWorkId, githubDefaultId])).toEqual({
      mode: "restricted",
      ids: [githubWorkId, githubDefaultId],
      accessById: { [githubWorkId]: "full", [githubDefaultId]: "full" },
      toolPolicyById: {},
      allowProxyById: {},
    });
    expect(
      runtimeTokenPolicyBody(
        { allowedActions: [], blockedActions: [], allowedProxies: ["github"] },
        {
          mode: "restricted",
          ids: [githubWorkId],
          accessById: { [githubWorkId]: "read" },
          toolPolicyById: {},
          allowProxyById: {},
        },
      ),
    ).toEqual({
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [githubWorkId],
      connectionPermissions: [{ connectionId: githubWorkId, access: "read", allowProxy: false }],
    });
  });

  it("defaults new token grants to read-only for every current connection", () => {
    const draft = createRecommendedConnectionGrantDraft([
      { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
      { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
    ]);

    expect(draft).toEqual({
      mode: "restricted",
      ids: [githubDefaultId, slackWorkId],
      accessById: { [githubDefaultId]: "read", [slackWorkId]: "read" },
      toolPolicyById: {},
      allowProxyById: {},
    });
    expect(connectionPermissionsFromDraft(draft)).toEqual([
      { connectionId: githubDefaultId, access: "read", allowProxy: false },
      { connectionId: slackWorkId, access: "read", allowProxy: false },
    ]);
    expect(
      runtimeTokenPolicyBody({ allowedActions: [], blockedActions: [], allowedProxies: [] }, draft, [
        { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
        { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
      ]),
    ).toMatchObject({ allowedActions: ["github.*", "slack.*"] });
  });

  it("serializes per-connection tool scope and derives raw proxy grants only from explicit full access", () => {
    const draft = createRecommendedConnectionGrantDraft([
      { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
      { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
    ]);
    draft.accessById[githubDefaultId] = "full";
    draft.allowProxyById[githubDefaultId] = true;
    draft.accessById[slackWorkId] = "write";
    draft.toolPolicyById[slackWorkId] = {
      mode: "selected",
      allowedActionIds: ["slack.search_messages", "slack.send_message"],
    };

    expect(
      runtimeTokenPolicyBody({ allowedActions: [], blockedActions: [], allowedProxies: ["ignored"] }, draft, [
        { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
        { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
      ]),
    ).toMatchObject({
      allowedProxies: ["github"],
      connectionPermissions: [
        { connectionId: githubDefaultId, access: "full", allowProxy: true },
        {
          connectionId: slackWorkId,
          access: "write",
          allowProxy: false,
          toolPolicy: {
            mode: "selected",
            allowedActionIds: ["slack.search_messages", "slack.send_message"],
          },
        },
      ],
    });
  });

  it("builds one token grant option for each current credential connection", () => {
    const connections: ConnectionRecord[] = [
      { id: githubDefaultId, service: "github", authType: "oauth2", metadata: {} },
      { id: githubWorkId, service: "github", connectionName: " work ", authType: "oauth2", metadata: {} },
      { id: slackWorkId, service: "slack", connectionName: "work", authType: "oauth2", metadata: {} },
      {
        id: "clock:virtual",
        service: "clock",
        connectionName: "virtual",
        authType: "no_auth",
        virtual: true,
        metadata: {},
      },
    ];

    expect(
      connectionGrantOptions(connections, [
        { service: "github", displayName: "GitHub", categories: [], authTypes: [], auth: [], actions: [] },
      ]),
    ).toEqual([
      {
        id: githubDefaultId,
        service: "github",
        name: "default",
        displayName: undefined,
        provider: "GitHub",
        toolCount: undefined,
        isDefault: true,
      },
      {
        id: githubWorkId,
        service: "github",
        name: "work",
        displayName: undefined,
        provider: "GitHub",
        toolCount: undefined,
        isDefault: false,
      },
      {
        id: slackWorkId,
        service: "slack",
        name: "work",
        displayName: undefined,
        provider: "slack",
        toolCount: undefined,
        isDefault: false,
      },
    ]);
  });

  it("makes unrestricted and restricted connection grants explicit in the token editor", () => {
    const unrestricted = renderToStaticMarkup(
      createElement(ConnectionGrantEditor, {
        draft: createConnectionGrantDraft(),
        options: [
          { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
          { id: githubWorkId, service: "github", name: "work", provider: "GitHub" },
          { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
        ],
        onChange: vi.fn(),
      }),
    );
    const restricted = renderToStaticMarkup(
      createElement(ConnectionGrantEditor, {
        draft: createConnectionGrantDraft([githubWorkId]),
        options: [
          { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
          { id: githubWorkId, service: "github", name: "work", provider: "GitHub" },
          { id: slackWorkId, service: "slack", name: "work", provider: "Slack" },
        ],
        onChange: vi.fn(),
      }),
    );

    expect(unrestricted).toContain("access.policy.tools.legacyUnrestricted");
    expect(unrestricted).toContain("access.policy.tools.convertLegacy");
    expect(unrestricted).not.toContain("access.policy.editor.connectionsList");
    expect(restricted).toContain("access.policy.editor.connectionsList");
    expect(restricted).toContain("access.policy.editor.connectionsDefaultHint");
    expect(restricted).toContain("work");
    expect(restricted).toContain("GitHub");
    expect(restricted).toContain("Slack");
    expect(restricted).toContain('type="checkbox"');
    expect(restricted).toContain(`value="${githubWorkId}"`);
    expect(restricted).toContain(`value="${slackWorkId}"`);
    expect(restricted).not.toContain('role="combobox"');
  });

  it("keeps a granted connection visible when it no longer exists", () => {
    const markup = renderToStaticMarkup(
      createElement(ConnectionGrantEditor, {
        draft: createConnectionGrantDraft([retiredConnectionId]),
        options: [],
        onChange: vi.fn(),
      }),
    );

    expect(markup).toContain(retiredConnectionId);
    expect(markup).toContain("access.policy.editor.unknownRule");
    expect(markup).toContain('type="checkbox"');
  });

  it("keeps connection and tool permissions primary while advanced rules stay collapsed", () => {
    const markup = renderToStaticMarkup(
      createElement(TokenPermissionEditor, {
        draft: {
          rules: { allowedActions: [], blockedActions: [], allowedProxies: [], blockedProxies: [] },
          actionAllowMode: "unrestricted",
          proxyAllowMode: "unrestricted",
        },
        providers: [],
        connections: createRecommendedConnectionGrantDraft([
          { id: githubDefaultId, service: "github", name: "default", provider: "GitHub" },
        ]),
        connectionOptions: [{ id: githubDefaultId, service: "github", name: "default", provider: "GitHub" }],
        onDraftChange: vi.fn(),
        onConnectionsChange: vi.fn(),
      }),
    );

    expect(markup).not.toContain('data-slot="tabs-trigger"');
    expect(markup).toContain("access.policy.tools.connectionPermissions");
    expect(markup).toContain("access.policy.tools.allTools");
    expect(markup).toContain("access.policy.tools.advancedRules");
  });

  it("serializes one policy rule per non-empty trimmed line", () => {
    const rules = policyRulesFromDraft({
      allowedActions: " github.*\n\ngithub.create_issue ",
      blockedActions: "",
      allowedProxies: " github ",
      blockedProxies: "*\n",
    });

    expect(rules).toEqual({
      allowedActions: ["github.*", "github.create_issue"],
      blockedActions: [],
      allowedProxies: ["github"],
      blockedProxies: ["*"],
    });
    expect(policyDraftFromRules(rules)).toEqual({
      allowedActions: "github.*\ngithub.create_issue",
      blockedActions: "",
      allowedProxies: "github",
      blockedProxies: "*",
    });
  });
});
