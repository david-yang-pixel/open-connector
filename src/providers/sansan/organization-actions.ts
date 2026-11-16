import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { sansanFileSchema } from "./file-schema.ts";

const organizationImportInputSchema = {
  ...s.object(
    "Users and/or departments to check or import. System administrator only.",
    {
      users: s.array(
        "Structured user rows; Connector builds the official CSV, preserving all columns. Mutually exclusive with usersFileUrl.",
        s.object(
          "A user import row using official Sansan CSV columns. Submission requires DepartmentId, UserId, UserName and Email; new users also require TempId and EffectiveDateFrom, while existing users require UserUuid. Blank optional cells preserve unchanged values when editing.",
          {
            TempId: s.string(
              "Temporary alphanumeric ID for a new user; blank when editing. Must be unique within the file.",
              { maxLength: 256 },
            ),
            UserUuid: s.string("Existing user UUID when editing; blank for a new user."),
            DepartmentId: s.string(
              "Department IDs separated by semicolons; use tempId:ID for a new department in the same import.",
            ),
            UserId: s.string("Immutable user login ID, up to 20 characters; alphanumeric or .-_&.", { maxLength: 20 }),
            UserName: s.string("User display name, up to 60 characters.", { maxLength: 60 }),
            AlternativeName: s.string("User name reading.", { maxLength: 256 }),
            Email: s.string("Unique primary user email within the company.", { maxLength: 60 }),
            SubEmail: s.string("Secondary user email.", { maxLength: 60 }),
            EffectiveDateFrom: s.string(
              "Usage start date for new users, today or later in RFC3339 format; blank when unchanged during editing.",
            ),
            SamlNameId: s.string("Unique SAML Name ID within the company."),
            Culture: s.integer(
              "Display language: 0 Japanese, 1 English, 2 Simplified Chinese. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 2 },
            ),
            MailFormat: s.integer("Email format: 0 HTML, 1 text. Omission serializes as a blank CSV cell.", {
              minimum: 0,
              maximum: 1,
            }),
            UserType: s.integer(
              "Role: 0 regular, 1 system administrator, 2 departmental administrator. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 2 },
            ),
            CanUpdateData: s.integer(
              "Permission to update all data: 1 granted, 0 denied. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 1 },
            ),
            DataDownloadPrivilege: s.integer(
              "Download permission: 0 none, 1 own data, 2 all data, 3 assigned departments. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 3 },
            ),
            EmailDeliveryPrivilege: s.integer(
              "Email delivery permission: 1 granted, 0 denied. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 1 },
            ),
            DealPrivilege: s.integer(
              "Deal permission: 0 none, 1 regular, 2 administrator. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 2 },
            ),
            ApiIntegrationPrivilege: s.integer(
              "API integration permission: 1 granted, 0 denied. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 1 },
            ),
            UsageStatisticsPrivilege: s.integer(
              "Usage statistics permission: 1 granted, 0 denied. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 1 },
            ),
            OrganizationTreeDownloadPrivilege: s.integer(
              "Organization tree download permission: 1 granted, 0 denied. Omission serializes as a blank CSV cell.",
              { minimum: 0, maximum: 1 },
            ),
            DeleteFlag: s.integer("Set to 1 to delete the user. Omission serializes as a blank CSV cell.", {
              minimum: 0,
              maximum: 1,
            }),
            SalesforceIntegrationPrivilege: s.string(
              "Retired field, ignored by Sansan; the CSV column is retained even when omitted.",
            ),
          },
          { required: [] },
        ),
        { minItems: 1 },
      ),
      departments: s.array(
        "Structured department rows. Mutually exclusive with departmentsFileUrl.",
        s.object(
          "A department import row using official Sansan CSV columns. Submission requires DepartmentName and either TempId for creation or DepartmentId for editing; the other identifier must be blank or omitted.",
          {
            TempId: s.string("Temporary alphanumeric ID for a new department; blank when editing.", { maxLength: 256 }),
            DepartmentId: s.string("Existing department ID when editing; blank for a new department."),
            DepartmentName: s.string("Department name.", { maxLength: 30 }),
            DepartmentNamePhonetic: s.string(
              "Department name reading using lowercase Latin letters, digits, and spaces.",
              { maxLength: 256 },
            ),
            ParentDepartmentId: s.string(
              "Parent department ID or tempId:ID for a parent created in the same import; blank for no parent.",
            ),
            Order: s.integer("Department sort order."),
            DeleteFlag: s.integer("Set to 1 to delete the department; it must have no users or child departments.", {
              minimum: 0,
              maximum: 1,
            }),
          },
          { required: [] },
        ),
        { minItems: 1 },
      ),
      usersFileUrl: s.string("Public URL of a UTF-8 user CSV with a header row; maximum 20 MiB per source file.", {
        format: "uri",
      }),
      departmentsFileUrl: s.string(
        "Public URL of a UTF-8 department CSV with a header row; maximum 20 MiB per source file.",
        { format: "uri" },
      ),
      delimiter: s.stringEnum("CSV delimiter; defaults to comma.", ["comma", "semicolon", "tab", "space"]),
    },
    { required: [] },
  ),
  anyOf: [
    { required: ["users"] },
    { required: ["departments"] },
    { required: ["usersFileUrl"] },
    { required: ["departmentsFileUrl"] },
  ],
  allOf: [
    { not: { required: ["users", "usersFileUrl"] } },
    { not: { required: ["departments", "departmentsFileUrl"] } },
  ],
};

