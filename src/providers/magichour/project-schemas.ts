import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { clipEndSchema, clipStartSchema } from "./shared-schemas.ts";
export type MediaKind = "image" | "video" | "audio";
function projectIdSchema(kind: MediaKind) {
  return s.string(
    `Unique ID of the ${kind}. Use it with the [Get ${kind} Project API](https://docs.magichour.ai/api-reference/${kind}-projects/get-${kind}-details) to fetch status and downloads.`,
  );
}
function creditsSchema(kind: MediaKind) {
  return s.integer(
    kind === "video"
      ? "The amount of credits deducted from your account to generate the video. If the status is not 'complete', this value is an estimate and may be adjusted upon completion based on the actual FPS of the output video. \n\nIf video generation fails, credits will be refunded, and this field will be updated to include the refund."
      : `The amount of credits deducted from your account to generate the ${kind}. We charge credits right when the request is made. \n\nIf an error occurred while generating the ${kind === "image" ? "image(s)" : "audio"}, credits will be refunded and this field will be updated to include the refund.`,
  );
}
function statusSchema(kind: MediaKind) {
  return s.stringEnum(
    `The status of the ${kind}.\n\n- \`draft\` - the project was created but has not been submitted for rendering\n- \`queued\` - the job is waiting for an available server\n- \`rendering\` - the job is being processed; the \`${kind}.started\` webhook event fires when rendering begins\n- \`complete\` - the job finished successfully; fires \`${kind}.completed\`\n- \`error\` - the job failed during processing; fires \`${kind}.errored\`\n- \`canceled\` - the job was manually canceled (for example from the Magic Hour web app)\n\n**Note:** \`rendering\`, \`complete\`, and \`error\` have matching webhook events; \`canceled\` does not - a canceled job emits no webhook event, so poll this endpoint to detect cancellation.`,
    ["draft", "queued", "rendering", "complete", "error", "canceled"],
  );
}
const downloadsSchema = s.array(
  "Downloads.",
  s.looseRequiredObject("The download URL and expiration time of the project.", {
    url: s.url("Url."),
    expires_at: s.dateTime("Expires at."),
  }),
);
const renderErrorSchema = s.nullable(
  s.looseRequiredObject("The error reported while rendering the project.", {
    message: s.string("Details on the reason why a failure happened."),
    code: s.string("An error code to indicate why a failure happened."),
  }),
);
const projectTypes: Record<MediaKind, string> = {
  image:
    "The type of the image project. Possible values are FACE_EDITOR, AI_IMAGE_EDITOR, GENERATIVE_FILL, AI_SELFIE, AI_HEADSHOT, AI_INFLUENCER, AI_IMAGE, AI_MEME, CLOTHES_CHANGER, BACKGROUND_REMOVER, FACE_SWAP, IMAGE_UPSCALER, IMAGE_ENHANCER, AI_GIF, QR_CODE, PHOTO_EDITOR, PHOTO_COLORIZER, IMAGE_COLOR_GRADER, HEAD_SWAP, BODY_SWAP, STORYBOARD, IMAGE_EXPANDER",
  video:
    "The type of the video project. Possible values are ANIMATION, AUTO_SUBTITLE, VIDEO_TO_VIDEO, FACE_SWAP, TEXT_TO_VIDEO, IMAGE_TO_VIDEO, LIP_SYNC, TALKING_PHOTO, AVATAR, VIDEO_UPSCALER, VIDEO_EDITOR, CHARACTER_REPLACE, VIDEO_COLORIZER, VIDEO_WATERMARK_REMOVER, VIDEO_COLOR_GRADER, VIDEO_TRANSLATOR, MUSIC_VIDEO, EXTEND, AUDIO_TO_VIDEO, VIDEO_EXPANDER, UGC_AD",
  audio:
    "The type of the audio project. Possible values are AUDIO_TRANSLATOR, VOICE_GENERATOR, VOICE_CHANGER, VOICE_CLONER, VIDEO_TO_AUDIO, MUSIC_GENERATOR, SOUND_EFFECT_GENERATOR",
};
export function projectSubmissionSchema(kind: MediaKind): JsonSchema {
  return s.looseRequiredObject("Success", {
    id: projectIdSchema(kind),
    credits_charged: creditsSchema(kind),
  });
}
export function projectInputSchema(kind: MediaKind, description: string): JsonSchema {
  return s.looseRequiredObject(description, {
    id: s.string(
      `Unique ID of the ${kind} project. This value is returned by all of the POST APIs that create ${kind === "video" ? "a" : "an"} ${kind}.`,
    ),
  });
}
function projectResultSchema(kind: MediaKind, extra: Record<string, JsonSchema>) {
  return s.looseRequiredObject("Success", {
    id: projectIdSchema(kind),
    name: s.nullable(s.string(`The name of the ${kind}.`)),
    status: statusSchema(kind),
    type: s.string(projectTypes[kind]),
    created_at: s.dateTime("Created at."),
    enabled: s.boolean("Whether this resource is active. If false, it is deleted."),
    credits_charged: creditsSchema(kind),
    downloads: downloadsSchema,
    error: renderErrorSchema,
    ...extra,
  });
}
export const imageProjectSchema: JsonSchema = projectResultSchema("image", {
  image_count: s.integer("Number of images generated"),
});
export const audioProjectSchema: JsonSchema = projectResultSchema("audio", {});
export const videoProjectSchema: JsonSchema = projectResultSchema("video", {
  width: s.integer("The width of the final output video. A value of -1 indicates the width can be ignored."),
  height: s.integer("The height of the final output video. A value of -1 indicates the height can be ignored."),
  start_seconds: clipStartSchema,
  end_seconds: clipEndSchema,
  fps: s.number(
    "Frame rate of the video. If the status is not 'complete', the frame rate is an estimate and will be adjusted when the video completes.",
  ),
});
export const deletedProjectSchema: JsonSchema = s.looseRequiredObject("Deletion result.", {
  deleted: s.boolean("Whether the project was deleted."),
});
