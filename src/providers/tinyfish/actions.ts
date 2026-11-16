import type { ActionDefinition } from "../../core/types.ts";
import type { TinyfishEndpoint } from "./endpoints.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
import { agentEndpoints } from "./agent-actions.ts";
import { dataEndpoints } from "./data-actions.ts";
import { managementEndpoints } from "./management-actions.ts";
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  submit_run: { startActionId: "tinyfish.submit_run", statusActionId: "tinyfish.get_run" },
  start_research: { startActionId: "tinyfish.start_research", statusActionId: "tinyfish.get_research_run" },
};
const tinyfishEndpoints: TinyfishEndpoint[] = [...agentEndpoints, ...dataEndpoints, ...managementEndpoints];
export const tinyfishEndpointByName: Map<string, (typeof tinyfishEndpoints)[number]> = new Map(
  tinyfishEndpoints.map((endpoint) => [endpoint.name, endpoint]),
);
export const tinyfishActions: ActionDefinition[] = tinyfishEndpoints.map((endpoint) =>
  defineProviderAction("tinyfish", {
    name: endpoint.name,
    description: endpoint.description,
    operationType: endpoint.operationType,
    requiredScopes: [],
    inputSchema: endpoint.inputSchema,
    outputSchema: endpoint.outputSchema,
    asyncLifecycle: actionLifecycles[endpoint.name],
  }),
);
