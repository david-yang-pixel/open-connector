import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";

export const pagination: Record<string, JsonSchema> = {
  limit: s.integer("Maximum records per page (1–100); defaults to 25.", {
    minimum: 1,
    maximum: 100,
    default: 25,
  }),
  page: s.integer("Page number, starting at 1.", { minimum: 1, default: 1 }),
  from: s.string("Include records updated at or after this timestamp.", { format: "date-time" }),
  to: s.string("Include records updated at or before this timestamp.", { format: "date-time" }),
};

export const employeeRecord: JsonSchema = s.looseObject(
  "HRMOS employee record; additional upstream fields are preserved.",
  {
    id: s.nullable(s.integer("Record ID.")),
    number: s.nullable(s.string("Employee number.")),
    first_name: s.nullable(s.string("Employee given name.")),
    last_name: s.nullable(s.string("Employee family name.")),
    department_id: s.nullable(s.integer("Department ID.")),
    employment_id: s.nullable(s.integer("Employment type ID.")),
    lodgment_id: s.nullable(s.integer("Workplace ID.")),
  },
);

export const namedRecord: JsonSchema = s.looseObject("HRMOS named record; additional upstream fields are preserved.", {
  id: s.nullable(s.integer("Record ID.")),
  name: s.nullable(s.string("Display name.")),
});

export const segmentRecord: JsonSchema = s.looseObject(
  "HRMOS segment record; additional upstream fields are preserved.",
  {
    title: s.nullable(s.string("Work classification title.")),
    display_title: s.nullable(s.string("Work classification display title.")),
  },
);

export const attendanceRecord: JsonSchema = s.looseObject(
  "HRMOS attendance record; additional upstream fields are preserved.",
  {
    user_id: s.nullable(s.integer("Employee ID.")),
    number: s.nullable(s.string("Employee number.")),
    full_name: s.nullable(s.string("Employee full name.")),
    month: s.nullable(s.string("Attendance month as returned by HRMOS.")),
    day: s.nullable(s.string("Attendance date.")),
    actual_working_hours: s.nullable(s.string("Actual working duration in the HRMOS representation.")),
    total_working_hours: s.nullable(s.string("Total working duration in the HRMOS representation.")),
  },
);

export const reportRecord: JsonSchema = s.looseObject(
  "HRMOS report record; additional upstream fields are preserved.",
  {
    user_id: s.nullable(s.integer("Employee ID.")),
    number: s.nullable(s.string("Employee number.")),
    month: s.nullable(s.string("Attendance month as returned by HRMOS.")),
    actual_working_hours: s.nullable(s.string("Actual working duration in the HRMOS representation.")),
    total_working_hours: s.nullable(s.string("Total working duration in the HRMOS representation.")),
    over_work_time: s.nullable(s.string("Overtime duration in the HRMOS representation.")),
    remain_paid_holidays: s.nullable(s.string("Remaining paid leave days as reported in the monthly summary.")),
  },
);

export const stampRecord: JsonSchema = s.looseObject("HRMOS stamp record; additional upstream fields are preserved.", {
  user_id: s.nullable(s.integer("Employee ID.")),
  stamp_type: s.nullable(s.integer("Punch type: 1 clock-in, 2 clock-out, 7 break start, 8 break end.")),
  created_at: s.nullable(s.string("Record creation timestamp.")),
  lodgment_id: s.nullable(s.integer("Workplace ID.")),
});

export const leaveRecord: JsonSchema = s.looseObject("HRMOS leave record; additional upstream fields are preserved.", {
  user_id: s.nullable(s.integer("Employee ID.")),
  date: s.nullable(s.string("Leave history date.")),
  remaining_days: s.nullable(s.number("Remaining leave days.")),
  remaining_hours: s.nullable(s.number("Remaining leave hours.")),
  taken_days: s.nullable(s.number("Leave days taken.")),
  received_days: s.nullable(s.number("Leave days granted.")),
});

export function listOutput(record: JsonSchema): JsonSchema {
  return s.requiredObject("A page of HRMOS Kintai records with pagination metadata.", {
    items: s.array("Records with original HRMOS field names and additional upstream fields preserved.", record),
    page: s.integer("Current page number."),
    totalCount: s.nullable(s.integer("Total records reported by HRMOS, or null when unavailable.")),
    totalPages: s.nullable(s.integer("Total pages reported by HRMOS, or null when unavailable.")),
    nextPage: s.nullable(s.integer("Next page number, or null when there is no known next page.")),
    useHourHoliday: s.nullable(s.string("Raw X-Use-Hour-Holiday value for leave history, or null when absent.")),
  });
}
