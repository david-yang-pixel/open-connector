import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const date = s.date(
  "Gregorian date in YYYY-MM-DD format, from 1700-01-01 through 2300-12-31. Dates and calendar calculations use China Standard Time (UTC+8).",
);
const calendar = s.withDefault(
  s.stringEnum(
    "Calendar convention: lunar starts years at Chinese New Year; solar starts years at Li Chun and months at the twelve jie solar terms (Ba Zi convention). Input dates are always Gregorian.",
    ["lunar", "solar"],
  ),
  "lunar",
);
const animalInput = s.string("Chinese zodiac animal; names are case-insensitive.", {
  pattern:
    "^\\s*(?:[rR][aA][tT]|[oO][xX]|[tT][iI][gG][eE][rR]|[rR][aA][bB][bB][iI][tT]|[dD][rR][aA][gG][oO][nN]|[sS][nN][aA][kK][eE]|[hH][oO][rR][sS][eE]|[gG][oO][aA][tT]|[mM][oO][nN][kK][eE][yY]|[rR][oO][oO][sS][tT][eE][rR]|[dD][oO][gG]|[pP][iI][gG])\\s*$",
});
const animal = s.stringEnum("Chinese zodiac animal.", [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
]);
const direction = s.stringEnum("Compass direction.", ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
const degrees = {
  ...s.number("Compass bearing in degrees, from 0 inclusive to 360 exclusive.", { minimum: 0 }),
  exclusiveMaximum: 360,
};
const element = s.stringEnum("Five-element association.", ["Wood", "Fire", "Earth", "Metal", "Water"]);
const polarity = s.stringEnum("Yin or Yang polarity.", ["Yin", "Yang"]);
const pinyin = s.string("Traditional name in pinyin.");
const hanzi = s.string("Traditional name in Chinese characters.");
const stem = s.object(
  "Heavenly stem.",
  { pinyin, hanzi, element, polarity },
  { additionalProperties: true, optional: [] },
);
const branch = s.object(
  "Earthly branch.",
  { pinyin, hanzi, animal, element, polarity },
  { additionalProperties: true, optional: [] },
);
const pillar = s.object(
  "Stem-branch pillar.",
  {
    name: s.string("Combined stem-branch name in pinyin."),
    hanzi,
    stem,
    branch,
  },
  { additionalProperties: true, optional: [] },
);
const startsOn = s.date("First Gregorian date included in this calendar period.");
const endsOn = s.date("Last Gregorian date included in this calendar period.");
const basis = s.object(
  "Zodiac sign and optional birth-date basis.",
  { date, calendar, animal },
  { additionalProperties: true, optional: ["date", "calendar"] },
);
const trigram = s.object(
  "Eight Mansions trigram.",
  {
    name: s.string("Trigram name in pinyin."),
    hanzi,
    element,
    group: s.stringEnum("East or West group.", ["East", "West"]),
  },
  { additionalProperties: true, optional: [] },
);
const mansionStar = s.object(
  "Traditional Eight Mansions star and meaning.",
  {
    direction,
    star: s.string("Traditional star name in pinyin."),
    hanzi,
    auspicious: s.boolean("Whether this star is traditionally auspicious."),
    meaning: s.string("Traditional meaning of this star."),
  },
  { additionalProperties: true, optional: ["direction", "auspicious"] },
);
const mountain = s.object(
  "Facing or sitting mountain of the twenty-four mountains.",
  {
    code: s.string("Mountain code such as N1 or NW3."),
    pinyin,
    hanzi,
    palace: direction,
    fromDegrees: s.number("Start bearing of the mountain sector."),
    toDegrees: s.number("End bearing of the mountain sector."),
    degrees: s.number("Requested compass bearing when supplied."),
    nearMountainBoundary: s.boolean(
      "Whether the bearing is within three degrees of a mountain boundary, where a replacement chart may apply.",
    ),
  },
  { additionalProperties: true, optional: ["degrees", "nearMountainBoundary"] },
);
const palaceStars = s.object(
  "Stars of one palace in the Flying Star chart.",
  {
    base: s.integer("Base star number."),
    mountain: s.integer("Mountain star number."),
    water: s.integer("Water star number."),
  },
  { additionalProperties: true, optional: [] },
);
const lengthRange = s.object(
  "Nearest auspicious length range in millimeters.",
  {
    fromMm: s.number("Inclusive start of the range in millimeters."),
    toMm: s.number("Exclusive end of the range in millimeters."),
  },
  { additionalProperties: true, optional: ["fromMm", "toMm"] },
);
const dateCalendarInput = s.object(
  "Birth date and optional calendar convention.",
  { date, calendar },
  { optional: ["calendar"] },
);
const relationInput = {
  ...s.object(
    "Supply a birth date or zodiac animal, with an optional calendar convention.",
    { date, animal: animalInput, calendar },
    { optional: ["date", "animal", "calendar"] },
  ),
  anyOf: [{ required: ["date"] }, { required: ["animal"] }],
};
function action(
  name: string,
  description: string,
  inputSchema: Record<string, unknown>,
  outputSchema: Record<string, unknown>,
) {
  return defineProviderAction("fengshui", {
    name,
    description,
    operationType: "read",
    requiredScopes: [],
    inputSchema,
    outputSchema,
  });
}
export const fengshuiActions: ActionDefinition[] = [
  action(
    "get_zodiac_year",
    "Get the Chinese year zodiac animal, element and stem-branch pillar for a date.",
    dateCalendarInput,
    s.object(
      "Chinese year zodiac result.",
      {
        date,
        calendar,
        year: s.integer("Gregorian year in which the Chinese year began."),
        startsOn,
        endsOn,
        animal,
        element,
        polarity,
        pillar,
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_zodiac_month",
    "Get the lunar month or solar-term month zodiac and pillar for a date.",
    dateCalendarInput,
    s.object(
      "Chinese month zodiac result.",
      {
        date,
        calendar,
        startsOn,
        endsOn,
        animal,
        pillar,
        month: s.integer("Lunar month number, present for the lunar calendar.", {
          minimum: 1,
          maximum: 12,
        }),
        leap: s.boolean("Whether this is a leap lunar month."),
        term: s.object(
          "Solar term opening the month, present for the solar calendar.",
          {
            pinyin,
            hanzi,
            english: s.string("English name of the solar term."),
            longitude: s.integer("Apparent solar longitude in degrees."),
            occursAt: s.dateTime("Astronomical instant of the solar term."),
          },
          { additionalProperties: true, required: [] },
        ),
      },
      { additionalProperties: true, optional: ["month", "leap", "term"] },
    ),
  ),
  action(
    "get_zodiac_day",
    "Get the day zodiac animal and stem-branch pillar for a date.",
    s.object("Gregorian date for the day pillar.", { date }, { optional: [] }),
    s.object(
      "Day zodiac and pillar result.",
      { date, animal, element, pillar },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_zodiac_hour",
    "Get the zodiac animal and earthly branch for a local two-hour period; this does not calculate a full hour pillar.",
    s.object(
      "Local time for the hour zodiac sign.",
      {
        time: s.string("Local time in 24-hour HH:MM format.", {
          pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
        }),
      },
      { optional: [] },
    ),
    s.object(
      "Hour zodiac result.",
      {
        time: s.string("Requested local time."),
        animal,
        branch,
        startsAt: s.string("Start of the two-hour period in HH:MM format."),
        endsAt: s.string("End of the two-hour period in HH:MM format."),
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_zodiac_allies",
    "Get the two zodiac animals forming the traditional three-harmony group with a sign.",
    relationInput,
    s.object(
      "Traditional zodiac allies.",
      {
        ...(basis.properties as Record<string, Record<string, unknown>>),
        allies: s.array("The two allied zodiac animals.", animal),
      },
      { additionalProperties: true, optional: ["date", "calendar"] },
    ),
  ),
  action(
    "get_zodiac_enemy",
    "Get the opposite, traditionally clashing zodiac animal for a sign.",
    relationInput,
    s.object(
      "Traditional zodiac clash.",
      {
        ...(basis.properties as Record<string, Record<string, unknown>>),
        enemy: animal,
      },
      { additionalProperties: true, optional: ["date", "calendar"] },
    ),
  ),
  action(
    "get_zodiac_secret_friend",
    "Get the zodiac animal forming a traditional six-harmony pair with a sign.",
    relationInput,
    s.object(
      "Traditional zodiac six-harmony partner.",
      {
        ...(basis.properties as Record<string, Record<string, unknown>>),
        secretFriend: animal,
      },
      { additionalProperties: true, optional: ["date", "calendar"] },
    ),
  ),
  action(
    "get_zodiac_peach_blossom",
    "Get the traditional Peach Blossom zodiac animal and compass direction for a sign.",
    relationInput,
    s.object(
      "Traditional Peach Blossom result.",
      {
        ...(basis.properties as Record<string, Record<string, unknown>>),
        peachBlossom: s.object(
          "Peach Blossom animal and direction.",
          { animal, direction },
          { additionalProperties: true, optional: [] },
        ),
      },
      { additionalProperties: true, optional: ["date", "calendar"] },
    ),
  ),
  action(
    "get_compatibility",
    "Score traditional love or business compatibility from 1 (challenging) to 4 (excellent), using birth dates or zodiac animals.",
    {
      ...s.object(
        "Compatibility type and the birth date or animal of each person.",
        {
          type: s.stringEnum("Compatibility context.", ["love", "business"]),
          date1: s.describe(
            date,
            "First person's Gregorian birth date, between 1700-01-01 and 2300-12-31; supply date1 or animal1.",
          ),
          animal1: s.describe(animalInput, "First person's zodiac animal; supply date1 or animal1."),
          date2: s.describe(
            date,
            "Second person's Gregorian birth date, between 1700-01-01 and 2300-12-31; supply date2 or animal2.",
          ),
          animal2: s.describe(animalInput, "Second person's zodiac animal; supply date2 or animal2."),
          calendar,
        },
        { optional: ["date1", "animal1", "date2", "animal2", "calendar"] },
      ),
      allOf: [
        { anyOf: [{ required: ["date1"] }, { required: ["animal1"] }] },
        { anyOf: [{ required: ["date2"] }, { required: ["animal2"] }] },
      ],
    },
    s.object(
      "Traditional compatibility score.",
      {
        type: s.stringEnum("Compatibility context.", ["love", "business"]),
        calendar,
        first: basis,
        second: basis,
        score: s.integer("Compatibility score from 1 to 4.", { minimum: 1, maximum: 4 }),
        maxScore: s.integer("Maximum compatibility score."),
        rating: s.stringEnum("Traditional compatibility rating.", ["challenging", "average", "good", "excellent"]),
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_kua",
    "Calculate the personal Kua number, East or West group, and traditional favorable and unfavorable directions.",
    s.object(
      "Birth date, gender used by the traditional formula, and calendar convention.",
      {
        date,
        gender: s.stringEnum("Gender used by the traditional Kua formula.", ["male", "female"]),
        calendar,
      },
      { optional: ["calendar"] },
    ),
    s.object(
      "Personal Kua and Eight Mansions directions.",
      {
        date,
        gender: s.stringEnum("Gender used by the traditional Kua formula.", ["male", "female"]),
        calendar,
        chineseYear: s.integer("Chinese birth year under the chosen calendar convention."),
        kua: s.integer("Personal Kua number after remapping a Luo Shu number of 5."),
        luoShuNumber: s.integer("Luo Shu number before remapping."),
        group: s.stringEnum("East or West group.", ["East", "West"]),
        trigram,
        favorableDirections: s.array("Four traditionally favorable directions.", mansionStar),
        unfavorableDirections: s.array("Four traditionally unfavorable directions.", mansionStar),
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_eight_mansions",
    "Calculate the house trigram and traditional Eight Mansions stars for the eight compass sectors.",
    s.object(
      "Building facing direction for Eight Mansions.",
      {
        facing: s.anyOf("Facing of the building as a compass bearing or one of eight directions.", [
          degrees,
          direction,
        ]),
      },
      { optional: [] },
    ),
    s.object(
      "Eight Mansions house chart.",
      {
        facing: s.object(
          "Building facing direction.",
          { direction, degrees },
          { additionalProperties: true, optional: ["degrees"] },
        ),
        sitting: direction,
        house: trigram,
        sectors: s.record("Star of each compass sector, keyed N, NE, E, SE, S, SW, W and NW.", mansionStar),
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
  action(
    "get_flying_star",
    "Calculate the natal Flying Star chart for the nine palaces using the building facing and construction year or period. Replacement (Ti Gua) charts are not computed.",
    {
      ...s.object(
        "Building facing and exactly one construction period or construction year.",
        {
          facing: s.anyOf(
            "Facing as a compass bearing, a twenty-four-mountain code (N1 through NW3), or a mountain name in pinyin (Ren, Zi, Gui, etc.).",
            [degrees, s.nonWhitespaceString("Mountain code or mountain name in pinyin.")],
          ),
          period: s.integer(
            "Twenty-year construction period from 1 to 9; period 9 covers 2024-2043. Mutually exclusive with constructionYear.",
            { minimum: 1, maximum: 9 },
          ),
          constructionYear: s.integer(
            "Year the building was completed; the API derives the period. Mutually exclusive with period.",
            { minimum: 1700, maximum: 2300 },
          ),
        },
        { optional: ["period", "constructionYear"] },
      ),
      oneOf: [{ required: ["period"] }, { required: ["constructionYear"] }],
    },
    s.object(
      "Natal Flying Star chart.",
      {
        period: s.integer("Twenty-year construction period."),
        periodYears: s.object(
          "Gregorian years covered by the period.",
          {
            from: s.integer("First year of the period."),
            to: s.integer("Last year of the period."),
          },
          { additionalProperties: true, required: [] },
        ),
        constructionYear: s.integer("Requested construction year, when supplied."),
        facing: mountain,
        sitting: mountain,
        chart: s.record("Base, mountain and water stars, keyed NW, N, NE, W, C, E, SW, S and SE.", palaceStars),
        mountainFlight: s.stringEnum("Mountain-star flight direction.", ["forward", "backward"]),
        waterFlight: s.stringEnum("Water-star flight direction.", ["forward", "backward"]),
        chartType: s.object(
          "Classical Flying Star chart type.",
          {
            name: s.string("Classical chart type name."),
            description: s.string("Meaning of the classical chart type."),
          },
          { additionalProperties: true, required: [] },
        ),
      },
      { additionalProperties: true, optional: ["constructionYear"] },
    ),
  ),
  action(
    "check_lucky_dimension",
    "Check a positive length on the Lu Ban ruler and get nearest auspicious ranges when the length is inauspicious.",
    s.object(
      "Length and measurement unit for the Lu Ban ruler.",
      {
        length: s.number("Positive length to check.", { exclusiveMinimum: 0 }),
        unit: s.withDefault(
          s.stringEnum("Measurement unit: millimeters, centimeters or inches.", ["mm", "cm", "in"]),
          "mm",
        ),
      },
      { optional: ["unit"] },
    ),
    s.object(
      "Lu Ban ruler measurement result.",
      {
        length: s.number("Requested length."),
        unit: s.stringEnum("Requested measurement unit.", ["mm", "cm", "in"]),
        lengthMm: s.number("Length converted to millimeters."),
        auspicious: s.boolean("Whether the length is traditionally auspicious."),
        ruler: s.object(
          "Lu Ban ruler cycle.",
          {
            name: s.string("Ruler name."),
            cycleMm: s.integer("Cycle length in millimeters."),
            sectionMm: s.integer("Section length in millimeters."),
          },
          { additionalProperties: true, required: [] },
        ),
        section: s.object(
          "Traditional ruler section containing the length.",
          {
            index: s.integer("Section number within the cycle."),
            pinyin,
            hanzi,
            meaning: s.string("Traditional meaning of the ruler section."),
            auspicious: s.boolean("Whether the section is traditionally auspicious."),
          },
          { additionalProperties: true, required: [] },
        ),
        positionInCycleMm: s.number("Position within the ruler cycle in millimeters."),
        alternatives: s.nullable(
          s.object(
            "Nearest auspicious ranges when the requested length is inauspicious.",
            { shorter: lengthRange, longer: lengthRange },
            { additionalProperties: true, optional: ["shorter", "longer"] },
          ),
        ),
      },
      { additionalProperties: true, optional: ["alternatives"] },
    ),
  ),
  action(
    "get_key_status",
    "Get the current API key status and hourly request quota without accessing personal data.",
    s.object("Input for reading the current key's quota.", {}, { optional: [] }),
    s.object(
      "Current key status and request quota.",
      {
        apiKeyPrefix: s.string("Non-secret prefix identifying the current API key."),
        apiKeyIssuedAt: s.dateTime("Time the current API key was issued."),
        rateLimit: s.object(
          "Current hourly quota.",
          {
            limit: s.integer("Maximum requests per quota window."),
            remaining: s.integer("Requests remaining in the current window."),
            windowSeconds: s.integer("Quota window length in seconds."),
          },
          { additionalProperties: true, required: [] },
        ),
      },
      { additionalProperties: true, optional: [] },
    ),
  ),
];
