import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "panjiva";
type ActionAsyncLifecycle = NonNullable<ActionDefinition["asyncLifecycle"]>;

const dataSource = s.nonEmptyString(
  "Data source, such as global or us-imports. Use list_data_sources to discover available sources; global covers the last five years.",
);
const query = s.object(
  "Free-text search criteria.",
  {
    text: s.string("Search text. Supports + (AND), | (OR), - (exclude), quoted phrases, trailing *, and parentheses."),
    group: s.string(
      "Named search group, such as goods_described, consignee_name, shipper_name, or main. Discover groups with get_data_source_metadata.",
    ),
    custom_group: s.array("Explicit fields to search instead of a named group.", s.string("Searchable field name.")),
    operator: s.stringEnum("Boolean operator between search terms; the upstream default is OR.", ["AND", "OR"]),
    match: s.stringEnum("Match word stems or exact terms; the upstream default is stem.", ["stem", "exact"]),
  },
  { required: ["text"] },
);
const selection = {
  query,
  queries: s.array("Multiple search criteria; every query must match.", query, { maxItems: 500 }),
  filters: s.looseObject(
    "Native Panjiva filters, including AND, OR, NOT, ranges, dates and geographic constraints. For example: {record_date:{gte:'2025-01-01'},destination_countries:'United States'}. Discover fields with get_data_source_metadata; syntax: https://panjiva.com/api-guide/data-selection/filters.",
    {},
  ),
};
const metricOperation = s.stringEnum("Statistical aggregation operation.", ["sum", "max", "avg", "min"]);
const metrics = s.array(
  "Aggregate statistics across matching shipments.",
  s.object("Metric and aggregation operation.", {
    metric: s.string(
      "Numeric field to aggregate, such as value_usd, weight_kg or volume_teu. Available fields depend on the data source.",
    ),
    op: metricOperation,
  }),
);
const groupSort = s.object(
  "Sort an aggregation; metric keys must also be declared in metrics.",
  {
    key: s.string("Sort by count, field, or an available metric."),
    order: s.stringEnum("Ascending or descending order.", ["asc", "desc"]),
    op: metricOperation,
  },
  { required: ["key"] },
);
const shipmentSort = s.array(
  "Shipment sort fields in priority order.",
  s.object("One shipment sort rule.", {
    field: s.string("Sortable shipment field; discover fields with get_data_source_metadata."),
    order: s.stringEnum("Ascending or descending order.", ["asc", "desc"]),
  }),
);
const timeSeriesFields = {
  interval: s.stringEnum("Time-series bucket interval.", ["week", "month", "quarter", "year"]),
  min_date: s.string("First date included in the time series.", { format: "date" }),
  max_date: s.string("Last date included in the time series.", { format: "date" }),
};
const dimensionFields = {
  field: s.string("Field to group by; discover available dimensions with get_data_source_metadata."),
  include_missing: s.boolean("Include missing values as NO_VALUE buckets."),
  sort: groupSort,
};
const dimensions = s.array(
  "One to three successive grouping dimensions. Only the first dimension supports offset; size plus offset cannot exceed 1000.",
  s.object(
    "One grouping dimension.",
    {
      ...dimensionFields,
      size: s.integer("Maximum buckets in this dimension; upstream default is 10.", {
        minimum: 0,
        maximum: 100,
      }),
      offset: s.integer("First-dimension bucket offset; upstream default is 0.", {
        minimum: 0,
        maximum: 999,
      }),
    },
    { required: ["field", "sort"] },
  ),
  { minItems: 1, maxItems: 3 },
);
const bulkDimensions = s.array(
  "One grouping dimension for a bulk rollup without synchronous pagination limits.",
  s.object("One bulk grouping dimension.", dimensionFields, { required: ["field", "sort"] }),
  { minItems: 1, maxItems: 1 },
);
const companyType = s.stringEnum("Company identifier representation; upstream default is country_company_name.", [
  "ccn",
  "country_company_name",
  "pid",
  "capiq",
  "ultimate_parent_capiq",
]);
const companyFields = {
  ...selection,
  company_type: companyType,
  direction: s.stringEnum("Trade role to search; upstream default is bidirectional.", [
    "bidirectional",
    "consignee",
    "shipper",
  ]),
  metrics,
};
const companySearchFields = {
  ...companyFields,
  size: s.integer("Maximum company results per trade direction.", { minimum: 0, maximum: 5000 }),
  sort: groupSort,
};
const exportFields = {
  output_format: s.stringEnum("Download file format; upstream default is jsonl.", ["jsonl", "csv"]),
  notify_email: s.string(
    "Optional email address for job completion notification. Omit to retrieve the download URL by polling.",
    { format: "email" },
  ),
};
const recordCount = s.object(
  "Matching and returned record counts.",
  {
    total: s.integer("Total matching records."),
    returned: s.integer("Records returned in this response."),
  },
  { additionalProperties: true, required: [] },
);
const analytics = s.looseObject(
  "Panjiva metrics, refinements, time_series or rollup results, keyed by requested fields.",
  {},
);
const record = s.looseObject("Native record with all data-source-specific fields preserved.", {});
const company = s.looseObject("Native company entity, trade statistics and requested aggregations.", {});
const companiesOutput = s.object(
  "Company results separated by trade role.",
  {
    consignees: s.array("Matching buyers or consignees.", company),
    shippers: s.array("Matching suppliers or shippers.", company),
  },
  { additionalProperties: true, required: [] },
);
const analyticsOutput = s.object(
  "Matching record counts and requested analytics.",
  { record_count: recordCount, analytics },
  { additionalProperties: true, required: [] },
);
const jobId = s.string("Job ID returned by the corresponding submission action.", {
  format: "uuid",
});
const jobOutput = s.looseObject("Submitted asynchronous job.", {
  job_id: jobId,
  status: s.string("Upstream job status, initially submitted."),
});
const statusOutput = s.object(
  "Asynchronous job status and download location.",
  {
    id: jobId,
    status: s.string("Upstream state: submitted, in_process, fetched, uploaded, notification_sent, or error."),
    download_url: s.string("Download URL when ready; pass this URL to a file consumer."),
    last_changed: s.string("Time of the latest state change.", { format: "date-time" }),
    parameters: s.looseObject("Original job parameters.", {}),
  },
  { additionalProperties: true, required: ["status"] },
);

