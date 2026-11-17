import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { audioNameSchema, assetPathSchema } from "./shared-schemas.ts";
import { magicHourVoiceNames } from "./voices.ts";
const voiceSchema = s.stringEnum(
  "The voice used to generate speech. Select a value from the supported voice names.",
  magicHourVoiceNames,
);
const aiMusicGeneratorInputSchema = s.object(
  "AI Music Generator parameters.",
  {
    name: audioNameSchema,
    duration: s.integer("Requested track duration in seconds, from 15 to 300. Determines credits charged.", {
      minimum: 15,
      maximum: 300,
    }),
    style: s.object(
      "Style.",
      {
        prompt: s.string("Describe the song, including genre, mood, and instruments.", {
          minLength: 1,
        }),
        instrumental: s.boolean("Generate music without vocals. When true, lyrics is ignored."),
        lyrics: s.string("Custom lyrics. Omit or leave blank for AI-generated lyrics when instrumental is false."),
      },
      { required: ["prompt"] },
    ),
  },
  { required: ["duration", "style"] },
);
const aiVoiceClonerInputSchema = s.object(
  "AI Voice Cloner parameters.",
  {
    name: audioNameSchema,
    assets: s.object(
      "Provide the assets for voice cloning.",
      { audio_file_path: assetPathSchema("The audio used to clone the voice.", true) },
      {
        required: ["audio_file_path"],
        additionalProperties: true,
      },
    ),
    style: s.object(
      "Style.",
      {
        prompt: s.string(
          "Text used to generate speech from the cloned voice. The character limit is 1000 characters.",
          { minLength: 1, maxLength: 1000 },
        ),
      },
      {
        required: ["prompt"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets", "style"],
    additionalProperties: true,
  },
);
const aiVoiceGeneratorInputSchema = s.object(
  "AI Voice Generator parameters.",
  {
    name: audioNameSchema,
    style: s.object(
      "The content used to generate speech.",
      {
        prompt: s.string("Text used to generate speech. The character limit is 1000 characters.", {
          minLength: 1,
        }),
        voice_name: voiceSchema,
      },
      {
        required: ["prompt", "voice_name"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["style"],
    additionalProperties: true,
  },
);
export const audioInputSchemas: Record<string, JsonSchema> = {
  create_ai_music_generator: aiMusicGeneratorInputSchema,
  create_ai_voice_cloner: aiVoiceClonerInputSchema,
  create_ai_voice_generator: aiVoiceGeneratorInputSchema,
};
