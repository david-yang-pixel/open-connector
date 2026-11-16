import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion, apiName, recordId, objectName, fields, itemsResult, queryResult } from "./schemas.ts";
const actionPath = {
  category: s.stringEnum(["standard", "custom"], { description: "Standard action or custom invocable action." }),
  actionType: apiName,
  actionName: s.string("Action API name, including namespace or object prefix when documented.", {
    pattern: "^[A-Za-z][A-Za-z0-9_.]*$",
  }),
};
const addresses = s.array(
  "Recipient email addresses; combined recipients must not exceed 150.",
  s.email("Email address."),
  { maxItems: 150 },
);
const emailFields = {
  recipientAddresses: addresses,
  ccAddresses: addresses,
  bccAddresses: addresses,
  recipientId: recordId,
  relatedRecordId: recordId,
  senderType: s.stringEnum(["CurrentUser", "DefaultWorkflowUser", "OrgWideEmailAddress"], {
    description: "Sender identity selection.",
  }),
  senderAddress: s.email("Organization-wide sender email; required for OrgWideEmailAddress."),
  attachmentIdCollection: s.array("Document, ContentVersion or Attachment IDs.", recordId),
  logEmailOnSend: s.boolean("Log the email to recipientId or relatedRecordId; requires at least one of those IDs."),
  addThreadingTokenToBody: s.boolean("Add a related-record threading token to the email body."),
  addThreadingTokenToSubject: s.boolean("Add a related-record threading token to the subject."),
};
const quick = { apiVersion, objectName, actionName: actionPath.actionName, contextId: recordId };
export const salesforceAutomationActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_email_templates",
    description: "List accessible active email templates using SOQL; use query_more for subsequent pages.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({
      apiVersion,
      folderId: recordId,
      includeInactive: s.boolean("Also include inactive templates."),
      limit: s.integer("Maximum templates to return.", { minimum: 1, maximum: 2000 }),
    }),
    outputSchema: queryResult,
  }),
  defineProviderAction("salesforce", {
    name: "get_email_template",
    description: "Retrieve an email template's metadata, text body and HTML content.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, templateId: recordId }, ["templateId"]),
    outputSchema: s.actionOutput({ record: s.looseObject("EmailTemplate fields.") }, "Email template."),
  }),
  defineProviderAction("salesforce", {
    name: "send_email",
    description:
      "Send email through Salesforce emailSimple and return each action result; inspect isSuccess and errors.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        email: s.object(
          "Email content and delivery options.",
          {
            ...emailFields,
            emailBody: s.string("Email body."),
            emailSubject: s.string("Email subject."),
            sendRichBody: s.boolean("Treat the email body as rich text."),
            useLineBreaks: s.boolean("Render line breaks in a rich-text body."),
          },
          { required: ["emailBody", "emailSubject"] },
        ),
      },
      ["email"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "send_email_from_template",
    description: "Send a Salesforce template email with merge fields; requires a recipient Contact or Lead ID.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        email: s.object(
          "Template email and delivery options.",
          { ...emailFields, emailTemplateId: recordId },
          { required: ["recipientId", "emailTemplateId"] },
        ),
      },
      ["email"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "list_invocable_actions",
    description: "Discover standard actions, custom action categories, or actions in a custom category.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, category: actionPath.category, actionType: apiName }, ["category"]),
    outputSchema: s.actionOutput(
      { result: s.unknown("Salesforce action discovery response.") },
      "Available invocable actions or categories.",
    ),
  }),
  defineProviderAction("salesforce", {
    name: "describe_invocable_action",
    description: "Describe an invocable action's inputs and outputs before calling it.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, ...actionPath }, ["category", "actionName"]),
    outputSchema: s.actionOutput({ result: s.unknown("Salesforce action definition response.") }, "Action definition."),
  }),
  defineProviderAction("salesforce", {
    name: "invoke_action",
    description:
      "Invoke a standard action or custom Flow/Apex action. Dynamic actions may delete data or perform other destructive operations.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        ...actionPath,
        inputs: s.array(
          "One parameter map per action invocation.",
          s.looseObject("Action-specific parameters discovered through describe_invocable_action."),
          { minItems: 1 },
        ),
      },
      ["category", "actionName", "inputs"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "list_quick_actions",
    description: "List global quick actions or quick actions for a specified object.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName }),
    outputSchema: s.actionOutput(
      { result: s.unknown("Salesforce quick-action discovery response.") },
      "Available quick actions.",
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_quick_action_defaults",
    description: "Get default field values for an object-specific quick action, optionally in a record context.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(quick, ["objectName", "actionName"]),
    outputSchema: s.actionOutput({ result: s.unknown("Evaluated default field values.") }, "Quick-action defaults."),
  }),
  defineProviderAction("salesforce", {
    name: "execute_quick_action",
    description: "Execute a global or object-specific quick action with field values and optional record context.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ ...quick, fields }, ["actionName", "fields"]),
    outputSchema: s.actionOutput(
      { result: s.unknown("Salesforce quick-action result including per-record errors.") },
      "Quick-action execution result.",
    ),
  }),
];
