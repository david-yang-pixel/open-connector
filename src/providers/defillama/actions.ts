import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
import { dimensionsDefinitions } from "./dimensions-definitions.ts";
import { ecosystemDefinitions } from "./ecosystem-definitions.ts";
import { equitiesDefinitions } from "./equities-definitions.ts";
import { marketsDefinitions } from "./markets-definitions.ts";
import { tvlDefinitions } from "./tvl-definitions.ts";
import { yieldsDefinitions } from "./yields-definitions.ts";
export interface DefillamaRoute {
  path: string;
  parameters: Array<{
    name: string;
    in: string;
  }>;
  free: {
    baseUrl: string;
    path: string;
  } | null;
  wrap: boolean;
}
export interface DefillamaDefinition {
  name: string;
  description: string;
  route: DefillamaRoute;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
const definitions: DefillamaDefinition[] = [
  ...tvlDefinitions,
  ...ecosystemDefinitions,
  ...dimensionsDefinitions,
  ...marketsDefinitions,
  ...yieldsDefinitions,
  ...equitiesDefinitions,
];
export const defillamaRoutes: Map<string, (typeof definitions)[number]["route"]> = new Map(
  definitions.map((value) => [value.name, value.route]),
);
export const defillamaActions: ActionDefinition[] = definitions.map((value) =>
  defineProviderAction("defillama", {
    name: value.name,
    description: value.description,
    operationType: "read",
    requiredScopes: [],
    inputSchema: value.inputSchema,
    outputSchema: value.outputSchema,
  }),
);
