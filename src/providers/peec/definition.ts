import type { ProviderDefinition } from "../../core/types.ts";

import { peecActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "peec",
  displayName: "Peec AI",
  description: "Inspect Peec AI projects, prompts, visibility, sources, and analytics.",
  categories: ["Marketing", "Data & Analytics"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "PEEC_API_KEY",
      description:
        "Peec AI Customer API key sent with the X-API-Key header. Create a company- or project-scoped key at https://app.peec.ai/api-keys.",
    },
  ],
  homepageUrl: "https://peec.ai/",
  actions: peecActions,
};
