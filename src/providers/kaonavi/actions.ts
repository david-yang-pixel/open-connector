import type { ActionDefinition } from "../../core/types.ts";
import type { KaonaviActionDefinition } from "./additional-actions.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { kaonaviAdditionalDefinitions } from "./additional-actions.ts";

const record = s.looseObject("Provider-defined record fields.", {});
const empty = s.requiredObject("No input fields are required.", {});
const updatedSince = s.string("Only records updated on or after this date (YYYY-MM-DD).", {
  format: "date",
});
const getCalcType = s.boolean("Include calculation field types. Defaults to false.");
const sheetId = s.integer("Sheet identifier.");
const calcInput = s.object("Layout query options.", { getCalcType }, { optional: ["getCalcType"] });
const updatedInput = s.object("Member query options.", { updatedSince }, { optional: ["updatedSince"] });
const sheetLayout = s.looseObject("Sheet layout and custom field definitions.", {
  id: sheetId,
  name: s.string("Sheet name."),
  record_type: s.integer("Zero for single-record sheets; one for multiple-record sheets."),
  custom_fields: s.array("Custom field definitions.", record),
});
function collection(key: string, description: string) {
  return s.looseObject(description, { [key]: s.array("Returned records.", record) });
}

export const kaonaviActionDefinitions: KaonaviActionDefinition[] = [
  {
    name: "list_members",
    path: "/members",
    description: "List employee records, optionally filtered by update date.",
    inputSchema: updatedInput,
    outputSchema: s.looseObject("Employee records and last update time.", {
      updated_at: s.string("Last update timestamp."),
      member_data: s.array("Employee records, including custom fields.", record),
    }),
  },
  {
    name: "get_member_layout",
    path: "/member_layouts",
    description: "Get employee field definitions and required-field settings.",
    inputSchema: calcInput,
    outputSchema: s.object(
      "Employee field layout, keyed by native field names.",
      { custom_fields: s.array("Custom employee field definitions.", record) },
      { required: [], additionalProperties: true },
    ),
  },
  {
    name: "list_sheet_layouts",
    path: "/sheet_layouts",
    description: "List accessible personnel sheet layouts and custom field definitions.",
    inputSchema: calcInput,
    outputSchema: s.looseObject("Available sheet layouts.", {
      sheets: s.array("Sheet layouts.", sheetLayout),
    }),
  },
  {
    name: "get_sheet_layout",
    path: "/sheet_layouts/{sheetId}",
    description: "Get the field layout of a personnel sheet.",
    inputSchema: s.object("Sheet layout query.", { sheetId, getCalcType }, { optional: ["getCalcType"] }),
    outputSchema: sheetLayout,
  },
  {
    name: "get_sheet",
    path: "/sheets/{sheetId}",
    description: "Get personnel sheet records, optionally filtered by member update date.",
    inputSchema: s.object("Sheet data query.", { sheetId, updatedSince }, { optional: ["updatedSince"] }),
    outputSchema: s.looseObject("Personnel sheet data.", {
      id: sheetId,
      name: s.string("Sheet name."),
      record_type: s.integer("Zero for single-record sheets; one for multiple-record sheets."),
      updated_at: s.string("Last update timestamp."),
      member_data: s.array("Employee sheet records and custom field values.", record),
    }),
  },
  {
    name: "list_departments",
    path: "/departments",
    description: "List organizational departments and their parent relationships.",
    inputSchema: empty,
    outputSchema: collection("department_data", "Organization tree records."),
  },
  {
    name: "list_users",
    path: "/users",
    description: "List Kaonavi login users and account settings.",
    inputSchema: empty,
    outputSchema: collection("user_data", "Login user records."),
  },
  {
    name: "get_user",
    path: "/users/{userId}",
    description: "Get a Kaonavi login user by ID.",
    inputSchema: s.requiredObject("User lookup.", { userId: s.integer("User identifier.") }),
    outputSchema: s.looseObject("Login user and account settings.", {
      id: s.integer("User identifier."),
      email: s.string("Login email address."),
      member_code: s.nullable(s.string("Linked employee code, or null.")),
      last_login_at: s.nullable(s.string("Last login timestamp, or null.")),
    }),
  },
  {
    name: "list_roles",
    path: "/roles",
    description: "List available Kaonavi user roles.",
    inputSchema: empty,
    outputSchema: collection("role_data", "Available user roles."),
  },
  {
    name: "list_enum_options",
    path: "/enum_options",
    description: "List master options for custom fields.",
    inputSchema: empty,
    outputSchema: collection("custom_field_data", "Custom fields and their master options."),
  },
  {
    name: "get_enum_options",
    path: "/enum_options/{customFieldId}",
    description: "Get master options for one custom field.",
    inputSchema: s.requiredObject("Custom field lookup.", {
      customFieldId: s.integer("Custom field identifier."),
    }),
    outputSchema: s.looseObject("Master options for a custom field.", {
      id: s.integer("Custom field identifier."),
      name: s.string("Custom field name."),
      sheet_name: s.string("Sheet name."),
      enum_option_data: s.array("Master options.", record),
    }),
  },
  {
    name: "get_task",
    path: "/tasks/{taskId}",
    description: "Get the status and messages of an asynchronous Kaonavi task.",
    inputSchema: s.requiredObject("Task lookup.", { taskId: s.integer("Task identifier.") }),
    outputSchema: s.looseObject("Asynchronous task status.", {
      id: s.integer("Task identifier."),
      status: s.string("Task status: OK, NG, ERROR, WAITING, or RUNNING."),
      messages: s.array("Task validation or execution messages.", s.string("Task message.")),
    }),
  },
  ...kaonaviAdditionalDefinitions,
];

export const kaonaviActions: ActionDefinition[] = kaonaviActionDefinitions.map((definition) =>
  defineProviderAction("kaonavi", {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
    operationType: definition.operationType ?? "read",
    requiredScopes: [],
    asyncLifecycle: definition.asyncLifecycle,
  }),
);
