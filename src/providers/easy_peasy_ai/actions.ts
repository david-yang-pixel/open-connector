import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const presetProperties = {
  slug: s.string("Unique preset identifier."),
  title: s.string("Human-readable preset name."),
  description: s.string("Short description of what the preset does."),
  category: s.anyOf("Category or categories the preset belongs to.", [
    s.string("A preset category."),
    s.array("Preset categories.", s.string("A preset category.")),
  ]),
  isFree: s.boolean("Whether this preset is available on the free plan."),
};
const preset = s.looseRequiredObject("A text generation preset.", presetProperties, {
  optional: ["description", "category", "isFree"],
});

export const easyPeasyAiActions: ActionDefinition[] = [
  defineProviderAction("easy_peasy_ai", {
    name: "list_presets",
    operationType: "read",
    description: "List Easy-Peasy.AI text generation presets, optionally filtered by category.",
    requiredScopes: [],
    inputSchema: s.object(
      "Filters for discovering text generation presets.",
      {
        category: s.stringEnum("Filter presets by category.", [
          "Social Media",
          "Content",
          "Business",
          "HR",
          "Marketing",
          "Resume",
          "Education",
          "Project Management",
          "Tools",
          "Other",
        ]),
      },
      { optional: ["category"] },
    ),
    outputSchema: s.looseRequiredObject("Available text generation presets.", {
      presets: s.array("List of available presets.", preset),
      total: s.integer("Total number of presets returned."),
      categories: s.array("All available preset categories.", s.string("A preset category.")),
    }),
  }),
  defineProviderAction("easy_peasy_ai", {
    name: "get_preset",
    operationType: "read",
    description: "Get an Easy-Peasy.AI preset's input fields and current constraints before generating text.",
    requiredScopes: [],
    inputSchema: s.requiredObject("The preset to inspect.", {
      slug: s.string("The preset slug, such as custom-generator or paragraph-writer.", {
        minLength: 1,
      }),
    }),
    outputSchema: s.looseRequiredObject(
      "The preset configuration and input requirements.",
      {
        ...presetProperties,
        fields: s.array(
          "Input fields to pass to generate_text, including template-specific constraints.",
          s.looseRequiredObject(
            "A preset input field and its constraints.",
            {
              name: s.string("The request body field name."),
              label: s.string("Human-readable field label."),
              type: s.string("Input control type."),
              required: s.boolean("Whether the preset requires this field."),
              placeholder: s.string("An example value or input hint."),
              maxLength: s.integer("Maximum text length for this field."),
              radioOptions: s.array(
                "Choices for a radio input.",
                s.looseRequiredObject(
                  "A radio choice.",
                  {
                    value: s.string("The value to send."),
                    default: s.boolean("Whether this choice is the default."),
                  },
                  { optional: ["default"] },
                ),
              ),
            },
            { optional: ["label", "type", "required", "placeholder", "maxLength", "radioOptions"] },
          ),
        ),
      },
      { optional: ["description", "category", "isFree"] },
    ),
  }),
  defineProviderAction("easy_peasy_ai", {
    name: "generate_text",
    operationType: "write",
    description:
      "Generate text with an Easy-Peasy.AI preset. Use get_preset first for template-specific fields and constraints; generation consumes word credits.",
    requiredScopes: [],
    inputSchema: s.object(
      "Text generation parameters; field meanings and length limits depend on the preset.",
      {
        preset: s.string("The template slug to use for generation.", { minLength: 1 }),
        keywords: s.string("The main input text or topic; may be empty for templates that use other fields."),
        tone: s.string("The desired tone, such as professional, friendly, or funny."),
        length: s.stringEnum("The desired output length.", ["Short", "Medium", "Long"]),
        outputs: s.integer("Number of outputs to generate; defaults to 1."),
        language: s.string("Output language; defaults to English."),
        shouldUseGPT4: s.boolean("Whether to use the advanced AI model; defaults to false."),
        extra1: s.string("Additional context, such as background information, key skills, or a blog introduction."),
        extra2: s.string("Additional context, such as a blog title or reply sentiment."),
        extra3: s.string("Additional context, such as a job title."),
        extra4: s.string("Additional context, such as recommendation details."),
        suffix: s.string("End section text for the Fill the Gaps template."),
      },
      {
        optional: [
          "tone",
          "length",
          "outputs",
          "language",
          "shouldUseGPT4",
          "extra1",
          "extra2",
          "extra3",
          "extra4",
          "suffix",
        ],
      },
    ),
    outputSchema: s.requiredObject("Generated text outputs.", {
      outputs: s.array(
        "The generated outputs returned by Easy-Peasy.AI.",
        s.looseRequiredObject("A generated text output.", {
          id: s.integer("The generated output ID."),
          name: s.string("The generated text."),
        }),
      ),
    }),
  }),
];
