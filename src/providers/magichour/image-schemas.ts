import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { assetPathSchema, faceMappingsSchema, imageNameSchema } from "./shared-schemas.ts";
function faceAdjustmentSchema(description: string) {
  return s.number(description, { minimum: -100, maximum: 100, multipleOf: 5 });
}
const imageEditingModelSchema = s.stringEnum(
  "The AI model to use for image editing. Each model has different capabilities and costs.\n\n**Models:**\n- `default` - Use the model we recommend, which will change over time. This is recommended unless you need a specific model. This is the default behavior.\n- `flux-2-klein` - from 5 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Max additional input images: 5\n- `gpt-image-2` - from 50 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `gpt-image-2.5-flare` - from 100 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `krea-2` - from 10 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: free, creator, pro, business\n  - Max additional input images: 1\n- `nano-banana` - from 50 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `nano-banana-2` - from 100 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `nano-banana-2-lite` - from 50 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `nano-banana-2.1` - from 50 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `nano-banana-pro` - from 150 credits/image\n  - Supported resolutions: 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `qwen-edit` - from 10 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Max additional input images: 2\n- `qwen-image-2.1` - from 10 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Max additional input images: 2\n- `seedream-v4` - from 40 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `seedream-v4.5` - from 50 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n- `seedream-v5-pro` - from 75 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: creator, pro, business\n  - Max additional input images: 9\n",
  [
    "default",
    "qwen-image-2.1",
    "gpt-image-2",
    "nano-banana-2",
    "flux-2-klein",
    "nano-banana-pro",
    "seedream-v5-pro",
    "seedream-v4.5",
    "nano-banana-2.1",
    "qwen-edit",
    "nano-banana-2-lite",
    "krea-2",
    "gpt-image-2.5-flare",
    "seedream-v4",
    "nano-banana",
  ],
);
const imageEditingResolutionSchema = s.stringEnum(
  "Maximum resolution (longest edge) for the output image.\n\n**Options:**\n- `640px` — up to 640px\n- `1k` — up to 1024px\n- `2k` — up to 2048px\n- `4k` — up to 4096px\n- `auto` — **Deprecated.** Mapped server-side from your subscription tier to the best matching resolution the model supports\n\n**Per-model support:**\n- `flux-2-klein` - 640px, 1k, 2k\n- `gpt-image-2` - 640px, 1k, 2k, 4k\n- `gpt-image-2.5-flare` - 640px, 1k, 2k, 4k\n- `krea-2` - 640px, 1k\n- `nano-banana` - 640px, 1k\n- `nano-banana-2` - 640px, 1k, 2k, 4k\n- `nano-banana-2-lite` - 640px, 1k\n- `nano-banana-2.1` - 640px, 1k, 2k, 4k\n- `nano-banana-pro` - 1k, 2k, 4k\n- `qwen-edit` - 640px, 1k, 2k\n- `qwen-image-2.1` - 640px, 1k, 2k\n- `seedream-v4` - 640px, 1k, 2k, 4k\n- `seedream-v4.5` - 640px, 1k, 2k, 4k\n- `seedream-v5-pro` - 640px, 1k, 2k\n\nNote: Resolution availability depends on the model and your subscription tier.",
  ["auto", "640px", "1k", "2k", "4k"],
);
const imageGenerationModelSchema = s.stringEnum(
  "The AI model to use for image generation. Each model has different capabilities and costs.\n\n**Models:**\n- `default` - Use the model we recommend, which will change over time. This is recommended unless you need a specific model. This is the default behavior.\n- `flux-2-klein` - from 5 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Image count allowed: 1\n- `flux-schnell` - from 5 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `gpt-image-2` - from 50 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `gpt-image-2.5-flare` - from 100 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `krea-2` - from 10 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: free, creator, pro, business\n  - Image count allowed: 1\n- `nano-banana` - from 50 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `nano-banana-2` - from 100 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 4, 9, 16\n- `nano-banana-2-lite` - from 50 credits/image\n  - Supported resolutions: 640px, 1k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `nano-banana-2.1` - from 50 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 4, 9, 16\n- `nano-banana-pro` - from 150 credits/image\n  - Supported resolutions: 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 4, 9, 16\n- `qwen-image-2.1` - from 10 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `seedream-v4` - from 40 credits/image\n  - Supported resolutions: 640px, 1k, 2k, 4k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `seedream-v5-pro` - from 75 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n- `z-image-turbo` - from 5 credits/image\n  - Supported resolutions: 640px, 1k, 2k\n  - Available for tiers: free, creator, pro, business\n  - Image count allowed: 1, 2, 3, 4\n\n**Deprecated Enum Values:**\n- `seedream` - Use `seedream-v4` instead.\n",
  [
    "default",
    "z-image-turbo",
    "gpt-image-2",
    "qwen-image-2.1",
    "flux-2-klein",
    "nano-banana-2",
    "nano-banana-2.1",
    "nano-banana-pro",
    "krea-2",
    "seedream-v5-pro",
    "nano-banana-2-lite",
    "gpt-image-2.5-flare",
    "seedream-v4",
    "nano-banana",
    "flux-schnell",
    "seedream",
  ],
);
const imageGenerationResolutionSchema = s.stringEnum(
  "Maximum resolution (longest edge) for the output image.\n\n**Options:**\n- `640px` — up to 640px\n- `1k` — up to 1024px\n- `2k` — up to 2048px\n- `4k` — up to 4096px\n- `auto` — **Deprecated.** Mapped server-side from your subscription tier to the best matching resolution the model supports\n\n**Per-model support:**\n- `flux-2-klein` - 640px, 1k, 2k\n- `flux-schnell` - 640px, 1k, 2k\n- `gpt-image-2` - 640px, 1k, 2k, 4k\n- `gpt-image-2.5-flare` - 640px, 1k, 2k, 4k\n- `krea-2` - 640px, 1k\n- `nano-banana` - 640px, 1k\n- `nano-banana-2` - 640px, 1k, 2k, 4k\n- `nano-banana-2-lite` - 640px, 1k\n- `nano-banana-2.1` - 640px, 1k, 2k, 4k\n- `nano-banana-pro` - 1k, 2k, 4k\n- `qwen-image-2.1` - 640px, 1k, 2k\n- `seedream-v4` - 640px, 1k, 2k, 4k\n- `seedream-v5-pro` - 640px, 1k, 2k\n- `z-image-turbo` - 640px, 1k, 2k\n\nNote: Resolution availability depends on the model and your subscription tier.",
  ["auto", "640px", "1k", "2k", "4k"],
);
const faceEditingStyleSchema = s.object(
  "Face editing parameters",
  {
    enhance_face: s.boolean("Enhance face features"),
    eyebrow_direction: faceAdjustmentSchema("Eyebrow direction (-100 to 100), in increments of 5"),
    eye_gaze_horizontal: faceAdjustmentSchema("Horizontal eye gaze (-100 to 100), in increments of 5"),
    eye_gaze_vertical: faceAdjustmentSchema("Vertical eye gaze (-100 to 100), in increments of 5"),
    eye_open_ratio: faceAdjustmentSchema("Eye open ratio (-100 to 100), in increments of 5"),
    lip_open_ratio: faceAdjustmentSchema("Lip open ratio (-100 to 100), in increments of 5"),
    head_roll: faceAdjustmentSchema("Head roll (-100 to 100), in increments of 5"),
    mouth_grim: faceAdjustmentSchema("Mouth grim (-100 to 100), in increments of 5"),
    mouth_pout: faceAdjustmentSchema("Mouth pout (-100 to 100), in increments of 5"),
    mouth_purse: faceAdjustmentSchema("Mouth purse (-100 to 100), in increments of 5"),
    mouth_smile: faceAdjustmentSchema("Mouth smile (-100 to 100), in increments of 5"),
    mouth_position_horizontal: faceAdjustmentSchema("Horizontal mouth position (-100 to 100), in increments of 5"),
    mouth_position_vertical: faceAdjustmentSchema("Vertical mouth position (-100 to 100), in increments of 5"),
    head_pitch: faceAdjustmentSchema("Head pitch (-100 to 100), in increments of 5"),
    head_yaw: faceAdjustmentSchema("Head yaw (-100 to 100), in increments of 5"),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const memeStyleSchema = s.object(
  "Style.",
  {
    topic: s.string("The topic of the meme.", { maxLength: 200, minLength: 1 }),
    template: s.stringEnum("To use our templates, pass in one of the enum values.", [
      "Random",
      "Drake Hotline Bling",
      "Galaxy Brain",
      "Two Buttons",
      "Gru's Plan",
      "Tuxedo Winnie The Pooh",
      "Is This a Pigeon",
      "Panik Kalm Panik",
      "Disappointed Guy",
      "Waiting Skeleton",
      "Bike Fall",
      "Change My Mind",
      "Side Eyeing Chloe",
      "Woman Yelling at a Cat",
      "Success Kid",
      "One Does Not Simply",
      "Bad Luck Brian",
      "Futurama Fry",
      "Ancient Aliens",
      "Disaster Girl",
      "Hide the Pain Harold",
      "Distracted Boyfriend",
      "Left Exit 12 Off Ramp",
      "Running Away Balloon",
      "Batman Slapping Robin",
      "UNO Draw 25",
      "Mocking SpongeBob",
      "Boardroom Meeting Suggestion",
      "X, X Everywhere",
      "Buff Doge vs Cheems",
      "Bernie Once Again Asking",
      "Roll Safe Think About It",
      "Blank Nut Button",
      "Epic Handshake",
      "Sad Pablo Escobar",
      "Inhaling Seagull",
      "Surprised Pikachu",
      "Always Has Been",
      "Scroll of Truth",
      "Marked Safe From",
      "Y'all Got Any More of That",
      "Monkey Puppet",
      "Oprah You Get A",
      "They're the Same Picture",
      "I Bet He's Thinking About Other Women",
      "Evil Kermit",
      "This Is Fine",
      "This Is Where I'd Put My Trophy",
      "Anakin Padme Four Panel",
      "Who Killed Hannibal",
      "Clown Applying Makeup",
      "Trade Offer",
      "Laughing Leo",
      "Sleeping Shaq",
      "Megamind Peeking",
      "Grandma Finds the Internet",
      "Doge",
      "American Chopper Argument",
      "First World Problems",
      "Grumpy Cat",
      "SpongeBob Ight Imma Head Out",
      "But That's None of My Business",
      "Creepy Condescending Wonka",
      "Captain Picard Facepalm",
      "Hard to Swallow Pills",
      "Bell Curve",
      "Absolute Cinema",
      "You Guys Are Getting Paid",
      "Types of Headaches",
      "Mother Ignoring Kid Drowning in a Pool",
      "Flex Tape",
      "Spiderman Pointing at Spiderman",
      "Charlie Conspiracy",
      "Pawn Stars Best I Can Do",
      "0 Days Without",
      "Squidward Window",
      "Where Monkey",
      "Soldier Protecting Sleeping Child",
      "They Don't Know",
      "Spiderman Triple",
      "Two Guys on a Bus",
      "Imagination SpongeBob",
      "All My Homies Hate",
      "You Know I'm Something of a Scientist Myself",
      "Anime Girl Hiding from Terminator",
      "A Train Hitting a School Bus",
      "AJ Styles and Undertaker",
      "Three-Headed Dragon",
      "Grant Gustin Over Grave",
      "Whisper and Goosebumps",
      "Scooby Doo Mask Reveal",
      "Domino Effect",
      "Two Paths",
      "I'm the Captain Now",
      "Say the Line Bart",
      "Star Wars Yoda",
      "Grim Reaper Knocking Door",
      "Yo Dawg Heard You",
      "Gus Fring We Are Not the Same",
      "C'mon Do Something",
      "Leonardo DiCaprio Cheers",
    ]),
    searchWeb: s.boolean("Whether to search the web for meme content."),
  },
  {
    required: ["topic", "template"],
    additionalProperties: true,
  },
);
const imageGenerationStyleSchema = s.object(
  "The art style to use for image generation.",
  {
    prompt: s.string("The prompt used for the image(s).", { minLength: 1 }),
    tool: s.stringEnum("The art style to use for image generation. Defaults to 'general' if not provided.", [
      "ai-anime-generator",
      "ai-art-generator",
      "ai-background-generator",
      "ai-character-generator",
      "ai-face-generator",
      "ai-fashion-generator",
      "ai-icon-generator",
      "ai-illustration-generator",
      "ai-interior-design-generator",
      "ai-landscape-generator",
      "ai-logo-generator",
      "ai-manga-generator",
      "ai-outfit-generator",
      "ai-pattern-generator",
      "ai-photo-generator",
      "ai-sketch-generator",
      "ai-tattoo-generator",
      "album-cover-generator",
      "animated-characters-generator",
      "architecture-generator",
      "book-cover-generator",
      "comic-book-generator",
      "dark-fantasy-ai",
      "disney-ai-generator",
      "dnd-ai-art-generator",
      "emoji-generator",
      "fantasy-map-generator",
      "graffiti-generator",
      "movie-poster-generator",
      "optical-illusion-generator",
      "pokemon-generator",
      "south-park-character-generator",
      "superhero-generator",
      "thumbnail-maker",
      "general",
    ]),
  },
  {
    required: ["prompt"],
    additionalProperties: true,
  },
);
const imageUpscalingStyleSchema = s.object(
  'Style settings for the upscale. Use `mode` (`"preserve"`, `"balanced"`, or `"creative"`). Defaults to `"balanced"`.',
  {
    mode: s.stringEnum(
      'The upscaling mode. `"preserve"` uses the fast pro pipeline (1× credit multiplier). `"balanced"` and `"creative"` use the creative pipeline (2× credit multiplier). `"pro"` is deprecated and maps to `"preserve"`. Defaults to `"balanced"`.',
      ["pro", "preserve", "balanced", "creative"],
    ),
    prompt: s.string("A prompt to guide the final image. Only used when mode is `creative`."),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
const createAiClothesChangerInputSchema = s.object(
  "AI Clothes Changer parameters.",
  {
    name: imageNameSchema,
    assets: s.object(
      "Provide the assets for clothes changer",
      {
        person_file_path: assetPathSchema("The image with the person.", true),
        garment_file_path: assetPathSchema("The image of the outfit.", true),
        garment_type: s.stringEnum(
          "Type of clothing item to swap. If not provided, swaps the entire outfit. \n* `upper_body` - for shirts/jackets \n* `lower_body` - for pants/skirts \n* `dresses` - for entire outfit (deprecated, use `entire_outfit` instead) \n* `entire_outfit` - for entire outfit",
          ["entire_outfit", "upper_body", "lower_body", "dresses"],
        ),
      },
      {
        required: ["person_file_path", "garment_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
const createAiFaceEditorInputSchema = s.object(
  "AI Face Editor parameters.",
  {
    name: imageNameSchema,
    assets: s.object(
      "Provide the assets for face editor",
      {
        image_file_path: assetPathSchema("This is the image whose face will be edited.", true),
      },
      {
        required: ["image_file_path"],
        additionalProperties: true,
      },
    ),
    style: faceEditingStyleSchema,
  },
  {
    required: ["assets", "style"],
    additionalProperties: true,
  },
);
const createAiGifGeneratorInputSchema = s.object(
  "AI GIF Generator parameters.",
  {
    name: s.string("Give your gif a custom name for easy identification."),
    style: s.object(
      "Style.",
      {
        prompt: s.string("The prompt used for the GIF.", { minLength: 1, maxLength: 500 }),
      },
      {
        required: ["prompt"],
        additionalProperties: true,
      },
    ),
    output_format: s.stringEnum("The output file format for the generated animation.", ["gif", "mp4", "webm"]),
  },
  {
    required: ["style"],
    additionalProperties: true,
  },
);
const createAiImageEditorInputSchema = s.object(
  "AI Image Editor parameters.",
  {
    name: imageNameSchema,
    image_count: s.withEnum(
      s.number("Number of images to generate. Maximum varies by model. Defaults to 1 if not specified."),
      [1, 4, 9, 16],
    ),
    model: imageEditingModelSchema,
    aspect_ratio: s.stringEnum("The aspect ratio of the output image(s). If not specified, defaults to `auto`.", [
      "auto",
      "16:9",
      "9:16",
      "4:3",
      "3:2",
      "1:1",
      "4:5",
      "2:3",
    ]),
    resolution: imageEditingResolutionSchema,
    style: s.object(
      "Style.",
      {
        prompt: s.string("The prompt used to edit the image.", { minLength: 1, maxLength: 15000 }),
      },
      {
        required: ["prompt"],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for image edit",
      {
        image_file_paths: s.array(
          "The image(s) used in the edit, maximum of 10 images. This value is either\n- a direct URL to the video file\n- `file_path` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n",
          s.string("Image file paths item.", { minLength: 1 }),
          { maxItems: 10 },
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["style", "assets"],
    additionalProperties: true,
  },
);
const createAiHeadshotGeneratorInputSchema = s.object(
  "AI Headshot Generator parameters.",
  {
    name: imageNameSchema,
    style: s.object(
      "Style.",
      {
        prompt: s.string(
          "Prompt used to guide the style of your headshot. We recommend omitting the prompt unless you want to customize your headshot. You can visit [AI headshot generator](https://magichour.ai/create/ai-headshot-generator) to view an example of a good prompt used for our 'Professional' style.",
        ),
      },
      {
        required: [],
        additionalProperties: true,
      },
    ),
    assets: s.object(
      "Provide the assets for headshot photo",
      {
        image_file_path: assetPathSchema(
          "The image used to generate the headshot. This image must contain one detectable face.",
          true,
        ),
      },
      {
        required: ["image_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
const createAiImageGeneratorInputSchema = s.object(
  "AI Image Generator parameters.",
  {
    name: imageNameSchema,
    image_count: s.integer("Number of images to generate. Maximum varies by model.", {
      minimum: 1,
      maximum: 16,
    }),
    model: imageGenerationModelSchema,
    aspect_ratio: s.stringEnum(
      "The aspect ratio of the output image(s). If not specified, defaults to `1:1` (square).",
      ["1:1", "16:9", "9:16"],
    ),
    resolution: imageGenerationResolutionSchema,
    style: imageGenerationStyleSchema,
  },
  {
    required: ["image_count", "style"],
    additionalProperties: true,
  },
);
const createAiImageUpscalerInputSchema = s.object(
  "AI Image Upscaler parameters.",
  {
    name: imageNameSchema,
    scale_factor: s.number(
      "How much to scale the image. Must be either 2 or 4.\n            \nNote: 4x upscale is only available on Creator, Pro, or Business tier.",
    ),
    style: imageUpscalingStyleSchema,
    assets: s.object(
      "Provide the assets for upscaling",
      {
        image_file_path: s.string(
          "The image to upscale. This value is either\n- a direct URL to the video file\n- `file_path` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n. The maximum input image size is 4096x4096px.",
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
    required: ["scale_factor", "assets"],
    additionalProperties: true,
  },
);
const createAiMemeGeneratorInputSchema = s.object(
  "AI Meme Generator parameters.",
  {
    name: s.string("The name of the meme."),
    style: memeStyleSchema,
  },
  {
    required: ["style"],
    additionalProperties: true,
  },
);
const createAiQrCodeGeneratorInputSchema = s.object(
  "AI QR Code Generator parameters.",
  {
    name: imageNameSchema,
    content: s.string("The content of the QR code."),
    style: s.object(
      "Style.",
      {
        art_style: s.string(
          "To use our templates, pass in one of Watercolor, Cyberpunk City, Ink Landscape, Interior Painting, Japanese Street, Mech, Minecraft, Picasso Painting, Game Map, Spaceship, Chinese Painting, Winter Village, or pass any custom art style.",
        ),
      },
      {
        required: ["art_style"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["content", "style"],
    additionalProperties: true,
  },
);
const createBodySwapInputSchema = s.object(
  "Body Swap parameters.",
  {
    name: imageNameSchema,
    resolution: s.stringEnum("Output resolution. Determines credits charged for the run.", ["640px", "1k", "2k", "4k"]),
    assets: s.object(
      "Person image and scene image for body swap",
      {
        person_file_path: assetPathSchema("Image of the person to place into the scene.", true),
        scene_file_path: assetPathSchema("Original scene image (background).", true),
      },
      {
        required: ["person_file_path", "scene_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["resolution", "assets"],
    additionalProperties: true,
  },
);
const createFaceSwapPhotoInputSchema = s.object(
  "Face Swap Photo parameters.",
  {
    name: imageNameSchema,
    assets: s.object(
      "Provide the assets for face swap photo",
      {
        face_swap_mode: s.stringEnum(
          "Choose how to swap faces:\n- **all-faces** (recommended) — swap all detected faces using one source image (`source_file_path` required)\n- **individual-faces** — specify exact mappings using `face_mappings`",
          ["all-faces", "individual-faces"],
        ),
        source_file_path: s.string(
          "This is the image from which the face is extracted. The value is required if `face_swap_mode` is `all-faces`.\n\nThis value is either\n- a direct URL to the video file\n- `file_path` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n",
          { minLength: 1 },
        ),
        face_mappings: faceMappingsSchema,
        target_file_path: assetPathSchema(
          "This is the image where the face from the source image will be placed.",
          true,
        ),
      },
      {
        required: ["target_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
const createHeadSwapInputSchema = s.object(
  "Head Swap parameters.",
  {
    name: imageNameSchema,
    max_resolution: s.integer(
      "Constrains the larger dimension (height or width) of the output. Omit to use the maximum allowed for your plan (capped at 2048px). Values above your plan maximum are clamped down to your plan's maximum.",
    ),
    assets: s.object(
      "Provide the body and head images for head swap",
      {
        body_file_path: assetPathSchema("Image that receives the swapped head.", true),
        head_file_path: assetPathSchema("Image of the head to place on the body.", true),
      },
      {
        required: ["body_file_path", "head_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
const createImageBackgroundRemoverInputSchema = s.object(
  "Image Background Remover parameters.",
  {
    name: imageNameSchema,
    assets: s.object(
      "Provide the assets for background removal",
      {
        image_file_path: assetPathSchema("The image to remove the background."),
        background_image_file_path: s.string(
          "The image used as the new background for the image_file_path. This image will be resized to match the image in image_file_path. Please make sure the resolution between the images are similar.\n\nThis value is either\n- a direct URL to the video file\n- `file_path` field from the response of the [upload urls API](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls).\n\nSee the [file upload guide](https://docs.magichour.ai/api-reference/files/generate-asset-upload-urls#input-file) for details.\n",
        ),
      },
      {
        required: ["image_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
const createPhotoColorizerInputSchema = s.object(
  "Photo Colorizer parameters.",
  {
    name: imageNameSchema,
    assets: s.object(
      "Provide the assets for photo colorization",
      {
        image_file_path: assetPathSchema("The image used to generate the colorized image.", true),
      },
      {
        required: ["image_file_path"],
        additionalProperties: true,
      },
    ),
  },
  {
    required: ["assets"],
    additionalProperties: true,
  },
);
export const imageInputSchemas: Record<string, JsonSchema> = {
  create_ai_clothes_changer: createAiClothesChangerInputSchema,
  create_ai_face_editor: createAiFaceEditorInputSchema,
  create_ai_gif_generator: createAiGifGeneratorInputSchema,
  create_ai_image_editor: createAiImageEditorInputSchema,
  create_ai_headshot_generator: createAiHeadshotGeneratorInputSchema,
  create_ai_image_generator: createAiImageGeneratorInputSchema,
  create_ai_image_upscaler: createAiImageUpscalerInputSchema,
  create_ai_meme_generator: createAiMemeGeneratorInputSchema,
  create_ai_qr_code_generator: createAiQrCodeGeneratorInputSchema,
  create_body_swap: createBodySwapInputSchema,
  create_face_swap_photo: createFaceSwapPhotoInputSchema,
  create_head_swap: createHeadSwapInputSchema,
  create_image_background_remover: createImageBackgroundRemoverInputSchema,
  create_photo_colorizer: createPhotoColorizerInputSchema,
};
