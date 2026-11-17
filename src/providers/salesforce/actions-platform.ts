import type { ActionDefinition } from "../../core/types.ts";

import { s, readSchemaProperties } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion } from "./schemas.ts";
import { objectName, recordId, queryResult, apiName } from "./schemas.ts";
const reportDescription =
  "Report definition including reportType, name, folderId, detailColumns, filters, groupings and formulas. Use describe_report to discover supported metadata.";
const reportMetadata = s.object(
  reportDescription,
  { name: s.string("Report name, up to 40 characters.", { minLength: 1, maxLength: 40 }) },
  {
    required: [],
    additionalProperties: true,
  },
);
const toolingResult = {
  ...queryResult,
  properties: {
    ...readSchemaProperties(queryResult),
    nextRecordsUrl: s.string("Relative Tooling cursor URL; pass it unchanged to tooling_query_more."),
  },
};
const reportResult = s.object(
  "Saved report definition and extended metadata.",
  { reportMetadata },
  {
    required: ["reportMetadata"],
    additionalProperties: true,
  },
);
const formFactor = s.stringEnum("Layout device size; defaults to Large.", ["Large", "Medium", "Small"]);
export const salesforcePlatformActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "get_record_create_defaults",
    description:
      "Get user-specific default values, create layout and object metadata before creating a record. Does not guarantee that validation rules will accept a later write.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        objectName,
        recordTypeId: recordId,
        formFactor,
        optionalFields: s.array(
          "Optional qualified field names; inaccessible fields are omitted without failing the request.",
          s.string("Qualified field name such as Account.OwnerId.", { minLength: 1 }),
          { minItems: 1 },
        ),
      },
      { optional: ["apiVersion", "recordTypeId", "formFactor", "optionalFields"] },
    ),
    outputSchema: s.looseObject("Record defaults and layout information.", {
      record: s.looseObject("Default record values."),
      objectInfos: s.looseObject("Object metadata indexed by API name."),
      layout: s.looseObject("Create layout including required fields."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_record_layout",
    description: "Read the page layout for an object and record type in create, edit or view mode.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        objectName,
        recordTypeId: recordId,
        formFactor,
        layoutType: s.stringEnum("Layout detail level; defaults to Full.", ["Full", "Compact"]),
        mode: s.stringEnum("Layout access mode; defaults to View.", ["Create", "Edit", "View"]),
      },
      { optional: ["apiVersion", "recordTypeId", "formFactor", "layoutType", "mode"] },
    ),
    outputSchema: s.object(
      "Record layout metadata.",
      {
        layout: s.looseObject("Layout sections, fields, actions and save options."),
      },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_lookup_suggestions",
    description:
      "Find allowed lookup candidates using the current user's context and dependent field values. Uses UI API POST; this operation only reads suggestions.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        objectName,
        fieldName: apiName,
        sourceFields: s.object(
          "Source record fields, including all controlling fields for dependent lookups. Id is required: null for a new record or an existing record ID.",
          { Id: s.nullable(recordId) },
          {
            required: ["Id"],
            additionalProperties: true,
          },
        ),
        searchType: s.stringEnum("Lookup search mode; defaults to Recent.", ["Recent", "Search", "TypeAhead"]),
        q: s.string(
          "Search text: at least two characters for Search, three for TypeAhead; TypeAhead does not accept question marks.",
        ),
        page: s.integer("Page number starting at one.", { minimum: 1 }),
        pageSize: s.integer("Number of suggestions per page; defaults to 25.", { minimum: 1 }),
        targetApiName: s.array("Target object API names for polymorphic lookups.", apiName, {
          minItems: 1,
        }),
        orderBy: s.array(
          "Ordering for lookup results, available in API 63.0 and later.",
          s.object(
            "Lookup sort order.",
            {
              fieldApiName: apiName,
              isAscending: s.boolean("Sort in ascending order."),
            },
            {
              optional: [],
            },
          ),
        ),
      },
      { optional: ["apiVersion", "searchType", "q", "page", "pageSize", "targetApiName", "orderBy"] },
    ),
    outputSchema: s.object(
      "Lookup suggestions response.",
      {
        result: s.looseObject("Suggestions and native pagination metadata."),
      },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "create_report",
    description: "Create and save a Salesforce report from an explicit report definition.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        reportMetadata: s.object(
          reportDescription,
          {
            name: s.string("Name of the new report, up to 40 characters.", {
              minLength: 1,
              maxLength: 40,
            }),
            reportType: s.object(
              "Report type definition.",
              { type: s.string("Report type API name, such as Opportunity.", { minLength: 1 }) },
              {
                required: ["type"],
                additionalProperties: true,
              },
            ),
          },
          {
            required: ["name", "reportType"],
            additionalProperties: true,
          },
        ),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: reportResult,
  }),
  defineProviderAction("salesforce", {
    name: "clone_report",
    description: "Clone an accessible report with optional metadata overrides such as name and folderId.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        reportId: recordId,
        reportMetadata,
      },
      { optional: ["apiVersion", "reportMetadata"] },
    ),
    outputSchema: reportResult,
  }),
  defineProviderAction("salesforce", {
    name: "save_report",
    description:
      "Save report metadata changes. Salesforce invalidates and deletes running asynchronous jobs for this report when it is saved.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        reportId: recordId,
        reportMetadata,
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: reportResult,
  }),
  defineProviderAction("salesforce", {
    name: "tooling_query",
    description:
      "Query Salesforce Tooling metadata with SOQL SELECT, such as validation rules, Apex classes and logs. Requires the corresponding administrative permissions.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        soql: s.string("Tooling SOQL SELECT query.", {
          pattern: "^\\s*[Ss][Ee][Ll][Ee][Cc][Tt]\\s+",
          minLength: 1,
        }),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: toolingResult,
  }),
  defineProviderAction("salesforce", {
    name: "tooling_query_more",
    description: "Continue a Tooling SOQL query using its returned nextRecordsUrl.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        nextRecordsUrl: s.string("Relative Tooling query cursor URL from the previous response.", {
          pattern: "^/services/data/v[0-9]+\\.[0-9]+/tooling/query/[A-Za-z0-9-]+$",
        }),
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: toolingResult,
  }),
  defineProviderAction("salesforce", {
    name: "get_tooling_record",
    description: "Read one Tooling API metadata record without modifying configuration.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        objectName,
        recordId,
        fields: s.array(
          "Optional Tooling field API names.",
          s.string("Field API name.", { pattern: "^[A-Za-z][A-Za-z0-9_]*$" }),
          { minItems: 1 },
        ),
      },
      { optional: ["apiVersion", "fields"] },
    ),
    outputSchema: s.object(
      "Tooling metadata record.",
      { record: s.looseObject("Tooling record fields.") },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_apex_log",
    description: "Read the text of an Apex debug log. Log bodies may contain sensitive application data.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        logId: recordId,
      },
      { optional: ["apiVersion"] },
    ),
    outputSchema: s.object(
      "Apex debug log.",
      { body: s.string("Raw debug log text.") },
      {
        optional: [],
      },
    ),
  }),
];
