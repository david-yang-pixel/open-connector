import type { ActionDefinition, JsonSchema } from "../../core/types.ts";
import type { MediaKind } from "./project-schemas.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
import { audioInputSchemas } from "./audio-schemas.ts";
import { imageInputSchemas } from "./image-schemas.ts";
import {
  projectSubmissionSchema,
  projectInputSchema,
  videoProjectSchema,
  imageProjectSchema,
  audioProjectSchema,
  deletedProjectSchema,
} from "./project-schemas.ts";
import {
  accountInputSchema,
  accountOutputSchema,
  savedItemsInputSchema,
  savedItemsOutputSchema,
  faceDetectionInputSchema,
  faceDetectionOutputSchema,
  faceDetectionResultInputSchema,
  faceDetectionResultOutputSchema,
  uploadAssetInputSchema,
  uploadAssetOutputSchema,
} from "./utility-schemas.ts";
import { videoInputSchemas } from "./video-schemas.ts";
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  create_face_detection: {
    startActionId: "magichour.create_face_detection",
    statusActionId: "magichour.get_face_detection",
  },
  create_ai_talking_photo: {
    startActionId: "magichour.create_ai_talking_photo",
    statusActionId: "magichour.get_video_projects",
  },
  create_ai_ugc_ad: { startActionId: "magichour.create_ai_ugc_ad", statusActionId: "magichour.get_video_projects" },
  create_ai_video_editor: {
    startActionId: "magichour.create_ai_video_editor",
    statusActionId: "magichour.get_video_projects",
  },
  create_ai_video_translator: {
    startActionId: "magichour.create_ai_video_translator",
    statusActionId: "magichour.get_video_projects",
  },
  create_ai_video_upscaler: {
    startActionId: "magichour.create_ai_video_upscaler",
    statusActionId: "magichour.get_video_projects",
  },
  create_animation: { startActionId: "magichour.create_animation", statusActionId: "magichour.get_video_projects" },
  create_audio_to_video: {
    startActionId: "magichour.create_audio_to_video",
    statusActionId: "magichour.get_video_projects",
  },
  create_auto_subtitle_generator: {
    startActionId: "magichour.create_auto_subtitle_generator",
    statusActionId: "magichour.get_video_projects",
  },
  create_character_replace: {
    startActionId: "magichour.create_character_replace",
    statusActionId: "magichour.get_video_projects",
  },
  create_face_swap: { startActionId: "magichour.create_face_swap", statusActionId: "magichour.get_video_projects" },
  create_image_to_video: {
    startActionId: "magichour.create_image_to_video",
    statusActionId: "magichour.get_video_projects",
  },
  create_lip_sync: { startActionId: "magichour.create_lip_sync", statusActionId: "magichour.get_video_projects" },
  create_text_to_video: {
    startActionId: "magichour.create_text_to_video",
    statusActionId: "magichour.get_video_projects",
  },
  create_video_to_video: {
    startActionId: "magichour.create_video_to_video",
    statusActionId: "magichour.get_video_projects",
  },
  create_ai_clothes_changer: {
    startActionId: "magichour.create_ai_clothes_changer",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_face_editor: {
    startActionId: "magichour.create_ai_face_editor",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_gif_generator: {
    startActionId: "magichour.create_ai_gif_generator",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_image_editor: {
    startActionId: "magichour.create_ai_image_editor",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_headshot_generator: {
    startActionId: "magichour.create_ai_headshot_generator",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_image_generator: {
    startActionId: "magichour.create_ai_image_generator",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_image_upscaler: {
    startActionId: "magichour.create_ai_image_upscaler",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_meme_generator: {
    startActionId: "magichour.create_ai_meme_generator",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_qr_code_generator: {
    startActionId: "magichour.create_ai_qr_code_generator",
    statusActionId: "magichour.get_image_projects",
  },
  create_body_swap: { startActionId: "magichour.create_body_swap", statusActionId: "magichour.get_image_projects" },
  create_face_swap_photo: {
    startActionId: "magichour.create_face_swap_photo",
    statusActionId: "magichour.get_image_projects",
  },
  create_head_swap: { startActionId: "magichour.create_head_swap", statusActionId: "magichour.get_image_projects" },
  create_image_background_remover: {
    startActionId: "magichour.create_image_background_remover",
    statusActionId: "magichour.get_image_projects",
  },
  create_photo_colorizer: {
    startActionId: "magichour.create_photo_colorizer",
    statusActionId: "magichour.get_image_projects",
  },
  create_ai_music_generator: {
    startActionId: "magichour.create_ai_music_generator",
    statusActionId: "magichour.get_audio_projects",
  },
  create_ai_voice_cloner: {
    startActionId: "magichour.create_ai_voice_cloner",
    statusActionId: "magichour.get_audio_projects",
  },
  create_ai_voice_generator: {
    startActionId: "magichour.create_ai_voice_generator",
    statusActionId: "magichour.get_audio_projects",
  },
};
export interface MagicHourRoute {
  path: string;
  method: string;
  parameters: Array<{
    name: string;
    in: string;
  }>;
  body: boolean;
}
interface MagicHourDefinition {
  name: string;
  description: string;
  operationType: ActionDefinition["operationType"];
  route: MagicHourRoute;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
function mediaAction(name: string, title: string, kind: MediaKind, inputSchema: JsonSchema): MagicHourDefinition {
  return {
    name,
    description: `${title} Submit the asynchronous task and use the linked result action to retrieve completion and downloads.`,
    operationType: "write",
    route: {
      path: `/v1/${name.slice("create_".length).replaceAll("_", "-")}`,
      method: "POST",
      parameters: [],
      body: true,
    },
    inputSchema,
    outputSchema: projectSubmissionSchema(kind),
  };
}
const definitions: MagicHourDefinition[] = [
  {
    name: "get_account",
    description: "Get account details.",
    operationType: "read",
    route: { path: "/v1/account", method: "GET", parameters: [], body: false },
    inputSchema: accountInputSchema,
    outputSchema: accountOutputSchema,
  },
  {
    name: "list_saved_items",
    description: "List saved items.",
    operationType: "read",
    route: {
      path: "/v1/saved-items",
      method: "GET",
      parameters: [
        { name: "type", in: "query" },
        { name: "limit", in: "query" },
        { name: "cursor", in: "query" },
      ],
      body: false,
    },
    inputSchema: savedItemsInputSchema,
    outputSchema: savedItemsOutputSchema,
  },
  {
    name: "get_face_detection",
    description: "Get face detection details.",
    operationType: "read",
    route: {
      path: "/v1/face-detection/{id}",
      method: "GET",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: faceDetectionResultInputSchema,
    outputSchema: faceDetectionResultOutputSchema,
  },
  {
    name: "create_face_detection",
    description:
      "Face Detection. Submit the asynchronous task and use the linked result action to retrieve completion and downloads.",
    operationType: "write",
    route: { path: "/v1/face-detection", method: "POST", parameters: [], body: true },
    inputSchema: faceDetectionInputSchema,
    outputSchema: faceDetectionOutputSchema,
  },
  {
    name: "get_video_projects",
    description: "Get video details.",
    operationType: "read",
    route: {
      path: "/v1/video-projects/{id}",
      method: "GET",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("video", "Get video details parameters."),
    outputSchema: videoProjectSchema,
  },
  {
    name: "delete_video_projects",
    description: "Delete video.",
    operationType: "destructive",
    route: {
      path: "/v1/video-projects/{id}",
      method: "DELETE",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("video", "Delete video parameters."),
    outputSchema: deletedProjectSchema,
  },
  mediaAction("create_ai_talking_photo", "AI Talking Photo.", "video", videoInputSchemas.create_ai_talking_photo!),
  mediaAction("create_ai_ugc_ad", "AI UGC Ad Generator.", "video", videoInputSchemas.create_ai_ugc_ad!),
  mediaAction("create_ai_video_editor", "AI Video Editor.", "video", videoInputSchemas.create_ai_video_editor!),
  mediaAction(
    "create_ai_video_translator",
    "AI Video Translator.",
    "video",
    videoInputSchemas.create_ai_video_translator!,
  ),
  mediaAction("create_ai_video_upscaler", "AI Video Upscaler.", "video", videoInputSchemas.create_ai_video_upscaler!),
  mediaAction("create_animation", "Animation.", "video", videoInputSchemas.create_animation!),
  mediaAction("create_audio_to_video", "Audio-to-Video.", "video", videoInputSchemas.create_audio_to_video!),
  mediaAction(
    "create_auto_subtitle_generator",
    "Auto Subtitle Generator.",
    "video",
    videoInputSchemas.create_auto_subtitle_generator!,
  ),
  mediaAction("create_character_replace", "Character Replace.", "video", videoInputSchemas.create_character_replace!),
  mediaAction("create_face_swap", "Face Swap Video.", "video", videoInputSchemas.create_face_swap!),
  mediaAction("create_image_to_video", "Image-to-Video.", "video", videoInputSchemas.create_image_to_video!),
  mediaAction("create_lip_sync", "Lip Sync.", "video", videoInputSchemas.create_lip_sync!),
  mediaAction("create_text_to_video", "Text-to-Video.", "video", videoInputSchemas.create_text_to_video!),
  mediaAction("create_video_to_video", "Video-to-Video.", "video", videoInputSchemas.create_video_to_video!),
  {
    name: "get_image_projects",
    description: "Get image details.",
    operationType: "read",
    route: {
      path: "/v1/image-projects/{id}",
      method: "GET",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("image", "Get image details parameters."),
    outputSchema: imageProjectSchema,
  },
  {
    name: "delete_image_projects",
    description: "Delete image.",
    operationType: "destructive",
    route: {
      path: "/v1/image-projects/{id}",
      method: "DELETE",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("image", "Delete image parameters."),
    outputSchema: deletedProjectSchema,
  },
  mediaAction(
    "create_ai_clothes_changer",
    "AI Clothes Changer.",
    "image",
    imageInputSchemas.create_ai_clothes_changer!,
  ),
  mediaAction("create_ai_face_editor", "AI Face Editor.", "image", imageInputSchemas.create_ai_face_editor!),
  mediaAction("create_ai_gif_generator", "AI GIF Generator.", "image", imageInputSchemas.create_ai_gif_generator!),
  mediaAction("create_ai_image_editor", "AI Image Editor.", "image", imageInputSchemas.create_ai_image_editor!),
  mediaAction(
    "create_ai_headshot_generator",
    "AI Headshot Generator.",
    "image",
    imageInputSchemas.create_ai_headshot_generator!,
  ),
  mediaAction(
    "create_ai_image_generator",
    "AI Image Generator.",
    "image",
    imageInputSchemas.create_ai_image_generator!,
  ),
  mediaAction("create_ai_image_upscaler", "AI Image Upscaler.", "image", imageInputSchemas.create_ai_image_upscaler!),
  mediaAction("create_ai_meme_generator", "AI Meme Generator.", "image", imageInputSchemas.create_ai_meme_generator!),
  mediaAction(
    "create_ai_qr_code_generator",
    "AI QR Code Generator.",
    "image",
    imageInputSchemas.create_ai_qr_code_generator!,
  ),
  mediaAction("create_body_swap", "Body Swap.", "image", imageInputSchemas.create_body_swap!),
  mediaAction("create_face_swap_photo", "Face Swap Photo.", "image", imageInputSchemas.create_face_swap_photo!),
  mediaAction("create_head_swap", "Head Swap.", "image", imageInputSchemas.create_head_swap!),
  mediaAction(
    "create_image_background_remover",
    "Image Background Remover.",
    "image",
    imageInputSchemas.create_image_background_remover!,
  ),
  mediaAction("create_photo_colorizer", "Photo Colorizer.", "image", imageInputSchemas.create_photo_colorizer!),
  {
    name: "get_audio_projects",
    description: "Get audio details.",
    operationType: "read",
    route: {
      path: "/v1/audio-projects/{id}",
      method: "GET",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("audio", "Get audio details parameters."),
    outputSchema: audioProjectSchema,
  },
  {
    name: "delete_audio_projects",
    description: "Delete audio.",
    operationType: "destructive",
    route: {
      path: "/v1/audio-projects/{id}",
      method: "DELETE",
      parameters: [{ name: "id", in: "path" }],
      body: false,
    },
    inputSchema: projectInputSchema("audio", "Delete audio parameters."),
    outputSchema: deletedProjectSchema,
  },
  mediaAction(
    "create_ai_music_generator",
    "AI Music Generator.",
    "audio",
    audioInputSchemas.create_ai_music_generator!,
  ),
  mediaAction("create_ai_voice_cloner", "AI Voice Cloner.", "audio", audioInputSchemas.create_ai_voice_cloner!),
  mediaAction(
    "create_ai_voice_generator",
    "AI Voice Generator.",
    "audio",
    audioInputSchemas.create_ai_voice_generator!,
  ),
  {
    name: "upload_asset",
    description:
      "Upload an asset from a public URL to Magic Hour storage and return its reusable file_path. Maximum 20 MiB; larger hosted files can be passed directly to generation actions.",
    operationType: "write",
    route: { path: "/v1/files/upload-urls", method: "POST", parameters: [], body: true },
    inputSchema: uploadAssetInputSchema,
    outputSchema: uploadAssetOutputSchema,
  },
];
export const magicHourRoutes: Map<string, (typeof definitions)[number]["route"]> = new Map(
  definitions.map((definition) => [definition.name, definition.route]),
);
export const magicHourActions: ActionDefinition[] = definitions.map((definition) =>
  defineProviderAction("magichour", {
    name: definition.name,
    description: definition.description,
    operationType: definition.operationType,
    requiredScopes: [],
    inputSchema: definition.inputSchema,
    outputSchema: definition.outputSchema,
    asyncLifecycle: actionLifecycles[definition.name],
  }),
);
