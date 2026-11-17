import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const monitorId: JsonSchema = s.string("Monitor identifier.", { minLength: 1, maxLength: 36 });
const scheduleFields = {
  name: s.nullable(s.string("Monitor name.", { minLength: 1, maxLength: 100 })),
  schedule_cron: s.string("Five-field cron in UTC; prefix CRON_TZ=<IANA zone> to choose a timezone.", {
    maxLength: 100,
  }),
  webhook_url: s.nullable(s.string("URL receiving scheduled run results.", { format: "uri" })),
  purpose: s.nullable(s.string("Describe the change that matters.", { minLength: 1, maxLength: 2000 })),
};
export const monitorCreateInput: JsonSchema = s.oneOf(
  [
    s.object(
      "Topic Monitor.",
      {
        ...scheduleFields,
        type: s.literal("search", {
          description: "Topic monitor type.",
        }),
        config: s.object(
          "Topic search configuration.",
          {
            query: s.string("Topic to monitor.", { minLength: 1, maxLength: 2000 }),
            recency_minutes: s.integer("Search freshness window in minutes.", {
              minimum: 1,
              maximum: 5256000,
            }),
            result_limit: s.integer("Results per run; defaults to 10.", {
              minimum: 1,
              maximum: 10,
            }),
          },
          { required: ["query"] },
        ),
      },
      { required: ["schedule_cron", "type", "config"] },
    ),
    s.object(
      "Page Monitor.",
      {
        ...scheduleFields,
        type: s.literal("fetch", {
          description: "Page monitor type.",
        }),
        config: s.object(
          "Page fetch configuration.",
          {
            url: s.string("Public webpage URL.", { format: "uri" }),
            format: s.stringEnum("Fetch output format; defaults to json.", ["markdown", "html", "json"]),
            links: s.boolean("Include page links."),
            image_links: s.boolean("Include image URLs."),
            ttl: s.integer("Deprecated: Page Monitors always bypass cache.", { minimum: 0 }),
          },
          { required: ["url"] },
        ),
      },
      { required: ["schedule_cron", "type", "config"] },
    ),
  ],
  {
    description: "Create a Topic or Page Monitor; personal API key required.",
  },
);
export const monitorUpdateInput: JsonSchema = s.oneOf(
  [
    s.requiredObject("Change status.", {
      id: monitorId,
      status: s.stringEnum("Monitor status.", ["active", "paused"]),
    }),
    s.object(
      "Update scheduling and metadata.",
      { id: monitorId, ...scheduleFields },
      { required: ["id", "schedule_cron"] },
    ),
  ],
  {
    description: "Pause/resume or replace schedule and optional metadata.",
  },
);
export const monitorOutput: JsonSchema = s.looseObject("Page or Topic Monitor.", {
  id: monitorId,
  name: s.nullable(s.string("Monitor name.")),
  schedule_cron: s.string("Schedule expression."),
  status: s.stringEnum("Monitor state.", ["creating", "active", "paused", "failed", "cancelled"]),
  last_error: s.nullable(s.string("Most recent error.")),
  webhook_url: s.nullable(s.string("Results webhook URL.")),
  created_at: s.string("Creation timestamp."),
  updated_at: s.string("Update timestamp."),
  type: s.stringEnum("Monitor type.", ["fetch", "search"]),
  config: s.looseObject("Page or topic configuration."),
});
