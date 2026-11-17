import type { SalesforceHandler } from "./context.ts";

import {
  providerInputError,
  providerResponseError,
  requiredResponseRecord,
  requiredInputString,
} from "../provider-runtime.ts";
import { queryPath } from "./context.ts";
export const salesforceApprovalHandlers: Record<string, SalesforceHandler> = {
  async list_approval_processes(d, c) {
    const response = await c.object(`${c.base}/process/approvals/`);
    const processes = requiredResponseRecord(response.approvals, "Salesforce approval processes");
    return {
      processes:
        d.objectName === undefined
          ? processes
          : Object.fromEntries(Object.entries(processes).filter(([name]) => name === d.objectName)),
    };
  },
  async submit_for_approval(d, c) {
    return c.items(`${c.base}/process/approvals/`, "POST", {
      requests: (d.requests as Record<string, unknown>[]).map(({ recordId, submitterId, ...rest }) => ({
        ...rest,
        actionType: "Submit",
        contextId: recordId,
        contextActorId: submitterId,
      })),
    });
  },
  async review_approval_requests(d, c) {
    return c.items(`${c.base}/process/approvals/`, "POST", {
      requests: (d.requests as Record<string, unknown>[]).map(({ workItemId, decision, ...rest }) => ({
        ...rest,
        actionType: decision === "approve" ? "Approve" : "Reject",
        contextId: workItemId,
      })),
    });
  },
  async list_pending_approvals(d, c) {
    if ((d.scope === "actor") !== (d.actorId !== undefined))
      throw providerInputError("actorId is required only for actor scope");
    let actorId = d.actorId;
    if (d.scope === "mine") {
      actorId = requiredInputString(c.providerSecret?.userId, "Salesforce user ID");
      if (!/^[A-Za-z0-9]{15}([A-Za-z0-9]{3})?$/.test(String(actorId)))
        throw providerResponseError("Salesforce returned an invalid user ID");
    }
    const filters = [];
    if (actorId) filters.push(`ActorId = '${actorId}'`);
    if (d.recordId) filters.push(`ProcessInstance.TargetObjectId = '${d.recordId}'`);
    const soql =
      "SELECT Id, ProcessInstanceId, ProcessInstance.TargetObjectId, ActorId, OriginalActorId, CreatedDate FROM ProcessInstanceWorkitem" +
      (d.scope === "mineAndGroups" ? " USING SCOPE mine_and_my_groups" : "") +
      (filters.length ? ` WHERE ${filters.join(" AND ")}` : "") +
      " ORDER BY CreatedDate DESC, Id DESC";
    return c.object(queryPath(`${c.base}/query`, { q: soql }));
  },
};
