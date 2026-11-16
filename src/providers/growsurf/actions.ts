import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const campaignId = s.nonWhitespaceString("GrowSurf program ID.");
const participantIdOrEmail = s.nonWhitespaceString(
  "Participant ID or email address; pass the original unencoded value.",
);
const participantPath = { campaignId, participantIdOrEmail };
const metadata = s.looseObject("Shallow custom participant metadata.", {});
const participantOutput = s.object(
  "Participant details, including additional GrowSurf fields.",
  {
    id: s.string("Participant ID."),
    email: s.string("Participant email address."),
    firstName: s.nullable(s.string("Participant first name.")),
    lastName: s.nullable(s.string("Participant last name.")),
    referralCount: s.integer("Total referrals made by the participant."),
    shareUrl: s.string("Referral sharing URL; omitted for unapproved affiliates."),
    referralStatus: s.string("Referral credit status."),
    affiliateStatus: s.nullable(s.string("Affiliate enrollment status.")),
    metadata,
  },
  { required: ["id", "email"], additionalProperties: true },
);
const campaignOutput = s.object(
  "Program details, including additional GrowSurf fields.",
  {
    id: s.string("Program ID."),
    name: s.string("Internal program name."),
    type: s.string("Program type."),
    status: s.string("Program status."),
    referralCount: s.integer("Total referral count."),
    participantCount: s.integer("Total participant count."),
  },
  { required: ["id", "name"], additionalProperties: true },
);
const teamOutput = s.object(
  "Team bound to the API key.",
  {
    name: s.string("Team display name."),
    verificationStatus: s.string("Team verification state; VERIFIED is required to send participant emails."),
    verificationRequestedAt: s.nullable(s.integer("Last verification request time in Unix milliseconds.")),
  },
  { required: ["name"], additionalProperties: true },
);
const commonParticipantFields = {
  email: s.string("Participant email address.", { format: "email" }),
  referredBy: s.string("Referrer participant ID or email address.", { maxLength: 100 }),
  firstName: s.string("Participant first name.", { maxLength: 255 }),
  lastName: s.string("Participant last name.", { maxLength: 255 }),
  metadata,
};
const referralOutput = s.object(
  "Referral trigger result.",
  {
    success: s.boolean("Whether referral credit was awarded, scheduled, or its pending trigger cancelled."),
    message: s.string("Additional result details, when returned."),
  },
  { required: ["success"], additionalProperties: true },
);
export const growsurfActions: ActionDefinition[] = [
  defineProviderAction("growsurf", {
    name: "get_team",
    operationType: "read",
    requiredScopes: [],
    description: "Get the GrowSurf team bound to your API key and its email verification state.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: teamOutput,
  }),
  defineProviderAction("growsurf", {
    name: "list_campaigns",
    operationType: "read",
    requiredScopes: [],
    description: "List GrowSurf programs belonging to your API key's team. Deleted programs are excluded.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseRequiredObject("Team programs.", {
      campaigns: s.array("Available programs.", campaignOutput),
    }),
  }),
  defineProviderAction("growsurf", {
    name: "get_campaign",
    operationType: "read",
    requiredScopes: [],
    description: "Get one GrowSurf program's configuration and totals.",
    inputSchema: s.requiredObject("Program lookup.", { campaignId }),
    outputSchema: campaignOutput,
  }),
  defineProviderAction("growsurf", {
    name: "list_participants",
    operationType: "read",
    requiredScopes: [],
    description:
      "List a page of GrowSurf participants. Pass nextId into the next request until null; metadata filters match all supplied values exactly.",
    inputSchema: s.object(
      "Participant listing filters.",
      {
        campaignId,
        nextId: s.string("Cursor from the previous page."),
        limit: s.integer("Page size; GrowSurf defaults to 10.", { minimum: 1, maximum: 100 }),
        metadata: {
          ...s.object(
            "Exact metadata filters, up to three keys.",
            {},
            { additionalProperties: s.string("Metadata filter value.") },
          ),
          maxProperties: 3,
        },
      },
      { optional: ["nextId", "limit", "metadata"] },
    ),
    outputSchema: s.looseRequiredObject("Participant page.", {
      participants: s.array("Participants on this page.", participantOutput),
      limit: s.integer("Requested page size."),
      nextId: s.nullable(s.string("Next page cursor, or null when finished.")),
    }),
  }),
  defineProviderAction("growsurf", {
    name: "get_participant",
    operationType: "read",
    requiredScopes: [],
    description: "Get a GrowSurf participant by ID or email address.",
    inputSchema: s.requiredObject("Participant lookup.", participantPath),
    outputSchema: participantOutput,
  }),
  defineProviderAction("growsurf", {
    name: "create_participant",
    operationType: "write",
    requiredScopes: [],
    description:
      "Add a GrowSurf participant; an existing email returns its participant unchanged. In affiliate programs, omitted isAffiliate enrolls an approved affiliate unless a valid referredBy is supplied. Referred signups may earn Lead rewards.",
    inputSchema: s.requiredObject("Participant creation.", {
      campaignId,
      participant: s.object(
        "New participant fields.",
        {
          ...commonParticipantFields,
          isAffiliate: s.boolean(
            "Affiliate programs only: true enrolls an approved affiliate; false creates a non-affiliate. Applies only to new participants.",
          ),
          referralStatus: s.stringEnum("Referral credit status when referredBy resolves; omit to use program rules.", [
            "CREDIT_PENDING",
            "CREDIT_AWARDED",
          ]),
          ipAddress: s.string("Participant IP address, when available.", { maxLength: 255 }),
          fingerprint: s.string("Browser identifier, when available.", { maxLength: 255 }),
          mobileInstanceId: s.string("App-install scoped identifier supplied by a native app."),
        },
        { required: ["email"] },
      ),
    }),
    outputSchema: participantOutput,
  }),
  defineProviderAction("growsurf", {
    name: "update_participant",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Update a GrowSurf participant. Can suspend or ban affiliates and expire referral credit. Supplied vanityKeys replace existing aliases; omitted fields remain unchanged.",
    inputSchema: s.requiredObject("Participant update.", {
      ...participantPath,
      participant: {
        ...s.object(
          "Participant fields to update.",
          {
            ...commonParticipantFields,
            referralStatus: s.stringEnum("Referral credit status.", [
              "CREDIT_PENDING",
              "CREDIT_AWARDED",
              "CREDIT_EXPIRED",
            ]),
            affiliateStatus: s.stringEnum(
              "Affiliate status; APPROVED also enrolls a non-affiliate, while SUSPENDED and BANNED require an existing affiliate.",
              ["APPROVED", "SUSPENDED", "BANNED"],
            ),
            vanityKeys: s.array(
              "Replacement referral-code aliases.",
              s.string("Referral-code alias.", {
                minLength: 1,
                maxLength: 20,
                pattern: "^[A-Za-z0-9_-]+$",
              }),
              { maxItems: 5 },
            ),
            unsubscribed: s.boolean("Whether the participant is unsubscribed from program emails."),
            notes: s.string("Internal participant notes, never exposed to participants.", {
              maxLength: 500,
            }),
          },
          { required: [] },
        ),
        minProperties: 1,
      },
    }),
    outputSchema: participantOutput,
  }),
  defineProviderAction("growsurf", {
    name: "delete_participant",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Delete a GrowSurf participant. Pending analytics erasure runs automatically; do not repeat deletion to complete it.",
    inputSchema: s.requiredObject("Participant deletion.", participantPath),
    outputSchema: s.object(
      "Participant deletion result.",
      {
        success: s.boolean("Whether participant cleanup completed."),
        analyticsErasure: s.looseObject("Pending analytics erasure details, when returned.", {}),
      },
      { required: ["success"], additionalProperties: true },
    ),
  }),
  defineProviderAction("growsurf", {
    name: "trigger_referral",
    operationType: "write",
    requiredScopes: [],
    description:
      "Trigger referral credit for a GrowSurf participant immediately or after a delay managed by GrowSurf. Inspect success and message for the actual outcome.",
    inputSchema: s.object(
      "Referral trigger input.",
      {
        ...participantPath,
        delayInDays: s.integer("Whole days to delay credit; omit for immediate credit.", {
          minimum: 1,
          maximum: 90,
        }),
      },
      { optional: ["delayInDays"] },
    ),
    outputSchema: referralOutput,
  }),
  defineProviderAction("growsurf", {
    name: "cancel_delayed_referral",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Cancel a pending delayed GrowSurf referral trigger. Returns success false when there is no pending trigger.",
    inputSchema: s.requiredObject("Delayed referral cancellation.", participantPath),
    outputSchema: referralOutput,
  }),
];
