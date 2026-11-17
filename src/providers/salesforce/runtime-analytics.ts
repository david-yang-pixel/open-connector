import type { SalesforceHandler } from "./context.ts";

import { recordOrEmpty, requiredString } from "../../core/cast.ts";
import { providerResponseError } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
function reportPath(d: Record<string, unknown>, base: string) {
  return queryPath(`${base}/analytics/reports/${segment(d.reportId)}`, {
    includeDetails: d.includeDetails,
  });
}
function dashboardPath(d: Record<string, unknown>, base: string, suffix = "") {
  return queryPath(`${base}/analytics/dashboards/${segment(d.dashboardId)}${suffix}`, {
    runningUser: d.runningUser,
    filter1: d.filter1,
    filter2: d.filter2,
    filter3: d.filter3,
  });
}
export const salesforceAnalyticsHandlers: Record<string, SalesforceHandler> = {
  async list_reports(_d, c) {
    return c.items(`${c.base}/analytics/reports`);
  },
  async describe_report(d, c) {
    return c.object(`${c.base}/analytics/reports/${segment(d.reportId)}/describe`);
  },
  async run_report(d, c) {
    return c.object(
      reportPath(d, c.base),
      d.metadata === undefined ? "GET" : "POST",
      d.metadata === undefined ? undefined : { reportMetadata: d.metadata },
    );
  },
  async submit_report(d, c) {
    const response = await c.object(
      queryPath(`${c.base}/analytics/reports/${segment(d.reportId)}/instances`, {
        includeDetails: d.includeDetails,
      }),
      "POST",
      d.metadata === undefined ? undefined : { reportMetadata: d.metadata },
    );
    // Submit responses put instance fields at the root; result responses use attributes.
    const handle = {
      reportId: d.reportId,
      instanceId: requiredString(response.id, "report instance ID", providerResponseError),
      apiVersion: c.version,
    };
    return { handle, state: requiredString(response.status, "report state", providerResponseError) };
  },
  async get_report_result(d, c) {
    const handle = recordOrEmpty(d.handle);
    const report = await c.object(
      `/services/data/v${segment(handle.apiVersion)}/analytics/reports/${segment(handle.reportId)}/instances/${segment(handle.instanceId)}`,
    );
    return {
      handle,
      state: requiredString(recordOrEmpty(report.attributes).status, "report state", providerResponseError),
      report,
    };
  },
  async list_dashboards(_d, c) {
    return c.items(`${c.base}/analytics/dashboards`);
  },
  async get_dashboard(d, c) {
    return c.object(dashboardPath(d, c.base));
  },
  async refresh_dashboard(d, c) {
    return c.object(dashboardPath(d, c.base), "PUT");
  },
  async get_dashboard_status(d, c) {
    return c.object(dashboardPath(d, c.base, "/status"));
  },
};
