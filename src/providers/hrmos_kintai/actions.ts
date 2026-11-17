import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { attendanceActions } from "./attendance-actions.ts";
import { businessActions } from "./business-actions.ts";
import { exportActions } from "./export-actions.ts";
import {
  pagination,
  employeeRecord,
  namedRecord,
  segmentRecord,
  attendanceRecord,
  reportRecord,
  stampRecord,
  leaveRecord,
  listOutput,
} from "./schemas.ts";

export const hrmosKintaiActions: ActionDefinition[] = [
  ...attendanceActions,
  ...businessActions,
  ...exportActions,
  defineProviderAction("hrmos_kintai", {
    name: "list_employees",
    operationType: "read",
    description: "List employees in the connected HRMOS Kintai company.",
    inputSchema: s.object(
      "Filters for list_employees.",
      {
        ...pagination,
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(employeeRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_departments",
    operationType: "read",
    description: "List departments in the connected company.",
    inputSchema: s.object(
      "Filters for list_departments.",
      {
        ...pagination,
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(namedRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_employment_types",
    operationType: "read",
    description: "List employment types in the connected company.",
    inputSchema: s.object(
      "Filters for list_employment_types.",
      {
        ...pagination,
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(namedRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_workplaces",
    operationType: "read",
    description: "List workplaces, optionally filtered by prefecture.",
    inputSchema: s.object(
      "Filters for list_workplaces.",
      {
        ...pagination,
        prefectureId: s.integer("Filter workplaces by prefecture ID."),
      },
      { optional: ["prefectureId", "limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(namedRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_work_segments",
    operationType: "read",
    description: "List work classifications and their configured working hours.",
    inputSchema: s.object(
      "Filters for list_work_segments.",
      {
        ...pagination,
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(segmentRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_leave_types",
    operationType: "read",
    description: "List leave settings used to query employee leave balances and history.",
    inputSchema: s.object(
      "Filters for list_leave_types.",
      {
        ...pagination,
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(namedRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_daily_attendance",
    operationType: "read",
    description: "List attendance records for all employees on a specified day.",
    inputSchema: s.object(
      "Filters for list_daily_attendance.",
      {
        ...pagination,
        day: s.string("Target date in YYYY-MM-DD format.", { format: "date" }),
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(attendanceRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_monthly_attendance",
    operationType: "read",
    description:
      "List daily attendance records for a month, respecting each employee's cutoff date. Optionally filter by employee ID.",
    inputSchema: s.object(
      "Filters for list_monthly_attendance.",
      {
        ...pagination,
        month: s.string("Target month in YYYY-MM format. Attendance detail respects employee cutoff dates.", {
          pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
        }),
        employeeId: s.integer("HRMOS employee ID."),
      },
      { optional: ["employeeId", "limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(attendanceRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_monthly_reports",
    operationType: "read",
    description:
      "List monthly attendance summaries, optionally filtered by employee numbers and month-closing statuses.",
    inputSchema: s.object(
      "Filters for list_monthly_reports.",
      {
        ...pagination,
        month: s.string("Target month in YYYY-MM format. Attendance detail respects employee cutoff dates.", {
          pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
        }),
        employeeNumbers: s.array(
          "Employee numbers to include; omit to include all employees.",
          s.string("Employee number.", { minLength: 1 }),
          { minItems: 1 },
        ),
        statuses: s.array(
          "Month-closing statuses: 0 not submitted, 1 ready, 2 pending, 3 approved, 99 forcibly approved.",
          { ...s.integer("One month-closing status."), enum: [0, 1, 2, 3, 99] },
          { minItems: 1, uniqueItems: true },
        ),
      },
      { optional: ["employeeNumbers", "statuses", "limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(reportRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_daily_stamp_logs",
    operationType: "read",
    description: "List clock-in, clock-out and break punch history for a specified day.",
    inputSchema: s.object(
      "Filters for list_daily_stamp_logs.",
      {
        ...pagination,
        day: s.string("Target date in YYYY-MM-DD format.", { format: "date" }),
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(stampRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_employee_stamp_logs",
    operationType: "read",
    description: "List an employee's punch history, optionally filtered by punch type and update time.",
    inputSchema: s.object(
      "Filters for list_employee_stamp_logs.",
      {
        ...pagination,
        employeeId: s.integer("HRMOS employee ID."),
        stampType: {
          ...s.integer("Punch type: 1 clock-in, 2 clock-out, 7 break start, 8 break end."),
          enum: [1, 2, 7, 8],
        },
      },
      { optional: ["stampType", "limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(stampRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_employee_leave_history",
    operationType: "read",
    description:
      "List an employee's leave grants, usage, adjustments and remaining balances for a leave setting and year.",
    inputSchema: s.object(
      "Filters for list_employee_leave_history.",
      {
        ...pagination,
        leaveTypeId: s.integer("Leave setting ID returned by list_leave_types."),
        employeeId: s.integer("HRMOS employee ID."),
        year: s.integer("Target leave year."),
      },
      { optional: ["limit", "page", "from", "to"] },
    ),
    outputSchema: listOutput(leaveRecord),
  }),
];
