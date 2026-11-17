import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { readSchemaProperties } from "../../core/json-schema.ts";
import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { dataTools } from "./tools.ts";
const empty = s.requiredObject("No parameters.", {});
const accountOutput = s.looseObject("Account response with upstream fields preserved.", {});
const jobOutput = s.looseObject("Asynchronous job state and retained result.", {
  job_id: s.string("Job ID used to poll for the result."),
  state: s.stringEnum("Job state; queued includes retry backoff.", [
    "queued",
    "running",
    "succeeded",
    "failed",
    "expired",
  ]),
  status_code: s.nullableInteger("Final scraper HTTP status, or null before completion."),
  response: s.nullable(s.looseObject("Retained scraper result or error; screenshots use a file URL.", {})),
  created_at: s.string("Submission time."),
  completed_at: s.nullableString("Completion time, or null before completion."),
  expires_at: s.nullableString("Expiry time, 24 hours after completion."),
});
const timeout = s.number("Upstream execution budget in seconds, excluding queue time.", {
  exclusiveMinimum: 0,
  maximum: 90,
});
interface LitescrapeEndpoint {
  path: string;
  method: "GET" | "POST" | "PATCH";
  action: ActionDefinition;
}
function endpoint(
  name: string,
  description: string,
  path: string,
  method: "GET" | "POST" | "PATCH",
  input: JsonSchema,
  output: JsonSchema,
  operationType: ActionDefinition["operationType"] = "read",
): LitescrapeEndpoint {
  return {
    path,
    method,
    action: defineProviderAction("litescrape", {
      name,
      description,
      operationType,
      requiredScopes: [],
      inputSchema: input,
      outputSchema: output,
      asyncLifecycle: name.startsWith("submit_")
        ? { startActionId: `litescrape.${name}`, statusActionId: "litescrape.get_job" }
        : undefined,
    }),
  };
}
const screenshot = dataTools.find((tool) => tool.name === "web_screenshot")!;
screenshot.output = s.looseObject("Screenshot metadata and hosted PNG file.", {
  url: s.string("Captured page URL."),
  title: s.nullableString("Page title."),
  description: s.nullableString("Page description."),
  full_page: s.boolean("Whether the full page was captured."),
  screenshot: s.requiredObject("Hosted screenshot file.", {
    url: s.string("Download URL."),
    mimeType: s.literal("image/png", {
      description: "File media type.",
    }),
  }),
});
const litescrapeEndpoints: LitescrapeEndpoint[] = [
  ...dataTools.map((tool) =>
    endpoint(
      tool.name,
      tool.description,
      tool.path,
      "POST",
      s.object(
        String(tool.input.description),
        { ...(readSchemaProperties(tool.input) as Record<string, JsonSchema>), timeout },
        { required: (tool.input.required as string[]) ?? [] },
      ),
      tool.output,
      tool.name === "web_fetch" || tool.name === "web_screenshot" ? "destructive" : "read",
    ),
  ),
  ...dataTools.map((tool) =>
    endpoint(
      `submit_${tool.name}`,
      `Submit asynchronously: ${tool.description} Reuse idempotencyKey for retries. Results expire after 24 hours; zero data retention accounts cannot submit or poll retained jobs.`,
      `${tool.path}/async`,
      "POST",
      s.object(
        `${tool.name} asynchronous submission.`,
        {
          body: tool.asyncInput,
          idempotencyKey: s.string("Optional retry identity; generated when omitted.", {
            minLength: 16,
            maxLength: 128,
          }),
          batchId: s.string("Optional compatibility batch ID; does not change billing.", {
            minLength: 16,
            maxLength: 128,
          }),
          batchSize: s.integer("Optional compatibility batch size; does not change billing.", {
            minimum: 0,
            maximum: 1000000000,
          }),
        },
        { optional: ["idempotencyKey", "batchId", "batchSize"] },
      ),
      jobOutput,
      tool.name === "web_fetch" || tool.name === "web_screenshot" ? "destructive" : "write",
    ),
  ),
  endpoint(
    "get_job",
    "Read asynchronous job state and its retained response. Failed jobs return their original status_code and error response.",
    "/api/batch/jobs/{job_id}",
    "GET",
    s.requiredObject("Job lookup.", { job_id: s.string("Job ID.", { pattern: "^[0-9a-f]{32}$" }) }),
    jobOutput,
    "read",
  ),
  endpoint(
    "get_key_status",
    "Read key status, balance, concurrency and retention settings without a paid search.",
    "/api/keys/status",
    "GET",
    empty,
    accountOutput,
  ),
  endpoint(
    "set_zero_data_retention",
    "Enable or disable zero data retention. Enabling it deletes completed batch results and disables new asynchronous jobs and screenshots. Active batch jobs must finish first.",
    "/api/keys/zdr",
    "PATCH",
    s.requiredObject("Retention settings.", {
      zdr_enabled: s.boolean("Whether zero data retention is enabled."),
    }),
    accountOutput,
    "destructive",
  ),
  endpoint(
    "rotate_key",
    "Replace the API key and immediately invalidate the current key. Save the returned key and reconnect before making another request.",
    "/api/keys/rotate",
    "POST",
    empty,
    accountOutput,
    "destructive",
  ),
  endpoint(
    "get_usage",
    "Read account usage for a time range and timezone.",
    "/api/usage",
    "GET",
    s.object(
      "Usage filters.",
      {
        range: s.stringEnum("Reporting window.", ["24h", "7d", "30d", "90d"]),
        tz: s.string("IANA timezone; defaults to UTC upstream."),
      },
      { optional: ["range", "tz"] },
    ),
    accountOutput,
  ),
  endpoint(
    "create_checkout",
    "Create a credit-purchase checkout URL. Payment completes only after opening and completing checkout.",
    "/api/billing/checkout",
    "POST",
    s.object(
      "Checkout options.",
      { return_path: s.stringEnum("Website return path.", ["/", "/try/google-search"]) },
      { optional: ["return_path"] },
    ),
    accountOutput,
    "write",
  ),
  endpoint(
    "get_auto_top_up",
    "Read automatic top-up settings.",
    "/api/billing/auto-top-up",
    "GET",
    empty,
    accountOutput,
  ),
  endpoint(
    "disable_auto_top_up",
    "Disable automatic credit charges.",
    "/api/billing/auto-top-up",
    "PATCH",
    empty,
    accountOutput,
    "destructive",
  ),
  endpoint(
    "setup_auto_top_up",
    "Create a checkout URL to authorize automatic top-ups. Complete card authorization at the returned URL.",
    "/api/billing/auto-top-up/setup",
    "POST",
    s.requiredObject("Automatic top-up authorization.", {
      threshold_units: s.integer("Remaining calls threshold; must be below calls purchased by one top-up.", {
        minimum: 1,
      }),
      top_up_cents: s.integer("Top-up amount in US cents.", { minimum: 1000, maximum: 100000 }),
      monthly_limit_cents: s.integer("UTC calendar-month limit in US cents; must cover one top-up.", {
        maximum: 1000000,
      }),
      consent: s.literal(true, {
        description: "Explicit consent to configure automatic top-ups.",
      }),
    }),
    accountOutput,
    "write",
  ),
  endpoint(
    "get_email_bonus",
    "Read email bonus eligibility and claim status; this does not claim the bonus.",
    "/api/keys/email-bonus",
    "GET",
    empty,
    accountOutput,
  ),
  endpoint(
    "find_tools",
    "Find relevant data tools or retrieve their input schemas by name.",
    "/api/tools",
    "POST",
    s.object(
      "Tool discovery query.",
      {
        q: s.string("Use case; required unless names is supplied.", {
          minLength: 3,
          maxLength: 500,
        }),
        limit: s.integer("Maximum number of tools.", { minimum: 1, maximum: 25 }),
        names: s.array("Tool names to retrieve without ranking.", s.string("Tool name."), {
          minItems: 1,
          maxItems: 25,
        }),
      },
      { optional: ["q", "limit", "names"], anyOf: [{ required: ["q"] }, { required: ["names"] }] },
    ),
    s.looseObject("Matching tools.", {
      tools: s.array(
        "Tools ordered by relevance or requested name.",
        s.looseObject("Tool metadata and input schema.", {}),
      ),
    }),
  ),
  endpoint(
    "submit_feedback",
    "Submit an explicitly requested rating about a previous result. Each feedback token expires after seven days and accepts one rating.",
    "/api/feedback/{token}",
    "POST",
    s.object(
      "Result feedback.",
      {
        token: s.string("Token from the feedback URL.", { minLength: 1, maxLength: 2048 }),
        rating: s.integer("Result rating from 1 to 5.", { minimum: 1, maximum: 5 }),
        comment: s.string("Evaluation without secrets or personal data.", {
          minLength: 1,
          maxLength: 4000,
        }),
        agent: s.nullableString("Optional agent or model name.", { minLength: 1, maxLength: 120 }),
      },
      { optional: ["agent"] },
    ),
    accountOutput,
    "write",
  ),
];
export const litescrapeActions: ActionDefinition[] = litescrapeEndpoints.map((endpoint) => endpoint.action);
export const litescrapeEndpointByName: Map<string, (typeof litescrapeEndpoints)[number]> = new Map(
  litescrapeEndpoints.map((endpoint) => [endpoint.action.name, endpoint]),
);
export const litescrapeToolByName: Map<string, (typeof dataTools)[number]> = new Map(
  dataTools.map((tool) => [tool.name, tool]),
);
