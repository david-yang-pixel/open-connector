import type { TinyfishEndpoint } from "./endpoints.ts";

import { s } from "../../core/json-schema.ts";
const runStatus = s.stringEnum("Current automation run status.", [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);
const runId = s.nonEmptyString("Automation run ID.", { pattern: "^[A-Za-z0-9_-]+$" });
const outputSchema = s.record(
  "Provider-supported structured-output schema subset. Unsupported schema keywords are rejected by TinyFish.",
  true,
);
const profileId = s.nonEmptyString("Browser Context Profile ID to use when use_profile is true.");
const runProperties = {
  url: s.url("Target website URL to automate."),
  goal: s.nonEmptyString("Natural language description of the task to perform on the website."),
  browser_profile: s.stringEnum("Browser profile: lite uses a standard browser; stealth enables anti-detection.", [
    "lite",
    "stealth",
  ]),
  api_integration: s.string("Integration name used for analytics."),
  agent_config: s.object(
    "Agent behavior configuration.",
    {
      mode: s.stringEnum("Strict mode enables fail-fast behavior for test automation.", ["default", "strict"]),
      cursor_style: s.stringEnum("Browser agent cursor style.", ["fish", "standard", "green-pointer"]),
      max_steps: s.integer("Maximum tool-call steps; the provider default is 150.", {
        minimum: 1,
        maximum: 500,
      }),
      max_duration_seconds: s.integer("Maximum wall-clock execution time in seconds. Omit for no limit.", {
        minimum: 1,
      }),
    },
    { required: [] },
  ),
  capture_config: s.object(
    "Data to capture during the run.",
    {
      elements: s.boolean("Capture page elements."),
      snapshots: s.boolean("Capture browser snapshots."),
      screenshots: s.boolean("Capture screenshots."),
      recording: s.boolean("Record the browser session."),
      html: s.boolean("Capture full-page HTML snapshots."),
    },
    { required: [] },
  ),
  webhook_url: s.url("HTTPS URL for run lifecycle webhook notifications."),
  use_vault: s.boolean("Use enabled vault credentials for this run. Defaults to false."),
  use_profile: s.boolean(
    "Use a Browser Context Profile. If profiles are enabled and no profile_id is given, a default profile must exist. Legacy calls are ignored when profiles are disabled.",
  ),
  credential_item_ids: s.stringArray(
    "Credential URIs to use. Requires use_vault=true; omit to use all enabled items.",
    { minItems: 1, itemDescription: "Vault credential URI." },
  ),
  proxy_config: s.object(
    "Browser proxy configuration.",
    {
      enabled: s.boolean("Enable a proxy for this run."),
      country_code: s.string("Proxy exit country as ISO 3166-1 alpha-2; defaults to US."),
    },
    { required: ["enabled"] },
  ),
};
const runInput = s.object(
  "Browser automation task parameters.",
  {
    ...runProperties,
    profile_id: profileId,
    output_schema: outputSchema,
  },
  { required: ["url", "goal"] },
);
const errorSchema = s.nullable(
  s.looseObject("Provider error details, including retry guidance and profile setup hints.", {
    code: s.string("Machine-readable error code."),
    message: s.string("Human-readable error message."),
    category: s.string("Error category: SYSTEM_FAILURE, AGENT_FAILURE, BILLING_FAILURE, or UNKNOWN."),
    retry_after: s.nullableNumber("Suggested retry delay in seconds, or null when not retryable."),
    help_url: s.string("Troubleshooting documentation URL."),
    help_message: s.string("Troubleshooting guidance."),
    details: { description: "Additional provider error details, including validation errors." },
  }),
);
const profileHint = s.looseObject("Profile setup guidance for authentication walls or bot challenges.", {
  message: s.string("Human-readable setup guidance."),
  setup_url: s.string("Profile setup URL."),
  reason: s.string("Reason a profile may help: auth_wall or bot_challenge."),
});
const runSummaryProperties = {
  run_id: runId,
  status: runStatus,
  goal: s.string("Natural language goal for this automation run."),
  created_at: s.string("Run creation timestamp."),
  started_at: s.nullableString("Run start timestamp, or null before execution."),
  finished_at: s.nullableString("Run completion timestamp, or null before completion."),
  num_of_steps: s.nullableInteger("Number of automation steps; null while in progress.", {
    minimum: 0,
  }),
  result: s.nullable(s.record("Extracted structured result.", true)),
  output_schema: s.nullable(outputSchema),
  profile_attached: s.boolean("Whether a Browser Context Profile was attached."),
  profile_id: s.nullableString("Attached Browser Context Profile ID, or null."),
  error: errorSchema,
  profile_hint: profileHint,
  streaming_url: s.nullableString("Live browser session URL, available while running."),
  browser_config: s.nullable(
    s.looseObject("Browser configuration used by the run.", {
      proxy_enabled: s.nullableBoolean("Whether a proxy was enabled."),
      proxy_country_code: s.nullableString("Proxy exit country code."),
    }),
  ),
};
const runDetail = s.object(
  "Automation run details and captured steps.",
  {
    ...runSummaryProperties,
    video_url: s.nullableString("Presigned recording URL, expiring after 15 minutes, or null."),
    steps: s.array(
      "Steps performed during this run.",
      s.looseObject("An automation step.", {
        id: s.string("Step event ID."),
        timestamp: s.string("Step timestamp."),
        status: runStatus,
        action: s.nullableString("Description of the performed action."),
        screenshot: s.nullableString("Screenshot URL or data URI according to the requested delivery mode, or null."),
        html: s.nullableString("HTML snapshot URL, or null. Requires capture_config.html when submitting."),
        duration: s.nullableString("Step duration."),
      }),
    ),
  },
  {
    required: ["run_id", "status"],
    additionalProperties: true,
  },
);
const cancellation = s.looseObject("Cancellation result; terminal runs retain their existing status.", {
  run_id: runId,
  status: s.stringEnum("Final run status.", ["CANCELLED", "COMPLETED", "FAILED"]),
  cancelled_at: s.nullableString("Cancellation timestamp, or null when not cancelled."),
  message: s.nullableString("Additional cancellation context."),
});
const batchIds = s.requiredObject("Run IDs to retrieve or cancel.", {
  run_ids: s.stringArray("Run IDs.", {
    minItems: 1,
    maxItems: 100,
    itemDescription: "Automation run ID.",
  }),
});
const notFound = s.nullable(
  s.stringArray("Run IDs not found or not owned; null if all were found.", {
    itemDescription: "Unresolved run ID.",
  }),
);
const fileOutput = s.requiredObject("Captured file uploaded to file transit.", {
  url: s.url("Download URL of the captured file."),
  mimeType: s.string("Captured file MIME type."),
});
const stepInput = s.requiredObject("Run and captured step identifiers.", {
  id: runId,
  stepId: s.nonEmptyString("Step event ID.", { pattern: "^[A-Za-z0-9_-]+$" }),
});
export const agentEndpoints: TinyfishEndpoint[] = [
  {
    name: "submit_run",
    description:
      "Submit a browser automation task asynchronously. The agent can perform arbitrary website operations; use get_run to retrieve progress and results.",
    operationType: "destructive",
    origin: "main",
    method: "POST",
    path: "/v1/automation/run-async",
    inputSchema: runInput,
    outputSchema: s.looseObject("Asynchronous automation submission.", {
      run_id: s.nullableString("Created run ID; null if creation failed."),
      error: errorSchema,
    }),
  },
  {
    name: "submit_run_batch",
    description:
      "Atomically submit 1–100 browser automation tasks. Shared profile_id and output_schema apply to the batch. Retrieve each run using get_run or get_runs.",
    operationType: "destructive",
    origin: "main",
    method: "POST",
    path: "/v1/automation/run-batch",
    inputSchema: s.object(
      "Batch automation parameters.",
      {
        runs: s.array(
          "Automation tasks.",
          s.object("One automation task.", runProperties, { required: ["url", "goal"] }),
          { minItems: 1, maxItems: 100 },
        ),
        profile_id: profileId,
        output_schema: outputSchema,
      },
      { required: ["runs"] },
    ),
    outputSchema: s.looseObject("Atomic batch submission result.", {
      run_ids: s.nullable(
        s.stringArray("Created run IDs, or null on failure.", {
          itemDescription: "Created run ID.",
        }),
      ),
      error: errorSchema,
    }),
  },
  {
    name: "list_runs",
    description: "List and search automation runs with cursor pagination, status, goal, and creation-time filters.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/runs",
    queryKeys: ["status", "goal", "created_after", "created_before", "sort_direction", "cursor", "limit"],
    inputSchema: s.object(
      "Run search and pagination parameters.",
      {
        status: runStatus,
        goal: s.string("Case-insensitive partial goal text filter.", { maxLength: 500 }),
        created_after: s.string("Filter runs created after this ISO 8601 timestamp.", {
          format: "date-time",
        }),
        created_before: s.string("Filter runs created before this ISO 8601 timestamp.", {
          format: "date-time",
        }),
        sort_direction: s.stringEnum("Sort order by creation time; defaults to desc.", ["asc", "desc"]),
        cursor: s.string("Pagination cursor from the previous response."),
        limit: s.integer("Maximum results; defaults to 20.", { minimum: 1, maximum: 100 }),
      },
      { required: [] },
    ),
    outputSchema: s.looseObject("Paginated automation runs.", {
      data: s.array(
        "Run summaries without steps and video URLs.",
        s.looseObject("Automation run summary.", runSummaryProperties),
      ),
      pagination: s.looseObject("Pagination information.", {
        total: s.integer("Total matching runs."),
        next_cursor: s.nullableString("Next-page cursor; null on the last page."),
        has_more: s.boolean("Whether more results exist."),
      }),
    }),
  },
  {
    name: "get_runs",
    description: "Retrieve up to 100 automation runs, including per-run results, steps, and missing IDs.",
    operationType: "read",
    origin: "main",
    method: "POST",
    path: "/v1/runs/batch",
    inputSchema: batchIds,
    outputSchema: s.looseObject("Batch run retrieval result.", {
      data: s.array("Found automation runs.", runDetail),
      not_found: notFound,
    }),
  },
  {
    name: "cancel_runs",
    description:
      "Cancel up to 100 automation runs. Already terminal runs retain their existing status; missing IDs are returned separately.",
    operationType: "destructive",
    origin: "main",
    method: "POST",
    path: "/v1/runs/batch/cancel",
    inputSchema: batchIds,
    outputSchema: s.looseObject("Batch cancellation result.", {
      results: s.array("Per-run cancellation results.", cancellation),
      not_found: notFound,
    }),
  },
  {
    name: "get_run",
    description:
      "Retrieve an automation run and captured steps. Prefer screenshot URLs for JSON clients; use get_step_screenshot or get_step_html to transfer captured files.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/runs/{id}",
    pathKeys: ["id"],
    queryKeys: ["screenshots", "html"],
    inputSchema: s.object(
      "Run details and capture delivery options.",
      {
        id: runId,
        screenshots: s.stringEnum(
          "Screenshot delivery mode; defaults to url. Base64 embeds potentially large data URIs.",
          ["base64", "url", "none"],
        ),
        html: s.stringEnum(
          "HTML snapshot delivery mode; defaults to url and requires capture_config.html at submission.",
          ["url", "none"],
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: runDetail,
  },
  {
    name: "cancel_run",
    description:
      "Cancel an asynchronous automation run. Already terminal runs retain their status. Runs started through the synchronous API cannot be cancelled.",
    operationType: "destructive",
    origin: "main",
    method: "POST",
    path: "/v1/runs/{id}/cancel",
    pathKeys: ["id"],
    inputSchema: s.requiredObject("Run to cancel.", { id: runId }),
    outputSchema: cancellation,
  },
  {
    name: "get_step_screenshot",
    description: "Download a captured automation-step screenshot and return a file-transit URL.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/runs/{id}/steps/{stepId}/screenshot",
    pathKeys: ["id", "stepId"],
    inputSchema: stepInput,
    outputSchema: fileOutput,
    responseType: "screenshot",
  },
  {
    name: "get_step_html",
    description:
      "Download a captured automation-step HTML snapshot and return a file-transit URL. Requires capture_config.html when submitting the run.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/runs/{id}/steps/{stepId}/html",
    pathKeys: ["id", "stepId"],
    inputSchema: stepInput,
    outputSchema: fileOutput,
    responseType: "html",
  },
];
