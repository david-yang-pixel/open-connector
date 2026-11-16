import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import {
  videoNameSchema,
  clipStartSchema,
  clipEndSchema,
  assetPathSchema,
  faceMappingsSchema,
} from "./shared-schemas.ts";
const generatedVideoDurationSchema = s.number(
  "The total duration of the output video in seconds. Supported durations depend on the chosen model:\n\n* **`gemini-omni-1.1`**: any integer from 3 to 10\n* **`kling-2.6`**: 5, 10\n* **`kling-3.0`**: any integer from 3 to 15\n* **`ltx-2.5`**: any integer from 1 to 60\n* **`minimax-h3`**: any integer from 1 to 30\n* **`seedance-1.5`**: any integer from 4 to 12\n* **`seedance-2.0`**: any integer from 4 to 15\n* **`seedance-2.0-fast`**: any integer from 4 to 15\n* **`seedance-2.0-mini`**: any integer from 4 to 15\n* **`seedance-2.5`**: any integer from 4 to 30\n* **`veo3.1`**: 4, 6, 8, 16, 24, 32, 40, 48, 56\n* **`veo3.1-lite`**: 4, 6, 8, 16, 24, 32, 40, 48, 56\n* **`wan-2.2`**: 3, 4, 5, 6, 7, 8, 9, 10, 15\n* **`wan-3.0`**: 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30\n",
  { minimum: 1, maximum: 60 },
);
const videoGenerationModelSchema = s.stringEnum(
  "The AI model to use for video generation.\n\n* `default`: uses our currently recommended model for general use. For paid tiers, defaults to `kling-3.0`. For free tiers, it defaults to `ltx-2.5`.\n* `gemini-omni-1.1`: Best for precise short clips, first/last frames, and high-resolution output.\n* `kling-2.6`: Best for action, motion blur, and controlled camera moves.\n* `kling-3.0`: Best for cinematic stories, references, and optional audio.\n* `ltx-2.5`: Fastest for general scenes, long clips, audio, and rapid iteration.\n* `minimax-h3`: Great for reference-driven clips with native audio and longer durations.\n* `seedance-1.5`: Best for smooth, consistent motion with an end frame.\n* `seedance-2.0`: Best for reference-led clips with precise subject control.\n* `seedance-2.0-fast`: Fast reference-led clips with consistent motion and audio.\n* `seedance-2.0-mini`: Faster reference-led clips with consistent motion and audio.\n* `seedance-2.5`: Best for premium realism, detail, and natural motion.\n* `veo3.1`: Best for romantic interactions and expressive action, with realistic detail.\n* `veo3.1-lite`: Balanced realism and audio at a lower cost than Veo 3.1.\n* `wan-2.2`: Best for physical motion, action, and camera movement.\n* `wan-3.0`: High-quality video with native audio, long clips, and end-frame control.\n\nIf you specify the deprecated model value that includes the `-audio` suffix, this will be the same as included `audio` as `true`.",
  [
    "default",
    "minimax-h3",
    "kling-3.0",
    "ltx-2.5",
    "wan-2.2",
    "seedance-2.5",
    "wan-3.0",
    "seedance-2.0-mini",
    "veo3.1",
    "veo3.1-lite",
    "seedance-2.0",
    "kling-2.6",
    "gemini-omni-1.1",
    "seedance-2.0-fast",
    "seedance-1.5",
    "sora-2",
    "ltx-2.3",
    "ltx-2",
    "kling-2.5",
    "kling-1.6",
    "seedance",
    "kling-2.5-audio",
    "veo3.1-audio",
  ],
);
const videoResolutionSchema = s.stringEnum(
  "Controls the output video resolution. Defaults to `720p` on paid tiers and `480p` on free tiers.\n\n* **`gemini-omni-1.1`**: Supports 360p, 720p, 1080p, 4k.\n* **`kling-2.6`**: Supports 720p, 1080p.\n* **`kling-3.0`**: Supports 720p, 1080p, 4k.\n* **`ltx-2.5`**: Supports 480p, 720p, 1080p.\n* **`minimax-h3`**: Supports 480p, 720p, 1080p.\n* **`seedance-1.5`**: Supports 480p, 720p, 1080p.\n* **`seedance-2.0`**: Supports 480p, 720p, 1080p, 4k.\n* **`seedance-2.0-fast`**: Supports 480p, 720p.\n* **`seedance-2.0-mini`**: Supports 480p, 720p.\n* **`seedance-2.5`**: Supports 480p, 720p, 1080p.\n* **`veo3.1`**: Supports 720p, 1080p.\n* **`veo3.1-lite`**: Supports 720p, 1080p.\n* **`wan-2.2`**: Supports 480p, 720p, 1080p.\n* **`wan-3.0`**: Supports 480p, 720p, 1080p.\n",
  ["360p", "480p", "720p", "1080p", "4k"],
);
const generatedVideoAudioSchema = s.boolean(
  "Whether to include audio in the video. Defaults to `false` if not specified.\n\nAudio support varies by model:\n* **`gemini-omni-1.1`**: Not supported\n* **`kling-2.6`**: Not supported\n* **`kling-3.0`**: Toggle-able: audio adds extra credits when enabled\n* **`ltx-2.5`**: Toggle-able: no additional credits for audio\n* **`minimax-h3`**: Toggle-able: no additional credits for audio\n* **`seedance-1.5`**: Toggle-able: audio adds extra credits when enabled\n* **`seedance-2.0`**: Toggle-able: no additional credits for audio\n* **`seedance-2.0-fast`**: Toggle-able: no additional credits for audio\n* **`seedance-2.0-mini`**: Toggle-able: no additional credits for audio\n* **`seedance-2.5`**: Toggle-able: no additional credits for audio\n* **`veo3.1`**: Toggle-able: audio adds extra credits when enabled\n* **`veo3.1-lite`**: Toggle-able: audio adds extra credits when enabled\n* **`wan-2.2`**: Not supported\n* **`wan-3.0`**: Toggle-able: no additional credits for audio\n",
);
const videoSourceSchema = s.stringEnum("Choose your video source.", ["file", "youtube"]);
const youtubeUrlSchema = s.string("YouTube URL (required if `video_source` is `youtube`).", {
  format: "uri",
});
const sourceVideoProperties = {
  video_source: videoSourceSchema,
  video_file_path: assetPathSchema("Your video file. Required if `video_source` is `file`."),
  youtube_url: youtubeUrlSchema,
};
const aiTalkingPhotoInputSchema = s.object(
  "Provide the assets for creating a talking photo",
  {
    name: videoNameSchema,
    start_seconds: s.number(
      "The start time of the input audio in seconds. Maximum clip length depends on style.generation_mode: realistic 300s, prompted 45s.",
      { minimum: 0 },
    ),
    end_seconds: s.number(
      "The end time of the input audio in seconds. Maximum clip length depends on style.generation_mode: realistic 300s, prompted 45s.",
      { minimum: 0.1 },
    ),
    assets: s.object(
      "Provide the assets for creating a talking photo",
      {
        image_file_path: assetPathSchema("The source image to animate.", true),
        audio_file_path: assetPathSchema("The audio file to sync with the image.", true),
      },
      {
        required: ["image_file_path", "audio_file_path"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Attributes used to dictate the style of the output",
      {
        generation_mode: s.stringEnum(
          "Controls overall motion style.\n* `realistic` - Maintains likeness well, high quality, and reliable.\n* `prompted` - Slightly lower likeness; allows option to prompt scene.\n\n**Deprecated values (maintained for backward compatibility):**\n* `pro` - Deprecated: use `realistic`\n* `standard` - Deprecated: use `prompted`\n* `stable` - Deprecated: use `realistic`\n* `expressive` - Deprecated: use `prompted`",
          ["realistic", "prompted", "pro", "standard", "stable", "expressive"],
        ),
        prompt: s.string(
          "A text prompt to guide the generation. Only applicable when generation_mode is `prompted`.\nThis field is ignored for other modes.",
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
    resolution: s.stringEnum(
      "Output preset. Overrides `max_resolution`. Defaults to 480p in prompted mode; realistic mode uses the mapped plan maximum.",
      ["480p", "720p"],
    ),
  },
  {
    required: ["start_seconds", "end_seconds", "assets"],
    additionalProperties: true,
  },
);
const aiUgcAdInputSchema = s.object(
  "AI UGC Ad Generator parameters.",
  {
    assets: s.object(
      "Assets.",
      {
        image_file_path: assetPathSchema("Prepared image to animate.", true),
      },
      { required: ["image_file_path"] },
    ),
    script: s.string(
      "The words the actor should speak. Character limits apply after trimming:\n* kling-3.0: 2500 characters.\n* ltx-2.5: 1804 characters.\n* veo3.1: 2500 characters.\nLTX's dialogue wrapper counts toward its model prompt limit.",
      { minLength: 1 },
    ),
    end_seconds: s.number(
      "Video duration in seconds. Supported values by model:\n* kling-3.0: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 seconds.\n* ltx-2.5: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60 seconds.\n* veo3.1: 4, 6, 8, 15, 22, 29, 36, 43, 50, 57, 64, 71, 78, 85, 92, 99, 106, 113, 120, 127, 134, 141 seconds.\nFree plans are limited to 5 seconds unless a credit pack has been purchased.",
      { minimum: 1 },
    ),
    model: s.stringEnum("Defaults to kling-3.0 on paid plans and ltx-2.5 on free plans.", [
      "kling-3.0",
      "ltx-2.5",
      "veo3.1",
    ]),
    resolution: s.stringEnum(
      "Defaults to 720p on paid plans and 480p on free plans. Unsupported model/resolution combinations and resolutions unavailable for your plan are rejected.",
      ["480p", "720p", "1080p"],
    ),
  },
  { required: ["assets", "script", "end_seconds"] },
);
const aiVideoEditorInputSchema = s.object(
  "AI Video Editor parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: s.number(
      "End time of your clip in seconds. Must be greater than `start_seconds`. Minimum duration depends on model: `gemini-omni-1.1`: 3s, LTX 2.5: 0.5s. Maximum duration depends on model: `gemini-omni-1.1`: 10s, LTX 2.5: 20s.",
      { minimum: 0.1 },
    ),
    model: s.stringEnum(
      "Editing model. Defaults to LTX 2.5 for free tier and `gemini-omni-1.1` for paid. `gemini-omni` is deprecated; use `gemini-omni-1.1` instead.",
      ["gemini-omni-1.1", "gemini-omni", "ltx-2.5", "ltx-2.3"],
    ),
    resolution: s.stringEnum(
      "Output resolution. Defaults to `480p` for free tier and `720p` for paid. `gemini-omni-1.1` and deprecated `gemini-omni` support 720p and 1080p; LTX 2.5 supports 480p, 720p, and 1080p.",
      ["480p", "720p", "1080p"],
    ),
    style: s.object(
      "Style.",
      {
        prompt: s.string("The prompt used to edit the video.", { minLength: 1 }),
      },
      {
        required: ["prompt"],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for video editing.",
      {
        video_file_path: assetPathSchema("The video to edit.", true),
      },
      {
        required: ["video_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "style", "assets"],
    additionalProperties: true,
  },
);
const aiVideoTranslatorInputSchema = s.object(
  "AI Video Translator parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: s.number(
      "End time of your clip (seconds). Must be greater than start_seconds. The clip must be 1-30 seconds long.",
      { minimum: 0.1 },
    ),
    target_language: s.stringEnum("Language to translate the video's speech into.", [
      "English",
      "Chinese (Simplified)",
      "Hindi",
      "Spanish",
      "Arabic",
      "French",
      "Afrikaans",
      "Bengali",
      "Bulgarian",
      "Catalan",
      "Croatian",
      "Czech",
      "Danish",
      "Dutch",
      "Estonian",
      "Finnish",
      "German",
      "Greek",
      "Gujarati",
      "Hebrew",
      "Hungarian",
      "Indonesian",
      "Italian",
      "Japanese",
      "Kannada",
      "Kazakh",
      "Korean",
      "Latvian",
      "Lithuanian",
      "Malay",
      "Malayalam",
      "Marathi",
      "Norwegian",
      "Persian",
      "Polish",
      "Portuguese",
      "Punjabi",
      "Romanian",
      "Russian",
      "Serbian",
      "Slovak",
      "Slovenian",
      "Swahili",
      "Swedish",
      "Tamil",
      "Telugu",
      "Thai",
      "Chinese (Traditional)",
      "Turkish",
      "Ukrainian",
      "Urdu",
      "Vietnamese",
      "Welsh",
    ]),
    resolution: s.stringEnum("Output video resolution. Defaults to 480p. 720p and 1080p require a paid plan.", [
      "480p",
      "720p",
      "1080p",
    ]),
    assets: s.object(
      "Source video for the translation job.",
      {
        video_file_path: assetPathSchema("Source video containing the speech to translate.", true),
      },
      {
        required: ["video_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "target_language", "assets"],
    additionalProperties: true,
  },
);
const aiVideoUpscalerInputSchema = s.object(
  "AI Video Upscaler parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    resolution: s.stringEnum(
      "Output resolution. `720p` and `1080p` set the output's short side, `2k` and `4k` its long side; the aspect ratio is kept. Requires a paid plan.",
      ["720p", "1080p", "2k", "4k"],
    ),
    assets: s.object(
      "Source video for the upscale job.",
      {
        video_file_path: assetPathSchema("Video to upscale.", true),
      },
      {
        required: ["video_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "resolution", "assets"],
    additionalProperties: true,
  },
);
const animationInputSchema = s.object(
  "Animation parameters.",
  {
    name: videoNameSchema,
    fps: s.number("The desire output video frame rate", { minimum: 1 }),
    end_seconds: s.number("This value determines the duration of the output video.", {
      minimum: 0.1,
    }),
    height: s.integer(
      "The height of the final output video. The maximum height depends on your subscription. Please refer to our [pricing page](https://magichour.ai/pricing) for more details",
      { minimum: 64 },
    ),
    width: s.integer(
      "The width of the final output video. The maximum width depends on your subscription. Please refer to our [pricing page](https://magichour.ai/pricing) for more details",
      { minimum: 64 },
    ),
    style: s.object(
      "Defines the style of the output video",
      {
        art_style: s.stringEnum("The art style used to create the output video", [
          "Custom",
          "Painterly Illustration",
          "Vibrant Matte Illustration",
          "Traditional Watercolor",
          "Cyberpunk",
          "Ink and Watercolor Portrait",
          "Intricate Abstract Lines Portrait",
          "3D Render",
          "Old School Comic",
          "Bold Colored Illustration",
          "Synthwave",
          "Minimal Cold Futurism",
          "Futuristic Anime",
          "Cinematic Miyazaki",
          "Studio Ghibli Film Still",
          "Soft Delicate Matte Portrait",
          "Cinematic Landscape",
          "Landscape Painting",
          "Photograph",
          "Jackson Pollock",
          "Cubist",
          "Abstract Minimalist",
          "Impressionism",
          "Van Gogh",
          "Woodcut",
          "Oil Painting",
          "Vintage Japanese Anime",
          "Pixar",
          "Cosmic",
          "Pixel Art",
          "Fantasy",
          "Arcane",
          "Sin City",
          "Double Exposure",
          "Painted Cityscape",
          "90s Streets",
          "Overgrown",
          "Postapocalyptic",
          "Spooky",
          "Miniatures",
          "Low Poly",
          "Art Deco",
          "Inkpunk",
          "Dark Graphic Illustration",
          "Dark Watercolor",
          "Faded Illustration",
          "Directed by AI",
        ]),
        art_style_custom: s.string("Describe custom art style. This field is required if `art_style` is `Custom`"),
        camera_effect: s.stringEnum("The camera effect used to create the output video", [
          "Simple Zoom Out",
          "Simple Zoom In",
          "Bounce Out",
          "Spin Bounce",
          "Rolling Bounces",
          "Rise and Climb",
          "Dramatic Zoom In",
          "Dramatic Zoom Out",
          "Sway Out",
          "Boost Zoom In",
          "Boost Zoom Out",
          "Heartbeat",
          "Bounce in Place",
          "Earthquake Bounce",
          "Slice Bounce",
          "Bounce In And Out",
          "Jump",
          "Road Trip",
          "Traverse",
          "Rubber Band",
          "Rodeo",
          "Accelerate",
          "Speed of Light",
          "Drift Spin",
          "Vertigo",
          "Cog in the Machine",
          "Quadrant",
          "Tron",
          "Pusher",
          "Roll In",
          "Hesitate In",
          "Zoom In - Audio Sync",
          "Pulse - Audio Sync",
          "Aggressive Zoom In - Audio Sync",
          "Roll In - Audio Sync",
          "Zoom Out - Audio Sync",
          "Aggressive Zoom Out - Audio Sync",
          "Sway Out - Audio Sync",
          "Bounce and Spin - Audio Sync",
          "Zoom In and Spin - Audio Sync",
          "Vertigo - Audio Sync",
          "Bounce Out - Audio Sync",
          "Earthquake Bounce - Audio Sync",
          "Pusher - Audio Sync",
          "Evolve - Audio Sync",
          "Devolve - Audio Sync",
          "Slideshow",
          "Pan Left",
          "Pan Right",
          "Tilt Up",
          "Tilt Down",
          "Directed by AI",
        ]),
        prompt_type: s.stringEnum(
          "\n* `custom` - Use your own prompt for the video.\n* `use_lyrics` - Use the lyrics of the audio to create the prompt. If this option is selected, then `assets.audio_source` must be `file` or `youtube`.\n* `ai_choose` - Let AI write the prompt. If this option is selected, then `assets.audio_source` must be `file` or `youtube`.",
          ["custom", "use_lyrics", "ai_choose"],
        ),
        prompt: s.string(
          "The prompt used for the video. Prompt is required if `prompt_type` is `custom`. Otherwise this value is ignored",
        ),
        transition_speed: s.integer(
          "Change determines how quickly the video's content changes across frames. \n* Higher = more rapid transitions.\n* Lower = more stable visual experience.",
          { minimum: 1, maximum: 10 },
        ),
      },
      {
        required: ["art_style", "camera_effect", "prompt_type", "transition_speed"],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for animation.",
      {
        audio_source: s.stringEnum(
          "Optionally add an audio source if you'd like to incorporate audio into your video",
          ["none", "file", "youtube"],
        ),
        audio_file_path: assetPathSchema(
          "The path of the input audio. This field is required if `audio_source` is `file`.",
          true,
        ),
        youtube_url: s.string(
          "Using a youtube video as the input source. This field is required if `audio_source` is `youtube`",
          { format: "uri", minLength: 1 },
        ),
        image_file_path: assetPathSchema("An initial image to use a the first frame of the video.", true),
      },
      {
        required: ["audio_source"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["fps", "end_seconds", "height", "width", "style", "assets"],
    additionalProperties: true,
  },
);
const audioToVideoInputSchema = s.object(
  "Audio-to-Video parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    resolution: s.stringEnum("Output video resolution. Defaults to `720p` on paid tiers and `480p` on free tiers.", [
      "480p",
      "720p",
      "1080p",
    ]),
    assets: s.object(
      "Provide the audio file and an optional reference image.",
      {
        audio_file_path: assetPathSchema("The path of the audio file.", true),
        image_file_path: assetPathSchema("Reference image for the initial frame of the video.", true),
      },
      {
        required: ["audio_file_path"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Attributes used to dictate the style of the output",
      {
        prompt: s.string("Prompt to guide the visual style of the video."),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "assets"],
    additionalProperties: true,
  },
);
const autoSubtitleGeneratorInputSchema = s.object(
  "Auto Subtitle Generator parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    assets: s.object(
      "Provide the assets for auto subtitle generator",
      {
        video_file_path: assetPathSchema("This is the video used to add subtitles.", true),
      },
      {
        required: ["video_file_path"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Style of the subtitle. At least one of `.style.template` or `.style.custom_config` must be provided. \n* If only `.style.template` is provided, default values for the template will be used.\n* If both are provided, the fields in `.style.custom_config` will be used to overwrite the fields in `.style.template`.\n* If only `.style.custom_config` is provided, then all fields in `.style.custom_config` will be used.\n\nTo use custom config only, the following `custom_config` params are required:\n* `.style.custom_config.font`\n* `.style.custom_config.text_color`\n* `.style.custom_config.vertical_position`\n* `.style.custom_config.horizontal_position`\n",
      {
        template: s.stringEnum(
          "Preset subtitle templates. Please visit https://magichour.ai/create/auto-subtitle-generator to see the style of the existing templates.",
          ["karaoke", "cinematic", "minimalist", "highlight"],
        ),
        custom_config: s.object(
          "Custom subtitle configuration.",
          {
            font: s.string(
              "Font name from Google Fonts. Not all fonts support all languages or character sets. \nWe recommend verifying language support and appearance directly on https://fonts.google.com before use.",
            ),
            font_size: s.number(
              "Font size in pixels. If not provided, the font size is automatically calculated based on the video resolution.",
            ),
            font_style: s.string("Font style (e.g., normal, italic, bold)"),
            text_color: s.string("Primary text color in hex format"),
            highlighted_text_color: s.string("Color used to highlight the current spoken text"),
            stroke_color: s.string("Stroke (outline) color of the text"),
            stroke_width: s.number(
              "Width of the text stroke in pixels. If `stroke_color` is provided, but `stroke_width` is not, the `stroke_width` will be calculated automatically based on the font size.",
            ),
            vertical_position: s.string("Vertical alignment of the text (e.g., top, center, bottom)"),
            horizontal_position: s.string("Horizontal alignment of the text (e.g., left, center, right)"),
          },
          {
            required: [],
            additionalProperties: true,
          },
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["start_seconds", "end_seconds", "assets", "style"],
    additionalProperties: true,
  },
);
const characterReplaceInputSchema = s.object(
  "Character Replace parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    model: s.stringEnum(
      "Model to use. Defaults to `wan-animate`.\n\n* **`wan-animate`**: 480p, 720p. Supports `points` subject selection.\n* **`kling-3.0`**: 720p, 1080p. Clips of 3–10 seconds in `replace` mode or 3–30 seconds in `animate` mode. Picks the main person automatically, so `points` are rejected.",
      ["wan-animate", "kling-3.0"],
    ),
    resolution: s.stringEnum(
      "Output video resolution. Must be supported by `model`. Defaults to the lowest resolution available on your plan for that model.",
      ["480p", "720p", "1080p"],
    ),
    assets: s.object(
      "Source video and reference character image for the job.",
      {
        video_file_path: assetPathSchema("Source video containing the subject to replace or animate.", true),
        image_file_path: assetPathSchema(
          "Reference character image used as the replacement or animation target.",
          true,
        ),
      },
      {
        required: ["video_file_path", "image_file_path"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Optional style controls for replace vs animate mode and subject selection.",
      {
        mode: s.stringEnum(
          "Processing mode. `replace` swaps the detected subject with your reference character. `animate` transfers motion from the video onto your character image.",
          ["replace", "animate"],
        ),
        selection_mode: s.stringEnum(
          "How to locate the subject in the source video. `auto` detects a person automatically. `point` uses your `points` to mark the subject and is supported by `wan-animate`. Defaults to `auto`.",
          ["auto", "point"],
        ),
        points: s.array(
          "On-frame markers for manual subject selection. Required when `selection_mode` is `point`. Ignored when `selection_mode` is `auto` or omitted. Rejected for models without subject selection (supported by `wan-animate`).",
          s.object(
            "Points item.",
            {
              position_x: s.integer(
                "Horizontal pixel coordinate in the source video frame at `time_seconds`, measured from the left edge.",
                { minimum: 0 },
              ),
              position_y: s.integer(
                "Vertical pixel coordinate in the source video frame at `time_seconds`, measured from the top edge.",
                { minimum: 0 },
              ),
              time_seconds: s.number(
                "Timestamp on the source video timeline in seconds. Uses the same clock as `start_seconds` and `end_seconds`.",
                { minimum: 0 },
              ),
            },
            {
              required: ["position_x", "position_y", "time_seconds"],
              additionalProperties: true,
            },
          ),
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "assets"],
    additionalProperties: true,
  },
);
const faceSwapInputSchema = s.object(
  "Face Swap Video parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    style: s.object(
      "Style of the face swap video.",
      {
        version: s.stringEnum(
          "* `v1` - May preserve skin detail and texture better, but weaker identity preservation.\n* `v2` - Faster, sharper, better handling of hair and glasses. stronger identity preservation.\n* `default` - Use the version we recommend, which will change over time. This is recommended unless you need a specific earlier version. This is the default behavior.",
          ["v1", "v2", "default"],
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for face swap. For video, The `video_source` field determines whether `video_file_path` or `youtube_url` field is used",
      {
        face_swap_mode: s.stringEnum(
          "Choose how to swap faces:\n- **all-faces** (recommended) — swap all detected faces using one source image (`source_file_path` required)\n- **individual-faces** — specify exact mappings using `face_mappings`",
          ["all-faces", "individual-faces"],
        ),
        image_file_path: s.string(
          "The path of the input image with the face to be swapped.  The value is required if `face_swap_mode` is `all-faces`.\n\nThis value is either\n- a direct URL to the video file\n- `file_path` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n",
        ),
        face_mappings: faceMappingsSchema,
        ...sourceVideoProperties,
      },
      {
        required: ["video_source"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["start_seconds", "end_seconds", "assets"],
    additionalProperties: true,
  },
);
const imageToVideoInputSchema = s.object(
  "Image-to-Video parameters.",
  {
    name: videoNameSchema,
    end_seconds: generatedVideoDurationSchema,
    model: videoGenerationModelSchema,
    resolution: videoResolutionSchema,
    audio: generatedVideoAudioSchema,
    style: s.object(
      "Attributed used to dictate the style of the output",
      {
        prompt: s.string("The prompt used for the video."),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for image-to-video.",
      {
        image_file_path: assetPathSchema("The path of the image file.", true),
        end_image_file_path: s.string(
          "The image to use as the last frame of the video.\n\n* **`gemini-omni-1.1`**: Supports 360p, 720p, 1080p, 4k.\n* **`kling-2.6`**: Supports 1080p.\n* **`kling-3.0`**: Supports 720p, 1080p, 4k.\n* **`ltx-2.5`**: Supports 480p, 720p, 1080p.\n* **`minimax-h3`**: Supports 480p, 720p, 1080p.\n* **`seedance-1.5`**: Supports 480p, 720p, 1080p.\n* **`seedance-2.0`**: Supports 480p, 720p, 1080p, 4k.\n* **`seedance-2.0-fast`**: Supports 480p, 720p.\n* **`seedance-2.0-mini`**: Supports 480p, 720p.\n* **`seedance-2.5`**: Supports 480p, 720p, 1080p.\n* **`veo3.1`**: Supports 720p, 1080p. Requires a duration of 8 seconds or less.\n* **`veo3.1-lite`**: Supports 720p, 1080p. Requires a duration of 8 seconds or less.\n* **`wan-2.2`**: Not supported\n* **`wan-3.0`**: Supports 480p, 720p, 1080p.\n",
          { minLength: 1 },
        ),
      },
      {
        required: ["image_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["end_seconds", "assets"],
    additionalProperties: true,
  },
);
const lipSyncInputSchema = s.object(
  "Lip Sync parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    max_fps_limit: s.number(
      "Defines the maximum FPS (frames per second) for the output video. If the input video's FPS is lower than this limit, the output video will retain the input FPS. This is useful for reducing unnecessary frame usage in scenarios where high FPS is not required.",
      { minimum: 1 },
    ),
    assets: s.object(
      "Provide the assets for lip-sync. For video, The `video_source` field determines whether `video_file_path` or `youtube_url` field is used",
      {
        audio_file_path: assetPathSchema("The path of the audio file.", true),
        ...sourceVideoProperties,
      },
      {
        required: ["audio_file_path", "video_source"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Attributes used to dictate the style of the output",
      {
        generation_mode: s.stringEnum(
          "A specific version of our lip sync system, optimized for different needs.\n* `lite` -  Fast lip sync - best for simple videos. Costs 1 credit per frame of video.\n* `standard` -  Natural, accurate lip sync - best for most creators. Requires visible mouth movement in the opening seconds of the input video. Costs 1 credit per frame of video.\n* `pro` -  Premium fidelity with enhanced detail - best for professionals. Requires visible mouth movement in the opening seconds of the input video. Costs 2 credits per frame of video.\n\nIf your source is a still image, including a still image saved as a static video, use [AI Talking Photo](https://docs.magichour.ai/api-reference/video-projects/ai-talking-photo) with the original image and your audio instead.\n\nNote: `pro` is only available for users on Creator, Pro, and Business tiers.\n              ",
          ["lite", "standard", "pro"],
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["start_seconds", "end_seconds", "assets"],
    additionalProperties: true,
  },
);
const textToVideoInputSchema = s.object(
  "Text-to-Video parameters.",
  {
    name: videoNameSchema,
    end_seconds: generatedVideoDurationSchema,
    aspect_ratio: s.stringEnum(
      "Provide `aspect_ratio` to set the video’s aspect ratio. Determines the aspect ratio of the output video.\n\n* **`gemini-omni-1.1`**: Supports 16:9, 9:16.\n* **`kling-2.6`**: Supports 9:16, 16:9, 1:1.\n* **`kling-3.0`**: Supports 9:16, 16:9, 1:1.\n* **`ltx-2.5`**: Supports 9:16, 16:9, 1:1.\n* **`minimax-h3`**: Supports 16:9, 9:16, 1:1.\n* **`seedance-1.5`**: Supports 9:16, 16:9, 1:1.\n* **`seedance-2.0`**: Supports 9:16, 16:9, 1:1.\n* **`seedance-2.0-fast`**: Supports 9:16, 16:9, 1:1.\n* **`seedance-2.0-mini`**: Supports 9:16, 16:9, 1:1.\n* **`seedance-2.5`**: Supports 9:16, 16:9, 1:1.\n* **`veo3.1`**: Supports 9:16, 16:9.\n* **`veo3.1-lite`**: Supports 9:16, 16:9.\n* **`wan-2.2`**: Supports 9:16, 16:9, 1:1.\n* **`wan-3.0`**: Supports 16:9, 9:16, 1:1.\n",
      ["16:9", "9:16", "1:1"],
    ),
    resolution: videoResolutionSchema,
    model: videoGenerationModelSchema,
    audio: generatedVideoAudioSchema,
    style: s.object(
      "Style.",
      {
        prompt: s.string("The prompt used for the video.", { minLength: 1, maxLength: 20000 }),
      },
      {
        required: ["prompt"],
        additionalProperties: true,
      },
    ),
    references: s.array(
      "Reference media for video generation. Name references without @ and refer to them as @name in style.prompt. Maximum 10 references total.\n\nSupported models and reference media:\n* **`gemini-omni-1.1`**: Supports images, videos. Up to 13 references.\n* **`kling-3.0`**: Supports images, videos.\n* **`minimax-h3`**: Supports images, videos, audio.\n* **`seedance-2.0`**: Supports images, videos, audio.\n* **`seedance-2.0-fast`**: Supports images, videos, audio.\n* **`seedance-2.0-mini`**: Supports images, videos, audio.\n* **`seedance-2.5`**: Supports images, videos, audio.\n* **`veo3.1`**: Supports images. Up to 3 references. Requires `end_seconds` of 8.\n* **`wan-3.0`**: Supports images, videos, audio.",
      s.object(
        "References item.",
        {
          name: s.string("Name.", { pattern: "^[A-Za-z][\\w-]*$" }),
          file_path: s.string("File path.", { minLength: 1 }),
        },
        {
          required: ["name", "file_path"],
          additionalProperties: true,
        },
      ),
      { minItems: 1, maxItems: 10 },
    ),
  },
  {
    required: ["end_seconds", "style"],
    additionalProperties: true,
  },
);
const videoToVideoInputSchema = s.object(
  "Video-to-Video parameters.",
  {
    name: videoNameSchema,
    start_seconds: clipStartSchema,
    end_seconds: clipEndSchema,
    fps_resolution: s.stringEnum(
      "Determines whether the resulting video will have the same frame per second as the original video, or half.\n* `FULL` - the result video will have the same FPS as the input video\n* `HALF` - the result video will have half the FPS as the input video",
      ["FULL", "HALF"],
    ),
    style: s.object(
      "Style.",
      {
        art_style: s.stringEnum("Art style.", [
          "Minecraft",
          "Watercolor",
          "Pixel",
          "Retro Sci-Fi",
          "Lego",
          "Origami",
          "Ghost",
          "Sub-Zero",
          "Studio Ghibli",
          "Comic",
          "Impressionism",
          "Master Chief",
          "Solid Snake",
          "Street Fighter",
          "Hologram",
          "GTA",
          "Clay",
          "Mystique",
          "Dragonball Z",
          "Mario",
          "Samurai",
          "Spartan",
          "Boba Fett",
          "3D Render",
          "Airbender",
          "Android",
          "Anime Warrior",
          "Armored Knight",
          "Assassin's Creed",
          "Avatar",
          "Black Spiderman",
          "Bold Anime",
          "Celestial Skin",
          "Chinese Swordsmen",
          "Cyberpunk",
          "Cypher",
          "Dark Fantasy",
          "Future Bot",
          "Futuristic Fantasy",
          "Ghibli Anime",
          "Gundam",
          "Illustration",
          "Ink",
          "Ink Poster",
          "Jinx",
          "Knight",
          "Link",
          "Marble",
          "Mech",
          "Naruto",
          "Neon Dream",
          "No Art Style",
          "Oil Painting",
          "On Fire",
          "Painterly Anime",
          "Pixar",
          "Power Armor",
          "Power Ranger",
          "Radiant Anime",
          "Realistic Anime",
          "Realistic Pixar",
          "Retro Anime",
          "Samurai Bot",
          "Sharp Anime",
          "Soft Anime",
          "Starfield",
          "The Void",
          "Tomb Raider",
          "Underwater",
          "Van Gogh",
          "Viking",
          "Western Anime",
          "Wu Kong",
          "Wuxia Anime",
          "Zelda",
        ]),
        version: s.stringEnum(
          "* `v1` - more detail, closer prompt adherence, and frame-by-frame previews.\n* `v2` - faster, more consistent, and less noisy.\n* `default` - use the selected art style's default version. Some art styles default to v3, which is unavailable through this API. For `Studio Ghibli`, explicitly set `version` to `v2` to use its supported preset.",
          ["v1", "v2", "default"],
        ),
        prompt_type: s.stringEnum(
          "* `default` - Use the default recommended prompt for the art style.\n* `custom` - Only use the prompt passed in the API. Note: for v1, lora prompt will still be auto added to apply the art style properly.\n* `append_default` - Add the default recommended prompt to the end of the prompt passed in the API.",
          ["default", "custom", "append_default"],
        ),
        prompt: s.nullable(
          s.string(
            "The prompt used for the video. Prompt is required if `prompt_type` is `custom` or `append_default`. If `prompt_type` is `default`, then the `prompt` value passed will be ignored.",
          ),
        ),
        model: s.stringEnum(
          "* `Dreamshaper` - a good all-around model that works for both animations as well as realism.\n* `Absolute Reality` - better at realism, but you'll often get similar results with Dreamshaper as well.\n* `Flat 2D Anime` - best for a flat illustration style that's common in most anime.\n* `default` - use the default recommended model for the selected art style.",
          [
            "Dreamshaper",
            "Absolute Reality",
            "Flat 2D Anime",
            "Soft Anime",
            "Kaywaii",
            "Western Anime",
            "3D Anime",
            "default",
          ],
        ),
      },
      {
        required: ["art_style"],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for video-to-video. For video, The `video_source` field determines whether `video_file_path` or `youtube_url` field is used",
      {
        ...sourceVideoProperties,
      },
      {
        required: ["video_source"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["start_seconds", "end_seconds", "style", "assets"],
    additionalProperties: true,
  },
);
export const videoInputSchemas: Record<string, JsonSchema> = {
  create_ai_talking_photo: aiTalkingPhotoInputSchema,
  create_ai_ugc_ad: aiUgcAdInputSchema,
  create_ai_video_editor: aiVideoEditorInputSchema,
  create_ai_video_translator: aiVideoTranslatorInputSchema,
  create_ai_video_upscaler: aiVideoUpscalerInputSchema,
  create_animation: animationInputSchema,
  create_audio_to_video: audioToVideoInputSchema,
  create_auto_subtitle_generator: autoSubtitleGeneratorInputSchema,
  create_character_replace: characterReplaceInputSchema,
  create_face_swap: faceSwapInputSchema,
  create_image_to_video: imageToVideoInputSchema,
  create_lip_sync: lipSyncInputSchema,
  create_text_to_video: textToVideoInputSchema,
  create_video_to_video: videoToVideoInputSchema,
};
