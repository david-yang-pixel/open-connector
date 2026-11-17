import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const campaignInput = s.requiredObject("The campaign to query.", {
  campaignId: s.integer("The KickoffLabs campaign ID returned by list_campaigns.", { minimum: 1 }),
});

export const kickofflabsActions: ActionDefinition[] = [
  defineProviderAction("kickofflabs", {
    name: "list_campaigns",
    description: "List the KickoffLabs campaigns available to the connected API key.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requiredObject("The campaign listing parameters.", {}),
    outputSchema: s.requiredObject("The campaigns available to the API key.", {
      campaigns: s.array(
        "The available campaigns.",
        s.looseObject("A KickoffLabs campaign.", {
          id: s.integer("The campaign ID."),
          name: s.string("The campaign name."),
          lead_count: s.integer("The lead count including jump-start settings."),
        }),
      ),
    }),
  }),
  defineProviderAction("kickofflabs", {
    name: "get_campaign_stats",
    description: "Get overview lead statistics for a KickoffLabs campaign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: campaignInput,
    outputSchema: s.looseObject("The campaign overview statistics.", {
      leads: s.looseObject("The campaign lead counts.", {
        total: s.integer("The total number of leads."),
        total_with_jumpstart: s.integer("The total number of leads including jump-start settings."),
        removed_from_waitlist: s.integer("The number of leads removed from the waitlist."),
      }),
    }),
  }),
  defineProviderAction("kickofflabs", {
    name: "list_campaign_actions",
    description: "List the scoring action definitions configured for a KickoffLabs campaign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: campaignInput,
    outputSchema: s.requiredObject("The campaign scoring action definitions.", {
      actions: s.array(
        "The configured scoring actions.",
        s.looseObject("A campaign scoring action.", {
          id: s.integer("The campaign action ID, used as laid when marking a lead action complete."),
          text: s.string("The action label."),
        }),
      ),
    }),
  }),
];
