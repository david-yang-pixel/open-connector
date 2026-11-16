import type { ProviderDefinition } from "../../core/types.ts";

import { didiActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "didi",
  displayName: "DiDi",
  description: "Ride estimates, booking, order tracking, and maps",
  categories: ["Location"],
  homepageUrl: "https://mcp.didichuxing.com",
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "MCP Key",
      placeholder: "Paste your DiDi MCP Key",
      description:
        "Sign in at https://mcp.didichuxing.com/ with a registered DiDi personal account and activate your MCP Key. New phone numbers must first register in the DiDi app or mini program. Actions use production and can create real ride orders.",
    },
  ],
  actions: didiActions,
};
