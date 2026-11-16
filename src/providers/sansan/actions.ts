import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { sansanAdminActions } from "./admin-actions.ts";
import { sansanBusinessActions } from "./business-actions.ts";
import { sansanOrganizationActions } from "./organization-actions.ts";
import { businessCardSchema, reportPageSchema, businessCardPageSchema, tagPageSchema, userSchema } from "./schemas.ts";

export const sansanActions: ActionDefinition[] = [
  ...sansanBusinessActions,
  ...sansanOrganizationActions,
  ...sansanAdminActions,
  defineProviderAction("sansan", {
    name: "get_current_user",
    operationType: "read",
    description: "Get the Sansan user and permissions associated with the connected API key.",
    requiredScopes: [],
    inputSchema: s.object("No input is required.", {}, { required: [] }),
    outputSchema: userSchema,
  }),
  defineProviderAction("sansan", {
    name: "list_business_cards",
    operationType: "read",
    description:
      "List business cards updated within a time interval, with optional historical cards and tags. Use nextPageToken to continue.",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Business card update query.",
        {
          nextPageToken: s.nonEmptyString(
            "Continue a previous query using its nextPageToken; original query parameters are inherited.",
          ),
          limit: s.integer("Maximum records per page, from 1 to 300; defaults to 100.", {
            minimum: 1,
            maximum: 300,
          }),
          range: s.stringEnum("Record ownership scope: me or all accessible records; defaults to me.", ["me", "all"]),
          includeTags: s.boolean("Include attached tags and treat tag changes as business card updates."),
          includePastBizCards: s.boolean("Include older business cards for merged persons; defaults to false."),
          entryStatus: s.array(
            "Digitization statuses to include; defaults to completed.",
            s.stringEnum("A business card digitization status.", ["processing", "completed", "unreadable"]),
          ),
          orderBy: s.stringEnum("Sort field; defaults to updatedAt for listing and registeredAt for searching.", [
            "registeredAt",
            "completedAt",
            "updatedAt",
          ]),
          orderDirection: s.stringEnum("Sort direction; defaults to asc for listing and desc for searching.", [
            "asc",
            "desc",
          ]),
          updatedFrom: s.string(
            "Start of the update interval as an ISO 8601 timestamp with timezone. Required on the first page.",
            { format: "date-time" },
          ),
          updatedTo: s.string(
            "End of the update interval as an ISO 8601 timestamp with timezone. Required on the first page.",
            { format: "date-time" },
          ),
        },
        { required: [] },
      ),
      anyOf: [{ required: ["nextPageToken"] }, { required: ["updatedFrom", "updatedTo"] }],
    },
    outputSchema: businessCardPageSchema,
  }),
  defineProviderAction("sansan", {
    name: "search_business_cards",
    operationType: "read",
    description: "Search accessible Sansan business cards by company, name, email, telephone, mobile, and tags.",
    requiredScopes: [],
    inputSchema: s.object(
      "Business card search filters.",
      {
        nextPageToken: s.nonEmptyString(
          "Continue a previous query using its nextPageToken; original query parameters are inherited.",
        ),
        limit: s.integer("Maximum records per page, from 1 to 300; defaults to 100.", {
          minimum: 1,
          maximum: 300,
        }),
        range: s.stringEnum("Record ownership scope: me or all accessible records; defaults to me.", ["me", "all"]),
        includeTags: s.boolean("Include attached tags and treat tag changes as business card updates."),
        includePastBizCards: s.boolean("Include older business cards for merged persons; defaults to false."),
        entryStatus: s.array(
          "Digitization statuses to include; defaults to completed.",
          s.stringEnum("A business card digitization status.", ["processing", "completed", "unreadable"]),
        ),
        orderBy: s.stringEnum("Sort field; defaults to updatedAt for listing and registeredAt for searching.", [
          "registeredAt",
          "completedAt",
          "updatedAt",
        ]),
        orderDirection: s.stringEnum("Sort direction; defaults to asc for listing and desc for searching.", [
          "asc",
          "desc",
        ]),
        companyName: s.string("Company name substring."),
        name: s.string("Name prefix."),
        email: s.string("Exact email address."),
        tel: s.string("Telephone number substring."),
        mobile: s.string("Mobile number substring."),
        tagIds: s.array("Filter by one or more Sansan tag IDs.", s.nonEmptyString("A tag ID.")),
      },
      { required: [] },
    ),
    outputSchema: businessCardPageSchema,
  }),
  defineProviderAction("sansan", {
    name: "get_business_card",
    operationType: "read",
    description: "Get a business card by ID. Sansan may return the latest merged card with a different ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Business card lookup.",
      {
        businessCardId: s.nonEmptyString("The Sansan business card ID."),
        includeTags: s.boolean("Include attached tags and treat tag changes as business card updates."),
      },
      { required: ["businessCardId"] },
    ),
    outputSchema: businessCardSchema,
  }),
  defineProviderAction("sansan", {
    name: "get_person",
    operationType: "read",
    description: "Get the latest business card for a Sansan person, optionally including tags.",
    requiredScopes: [],
    inputSchema: s.object(
      "Person lookup.",
      {
        personId: s.nonEmptyString("The Sansan person ID."),
        includeTags: s.boolean("Include attached tags and treat tag changes as business card updates."),
      },
      { required: ["personId"] },
    ),
    outputSchema: businessCardSchema,
  }),
  defineProviderAction("sansan", {
    name: "list_business_card_tags",
    operationType: "read",
    description: "List tags attached to a Sansan business card.",
    requiredScopes: [],
    inputSchema: s.object(
      "Business card tag query.",
      {
        businessCardId: s.nonEmptyString("The Sansan business card ID."),
        nextPageToken: s.nonEmptyString(
          "Continue a previous query using its nextPageToken; original query parameters are inherited.",
        ),
        limit: s.integer("Maximum records per page, from 1 to 300; defaults to 100.", {
          minimum: 1,
          maximum: 300,
        }),
      },
      { required: ["businessCardId"] },
    ),
    outputSchema: tagPageSchema,
  }),
  defineProviderAction("sansan", {
    name: "list_tags",
    operationType: "read",
    description: "List Sansan tags by ownership, visibility, owner user, and tag name.",
    requiredScopes: [],
    inputSchema: s.object(
      "Tag query filters.",
      {
        nextPageToken: s.nonEmptyString(
          "Continue a previous query using its nextPageToken; original query parameters are inherited.",
        ),
        limit: s.integer("Maximum records per page, from 1 to 300; defaults to 100.", {
          minimum: 1,
          maximum: 300,
        }),
        range: s.stringEnum("Record ownership scope: me or all accessible records; defaults to me.", ["me", "all"]),
        type: s.array(
          "Tag visibility types to include.",
          s.stringEnum("A tag visibility type.", ["private", "public", "shared"]),
        ),
        ownerUserId: s.string("Tag owner user ID, effective only when range is all.", {
          maxLength: 20,
        }),
        tagName: s.string("Tag name substring.", { maxLength: 50 }),
      },
      { required: [] },
    ),
    outputSchema: tagPageSchema,
  }),
  defineProviderAction("sansan", {
    name: "list_contact_reports",
    operationType: "read",
    description:
      "List Sansan contact reports updated within a time interval, including meetings, calls, emails, and business card exchanges.",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Contact report query filters.",
        {
          nextPageToken: s.nonEmptyString(
            "Continue a previous query using its nextPageToken; original query parameters are inherited.",
          ),
          limit: s.integer("Maximum records per page, from 1 to 300; defaults to 100.", {
            minimum: 1,
            maximum: 300,
          }),
          updatedFrom: s.string(
            "Start of the update interval as an ISO 8601 timestamp with timezone. Required on the first page.",
            { format: "date-time" },
          ),
          updatedTo: s.string(
            "End of the update interval as an ISO 8601 timestamp with timezone. Required on the first page.",
            { format: "date-time" },
          ),
          range: s.stringEnum("Record ownership scope: me or all accessible records; defaults to me.", ["me", "all"]),
          category: s.array("Exact category names to include.", s.string("A report category.")),
          type: s.array(
            "Contact report types to include.",
            s.stringEnum("A contact report type.", ["Meeting", "Call", "Email", "BizCardExchange", "OnlineMeeting"]),
          ),
          orderBy: s.stringEnum("Sort field; defaults to updatedAt.", ["registeredAt", "updatedAt"]),
          orderDirection: s.stringEnum("Sort direction; defaults to desc.", ["asc", "desc"]),
        },
        { required: [] },
      ),
      anyOf: [{ required: ["nextPageToken"] }, { required: ["updatedFrom", "updatedTo"] }],
    },
    outputSchema: reportPageSchema,
  }),
];
