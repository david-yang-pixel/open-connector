import type { ActionDefinition, JsonSchema } from "../../core/types.ts";
export interface TinyfishEndpoint {
  name: string;
  description: string;
  operationType: ActionDefinition["operationType"];
  origin: "main" | "search" | "fetchApi" | "browser";
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  pathKeys?: string[];
  queryKeys?: string[];
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  responseType?: "screenshot" | "html";
}
