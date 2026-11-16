import type { ProviderDefinition } from "../../core/types.ts";

import { ticketTailorActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "ticket_tailor",
  displayName: "Ticket Tailor",
  description: "Manage Ticket Tailor events, orders, tickets, and related records.",
  categories: ["Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sk_...",
      description:
        "Ticket Tailor API key used as the HTTP Basic Auth username. Generate a key under Box office settings > API: https://help.tickettailor.com/en/articles/4593218-how-do-i-connect-to-the-ticket-tailor-api",
    },
  ],
  homepageUrl: "https://www.tickettailor.com/",
  actions: ticketTailorActions,
};
