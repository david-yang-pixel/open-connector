import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { expansionActions } from "./expansion-actions.ts";
import {
  birthSchema,
  baziFields,
  dateFields,
  dateInput,
  defineFreeastroapiAction as action,
  language,
  sex,
  timeFields,
} from "./schemas.ts";

export const freeastroapiActions: ActionDefinition[] = [
  action(
    "calculate_bazi",
    "Calculate a complete BaZi chart with four pillars, Day Master, Ten Gods, luck cycles, and optional professional analysis.",
    birthSchema,
    "chart",
    "Complete BaZi chart returned by FreeAstroAPI, including optional and future fields.",
  ),
  action(
    "calculate_bazi_synastry",
    "Analyze compatibility between two BaZi charts with independent calendar and time settings.",
    s.object(
      "BaZi compatibility input.",
      { personA: birthSchema, personB: birthSchema, language },
      { optional: ["language"] },
    ),
    "compatibility",
    "Complete BaZi compatibility analysis returned by FreeAstroAPI.",
  ),
  action(
    "correct_bazi_time",
    "Convert local civil time to local mean and relative or absolute true solar time.",
    dateInput("Solar time correction input.", {
      ...dateFields,
      timezone: timeFields.timezone,
      language,
    }),
    "correction",
    "Solar time correction details returned by FreeAstroAPI.",
  ),
  action(
    "calculate_bazi_flow",
    "Calculate annual and monthly BaZi flow pillars, interactions, and stars for one prediction year, with optional timezone and solar-time settings.",
    dateInput(
      "Annual and monthly flow input.",
      {
        ...dateFields,
        sex,
        timezone: timeFields.timezone,
        timeStandard: timeFields.timeStandard,
        includePinyin: baziFields.includePinyin,
        targetYear: s.integer("Prediction year. Defaults upstream to the current UTC year when omitted.", {
          minimum: 1,
        }),
        targetYearEnd: s.nullable(
          s.integer(
            "Optional end year. Must equal targetYear when both are supplied; omitted or null uses the prediction year.",
            { minimum: 1 },
          ),
        ),
        mode: s.stringEnum("Response detail level. Defaults to summary.", ["summary", "standard", "debug"]),
        include: s.nullable(
          s.array(
            "Optional whitelist of interactions and stars. Omitted or null includes both.",
            s.stringEnum("One flow feature.", ["interactions", "stars"]),
          ),
        ),
        exclude: s.nullable(
          s.array(
            "Optional flow features to exclude, including baseline_interactions.",
            s.stringEnum("One flow feature to exclude.", ["interactions", "stars", "baseline_interactions"]),
          ),
        ),
        dictionaryResponse: s.boolean("Include the integer-ID dictionary in x_dict. Defaults to false."),
        language,
      },
      ["year", "month", "day"],
    ),
    "flow",
    "Annual and monthly flow data, including any returned x_dict mapping.",
  ),
  action(
    "calculate_bazi_life_curve",
    "Calculate traditional Neijing Jing, Qi, and Shen age trajectories with BaZi luck-cycle adjustments.",
    dateInput("Traditional life curve input.", {
      ...dateFields,
      sex,
      maxAge: s.integer("Final age in the curve. Defaults to 120.", { minimum: 0, maximum: 200 }),
      cultivationFactor: s.number("Traditional cultivation and self-care factor. Defaults to 0.5.", {
        minimum: 0,
        maximum: 1,
      }),
      language,
    }),
    "lifeCurve",
    "Complete traditional life curve and model metadata returned by FreeAstroAPI.",
  ),
  action(
    "analyze_bazi_constitution",
    "Analyze traditional BaZi and TCM constitution tendencies and timing patterns; this is not medical advice, diagnosis, or treatment.",
    dateInput("Traditional constitution analysis input.", {
      ...dateFields,
      sex,
      includeTiming: s.boolean("Include decade and annual timing windows. Defaults to true."),
      timingYearsAhead: s.integer("Number of years ahead to analyze. Defaults to 10."),
      language,
    }),
    "analysis",
    "Complete traditional constitution analysis, including the upstream disclaimer and model transparency fields.",
  ),
  action(
    "get_chinese_calendar",
    "Convert a Gregorian date to the Chinese lunar calendar, zodiac, solar terms, and festivals.",
    s.object(
      "Chinese calendar lookup input.",
      { date: s.string("Gregorian date in YYYY-MM-DD format.", { format: "date" }), language },
      { optional: ["language"] },
    ),
    "calendar",
    "Complete Chinese calendar conversion returned by FreeAstroAPI.",
    false,
  ),
  action(
    "get_current_pillars",
    "Get the four pillars and element balance at the current UTC instant.",
    s.object("Current pillars lookup input.", { language }, { optional: ["language"] }),
    "pillars",
    "Current timestamp, date, pillars, Day Master, and element balance returned by FreeAstroAPI.",
    false,
  ),
  action(
    "get_bazi_dictionary",
    "Get the stable ID mappings for BaZi interactions and symbolic stars.",
    s.object("BaZi dictionary lookup input.", { language }, { optional: ["language"] }),
    "dictionary",
    "Complete BaZi ID dictionary returned by FreeAstroAPI.",
    false,
  ),
  ...expansionActions,
];