// Checking accepts incomplete rows for upstream diagnostics; submission enforces creation and update rules.
const organizationSubmissionInputSchema = {
  ...organizationImportInputSchema,
  allOf: [
    ...organizationImportInputSchema.allOf,
    {
      properties: {
        users: {
          items: {
            required: ["DepartmentId", "UserId", "UserName", "Email"],
            properties: {
              DepartmentId: { minLength: 1 },
              UserId: { minLength: 1 },
              UserName: { minLength: 1 },
              Email: { minLength: 1 },
            },
            oneOf: [
              {
                required: ["TempId", "EffectiveDateFrom"],
                properties: {
                  TempId: { minLength: 1 },
                  UserUuid: { maxLength: 0 },
                  EffectiveDateFrom: { minLength: 1 },
                },
              },
              {
                required: ["UserUuid"],
                properties: {
                  UserUuid: { minLength: 1 },
                  TempId: { maxLength: 0 },
                },
              },
            ],
          },
        },
        departments: {
          items: {
            required: ["DepartmentName"],
            properties: { DepartmentName: { minLength: 1 } },
            oneOf: [
              {
                required: ["TempId"],
                properties: { TempId: { minLength: 1 }, DepartmentId: { maxLength: 0 } },
              },
              {
                required: ["DepartmentId"],
                properties: { DepartmentId: { minLength: 1 }, TempId: { maxLength: 0 } },
              },
            ],
          },
        },
      },
    },
  ],
};

export const sansanOrganizationActions: ActionDefinition[] = [
  defineProviderAction("sansan", {
    name: "export_organization_users",
    description: "Export Sansan organization users as a CSV download. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "User export options.",
      {
        delimiter: s.stringEnum("CSV delimiter; defaults to comma.", ["comma", "semicolon", "tab", "space"]),
      },
      { required: [] },
    ),
    outputSchema: sansanFileSchema,
  }),
  defineProviderAction("sansan", {
    name: "export_organization_departments",
    description: "Export Sansan organization departments as a CSV download. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Department export options.",
      {
        delimiter: s.stringEnum("CSV delimiter; defaults to comma.", ["comma", "semicolon", "tab", "space"]),
      },
      { required: [] },
    ),
    outputSchema: sansanFileSchema,
  }),
  defineProviderAction("sansan", {
    name: "check_organization_import",
    description:
      "Validate user and department import data without applying changes. System administrator only; returns a downloadable CSV report if errors exist.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: organizationImportInputSchema,
    outputSchema: s.object(
      "Organization import validation result.",
      {
        valid: s.boolean("Whether Sansan returned an empty validation response, indicating valid data."),
        report: s.nullable(sansanFileSchema),
      },
      { required: ["valid", "report"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "submit_organization_import",
    description:
      "Submit user and department additions, updates, or deletions. System administrator only. DeleteFlag can delete users or departments; preserve the import ID to retrieve results.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: organizationSubmissionInputSchema,
    outputSchema: s.object(
      "Submitted organization import.",
      {
        importId: s.nonEmptyString("The submitted import job ID."),
      },
      { additionalProperties: true, required: ["importId"] },
    ),
    asyncLifecycle: {
      startActionId: "sansan.submit_organization_import",
      statusActionId: "sansan.get_organization_import_result",
    },
  }),
  defineProviderAction("sansan", {
    name: "get_organization_import_status",
    description: "Get the current organization import status. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Organization import job identifier.",
      {
        importId: s.nonEmptyString("The import ID returned when the job was submitted."),
      },
      { required: ["importId"] },
    ),
    outputSchema: s.object(
      "Organization import status.",
      {
        importStatus: s.integer("Upstream import status: 0 queued, 1 running, 2 completed, 9 error."),
        status: s.stringEnum("Normalized import status.", ["queued", "running", "completed", "failed"]),
      },
      { additionalProperties: true, required: ["importStatus", "status"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "get_organization_import_result",
    description:
      "Check an organization import and return its result CSV when completed or failed. System administrator only. The report includes created IDs and row-level errors.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Organization import job identifier.",
      {
        importId: s.nonEmptyString("The import ID returned when the job was submitted."),
      },
      { required: ["importId"] },
    ),
    outputSchema: s.object(
      "Organization import state and result report.",
      {
        importId: s.nonEmptyString("The import ID."),
        importStatus: s.integer("Upstream import status: 0 queued, 1 running, 2 completed, 9 error."),
        status: s.stringEnum("Normalized import status.", ["queued", "running", "completed", "failed"]),
        report: s.nullable(sansanFileSchema),
      },
      { additionalProperties: true, required: ["importId", "importStatus", "status", "report"] },
    ),
    asyncLifecycle: {
      startActionId: "sansan.submit_organization_import",
      statusActionId: "sansan.get_organization_import_result",
    },
  }),
];
