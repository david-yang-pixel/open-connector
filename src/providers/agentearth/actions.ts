import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const envelope = {
  error_no: s.literal(0, { description: "Zero indicates a successful request." }),
  error_msg: s.string("The upstream status message."),
};
const tool = s.looseObject("A discovered tool, preserving provider-specific fields.", {
  tool_name: s.string("The exact tool name."),
  tool_url: s.string("The complete execution URL; pass it unchanged to execute_tool."),
  description: s.string("The tool capability description."),
  when_to_use: s.string("When this tool should be used."),
  input_schema: s.looseObject("The tool's JSON input schema; usually omitted from list results.", {}),
  credit: s.number("Credits charged per tool call."),
  associated_tools: s.string("Related tools suggested by the provider."),
});
const toolDiscoveryFields = {
  ...envelope,
  total: s.integer("The total number of matching tools."),
  tools: s.array("Discovered tools.", tool),
};
const toolsOutput = s.looseRequiredObject("The upstream tool discovery response.", toolDiscoveryFields);
export const agentearthActions: ActionDefinition[] = [
  defineProviderAction("agentearth", {
    name: "get_account",
    operationType: "read",
    requiredScopes: [],
    description: "Read the connected AgentEarth account, API key name, and credit balance without discovering tools.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseRequiredObject("The authenticated account overview.", {
      ...envelope,
      user_id: s.string("The authenticated user ID."),
      user_name: s.string("The authenticated user name."),
      key_name: s.string("The API key name, not its secret value."),
      credit: s.string("The account balance as a decimal string, preserving eight decimal places."),
    }),
  }),
  defineProviderAction("agentearth", {
    name: "recommend_tools",
    operationType: "read",
    requiredScopes: [],
    description:
      "Recommend AgentEarth tools for a natural-language task, including input schemas and complete execution URLs.",
    inputSchema: s.object(
      "Tool recommendation parameters.",
      {
        query: s.nonWhitespaceString("The task or question to find tools for."),
        limit: s.integer("Maximum recommendations; defaults to 5.", {
          minimum: 1,
          maximum: 50,
          default: 5,
        }),
      },
      { optional: ["limit"] },
    ),
    outputSchema: toolsOutput,
  }),
  defineProviderAction("agentearth", {
    name: "list_tools",
    operationType: "read",
    requiredScopes: [],
    description:
      "Browse one page of AgentEarth tools. Increase page to continue; read tool details for the complete input schema before execution.",
    inputSchema: s.object(
      "Tool browsing parameters.",
      {
        page: s.integer("Page number; defaults to 1.", { minimum: 1, default: 1 }),
        page_size: s.integer("Tools per page; defaults to 20, maximum 100.", {
          minimum: 1,
          maximum: 100,
          default: 20,
        }),
        keyword: s.string("A keyword used to filter tools."),
        sort: s.string("The provider's sorting mode; omit for its default ordering."),
      },
      { required: [] },
    ),
    outputSchema: s.looseRequiredObject("A page of matching tools.", {
      ...toolDiscoveryFields,
      page: s.integer("The returned page number."),
      page_size: s.integer("The requested number of tools per page."),
    }),
  }),
  defineProviderAction("agentearth", {
    name: "get_tool_detail",
    operationType: "read",
    requiredScopes: [],
    description:
      "Get the complete input schema and execution URL for an exact AgentEarth tool name returned by discovery.",
    inputSchema: s.requiredObject("Tool identification.", {
      tool_name: s.nonWhitespaceString("The exact tool name returned by discovery."),
    }),
    outputSchema: toolsOutput,
  }),
  defineProviderAction("agentearth", {
    name: "execute_tool",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Execute a discovered AgentEarth tool using its complete tool_url and input_schema. Tools may modify or delete external resources and consume credits. Execution waits up to five minutes; after a timeout, verify the outcome before retrying.",
    inputSchema: s.object(
      "Discovered execution URL and tool arguments.",
      {
        tool_url: s.nonWhitespaceString(
          "The complete HTTPS execution URL returned by recommend_tools or get_tool_detail, including all query parameters.",
        ),
        params: s.looseObject(
          "Tool arguments matching the discovered input_schema; use URLs for remote files when supported by the tool.",
          {},
        ),
      },
      { optional: ["params"] },
    ),
    outputSchema: s.object(
      "The upstream tool execution response.",
      {
        ...envelope,
        result: {
          description: "The complete tool result, including any text, image, audio, or resource links.",
        },
        platform_annotations: s.string("Optional provider annotations about the result."),
      },
      { required: ["error_no", "error_msg", "result"], additionalProperties: true },
    ),
  }),
];
