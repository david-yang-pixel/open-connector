import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { pagination, listOutput, namedRecord } from "./schemas.ts";

export const attendanceActions: ActionDefinition[] = [
  defineProviderAction("hrmos_kintai", {
    name: "list_daily_attendance_differences",
    operationType: "read",
    description: "List daily attendance time differences.",
    inputSchema: s.object(
      "Attendance difference filters.",
      {
        ...pagination,
        day: s.string("Target attendance date.", { format: "date" }),
      },
      { required: ["day"] },
    ),
    outputSchema: listOutput(
      s.looseObject("Differences between the two configured attendance time sources, not an incremental change feed.", {
        first_start_at: s.nullableString("First source start time."),
        second_start_at: s.nullableString("Second source start time."),
        start_at_diff: s.nullableString("Start time difference."),
        end_at_diff: s.nullableString("End time difference."),
      }),
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_monthly_attendance_differences",
    operationType: "read",
    description: "List monthly attendance time differences.",
    inputSchema: s.object(
      "Attendance difference filters.",
      {
        ...pagination,
        month: s.string("Target month in YYYY-MM format, respecting employee cutoff dates.", {
          pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
        }),
        employeeId: s.integer("HRMOS employee ID."),
      },
      { required: ["month"] },
    ),
    outputSchema: listOutput(
      s.looseObject("Differences between the two configured attendance time sources, not an incremental change feed.", {
        first_start_at: s.nullableString("First source start time."),
        second_start_at: s.nullableString("Second source start time."),
        start_at_diff: s.nullableString("Start time difference."),
        end_at_diff: s.nullableString("End time difference."),
      }),
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_daily_time_band_totals",
    operationType: "read",
    description: "List daily working-time totals for custom time bands within the requested month.",
    inputSchema: s.requireAnyProperty(
      s.object(
        "Custom time-band aggregation filters.",
        {
          ...pagination,
          month: s.string("Target month in YYYY-MM format, respecting employee cutoff dates.", {
            pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
          }),
          employeeId: s.integer("HRMOS employee ID."),
          timeBandId: s.integer("Custom time-band ID; provide this or employeeId, or both."),
        },
        { required: ["month"] },
      ),
      ["employeeId", "timeBandId"],
    ),
    outputSchema: listOutput(s.looseObject("HRMOS record with all upstream fields preserved.")),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_monthly_time_band_totals",
    operationType: "read",
    description: "List monthly working-time totals for custom time bands within the requested month.",
    inputSchema: s.requireAnyProperty(
      s.object(
        "Custom time-band aggregation filters.",
        {
          ...pagination,
          month: s.string("Target month in YYYY-MM format, respecting employee cutoff dates.", {
            pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
          }),
          employeeId: s.integer("HRMOS employee ID."),
          timeBandId: s.integer("Custom time-band ID; provide this or employeeId, or both."),
        },
        { required: ["month"] },
      ),
      ["employeeId", "timeBandId"],
    ),
    outputSchema: listOutput(s.looseObject("HRMOS record with all upstream fields preserved.")),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "get_monthly_report_definitions",
    operationType: "read",
    description: "Get field definitions for monthly report.",
    inputSchema: s.object("No input is required.", {}, { required: [] }),
    outputSchema: s.object(
      "Report definitions returned by HRMOS.",
      {
        items: s.array(
          "Available report field definitions.",
          s.looseObject("A report field definition describing a key, label, category and value type.", {
            key: s.string("Report field key."),
            name: s.string("Report field label."),
            item_type: s.string("Fixed or company-defined category."),
            value_type: s.string("Value type: string, number, days or time."),
            active: s.boolean("Whether the report field is active."),
          }),
        ),
      },
      { required: ["items"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_monthly_report_values",
    operationType: "read",
    description: "List monthly report values including company-defined fields.",
    inputSchema: s.object(
      "Monthly report filters.",
      {
        ...pagination,
        month: s.string("Target month in YYYY-MM format, respecting employee cutoff dates.", {
          pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
        }),
        employeeNumbers: s.array("Employee numbers to include.", s.string("Employee number.", { minLength: 1 }), {
          minItems: 1,
        }),
        statuses: s.array(
          "Month-closing statuses: 0 not submitted, 1 ready, 2 pending, 3 approved, 99 forcibly approved.",
          { ...s.integer("One month-closing status."), enum: [0, 1, 2, 3, 99] },
          { minItems: 1, uniqueItems: true },
        ),
      },
      { required: ["month"] },
    ),
    outputSchema: listOutput(
      s.looseObject(
        "Report values preserve upstream strings, nulls and dynamic category arrays; use the matching definitions action to interpret them.",
      ),
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "get_time_band_report_definitions",
    operationType: "read",
    description: "Get field definitions for time band report.",
    inputSchema: s.object("No input is required.", {}, { required: [] }),
    outputSchema: s.object(
      "Report definitions returned by HRMOS.",
      {
        items: s.array(
          "Available report field definitions.",
          s.looseObject("A report field definition describing a key, label, category and value type.", {
            key: s.string("Report field key."),
            name: s.string("Report field label."),
            item_type: s.string("Fixed or company-defined category."),
            value_type: s.string("Value type: string, number, days or time."),
            active: s.boolean("Whether the report field is active."),
          }),
        ),
      },
      { required: ["items"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_time_band_report_values",
    operationType: "read",
    description: "List time band report values including company-defined fields.",
    inputSchema: s.object(
      "Monthly report filters.",
      {
        ...pagination,
        month: s.string("Target month in YYYY-MM format, respecting employee cutoff dates.", {
          pattern: "^[0-9]{4}-(0[1-9]|1[0-2])$",
        }),
      },
      { required: ["month"] },
    ),
    outputSchema: listOutput(
      s.looseObject(
        "Report values preserve upstream strings, nulls and dynamic category arrays; use the matching definitions action to interpret them.",
      ),
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_prefectures",
    operationType: "read",
    description: "List Japanese prefectures for workplace and partner address selection.",
    inputSchema: s.object(
      "Prefecture list filters.",
      {
        ...pagination,
      },
      { required: [] },
    ),
    outputSchema: listOutput(namedRecord),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "update_attendance",
    operationType: "write",
    description: "Update clock-in, clock-out and break times on an existing daily attendance record.",
    inputSchema: s.object(
      "HRMOS write request.",
      {
        data: s.object(
          "Input for update_attendance.",
          {
            user_id: s.integer("Employee ID."),
            day: s.string("Attendance date; the daily record must already exist.", {
              format: "date",
            }),
            start_at: s.string("Clock-in time."),
            next_day_start: {
              ...s.integer("Day offset for start: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
            end_at: s.string("Clock-out time."),
            next_day_end: {
              ...s.integer("Day offset for end: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
            break_1_start_at: s.string("Break 1 start time."),
            next_day_break_1_start: {
              ...s.integer("Day offset for break 1 start: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
            break_1_end_at: s.string("Break 1 end time."),
            next_day_break_1_end: {
              ...s.integer("Day offset for break 1 end: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
            break_2_start_at: s.string("Break 2 start time."),
            next_day_break_2_start: {
              ...s.integer("Day offset for break 2 start: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
            break_2_end_at: s.string("Break 2 end time."),
            next_day_break_2_end: {
              ...s.integer("Day offset for break 2 end: -1 previous day, 0 same day, 1 next day."),
              enum: [-1, 0, 1],
            },
          },
          { required: ["user_id", "day"] },
        ),
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("HRMOS record with all upstream fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "upsert_external_attendance",
    operationType: "write",
    description: "Register or update external attendance times on an existing daily attendance record.",
    inputSchema: s.object(
      "HRMOS write request.",
      {
        data: s.object(
          "Input for upsert_external_attendance.",
          {
            user_id: s.integer("Employee ID."),
            day: s.string("Attendance date; the daily record must already exist.", {
              format: "date",
            }),
            other_start_at: s.string("External system clock-in time."),
            other_end_at: s.string("External system clock-out time."),
          },
          { required: ["user_id", "day"] },
        ),
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("HRMOS record with all upstream fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "upsert_employee",
    operationType: "write",
    description:
      "Register or update an employee matched by login ID, including calendars and approval groups. Login ID, password and cutoff day cannot be changed after registration.",
    inputSchema: s.object(
      "HRMOS write request.",
      {
        data: s.object(
          "Input for upsert_employee.",
          {
            login_id: s.string("Login ID used to match an existing employee; cannot be changed after creation."),
            password: s.string(
              "Initial password; required by the published contract and cannot be changed through this endpoint after creation.",
            ),
            number: s.string("Employee number."),
            last_name: s.string("Family name."),
            first_name: s.string("Given name."),
            last_name_kana: s.string("Family name in Katakana."),
            first_name_kana: s.string("Given name in Katakana."),
            email: s.string("Email address."),
            cutoff_date: s.integer("Cutoff day; 31 means month-end. Cannot be changed after employee creation."),
            start_date: s.string("Employment start date.", { format: "date" }),
            end_date: s.string("Employment end date.", { format: "date" }),
            comment: s.string("Employee notes."),
            lodgment_id: s.integer("Workplace ID."),
            agreement36_id: s.integer(
              "Article 36 agreement ID; HRMOS selects the first configured agreement when omitted.",
            ),
            department_id: s.integer("Department ID."),
            employment_id: s.integer("Employment type ID."),
            segment: s.string("Comma-separated work classification IDs; omission selects all classifications."),
            default_segment_id: s.integer("Default work classification ID."),
            default_holiday_1_id: s.integer("Calendar category 1 for weekday/weekend/public-holiday calendars."),
            default_holiday_2_id: s.integer("Calendar category 2 for weekday/weekend/public-holiday calendars."),
            default_holiday_3_id: s.integer("Calendar category 3 for weekday/weekend/public-holiday calendars."),
            default_calendar_1_id: s.integer("Custom calendar category 1 ID."),
            default_calendar_2_id: s.integer("Custom calendar category 2 ID."),
            default_calendar_3_id: s.integer("Custom calendar category 3 ID."),
            default_calendar_4_id: s.integer("Custom calendar category 4 ID."),
            default_calendar_5_id: s.integer("Custom calendar category 5 ID."),
            default_calendar_6_id: s.integer("Custom calendar category 6 ID."),
            default_calendar_7_id: s.integer("Custom calendar category 7 ID."),
            default_calendar_8_id: s.integer("Custom calendar category 8 ID."),
            user_original_calendars: s.array(
              "Custom calendar IDs from the ninth calendar category onward.",
              s.integer("HRMOS reference ID."),
            ),
            group1_approvers: s.array("Employee IDs in approval group 1.", s.integer("HRMOS reference ID.")),
            group2_approvers: s.array("Employee IDs in approval group 2.", s.integer("HRMOS reference ID.")),
            group3_approvers: s.array("Employee IDs in approval group 3.", s.integer("HRMOS reference ID.")),
            group4_approvers: s.array("Employee IDs in approval group 4.", s.integer("HRMOS reference ID.")),
            nfc_tag_pc: s.string("IC card ID for PC punching, supported by the official request example."),
          },
          {
            required: [
              "login_id",
              "password",
              "last_name",
              "first_name",
              "last_name_kana",
              "first_name_kana",
              "start_date",
            ],
          },
        ),
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("HRMOS record with all upstream fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "create_stamp",
    operationType: "write",
    description: "Record a clock-in, clock-out or break punch, with optional location and night-shift information.",
    inputSchema: s.object(
      "HRMOS write request.",
      {
        data: s.object(
          "Input for create_stamp.",
          {
            user_id: s.integer("Employee ID."),
            stamp_type: {
              ...s.integer("Punch type: 1 clock-in, 2 clock-out, 7 break start, 8 break end."),
              enum: [1, 2, 7, 8],
            },
            datetime: s.string("Punch timestamp in the HRMOS-supported date and time representation."),
            latitude: s.number("Punch latitude."),
            longitude: s.number("Punch longitude."),
            address: s.string("Punch location address."),
            night_shift: s.boolean("Count this punch toward the previous working day when true."),
          },
          { required: ["user_id", "stamp_type"] },
        ),
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("HRMOS record with all upstream fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
];
