import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion, handleApiVersion, recordId, itemsResult } from "./schemas.ts";
const reportId = recordId;
const includeDetails = s.boolean("Include detail rows as well as report summaries.");
const metadata = s.looseObject(
  "Official reportMetadata overrides, including filters, groupings, aggregates and date filters; does not save the report.",
);
const report = s.looseObject("Report results preserving factMap, groupings, detail columns and metadata.", {
  factMap: s.looseObject("Report facts keyed by grouping coordinates."),
  allData: s.boolean("Whether all report results are included."),
  reportMetadata: s.looseObject("Report metadata."),
  reportExtendedMetadata: s.looseObject("Column and aggregate metadata."),
});
const reportHandle = s.requiredObject("Report run handle; preserve all fields for polling.", {
  reportId,
  instanceId: recordId,
  apiVersion: handleApiVersion,
});
const reportRun = s.object(
  "Asynchronous report run.",
  { handle: reportHandle, state: s.string("Salesforce run state: New, Running, Success or Error."), report },
  { optional: ["report"] },
);
const dashboardParams = {
  apiVersion,
  dashboardId: recordId,
  runningUser: recordId,
  filter1: s.string("First dashboard filter option ID."),
  filter2: s.string("Second dashboard filter option ID."),
  filter3: s.string("Third dashboard filter option ID."),
};
const dashboard = s.looseObject("Dashboard metadata, component data and status.", {
  dashboardMetadata: s.looseObject("Dashboard metadata."),
  componentData: s.array("Dashboard components and their report data.", s.looseObject("Dashboard component.")),
});
export const salesforceAnalyticsActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_reports",
    description:
      "List up to 200 recently viewed reports. For all accessible reports, query the Report object with SOQL.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion }),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "describe_report",
    description: "Get report, report-type and extended metadata including available filter fields.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, reportId }, ["reportId"]),
    outputSchema: s.looseObject("Report definition.", {
      reportMetadata: metadata,
      reportTypeMetadata: s.looseObject("Report type fields and filters."),
      reportExtendedMetadata: s.looseObject("Extended report metadata."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "run_report",
    description: "Run a report synchronously with optional temporary metadata overrides; does not save changes.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, reportId, includeDetails, metadata }, ["reportId"]),
    outputSchema: report,
  }),
  defineProviderAction("salesforce", {
    name: "submit_report",
    description: "Start an asynchronous report run and return a handle for get_report_result.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, reportId, includeDetails, metadata }, ["reportId"]),
    outputSchema: reportRun,
    asyncLifecycle: {
      startActionId: "salesforce.submit_report",
      statusActionId: "salesforce.get_report_result",
    },
  }),
  defineProviderAction("salesforce", {
    name: "get_report_result",
    description: "Get the state and results of an asynchronous report. Empty factMap is a valid successful result.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, handle: reportHandle }, ["handle"]),
    outputSchema: reportRun,
    asyncLifecycle: {
      startActionId: "salesforce.submit_report",
      statusActionId: "salesforce.get_report_result",
    },
  }),
  defineProviderAction("salesforce", {
    name: "list_dashboards",
    description: "List recently viewed dashboards. Query the Dashboard object with SOQL for broader discovery.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion }),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "get_dashboard",
    description: "Retrieve dashboard metadata, component data and status with optional filters.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(dashboardParams, ["dashboardId"]),
    outputSchema: dashboard,
  }),
  defineProviderAction("salesforce", {
    name: "refresh_dashboard",
    description: "Request a dashboard refresh; inspect get_dashboard_status before reading refreshed data.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(dashboardParams, ["dashboardId"]),
    outputSchema: s.object(
      "Dashboard refresh acknowledgement.",
      { statusUrl: s.string("Relative Salesforce URL to check the dashboard refresh status.") },
      { required: ["statusUrl"], additionalProperties: true },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_dashboard_status",
    description: "Get refresh status for each dashboard component.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(dashboardParams, ["dashboardId"]),
    outputSchema: s.looseObject("Dashboard refresh state.", {
      componentStatus: s.array(
        "Component refresh states and dates.",
        s.looseObject("Component status.", {
          componentId: s.string("Component ID."),
          refreshStatus: s.string("Component refresh state, IDLE or RUNNING."),
          refreshDate: s.string("Last refresh timestamp."),
        }),
      ),
    }),
  }),
];
