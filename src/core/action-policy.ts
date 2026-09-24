import type { ActionDefinition } from "./types.ts";

export type PolicySource = "deployment" | "runtime" | "token";

export type PolicyErrorCode =
  | "action_not_allowed"
  | "action_blocked"
  | "proxy_not_allowed"
  | "proxy_blocked"
  | "connection_not_allowed"
  | "connection_operation_not_allowed"
  | "connection_tool_not_allowed";

export interface PolicyCheck {
  source: PolicySource;
  outcome: "allow_match" | "block_match" | "allow_miss";
  rule?: string;
}

export type ActionPolicyDecision =
  | { allowed: true; checks: PolicyCheck[] }
  | {
      allowed: false;
      code: PolicyErrorCode;
      message: string;
      checks: PolicyCheck[];
    };

export interface PolicyRules {
  allowedActions: string[];
  blockedActions: string[];
  allowedProxies: string[];
  blockedProxies: string[];
}

export type ConnectionAccessLevel = "read" | "write" | "full";

export type ConnectionToolPolicy =
  | { mode: "all"; excludedActionIds: string[] }
  | { mode: "selected"; allowedActionIds: string[] };

export interface ConnectionPermissionGrant {
  connectionId: string;
  access: ConnectionAccessLevel;
  toolPolicy?: ConnectionToolPolicy;
  /** Raw provider proxy access is separate because it bypasses action-level tool selection. */
  allowProxy?: boolean;
}

export interface TokenPolicy {
  allowedActions: string[];
  blockedActions: string[];
  allowedProxies: string[];
  allowedConnections?: string[];
  connectionPermissions?: ConnectionPermissionGrant[];
}

export interface RuntimePolicyState {
  deployment: PolicyRules;
  runtime: PolicyRules;
  updatedAt?: string;
}

export interface ActionPolicyConfig {
  allowedActions?: string[];
  blockedActions?: string[];
  allowedProxies?: string[];
  blockedProxies?: string[];
}

interface CompiledRule {
  pattern: string;
  matches(value: string): boolean;
}

interface CompiledActionRule {
  pattern: string;
  matches(action: ActionDefinition): boolean;
}

interface CompiledLayer {
  source: PolicySource;
  allowedActions: CompiledActionRule[];
  blockedActions: CompiledActionRule[];
  allowedProxies: CompiledRule[];
  blockedProxies: CompiledRule[];
}

/**
 * Immutable policy view shared by every policy consumer in one request.
 */
export class ActionPolicySnapshot {
  readonly state: RuntimePolicyState;
  private readonly layers: CompiledLayer[];
  private readonly proxyLayers: CompiledLayer[];
  private readonly tokenProxyRules?: CompiledRule[];
  private readonly allowedConnections: readonly string[];
  private readonly connectionPermissions: ReadonlyMap<string, ConnectionPermissionGrant>;

  constructor(deployment: PolicyRules, runtime: PolicyRules, token?: TokenPolicy, updatedAt?: string) {
    const deploymentRules = immutablePolicyRules(deployment);
    const runtimeRules = immutablePolicyRules(runtime);
    this.state = Object.freeze({ deployment: deploymentRules, runtime: runtimeRules, updatedAt });
    this.proxyLayers = [compileLayer("deployment", deploymentRules), compileLayer("runtime", runtimeRules)];
    this.layers = [...this.proxyLayers];
    this.allowedConnections = Object.freeze([...(token?.allowedConnections ?? [])]);
    this.connectionPermissions = new Map(
      (token?.connectionPermissions ?? []).map((grant) => [grant.connectionId, grant]),
    );
    if (token) {
      const tokenRules = immutablePolicyRules({
        allowedActions: token.allowedActions,
        blockedActions: token.blockedActions,
        allowedProxies: token.allowedProxies,
        blockedProxies: [],
      });
      const tokenLayer = compileLayer("token", tokenRules);
      this.layers.push(tokenLayer);
      this.tokenProxyRules = tokenLayer.allowedProxies;
    }
  }

