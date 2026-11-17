import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import {
  apiVersion,
  objectName,
  recordId,
  record,
  fieldNames,
  fields,
  apiName,
  externalIdField,
  externalId,
  allOrNone,
  itemsResult,
} from "./schemas.ts";

const timespan = {
  apiVersion,
  objectName,
  start: s.dateTime("Start of the replication window in ISO 8601 UTC."),
  end: s.dateTime("End of the replication window in ISO 8601 UTC; must follow start."),
};
const collectionRecord = s.requiredObject("Record to create; standard and custom objects may be mixed.", {
  objectName,
  fields,
});
const updateRecord = s.requiredObject("Record to update.", { objectName, recordId, fields });
const subrequestUrl = s.string(
  "Relative Salesforce /services/data/vXX.X/ resource URL; external URLs are not accepted.",
  { minLength: 1, pattern: "^/services/data/v[0-9]+\\.[0-9]+/" },
);
const referenceId = s.string("Unique subrequest reference ID.", { pattern: "^[A-Za-z0-9][A-Za-z0-9_]*$" });
const subrequestBody = s.unknown("JSON body accepted by the target Salesforce resource.");
const subrequest = s.object(
  "One Salesforce composite subrequest. References use @{referenceId.fieldName}.",
  {
    method: s.stringEnum(["GET", "POST", "PUT", "PATCH", "DELETE"], { description: "Subrequest HTTP method." }),
    url: subrequestUrl,
    referenceId,
    body: subrequestBody,
    httpHeaders: s.record("Supported Salesforce subrequest headers.", s.string("Header value.")),
  },
  { optional: ["body", "httpHeaders"] },
);
const graphSubrequest = s.object(
  "One Salesforce Composite Graph subrequest.",
  {
    method: s.stringEnum(["GET", "POST", "PATCH", "DELETE"], { description: "Subrequest HTTP method." }),
    url: subrequestUrl,
    referenceId,
    body: subrequestBody,
  },
  { optional: ["body"] },
);
const view = { apiVersion, objectName, listViewId: recordId };

