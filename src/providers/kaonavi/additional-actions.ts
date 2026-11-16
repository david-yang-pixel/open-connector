import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";

export interface KaonaviActionDefinition extends Pick<
  ActionDefinition,
  "name" | "description" | "inputSchema" | "outputSchema"
> {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  operationType?: ActionDefinition["operationType"];
  asyncLifecycle?: ActionDefinition["asyncLifecycle"];
  bodyField?: "members" | "users" | "user";
  bodyWrapper?: "member_data" | "user_data";
}
const dryRun = s.boolean("Validate without changing data. Defaults to false.");
const sheetId = s.integer("Sheet identifier.");
const customFieldId = s.integer("Custom field identifier.");
const userId = s.integer("User identifier.");
const code = s.nonEmptyString("Employee code.");
const fields = s.array(
  "Custom field values; consult the field layout for types and allowed values.",
  s.requiredObject("Custom field value.", {
    id: s.integer("Custom field identifier."),
    values: s.array(
      "Field values; multiple values are supported only for checkboxes. Use an empty string to clear a value.",
      s.string("Field value."),
    ),
  }),
);
const department = s.requiredObject("Department assignment; use a code from list_departments.", {
  code: s.string("Department code; an empty string clears the assignment."),
});
const member = s.object(
  "Employee fields; required fields and allowed values depend on get_member_layout. Omitted fields remain unchanged during updates.",
  {
    code,
    name: s.string("Employee name."),
    name_kana: s.string("Phonetic employee name."),
    mail: s.string("Employee email address."),
    entered_date: s.string("Employment start date, or an empty string to clear it."),
    retired_date: s.string("Employment end date, or an empty string to clear it."),
    gender: s.string("Gender value from the employee layout."),
    birthday: s.string("Birth date, or an empty string to clear it."),
    department,
    sub_departments: s.array("Secondary department assignments.", department),
    custom_fields: fields,
  },
  { required: ["code"] },
);
const sheetMember = s.requiredObject("Sheet records for an employee.", {
  code,
  records: s.array(
    "Ordered records. For a multiple-record sheet update, provide the complete replacement set for this employee; append uses only the new records.",
    s.object("Sheet record.", { custom_fields: fields }, { required: [] }),
  ),
});
const userFields = {
  email: s.string("Login email address."),
  member_code: s.string("Linked employee code."),
  password: s.string("Login password."),
  role: s.requiredObject("User role.", { id: s.integer("Role identifier from list_roles.") }),
  is_active: s.boolean("Whether the account is enabled; false disables login."),
  password_locked: s.boolean("Whether password login is locked."),
  use_smartphone: s.boolean("Whether smartphone browser access is enabled."),
  use_native_app: s.boolean("Whether native mobile app access is enabled."),
};
const createUser = s.object(
  "New login user. Unspecified account settings use Kaonavi defaults; secure access cannot be configured through this API.",
  userFields,
  { required: ["email", "member_code", "password", "role"] },
);
const updateUser = {
  ...s.object(
    "User fields to update; omitted fields remain unchanged. Secure access cannot be changed through this API.",
    userFields,
    { required: [] },
  ),
  minProperties: 1,
};
const userOutput = s.looseObject("Created or updated login user.", {
  id: userId,
  email: s.string("Login email address."),
  member_code: s.nullable(s.string("Linked employee code, or null.")),
  role: s.looseObject("Assigned role.", {
    id: s.integer("Role identifier."),
    name: s.string("Role name."),
    type: s.string("Role type."),
  }),
  is_active: s.boolean("Whether the account is enabled."),
  password_locked: s.boolean("Whether password login is locked."),
  use_smartphone: s.boolean("Whether smartphone browser access is enabled."),
  use_native_app: s.boolean("Whether native mobile app access is enabled."),
});
const task = s.looseObject(
  "Submitted asynchronous task; use get_task to check completion. A successful submission does not mean the mutation has completed.",
  { task_id: s.integer("Submitted task identifier.") },
);
const updatedSince = s.string("Only files updated on or after this date (YYYY-MM-DD).", {
  format: "date",
});
const fileFields = {
  file_name: s.string("File name."),
  download_url: s.string("Signed download URL, valid for 15 minutes after issuance."),
  updated_at: s.string("Last file update timestamp."),
};
export const kaonaviAdditionalDefinitions: KaonaviActionDefinition[] = [
  ...(
    [
      [
        "create_members",
        "POST",
        "Create employees with their basic fields and department assignments. Consult get_member_layout for required fields.",
      ],
      [
        "update_members",
        "PATCH",
        "Update only the supplied employee fields. Omitted fields remain unchanged; use an empty string to clear a value.",
      ],
    ] as const
  ).map(([name, method, description]) => ({
    name,
    method,
    description,
    path: "/members",
    operationType: "write" as const,
    bodyField: "members" as const,
    bodyWrapper: "member_data" as const,
    inputSchema: s.object(
      "Employee mutation request.",
      { members: s.array("Employees to create or update.", member, { minItems: 1 }), dryRun },
      { optional: ["dryRun"] },
    ),
    outputSchema: task,
    asyncLifecycle: { startActionId: `kaonavi.${name}`, statusActionId: "kaonavi.get_task" },
  })),
  ...(
    [
      [
        "update_sheet",
        "PATCH",
        "/sheets/{sheetId}",
        "Update a personnel sheet. Single-record sheets preserve omitted fields; multiple-record sheets replace the entire record set for each supplied employee. Other employees remain unchanged.",
      ],
      [
        "append_sheet_records",
        "POST",
        "/sheets/{sheetId}/add",
        "Append records to a multiple-record personnel sheet. Single-record sheets are not supported.",
      ],
    ] as const
  ).map(([name, method, path, description]) => ({
    name,
    method,
    path,
    description,
    operationType: "write" as const,
    bodyField: "members" as const,
    bodyWrapper: "member_data" as const,
    inputSchema: s.object(
      "Personnel sheet mutation request.",
      {
        sheetId,
        members: s.array("Employee sheet records.", sheetMember, { minItems: 1 }),
        dryRun,
      },
      { optional: ["dryRun"] },
    ),
    outputSchema: task,
    asyncLifecycle: { startActionId: `kaonavi.${name}`, statusActionId: "kaonavi.get_task" },
  })),
  {
    name: "create_user",
    method: "POST",
    path: "/users",
    operationType: "write",
    description: "Create a Kaonavi login user linked to an employee.",
    bodyField: "user",
    inputSchema: s.object("User creation request.", { user: createUser, dryRun }, { optional: ["dryRun"] }),
    outputSchema: userOutput,
  },
  {
    name: "update_user",
    method: "PATCH",
    path: "/users/{userId}",
    operationType: "destructive",
    description:
      "Update a login user, including role, password, access settings, or disabling the account. Omitted fields remain unchanged.",
    bodyField: "user",
    inputSchema: s.object("User update request.", { userId, user: updateUser, dryRun }, { optional: ["dryRun"] }),
    outputSchema: userOutput,
  },
  {
    name: "delete_user",
    method: "DELETE",
    path: "/users/{userId}",
    operationType: "destructive",
    description: "Delete a Kaonavi login user.",
    inputSchema: s.requiredObject("User deletion request.", { userId }),
    outputSchema: s.requiredObject("Deletion result.", {
      success: s.boolean("Whether the user was deleted."),
    }),
  },
  {
    name: "create_users",
    method: "POST",
    path: "/users/bulk",
    operationType: "write",
    description: "Create multiple Kaonavi login users asynchronously.",
    bodyField: "users",
    bodyWrapper: "user_data",
    inputSchema: s.object(
      "Bulk user creation request.",
      { users: s.array("Users to create.", createUser, { minItems: 1 }), dryRun },
      { optional: ["dryRun"] },
    ),
    outputSchema: task,
    asyncLifecycle: { startActionId: "kaonavi.create_users", statusActionId: "kaonavi.get_task" },
  },
  {
    name: "update_users",
    method: "PATCH",
    path: "/users/bulk",
    operationType: "destructive",
    description:
      "Update multiple login users asynchronously, including disabling accounts. Omitted fields remain unchanged.",
    bodyField: "users",
    bodyWrapper: "user_data",
    inputSchema: s.object(
      "Bulk user update request.",
      {
        users: s.array(
          "Users to update, identified by user ID.",
          s.object("User update fields.", { id: userId, ...userFields }, { required: ["id"] }),
          { minItems: 1 },
        ),
        dryRun,
      },
      { optional: ["dryRun"] },
    ),
    outputSchema: task,
    asyncLifecycle: { startActionId: "kaonavi.update_users", statusActionId: "kaonavi.get_task" },
  },
  {
    name: "list_member_photo_urls",
    path: "/members/face_image",
    operationType: "read",
    description: "Get employee photo download URLs. Links expire after 15 minutes; request new URLs when needed.",
    inputSchema: s.object("Employee photo query.", { updatedSince }, { optional: ["updatedSince"] }),
    outputSchema: s.looseObject("Employee photo download links.", {
      member_data: s.array("Employee photos.", s.looseObject("Employee photo.", { code, ...fileFields })),
    }),
  },
  {
    name: "list_sheet_file_urls",
    path: "/sheets/{sheetId}/custom_fields/{customFieldId}/file",
    operationType: "read",
    description:
      "Get download URLs for files in a sheet attachment field. Only records containing files are returned. Links expire after 15 minutes.",
    inputSchema: s.object(
      "Sheet attachment query.",
      { sheetId, customFieldId, updatedSince },
      { optional: ["updatedSince"] },
    ),
    outputSchema: s.looseObject("Sheet attachment download links.", {
      member_data: s.array(
        "Employee attachments.",
        s.looseObject("Employee attachment records.", {
          code,
          records: s.array("Attached files.", s.looseObject("Attached file.", fileFields)),
        }),
      ),
    }),
  },
];
