import type { ActionDefinition } from "../../core/types.ts";

import { salesforceAnalyticsActions } from "./actions-analytics.ts";
import { salesforceApprovalActions } from "./actions-approvals.ts";
import { salesforceAutomationActions } from "./actions-automation.ts";
import { salesforceBaseActions } from "./actions-base.ts";
import { salesforceBulkActions } from "./actions-bulk.ts";
import { salesforceChatterActions } from "./actions-chatter.ts";
import { salesforceDataActions } from "./actions-data.ts";
import { salesforceFileActions } from "./actions-files.ts";
import { salesforceKnowledgeActions } from "./actions-knowledge.ts";
import { salesforceLeadActions } from "./actions-leads.ts";
import { salesforcePlatformActions } from "./actions-platform.ts";
export const salesforceActions: ActionDefinition[] = [
  ...salesforceApprovalActions,
  ...salesforceChatterActions,
  ...salesforceKnowledgeActions,
  ...salesforceLeadActions,
  ...salesforcePlatformActions,
  ...salesforceBaseActions,
  ...salesforceDataActions,
  ...salesforceAnalyticsActions,
  ...salesforceAutomationActions,
  ...salesforceFileActions,
  ...salesforceBulkActions,
];
