import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
import definitions from "./endpoints.json" with { type: "json" };
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  start_dataset: { startActionId: "ploid.start_dataset", statusActionId: "ploid.get_dataset" },
};
const actionFollowUps: Record<string, readonly string[]> = {
  sync_people_search: ["ploid.get_set"],
  get_person: ["ploid.get_person_run"],
  create_dataset: ["ploid.get_dataset"],
  start_dataset: ["ploid.get_dataset"],
};
export interface PloidEndpoint {
  name: string;
  method: string;
  path: string;
  pathKeys: string[];
  queryKeys: string[];
  operationType: ActionDefinition["operationType"];
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
const ploidEndpoints = definitions as PloidEndpoint[];
export const ploidEndpointByName: Map<string, (typeof ploidEndpoints)[number]> = new Map(
  ploidEndpoints.map((endpoint) => [endpoint.name, endpoint]),
);
export const ploidActions: ActionDefinition[] = ploidEndpoints.map((endpoint) =>
  defineProviderAction("ploid", {
    name: endpoint.name,
    description: endpoint.description,
    operationType: endpoint.operationType,
    requiredScopes: [],
    inputSchema: endpoint.inputSchema,
    outputSchema: endpoint.outputSchema,
    asyncLifecycle: actionLifecycles[endpoint.name],
    followUpActions: actionFollowUps[endpoint.name],
  }),
);
