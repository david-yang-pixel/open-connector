import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import {
  apiVersion,
  objectName,
  recordId,
  record,
  fields,
  fieldNames,
  batchSize,
  queryResult,
  mutationResult,
  externalIdField,
  externalId,
} from "./schemas.ts";
const writeControls = {
  assignmentRule: s.anyOf(
    "Apply active assignment rules with true, disable with false, or use a specific AssignmentRule ID. Omit to retain Salesforce defaults.",
    [s.boolean("Whether to apply active assignment rules."), recordId],
  ),
  duplicateRule: s.object(
    "Duplicate detection options; omitted values retain Salesforce defaults.",
    {
      allowSave: s.boolean("Acknowledge a duplicate alert and allow saving when the rule permits it."),
      includeRecordDetails: s.boolean("Return fields of detected duplicate records."),
      runAsCurrentUser: s.boolean("Use current user sharing rules for duplicate detection."),
    },
    { optional: ["allowSave", "includeRecordDetails", "runAsCurrentUser"] },
  ),
};
export const salesforceBaseActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_objects",
    description: "List sObjects available to the connected Salesforce user.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion }),
    outputSchema: s.object(
      "Available Salesforce objects.",
      {
        sobjects: s.array(
          "Available sObjects and their capabilities.",
          s.looseObject("sObject summary.", {
            name: s.string("sObject API name."),
            label: s.string("sObject display label."),
          }),
        ),
        encoding: s.string("Organization character encoding."),
        maxBatchSize: s.integer("Maximum batch size."),
      },
      { required: ["sobjects"], additionalProperties: true },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "describe_object",
    description: "Describe an sObject, including fields, relationships, permissions and record types.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName }, ["objectName"]),
    outputSchema: s.object(
      "sObject metadata.",
      {
        name: s.string("sObject API name."),
        fields: s.array("Field metadata.", s.looseObject("Field definition.")),
        childRelationships: s.array("Child relationship metadata.", s.looseObject("Child relationship definition.")),
      },
      { required: ["name", "fields"], additionalProperties: true },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "query",
    description: "Execute read-only SOQL and return one page. Use query_more with nextRecordsUrl for subsequent pages.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        soql: s.nonEmptyString("SOQL SELECT query, for example SELECT Id, Name FROM Account LIMIT 10."),
        includeDeleted: s.boolean("Use queryAll to include deleted records and archived activities."),
        batchSize,
      },
      ["soql"],
    ),
    outputSchema: queryResult,
  }),
  defineProviderAction("salesforce", {
    name: "query_more",
    description: "Retrieve the next page of a SOQL query using Salesforce's relative nextRecordsUrl.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        nextRecordsUrl: s.string("Relative nextRecordsUrl returned by query or query_more. Its version is preserved.", {
          pattern: "^/services/data/v[0-9]+\\.[0-9]+/query(All)?/[A-Za-z0-9_-]+$",
        }),
        batchSize,
      },
      ["nextRecordsUrl"],
    ),
    outputSchema: queryResult,
  }),
  defineProviderAction("salesforce", {
    name: "get_record",
    description: "Retrieve a Salesforce record by object API name and record ID.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, recordId, fields: fieldNames }, ["objectName", "recordId"]),
    outputSchema: s.actionOutput({ record }, "Retrieved record."),
  }),
  defineProviderAction("salesforce", {
    name: "create_record",
    description: "Create one standard or custom Salesforce record.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, fields, ...writeControls }, ["objectName", "fields"]),
    outputSchema: mutationResult,
  }),
  defineProviderAction("salesforce", {
    name: "update_record",
    description: "Update supplied fields on a Salesforce record; omitted fields remain unchanged.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, recordId, fields, ...writeControls }, [
      "objectName",
      "recordId",
      "fields",
    ]),
    outputSchema: mutationResult,
  }),
  defineProviderAction("salesforce", {
    name: "delete_record",
    description: "Delete one Salesforce record by object API name and record ID.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, recordId }, ["objectName", "recordId"]),
    outputSchema: mutationResult,
  }),
  defineProviderAction("salesforce", {
    name: "upsert_record",
    description: "Create or update one Salesforce record by an external ID field. Use updateOnly to prevent creation.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        externalIdField,
        externalId,
        fields,
        ...writeControls,
        updateOnly: s.boolean("Fail if no matching record exists instead of inserting a record (API 61.0 or later)."),
      },
      ["objectName", "externalIdField", "externalId", "fields"],
    ),
    outputSchema: mutationResult,
  }),
];
