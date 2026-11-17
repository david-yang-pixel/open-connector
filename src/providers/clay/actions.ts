import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { clayBatchActions } from "./batch-actions.ts";
import { tableQueryInput } from "./table-schema.ts";
const empty = s.requiredObject("No parameters.", {});
const reference = s.object(
  "Query reference.",
  {
    reference: s.string("Query grammar and field catalog in Markdown."),
  },
  {
    required: ["reference"],
    additionalProperties: true,
  },
);
const routineId = s.string("Routine ID, such as function:t_abc123.", {
  minLength: 1,
  maxLength: 64,
});
const runId = s.string("Routine run ID.", { minLength: 1, maxLength: 64 });
const cursor = s.string("Opaque cursor returned by the previous page.");
const pageLimit = s.integer("Maximum results per page, from 1 to 100.", {
  minimum: 1,
  maximum: 100,
});
const runOutput = s.object(
  "Routine run progress and results. A complete run may contain failed items.",
  {
    routine_run_id: runId,
    status: s.string("Run status; in_progress or complete. Preserve unknown terminal statuses."),
    total: s.number("Total input items in the run."),
    finished: s.number("Finished items, including failures."),
    data: s.array(
      "Results on this page; absent while running.",
      s.object(
        "One item result.",
        {
          id: s.string("Caller-supplied item ID."),
          status: s.string("Item status, complete or failed."),
          result: s.looseObject("Function-defined output fields."),
          error: s.looseObject("Item failure details.", { message: s.string("Failure message.") }),
        },
        {
          required: ["id", "status"],
          additionalProperties: true,
        },
      ),
    ),
    cursor,
  },
  {
    required: ["routine_run_id", "status"],
    additionalProperties: true,
  },
);
export const clayActions: ActionDefinition[] = [
  ...clayBatchActions,
  defineProviderAction("clay", {
    name: "get_me",
    operationType: "read",
    description: "Get the Clay user and workspace associated with the API key.",
    inputSchema: empty,
    outputSchema: s.object(
      "Authenticated identity.",
      {
        user: s.object(
          "Clay user.",
          {
            id: s.string("User ID."),
            name: s.nullable(s.string("User name.")),
            email: s.nullable(s.string("User email.")),
            cli_onboarded: s.boolean("Whether CLI onboarding is complete."),
          },
          {
            required: ["id", "name"],
            additionalProperties: true,
          },
        ),
        workspace: s.object(
          "Clay workspace.",
          {
            id: s.string("Workspace ID."),
            name: s.nullable(s.string("Workspace name.")),
          },
          {
            required: ["id"],
            additionalProperties: true,
          },
        ),
      },
      {
        required: ["user", "workspace"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("clay", {
    name: "get_credit_balance",
    operationType: "read",
    description: "Get workspace credit balances without consuming credits.",
    inputSchema: empty,
    outputSchema: s.object(
      "Workspace credit balances.",
      {
        balance: s.number("Remaining spendable data credits, including rollover."),
        action_execution_balance: s.number("Remaining actions; absent on some billing plans."),
      },
      {
        required: ["balance"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("clay", {
    name: "get_search_query_reference",
    operationType: "read",
    description: "Get the current Clay search query grammar and fields before creating a search.",
    inputSchema: empty,
    outputSchema: reference,
  }),
  defineProviderAction("clay", {
    name: "create_search",
    operationType: "write",
    description:
      "Create a stateful company or people search from a Clay query. Count-mode and jobs queries are unsupported.",
    inputSchema: s.requiredObject("Search creation parameters.", {
      query: s.nonEmptyString("Clay advanced search query; obtain grammar with get_search_query_reference."),
    }),
    outputSchema: s.object(
      "Created search iterator.",
      {
        search_id: s.string("Search ID to pass to get_search_results."),
        source_type: s.string("Detected source type, people or companies."),
      },
      {
        required: ["search_id", "source_type"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("clay", {
    name: "get_search_results",
    operationType: "write",
    description:
      "Fetch the next page and advance a Clay search iterator. Do not retry blindly: each call advances the iterator.",
    inputSchema: s.object(
      "Search page parameters.",
      {
        search_id: s.nonEmptyString("Search ID returned by create_search."),
        limit: s.integer("Page size, 1–500; default 20. Free and trial plans allow at most 50.", {
          minimum: 1,
          maximum: 500,
        }),
      },
      {
        optional: ["limit"],
      },
    ),
    outputSchema: s.object(
      "Search page.",
      {
        data: s.array("Company or people records.", s.looseObject("Search record with upstream fields.")),
        has_more: s.boolean("Whether more results can be fetched."),
        source_type: s.string("Source type, people or companies."),
        exhaustion_reason: s.string("Why results ended: query_limit or no_more_results."),
        period_quota: s.looseObject("Search quota for the current period.", {
          limit: s.number("Period quota limit."),
          used: s.number("Results used in this period."),
          remaining: s.number("Remaining results in this period."),
          resets_at: s.string("Quota reset time."),
        }),
      },
      {
        required: ["data", "has_more", "source_type"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("clay", {
    name: "run_routine",
    operationType: "destructive",
    description:
      "Run a configured Clay routine on 1–100 items asynchronously. The routine may perform arbitrary downstream mutations; inspect its definition before running.",
    inputSchema: s.object(
      "Routine execution parameters.",
      {
        routine_id: routineId,
        items: s.array(
          "Items to process.",
          s.requiredObject("One input item.", {
            id: s.string("Caller-supplied item ID for matching results.", {
              minLength: 1,
              maxLength: 64,
            }),
            inputs: s.looseObject("Function-defined input fields."),
          }),
          { minItems: 1, maxItems: 100 },
        ),
        webhook_id: s.string("ID of an existing Clay webhook to notify on completion.", {
          minLength: 1,
          maxLength: 64,
        }),
      },
      {
        optional: ["webhook_id"],
      },
    ),
    outputSchema: s.object(
      "Submitted routine run.",
      { routine_run_id: runId, status: s.string("Initial run status, in_progress.") },
      {
        required: ["routine_run_id", "status"],
        additionalProperties: true,
      },
    ),
    asyncLifecycle: {
      startActionId: "clay.run_routine",
      statusActionId: "clay.get_routine_results",
    },
  }),
  defineProviderAction("clay", {
    name: "get_routine_results",
    operationType: "read",
    description:
      "Get routine progress or one page of completed results. Follow cursor until absent and check each item's status.",
    inputSchema: s.object(
      "Routine result parameters.",
      { routine_run_id: runId, cursor, limit: pageLimit },
      {
        optional: ["cursor", "limit"],
      },
    ),
    outputSchema: runOutput,
    asyncLifecycle: {
      startActionId: "clay.run_routine",
      statusActionId: "clay.get_routine_results",
    },
  }),
  defineProviderAction("clay", {
    name: "query_tables",
    operationType: "read",
    description:
      "Query known Clay tables on Enterprise plans. Concurrent updates can repeat rows; deduplicate by ID. Custom ordering and aggregation do not support cursor pagination.",
    inputSchema: tableQueryInput,
    outputSchema: s.object(
      "Table query results.",
      {
        data: s.array(
          "Rows keyed by selected field; cells include status and value.",
          s.looseObject("Row of cell results."),
        ),
        fields: s.looseObject("Field metadata keyed by output column."),
        cursor,
        truncated: s.boolean(
          "More rows matched but this query cannot issue a cursor; narrow the query or increase the limit.",
        ),
      },
      {
        required: ["data"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("clay", {
    name: "get_workflow_run_query_reference",
    operationType: "read",
    description: "Get the workflow-run query grammar and supported fields (beta).",
    inputSchema: empty,
    outputSchema: reference,
  }),
  defineProviderAction("clay", {
    name: "query_workflow_runs",
    operationType: "read",
    description:
      "Search or count workflow runs (beta). Results are eventually consistent; recently changed runs may be stale or absent.",
    inputSchema: s.object(
      "Workflow-run query parameters.",
      {
        query: s.string("Clay workflow-run select or count query.", {
          minLength: 1,
          maxLength: 2000,
        }),
        cursor,
        limit: pageLimit,
      },
      {
        optional: ["cursor", "limit"],
      },
    ),
    outputSchema: s.object(
      "Workflow-run query result.",
      {
        mode: s.string("Query mode, select or count."),
        count: s.integer("Number of matching runs for count mode.", { minimum: 0 }),
        data: s.array("Matching runs in newest-first order for select mode.", s.looseObject("Workflow run metadata.")),
        cursor,
      },
      {
        required: ["mode"],
        additionalProperties: true,
      },
    ),
  }),
];
