import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "custom_mcp";

export const customMcpActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "list_tools",
    operationType: "read",
    description: "Discover and list all available tools published by the connected remote MCP server.",
    inputSchema: s.object({}),
    outputSchema: s.object(
      {
        tools: s.array(
          s.object(
            {
              name: s.string(),
              description: s.string(),
              inputSchema: s.object({}, { additionalProperties: true }),
              annotations: s.object({}, { additionalProperties: true }),
              actionId: s.string({ description: "Dynamic action id used by OpenConnector policy rules." }),
              operationType: s.string({ description: "Risk derived from MCP tool annotations." }),
              confirmationRequired: s.boolean({
                description: "Whether call_tool requires confirmOperation before invoking this tool.",
              }),
              pagination: s.object(
                {},
                {
                  additionalProperties: true,
                  description: "Configured pagination contract for this remote tool, when present.",
                },
              ),
            },
            { required: ["name", "actionId", "operationType", "confirmationRequired"] },
          ),
        ),
      },
      { required: ["tools"] },
    ),
  }),
  defineProviderAction(service, {
    name: "call_tool",
    operationType: "read",
    description:
      "Dispatch a remote MCP tool after applying its live schema, annotations, operation risk, confirmation, and dynamic action policy.",
    inputSchema: s.object(
      {
        toolName: s.string({ description: "Name of the remote MCP tool to invoke." }),
        arguments: s.object(
          {},
          {
            additionalProperties: true,
            description: "Key-value arguments conforming to the tool's inputSchema.",
          },
        ),
        confirmOperation: s.string({
          description:
            "Required for non-read tools. Must exactly match the derived operationType: write or destructive.",
        }),
        pagination: s.object(
          {
            mode: s.string({ description: "single returns one page; all follows the configured rule." }),
            cursor: s.string({ description: "Opaque nextCursor returned by the previous OpenConnector call." }),
            pageSize: s.integer({ minimum: 1, description: "Remote page size when the rule declares a limit field." }),
            maxPages: s.integer({
              minimum: 1,
              maximum: 1000,
              description: "Caller page budget, capped by the connection rule.",
            }),
          },
          { additionalProperties: false },
        ),
      },
      { required: ["toolName"] },
    ),
    outputSchema: s.object({}, { additionalProperties: true, description: "Native MCP CallToolResult content." }),
  }),
];