  evaluate(action: ActionDefinition): ActionPolicyDecision {
    for (const layer of this.layers) {
      const blocked = layer.blockedActions.find((rule) => rule.matches(action));
      if (blocked) {
        return {
          allowed: false,
          code: "action_blocked",
          message: `${action.id} is blocked by the local action policy.`,
          checks: [{ source: layer.source, outcome: "block_match", rule: blocked.pattern }],
        };
      }
    }

    const checks: PolicyCheck[] = [];
    for (const layer of this.layers) {
      if (layer.allowedActions.length === 0) {
        continue;
      }
      const allowed = layer.allowedActions.find((rule) => rule.matches(action));
      if (!allowed) {
        return {
          allowed: false,
          code: "action_not_allowed",
          message: `${action.id} is not included in the local action allowlist.`,
          checks: [...checks, { source: layer.source, outcome: "allow_miss" }],
        };
      }
      checks.push({ source: layer.source, outcome: "allow_match", rule: allowed.pattern });
    }

    return { allowed: true, checks };
  }

  evaluateProxy(service: string): ActionPolicyDecision {
    for (const layer of this.proxyLayers) {
      const blocked = layer.blockedProxies.find((rule) => rule.matches(service));
      if (blocked) {
        return {
          allowed: false,
          code: "proxy_blocked",
          message: `${service} proxy is blocked by the local proxy policy.`,
          checks: [{ source: layer.source, outcome: "block_match", rule: blocked.pattern }],
        };
      }
    }

    const checks: PolicyCheck[] = [];
    for (const layer of this.proxyLayers) {
      if (layer.allowedProxies.length === 0) {
        continue;
      }
      const allowed = layer.allowedProxies.find((rule) => rule.matches(service));
      if (!allowed) {
        return {
          allowed: false,
          code: "proxy_not_allowed",
          message: `${service} proxy is not included in the local proxy allowlist.`,
          checks: [...checks, { source: layer.source, outcome: "allow_miss" }],
        };
      }
      checks.push({ source: layer.source, outcome: "allow_match", rule: allowed.pattern });
    }

    if (this.tokenProxyRules) {
      const allowed = this.tokenProxyRules.find((rule) => rule.matches(service));
      if (!allowed) {
        return {
          allowed: false,
          code: "proxy_not_allowed",
          message: `${service} proxy is not granted to this runtime token.`,
          checks: [...checks, { source: "token", outcome: "allow_miss" }],
        };
      }
      checks.push({ source: "token", outcome: "allow_match", rule: allowed.pattern });
    }

    return { allowed: true, checks };
  }

  evaluateConnection(
    connectionId?: string,
    operation?: ActionDefinition | "proxy" | "discovery",
  ): ActionPolicyDecision {
    if (this.connectionPermissions.size > 0) {
      const grant = connectionId ? this.connectionPermissions.get(connectionId) : undefined;
      if (!connectionId || !grant) {
        return connectionDenied(connectionId);
      }
      if (!connectionAccessAllows(grant, operation)) {
        return {
          allowed: false,
          code: "connection_operation_not_allowed",
          message:
            operation === "proxy"
              ? `${connectionId} connection requires full access before it can receive proxy requests.`
              : `${connectionId} connection does not grant ${
                  operation === "discovery" ? "discovery" : (operation?.operationType ?? "unclassified")
                } operations.`,
          checks: [{ source: "token", outcome: "allow_miss", rule: `${connectionId}:${grant.access}` }],
        };
      }
      if (typeof operation === "object" && !connectionToolPolicyAllows(grant.toolPolicy, operation.id)) {
        return {
          allowed: false,
          code: "connection_tool_not_allowed",
          message: `${operation.id} is not included in the tools granted to the ${connectionId} connection.`,
          checks: [{ source: "token", outcome: "allow_miss", rule: `${connectionId}:tools` }],
        };
      }
      return {
        allowed: true,
        checks: [{ source: "token", outcome: "allow_match", rule: `${connectionId}:${grant.access}` }],
      };
    }
    if (this.allowedConnections.length === 0) {
      return { allowed: true, checks: [] };
    }

    if (connectionId && this.allowedConnections.includes(connectionId)) {
      return {
        allowed: true,
        checks: [{ source: "token", outcome: "allow_match", rule: connectionId }],
      };
    }

    return connectionDenied(connectionId);
  }
}

