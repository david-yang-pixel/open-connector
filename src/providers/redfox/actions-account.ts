import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const accountActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "get_account_balance",
    operationType: "read",
    description: "Get the points balance associated with the connected RedFoxHub API key.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {}),
    outputSchema: responseSchema,
  }),
  defineProviderAction("redfox", {
    name: "list_api_usage",
    operationType: "read",
    description: "List API consumption records associated with the connected RedFoxHub API key.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        pageNum: s.nonEmptyString("Page number, starting at 1."),
        pageSize: s.nonEmptyString("Number of results per page."),
      },
      { optional: ["pageNum", "pageSize"] },
    ),
    outputSchema: responseSchema,
  }),
];
