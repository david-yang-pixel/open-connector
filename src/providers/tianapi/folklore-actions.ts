import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "tianapi";
const signSchema = s.nonEmptyString("A zodiac constellation name in Chinese or English, such as 金牛座 or taurus.");
const animalSchema = s.stringEnum("One Chinese zodiac animal.", [
  "鼠",
  "牛",
  "虎",
  "兔",
  "龙",
  "蛇",
  "马",
  "羊",
  "猴",
  "鸡",
  "狗",
  "猪",
]);
const bloodTypeSchema = s.stringEnum("An ABO blood type.", ["A", "B", "AB", "O"]);
const dateSchema = s.string("A Gregorian date in YYYY-MM-DD format.", { format: "date" });
const horoscopeItemSchema = s.looseObject("A horoscope category and its text returned by TianAPI.", {
  type: s.string("The horoscope category, such as overall, love, work, or lucky color."),
  content: s.string("The horoscope text or index, preserved as returned by TianAPI."),
});
const constellationResultSchema = s.looseObject("A constellation interpretation or pairing result.", {
  grade: s.string("The friendship, love, marriage, and family ratings returned by TianAPI."),
  title: s.string("The constellation or pairing title."),
  content: s.string("The interpretation text returned by TianAPI."),
});
const zodiacResultSchema = s.looseObject("A Chinese zodiac pairing result returned by TianAPI.", {
  title: s.string("The zodiac pairing title."),
  fcontent: s.string("The first female and male pairing interpretation."),
  mcontent: s.string("The first male and female pairing interpretation."),
  fcontent1: s.string("The reversed female and male pairing interpretation."),
  mcontent1: s.string("The reversed male and female pairing interpretation."),
});
const birthdayResultSchema = s.looseObject("A birthday personality result returned by TianAPI.", {
  title: s.string("The birthday personality title."),
  content: s.string("The birthday personality interpretation."),
});
function listOutput(description: string, item: Record<string, unknown>) {
  return s.object(
    description,
    {
      list: s.array("The result entries in the order returned by TianAPI.", item),
    },
    { additionalProperties: true, optional: [] },
  );
}
export const tianapiFolkloreActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_daily_horoscope",
    description:
      "Query a constellation's horoscope for a date, defaulting to today when omitted. Includes overall, love, work, wealth, health, and lucky attributes. Enable TianAPI Star Horoscope (78). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for querying a daily horoscope.",
      {
        sign: signSchema,
        date: dateSchema,
      },
      { optional: ["date"] },
    ),
    outputSchema: listOutput("The daily horoscope categories returned by TianAPI.", horoscopeItemSchema),
  }),
  defineProviderAction(service, {
    name: "get_constellation_compatibility",
    description:
      "Query a single constellation's interpretation, a pair of constellations, or its compatibility with all constellations. Omit otherSign for the single mode or set compareWithAll for all pairings. Enable TianAPI Constellation Pairing (42). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for constellation interpretation and compatibility.",
      {
        sign: signSchema,
        otherSign: signSchema,
        compareWithAll: s.boolean("Compare the sign with all constellations; do not also pass otherSign."),
      },
      { optional: ["otherSign", "compareWithAll"] },
    ),
    outputSchema: s.looseObject("The single interpretation, pair result, or all-pairings list returned by TianAPI.", {
      ...(constellationResultSchema.properties as Record<string, Record<string, unknown>>),
      list: s.array("The compatibility results when comparing with all constellations.", constellationResultSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_almanac",
    description:
      "Query the traditional Chinese almanac, including auspicious activities, taboos, lunar dates, zodiac animals, and heavenly stems. Supports Gregorian dates or Unix timestamps, and lunar dates when calendar is lunar. Omitted dates use today. Years 1970-2038. Enable TianAPI Chinese Almanac (45).",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for the basic Chinese almanac.",
      {
        date: s.nonEmptyString("The query date, or a Unix timestamp for Gregorian queries; lunar dates use YYYY-M-D."),
        calendar: s.withDefault(
          s.stringEnum("The input calendar, defaulting to Gregorian.", ["gregorian", "lunar"]),
          "gregorian",
        ),
      },
      { optional: ["date", "calendar"] },
    ),
    outputSchema: s.looseObject("The basic Chinese almanac result returned by TianAPI.", {
      jieqi: s.string("The solar term."),
      taboo: s.string("The activities considered inauspicious."),
      pengzu: s.string("The Peng Zu traditional taboos."),
      suisha: s.string("The Sui Sha direction."),
      xingsu: s.string("The lunar mansion."),
      fitness: s.string("The activities considered auspicious."),
      shenwei: s.string("The traditional deity directions."),
      taishen: s.string("The fetal deity location."),
      chongsha: s.string("The zodiac clash."),
      festival: s.string("The Gregorian festival."),
      jianshen: s.string("The traditional day deity."),
      lunarday: s.string("The Chinese lunar day name."),
      xingwest: s.string("The Western zodiac constellation."),
      lunardate: s.string("The lunar date."),
      shengxiao: s.string("The Chinese zodiac animal."),
      lmonthname: s.string("The traditional month or season name."),
      lubarmonth: s.string("The Chinese lunar month name, using the official field spelling."),
      wuxingjiazi: s.string("The Jia Zi five-element value."),
      wuxingnaday: s.string("The day Na Yin five-element value."),
      Wuxingnaday: s.string("The day Na Yin value using the capitalization shown in the official example."),
      wuxingnayear: s.string("The year Na Yin five-element value."),
      gregoriandate: s.string("The Gregorian date."),
      wuxingnamonth: s.string("The month Na Yin five-element value."),
      lunar_festival: s.string("The lunar festival."),
      tiangandizhiday: s.string("The day heavenly stems and earthly branches."),
      tiangandizhiyear: s.string("The year heavenly stems and earthly branches."),
      tiangandizhimonth: s.string("The month heavenly stems and earthly branches."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_full_almanac",
    description:
      "Query the full Chinese almanac for a Gregorian date, defaulting to today. Includes lunar dates, zodiac animals, auspicious and inauspicious gods, directions, and seasonal information. Years 1900-2100. This endpoint does not accept lunar-date input. Enable TianAPI Chinese Almanac (45).",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for the full Chinese almanac.",
      {
        date: dateSchema,
      },
      { optional: ["date"] },
    ),
    outputSchema: s.looseObject("The full Chinese almanac result returned by TianAPI.", {
      star: s.string("The lunar mansion."),
      week: s.string("The Chinese weekday name."),
      avoid: s.string("The activities considered inauspicious."),
      chong: s.string("The zodiac clash."),
      day_gz: s.string("The day heavenly stems and earthly branches."),
      san_fu: s.string("The dog days of summer information."),
      zodiac: s.string("The Chinese zodiac animal."),
      bad_god: s.string("The inauspicious deity names."),
      fu_shen: s.string("The fortune deity direction."),
      is_leap: s.integer("Whether the lunar month is a leap month: 0 for no, 1 for yes."),
      liu_yao: s.string("The six-day traditional calendar designation."),
      peng_zu: s.string("The Peng Zu traditional taboos."),
      shu_jiu: s.string("The nine-day winter period information."),
      sui_sha: s.string("The Sui Sha direction."),
      xi_shen: s.string("The joy deity direction."),
      year_gz: s.string("The year heavenly stems and earthly branches."),
      yin_gui: s.string("The Yin noble deity direction."),
      cai_shen: s.string("The wealth deity direction."),
      day_kong: s.string("The day empty branches."),
      good_god: s.string("The auspicious deity names."),
      jian_chu: s.string("The twelve-day officer designation."),
      month_gz: s.string("The month heavenly stems and earthly branches."),
      suitable: s.string("The activities considered auspicious."),
      tai_shen: s.string("The fetal deity location."),
      yang_gui: s.string("The Yang noble deity direction."),
      day_nayin: s.string("The day Na Yin five-element value."),
      lunar_day: s.integer("The numeric lunar day."),
      year_kong: s.string("The year empty branches."),
      lunar_date: s.string("The full Chinese lunar date."),
      lunar_year: s.integer("The numeric lunar year."),
      month_kong: s.string("The month empty branches."),
      solar_date: s.string("The Gregorian date."),
      solar_term: s.string("The solar term."),
      year_nayin: s.string("The year Na Yin five-element value."),
      hou_weather: s.string("The seasonal phenology."),
      lunar_month: s.integer("The numeric lunar month."),
      month_nayin: s.string("The month Na Yin five-element value."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_zodiac_compatibility",
    description:
      "Query compatibility interpretations for two Chinese zodiac animals, preserving the different gender combinations. Enable TianAPI Chinese Zodiac Pairing (83). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for a Chinese zodiac pairing.",
      {
        animal: animalSchema,
        otherAnimal: animalSchema,
      },
      { optional: [] },
    ),
    outputSchema: zodiacResultSchema,
  }),
  defineProviderAction(service, {
    name: "list_zodiac_compatibilities",
    description:
      "Compare one Chinese zodiac animal with the other 11 animals, optionally including itself. The connector makes 11 or 12 official pairing requests, consuming that many calls, with requests spaced below the ordinary-account 3 QPS limit. Enable TianAPI Chinese Zodiac Pairing (83). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for comparing an animal with all Chinese zodiac animals.",
      {
        animal: animalSchema,
        includeSelf: s.boolean("Also compare the animal with itself, making 12 calls instead of 11."),
      },
      { optional: ["includeSelf"] },
    ),
    outputSchema: s.object(
      "The Chinese zodiac comparison results collected by the connector.",
      {
        list: s.array(
          "The zodiac pairings in the traditional twelve-animal order.",
          s.object(
            "One zodiac comparison.",
            {
              animal: animalSchema,
              otherAnimal: animalSchema,
              result: zodiacResultSchema,
            },
            { optional: [] },
          ),
        ),
      },
      { optional: [] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_blood_type_compatibility",
    description:
      "Query a traditional ABO blood-type pairing interpretation. Enable TianAPI Blood Type Pairing (84). For entertainment only, not a medical compatibility assessment.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for a blood-type pairing.",
      {
        bloodType: bloodTypeSchema,
        otherBloodType: bloodTypeSchema,
      },
      { optional: [] },
    ),
    outputSchema: s.looseObject("The blood-type pairing interpretation returned by TianAPI.", {
      pair: s.string("The blood-type pairing label."),
      title: s.string("The pairing title."),
      content: s.string("The pairing interpretation."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_birthday_personality",
    description:
      "Query the personality interpretation for a birthday's month and day; no birth year is required. Enable TianAPI Birthday Personality (27). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for a birthday personality query.",
      {
        month: s.integer("The birthday month.", { minimum: 1, maximum: 12 }),
        day: s.integer("The birthday day of month, including February 29.", {
          minimum: 1,
          maximum: 31,
        }),
      },
      { optional: [] },
    ),
    outputSchema: birthdayResultSchema,
  }),
  defineProviderAction(service, {
    name: "search_dream_interpretations",
    description:
      "Search traditional Zhou Gong dream interpretations by keyword with pagination. Enable TianAPI Dream Interpretation (24). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for searching dream interpretations.",
      {
        keyword: s.nonEmptyString("The dream keyword to search."),
        limit: s.integer("The number of results to request, defaulting to 10.", {
          minimum: 1,
          default: 10,
        }),
        page: s.integer("The page number, defaulting to 1.", { minimum: 1, default: 1 }),
      },
      { optional: ["limit", "page"] },
    ),
    outputSchema: listOutput(
      "The dream interpretation search results returned by TianAPI.",
      s.looseObject("A dream interpretation entry.", {
        id: s.integer("The interpretation ID."),
        type: s.string("The interpretation category."),
        title: s.string("The dream title."),
        result: s.string("The interpretation text, which may include HTML br line breaks."),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "get_number_fortune",
    description:
      "Query a traditional numerology interpretation for a number such as a phone, room, or vehicle number. Preserve leading zeros by passing a string. Enable TianAPI Number Fortune (105). For entertainment only.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for a number fortune query.",
      {
        number: s.nonEmptyString("The number string to interpret; leading zeros are preserved."),
      },
      { optional: [] },
    ),
    outputSchema: s.looseObject("The numerology interpretation returned by TianAPI.", {
      score: s.string("The number score returned as a string."),
      shuli: s.string("The numerology value returned as a string."),
      gaishu: s.string("The interpretation summary."),
      result: s.string("The fortune label."),
      conclusion: s.string("The interpretation conclusion."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_solar_term",
    description:
      "Query one of the 24 Chinese solar terms, including its meaning, customs, poetry, and foods. An optional year requests exact Gregorian and lunar date information. Enable TianAPI Solar Terms (86).",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for a Chinese solar term query.",
      {
        name: s.stringEnum("The Chinese solar term name.", [
          "立春",
          "雨水",
          "惊蛰",
          "春分",
          "清明",
          "谷雨",
          "立夏",
          "小满",
          "芒种",
          "夏至",
          "小暑",
          "大暑",
          "立秋",
          "处暑",
          "白露",
          "秋分",
          "寒露",
          "霜降",
          "立冬",
          "小雪",
          "大雪",
          "冬至",
          "小寒",
          "大寒",
        ]),
        year: s.integer("The optional year used to return exact date information."),
      },
      { optional: ["year"] },
    ),
    outputSchema: s.looseObject("The solar term information returned by TianAPI.", {
      day: s.string("The usual Gregorian date range."),
      name: s.string("The solar term name."),
      yiji: s.string("The traditional seasonal guidance."),
      shiju: s.string("The poem associated with the solar term."),
      xishu: s.string("The traditional customs."),
      meishi: s.string("The traditional foods."),
      jieshao: s.string("The introduction to the solar term."),
      nameimg: s.string("The solar term image name."),
      yuanyin: s.string("The origin or meaning of the name."),
      date: s.looseObject("The exact date information when a year is specified.", {
        cnday: s.string("The Chinese lunar day name."),
        cnyear: s.string("The Chinese lunar year name."),
        cnmonth: s.string("The Chinese lunar month name."),
        cnzodiac: s.string("The Chinese zodiac animal."),
        gregdate: s.string("The Gregorian date."),
        lunardate: s.string("The lunar date."),
      }),
    }),
  }),
  defineProviderAction(service, {
    name: "query_holidays",
    description:
      "Query Chinese holidays, working days, make-up working days, lunar information, and optional international festivals. Supports dates, a month, a date range, or annual official holidays. Non-annual queries contain at most 31 dates. Enable TianAPI Holidays (139).",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for holiday and festival queries.",
      {
        date: s.nonEmptyString(
          "A date, comma-separated dates, YYYY for annual mode, YYYY-MM or YYYY-MM-DD for monthly mode, or start~end dates for range mode.",
        ),
        queryType: s.withDefault(
          s.stringEnum("The date query mode, defaulting to dates.", ["dates", "year", "month", "range"]),
          "dates",
        ),
        includeFestivals: s.boolean("Also return international festivals and commemorative days."),
      },
      { optional: ["queryType", "includeFestivals"] },
    ),
    outputSchema: listOutput(
      "The holiday and festival entries returned by TianAPI.",
      s.looseObject("A holiday or calendar-day entry.", {
        end: s.integer("The holiday end counter."),
        now: s.integer("The current holiday counter."),
        tip: s.string("The official holiday arrangement text."),
        date: s.string("The Gregorian date."),
        info: s.string("The textual day or festival designation."),
        name: s.string("The Chinese holiday name."),
        rest: s.string("The suggested vacation arrangement."),
        start: s.integer("The holiday start counter."),
        enname: s.string("The English holiday name."),
        update: s.boolean("Whether annual official holiday data has been updated."),
        daycode: s.integer("The day type: 0 working day, 1 holiday, 2 weekend, 3 make-up working day."),
        holiday: s.string("The festival date text."),
        weekday: s.integer("The weekday number."),
        lunarday: s.string("The Chinese lunar day name."),
        cnweekday: s.string("The Chinese weekday name."),
        isnotwork: s.integer("Whether it is a rest day: 0 for work, 1 for rest."),
        lunaryear: s.string("The Chinese lunar year name."),
        lunarmonth: s.string("The Chinese lunar month name."),
        wage: {
          description: "The traditional wage multiplier, or specific dates in annual mode.",
          type: ["integer", "string"],
        },
        remark: s.anyOf("The make-up working dates, or an empty string when absent.", [
          s.array("The make-up working dates.", s.string("One make-up working date.")),
          s.string("The empty-string representation of absent make-up dates."),
        ]),
        vacation: s.anyOf("The holiday dates, or an empty string when absent.", [
          s.array("The holiday dates.", s.string("One holiday date.")),
          s.string("The empty-string representation of absent holiday dates."),
        ]),
      }),
    ),
  }),
];
