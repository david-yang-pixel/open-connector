import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { numerologyProfiles } from "./constants.ts";

const nameValue = s.nonWhitespaceString("Nonblank full name, at most 200 characters.", {
  maxLength: 200,
});
const date = s.string("Gregorian date in YYYY-MM-DD format.", { format: "date" });
const subjectSchema = s.object(
  "Numerology subject. Required birth dates and names depend on the selected system.",
  {
    birthDate: date,
    name: s.requireAnyProperty(
      s.object(
        "Birth and/or current names with explicit script and transliteration when needed.",
        {
          birth: nameValue,
          current: nameValue,
          script: s.string(
            "ISO 15924 script code such as Latn or Hebr. Kabbalah can infer Hebr from unambiguous Hebrew names.",
            { pattern: "^[A-Z][a-z]{3}$" },
          ),
          transliteration: s.requireAnyProperty(
            s.object(
              "Caller-supplied Latin transliteration. Pythagorean and Chaldean use supplied values even for Latin input; Ank ignores them for Latn.",
              {
                profile: s.nonWhitespaceString("Caller-supplied transliteration profile identifier.", {
                  maxLength: 100,
                }),
                birth: nameValue,
                current: nameValue,
              },
              { required: ["profile"] },
            ),
            ["birth", "current"],
          ),
        },
        { required: [] },
      ),
      ["birth", "current"],
    ),
    calendar: s.stringEnum("Calendar identifier. Currently only gregory is supported.", ["gregory"]),
    locale: s.stringEnum(
      "Subject locale. Interpretations for Pythagorean, Chaldean, and Kabbalah require exact en; Hindi localizes Ank labels.",
      ["en", "en-IN", "hi", "hi-IN"],
    ),
    timezone: s.nonWhitespaceString(
      "Pythagorean cycle timezone: an IANA name or AUTO. Required when referenceDate is omitted.",
    ),
    city: s.nonWhitespaceString("City for AUTO timezone resolution when no reference date is provided.", {
      maxLength: 200,
    }),
    latitude: s.number("Latitude for AUTO timezone resolution; provide longitude together.", {
      minimum: -90,
      maximum: 90,
    }),
    longitude: s.number("Longitude for AUTO timezone resolution; provide latitude together.", {
      minimum: -180,
      maximum: 180,
    }),
  },
  { required: [] },
);
export const numerologyInputSchema: JsonSchema = {
  ...s.object(
    "Numerology profile input with four method-specific variants.",
    {
      method: s.object(
        "Numerology method and reproducibility settings. Omit profile and policies to use upstream defaults.",
        {
          system: s.stringEnum("Numerology tradition to calculate.", [
            "pythagorean",
            "chaldean",
            "kabbalah",
            "ank_jyotish",
          ]),
          profile: s.stringEnum("Profile alias or canonical versioned profile ID belonging to the selected system.", [
            ...new Set(Object.values(numerologyProfiles).flat()),
          ]),
          masterPolicy: s.stringEnum(
            "Optional compatible master-number policy; normally let the provider derive it from the profile.",
            ["preserve_core_11_22_33", "reduce_all", "not_applicable"],
          ),
          compoundPolicy: s.stringEnum(
            "Evidence depth: compound_and_root or full_trace; Pythagorean also supports root_only.",
            ["root_only", "compound_and_root", "full_trace"],
          ),
          nameSource: s.stringEnum(
            "Choose birth or current for Kabbalah and Ank when both names are present. Chaldean uses its profile instead.",
            ["birth", "current"],
          ),
        },
        { required: ["system"] },
      ),
      subject: subjectSchema,
      dateContext: s.object(
        "Pythagorean personal-cycle date context.",
        {
          referenceDate: s.describe(
            date,
            "Explicit personal-cycle reference date. Otherwise provide a timezone in subject.",
          ),
          yearAnchor: s.stringEnum("Personal-cycle year anchor. Currently only calendar_year is supported.", [
            "calendar_year",
          ]),
        },
        { required: [] },
      ),
      includeInterpretations: s.boolean(
        "Opt in to available versioned content. Defaults to false; unavailable content is reported as a nonfatal warning.",
      ),
    },
    { required: ["method", "subject"] },
  ),
  allOf: [
    {
      if: {
        properties: {
          method: { properties: { system: { enum: ["pythagorean", "ank_jyotish"] } } },
        },
      },
      then: { properties: { subject: { required: ["birthDate"] } } },
    },
    {
      if: {
        properties: {
          method: { properties: { system: { enum: ["chaldean", "kabbalah", "ank_jyotish"] } } },
        },
      },
      then: { properties: { subject: { required: ["name"] } } },
    },
  ],
};
