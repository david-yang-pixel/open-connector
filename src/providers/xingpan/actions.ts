import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { xingpanZodiacSigns } from "./constants.ts";

const service = "xingpan";
function localDateTimeSchema(description: string) {
  return s.string(description, { pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}(:\\d{2})?$" });
}
const locationProperties = {
  longitude: s.number("Birthplace longitude in degrees, positive east and negative west.", {
    minimum: -180,
    maximum: 180,
  }),
  latitude: s.number("Birthplace latitude in degrees, positive north and negative south.", {
    minimum: -90,
    maximum: 90,
  }),
  timezone: s.number(
    "UTC offset in hours at this local date and time, including historical daylight saving time. Omit to look it up from Xingpan; an explicit value, including 0, is preserved.",
    {
      minimum: -14,
      maximum: 14,
    },
  ),
};
const birthSchema = s.object(
  "Birth details in local civil time at the birthplace.",
  {
    birthday: localDateTimeSchema("Local birth date and time in YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss format."),
    ...locationProperties,
  },
  { optional: ["timezone"] },
);
const chartOptions = {
  planets: s.withDefault(
    s.array(
      "Planet IDs from get_chart_config; defaults to the Sun, Moon, and eight other major planets (0 through 9).",
      s.nonEmptyString("A Xingpan planet ID, such as 0 for the Sun or D for Chiron."),
      { minItems: 1, uniqueItems: true },
    ),
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ),
  asteroids: s.array(
    "Additional asteroid IDs from get_chart_config, such as xs433 for Eros.",
    s.nonEmptyString("A Xingpan asteroid ID."),
    { uniqueItems: true },
  ),
  virtualPoints: s.array(
    "Virtual point IDs from get_chart_config, such as 10 for the Ascendant.",
    s.nonEmptyString("A Xingpan virtual point ID."),
    { uniqueItems: true },
  ),
  houseSystem: s.nonEmptyString(
    "House system code; defaults to K (Koch). Other systems include P (Placidus) and W (Whole sign).",
    {
      default: "K",
    },
  ),
  chartStyle: s.withDefault(
    s.stringEnum("SVG chart style. Defaults to none for data-only output; basic or advanced includes the chart SVG.", [
      "none",
      "basic",
      "advanced",
    ]),
    "none",
  ),
  aspectOrbs: s.record(
    'Aspect angle to allowed orb in degrees, for example {"90":2}. Omit to use upstream defaults.',
    s.number("Allowed orb in degrees for this aspect angle.", { minimum: 0 }),
  ),
};
const optionalChartOptions = ["planets", "asteroids", "virtualPoints", "houseSystem", "chartStyle", "aspectOrbs"];
const chartOutput = s.object(
  "Calculated Xingpan chart data.",
  {
    chart: s.looseObject(
      "Complete upstream chart data with access tokens removed. Native fields include planet, house, sign, attribute, optional svg, and planet_second for comparison or transit charts; return charts may include return_time or user.turn_date.",
    ),
  },
  { optional: [] },
);

const getChartConfig = defineProviderAction(service, {
  name: "get_chart_config",

  description: "Get Xingpan planet, asteroid, fixed star, virtual point, zodiac, and house configuration.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object("Input for fetching Xingpan chart configuration.", {}, { optional: [] }),
  outputSchema: s.object(
    "Xingpan chart configuration.",
    {
      config: s.looseObject(
        "Upstream configuration maps and lists, including planets, virtual, planet_xs, planet_xf, planetEnglish, planetChinese, and zodiac names.",
      ),
    },
    { optional: [] },
  ),
});
const calculateNatalChart = defineProviderAction(service, {
  name: "calculate_natal_chart",

  description:
    "Calculate a personal natal chart from birth time and location, with optional SVG, interpretation corpus, and aspect patterns.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "Input for calculating a personal natal chart.",
    {
      birth: birthSchema,
      ...chartOptions,
      fixedStars: s.array(
        "Fixed star names from get_chart_config, such as Regulus or Spica.",
        s.nonEmptyString("A Xingpan fixed star name."),
        { uniqueItems: true },
      ),
      includeCorpus: s.boolean({
        description: "Whether to request the upstream chart interpretation corpus.",
        default: false,
      }),
      includeAspectPatterns: s.boolean({
        description: "Whether to calculate geometric aspect patterns such as Grand Trine and T-Square.",
        default: false,
      }),
    },
    { optional: [...optionalChartOptions, "fixedStars", "includeCorpus", "includeAspectPatterns"] },
  ),
  outputSchema: chartOutput,
});
const relationshipInput = s.object(
  "Input for calculating a chart for exactly two people.",
  {
    people: s.array(
      "The two people's birth details in the requested order; their order affects comparison charts.",
      birthSchema,
      { minItems: 2, maxItems: 2 },
    ),
    ...chartOptions,
  },
  { optional: optionalChartOptions },
);
const calculateComparisonChart = defineProviderAction(service, {
  name: "calculate_comparison_chart",

  description:
    "Calculate a comparison chart for two people, including both planetary sets and their relationship to the houses.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: relationshipInput,
  outputSchema: chartOutput,
});
const calculateCompositeChart = defineProviderAction(service, {
  name: "calculate_composite_chart",

  description: "Calculate a composite midpoint relationship chart for two people.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: relationshipInput,
  outputSchema: chartOutput,
});
const calculateSynastryChart = defineProviderAction(service, {
  name: "calculate_synastry_chart",

  description: "Calculate Xingpan's pairing (synastry) chart for two people.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: relationshipInput,
  outputSchema: chartOutput,
});
const calculateTransitChart = defineProviderAction(service, {
  name: "calculate_transit_chart",

  description:
    "Calculate a transit chart against a natal chart for a specified local date and time at the birthplace, accounting for date-specific UTC offsets.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "Input for calculating a transit chart at the birthplace.",
    {
      birth: birthSchema,
      transitDateTime: localDateTimeSchema(
        "Transit date and time in the birthplace's local civil time, in YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss format.",
      ),
      transitTimezone: s.number(
        "UTC offset in hours at the transit date and time. Omit for an independent historical timezone lookup; this need not equal the birth timezone.",
        { minimum: -14, maximum: 14 },
      ),
      ...chartOptions,
    },
    { optional: [...optionalChartOptions, "transitTimezone"] },
  ),
  outputSchema: chartOutput,
});
const returnReferenceSchema = s.object(
  "Reference time and location for the return calculation; distinct from the birth details.",
  {
    dateTime: localDateTimeSchema(
      "Local reference date and time used by Xingpan to select the return calculation, in YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss format. The actual return instant is computed upstream.",
    ),
    longitude: s.number("Return location longitude in degrees, positive east and negative west.", {
      minimum: -180,
      maximum: 180,
    }),
    latitude: s.number("Return location latitude in degrees, positive north and negative south.", {
      minimum: -90,
      maximum: 90,
    }),
    timezone: locationProperties.timezone,
  },
  { optional: ["timezone"] },
);
const returnInput = s.object(
  "Input for calculating a solar or lunar return chart.",
  {
    birth: birthSchema,
    returnReference: returnReferenceSchema,
    ...chartOptions,
  },
  { optional: optionalChartOptions },
);
const calculateSolarReturnChart = defineProviderAction(service, {
  name: "calculate_solar_return_chart",

  description:
    "Calculate a solar return chart from birth details and a reference date, time, and location. In verified upstream probes, changing the reference location did not change the birth-location houses; relocated solar returns remain unverified.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: returnInput,
  outputSchema: chartOutput,
});
const calculateLunarReturnChart = defineProviderAction(service, {
  name: "calculate_lunar_return_chart",

  description: "Calculate a lunar return chart from birth details and a reference date, time, and return location.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: returnInput,
  outputSchema: chartOutput,
});
const getDailyHoroscope = defineProviderAction(service, {
  name: "get_daily_horoscope",

  description:
    "Get daily zodiac horoscopes for one sign or all twelve signs, including overall, love, career, health, scores, and lucky items.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: s.object(
    "Input for fetching daily zodiac horoscopes; birth details are not needed.",
    {
      date: s.date("Requested date in YYYY-MM-DD format. Omit to use the provider's current day."),
      sign: s.stringEnum("Zodiac sign to query. Omit to return all twelve signs.", xingpanZodiacSigns),
    },
    { optional: ["date", "sign"] },
  ),
  outputSchema: s.object(
    "Daily zodiac horoscopes normalized to a list for both single-sign and all-sign requests.",
    {
      horoscopes: s.array(
        "The requested zodiac horoscopes.",
        s.looseObject(
          "One upstream horoscope, including sign, date, overall, love, career, health, score fields, and lucky items; new upstream fields are preserved.",
        ),
      ),
    },
    { optional: [] },
  ),
});
export const xingpanActions: ActionDefinition[] = [
  getChartConfig,
  calculateNatalChart,
  calculateComparisonChart,
  calculateCompositeChart,
  calculateSynastryChart,
  calculateTransitChart,
  calculateSolarReturnChart,
  calculateLunarReturnChart,
  getDailyHoroscope,
];
