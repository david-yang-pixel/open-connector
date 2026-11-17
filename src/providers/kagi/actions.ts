import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const kagiActions: ActionDefinition[] = [
  defineProviderAction("kagi", {
    name: "summarize",
    description:
      "Summarize text or a document URL with Kagi, optionally translating the summary or extracting key takeaways.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requireExactlyOneProperty(
      s.object(
        "Document and summary options. The serialized request must not exceed 1 MB.",
        {
          url: s.url(
            "URL of a document, web page, audio file, or video for Kagi to fetch. Mutually exclusive with text.",
          ),
          text: s.nonEmptyString("Text to summarize. Mutually exclusive with url."),
          engine: s.stringEnum(
            "Summarization engine; defaults to cecil. Daphne is a deprecated alias of agnes. Muriel uses enterprise pricing.",
            ["cecil", "agnes", "daphne", "muriel"],
          ),
          summary_type: s.stringEnum("Summary format; defaults to summary for prose, or takeaway for bullet points.", [
            "summary",
            "takeaway",
          ]),
          target_language: s.string(
            "Output language code, normalized to uppercase. Supported: BG, CS, DA, DE, EL, EN, ES, ET, FI, FR, HU, ID, IT, JA, KO, LT, LV, NB, NL, PL, PT, RO, RU, SK, SL, SV, TR, UK, ZH, ZH-HANT.",
          ),
          cache: s.boolean(
            "Allow Kagi to cache requests and responses; defaults to true. Set false for sensitive documents.",
          ),
        },
        {
          optional: ["url", "text", "engine", "summary_type", "target_language", "cache"],
        },
      ),
      ["url", "text"],
    ),
    outputSchema: s.object(
      "Kagi summary response with upstream metadata and extension fields.",
      {
        meta: s.looseObject("Request metadata, including request ID, processing time, and API balance when available."),
        data: s.object(
          "Generated summary and token usage.",
          {
            output: s.string("Generated summary text."),
            tokens: s.integer("Number of tokens processed."),
          },
          {
            required: ["output", "tokens"],
            additionalProperties: true,
          },
        ),
      },
      {
        required: ["data"],
        additionalProperties: true,
      },
    ),
  }),
];
