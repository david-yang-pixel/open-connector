import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

export const sansanAdminActions: ActionDefinition[] = [
  defineProviderAction("sansan", {
    name: "list_departments",
    description: "List administrative department IDs, names, and parents. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Department pagination.",
      {
        nextPageToken: s.nonEmptyString("Continue with the next page token; original filters are inherited."),
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "A page of administration records.",
      {
        data: s.array(
          "Records in this page.",
          s.object(
            "An administrative department.",
            {
              id: s.nonEmptyString("The department ID."),
              name: s.string("Department name."),
              parentId: s.nullable(s.string("Parent department ID.")),
            },
            { additionalProperties: true, required: [] },
          ),
        ),
        hasMore: s.boolean("Whether another page is available."),
        nextPageToken: s.nullable(s.string("The next page token, or null.")),
      },
      { additionalProperties: true, required: ["data", "hasMore", "nextPageToken"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "get_department_access_control",
    description: "Get the access control pattern assigned to a department. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Department selection.",
      {
        departmentId: s.nonEmptyString("The department ID."),
      },
      { required: ["departmentId"] },
    ),
    outputSchema: s.object(
      "Department access control assignment.",
      {
        departmentId: s.nonEmptyString("The department ID."),
        accessControlPattern: s.object(
          "A Sansan access control pattern, including upstream-defined fields.",
          {
            aclPatternId: s.nonEmptyString("The access control pattern ID."),
            aclPatternName: s.nonEmptyString("Access control pattern name."),
            description: s.string("Access control pattern description."),
            details: s.array(
              "Department access rules.",
              s.object(
                "Access rule for a target department; additional provider-defined fields are accepted.",
                {
                  objectDepartmentId: s.nonEmptyString("The department whose data this rule covers."),
                  accessibleFieldsSettingsName: s.nonEmptyString(
                    "The upstream accessible-fields setting name, such as ALL. Use values configured in Sansan; no complete enum is published.",
                  ),
                },
                { additionalProperties: true, required: ["objectDepartmentId", "accessibleFieldsSettingsName"] },
              ),
            ),
            isInUse: s.boolean("Whether this pattern is in use."),
          },
          { additionalProperties: true, required: [] },
        ),
      },
      { additionalProperties: true, required: [] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "set_department_access_control",
    description: "Assign an access control pattern to a department. System administrator only.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Department and pattern assignment.",
      {
        departmentId: s.nonEmptyString("The department ID."),
        aclPatternId: s.nonEmptyString("The access control pattern ID."),
      },
      { required: ["departmentId", "aclPatternId"] },
    ),
    outputSchema: s.object(
      "Successful administration change.",
      {
        success: s.boolean("Whether the request succeeded."),
        data: s.nullable(s.unknownObject("Any JSON payload returned by Sansan.")),
      },
      { required: ["success", "data"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "list_access_control_patterns",
    description: "List access control patterns, optionally filtering by a name substring. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Access control pattern search.",
      {
        nextPageToken: s.nonEmptyString("Continue with the next page token; original filters are inherited."),
        name: s.string("Pattern name substring."),
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "A page of administration records.",
      {
        data: s.array(
          "Records in this page.",
          s.object(
            "A Sansan access control pattern, including upstream-defined fields.",
            {
              aclPatternId: s.nonEmptyString("The access control pattern ID."),
              aclPatternName: s.nonEmptyString("Access control pattern name."),
              description: s.string("Access control pattern description."),
              details: s.array(
                "Department access rules.",
                s.object(
                  "Access rule for a target department; additional provider-defined fields are accepted.",
                  {
                    objectDepartmentId: s.nonEmptyString("The department whose data this rule covers."),
                    accessibleFieldsSettingsName: s.nonEmptyString(
                      "The upstream accessible-fields setting name, such as ALL. Use values configured in Sansan; no complete enum is published.",
                    ),
                  },
                  { additionalProperties: true, required: ["objectDepartmentId", "accessibleFieldsSettingsName"] },
                ),
              ),
              isInUse: s.boolean("Whether this pattern is in use."),
            },
            { additionalProperties: true, required: [] },
          ),
        ),
        hasMore: s.boolean("Whether another page is available."),
        nextPageToken: s.nullable(s.string("The next page token, or null.")),
      },
      { additionalProperties: true, required: ["data", "hasMore", "nextPageToken"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "create_access_control_pattern",
    description: "Create an access control pattern with department access rules. System administrator only.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "New access control pattern.",
      {
        aclPatternName: s.nonEmptyString("Access control pattern name."),
        description: s.string("Access control pattern description."),
        details: s.array(
          "Department access rules.",
          s.object(
            "Access rule for a target department; additional provider-defined fields are accepted.",
            {
              objectDepartmentId: s.nonEmptyString("The department whose data this rule covers."),
              accessibleFieldsSettingsName: s.nonEmptyString(
                "The upstream accessible-fields setting name, such as ALL. Use values configured in Sansan; no complete enum is published.",
              ),
            },
            { additionalProperties: true, required: ["objectDepartmentId", "accessibleFieldsSettingsName"] },
          ),
        ),
      },
      { required: ["aclPatternName", "details"] },
    ),
    outputSchema: s.object(
      "Created access control pattern.",
      {
        id: s.nonEmptyString("The access control pattern ID."),
      },
      { additionalProperties: true, required: ["id"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "update_access_control_pattern",
    description: "Update an access control pattern and its department rules. System administrator only.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Access control pattern changes.",
      {
        patternId: s.nonEmptyString("The access control pattern ID."),
        aclPatternName: s.nonEmptyString("Access control pattern name."),
        description: s.string("Access control pattern description."),
        details: s.array(
          "Department access rules.",
          s.object(
            "Access rule for a target department; additional provider-defined fields are accepted.",
            {
              objectDepartmentId: s.nonEmptyString("The department whose data this rule covers."),
              accessibleFieldsSettingsName: s.nonEmptyString(
                "The upstream accessible-fields setting name, such as ALL. Use values configured in Sansan; no complete enum is published.",
              ),
            },
            { additionalProperties: true, required: ["objectDepartmentId", "accessibleFieldsSettingsName"] },
          ),
        ),
      },
      { required: ["patternId"] },
    ),
    outputSchema: s.object(
      "Successful administration change.",
      {
        success: s.boolean("Whether the request succeeded."),
        data: s.nullable(s.unknownObject("Any JSON payload returned by Sansan.")),
      },
      { required: ["success", "data"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "delete_access_control_pattern",
    description:
      "Delete an access control pattern. System administrator only; Sansan may reject a pattern still in use.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: s.object(
      "Access control pattern to delete.",
      {
        patternId: s.nonEmptyString("The access control pattern ID."),
      },
      { required: ["patternId"] },
    ),
    outputSchema: s.object(
      "Successful administration change.",
      {
        success: s.boolean("Whether the request succeeded."),
        data: s.nullable(s.unknownObject("Any JSON payload returned by Sansan.")),
      },
      { required: ["success", "data"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "get_default_email_client",
    description: "Get the default email client settings for new users. System administrator only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object("No input is required.", {}, { required: [] }),
    outputSchema: s.object(
      "Organization default email client; null when not configured.",
      {
        settings: s.nullable(
          s.object(
            "Email client configuration.",
            {
              emailClient: s.stringEnum("Default email client for newly added users.", [
                "clientSoftware",
                "gmail",
                "office365",
              ]),
              encoding: s.stringEnum("Required only for clientSoftware.", ["sjis", "utf8", "iso2022jp"]),
            },
            { additionalProperties: true, required: [] },
          ),
        ),
      },
      { required: ["settings"] },
    ),
  }),
  defineProviderAction("sansan", {
    name: "set_default_email_client",
    description:
      "Set the default email client for subsequently added users; users may change it later. System administrator only.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Default email client settings.",
        {
          emailClient: s.stringEnum("Default email client for newly added users.", [
            "clientSoftware",
            "gmail",
            "office365",
          ]),
          encoding: s.stringEnum("Required only for clientSoftware.", ["sjis", "utf8", "iso2022jp"]),
        },
        { required: ["emailClient"] },
      ),
      allOf: [
        {
          if: { properties: { emailClient: { const: "clientSoftware" } } },
          then: { required: ["encoding"] },
          else: { not: { required: ["encoding"] } },
        },
      ],
    },
    outputSchema: s.object(
      "Organization default email client; null when not configured.",
      {
        settings: s.nullable(
          s.object(
            "Email client configuration.",
            {
              emailClient: s.stringEnum("Default email client for newly added users.", [
                "clientSoftware",
                "gmail",
                "office365",
              ]),
              encoding: s.stringEnum("Required only for clientSoftware.", ["sjis", "utf8", "iso2022jp"]),
            },
            { additionalProperties: true, required: [] },
          ),
        ),
      },
      { required: ["settings"] },
    ),
  }),
];
