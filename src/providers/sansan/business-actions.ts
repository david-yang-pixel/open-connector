import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { sansanFileSchema } from "./file-schema.ts";
import { businessCardSchema, reportSchema } from "./schemas.ts";

export const sansanBusinessActions: ActionDefinition[] = [
  defineProviderAction("sansan", {
    name: "create_business_card",
    description: "Create a Sansan business card, optionally for another user through the administrator import API.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Business card fields. At least one non-empty companyName, firstName, or lastName is required.",
        {
          ownerUserId: s.nonEmptyString(
            "Optional record owner user ID. When provided, use the system-administrator import API; the user must belong to the same company and contract. Omit to create for the connected user.",
          ),
          lastName: s.nullable(s.string("Last name.", { maxLength: 250 })),
          firstName: s.nullable(s.string("First name.", { maxLength: 250 })),
          lastNameReading: s.nullable(
            s.string("Last name reading in kana; do not use kanji, hiragana, or full-width alphanumeric characters.", {
              maxLength: 250,
            }),
          ),
          firstNameReading: s.nullable(
            s.string("First name reading in kana; do not use kanji, hiragana, or full-width alphanumeric characters.", {
              maxLength: 250,
            }),
          ),
          departmentName: s.nullable(s.string("Department name.", { maxLength: 250 })),
          title: s.nullable(s.string("Job title.", { maxLength: 250 })),
          companyName: s.nullable(s.string("Company name.", { maxLength: 250 })),
          prefecture: s.nullable(s.string("Prefecture or state.", { maxLength: 250 })),
          city: s.nullable(s.string("City.", { maxLength: 250 })),
          street: s.nullable(s.string("Street address.", { maxLength: 250 })),
          building: s.nullable(s.string("Building.", { maxLength: 250 })),
          email: s.nullable(s.string("Email address.", { maxLength: 250 })),
          mobile: s.nullable(s.string("Mobile number using digits, plus, and hyphen.", { maxLength: 30 })),
          tel: s.nullable(s.string("Telephone number using digits, plus, and hyphen.", { maxLength: 30 })),
          secondTel: s.nullable(s.string("Second telephone number using digits, plus, and hyphen.", { maxLength: 30 })),
          fax: s.nullable(s.string("Fax number using digits, plus, and hyphen.", { maxLength: 30 })),
          url: s.nullable(s.string("Website URL.", { maxLength: 250 })),
          memo: s.nullable(s.string("Memo.", { maxLength: 2000 })),
          exchangeDate: s.nullable(s.string("Business card exchange date, YYYY-MM-DD.", { format: "date" })),
          countryCode: s.nullable(
            s.string("ISO 3166-1 alpha-2 country code or AUTO to infer the country from contact information."),
          ),
          postalCode: s.nullable(
            s.string(
              "Postal code: alphanumeric, hyphens and spaces; at most ten characters excluding hyphens and spaces.",
            ),
          ),
          tagIds: s.array("Existing tag IDs to attach, at most fifteen.", s.nonEmptyString("An existing tag ID."), {
            maxItems: 15,
          }),
          sharingPermissions: s.nullable(
            s.object(
              "Per-field visibility settings.",
              {
                companyInformation: s.nullable(s.boolean("Whether to share company information.")),
                name: s.nullable(s.boolean("Whether to share the name.")),
                exchangeDate: s.nullable(s.boolean("Whether to share the exchange date.")),
                contact: s.nullable(s.boolean("Whether to share contact details.")),
                mobile: s.nullable(s.boolean("Whether to share the mobile number.")),
                email: s.nullable(s.boolean("Whether to share the email address.")),
                memo: s.nullable(s.boolean("Whether to share the memo.")),
                others: s.nullable(s.boolean("Whether to share other information.")),
              },
              { required: [] },
            ),
          ),
        },
        { required: [] },
      ),
      anyOf: [
        {
          required: ["companyName"],
          properties: { companyName: { type: "string", minLength: 1 } },
        },
        { required: ["firstName"], properties: { firstName: { type: "string", minLength: 1 } } },
        { required: ["lastName"], properties: { lastName: { type: "string", minLength: 1 } } },
      ],
    },
    outputSchema: businessCardSchema,
  }),
  defineProviderAction("sansan", {
    name: "upload_business_card_image",
    description:
      "Submit JPEG business card images for paid Sansan digitization. Optionally use administrator import for another owner.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Image URLs and digitization options.",
      {
        ownerUserId: s.nonEmptyString(
          "Optional record owner user ID. When provided, use the system-administrator import API; the user must belong to the same company and contract. Omit to create for the connected user.",
        ),
        frontImageUrl: s.string("Public URL of the front JPEG image, at most 5 MB.", {
          format: "uri",
        }),
        backImageUrl: s.string("Public URL of the optional back JPEG image, at most 5 MB.", {
          format: "uri",
        }),
        exchangeDate: s.string("Business card exchange date, YYYY-MM-DD.", { format: "date" }),
        prioritizeHandWrittenDates: s.boolean("Use a handwritten date on the image as the exchange date."),
        memo: s.string("Memo attached to the imported card.", { maxLength: 2000 }),
        languages: s.array(
          "Requested digitization languages, at most two.",
          s.stringEnum("A supported digitization language.", [
            "Japanese",
            "English",
            "Chinese",
            "Korean",
            "Spanish",
            "Portuguese",
            "German",
            "French",
            "Thai",
            "Indonesian",
            "Vietnamese",
          ]),
          { maxItems: 2 },
        ),
        tagIds: s.array("Existing tag IDs to attach, at most fifteen.", s.nonEmptyString("An existing tag ID."), {
          maxItems: 15,
        }),
      },
      { required: ["frontImageUrl"] },
    ),
    outputSchema: s.object(
      "Business cards submitted for paid digitization.",
      {
        data: s.array(
          "Created card identifiers for each requested language.",
          s.object(
            "A card queued for digitization.",
            {
              id: s.string("The created business card ID."),
              language: s.string("The digitization language."),
            },
            { additionalProperties: true, required: [] },
          ),
        ),
      },
      { additionalProperties: true, required: ["data"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "get_business_card_image",
    description: "Download the front or back of a Sansan business card as a JPEG file URL.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Business card image selection.",
      {
        businessCardId: s.nonEmptyString("The Sansan business card ID."),
        side: s.stringEnum("The card side; defaults to front.", ["front", "back"]),
      },
      { required: ["businessCardId"] },
    ),
    outputSchema: sansanFileSchema,
  }),
  defineProviderAction("sansan", {
    name: "create_contact_report",
    description:
      "Create a Sansan contact report. External attendee details also create new business cards; optionally import for another owner as an administrator.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Contact report details.",
      {
        ownerUserId: s.nonEmptyString(
          "Optional record owner user ID. When provided, use the system-administrator import API; the user must belong to the same company and contract. Omit to create for the connected user.",
        ),
        startTime: s.string("Start timestamp with timezone; seconds must be 00.", {
          format: "date-time",
        }),
        endTime: s.string("End timestamp with timezone; seconds must be 00.", {
          format: "date-time",
        }),
        externalAttendees: s.array("External attendees whose details create new business cards.", {
          ...s.object(
            "An external attendee. Sansan creates a new business card from these details.",
            {
              companyName: s.string("Company name.", { maxLength: 250 }),
              lastName: s.string("Last name.", { maxLength: 250 }),
              firstName: s.string("First name.", { maxLength: 250 }),
              email: s.string("Email address.", { maxLength: 250 }),
            },
            { required: [] },
          ),
          anyOf: [
            { required: ["companyName"], properties: { companyName: { minLength: 1 } } },
            { required: ["lastName"], properties: { lastName: { minLength: 1 } } },
            { required: ["firstName"], properties: { firstName: { minLength: 1 } } },
          ],
        }),
        internalAttendeeUserIds: s.array(
          "Internal attendee user IDs; omission defaults to the report owner.",
          s.nonEmptyString("An internal user ID."),
        ),
        type: s.stringEnum("The contact interaction type.", [
          "Meeting",
          "Visit",
          "MeetingAtOffice",
          "Call",
          "OutboundCall",
          "InboundCall",
          "Email",
          "SentEmail",
          "ReceivedEmail",
          "OnlineMeeting",
        ]),
        title: s.string("Contact report title."),
        location: s.string("Contact location."),
        memo: s.string("Contact report memo."),
      },
      { required: ["startTime", "endTime", "externalAttendees", "type"] },
    ),
    outputSchema: reportSchema,
  }),
];
