import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion } from "./schemas.ts";
import { recordId, objectName, queryResult } from "./schemas.ts";
const comments = s.string("Comment recorded in approval history.");
const nextApproverIds = s.array("Explicit next approver user IDs when required by the process.", recordId);
const approvalResults = s.object(
  "Ordered approval results.",
  {
    results: s.array(
      "One result per approval request; inspect success and errors.",
      s.object(
        "Classic approval outcome.",
        {
          success: s.boolean("Whether this approval request succeeded."),
          entityId: s.nullable(s.string("Business record ID being approved.")),
          instanceId: s.nullable(s.string("Approval ProcessInstance ID.")),
          instanceStatus: s.nullable(s.string("Approval instance status, such as Pending, Approved or Rejected.")),
          actorIds: s.nullable(s.array("Currently assigned approver IDs.", recordId)),
          newWorkitemIds: s.array("New pending work item IDs; use these as workItemId for decisions.", recordId),
          errors: s.nullable(
            s.array(
              "Errors for this request, or null when absent.",
              s.looseObject("Salesforce approval error details."),
            ),
          ),
        },
        {
          required: ["success"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    optional: [],
  },
);
export const salesforceApprovalActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_approval_processes",
    description: "List Classic approval process definitions, optionally filtered by object API name.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        objectName,
      },
      { optional: ["apiVersion", "objectName"] },
    ),
    outputSchema: s.object(
      "Approval processes grouped by object API name.",
      {
        processes: s.looseObject("Object names mapped to approval process definitions."),
      },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "submit_for_approval",
    description:
      "Submit records to Classic approval processes. Inspect each result for partial failures; use invoke_action for Flow approvals.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        requests: s.array(
          "Records to submit for approval.",
          s.object(
            "Classic approval submission.",
            {
              recordId,
              comments,
              nextApproverIds,
              submitterId: {
                ...recordId,
                description: "User submitting the record; omit to use the connected user.",
              },
              processDefinitionNameOrId: s.string(
                "Specific process developer name or ID; omit to evaluate processes in configured order.",
              ),
              skipEntryCriteria: s.boolean(
                "Skip entry criteria for the specified process when true; omitted by default.",
              ),
            },
            {
              optional: [
                "comments",
                "nextApproverIds",
                "submitterId",
                "processDefinitionNameOrId",
                "skipEntryCriteria",
              ],
            },
          ),
          { minItems: 1 },
        ),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: approvalResults,
  }),
  defineProviderAction("salesforce", {
    name: "review_approval_requests",
    description:
      "Approve or reject Classic approval work items assigned to the current user. Each item can succeed or fail independently.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        requests: s.array(
          "Approval decisions.",
          s.object(
            "Decision for a pending work item, not a business record.",
            {
              workItemId: {
                ...recordId,
                description: "ProcessInstanceWorkitem ID returned by submission or pending approvals.",
              },
              decision: s.stringEnum("Approval decision.", ["approve", "reject"]),
              comments,
              nextApproverIds,
            },
            { optional: ["comments", "nextApproverIds"] },
          ),
          { minItems: 1 },
        ),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: approvalResults,
  }),
  defineProviderAction("salesforce", {
    name: "list_pending_approvals",
    description:
      "List pending Classic approval work items for yourself, yourself and your groups, or an explicit actor. Use query_more with nextRecordsUrl for subsequent pages; group scope does not imply all delegated approvals.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        scope: s.stringEnum("Whose pending work items to retrieve.", ["mine", "mineAndGroups", "actor"]),
        actorId: { ...recordId, description: "Assigned actor ID; required only for actor scope." },
        recordId: {
          ...recordId,
          description: "Optional business record ID to filter pending approvals.",
        },
      },
      { optional: ["apiVersion", "actorId", "recordId"] },
    ),
    outputSchema: queryResult,
  }),
];
