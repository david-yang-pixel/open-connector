import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion, handleApiVersion, objectName, apiName, recordId, fileResult } from "./schemas.ts";
const format = {
  columnDelimiter: s.stringEnum(["BACKQUOTE", "CARET", "COMMA", "PIPE", "SEMICOLON", "TAB"], {
    description: "CSV delimiter; defaults to COMMA.",
  }),
  lineEnding: s.stringEnum(["LF", "CRLF"], { description: "CSV line ending; defaults to LF." }),
};
const handle = s.requiredObject("Bulk job handle; preserve the API version and job kind.", {
  jobId: recordId,
  kind: s.stringEnum(["query", "ingest"], { description: "Bulk job kind." }),
  apiVersion: handleApiVersion,
});
const queryHandle = s.requiredObject("Bulk query handle; preserve the API version.", {
  jobId: recordId,
  kind: s.literal("query", { description: "Bulk query job." }),
  apiVersion: handleApiVersion,
});
const ingestHandle = s.requiredObject("Bulk ingest handle; preserve the API version.", {
  jobId: recordId,
  kind: s.literal("ingest", { description: "Bulk ingest job." }),
  apiVersion: handleApiVersion,
});
const jobOutput = s.object(
  "Bulk job state and optional result file.",
  {
    handle,
    state: s.string("Salesforce job state."),
    job: s.looseObject("Full Salesforce job information, including failure counts and errorMessage."),
    result: fileResult,
    nextLocator: s.nullableString("Locator for the next CSV page; null when finished."),
    numberOfRecords: s.integer("Number of records in this CSV page."),
  },
  { optional: ["result", "nextLocator", "numberOfRecords"] },
);
export const salesforceBulkActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "submit_bulk_query",
    description: "Submit an asynchronous Bulk API 2.0 SOQL query and return a versioned handle.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        soql: s.nonEmptyString(
          "Bulk-compatible SOQL; no GROUP BY, OFFSET, aggregate functions or parent-to-child subqueries.",
        ),
        includeDeleted: s.boolean("Use queryAll to include deleted and archived records."),
        ...format,
      },
      ["soql"],
    ),
    outputSchema: jobOutput,
    asyncLifecycle: {
      startActionId: "salesforce.submit_bulk_query",
      statusActionId: "salesforce.get_bulk_query_result",
      cancelActionId: "salesforce.cancel_bulk_job",
    },
  }),
  defineProviderAction("salesforce", {
    name: "get_bulk_query_result",
    description: "Poll a Bulk query; when complete, download one CSV page to file transit. Continue using nextLocator.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        handle: queryHandle,
        locator: s.string("Locator returned by the previous result page."),
        maxRecords: s.integer("Maximum records per CSV page.", { minimum: 1 }),
        download: s.boolean("Download a result page when complete; defaults to true. Set false for status only."),
      },
      ["handle"],
    ),
    outputSchema: jobOutput,
    asyncLifecycle: {
      startActionId: "salesforce.submit_bulk_query",
      statusActionId: "salesforce.get_bulk_query_result",
      cancelActionId: "salesforce.cancel_bulk_job",
    },
  }),
  defineProviderAction("salesforce", {
    name: "submit_bulk_ingest",
    description:
      "Create, upload and submit a Bulk API 2.0 CSV job from a public URL. Supports delete and irreversible hardDelete; inspect per-record results.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        operation: s.stringEnum(["insert", "update", "upsert", "delete", "hardDelete"], {
          description: "CRM ingest operation. hardDelete requires Bulk API Hard Delete permission.",
        }),
        csvUrl: s.url("Public HTTPS CSV URL. Uploads are bounded to Salesforce's recommended 100 MB source size."),
        externalIdField: apiName,
        assignmentRuleId: recordId,
        ...format,
      },
      ["objectName", "operation", "csvUrl"],
    ),
    outputSchema: jobOutput,
    asyncLifecycle: {
      startActionId: "salesforce.submit_bulk_ingest",
      statusActionId: "salesforce.get_bulk_ingest_result",
      cancelActionId: "salesforce.cancel_bulk_job",
    },
  }),
  defineProviderAction("salesforce", {
    name: "get_bulk_ingest_result",
    description:
      "Poll a Bulk ingest job and download successful, failed or unprocessed rows when terminal. JobComplete can still contain failed records.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        handle: ingestHandle,
        resultType: s.stringEnum(["successfulResults", "failedResults", "unprocessedrecords"], {
          description:
            "CSV result category; defaults to failedResults for completed jobs and unprocessedrecords for failed or aborted jobs.",
        }),
        download: s.boolean("Download the selected CSV when terminal; defaults to true. Set false for status only."),
      },
      ["handle"],
    ),
    outputSchema: jobOutput,
    asyncLifecycle: {
      startActionId: "salesforce.submit_bulk_ingest",
      statusActionId: "salesforce.get_bulk_ingest_result",
      cancelActionId: "salesforce.cancel_bulk_job",
    },
  }),
  defineProviderAction("salesforce", {
    name: "cancel_bulk_job",
    description: "Abort a Bulk query or ingest job created by the authorized user.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, handle }, ["handle"]),
    outputSchema: jobOutput,
  }),
];
