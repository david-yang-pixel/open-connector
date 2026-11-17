import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const taskId = s.nonEmptyString("Task ID returned by submit_task.");
const profileId = s.nonEmptyString("Browser profile ID.");
const taskOutput = {
  ...s.looseObject("Task status, result and upstream metadata.", {
    id: taskId,
    status: s.string("Task state: waiting, running, done, failed or cancelled."),
    output: s.unknown("Task output, optionally matching response_model."),
    credits_used: s.nullable(s.integer("Credits used by the task.")),
    device: s.nullable(s.string("Browser device type.")),
    live_url: s.nullable(s.string("URL for live browser access.")),
    recording_url: s.nullable(s.string("URL for the task recording.")),
    downloads_url: s.nullable(s.string("URL for downloaded files.")),
    created_at: s.nullable(s.integer("Task creation Unix timestamp.")),
    events: s.nullable(s.array("New task events.", s.looseObject("Upstream event payload."))),
  }),
  required: ["id", "status"],
};
const profileOutput = s.looseRequiredObject("Browser profile.", { id: profileId });
const success = s.requiredObject("Operation result.", {
  success: s.boolean("Whether the operation succeeded."),
});
const taskOptions = {
  response_model: s.nullable(s.looseObject("JSON Schema for the desired task output.")),
  url: s.nullable(s.string("Starting URL visited by Smooth.", { format: "uri" })),
  metadata: s.nullable({
    ...s.record(
      "Agent variables; at most 16 keys and 2048 characters per string value.",
      s.anyOf("Variable value.", [
        s.string("Text value.", { maxLength: 2048 }),
        s.number("Numeric value."),
        s.boolean("Boolean value."),
      ]),
    ),
    maxProperties: 16,
  }),
  files: s.nullable(s.array("Previously uploaded file IDs.", s.string("File ID."))),
  agent: s.stringEnum("Agent model; defaults to smooth.", ["smooth", "smooth-lite"]),
  max_steps: s.integer("Maximum agent steps; defaults to 32.", { minimum: 2, maximum: 128 }),
  device: s.stringEnum("Browser device; defaults to desktop.", ["desktop", "mobile", "desktop-lg"]),
  allowed_urls: s.nullable(
    s.array(
      "Allowed URL glob patterns; omitted means unrestricted.",
      s.string("URL glob pattern, such as https://**.example.com/**."),
    ),
  ),
  enable_recording: s.boolean("Record the task; defaults to true."),
  profile_id: s.nullable(profileId),
  profile_read_only: s.boolean("Do not save browser changes to the profile; defaults to false."),
  stealth_mode: s.boolean("Enable stealth mode; defaults to false."),
  proxy_server: s.nullable(s.string("Remote proxy URL. Local self tunnels require a separate Smooth client.")),
  proxy_username: s.nullable(s.string("Proxy authentication username.")),
  proxy_password: s.nullable(s.string("Proxy authentication password.")),
  certificates: s.nullable(
    s.array(
      "Client certificates for secure websites.",
      s.object(
        "Client certificate.",
        {
          file: s.string("Base64-encoded p12 certificate."),
          password: s.nullable(s.string("Certificate password.")),
        },
        { optional: ["password"] },
      ),
    ),
  ),
  use_adblock: s.nullable(s.boolean("Enable ad blocking; defaults to true.")),
  additional_tools: s.nullable(
    s.record(
      "Built-in tool configurations, such as screenshot, hover or print_page.",
      s.nullable(s.looseObject("Tool configuration, or null for defaults.")),
    ),
  ),
  experimental_features: s.nullable(s.looseObject("Upstream experimental feature configuration.")),
  extensions: s.nullable(s.array("Previously uploaded browser extension IDs.", s.string("Extension ID."))),
  show_cursor: s.boolean("Show the mouse cursor; defaults to false."),
};
export const smoothActions: ActionDefinition[] = [
  defineProviderAction("smooth", {
    name: "submit_task",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Submit a natural-language browser task to Smooth. The task may modify or delete data on visited sites. Uses account credits; returns immediately for result polling.",
    asyncLifecycle: {
      startActionId: "smooth.submit_task",
      statusActionId: "smooth.get_task",
      cancelActionId: "smooth.cancel_task",
    },
    inputSchema: s.object(
      "One-shot browser task parameters.",
      {
        task: s.nonEmptyString(
          "Natural-language task to execute. Interactive sessions and custom tool callbacks are not supported by this action.",
        ),
        ...taskOptions,
      },
      { optional: Object.keys(taskOptions) },
    ),
    outputSchema: taskOutput,
  }),
  defineProviderAction("smooth", {
    name: "get_task",
    operationType: "read",
    requiredScopes: [],
    description: "Get task status and results, including optional download URLs and events after a timestamp.",
    asyncLifecycle: {
      startActionId: "smooth.submit_task",
      statusActionId: "smooth.get_task",
      cancelActionId: "smooth.cancel_task",
    },
    inputSchema: s.object(
      "Task lookup parameters.",
      {
        task_id: taskId,
        event_t: s.integer("Return events after this timestamp; defaults to zero."),
        downloads: s.boolean("Include the download URL; defaults to false."),
      },
      { optional: ["event_t", "downloads"] },
    ),
    outputSchema: taskOutput,
  }),
  defineProviderAction("smooth", {
    name: "list_tasks",
    operationType: "read",
    requiredScopes: [],
    description: "List tasks, optionally paging to tasks created before a timestamp.",
    inputSchema: s.object(
      "Task list parameters.",
      {
        t: s.integer("Return tasks created before this timestamp."),
        l: s.integer("Result limit; defaults to 32.", { minimum: 1, maximum: 128 }),
      },
      { optional: ["t", "l"] },
    ),
    outputSchema: s.requiredObject("Task list.", {
      tasks: s.array("Tasks in upstream order.", taskOutput),
    }),
  }),
  defineProviderAction("smooth", {
    name: "cancel_task",
    operationType: "destructive",
    requiredScopes: [],
    description: "Cancel a running Smooth task.",
    inputSchema: s.requiredObject("Task to cancel.", { task_id: taskId }),
    outputSchema: success,
  }),
  defineProviderAction("smooth", {
    name: "list_profiles",
    operationType: "read",
    requiredScopes: [],
    description: "List reusable browser profiles.",
    inputSchema: s.requiredObject("Profile list parameters.", {}),
    outputSchema: s.requiredObject("Profile list.", {
      profiles: s.array("Browser profiles.", profileOutput),
    }),
  }),
  defineProviderAction("smooth", {
    name: "create_profile",
    operationType: "write",
    requiredScopes: [],
    description: "Create a browser profile to persist cookies and authentication across tasks.",
    inputSchema: s.object("Profile creation parameters.", { id: s.nullable(profileId) }, { optional: ["id"] }),
    outputSchema: profileOutput,
  }),
  defineProviderAction("smooth", {
    name: "delete_profile",
    operationType: "destructive",
    requiredScopes: [],
    description: "Delete a browser profile and its persisted browser state.",
    inputSchema: s.requiredObject("Profile to delete.", { profile_id: profileId }),
    outputSchema: success,
  }),
];
