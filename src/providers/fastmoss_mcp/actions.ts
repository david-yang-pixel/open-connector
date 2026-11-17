import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { contentActions } from "./actions-content.ts";
import { creatorActions } from "./actions-creator.ts";
import { productActions } from "./actions-product.ts";
import { researchActions } from "./actions-research.ts";
import { shopActions } from "./actions-shop.ts";
import { resultSchema } from "./schemas.ts";

export const fastmossMcpActions: readonly ActionDefinition[] = [
  ...productActions,
  ...creatorActions,
  ...shopActions,
  ...contentActions,
  ...researchActions,
  defineProviderAction("fastmoss_mcp", {
    name: "list_tools",
    operationType: "read",
    description:
      "Discover current FastMoss MCP tools, live argument schemas and behavior annotations for TikTok Shop product, creator, shop, advertising, agency and market research.",
    requiredScopes: [],
    inputSchema: s.object("No input is required.", {}, { optional: [] }),
    outputSchema: s.object(
      "The live FastMoss MCP tool catalog.",
      {
        tools: s.array(
          "Tools available to the connected FastMoss account.",
          s.object(
            "One FastMoss MCP tool.",
            {
              name: s.nonEmptyString("The exact tool name."),
              description: s.string("The current official tool description."),
              annotations: s.looseObject("Official MCP behavior annotations."),
              inputSchema: s.looseObject("The current JSON Schema for tool arguments."),
            },
            { optional: ["description", "annotations"] },
          ),
        ),
      },
      { optional: [] },
    ),
    followUpActions: ["fastmoss_mcp.call_tool"],
  }),
  defineProviderAction("fastmoss_mcp", {
    name: "call_tool",
    operationType: "destructive",
    description:
      "Call any current FastMoss MCP tool after inspecting list_tools. Arguments must match the live schema. Calls may consume FastMoss Credits; inspect behavior annotations before invoking newly added tools.",
    requiredScopes: [],

    inputSchema: s.object(
      "Call a live FastMoss MCP tool.",
      {
        toolName: s.nonEmptyString("The exact tool name returned by list_tools."),
        arguments: s.looseObject("Arguments matching the selected tool's live input schema."),
      },
      { optional: ["arguments"] },
    ),
    outputSchema: resultSchema,
  }),
];