const partialHs = s.string("Optional two- or four-digit HS code prefix that restricts classification results.", {
  pattern: "^(?:[0-9]{2}|[0-9]{4})$",
});
const commodityDescription = s.string("Product description to classify into HS codes.");
const hsCodeList = s.array("HS codes returned by this classification method.", s.string("HS code."));

interface PanjivaActionSpec {
  name: string;
  path: string;
  method: "GET" | "POST";
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  asyncLifecycle?: ActionAsyncLifecycle;
}
const lifecycle = (startAction: string, statusAction: string): ActionAsyncLifecycle => ({
  startActionId: `panjiva.${startAction}`,
  statusActionId: `panjiva.${statusAction}`,
});
export const panjivaActionSpecs: PanjivaActionSpec[] = [
  {
    name: "search_shipments",
    path: "/shipments/search",
    method: "POST",
    description:
      "Search Panjiva import and export shipment records with filtering, sorting, pagination and optional metrics. Use bulk_search_shipments for larger result sets.",
    inputSchema: s.object(
      "Shipment search criteria.",
      {
        data_source: dataSource,
        ...selection,
        offset: s.integer("Record offset.", { minimum: 0, maximum: 4500 }),
        size: s.integer("Maximum records to return.", { minimum: 0, maximum: 500 }),
        metrics,
        sort: shipmentSort,
      },
      { required: ["data_source"] },
    ),
    outputSchema: s.object(
      "Shipment search results.",
      {
        record_count: recordCount,
        records: s.array("Matching shipment records.", record),
        analytics,
      },
      { additionalProperties: true, required: [] },
    ),
  },
  {
    name: "get_shipment_refinements",
    path: "/shipments/refinements",
    method: "POST",
    description: "List the most common values of selected shipment attributes for matching Panjiva records.",
    inputSchema: s.object(
      "Shipment refinement criteria.",
      {
        data_source: dataSource,
        ...selection,
        fields: s.array(
          "Attributes whose top values should be returned; discover available refinements with get_data_source_metadata.",
          s.string("Shipment attribute name."),
        ),
      },
      { required: ["data_source", "fields"] },
    ),
    outputSchema: analyticsOutput,
  },
  {
    name: "get_shipment_time_series",
    path: "/shipments/time-series",
    method: "POST",
    description: "Calculate shipment metrics aggregated by week, month, quarter or year.",
    inputSchema: s.object(
      "Shipment time-series criteria.",
      { data_source: dataSource, ...selection, metrics, ...timeSeriesFields },
      { required: ["data_source", "metrics", "interval"] },
    ),
    outputSchema: analyticsOutput,
  },
  {
    name: "rollup_shipments",
    path: "/shipments/rollup",
    method: "POST",
    description:
      "Group matching shipments into up to three dimensions with metrics and optional time-series aggregation.",
    inputSchema: s.object(
      "Shipment rollup criteria.",
      {
        data_source: dataSource,
        ...selection,
        metrics,
        dimensions,
        time_series: s.object("Time-series aggregation within the rollup.", timeSeriesFields, {
          required: ["interval"],
        }),
      },
      { required: ["data_source", "dimensions"] },
    ),
    outputSchema: analyticsOutput,
  },
  {
    name: "search_companies",
    path: "/companies/search",
    method: "POST",
    description:
      "Find buyers and suppliers through matching Panjiva trade records, with company identity types and trade-role filtering.",
    inputSchema: s.object("Company search criteria.", companySearchFields, { required: [] }),
    outputSchema: companiesOutput,
  },
  {
    name: "lookup_companies",
    path: "/companies/lookup",
    method: "POST",
    description: "Retrieve Panjiva company entities by company IDs and identifier representation.",
    inputSchema: s.object(
      "Company lookup identifiers.",
      {
        company_ids: s.array("Company IDs to retrieve.", s.integer("Company ID."), { minItems: 1 }),
        company_type: companyType,
      },
      { required: ["company_ids"] },
    ),
    outputSchema: s.object(
      "Company lookup results.",
      { companies: s.array("Requested company entities.", company) },
      { additionalProperties: true, required: [] },
    ),
  },
  {
    name: "rollup_companies",
    path: "/companies/rollup",
    method: "POST",
    description: "Aggregate trade records for selected companies into up to three grouping dimensions.",
    inputSchema: s.object(
      "Company rollup criteria.",
      {
        ...companyFields,
        company_ids: s.array("Company IDs to analyze.", s.integer("Company ID.")),
        dimensions,
      },
      { required: ["dimensions"] },
    ),
    outputSchema: companiesOutput,
  },
  {
    name: "get_company_network",
    path: "/companies/network",
    method: "POST",
    description: "Retrieve a company's top buyers, suppliers and trade statistics from Panjiva.",
    inputSchema: s.object(
      "Company network criteria.",
      {
        ...companySearchFields,
        company_id: s.integer("Company ID whose trade network should be retrieved."),
      },
      { required: ["company_id"] },
    ),
    outputSchema: s.object("Company trade network.", {
      network: s.record(
        "Trade network keyed by company ID.",
        s.looseObject("Company network with top_consignees, top_shippers and stats.", {}),
      ),
    }),
  },
  {
    name: "search_hs_codes",
    path: "/hs-codes/search",
    method: "POST",
    description: "Search Harmonized System codes and US Harmonized Tariff Schedule descriptions.",
    inputSchema: s.object(
      "HS code search criteria.",
      {
        query: s.object("HS code text query.", {
          text: s.string("Text to search in HS code descriptions."),
        }),
        queries: s.array(
          "Additional HS code text queries.",
          s.object("HS code text query.", {
            text: s.string("Text to search in HS code descriptions."),
          }),
        ),
        filters: s.looseObject(
          "HS code level and section constraints, supporting AND, OR and NOT. Levels are 2, 4, 6, 8 or 10.",
          {},
        ),
        offset: s.integer("Record offset.", { minimum: 0, maximum: 4500 }),
        size: s.integer("Maximum records to return.", { minimum: 0, maximum: 500 }),
      },
      { required: ["query"] },
    ),
    outputSchema: s.object(
      "HS code search results.",
      {
        record_count: recordCount,
        results: s.array(
          "Matching HS codes.",
          s.looseObject("HS code and its hierarchy.", {
            commodity: s.string("HS code."),
            description: s.string("Commodity description."),
            level: s.string("HS code digit level."),
            parent: s.string("Parent HS code."),
            section: s.string("HS system section."),
          }),
        ),
        analytics,
      },
      { additionalProperties: true, required: [] },
    ),
  },
  {
    name: "parse_hs_codes",
    path: "/hs-codes/parse",
    method: "POST",
    description:
      "Identify HS codes from a product description using the Panjiva commodity coder. Optionally restrict the HS prefix and enable parser, manual rules or classifier methods; the first matching method supplies the results.",
    inputSchema: s.object(
      "Commodity coding request.",
      {
        description: commodityDescription,
        partial_hs: partialHs,
        use_parser: s.boolean("Whether to extract HS codes already present in the description."),
        use_manual_logic: s.boolean("Whether to match predefined classification rules."),
        use_classifier: s.boolean("Whether to use the machine-learning HS classifier."),
      },
      { required: ["description"] },
    ),
    outputSchema: s.looseObject("Commodity coding results.", {
      result_count: s.number("Number of classification results reported by Panjiva."),
      results: s.array(
        "HS code classification candidates.",
        s.looseObject("One HS code prediction.", {
          predCode: s.string("Predicted HS code."),
          description: s.string("Description associated with the predicted code."),
          confidence: s.number("Confidence value reported by Panjiva."),
          source: s.string("Classification method that produced the prediction."),
        }),
      ),
    }),
  },
  {
    name: "parse_many_hs_codes",
    path: "/hs-codes/parse-many",
    method: "POST",
    description:
      "Call Panjiva's Parse Many commodity coder and return per-item HS codes and classifier metadata. The published request schema defines items as an object with description, optional marks and partial_hs; pass that documented object shape.",
    inputSchema: s.object("Parse Many commodity coding request.", {
      items: s.object(
        "Commodity item object as defined by the official Parse Many request schema.",
        {
          description: commodityDescription,
          marks: s.string("Shipment marks text accompanying the product description."),
          partial_hs: partialHs,
        },
        { required: ["description"] },
      ),
    }),
    outputSchema: s.looseObject("Parse Many classification results and model metadata.", {
      classifier_training_date: s.string("Classifier training date reported by Panjiva."),
      classifier_version: s.string("Classifier model version."),
      items: s.array(
        "Per-item commodity classification results.",
        s.looseObject("Classification results for one commodity item.", {
          parsed_hs_codes: hsCodeList,
          piers_override: hsCodeList,
          panjiva_override: hsCodeList,
          classifier_codes: s.array(
            "HS codes predicted by the classifier.",
            s.looseObject("One classifier prediction.", {
              hs_code: s.string("Predicted HS code."),
              confidence: s.number("Confidence value reported by Panjiva."),
            }),
          ),
        }),
      ),
    }),
  },
  {
    name: "list_data_sources",
    path: "/metadata/data-sources",
    method: "GET",
    description: "List the Panjiva data sources available to the connected organization.",
    inputSchema: s.object("No input is required.", {}),
    outputSchema: s.object(
      "Available data sources.",
      {
        data_sources: s.array("Available data-source identifiers.", s.string("Data-source identifier.")),
      },
      { additionalProperties: true, required: [] },
    ),
  },
  {
    name: "get_data_source_metadata",
    path: "/metadata/data-source/{data_source}",
    method: "GET",
    description:
      "Discover searchable fields, filters, sort keys, metrics, dimensions and refinements for a Panjiva data source.",
    inputSchema: s.object("Data source to inspect.", { data_source: dataSource }),
    outputSchema: s.object(
      "Data-source query capabilities.",
      {
        query: s.looseObject("Query groups and defaults.", {}),
        filters: s.array("Filter fields and their types.", record),
        sort: s.looseObject("Valid sort keys and defaults.", {}),
        metrics: s.array("Available metrics and supported operations.", record),
        dimensions: s.array("Available dimension fields.", s.string("Dimension field.")),
        refinements: s.array("Available refinement fields.", s.string("Refinement field.")),
      },
      { additionalProperties: true, required: [] },
    ),
  },
  {
    name: "get_data_source_schema",
    path: "/metadata/data-source/{data_source}/schema",
    method: "GET",
    description: "Retrieve native shipment record schemas for a Panjiva data source.",
    inputSchema: s.object("Data source to inspect.", { data_source: dataSource }),
    outputSchema: s.object("Data-source shipment schemas.", {
      schemas: s.record("Schemas keyed by country and trade direction.", record),
    }),
  },
  {
    name: "bulk_search_shipments",
    path: "/bulk/shipments/search",
    method: "POST",
    description:
      "Submit a large shipment search for JSONL or CSV download. Poll get_bulk_job_status with the returned job ID.",
    inputSchema: s.object(
      "Bulk shipment search criteria.",
      { ...exportFields, data_source: dataSource, ...selection, sort: shipmentSort },
      { required: ["data_source"] },
    ),
    outputSchema: jobOutput,
    asyncLifecycle: lifecycle("bulk_search_shipments", "get_bulk_job_status"),
  },
  {
    name: "bulk_rollup_shipments",
    path: "/bulk/shipments/rollup",
    method: "POST",
    description:
      "Submit a bulk shipment aggregation for JSONL or CSV download. Poll get_bulk_job_status with the returned job ID.",
    inputSchema: s.object(
      "Bulk shipment rollup criteria.",
      {
        ...exportFields,
        data_source: dataSource,
        ...selection,
        metrics,
        dimensions: bulkDimensions,
      },
      { required: ["data_source", "dimensions"] },
    ),
    outputSchema: jobOutput,
    asyncLifecycle: lifecycle("bulk_rollup_shipments", "get_bulk_job_status"),
  },
  {
    name: "batch_search_companies",
    path: "/batch/companies/search",
    method: "POST",
    description:
      "Submit multiple company searches as one downloadable batch. Poll get_batch_job_status with the returned job ID.",
    inputSchema: s.object(
      "Batch company searches.",
      {
        ...exportFields,
        requests: s.array(
          "Individual company search requests.",
          s.object("Company search criteria.", companySearchFields, { required: [] }),
          { minItems: 1, maxItems: 50000 },
        ),
      },
      { required: ["requests"] },
    ),
    outputSchema: jobOutput,
    asyncLifecycle: lifecycle("batch_search_companies", "get_batch_job_status"),
  },
  {
    name: "get_bulk_job_status",
    path: "/bulk/status/{job_id}",
    method: "GET",
    description: "Check a bulk shipment job and retrieve its download URL when ready.",
    inputSchema: s.object("Bulk job to inspect.", { job_id: jobId }),
    outputSchema: statusOutput,
    asyncLifecycle: lifecycle("bulk_search_shipments", "get_bulk_job_status"),
  },
  {
    name: "get_batch_job_status",
    path: "/batch/status/{job_id}",
    method: "GET",
    description: "Check a batch company search job and retrieve its download URL when ready.",
    inputSchema: s.object("Batch job to inspect.", { job_id: jobId }),
    outputSchema: statusOutput,
    asyncLifecycle: lifecycle("batch_search_companies", "get_batch_job_status"),
  },
];
export const panjivaActions: readonly ActionDefinition[] = panjivaActionSpecs.map((spec) =>
  defineProviderAction(service, {
    name: spec.name,
    description: spec.description,
    operationType: ["bulk_search_shipments", "bulk_rollup_shipments", "batch_search_companies"].includes(spec.name)
      ? "write"
      : "read",
    inputSchema: spec.inputSchema,
    outputSchema: spec.outputSchema,
    asyncLifecycle: spec.asyncLifecycle,
  }),
);