export const salesforceDataActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "search_records",
    description: "Search across Salesforce objects using SOSL.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, sosl: s.nonEmptyString("SOSL search expression.") }, ["sosl"]),
    outputSchema: s.looseObject("Salesforce search results.", { searchRecords: s.array("Matching records.", record) }),
  }),
  defineProviderAction("salesforce", {
    name: "parameterized_search",
    description: "Search Salesforce without composing SOSL; supports all documented parameterized-search options.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        request: s.object(
          "Official parameterized-search request, including q, sobjects, fields, filters and limits.",
          {
            q: s.nonEmptyString("Text to search for."),
            sobjects: s.array(
              "Objects and per-object search options.",
              s.looseObject("Object search options.", { name: objectName }),
            ),
            overallLimit: s.integer("Maximum results across objects.", { minimum: 1, maximum: 2000 }),
          },
          { required: ["q"], additionalProperties: true },
        ),
      },
      ["request"],
    ),
    outputSchema: s.looseObject("Parameterized search results.", {
      searchRecords: s.array("Matching records.", record),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_record_by_external_id",
    description: "Retrieve a record by an external ID field and value.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, externalIdField, externalId, fields: fieldNames }, [
      "objectName",
      "externalIdField",
      "externalId",
    ]),
    outputSchema: s.actionOutput({ record }, "Retrieved record."),
  }),
  defineProviderAction("salesforce", {
    name: "get_related_records",
    description: "Traverse one or more Salesforce relationship API names from a record.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        recordId,
        relationships: s.array("Relationship traversal in order, up to five levels.", apiName, {
          minItems: 1,
          maxItems: 5,
        }),
        fields: fieldNames,
      },
      ["objectName", "recordId", "relationships"],
    ),
    outputSchema: s.actionOutput(
      { result: s.unknown("Relationship response, preserving records and pagination when present.") },
      "Related record or collection returned by Salesforce.",
    ),
  }),
  defineProviderAction("salesforce", {
    name: "list_updated_records",
    description: "List record IDs changed in a replication window within the last 30 days.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(timespan, ["objectName", "start", "end"]),
    outputSchema: s.looseObject("Updated record IDs and coverage watermark.", {
      ids: s.array("Updated record IDs.", recordId),
      latestDateCovered: s.string("Latest covered timestamp."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "list_deleted_records",
    description: "List deleted records within the retained delete log, at most 15 days; retain returned watermarks.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(timespan, ["objectName", "start", "end"]),
    outputSchema: s.looseObject("Deleted records and retention watermarks.", {
      deletedRecords: s.array("Deleted record IDs and deletion timestamps.", s.looseObject("Deleted record.")),
      earliestDateAvailable: s.string("Earliest available deletion timestamp."),
      latestDateCovered: s.string("Latest covered timestamp."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_record_counts",
    description: "Get approximate record counts for selected objects or all available objects.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({
      apiVersion,
      objectNames: s.array("Optional sObject API names.", objectName, { minItems: 1 }),
    }),
    outputSchema: s.looseObject("Record counts.", {
      sObjects: s.array("Object names and counts.", s.looseObject("Object count.")),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_records",
    description:
      "Retrieve up to 2000 records of one object in one request. Missing or inaccessible records return null in place.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        recordIds: s.array("Record IDs in requested order.", recordId, { minItems: 1, maxItems: 2000 }),
        fields: fieldNames,
      },
      ["objectName", "recordIds", "fields"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "create_records",
    description: "Create up to 200 records, preserving per-record success and errors.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        records: s.array("Records to create.", collectionRecord, { minItems: 1, maxItems: 200 }),
        allOrNone,
      },
      ["records"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "update_records",
    description: "Update up to 200 records, preserving per-record success and errors.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      { apiVersion, records: s.array("Records to update.", updateRecord, { minItems: 1, maxItems: 200 }), allOrNone },
      ["records"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "upsert_records",
    description: "Upsert up to 200 records of one object using an external ID field.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        externalIdField,
        records: s.array(
          "Field maps, each containing the external ID field; do not include Id or attributes.",
          fields,
          { minItems: 1, maxItems: 200 },
        ),
        allOrNone,
      },
      ["objectName", "externalIdField", "records"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "delete_records",
    description: "Delete up to 200 Salesforce records, optionally rolling back on any failure.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      { apiVersion, recordIds: s.array("Record IDs to delete.", recordId, { minItems: 1, maxItems: 200 }), allOrNone },
      ["recordIds"],
    ),
    outputSchema: itemsResult,
  }),
  defineProviderAction("salesforce", {
    name: "create_record_tree",
    description: "Create parent-child record trees atomically: at most 200 records, five object types and five levels.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        objectName,
        records: s.array(
          "Root records with attributes.type, attributes.referenceId and nested relationship records arrays.",
          s.looseObject("Salesforce tree record."),
          { minItems: 1, maxItems: 200 },
        ),
      },
      ["objectName", "records"],
    ),
    outputSchema: s.looseObject("Tree creation results.", {
      hasErrors: s.boolean("Whether the tree operation failed."),
      results: s.array("Reference IDs, record IDs and errors.", s.looseObject("Tree item result.")),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "execute_composite",
    description:
      "Execute up to 25 dependent Salesforce REST subrequests; up to five may be queries or collections. Can delete resources.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        requests: s.array("Ordered subrequests.", subrequest, { minItems: 1, maxItems: 25 }),
        allOrNone,
        collateSubrequests: s.boolean("Allow Salesforce to collate independent requests; default true."),
      },
      ["requests"],
    ),
    outputSchema: s.looseObject("Composite response.", {
      compositeResponse: s.array(
        "Per-request HTTP status, body and reference ID.",
        s.looseObject("Subrequest result."),
      ),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "execute_composite_graph",
    description:
      "Execute transactional Salesforce sObject graphs with at most 500 total subrequests and 75 graphs. Can delete resources.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        graphs: s.array(
          "Graphs executed by Salesforce.",
          s.requiredObject("Transactional graph.", {
            graphId: s.nonEmptyString("Unique graph ID."),
            compositeRequest: s.array("Graph subrequests.", graphSubrequest, { minItems: 1, maxItems: 500 }),
          }),
          { minItems: 1, maxItems: 75 },
        ),
      },
      ["graphs"],
    ),
    outputSchema: s.looseObject("Graph execution results.", {
      graphs: s.array("Per-graph success and subrequest responses.", s.looseObject("Graph result.")),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "list_list_views",
    description: "List the views available for an sObject.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName }, ["objectName"]),
    outputSchema: s.looseObject("Available list views.", {
      listviews: s.array("List view summaries.", s.looseObject("List view.")),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "describe_list_view",
    description: "Describe a list view including its columns and SOQL query.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(view, ["objectName", "listViewId"]),
    outputSchema: s.looseObject("List view metadata.", {
      id: s.string("List view ID."),
      columns: s.array("List view columns.", s.looseObject("Column metadata.")),
      query: s.string("SOQL underlying the view."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_list_view_records",
    description: "Execute a list view and retrieve rows and display metadata.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        ...view,
        limit: s.integer("Maximum records to return.", { minimum: 1, maximum: 2000 }),
        offset: s.integer("Record offset.", { minimum: 0 }),
      },
      ["objectName", "listViewId"],
    ),
    outputSchema: s.looseObject("List view rows and presentation metadata.", {
      records: s.array("Rows returned by the view.", record),
      size: s.integer("Number of rows returned."),
      done: s.boolean("Whether all results have been returned."),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_picklist_values",
    description: "Get record-type-specific picklist values, including dependencies, through UI API.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, objectName, recordTypeId: recordId }, ["objectName", "recordTypeId"]),
    outputSchema: s.looseObject("Record type picklists.", {
      picklistFieldValues: s.looseObject(
        "Picklist field names mapped to values, defaults and controlling-field indexes.",
      ),
    }),
  }),
  defineProviderAction("salesforce", {
    name: "get_current_user",
    description: "Retrieve the current authorized Salesforce identity.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion }),
    outputSchema: s.actionOutput(
      { user: s.looseObject("Current user identity returned by Salesforce.") },
      "Current identity.",
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_org_limits",
    description: "Get organization limits and remaining allocations; requires View Setup and Configuration permission.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion }),
    outputSchema: s.actionOutput(
      {
        limits: s.record(
          "Limit names mapped to their allocations.",
          s.looseObject("Allocation.", {
            Max: s.number("Maximum allocation."),
            Remaining: s.number("Remaining allocation."),
          }),
        ),
      },
      "Organization allocations.",
    ),
  }),
];
