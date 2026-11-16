import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const runId = s.string("Batch routine run ID.", { minLength: 1, maxLength: 64 });
export const clayBatchActions: ActionDefinition[] = [
  defineProviderAction("clay", {
    name: "run_routine_batch",
    operationType: "destructive",
    description:
      "Download a JSONL file, upload it to Clay, and start an asynchronous batch routine. Each line must contain id and inputs. The routine may perform arbitrary downstream mutations. Requires streaming transit storage. Transfer limit: the lower of 2 GiB and the configured transit storage limit, five minutes each for download and upload; JSONL validation is performed by Clay.",
    inputSchema: s.object(
      "Batch routine submission parameters.",
      {
        routine_id: s.string("Routine ID, such as function:t_abc123.", {
          minLength: 1,
          maxLength: 64,
        }),
        fileUrl: s.string(
          "Public HTTP(S) URL of a UTF-8 JSONL file; signed URLs are supported. The connector downloads it without Clay credentials.",
          { format: "uri", minLength: 1 },
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
      "Submitted batch routine run.",
      {
        routine_run_id: runId,
        status: s.string("Initial run status, in_progress."),
      },
      {
        required: ["routine_run_id", "status"],
        additionalProperties: true,
      },
    ),
    asyncLifecycle: {
      startActionId: "clay.run_routine_batch",
      statusActionId: "clay.get_routine_batch_results",
    },
  }),
  defineProviderAction("clay", {
    name: "get_routine_batch_results",
    operationType: "read",
    description:
      "Get batch progress, a result download URL, or validation/processing failure details. Download result_url separately after completion and inspect individual item outcomes; results are not loaded into the action response.",
    inputSchema: s.requiredObject("Batch result parameters.", { routine_run_id: runId }),
    outputSchema: s.object(
      "Batch progress or terminal outcome.",
      {
        routine_run_id: runId,
        status: s.string(
          "Batch status: in_progress, complete, validation_failed, or processing_failed; unknown statuses are preserved.",
        ),
        total: s.number("Total input items, when available."),
        finished: s.number("Finished items, including failures, when available."),
        result_url: s.string("Result file download URL returned on completion; may contain a signed access token.", {
          format: "uri",
        }),
        error: s.object(
          "Batch validation or processing error.",
          {
            message: s.string("Failure message."),
            total_invalid_rows: s.number("Total invalid JSONL rows for validation failures."),
            details: s.array(
              "Validation errors reported by Clay, up to 100 entries.",
              s.object(
                "One JSONL validation error.",
                {
                  field: s.string("Invalid field."),
                  line_number: s.number("JSONL line number."),
                  message: s.string("Validation error message."),
                },
                {
                  required: ["field", "line_number", "message"],
                  additionalProperties: true,
                },
              ),
            ),
          },
          {
            required: ["message"],
            additionalProperties: true,
          },
        ),
      },
      {
        required: ["routine_run_id", "status"],
        additionalProperties: true,
      },
    ),
    asyncLifecycle: {
      startActionId: "clay.run_routine_batch",
      statusActionId: "clay.get_routine_batch_results",
    },
  }),
];
