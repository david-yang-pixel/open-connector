import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion } from "./schemas.ts";
import { recordId } from "./schemas.ts";
export const salesforceLeadActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "convert_leads",
    description:
      "Convert up to 100 Leads using native Salesforce conversion. Query LeadStatus for a valid convertedStatus. Inspect each result for partial failures. Queue-owned leads require an explicit user ownerId.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        conversions: s.array(
          "Ordered lead conversions.",
          s.object(
            "Lead conversion options.",
            {
              leadId: recordId,
              convertedStatus: s.string("Converted LeadStatus label chosen by the caller.", {
                minLength: 1,
              }),
              accountId: {
                ...recordId,
                description: "Existing target Account ID, including an existing Person Account.",
              },
              contactId: {
                ...recordId,
                description: "Existing Contact ID belonging to accountId; do not set for a Person Account.",
              },
              opportunityId: {
                ...recordId,
                description:
                  "Existing Opportunity ID; mutually exclusive with opportunityName and doNotCreateOpportunity=true.",
              },
              opportunityName: s.string("New opportunity name; omit to use the lead company name.", {
                maxLength: 80,
              }),
              doNotCreateOpportunity: s.boolean(
                "Skip opportunity creation when true; incompatible with opportunityId and opportunityName.",
              ),
              overwriteLeadSource: s.boolean(
                "Overwrite the existing contact LeadSource; requires contactId when true.",
              ),
              ownerId: {
                ...recordId,
                description: "User ID to own newly created records; required for queue-owned leads.",
              },
              relatedPersonAccountId: {
                ...recordId,
                description:
                  "Existing Person Account when converting to a business account and a Person Account instead of a contact.",
              },
              relatedPersonAccountRecord: s.object(
                "New Person Account entity when converting to a business account and a Person Account instead of a contact.",
                {
                  fields: s.record(
                    "Writable Person Account field API names and scalar values.",
                    s.nullable(
                      s.anyOf("Scalar field value.", [
                        s.string("Text field value."),
                        s.number("Numeric field value."),
                        s.boolean("Boolean field value."),
                      ]),
                    ),
                  ),
                },
                {
                  optional: [],
                },
              ),
              sendNotificationEmail: s.boolean("Send a notification email to the specified owner when true."),
            },
            {
              optional: [
                "accountId",
                "contactId",
                "opportunityId",
                "opportunityName",
                "doNotCreateOpportunity",
                "overwriteLeadSource",
                "ownerId",
                "relatedPersonAccountId",
                "relatedPersonAccountRecord",
                "sendNotificationEmail",
              ],
            },
          ),
          { minItems: 1, maxItems: 100 },
        ),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: s.object(
      "Ordered conversion results.",
      {
        results: s.array(
          "One result per conversion.",
          s.object(
            "Conversion outcome and upstream errors.",
            {
              success: s.boolean("Whether this lead converted successfully."),
              leadId: s.nullable({
                ...recordId,
                description: "Converted Lead ID, or null when Salesforce does not return an ID.",
              }),
              accountId: s.nullable(recordId),
              contactId: s.nullable(recordId),
              opportunityId: s.nullable(recordId),
              errors: s.array(
                "Conversion errors.",
                s.looseObject("Salesforce error code, message and affected fields."),
              ),
            },
            {
              required: ["success", "errors"],
              additionalProperties: true,
            },
          ),
        ),
      },
      {
        optional: [],
      },
    ),
  }),
];
