import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const identity = {
  email: s.nonEmptyString("Participant email address."),
  referralCode: s.nonEmptyString("Participant referral code."),
};
const selector = s.requireAnyProperty(
  s.object("Identify a participant by email or referral code.", identity, {
    optional: ["email", "referralCode"],
  }),
  ["email", "referralCode"],
);
const participant = s.looseObject("Participant data; additional campaign-specific fields are preserved.", {
  email: s.string("Participant email address."),
  firstname: s.string("Participant first name."),
  lastname: s.string("Participant last name."),
  referralCode: s.string("Participant referral code."),
  extraData: s.looseObject("Custom participant data.", {}),
  rank: s.number("Participant rank."),
  referralCountTotal: s.number("Total referral count."),
  pointsTotal: s.integer("Total points for campaigns with points enabled."),
  referredLeads: s.number("Number of referred leads."),
  xReferrals: s.number("Additional referral count reported by the campaign."),
  referrer: s.looseObject("Referrer details.", {}),
  redeemedRewards: s.array("Redeemed rewards.", s.looseObject("Reward details.", {})),
  pendingRewards: s.array("Pending rewards.", s.looseObject("Reward details.", {})),
});
function read(name: string, description: string, inputSchema: JsonSchema, outputSchema: JsonSchema) {
  return defineProviderAction("viral_loops", {
    name,
    description,
    operationType: "read",
    requiredScopes: [],
    inputSchema,
    outputSchema,
  });
}
export const viralLoopsActions: ActionDefinition[] = [
  read(
    "get_campaign",
    "Get public information for the campaign associated with this connection.",
    s.object(
      "No parameters are required.",
      {},
      {
        optional: [],
      },
    ),
    s.looseObject("Campaign information and configuration.", {
      campaignName: s.string("Campaign name."),
      companyName: s.string("Company name."),
      type: s.string("Campaign type."),
      template: s.string("Campaign template."),
      landingPage: s.string("Campaign landing page."),
      genericConfig: s.looseObject("Campaign configuration.", {}),
    }),
  ),
  read(
    "get_campaign_stats",
    "Get the lead count and total referral count for the connected campaign.",
    s.object(
      "No parameters are required.",
      {},
      {
        optional: [],
      },
    ),
    s.looseObject("Campaign statistics.", {
      leadCount: s.integer("Number of campaign leads."),
      referralCountTotal: s.integer("Total number of referrals."),
    }),
  ),
  read(
    "get_participant",
    "Get full participant information using the connected campaign's secret API token.",
    selector,
    participant,
  ),
  read(
    "list_referrals",
    "Get one page of a participant's referrals, with optional conversion-status filtering.",
    s.requireAnyProperty(
      s.object(
        "Participant and referral pagination parameters.",
        {
          ...identity,
          limit: s.integer("Maximum number of referrals to return.", { minimum: 1 }),
          offset: s.integer("Number of referrals to skip.", { minimum: 0 }),
          conversionStatus: s.number("Provider conversion-status filter."),
        },
        {
          optional: ["email", "referralCode", "limit", "offset", "conversionStatus"],
        },
      ),
      ["email", "referralCode"],
    ),
    s.looseObject("Referral page returned by Viral Loops; its fields depend on the campaign.", {}),
  ),
  read(
    "query_participants",
    "Query campaign participants by participant or referrer identifiers with limit and skip pagination.",
    s.object(
      "Participant query parameters.",
      {
        referrers: s.array("Referrer identifiers to filter by.", selector),
        participants: s.array("Participant identifiers to filter by.", selector),
        filter: s.object(
          "Pagination controls.",
          {
            limit: s.integer("Maximum number of results to return.", { minimum: 1 }),
            skip: s.integer("Number of results to skip.", { minimum: 0 }),
          },
          {
            optional: ["limit", "skip"],
          },
        ),
      },
      {
        optional: ["referrers", "participants", "filter"],
      },
    ),
    s.looseObject("Participant query response.", {
      results: s.array("Matching participant records.", s.unknown("Participant record returned by Viral Loops.")),
    }),
  ),
  read(
    "get_referrer",
    "Get the referrer of a campaign participant.",
    selector,
    s.object(
      "Referrer response wrapper.",
      {
        result: s.unknown("Original Viral Loops referrer response, including an empty result when no referrer exists."),
      },
      {
        optional: [],
      },
    ),
  ),
  read(
    "get_participant_rank",
    "Get a participant's waiting-list or leaderboard rank; flagged participants are excluded.",
    selector,
    s.looseObject("Participant rank information.", {
      rank: s.integer("Participant rank."),
      referralCountTotal: s.integer("Total referral count."),
      pointsTotal: s.integer("Total points for campaigns with points enabled."),
      suggestion: s.looseObject("Provider ranking suggestion.", {}),
    }),
  ),
  read(
    "get_participant_order",
    "Get the order in which a participant joined the campaign.",
    selector,
    s.looseObject("Participant joining order.", {
      order: s.integer("Joining order, starting at one."),
      leadCount: s.integer("Number of campaign leads."),
    }),
  ),
];
