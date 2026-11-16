import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
const ownerSchema = s.object(
  "The business card or tag owner.",
  {
    id: s.string("The owner user ID."),
    name: s.string("The owner name."),
    email: s.string("The owner email address."),
  },
  { additionalProperties: true, required: [] },
);
const tagSchema = s.object(
  "A Sansan tag, with additional upstream fields preserved.",
  {
    id: s.string("The tag ID."),
    name: s.string("The tag name."),
    type: s.string("The tag visibility: private, public, or shared."),
    owner: ownerSchema,
  },
  { additionalProperties: true, required: [] },
);
export const businessCardSchema: JsonSchema = s.object(
  "A business card with contact details; additional Sansan fields are preserved.",
  {
    id: s.nullable(s.string("The business card ID.")),
    companyId: s.nullable(s.string("The company ID.")),
    personId: s.nullable(s.string("The person ID.")),
    firstName: s.nullable(s.string("The first name.")),
    lastName: s.nullable(s.string("The last name.")),
    companyName: s.nullable(s.string("The company name.")),
    departmentName: s.nullable(s.string("The department name.")),
    title: s.nullable(s.string("The job title.")),
    email: s.nullable(s.string("The email address.")),
    tel: s.nullable(s.string("The telephone number.")),
    mobile: s.nullable(s.string("The mobile phone number.")),
    exchangeDate: s.nullable(s.string("The business card exchange date.")),
    registeredTime: s.nullable(s.string("The registration timestamp.")),
    updatedTime: s.nullable(s.string("The last update timestamp.")),
    entryStatus: s.nullable(s.string("The digitization status.")),
    owner: ownerSchema,
    tags: s.array("Tags attached to the business card when requested.", tagSchema),
  },
  { additionalProperties: true, required: [] },
);
export const userSchema: JsonSchema = s.object(
  "The Sansan user associated with the API key.",
  {
    id: s.string("The user ID."),
    name: s.string("The user name."),
    userType: s.string("The user role in Sansan."),
    canUpdateData: s.boolean("Whether the user can update all data."),
    departments: s.array(
      "Departments the user belongs to.",
      s.object(
        "A user department.",
        {
          name: s.string("The department name."),
        },
        { additionalProperties: true, required: [] },
      ),
    ),
  },
  { additionalProperties: true, required: [] },
);
export const reportSchema: JsonSchema = s.object(
  "A contact report with meeting or communication details and additional upstream fields.",
  {
    id: s.string("Contact report ID."),
    registeredTime: s.string("Contact report registration timestamp."),
    updatedTime: s.string("Contact report update timestamp."),
    startDate: s.string("Interaction start date."),
    endDate: s.string("Interaction end date."),
    startTime: s.string("Interaction start timestamp."),
    endTime: s.string("Interaction end timestamp."),
    type: s.string("Recorded interaction type."),
    title: s.string("Contact report title."),
    location: s.string("Contact location."),
    memo: s.string("Contact report memo."),
    owner: ownerSchema,
    externalAttendees: s.array(
      "External attendees and their business card and person IDs.",
      s.unknownObject("An external participant with provider-defined contact fields."),
    ),
    internalAttendees: s.array(
      "Internal attendees and their user details.",
      s.unknownObject("An internal participant with provider-defined user fields."),
    ),
    categories: s.array("Categories assigned to the contact report.", s.unknownObject("A category name and value.")),
  },
  { additionalProperties: true, required: [] },
);
export const businessCardPageSchema: JsonSchema = s.object(
  "One page of Sansan records.",
  {
    data: s.array("Records in this page.", businessCardSchema),
    hasMore: s.boolean("Whether another page is available."),
    nextPageToken: s.nullable(
      s.string("The next page token, or null when absent. Tokens expire six hours after the first request."),
    ),
  },
  { additionalProperties: true, required: ["data", "hasMore", "nextPageToken"] },
);
export const tagPageSchema: JsonSchema = s.object(
  "One page of Sansan records.",
  {
    data: s.array("Records in this page.", tagSchema),
    hasMore: s.boolean("Whether another page is available."),
    nextPageToken: s.nullable(
      s.string("The next page token, or null when absent. Tokens expire six hours after the first request."),
    ),
  },
  { additionalProperties: true, required: ["data", "hasMore", "nextPageToken"] },
);
export const reportPageSchema: JsonSchema = s.object(
  "One page of Sansan records.",
  {
    data: s.array("Records in this page.", reportSchema),
    hasMore: s.boolean("Whether another page is available."),
    nextPageToken: s.nullable(
      s.string("The next page token, or null when absent. Tokens expire six hours after the first request."),
    ),
  },
  { additionalProperties: true, required: ["data", "hasMore", "nextPageToken"] },
);
