import type { ConnectionPermissionGrant, PolicyRules, TokenPolicy } from "../../core/action-policy.ts";
import type { JsonRequestBody } from "./http-utils.ts";

import { Buffer } from "node:buffer";
import { objectArray, requiredString, requiredStringArray } from "../../core/cast.ts";
import { HttpRequestError } from "./http-utils.ts";

export const policyRequestMaxBytes: number = 256 * 1024;
export const policyRuleMaxBytes: number = 256;
export const policyRuleListMaxItems: number = 128;

export function readRuntimePolicyRules(body: JsonRequestBody): PolicyRules {
  return {
    allowedActions: readRules(body.allowedActions, "allowedActions", "action"),
    blockedActions: readRules(body.blockedActions, "blockedActions", "action"),
    allowedProxies: readRules(body.allowedProxies, "allowedProxies", "proxy"),
    blockedProxies: readRules(body.blockedProxies, "blockedProxies", "proxy"),
  };
}

export function readTokenPolicy(body: JsonRequestBody, allowOmitted = false): TokenPolicy {
  if (body.blockedProxies !== undefined) {
    throw invalidInput("Token policy does not support proxy block rules.");
  }
  return {
    allowedActions: readRules(body.allowedActions, "allowedActions", "action", allowOmitted),
    blockedActions: readRules(body.blockedActions, "blockedActions", "action", allowOmitted),
    allowedProxies: readRules(body.allowedProxies, "allowedProxies", "proxy", allowOmitted),
    allowedConnections: readConnectionIds(body.allowedConnections, "allowedConnections", allowOmitted),
    connectionPermissions: readConnectionPermissions(body.connectionPermissions),
  };
}

function readConnectionPermissions(value: unknown): ConnectionPermissionGrant[] {
  if (value === undefined) return [];
  const items = objectArray(value, "connectionPermissions", invalidInput);
  if (items.length > policyRuleListMaxItems) {
    throw invalidInput(`connectionPermissions must not contain more than ${policyRuleListMaxItems} grants.`);
  }
  const grants: ConnectionPermissionGrant[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const connectionId = requiredString(item.connectionId, "connectionPermissions.connectionId", invalidInput);
    if (Buffer.byteLength(connectionId, "utf8") > policyRuleMaxBytes) {
      throw invalidInput(`connectionPermissions connection IDs must not exceed ${policyRuleMaxBytes} UTF-8 bytes.`);
    }
    const access = requiredString(item.access, "connectionPermissions.access", invalidInput);
    if (access !== "read" && access !== "write" && access !== "full") {
      throw invalidInput("connectionPermissions.access must be read, write, or full.");
    }
    if (seen.has(connectionId)) {
      throw invalidInput(`connectionPermissions contains a duplicate connection ID: ${connectionId}.`);
    }
    seen.add(connectionId);
    grants.push({ connectionId, access });
  }
  return grants;
}

function readRules(value: unknown, fieldName: string, kind: "action" | "proxy", allowOmitted = false): string[] {
  if (value === undefined && allowOmitted) {
    return [];
  }
  const values = requiredStringArray(value, fieldName, invalidInput);
  const rules: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const rule = value.trim();
    if (!rule) {
      throw invalidInput(`${fieldName} must not contain empty rules.`);
    }
    if (Buffer.byteLength(rule, "utf8") > policyRuleMaxBytes) {
      throw invalidInput(`${fieldName} rules must not exceed ${policyRuleMaxBytes} UTF-8 bytes.`);
    }
    assertRuleSyntax(rule, fieldName, kind);
    if (!seen.has(rule)) {
      seen.add(rule);
      rules.push(rule);
    }
  }
  if (rules.length > policyRuleListMaxItems) {
    throw invalidInput(`${fieldName} must not contain more than ${policyRuleListMaxItems} rules.`);
  }
  return rules;
}

function readConnectionIds(value: unknown, fieldName: string, allowOmitted = false): string[] {
  if (value === undefined && allowOmitted) {
    return [];
  }
  const values = requiredStringArray(value, fieldName, invalidInput);
  const connectionIds: string[] = [];
  const seen = new Set<string>();
  for (const item of values) {
    const connectionId = item.trim();
    if (!connectionId) {
      throw invalidInput(`${fieldName} must not contain empty connection IDs.`);
    }
    if (Buffer.byteLength(connectionId, "utf8") > policyRuleMaxBytes) {
      throw invalidInput(`${fieldName} IDs must not exceed ${policyRuleMaxBytes} UTF-8 bytes.`);
    }
    if (!seen.has(connectionId)) {
      seen.add(connectionId);
      connectionIds.push(connectionId);
    }
  }
  if (connectionIds.length > policyRuleListMaxItems) {
    throw invalidInput(`${fieldName} must not contain more than ${policyRuleListMaxItems} rules.`);
  }
  return connectionIds;
}

function assertRuleSyntax(rule: string, fieldName: string, kind: "action" | "proxy"): void {
  if (rule === "*") {
    return;
  }
  if (kind === "proxy") {
    if (rule.includes("*") || /\s/.test(rule)) {
      throw invalidInput(`${fieldName} contains an invalid proxy rule: ${rule}.`);
    }
    return;
  }
  if (rule === "@operation:read" || rule === "@operation:write" || rule === "@operation:destructive") {
    return;
  }
  if (/^[^\s.*]+\.\*$/.test(rule)) {
    return;
  }
  const separator = rule.indexOf(".");
  if (rule.includes("*") || /\s/.test(rule) || separator <= 0 || separator === rule.length - 1) {
    throw invalidInput(`${fieldName} contains an invalid action rule: ${rule}.`);
  }
}

function invalidInput(message: string): HttpRequestError {
  return new HttpRequestError("invalid_input", message);
}
