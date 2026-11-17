import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "yuanfenju";
const language = s.stringEnum("The result language: simplified or traditional Chinese.", ["zh-cn", "zh-tw"]);
const calendarType = s.withEnum(s.string("The input calendar. Defaults to solar (Gregorian).", { default: "solar" }), [
  "solar",
  "lunar",
]);
const year = s.integer("The input year.");
const month = s.integer("The input month, 1 to 12.", { minimum: 1, maximum: 12 });
const lunarMonth = s.withEnum(
  s.integer("The input month. Negative values represent lunar leap months, such as -6 for leap June."),
  [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
);
const day = s.integer("The input day of month.", { minimum: 1, maximum: 31 });
const hour = s.integer("The local hour, from 0 to 23.", { minimum: 0, maximum: 23 });
const minute = s.integer("The minute. Defaults to 0 when unknown.", {
  minimum: 0,
  maximum: 59,
  default: 0,
});
const notice = s.nullable(s.string("The provider's cultural research and entertainment notice."));
const accountData = s.looseObject("The account information returned by Yuanfenju.", {
  merchant_type: s.string("The account membership type."),
  merchant_email: s.string("The account registration email."),
  merchant_nickname: s.string("The account nickname."),
  merchant_register_time: s.string("The account registration time."),
  merchant_expire_time: s.string("The annual plan expiration time, or -- when not applicable."),
  merchant_remaining_call_times: s.string(
    "The remaining calls for usage-based and free accounts; annual accounts return --.",
  ),
});
const baziInput = s.object(
  "The birth details for a standard Bazi chart.",
  {
    name: s.nonWhitespaceString("The name displayed on the chart."),
    sex: s.stringEnum("The sex used by the provider's traditional chart calculation.", ["male", "female"]),
    calendarType,
    year,
    month: lunarMonth,
    day,
    hour,
    minute,
    sect: s.withEnum(
      s.integer("The late Zi-hour convention: 1 uses the next day's pillar; 2 uses the same day (default).", {
        default: 2,
      }),
      [1, 2],
    ),
    trueSolarTime: s.withEnum(
      s.string(
        "The true solar time mode: none (default), china using province/city, or global using coordinates/timezone.",
        { default: "none" },
      ),
      ["none", "china", "global"],
    ),
    province: s.nonWhitespaceString("The Chinese province required for china true solar time."),
    city: s.nonWhitespaceString(
      "The Chinese city required for china true solar time. Use the official Yuanfenju place names.",
    ),
    longitude: s.number("The longitude required for global true solar time, with at most six decimal places.", {
      minimum: -180,
      maximum: 180,
    }),
    latitude: s.number("The latitude required for global true solar time, with at most six decimal places.", {
      minimum: -90,
      maximum: 90,
    }),
    timezone: s.nonWhitespaceString(
      "The birth location IANA timezone for global true solar time. Defaults to Asia/Shanghai.",
    ),
    language,
  },
  {
    optional: [
      "calendarType",
      "minute",
      "sect",
      "trueSolarTime",
      "province",
      "city",
      "longitude",
      "latitude",
      "timezone",
      "language",
    ],
  },
);
const lunarBirthCondition = {
  if: { properties: { calendarType: { const: "lunar" } }, required: ["calendarType"] },
  then: {
    if: { properties: { month: { maximum: -1 } } },
    then: { properties: { year: { minimum: 1900, maximum: 2100 } } },
  },
  else: { properties: { month: { minimum: 1 } } },
};
baziInput.allOf = [
  {
    if: { properties: { trueSolarTime: { const: "china" } }, required: ["trueSolarTime"] },
    then: { required: ["province", "city"] },
  },
  {
    if: { properties: { trueSolarTime: { const: "global" } }, required: ["trueSolarTime"] },
    then: { required: ["longitude", "latitude"] },
  },
  lunarBirthCondition,
];
const conversionInput = s.object(
  "The date and time to convert between Gregorian and lunar calendars.",
  {
    direction: s.stringEnum("The calendar conversion direction.", ["solar_to_lunar", "lunar_to_solar"]),
    year: s.integer("The year to convert, from 1900 to 2100.", { minimum: 1900, maximum: 2100 }),
    month: lunarMonth,
    day,
    hour: s.integer("The hour to convert. Defaults to 0.", { minimum: 0, maximum: 23, default: 0 }),
    minute,
    second: s.integer("The second to convert. Defaults to 0.", {
      minimum: 0,
      maximum: 59,
      default: 0,
    }),
  },
  { optional: ["hour", "minute", "second"] },
);
conversionInput.allOf = [
  {
    if: { properties: { direction: { const: "solar_to_lunar" } } },
    then: { properties: { month: { minimum: 1 } } },
  },
];
const convertedDate = s.looseObject(
  "The converted lunar and Gregorian date/time fields. Negative lunar_month values indicate leap months.",
  Object.fromEntries(
    ["lunar", "solar"].flatMap((calendar) =>
      ["year", "month", "day", "hour", "minute", "second"].map((part) => [
        `${calendar}_${part}`,
        s.integer(`The ${calendar} ${part} returned by the provider.`),
      ]),
    ),
  ),
);
const multilingualLanguage = s.stringEnum("The result language: simplified Chinese, traditional Chinese or English.", [
  "zh-cn",
  "zh-tw",
  "en-us",
]);
const birthOptionalFields = [
  "calendarType",
  "minute",
  "sect",
  "trueSolarTime",
  "province",
  "city",
  "longitude",
  "latitude",
  "timezone",
  "language",
];
const baziReadingInput = s.object(
  "The birth details and options for an official Bazi interpretation.",
  {
    ...(baziInput.properties as Record<string, Record<string, unknown>>),
    sect: s.withEnum(
      s.integer(
        "The late Zi-hour convention: 1 uses the next day's pillar (default for interpretation); 2 uses the same day.",
        { default: 1 },
      ),
      [1, 2],
    ),
    language: multilingualLanguage,
    adjustInterpretations: s.boolean({
      description:
        "Whether to apply the provider's adjustment factor to reduce repetition in relationship, wealth and life interpretation text. Defaults to false.",
      default: false,
    }),
  },
  { optional: [...birthOptionalFields, "adjustInterpretations"] },
);
baziReadingInput.allOf = baziInput.allOf;
const partnerBirthInput = s.object(
  "One person's birth details for a two-person Bazi analysis.",
  {
    name: (baziInput.properties as Record<string, Record<string, unknown>>).name,
    calendarType,
    year,
    month: lunarMonth,
    day,
    hour,
    minute,
  },
  { optional: ["calendarType", "minute"] },
);
partnerBirthInput.allOf = [lunarBirthCondition];
const natalInput = s.object(
  "The Gregorian birth details and Western astrology chart options. Use the original local time, not true solar time.",
  {
    year,
    month,
    day,
    hour,
    minute,
    sex: (baziInput.properties as Record<string, Record<string, unknown>>).sex,
    longitude: s.number(
      "The birth longitude, at most six decimal places. If omitted, the provider uses Beijing longitude.",
      { minimum: -180, maximum: 180 },
    ),
    latitude: s.number(
      "The birth latitude, at most six decimal places. If omitted, the provider uses Beijing latitude.",
      { minimum: -90, maximum: 90 },
    ),
    timezone: s.nonWhitespaceString(
      "The IANA timezone of the original local birth time. Defaults to Asia/Shanghai; the provider handles historical daylight saving time.",
      { default: "Asia/Shanghai" },
    ),
    houseSystem: s.withEnum(s.string("The house system code. Defaults to P (Placidus).", { default: "P" }), [
      "P",
      "K",
      "O",
      "R",
      "C",
      "A",
      "E",
      "W",
      "T",
      "M",
      "B",
      "X",
      "V",
    ]),
    additionalObjects: s.array(
      "Additional celestial objects: 1 Vertex, 2 Chiron, 3 Ceres, 4 Pallas, 5 Juno, 6 Vesta, 7 Part of Fortune, 8 true Node, 9 mean Lilith, 10 Psyche, 11 Eros, 12 Haumea, 13 Eris, 14 Makemake, 15 mean Node, 16 south Node.",
      s.integer("One additional celestial object ID.", { minimum: 1, maximum: 16 }),
      { uniqueItems: true },
    ),
    orbModel: s.withEnum(
      s.string("The aspect orb model: strict, standard (default), wide or custom.", {
        default: "standard",
      }),
      ["strict", "standard", "wide", "custom"],
    ),
    customOrbs: s.object(
      "Custom aspect orbs in degrees, used only with orbModel=custom. Omitted values use the official defaults.",
      {
        conjunction: s.number("The conjunction orb (0-degree aspect). The official default is 8 degrees."),
        semisextile: s.number("The semisextile orb (30-degree aspect). The official default is 2 degrees."),
        sextile: s.number("The sextile orb (60-degree aspect). The official default is 6 degrees."),
        square: s.number("The square orb (90-degree aspect). The official default is 6 degrees."),
        trine: s.number("The trine orb (120-degree aspect). The official default is 6 degrees."),
        quincunx: s.number("The quincunx orb (150-degree aspect). The official default is 3 degrees."),
        opposition: s.number("The opposition orb (180-degree aspect). The official default is 8 degrees."),
      },
      {
        optional: ["conjunction", "semisextile", "sextile", "square", "trine", "quincunx", "opposition"],
      },
    ),
    language: multilingualLanguage,
  },
  {
    optional: [
      "minute",
      "longitude",
      "latitude",
      "timezone",
      "houseSystem",
      "additionalObjects",
      "orbModel",
      "customOrbs",
      "language",
    ],
  },
);
natalInput.allOf = [
  {
    if: { required: ["customOrbs"] },
    then: { properties: { orbModel: { const: "custom" } }, required: ["orbModel"] },
  },
];
const card = s.looseObject("A drawn tarot card with its position, orientation, interpretation and image.", {
  positions_index: s.integer("The card position index, starting at 1."),
  positions_name: s.string("The card position name."),
  positions_desc: s.string("The meaning of this position in the spread."),
  orientation_code: s.integer("The card orientation: 1 upright or 0 reversed."),
  orientation_text: s.string("The card orientation display text."),
  card_no: s.integer("The tarot card number, from 1 to 78."),
  card_name: s.string("The tarot card name."),
  card_keywords: s.string("The card keywords."),
  card_astrology: s.string("The card's astrological association."),
  card_element: s.string("The card's elemental association."),
  card_description: s.string("The card illustration description."),
  card_interpretation: s.looseObject("The card's general meaning, topic interpretation and advice.", {
    general: s.string("The general card interpretation."),
    topic: s.string("The interpretation for the selected topic."),
    advice: s.string("The entertainment interpretation advice."),
  }),
  image_id: s.integer("The card image resource index."),
  image_url: s.string("The card image URL."),
});
export const yuanfenjuActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_annual_usage",
    description:
      "Get the current 24-hour cycle's used call count and reset timing for a Yuanfenju annual-plan account. This free query is only available to annual members.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object("The input for querying annual-plan call usage.", {}, { optional: [] }),
    outputSchema: s.object(
      "The annual-plan usage query result.",
      {
        usage: s.looseObject("The annual-plan call count and reset information returned by Yuanfenju.", {
          call_times: {
            description: "The calls already used in the current 24-hour cycle.",
            type: ["string", "integer"],
          },
          expire_time: s.integer(
            "The seconds remaining until the cycle resets. The countdown starts on the first API call.",
          ),
          expire_time_message: s.string("The human-readable remaining-time message."),
          reset_time: s.string("The estimated quota reset timestamp."),
          reset_time_message: s.string("The human-readable quota reset message."),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "interpret_bazi",
    description:
      "Get Yuanfenju's official Bazi interpretation for cultural research and entertainment, including five-element, relationship, wealth and life interpretation text. Lunar dates in 1900-2100 are converted first using an additional call; other non-leap lunar dates use native input.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: baziReadingInput,
    outputSchema: s.object(
      "The official Bazi interpretation result.",
      {
        reading: s.looseObject("The full official Bazi interpretation, including all provider-defined sections.", {
          base_info: s.looseObject("The interpreted chart's birth details and basic information."),
          bazi_info: s.looseObject("The four-pillar chart information accompanying the interpretation."),
          wuxing: s.looseObject("The official five-element interpretation."),
          yinyuan: s.looseObject("The official relationship interpretation for entertainment."),
          caiyun: s.looseObject("The official wealth interpretation for entertainment."),
          mingyun: s.looseObject("The official life interpretation for entertainment."),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "analyze_bazi_compatibility",
    description:
      "Analyze two people's Bazi charts for relationship or marriage entertainment using the official matching interface selected by the caller. Marriage uses firstPerson as the male partner and secondPerson as the female partner. Each lunar date in 1900-2100 adds a conversion call; other non-leap lunar dates use native input.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The two people and scoring options for Bazi compatibility.",
      {
        scenario: s.withEnum(
          s.string(
            "The matching scenario: relationship for general matching or marriage for the traditional male/female marriage interface. Defaults to relationship.",
            { default: "relationship" },
          ),
          ["relationship", "marriage"],
        ),
        firstPerson: s.describe(
          partnerBirthInput,
          "The first person's birth details; in the marriage scenario this is the male partner.",
        ),
        secondPerson: s.describe(
          partnerBirthInput,
          "The second person's birth details; in the marriage scenario this is the female partner.",
        ),
        scoringMode: s.withEnum(
          s.string(
            "The scoring mode: traditional binary scoring or graded flexible scoring (recommended and the connector default).",
            { default: "graded" },
          ),
          ["traditional", "graded"],
        ),
        language: multilingualLanguage,
      },
      { optional: ["scenario", "scoringMode", "language"] },
    ),
    outputSchema: s.object(
      "The two-person Bazi analysis result.",
      {
        analysis: s.looseObject(
          "The complete matching scores, two charts and interpretations returned for the selected scenario.",
          {
            male: s.looseObject("The provider's first-person chart, under its native male field."),
            female: s.looseObject("The provider's second-person chart, under its native female field."),
            all_score: s.number("The overall matching score returned by the provider."),
            master_evaluation: s.looseObject("The provider's combined evaluation and entertainment interpretation."),
          },
        ),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_ziwei_chart",
    description:
      "Calculate a Ziwei Doushu chart with twelve palaces and star placements for cultural research and entertainment. Lunar dates in 1900-2100 are converted first using an additional call; other non-leap lunar dates use native input.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.describe(baziInput, "The birth details and true solar time options for a Ziwei chart."),
    outputSchema: s.object(
      "The Ziwei Doushu chart result.",
      {
        chart: s.looseObject(
          "The complete Ziwei chart, preserving all provider-defined chart and interpretation fields.",
          {
            base_info: s.looseObject("The Ziwei birth details and basic chart information."),
            gong_pan: s.array(
              "The twelve palaces in the provider's original order (indices 0 to 11).",
              s.looseObject("One Ziwei palace's stars and associated chart details."),
            ),
          },
        ),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_natal_chart",
    description:
      "Calculate a Western astrology natal chart from the original Gregorian local birth time for cultural research and entertainment. Returns celestial data, official interpretations and the SVG chart when provided. The provider handles timezone/DST and transport compression; no true solar time correction is applied.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: natalInput,
    outputSchema: s.object(
      "The Western astrology natal chart result.",
      {
        chart: s.looseObject("The full natal chart returned by Yuanfenju.", {
          base_info: s.looseObject("The natal chart's birth details and calculation settings."),
          detail_info: s.looseObject("The celestial data, official interpretations and SVG chart.", {
            chart_data: s.looseObject("The houses, celestial objects, aspects, statistics and chart patterns."),
            chart_description: s.looseObject("The official natal chart interpretations in the requested language."),
            chart_svg: s.string("The SVG chart source returned by the provider."),
          }),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "find_auspicious_dates",
    description:
      "Find dates marked suitable for a selected traditional activity within the next 7 days, half month, month or three months, for cultural research and entertainment. Use get_almanac for a selected date's hourly details.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The traditional activity and future period for date selection.",
      {
        activityId: s.integer(
          "The official activity ID: 0 moving, 1 renovation, 2 entering a home, 3 engagement/marriage, 4 wedding/registration, 5 seeking children/childbirth, 6 receiving wealth, 7 opening a business, 8 trading, 9 property purchase, 10 earthwork, 11 travel, 12 burial, 13 ancestor rites, 14 prayer, 15 bathing, 16 alliance, 17 son-in-law marriage, 18 grave repair, 19 ground breaking, 20 burial, 21 monument erection, 22 living-person grave construction, 23 coffin preparation, 24 encoffining, 25 coffin transfer, 26 logging, 27 well digging, 28 plaque hanging, 29 planting, 30 school admission, 31 haircut, 32 meeting relatives/friends, 33 taking office, 34 seeking medical care, 35 treatment.",
          { minimum: 0, maximum: 35 },
        ),
        period: s.withEnum(
          s.string("The future search period: seven_days (default), half_month, one_month or three_months.", {
            default: "seven_days",
          }),
          ["seven_days", "half_month", "one_month", "three_months"],
        ),
        language,
      },
      { optional: ["period", "language"] },
    ),
    outputSchema: s.object(
      "The traditional date selection result.",
      {
        selection: s.looseObject("The full date selection result returned by Yuanfenju.", {
          detail_info: s.array(
            "The dates matching the selected traditional activity.",
            s.looseObject("One matching date's almanac details.", {
              yangli: s.string("The Gregorian date."),
              yinli: s.string("The lunar date display text."),
            }),
          ),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_account",
    description:
      "Get the connected Yuanfenju account's membership, expiry and applicable remaining quota. This query does not consume call credits.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object("The input for querying the connected account.", {}, { optional: [] }),
    outputSchema: s.object("The account query result.", { account: accountData, notice }, { optional: [] }),
  }),
  defineProviderAction(service, {
    name: "get_bazi_chart",
    description:
      "Calculate a standard Bazi chart with four pillars, five elements and luck cycles for cultural research and entertainment. Lunar dates in 1900-2100 are converted first, including leap months, using an additional API call. Other non-leap lunar dates use native lunar input.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: baziInput,
    outputSchema: s.object(
      "The standard Bazi chart result.",
      {
        chart: s.looseObject("The complete standard Bazi chart, including all provider-defined fields.", {
          base_info: s.looseObject("The birth details, chart classification and five-element analysis."),
          detail_info: s.looseObject("The four pillars, childhood period and major/yearly luck cycles."),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "interpret_tarot",
    description:
      "Draw and interpret a full-deck tarot spread for entertainment using the current Yuanfenju interface. Drawing is automatic; paid membership is required.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The tarot spread and interpretation topic.",
      {
        spreadId: s.integer(
          "The spread: 1 single card, 2 choice, 3 holy triangle, 4 time arrow, 5 four elements, 6 lover pyramid, 7 five elements, 8 lovers, 9 cross, 10 hexagram, 11 compound, 12 seven planets, 13 nine-grid, 14 deep relationship, 15 Celtic cross, 16 tree of life, 17 annual cycle.",
          { minimum: 1, maximum: 17 },
        ),
        topicId: s.integer(
          "The topic: 1 love/marriage, 2 work/study, 3 relationships/wealth, 4 health/lifestyle, 5 general.",
          { minimum: 1, maximum: 5 },
        ),
        language: s.stringEnum("The tarot result language: simplified Chinese, traditional Chinese or English.", [
          "zh-cn",
          "zh-tw",
          "en-us",
        ]),
      },
      { optional: ["language"] },
    ),
    outputSchema: s.object(
      "The tarot reading result.",
      {
        reading: s.looseObject("The complete tarot reading returned by Yuanfenju.", {
          cards: s.array("The automatically drawn tarot cards.", card),
          overall_interpretation: s.looseObject("The combined reading and oracle message."),
          environment: s.looseObject("The calculation time and associated cultural context."),
        }),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "convert_calendar",
    description:
      "Convert Gregorian and Chinese lunar dates in either direction, including negative lunar month numbers for leap months.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: conversionInput,
    outputSchema: s.object("The calendar conversion result.", { date: convertedDate, notice }, { optional: [] }),
  }),
  defineProviderAction(service, {
    name: "get_almanac",
    description:
      "Get the Chinese almanac for a Gregorian date within 90 days before or after today, for cultural research and entertainment.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The date and language for an almanac query.",
      {
        date: s.string("The Gregorian date in YYYY-MM-DD format, within the provider's rolling 90-day window.", {
          format: "date",
        }),
        language,
      },
      { optional: ["language"] },
    ),
    outputSchema: s.object(
      "The almanac query result.",
      {
        almanac: s.looseObject(
          "The full Chinese almanac, including lunar date, stems/branches, activities and hourly details.",
          {
            yangli: s.string("The Gregorian date."),
            yinli: s.string("The lunar date display text."),
            yi: s.string("The traditional activities marked suitable."),
            ji: s.string("The traditional activities marked unsuitable."),
            ganzhi: s.looseObject("The year, month, day and time heavenly stems and earthly branches."),
            detail_info: s.array(
              "The twelve traditional hourly period details.",
              s.looseObject("One traditional hourly period's almanac details."),
            ),
          },
        ),
        notice,
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_solar_terms",
    description:
      "Get the year's 12 seasonal nodes or all 24 solar terms with Gregorian and lunar timestamps for the supplied date.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "The reference date and solar term selection.",
      {
        calendarType,
        year,
        month,
        day,
        includeAllTerms: s.boolean({
          description: "Whether to return all 24 solar terms. Defaults to false, returning 12 seasonal nodes.",
          default: false,
        }),
      },
      { optional: ["calendarType", "includeAllTerms"] },
    ),
    outputSchema: s.object(
      "The solar term query result.",
      {
        terms: s.array(
          "The year's solar terms returned by Yuanfenju.",
          s.looseObject("One solar term with Gregorian and lunar date/time representations.", {
            jieqi_name: s.string("The solar term name."),
            jieqi_simple_time: s.string("The Gregorian date of the solar term."),
            jieqi_detail_time: s.string("The Gregorian date and precise time."),
            jieqi_lunar_time_isleap: s.string("Whether the lunar date is in a leap month: 1 yes, 0 no."),
            jieqi_simple_lunar_time: s.string("The lunar date of the solar term."),
            jieqi_detail_lunar_time: s.string("The lunar date and precise time."),
          }),
        ),
        notice,
      },
      { optional: [] },
    ),
  }),
];
