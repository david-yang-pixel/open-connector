import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const jobFields = {
  name: s.string("Job name containing only letters, digits, hyphens, and underscores.", {
    minLength: 1,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9_-]+$",
  }),
  url: s.string("HTTP or HTTPS URL called by Cronlytic.", { format: "uri", pattern: "^https?://" }),
  method: s.stringEnum("HTTP method used by the scheduled request.", [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
  ]),
  headers: s.record("Headers sent to the scheduled destination.", s.string("Header value.")),
  body: s.string("Request body sent verbatim to the destination; may be empty."),
  cron_expression: s.nonEmptyString("Standard five-field cron expression: minute hour day month weekday."),
};
const jobId = { job_id: s.nonEmptyString("Cronlytic job ID.") };
const jobInput = s.requiredObject("Identify a Cronlytic job.", jobId);
const jobOutput = s.looseObject("Cronlytic job, including any additional upstream fields.", {
  job_id: s.string("Cronlytic job ID."),
  user_id: s.string("Owner user ID."),
  name: s.string("Job name."),
  url: s.string("Scheduled destination URL."),
  method: s.string("Scheduled HTTP method."),
  headers: s.record("Scheduled request headers.", s.string("Header value.")),
  body: s.string("Scheduled request body."),
  cron_expression: s.string("Five-field cron expression."),
  status: s.string("Current job status, including pending, paused, success, failed, or quota_reached."),
  last_run_at: s.nullable(s.string("Last execution timestamp, or null if never executed.")),
  next_run_at: s.nullable(s.string("Next scheduled execution timestamp, or null.")),
});
export const cronlyticActions: ActionDefinition[] = [
  defineProviderAction("cronlytic", {
    name: "create_job",
    operationType: "write",
    description: "Create a recurring HTTP job in Cronlytic.",
    requiredScopes: [],
    inputSchema: s.object(
      "Create a recurring HTTP job; omitted method, headers, and body default to GET, {}, and an empty string.",
      jobFields,
      { optional: ["method", "headers", "body"] },
    ),
    outputSchema: jobOutput,
  }),
  defineProviderAction("cronlytic", {
    name: "list_jobs",
    operationType: "read",
    description: "List all Cronlytic jobs for the connected user.",
    requiredScopes: [],
    inputSchema: s.requiredObject("List jobs without pagination parameters.", {}),
    outputSchema: s.requiredObject("All jobs belonging to the connected user.", {
      jobs: s.array("Cronlytic jobs.", jobOutput),
    }),
  }),
  defineProviderAction("cronlytic", {
    name: "get_job",
    operationType: "read",
    description: "Get a Cronlytic job and its current schedule.",
    requiredScopes: [],
    inputSchema: jobInput,
    outputSchema: jobOutput,
  }),
  defineProviderAction("cronlytic", {
    name: "update_job",
    operationType: "write",
    description: "Update a Cronlytic job using its complete configuration; provide all six job fields.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Complete replacement job configuration.", { ...jobId, ...jobFields }),
    outputSchema: jobOutput,
  }),
  defineProviderAction("cronlytic", {
    name: "delete_job",
    operationType: "destructive",
    description: "Permanently delete a Cronlytic job and all its execution logs.",
    requiredScopes: [],
    inputSchema: jobInput,
    outputSchema: s.looseObject("Job deletion result.", {
      deleted: s.boolean("Whether the job was deleted."),
    }),
  }),
  defineProviderAction("cronlytic", {
    name: "pause_job",
    operationType: "destructive",
    description: "Pause a Cronlytic job to stop scheduled executions while retaining its configuration.",
    requiredScopes: [],
    inputSchema: jobInput,
    outputSchema: jobOutput,
  }),
  defineProviderAction("cronlytic", {
    name: "resume_job",
    operationType: "write",
    description: "Resume a paused Cronlytic job according to its cron expression.",
    requiredScopes: [],
    inputSchema: jobInput,
    outputSchema: jobOutput,
  }),
  defineProviderAction("cronlytic", {
    name: "get_job_logs",
    operationType: "read",
    description: "Get the latest 50 execution logs for a Cronlytic job, newest first.",
    requiredScopes: [],
    inputSchema: jobInput,
    outputSchema: s.looseObject("Recent job execution logs.", {
      job_id: s.string("Cronlytic job ID."),
      logs: s.array(
        "Up to 50 execution logs, newest first.",
        s.looseObject("One job execution.", {
          timestamp: s.string("Execution timestamp."),
          status: s.string("Execution status."),
          response_code: s.nullable(s.integer("Destination HTTP response status, or null when unavailable.")),
          response_time: s.number("Request duration in seconds."),
          error_message: s.string("Execution error message, or an empty string."),
        }),
      ),
    }),
  }),
];
