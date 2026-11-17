import type { SalesforceHandler } from "./context.ts";

import { recordOrEmpty } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
function invocablePath(d: Record<string, unknown>, base: string, detail: boolean) {
  if (d.category === "standard" && d.actionType !== undefined)
    throw providerInputError("actionType is only valid for custom actions");
  if (d.category === "custom" && detail && !d.actionType) throw providerInputError("Custom actions require actionType");
  return `${base}/actions/${segment(d.category)}${d.actionType ? `/${segment(d.actionType)}` : ""}${detail ? `/${segment(d.actionName)}` : ""}`;
}
async function sendEmail(d: Record<string, unknown>, c: Parameters<SalesforceHandler>[1]) {
  const email = recordOrEmpty(d.email);
  const recipients = [email.recipientAddresses, email.ccAddresses, email.bccAddresses].reduce<number>(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    email.recipientId ? 1 : 0,
  );
  if (!recipients || recipients > 150) throw providerInputError("Email requires between 1 and 150 recipients");
  if (email.senderType === "OrgWideEmailAddress" && !email.senderAddress)
    throw providerInputError("OrgWideEmailAddress requires senderAddress");
  if (email.logEmailOnSend && !email.recipientId && !email.relatedRecordId)
    throw providerInputError("logEmailOnSend requires recipientId or relatedRecordId");
  return c.items(`${c.base}/actions/standard/emailSimple`, "POST", { inputs: [email] });
}
export const salesforceAutomationHandlers: Record<string, SalesforceHandler> = {
  async list_email_templates(d, c) {
    const filters = [
      d.includeInactive ? undefined : "IsActive = true",
      d.folderId ? `FolderId = '${String(d.folderId)}'` : undefined,
    ].filter(Boolean);
    const q = `SELECT Id, Name, DeveloperName, Subject, TemplateType, FolderId, IsActive FROM EmailTemplate${filters.length ? ` WHERE ${filters.join(" AND ")}` : ""} ORDER BY Name LIMIT ${d.limit ?? 200}`;
    return c.object(queryPath(`${c.base}/query`, { q }));
  },
  async get_email_template(d, c) {
    return {
      record: await c.object(
        queryPath(`${c.base}/sobjects/EmailTemplate/${segment(d.templateId)}`, {
          fields: "Id,Name,DeveloperName,Subject,Body,HtmlValue,TemplateType,FolderId,IsActive",
        }),
      ),
    };
  },
  send_email: sendEmail,
  send_email_from_template: sendEmail,
  async list_invocable_actions(d, c) {
    return { result: await c.request(invocablePath(d, c.base, false)) };
  },
  async describe_invocable_action(d, c) {
    return { result: await c.request(invocablePath(d, c.base, true)) };
  },
  async invoke_action(d, c) {
    return c.items(invocablePath(d, c.base, true), "POST", { inputs: d.inputs });
  },
  async list_quick_actions(d, c) {
    return {
      result: await c.request(`${c.base}${d.objectName ? `/sobjects/${segment(d.objectName)}` : ""}/quickActions/`),
    };
  },
  async get_quick_action_defaults(d, c) {
    return {
      result: await c.request(
        `${c.base}/sobjects/${segment(d.objectName)}/quickActions/${segment(d.actionName)}/defaultValues/${d.contextId ? segment(d.contextId) : ""}`,
      ),
    };
  },
  async execute_quick_action(d, c) {
    return {
      result: await c.request(
        `${c.base}${d.objectName ? `/sobjects/${segment(d.objectName)}` : ""}/quickActions/${segment(d.actionName)}`,
        "POST",
        { contextId: d.contextId, record: d.fields },
      ),
    };
  },
};
