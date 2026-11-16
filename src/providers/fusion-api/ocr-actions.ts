import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const ocrActions: ActionDefinition[] = [
  defineProviderAction("fusion-api", {
    name: "oomol_ocr_submit",
    operationType: "write",
    description: "Recognize image text and suggest corrections for Chinese typos",
    inputSchema: s.object(
      "Image text recognition and correction options.",
      {
        imageURL: s.nonEmptyString("Publicly accessible image URL.", { format: "uri" }),
        correct: s.boolean({
          description: "Generate Chinese typo correction suggestions after text recognition.",
          default: true,
        }),
      },
      { required: ["imageURL"], additionalProperties: true },
    ),
    outputSchema: s.object(
      "Task submission result.",
      { sessionId: s.string("Task session ID.") },
      { required: ["sessionId"], additionalProperties: true },
    ),
    followUpActions: ["fusion-api.oomol_ocr_result"],
    asyncLifecycle: { startActionId: "fusion-api.oomol_ocr_submit", statusActionId: "fusion-api.oomol_ocr_result" },
  }),
  defineProviderAction("fusion-api", {
    name: "oomol_ocr_result",
    operationType: "read",
    description: "Get image text recognition and Chinese typo correction results",
    inputSchema: s.object(
      "Input parameters for this action.",
      { sessionID: s.string("Session ID") },
      { required: ["sessionID"], additionalProperties: true },
    ),
    outputSchema: s.union(
      [
        s.looseRequiredObject("The task is completed.", {
          state: s.literal("completed", { description: "Task state." }),
          data: s.unknownObject("Task result data."),
        }),
        s.looseRequiredObject("The task is processing.", {
          state: s.literal("processing", { description: "Task state." }),
          progress: s.number("Task progress."),
        }),
        s.looseRequiredObject("The task failed or was not found.", {
          state: s.stringEnum(["failed", "not_found"], { description: "Task state." }),
          error: s.string("Error message."),
        }),
      ],
      { description: "Possible results returned by this action." },
    ),
  }),
];
