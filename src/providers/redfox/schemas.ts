import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
function responseWithData(data: JsonSchema): JsonSchema {
  return s.looseRequiredObject("The normalized RedFoxHub response.", {
    code: s.integer("Upstream business status code; 2000 or an endpoint-specific 200 means success."),
    msg: s.string("Upstream response message."),
    data,
  });
}

export const responseSchema: JsonSchema = responseWithData(
  s.unknown("The upstream payload, including pagination and platform-specific fields."),
);

export const taskInputSchema: JsonSchema = s.object(
  "Request parameters.",
  {
    taskId: s.nonEmptyString("Task ID returned by the corresponding submit action."),
  },
  { required: ["taskId"] },
);

export const taskSubmissionSchema: JsonSchema = responseWithData(
  s.looseRequiredObject("Task metadata and results. Additional upstream fields are preserved.", {
    taskId: s.string("Task ID returned by the submit action."),
  }),
);

function taskResult(properties: Record<string, JsonSchema>): JsonSchema {
  return responseWithData(
    s.object(
      "Task metadata and results. Additional upstream fields are preserved.",
      {
        taskId: s.string("Task ID returned by the submit action."),
        status: s.string("Upstream task status; see the action polling lifecycle."),
        failReason: s.nullableString("Reason the task failed."),
        ...properties,
      },
      { required: ["status"], additionalProperties: true },
    ),
  );
}

export const searchResultSchema: JsonSchema = taskResult({
  result: s.unknown("AI search results, including content and source references."),
});
export const transcriptionResultSchema: JsonSchema = taskResult({
  text: s.string("Extracted transcript text."),
  stampSents: s.array("Transcript segments with timestamps.", s.unknown("Transcript segment.")),
});
export const commentsResultSchema: JsonSchema = taskResult({
  commentList: s.array("Collected comments.", s.unknown("Comment data.")),
});
export const videoResultSchema: JsonSchema = taskResult({
  videoUrl: s.nullableString("Generated video URL."),
  lastFrameUrl: s.nullableString("Generated last-frame image URL."),
});
export const imageResultSchema: JsonSchema = taskResult({
  imageUrls: s.nullable(s.array("Generated image URLs.", s.string("Generated image URL."))),
});
