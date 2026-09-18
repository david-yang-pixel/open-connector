import type { ActionDefinition } from "../../core/types.ts";

export const customMcpActions: ActionDefinition[] = [
  {
    id: "custom_mcp.list_tools",
    service: "custom_mcp",
    actionName: "list_tools",
    displayName: "List Remote MCP Tools",
    description: "Discover and list all available tools published by the connected remote MCP server.",
    direction: "read",
    kind: "runtime",
    categories: ["Developer Tools"],
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        tools: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              inputSchema: { type: "object" },
              annotations: { type: "object" },
            },
            required: ["name"],
          },
        },
      },
      required: ["tools"],
    },
  },
  {
    id: "custom_mcp.call_tool",
    service: "custom_mcp",
    actionName: "call_tool",
    displayName: "Call Remote MCP Tool",
    description: "Execute a specific tool on the connected remote MCP server with dynamic arguments.",
    direction: "write",
    kind: "runtime",
    categories: ["Developer Tools"],
    inputSchema: {
      type: "object",
      properties: {
        toolName: {
          type: "string",
          description: "Name of the remote MCP tool to invoke.",
        },
        arguments: {
          type: "object",
          description: "Key-value arguments conforming to the tool's inputSchema.",
          additionalProperties: true,
        },
      },
      required: ["toolName"],
    },
    outputSchema: {
      type: "object",
      properties: {
        result: {
          type: "object",
          description: "Direct response returned by the remote MCP tool execution.",
        },
      },
      required: ["result"],
    },
  },
];