function connectionDenied(connectionId?: string): ActionPolicyDecision {
  return {
    allowed: false,
    code: "connection_not_allowed",
    message: connectionId
      ? `${connectionId} connection is not granted to this runtime token.`
      : "The selected connection is not granted to this runtime token.",
    checks: [{ source: "token", outcome: "allow_miss" }],
  };
}

function connectionAccessAllows(
  grant: ConnectionPermissionGrant,
  operation: ActionDefinition | "proxy" | "discovery" | undefined,
): boolean {
  if (operation === "discovery") return true;
  if (operation === "proxy") return grant.access === "full" && grant.allowProxy !== false;
  if (!operation || !operation.operationType) return false;
  if (grant.access === "full") return true;
  if (grant.access === "read") return operation.operationType === "read";
  return operation.operationType === "read" || operation.operationType === "write";
}

function connectionToolPolicyAllows(policy: ConnectionToolPolicy | undefined, actionId: string): boolean {
  if (!policy || actionId === "custom_mcp.list_tools" || actionId === "custom_mcp.call_tool") return true;
  return policy.mode === "selected"
    ? policy.allowedActionIds.includes(actionId)
    : !policy.excludedActionIds.includes(actionId);
}

/**
 * Deployment execution policy used to construct request-scoped policy snapshots.
 */
export class ActionPolicyService {
  readonly rules: PolicyRules;

  constructor(config: ActionPolicyConfig = {}) {
    this.rules = policyRules(config);
  }

  createSnapshot(
    runtime: PolicyRules = emptyPolicyRules(),
    token?: TokenPolicy,
    updatedAt?: string,
  ): ActionPolicySnapshot {
    return new ActionPolicySnapshot(this.rules, runtime, token, updatedAt);
  }
}

export function emptyPolicyRules(): PolicyRules {
  return {
    allowedActions: [],
    blockedActions: [],
    allowedProxies: [],
    blockedProxies: [],
  };
}

export function parseActionPolicyList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function policyRules(config: ActionPolicyConfig): PolicyRules {
  return immutablePolicyRules({
    allowedActions: config.allowedActions ?? [],
    blockedActions: config.blockedActions ?? [],
    allowedProxies: config.allowedProxies ?? [],
    blockedProxies: config.blockedProxies ?? [],
  });
}

function immutablePolicyRules(rules: PolicyRules): PolicyRules {
  const immutable = {
    allowedActions: [...rules.allowedActions],
    blockedActions: [...rules.blockedActions],
    allowedProxies: [...rules.allowedProxies],
    blockedProxies: [...rules.blockedProxies],
  };
  Object.freeze(immutable.allowedActions);
  Object.freeze(immutable.blockedActions);
  Object.freeze(immutable.allowedProxies);
  Object.freeze(immutable.blockedProxies);
  return Object.freeze(immutable);
}

function compileLayer(source: PolicySource, rules: PolicyRules): CompiledLayer {
  return {
    source,
    allowedActions: rules.allowedActions.map(compileActionRule),
    blockedActions: rules.blockedActions.map(compileActionRule),
    allowedProxies: rules.allowedProxies.map(compileProxyRule),
    blockedProxies: rules.blockedProxies.map(compileProxyRule),
  };
}

function compileActionRule(pattern: string): CompiledActionRule {
  if (pattern.startsWith("@operation:")) {
    const operationType = pattern.slice("@operation:".length);
    return { pattern, matches: (action) => action.operationType === operationType };
  }
  if (pattern === "*") {
    return { pattern, matches: () => true };
  }
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -1);
    return { pattern, matches: (action) => action.id.startsWith(prefix) };
  }
  return { pattern, matches: (action) => action.id === pattern };
}

function compileProxyRule(pattern: string): CompiledRule {
  return { pattern, matches: pattern === "*" ? () => true : (service) => service === pattern };
}
