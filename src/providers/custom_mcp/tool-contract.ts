import type { ActionDefinition, ActionOperationType, ExecutionContext, JsonSchema } from "../../core/types.ts";
import type { Schema } from "@cfworker/json-schema";
import type { Tool } from "@modelcontextprotocol/client";

import { Validator } from "@cfworker/json-schema";
import { optionalString } from "../../core/cast.ts";
import { ProviderRequestError } from "../provider-runtime.ts";

export interface CustomMcpToolDescriptor {
  name: string;
  description?: string;
  inputSchema: JsonSchema;
  annotations?: Record<string, unknown>;
  actionId: string;
  operationType: ActionOperationType;
  confirmationRequired: boolean;
}

export function describeCustomMcpTool(
  tool: Tool,
  operationTypeOverride?: ActionOperationType,
): CustomMcpToolDescriptor {
  const operationType = operationTypeOverride ?? customMcpToolOperationType(tool);
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema as JsonSchema,
    annotations: tool.annotations as Record<string, unknown> | undefined,
    actionId: customMcpToolActionId(tool.name),
    operationType,
    confirmationRequired: operationType !== "read",
  };
}

export function customMcpToolActionId(toolName: string): string {
  return `custom_mcp.remote.${encodeURIComponent(toolName)}`;
}

export function customMcpToolOperationType(tool: Pick<Tool, "annotations">): ActionOperationType {
  if (tool.annotations?.destructiveHint === true) return "destructive";
  if (tool.annotations?.readOnlyHint === true) return "read";
  return "write";
}

export function authorizeCustomMcpTool(
  tool: Tool,
  args: Record<string, unknown>,
  input: Record<string, unknown>,
  context: Pick<ExecutionContext, "authorizeAction"> & { operationTypeOverride?: ActionOperationType },
): CustomMcpToolDescriptor {
  const descriptor = describeCustomMcpTool(tool, context.operationTypeOverride);
  validateCustomMcpToolArguments(tool, args, descriptor.actionId);

  if (descriptor.confirmationRequired) {
    const confirmation = optionalString(input.confirmOperation);
    if (confirmation !== descriptor.operationType) {
      throw new ProviderRequestError(
        400,
        `confirmOperation must be ${descriptor.operationType} before invoking remote tool ${tool.name}.`,
        { reason: "confirmation_required", actionId: descriptor.actionId, operationType: descriptor.operationType },
      );
    }
  }

  if (!context.authorizeAction) {
    throw new ProviderRequestError(403, "Dynamic remote MCP tool authorization is unavailable.", {
      reason: "action_not_allowed",
      actionId: descriptor.actionId,
    });
  }
  const decision = context.authorizeAction(customMcpToolActionDefinition(tool, descriptor));
  if (!decision.allowed) {
    throw new ProviderRequestError(403, decision.message, {
      reason: decision.code,
      actionId: descriptor.actionId,
      operationType: descriptor.operationType,
    });
  }
  return descriptor;
}

export function customMcpToolActionDefinition(tool: Tool, descriptor: CustomMcpToolDescriptor): ActionDefinition {
  return {
    id: descriptor.actionId,
    service: "custom_mcp",
    name: `remote.${tool.name}`,
    description: tool.description ?? `Remote MCP tool ${tool.name}.`,
    operationType: descriptor.operationType,
    requiredScopes: [],
    providerPermissions: [],
    inputSchema: descriptor.inputSchema,
    outputSchema: { type: "object", additionalProperties: true },
  };
}

export function validateCustomMcpToolArguments(
  tool: Tool,
  args: Record<string, unknown>,
  actionId: string = customMcpToolActionId(tool.name),
): void {
  let validation;
  try {
    validation = new Validator(tool.inputSchema as Schema, "2020-12", false).validate(args);
  } catch (error) {
    throw new ProviderRequestError(
      502,
      `Remote MCP tool ${tool.name} published an invalid input schema.`,
      error instanceof Error ? error.message : error,
    );
  }
  if (!validation.valid) {
    throw new ProviderRequestError(400, `Arguments for remote MCP tool ${tool.name} do not match its input schema.`, {
      reason: "invalid_input",
      actionId,
      errors: validation.errors,
    });
  }
}
