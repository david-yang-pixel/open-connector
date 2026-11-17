import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const candidate = s.nullable(
  s.object(
    "Entity candidate details.",
    {
      id: s.string("Entity identifier."),
      name: s.string("Display name."),
      type: s.string("Entity category."),
      youtube_channel_id: s.nullableString("Channel identifier, when applicable."),
    },
    { required: [], additionalProperties: true },
  ),
);

export const arcmiraActions: readonly ActionDefinition[] = [
  defineProviderAction("arcmira", {
    name: "get_account",
    description: "Read the connected Arcmira account, plan, credit usage and granted scopes.",
    operationType: "read",
    inputSchema: s.object("Arcmira request parameters.", {}, { required: [], ...{} }),
    outputSchema: s.object(
      "Arcmira response fields.",
      {
        account: s.object(
          "Connected account details.",
          {
            id: s.string("Account identifier."),
            name: s.nullableString("Account name."),
            kind: s.string("Account category."),
            plan: s.string("Account plan name."),
          },
          { required: [], additionalProperties: true },
        ),
        tier: s.string("Account access tier."),
        scopes: s.array("Granted permission scopes.", s.string("Granted permission scopes.")),
        usage: s.looseObject("Current credit usage."),
      },
      { required: [], additionalProperties: true },
    ),
    requiredScopes: [],
  }),
  defineProviderAction("arcmira", {
    name: "resolve_entity",
    description:
      "Find a person, organization, product, topic or YouTube channel by name. Use the returned identifiers to scope transcript searches; ambiguous names return candidates.",
    operationType: "read",
    inputSchema: s.object(
      "Arcmira request parameters.",
      {
        q: s.string("Name, handle or YouTube channel URL.", { minLength: 2 }),
        type: s.stringEnum("Entity category to match.", ["person", "organization", "product", "topic", "channel"]),
        context: s.string("Extra context to distinguish names.", { minLength: 2, maxLength: 300 }),
        limit: s.integer("Maximum number of results.", { minimum: 1, maximum: 15 }),
      },
      { required: ["q"] },
    ),
    outputSchema: s.object(
      "Arcmira response fields.",
      {
        query: s.string("The submitted search query."),
        confidence: s.string("Entity resolution confidence."),
        best: candidate,
        suggested: candidate,
        candidates: s.array("Possible matching entities.", candidate),
        ask: s.nullable(s.looseObject("Clarification choices.")),
        note: s.string("Additional upstream guidance."),
      },
      { required: [], additionalProperties: true },
    ),
    requiredScopes: [],
  }),
  defineProviderAction("arcmira", {
    name: "search_transcripts",
    description:
      "Search indexed YouTube transcripts for timestamped passages. Filter by channels, speakers, topics, sponsors or organic mentions. Results cover Arcmira's indexed catalog.",
    operationType: "read",
    inputSchema: s.object(
      "Arcmira request parameters.",
      {
        q: s.string("One topic or phrase.", { minLength: 2 }),
        channel_ids: s.string("Comma-separated YouTube channel IDs, up to eight. Resolve names first."),
        entity_ids: s.string("Comma-separated entity IDs, up to eight, to scope appearances."),
        about: s.string("Comma-separated entity IDs discussed in the passages, up to eight."),
        by: s.string("Comma-separated person IDs speaking the query words, up to eight. Speaker coverage varies."),
        kind: s.string("Comma-separated passage classes: sponsored, organic, mention."),
        after: s.string("Inclusive publication date or ISO date-time."),
        before: s.string("Exclusive publication date or ISO date-time."),
        source: s.stringEnum("Transcript source to include.", [
          "arcmira_premium",
          "creator_captions",
          "third_party_quick",
        ]),
        limit: s.integer("Maximum number of results.", { minimum: 1, maximum: 20 }),
      },
      { required: ["q"] },
    ),
    outputSchema: s.object(
      "Arcmira response fields.",
      {
        query: s.string("The submitted search query."),
        limit: s.integer("Maximum number of results."),
        returned: s.integer("Number of returned passages."),
        chunks: s.array(
          "Timestamped matching passages.",
          s.object(
            "Timestamped matching passages.",
            {
              video_id: s.string("YouTube video identifier."),
              video_title: s.nullableString("Source title."),
              channel_name: s.nullableString("Source channel."),
              text: s.string("Matching passage."),
              start_seconds: s.nullableInteger("Passage timestamp in seconds."),
              watch_url: s.url("Source video at the passage timestamp."),
              speakers: s.array("Identified speakers.", s.string("Identified speaker name.")),
            },
            { required: [], additionalProperties: true },
          ),
        ),
        filters: s.looseObject("Applied search filters."),
        window: s.looseObject("Applied publication window."),
        as_of: s.nullableString("Result freshness."),
        note: s.string("Additional upstream guidance."),
      },
      { required: [], additionalProperties: true },
    ),
    requiredScopes: [],
  }),
  defineProviderAction("arcmira", {
    name: "get_transcript",
    description:
      "Retrieve captions or a Premium transcript for a YouTube video. Premium can start a transcript job and return pending; call again later to check it. Paid reads use credits from your plan, then your on-demand budget. Premium does not fall back to captions.",
    operationType: "write",
    inputSchema: s.object(
      "Arcmira request parameters.",
      {
        video_id: s.string("YouTube video ID.", { pattern: "^[A-Za-z0-9_-]{11}$" }),
        quality: s.stringEnum("Transcript quality lane.", ["captions", "premium"]),
        language: s.string("Up to five comma-separated caption language preferences."),
        timestamps: s.boolean("Return timestamped lines rather than paragraphs."),
        start: s.number("Window start in seconds; provide end too.", { minimum: 0 }),
        end: s.number("Window end in seconds, greater than start. Premium still uses whole-video credits.", {
          minimum: 0,
        }),
        retry: s.boolean("Retry a failed Premium job under the account budget."),
        refresh: s.boolean("Refetch captions for a video outside the indexed catalog."),
      },
      { required: ["video_id", "quality"] },
    ),
    outputSchema: s.object(
      "Arcmira response fields.",
      {
        state: s.stringEnum("Transcript readiness state.", ["ready", "pending", "failed"]),
        quality: s.stringEnum("Transcript quality lane.", ["captions", "premium"]),
        video: s.looseObject("Video metadata when ready."),
        video_id: s.string("YouTube video identifier."),
        lines: s.array("Timestamped transcript lines.", s.looseObject("Timestamped transcript line.")),
        paragraphs: s.array("Transcript paragraphs.", s.looseObject("Transcript paragraph.")),
        job: s.looseObject("Transcript job with polling guidance."),
        last_attempt: s.looseObject("Failure details for a failed job."),
        note: s.string("Additional upstream guidance."),
      },
      { required: ["state", "quality"], additionalProperties: true },
    ),
    requiredScopes: [],
  }),
];
