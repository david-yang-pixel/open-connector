import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
import { discoveryDefinitions } from "./discovery-definitions.ts";
import { equityDefinitions } from "./equity-definitions.ts";
import { marketDefinitions } from "./market-definitions.ts";
import { onchainDefinitions } from "./onchain-definitions.ts";
import { predictionDefinitions } from "./prediction-definitions.ts";
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  onchain_sql_job_create: { startActionId: "surf.onchain_sql_job_create", statusActionId: "surf.onchain_sql_job_get" },
};
export interface SurfRoute {
  path: string;
  method: string;
  parameters: Array<{
    name: string;
    in: string;
    field: string;
  }>;
  body: boolean;
}
export interface SurfActionDefinition {
  name: string;
  description: string;
  operationType: ActionDefinition["operationType"];
  route: SurfRoute;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
const definitions: SurfActionDefinition[] = [
  ...marketDefinitions,
  ...equityDefinitions,
  ...discoveryDefinitions,
  ...onchainDefinitions,
  ...predictionDefinitions,
];
export const surfRoutes: Record<string, SurfRoute> = Object.fromEntries(
  definitions.map((definition) => [definition.name, definition.route]),
);
export const surfActions: ActionDefinition[] = definitions.map((definition) =>
  defineProviderAction("surf", {
    name: definition.name,
    description: definition.description,
    operationType: definition.operationType,
    requiredScopes: [],
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
    asyncLifecycle: actionLifecycles[definition.name],
  }),
);
