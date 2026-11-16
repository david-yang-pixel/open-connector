interface HrmosOperation {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  response: "list" | "record" | "definitions" | "file";
  bodyField?: string;
  aliases?: Record<string, string>;
}

export const hrmosOperations: Record<string, HrmosOperation> = {
  list_employees: {
    path: "/users",
    method: "GET",
    response: "list",
  },
  list_departments: {
    path: "/departments",
    method: "GET",
    response: "list",
  },
  list_employment_types: {
    path: "/employments",
    method: "GET",
    response: "list",
  },
  list_workplaces: {
    path: "/lodgments",
    method: "GET",
    response: "list",
  },
  list_work_segments: {
    path: "/segments",
    method: "GET",
    response: "list",
  },
  list_leave_types: {
    path: "/paid_holidays",
    method: "GET",
    response: "list",
  },
  list_daily_attendance: {
    path: "/work_outputs/daily/{day}",
    method: "GET",
    response: "list",
  },
  list_monthly_attendance: {
    path: "/work_outputs/monthly/{month}",
    method: "GET",
    response: "list",
  },
  list_monthly_reports: {
    path: "/work_output_months/monthly/{month}",
    method: "GET",
    response: "list",
  },
  list_daily_stamp_logs: {
    path: "/stamp_logs/daily/{day}",
    method: "GET",
    response: "list",
  },
  list_employee_stamp_logs: {
    path: "/stamp_logs/user/{user_id}",
    method: "GET",
    response: "list",
  },
  list_employee_leave_history: {
    path: "/paid_holidays/{id}/users/{user_id}/year/{year}",
    method: "GET",
    response: "list",
  },
  list_daily_attendance_differences: {
    path: "/work_output_diffs/daily/{day}",
    method: "GET",
    response: "list",
  },
  list_monthly_attendance_differences: {
    path: "/work_output_diffs/monthly/{month}",
    method: "GET",
    response: "list",
    aliases: {
      employeeId: "user_id",
    },
  },
  list_daily_time_band_totals: {
    path: "/work_output_original_aggregates/daily/{month}",
    method: "GET",
    response: "list",
    aliases: {
      employeeId: "user_id",
      timeBandId: "original_aggregate_id",
    },
  },
  list_monthly_time_band_totals: {
    path: "/work_output_original_aggregates/monthly/{month}",
    method: "GET",
    response: "list",
    aliases: {
      employeeId: "user_id",
      timeBandId: "original_aggregate_id",
    },
  },
  get_monthly_report_definitions: {
    path: "/work_output_months/work_report_definitions",
    method: "GET",
    response: "definitions",
  },
  list_monthly_report_values: {
    path: "/work_output_months/monthly/{month}/work_report",
    method: "GET",
    response: "list",
    aliases: {
      employeeNumbers: "number",
      statuses: "status",
    },
  },
  get_time_band_report_definitions: {
    path: "/work_output_original_aggregates/work_report_definitions",
    method: "GET",
    response: "definitions",
  },
  list_time_band_report_values: {
    path: "/work_output_original_aggregates/monthly/{month}/work_report",
    method: "GET",
    response: "list",
  },
  list_prefectures: {
    path: "/prefecturals",
    method: "GET",
    response: "list",
  },
  update_attendance: {
    path: "/work",
    method: "PUT",
    response: "record",
    bodyField: "data",
  },
  upsert_external_attendance: {
    path: "/work/other_systems",
    method: "POST",
    response: "record",
    bodyField: "data",
  },
  upsert_employee: {
    path: "/users",
    method: "POST",
    response: "record",
    bodyField: "data",
  },
  create_stamp: {
    path: "/stamp_logs",
    method: "POST",
    response: "record",
    bodyField: "data",
  },
  export_dependent_declaration: {
    path: "/nnc/reports/{year}/fuyo_shinkoku_csv",
    method: "GET",
    response: "file",
  },
  export_next_year_dependent_declaration: {
    path: "/nnc/reports/{year}/fuyo_shinkoku_rainen_csv",
    method: "GET",
    response: "file",
  },
  export_insurance_deduction_declaration: {
    path: "/nnc/reports/{year}/hokenryo_shinkoku_csv",
    method: "GET",
    response: "file",
  },
  export_income_deduction_declaration: {
    path: "/nnc/reports/{year}/kihaisho_shinkoku_csv",
    method: "GET",
    response: "file",
  },
  export_housing_loan_declaration: {
    path: "/nnc/reports/{year}/jutaku_loan_shinkoku_csv",
    method: "GET",
    response: "file",
  },
  export_previous_employment_withholding: {
    path: "/nnc/reports/{year}/zenshoku_gensen_choshuhyo_csv",
    method: "GET",
    response: "file",
  },
  list_contracts: {
    path: "/deal_contracts",
    method: "GET",
    response: "list",
    aliases: {
      employeeId: "user_id",
      partnerId: "business_partner_id",
    },
  },
  create_contract: {
    path: "/deal_contracts",
    method: "POST",
    response: "record",
    aliases: {},
    bodyField: "data",
  },
  update_contract: {
    path: "/deal_contracts/{id}",
    method: "PUT",
    response: "record",
    aliases: {
      contractId: "id",
    },
    bodyField: "data",
  },
  delete_contract: {
    path: "/deal_contracts/{id}",
    method: "DELETE",
    response: "record",
    aliases: {
      contractId: "id",
    },
  },
  list_business_partners: {
    path: "/business_partners",
    method: "GET",
    response: "list",
    aliases: {
      partnerId: "id",
      closeOut: "close_out",
    },
  },
  create_business_partner: {
    path: "/business_partners",
    method: "POST",
    response: "record",
    aliases: {},
    bodyField: "data",
  },
  update_business_partner: {
    path: "/business_partners/{id}",
    method: "PUT",
    response: "record",
    aliases: {
      partnerId: "id",
    },
    bodyField: "data",
  },
  delete_business_partner: {
    path: "/business_partners/{id}",
    method: "DELETE",
    response: "record",
    aliases: {
      partnerId: "id",
    },
  },
  list_partner_contacts: {
    path: "/business_partners/{business_partner_id}/business_partner_users",
    method: "GET",
    response: "list",
    aliases: {
      partnerId: "business_partner_id",
    },
  },
  create_partner_contact: {
    path: "/business_partners/{business_partner_id}/business_partner_users",
    method: "POST",
    response: "record",
    aliases: {
      partnerId: "business_partner_id",
    },
    bodyField: "data",
  },
  update_partner_contact: {
    path: "/business_partners/{business_partner_id}/business_partner_users/{id}",
    method: "PUT",
    response: "record",
    aliases: {
      partnerId: "business_partner_id",
      contactId: "id",
    },
    bodyField: "data",
  },
  delete_partner_contact: {
    path: "/business_partners/{business_partner_id}/business_partner_users/{id}",
    method: "DELETE",
    response: "record",
    aliases: {
      partnerId: "business_partner_id",
      contactId: "id",
    },
  },
};
