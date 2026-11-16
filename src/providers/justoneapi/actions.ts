import type { ActionDefinition } from "../../core/types.ts";
import type { JustoneapiEndpoint } from "./endpoint-definition.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { commerceEndpoints } from "./actions-commerce.ts";
import { creatorEndpoints } from "./actions-creators.ts";
import { mediaEndpoints } from "./actions-media.ts";
import { socialCnEndpoints } from "./actions-social-cn.ts";
import { socialGlobalEndpoints } from "./actions-social-global.ts";

export const justoneapiEndpoints: readonly JustoneapiEndpoint[] = [
  ...commerceEndpoints,
  ...creatorEndpoints,
  ...mediaEndpoints,
  ...socialCnEndpoints,
  ...socialGlobalEndpoints,
];

const outputSchema = s.object(
  "The Just One API JSON response, including original business data and pagination state.",
  {
    code: s.integer("Business status code; zero indicates success."),
    message: s.nullable(s.string("The upstream response message.")),
    data: {
      description: "Upstream business data, preserving platform fields, cursors, and media URLs.",
    },
    recordTime: s.nullable(s.string("The upstream record time when provided.")),
    requestId: s.string("The upstream request identifier when provided."),
    reason: s.string("The upstream reason when provided."),
  },
  { optional: ["message", "recordTime", "requestId", "reason"], additionalProperties: true },
);

export const justoneapiActions: ActionDefinition[] = justoneapiEndpoints.map((endpoint) =>
  defineProviderAction("justoneapi", {
    name: endpoint.name,
    description: endpoint.description,
    operationType: "read",
    requiredScopes: [],
    inputSchema: endpoint.inputSchema,
    outputSchema,
  }),
);
