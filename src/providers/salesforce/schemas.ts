import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";

export const apiVersion: JsonSchema = s.string("Salesforce REST API version supported by your organization.", {
  pattern: "^[0-9]+\\.[0-9]+$",
  default: "66.0",
});
export const handleApiVersion: JsonSchema = s.string(
  "API version returned by the submit action; preserve it when reusing a handle.",
  { pattern: "^[0-9]+\\.[0-9]+$" },
);
export const objectName: JsonSchema = s.string(
  "Standard or custom sObject API name, for example Account or Invoice__c.",
  {
    pattern: "^[A-Za-z][A-Za-z0-9_]*$",
  },
);
export const recordId: JsonSchema = s.string("Salesforce record ID (15 or 18 alphanumeric characters).", {
  pattern: "^[A-Za-z0-9]{15}([A-Za-z0-9]{3})?$",
});
export const record: JsonSchema = s.looseObject("Salesforce record with object-specific fields and relationship data.");
export const fields: JsonSchema = s.looseObject(
  "Field API names and JSON values to write. Use describe_object to discover writable fields; null clears a field.",
);
export const batchSize: JsonSchema = s.integer("Requested query batch size; Salesforce may return fewer records.", {
  minimum: 200,
  maximum: 2000,
});
export const queryResult: JsonSchema = s.object(
  "One page of SOQL results.",
  {
    totalSize: s.integer("Total number of matching records."),
    done: s.boolean("Whether all query results have been returned."),
    records: s.array("Records in this page.", record),
    nextRecordsUrl: s.string("Relative URL for the next page; pass it unchanged to query_more."),
  },
  { required: ["totalSize", "done", "records"], additionalProperties: true },
);
export const mutationResult: JsonSchema = s.object(
  "Result of a successful record mutation.",
  {
    id: s.string("ID of the affected record, when returned by Salesforce."),
    success: s.boolean("Whether the mutation succeeded."),
    created: s.boolean("Whether an upsert created a new record."),
    errors: s.array("Errors returned by Salesforce.", s.unknown("Salesforce error details.")),
  },
  { required: ["success"], additionalProperties: true },
);
export const apiName: JsonSchema = s.string("Salesforce API name.", { pattern: "^[A-Za-z][A-Za-z0-9_]*$" });
export const fieldNames: JsonSchema = s.array("Field API names to retrieve.", apiName, { minItems: 1 });
export const externalIdField: JsonSchema = s.string("External ID field API name.", {
  pattern: "^[A-Za-z][A-Za-z0-9_]*$",
});
export const externalId: JsonSchema = s.nonEmptyString("External ID value to match.");
export const allOrNone: JsonSchema = s.boolean("Roll back the entire collection if any item fails. Defaults to false.");
export const itemsResult: JsonSchema = s.actionOutput(
  { results: s.array("One result per item; inspect individual success flags.", s.unknown("Upstream item result.")) },
  "Ordered upstream results; individual items can contain errors or null.",
);
export const successResult: JsonSchema = s.actionOutput(
  { success: s.boolean("Whether the request succeeded.") },
  "Operation acknowledgement.",
);
export const fileResult: JsonSchema = s.actionOutput(
  {
    fileId: s.string("Transit file identifier."),
    downloadUrl: s.string("URL for downloading the transit file."),
    name: s.string("File name."),
    mimeType: s.string("File media type."),
    sizeBytes: s.integer("Downloaded file size in bytes."),
  },
  "Downloaded file stored in local file transit.",
);
