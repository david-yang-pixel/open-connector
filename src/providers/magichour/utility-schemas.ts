import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { assetPathSchema } from "./shared-schemas.ts";
export const accountInputSchema: JsonSchema = s.object(
  "Get account details parameters.",
  {},
  {
    required: [],
    additionalProperties: true,
  },
);
export const accountOutputSchema: JsonSchema = s.object(
  "Magic Hour response.",
  {
    id: s.string("Unique ID of the account that owns the API key."),
    email: s.nullable(s.string("Email address of the account.")),
    tier: s.stringEnum(
      "Subscription tier in effect for the account. `free` if there is no active subscription, including while a subscription is `past_due`.",
      ["free", "creator", "pro", "business"],
    ),
    credits: s.integer(
      "Credits currently available to spend. Includes subscription credits and any purchased credit packs.",
      { minimum: 0 },
    ),
    subscription: s.nullable(
      s.object(
        "Details of the account's subscription plan. `null` if the account has no subscription, e.g. a free account, an account that only purchased credit packs, or an account on usage-based API pricing.\n\nReflects the plan currently configured on the subscription. If a plan change is scheduled, `tier` stays on the current plan until the next payment succeeds, so `tier` and `name` can briefly disagree.",
        {
          name: s.nullable(
            s.string(
              "Name of the current subscription plan, e.g. `Creator`, `Pro`, `Pro Plus`, `Business`. `null` if the plan cannot be determined. Use `tier` for a machine-readable value.",
            ),
          ),
          status: s.stringEnum(
            "Status of the subscription.\n- `active`: payments are up to date.\n- `past_due`: the latest payment failed. `tier` is `free` until payment succeeds. The subscription is canceled if payment keeps failing.",
            ["active", "past_due"],
          ),
          price: s.object(
            "Price.",
            {
              amount: s.integer(
                "Price charged per billing interval, in the smallest unit of the currency (e.g. 4900 is $49.00 for `usd`). Discounts are not applied.",
                { minimum: 0 },
              ),
              currency: s.string("Three-letter ISO 4217 currency code, lowercase."),
            },
            {
              required: ["amount", "currency"],
              additionalProperties: true,
            },
          ),
          discount: s.nullable(
            s.object(
              "Discount applied to the subscription. `null` if no discount is applied.",
              {
                percent_off: s.nullable(
                  s.number(
                    "Percentage taken off `price.amount` each billing interval. `null` if the discount is a fixed amount.",
                  ),
                ),
                amount_off: s.nullable(
                  s.integer(
                    "Fixed amount taken off `price.amount` each billing interval, in the smallest unit of the currency. `null` if the discount is a percentage.",
                  ),
                ),
              },
              {
                required: ["percent_off", "amount_off"],
                additionalProperties: true,
              },
            ),
          ),
          billing_interval: s.nullable(
            s.stringEnum("How often the subscription is billed. `null` if unknown.", ["month", "year"]),
          ),
          current_period_end: s.nullable(
            s.string(
              "End of the current billing period, in ISO 8601 format. The subscription renews at this time, or ends if `cancel_at_period_end` is `true`.",
              { format: "date-time" },
            ),
          ),
          cancel_at_period_end: s.boolean(
            "Whether the subscription is scheduled to end at `current_period_end` instead of renewing. The subscription stays usable until then.",
          ),
        },
        {
          required: [
            "name",
            "status",
            "price",
            "discount",
            "billing_interval",
            "current_period_end",
            "cancel_at_period_end",
          ],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["id", "email", "tier", "credits", "subscription"],
    additionalProperties: true,
  },
);
export const savedItemsInputSchema: JsonSchema = s.object(
  "List saved items parameters.",
  {
    type: s.stringEnum("Only return saved items of this type.", [
      "character",
      "reference",
      "voice",
      "moodboard",
      "brand_kit",
    ]),
    limit: s.integer("Maximum number of saved items to return. Defaults to 20.", {
      minimum: 1,
      maximum: 100,
    }),
    cursor: s.string("Opaque pagination cursor from the previous response's next_cursor.", {
      minLength: 1,
    }),
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const savedItemsOutputSchema: JsonSchema = s.object(
  "Magic Hour response.",
  {
    items: s.array(
      "Items.",
      s.object(
        "Items item.",
        {
          id: s.string("Unique ID of the saved item."),
          type: s.stringEnum("Saved item type.", ["character", "reference", "voice", "moodboard", "brand_kit"]),
          name: s.nullable(s.string("User-provided name of the saved item.")),
          assets: s.array(
            "Assets.",
            s.object(
              "Assets item.",
              {
                file_path: s.string(
                  "Durable asset path. Pass it to a compatible API asset field without uploading it again.",
                ),
                media_kind: s.stringEnum("Media type of the asset.", ["IMAGE", "VIDEO", "AUDIO"]),
                is_primary: s.boolean("Whether this asset is the saved item's primary asset."),
                url: s.string("Signed URL for previewing or downloading the asset. Expires after 24 hours.", {
                  format: "uri",
                }),
                url_expires_at: s.string("When the signed URL expires. The saved asset and file_path do not expire.", {
                  format: "date-time",
                }),
              },
              {
                required: ["file_path", "media_kind", "is_primary", "url", "url_expires_at"],
                additionalProperties: true,
              },
            ),
          ),
        },
        {
          required: ["id", "type", "name", "assets"],
          additionalProperties: true,
        },
      ),
    ),
    next_cursor: s.nullable(s.string("Cursor for the next page, or null when there are no more saved items.")),
  },
  {
    required: ["items", "next_cursor"],
    additionalProperties: true,
  },
);
export const faceDetectionResultInputSchema: JsonSchema = s.object(
  "Get face detection details parameters.",
  {
    id: s.string(
      "The id of the task. This value is returned by the [face detection API](https://docs.magichour.ai/api-reference/files/face-detection#response-id).",
    ),
  },
  {
    required: ["id"],
    additionalProperties: true,
  },
);
export const faceDetectionResultOutputSchema: JsonSchema = s.object(
  "Magic Hour response.",
  {
    id: s.string(
      "The id of the task. This value is returned by the [face detection API](https://docs.magichour.ai/api-reference/files/face-detection#response-id).",
    ),
    credits_charged: s.integer("The credits charged for the task."),
    status: s.stringEnum("The status of the detection.", ["queued", "rendering", "complete", "error"]),
    faces: s.array(
      "The faces detected in the image or video. The list is populated as faces are detected.",
      s.object(
        "Faces item.",
        {
          path: s.string(
            "The path to the face image. This should be used in face swap photo/video API calls as `.assets.face_mappings.original_face`",
          ),
          url: s.string("The url to the face image. This is used to render the image in your applications."),
        },
        {
          required: ["path", "url"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["id", "credits_charged", "status", "faces"],
    additionalProperties: true,
  },
);
export const faceDetectionInputSchema: JsonSchema = s.object(
  "Face Detection parameters.",
  {
    confidence_score: s.withEnum(
      s.number(
        "Confidence threshold for filtering detected faces. \n* Higher values (e.g., 0.9) include only faces detected with high certainty, reducing false positives. \n* Lower values (e.g., 0.3) include more faces, but may increase the chance of incorrect detections.",
        { minimum: 0, maximum: 1 },
      ),
      [
        0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
        1.0,
      ],
    ),
    assets: s.object(
      "Provide the assets for face detection",
      {
        target_file_path: assetPathSchema("This is the image or video where the face will be detected."),
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
export const faceDetectionOutputSchema: JsonSchema = s.object(
  "Magic Hour response.",
  {
    id: s.string(
      "The id of the task. Use this value in the [get face detection details API](https://docs.magichour.ai/api-reference/files/get-face-detection-details) to get the details of the face detection task.",
    ),
    credits_charged: s.integer("The credits charged for the task."),
  },
  {
    required: ["id", "credits_charged"],
    additionalProperties: true,
  },
);
export const uploadAssetInputSchema: JsonSchema = s.object(
  "Asset upload parameters.",
  {
    fileUrl: s.string("Public URL of the source file, at most 20 MiB. Downloaded by Connector.", {
      format: "uri",
    }),
    type: s.stringEnum("Asset media type.", ["image", "video", "audio"]),
    extension: s.string("File extension without a leading dot, such as png, mp4 or mp3.", {
      pattern: "^[a-z0-9]+$",
    }),
  },
  { required: ["fileUrl", "type", "extension"] },
);
export const uploadAssetOutputSchema: JsonSchema = s.object(
  "Uploaded asset reference.",
  { file_path: s.string("Reusable Magic Hour asset path for compatible generation inputs.") },
  {
    required: ["file_path"],
    additionalProperties: true,
  },
);
