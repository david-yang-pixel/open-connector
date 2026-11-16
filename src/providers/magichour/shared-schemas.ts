import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const videoNameSchema: JsonSchema = s.string("Give your video a custom name for easy identification.");
export const imageNameSchema: JsonSchema = s.string("Give your image a custom name for easy identification.");
export const audioNameSchema: JsonSchema = s.string("Give your audio a custom name for easy identification.");
export const clipStartSchema: JsonSchema = s.number("Start time of your clip (seconds). Must be ≥ 0.", {
  minimum: 0,
});
export const clipEndSchema: JsonSchema = s.number(
  "End time of your clip (seconds). Must be greater than start_seconds.",
  { minimum: 0.1 },
);
export function assetPathSchema(usage: string, nonEmpty = false): JsonSchema {
  return s.string(
    `${usage} This value is either\n- a direct URL to the video file\n- \`file_path\` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n`,
    { minLength: nonEmpty ? 1 : undefined },
  );
}
export const faceMappingsSchema: JsonSchema = s.array(
  "This is the array of face mappings used for multiple face swap. The value is required if `face_swap_mode` is `individual-faces`.",
  s.object(
    "Face mappings item.",
    {
      original_face: s.string(
        "The face detected from the image in `target_file_path`. The file name is in the format of `<face_frame>-<face_index>.png`. This value is corresponds to the response in the [face detection API](https://docs.magichour.ai/api-reference/files/get-face-detection-details).\n\n* The face_frame is the frame number of the face in the target image. For images, the frame number is always 0.\n* The face_index is the index of the face in the target image, starting from 0 going left to right.",
      ),
      new_face: assetPathSchema("The face image that will be used to replace the face in the `original_face`."),
    },
    {
      required: ["original_face", "new_face"],
      additionalProperties: true,
    },
  ),
  { maxItems: 5 },
);
