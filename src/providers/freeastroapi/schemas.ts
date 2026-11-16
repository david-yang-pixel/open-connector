import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

export const language: JsonSchema = s.nonEmptyString(
  "Response language. Defaults to en; use zh-CN for Simplified Chinese.",
);
const locationFields = {
  city: s.nullable(s.nonEmptyString("City name for coordinate lookup. Provide a city or both latitude and longitude.")),
  latitude: s.nullable(s.number("Latitude in degrees.", { minimum: -90, maximum: 90 })),
  longitude: s.nullable(s.number("Longitude in degrees.", { minimum: -180, maximum: 180 })),
};
export const dateFields: Record<string, JsonSchema> = {
  year: s.integer("Year of birth or the date to calculate.", { minimum: 1 }),
  month: s.integer("Month number.", { minimum: 1, maximum: 12 }),
  day: s.integer("Day of month.", { minimum: 1, maximum: 31 }),
  hour: s.integer("Local clock hour. Defaults to 12.", { minimum: 0, maximum: 23 }),
  minute: s.integer("Local clock minute. Defaults to 0.", { minimum: 0, maximum: 59 }),
  ...locationFields,
};
export const sex: JsonSchema = s.stringEnum("Sex used for traditional luck-cycle direction rules. Defaults to M.", [
  "M",
  "F",
]);
export const timeFields: Record<string, JsonSchema> = {
  timezone: s.nullable(
    s.nonEmptyString("IANA timezone or AUTO. Defaults to AUTO and resolves historical offsets from the location."),
  ),
  timeStandard: s.stringEnum(
    "Time standard: civil clock time, relative true solar time, or absolute true solar time. Defaults to civil.",
    ["civil", "true_solar", "true_solar_absolute"],
  ),
  calendar: s.stringEnum("Calendar used for the supplied date. Defaults to gregorian.", ["gregorian", "julian"]),
};
export const baziFields: Record<string, JsonSchema> = {
  ...dateFields,
  ...timeFields,
  sex,
  includeTenGods: s.boolean("Include Ten Gods. Defaults to true."),
  includePinyin: s.boolean("Include pinyin. Defaults to true."),
  includeStars: s.boolean("Include symbolic stars. Defaults to true."),
  includeInteractions: s.boolean("Include pillar interactions. Defaults to true."),
  includeProfessional: s.boolean("Include Day Master strength, patterns, and useful elements. Defaults to true."),
  includeDebug: s.boolean("Include calculation debug data. Defaults to true."),
  includeCurrentFlow: s.boolean("Include current annual flow triggers. Defaults to false."),
  language,
};
export function dateInput(
  description: string,
  fields: Record<string, Record<string, unknown>>,
  required: string[] = ["year", "month", "day"],
): JsonSchema {
  return {
    ...s.object(description, fields, { required }),
    anyOf: [
      {
        description: "Resolve the location from a city.",
        required: ["city"],
        properties: { city: s.nonEmptyString("A non-empty city name.", { pattern: "\\S" }) },
      },
      {
        description: "Use explicit geographic coordinates.",
        required: ["latitude", "longitude"],
        properties: {
          latitude: s.number("Explicit latitude."),
          longitude: s.number("Explicit longitude."),
        },
      },
    ],
  };
}
export const birthSchema: JsonSchema = dateInput("Complete birth data and BaZi calculation options.", baziFields);
const idempotencyKey = s.nonEmptyString(
  "Optional idempotency key. Reuse only when retrying the exact same POST request after a network failure.",
);
export function defineFreeastroapiAction(
  name: string,
  description: string,
  inputSchema: Record<string, unknown>,
  outputField: string,
  outputDescription: string,
  post = true,
): ActionDefinition {
  return defineProviderAction("freeastroapi", {
    name,
    description,
    operationType: "read",
    requiredScopes: [],
    inputSchema: post
      ? {
          ...inputSchema,
          properties: {
            ...(inputSchema.properties as Record<string, Record<string, unknown>> as Record<string, unknown>),
            idempotencyKey,
          },
        }
      : inputSchema,
    outputSchema: s.object(
      "The FreeAstroAPI calculation result.",
      {
        [outputField]: s.looseObject(outputDescription),
      },
      { optional: [] },
    ),
  });
}
