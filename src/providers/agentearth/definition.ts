import type { ProviderDefinition } from "../../core/types.ts";

import { agentearthActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "agentearth",
  displayName: "AgentEarth",
  homepageUrl: "https://agentearth.ai/",
  categories: ["AI", "Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk-...",
      description:
        "Register at https://agentearth.ai/ and create an API key in Keys. Setup instructions: https://agentearth.ai/docs/access#registration . Tool executions consume account credits.",
    },
  ],
  actions: agentearthActions,
};
