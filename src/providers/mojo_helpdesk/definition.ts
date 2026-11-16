import type { ProviderDefinition } from "../../core/types.ts";

import { mojoHelpdeskActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "mojo_helpdesk",
  displayName: "Mojo Helpdesk",
  description: "Manage Mojo Helpdesk tickets, users, queues, and related records.",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "mojo_helpdesk_api_key",
      description:
        "Mojo Helpdesk agent API key sent in the X-API-KEY header. Generate or copy it under My profile > Dev settings > API keys: https://help.mojohelpdesk.com/help/article/115455.",
    },
  ],
  homepageUrl: "https://www.mojohelpdesk.com/",
  actions: mojoHelpdeskActions,
};
