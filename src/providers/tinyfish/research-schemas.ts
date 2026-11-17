import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const researchStatus: JsonSchema = s.stringEnum("Research run state.", [
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "TIMED_OUT",
  "QUEUED",
]);
export const researchId: JsonSchema = s.string("Research run identifier.", { minLength: 1 });
export const researchInput: Record<string, JsonSchema> = {
  ...s.object(
    "Asynchronous research parameters.",
    {
      query: s.string("Research question.", { minLength: 1, maxLength: 2000 }),
      mode: s.stringEnum("Research depth; defaults to deep.", ["deep", "max"]),
      stream: s.boolean(
        "Emit report text as synthesis events upstream; results are retrieved through get_research_run.",
      ),
      output_language: s.string("BCP 47 report language."),
      weak_sources_enabled: s.boolean("Allow relevant social and community sources."),
      domain_type: s.stringEnum("Source pool.", ["web", "news", "research_paper"]),
      after_date: s.string("Include results on or after this date.", { format: "date" }),
      before_date: s.string("Include results on or before this date.", { format: "date" }),
      recency_minutes: s.integer("Freshness window; cannot combine with date filters.", {
        minimum: 1,
        maximum: 5256000,
      }),
      domain_filter: s.object(
        "Domain preferences.",
        {
          mode: s.stringEnum("Prioritize domains or restrict results exclusively to them.", ["include", "exclusive"]),
          domains: s.array("Domains to prefer or require.", s.string("Domain."), { maxItems: 150 }),
          block: s.array("Domains to exclude.", s.string("Domain."), { maxItems: 150 }),
        },
        { required: ["mode"] },
      ),
      prior_run_id: s.string("Completed report and evidence to reuse; mutually exclusive with session_id."),
      session_id: s.string("Research session to continue; mutually exclusive with prior_run_id.", {
        format: "uuid",
      }),
    },
    { required: ["query"] },
  ),
  not: {
    anyOf: [
      { required: ["prior_run_id", "session_id"] },
      { required: ["recency_minutes", "after_date"] },
      { required: ["recency_minutes", "before_date"] },
    ],
  },
};
export const researchListInput: JsonSchema = s.object(
  "Research filters and cursor.",
  {
    status: researchStatus,
    query: s.string("Case-insensitive partial query filter.", { maxLength: 500 }),
    created_after: s.string("Created after timestamp.", { format: "date-time" }),
    created_before: s.string("Created before timestamp.", { format: "date-time" }),
    sort_direction: s.stringEnum("Creation time sort order; defaults to desc.", ["asc", "desc"]),
    cursor: s.string("Pagination cursor; replay with the same sort_direction."),
    limit: s.integer("Maximum returned records.", { minimum: 1, maximum: 100 }),
  },
  { required: [] },
);
export const researchOutput: JsonSchema = s.looseObject("Research status, reports and evidence.", {
  research_run_id: researchId,
  status: researchStatus,
  query: s.string("Research question."),
  quick_result: s.nullable(s.looseObject("Quick answer, citations and optional progress.")),
  quick_result_summary: s.nullable(s.string("Quick answer summary.")),
  deep_result: s.nullable(
    s.looseObject("Final report.", {
      result: s.string("Report text."),
      citations: s.array("Cited sources.", s.string("Source URL.")),
      freshness_report: s.looseObject("Source freshness information."),
      termination_reason: s.string("Reason research stopped; synthesis_failed indicates interim findings."),
    }),
  ),
  run_ids: s.array("Spawned agent run identifiers.", s.string("Agent run identifier.")),
  created_at: s.nullable(s.string("Creation timestamp.")),
  completed_at: s.nullable(s.string("Completion timestamp.")),
  error: s.nullable(s.looseObject("Saved terminal outcome, not an HTTP request error.")),
  research_plan: s.nullable(s.looseObject("Subquestions and planned searches.")),
  evidence: s.nullable(s.array("Sources and supported claims.", s.looseObject("Evidence source."))),
  iterations: s.nullable(s.integer("Completed research iterations.", { minimum: 0 })),
});
