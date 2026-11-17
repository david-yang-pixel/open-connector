import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const languageSchema = s.stringEnum(
  "Response language (BCP 47). Defaults to en; untranslated fields fall back to English. Supported: en, tr, de, es, hi, pt, fr, ru, zh-Hans, zh-Hant.",
  ["en", "tr", "de", "es", "hi", "pt", "fr", "ru", "zh-Hans", "zh-Hant"],
);
const astrologyPersonSchema = s.object(
  "Details for the first person.",
  {
    date: s.string("Birth date in YYYY-MM-DD format. Determines planetary positions for the specific calendar day.", {
      format: "date",
    }),
    time: s.string("Birth time in 24-hour HH:MM:SS format. Determines the Ascendant (rising sign) and house cusps", {
      pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$",
    }),
    latitude: s.number("Birth location latitude in decimal degrees (-90 to 90). Positive = North, negative = South.", {
      minimum: -90,
      maximum: 90,
    }),
    longitude: s.number(
      "Birth location longitude in decimal degrees (-180 to 180). Positive = East, negative = West.",
      { minimum: -180, maximum: 180 },
    ),
    timezone: s.anyOf(
      'Timezone: an IANA name (e.g. "America/New_York", "Europe/London", or `cities[0].timezone` from /location/search) or decimal hours from UTC (e.g. -5 for EST, 5.5 for IST). An IANA name is resolved to the offset in force at the given date and time.',
      [
        s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
        s.string("IANA timezone name, such as America/New_York."),
      ],
    ),
    nodeType: s.stringEnum(
      'Lunar node convention. "mean" is the smoothed average node, which always moves retrograde; "true" is the osculating node, which tracks the real perturbed node, oscillates up to about 1.5 degrees either side of the mean on a 173-day cycle, and can briefly turn direct',
      ["mean", "true"],
    ),
    name: s.string("Optional display name for this person. Included in the response for easy identification."),
  },
  { required: ["date", "time", "latitude", "longitude", "timezone"] },
);
const baziPersonSchema = s.object(
  "Birth moment of the first person. Each subject carries its own school switches, so two charts built under different conventions can still be compared.",
  {
    date: s.string("Birth date in YYYY-MM-DD format. Sets the year, month and day pillars", {
      format: "date",
    }),
    time: s.string(
      "Birth time in 24-hour HH:MM:SS format. Sets the hour pillar, which is one of the four and carries the whole picture of later life and offspring",
      { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
    ),
    timezone: s.anyOf(
      'IANA name (e.g. "America/New_York", "Europe/London", "UTC"), decimal hours (e.g. -5 for EST, 1 for CET), or a fixed UTC offset (e.g. "-05:00", "+01:00"). Prefer the IANA name: it is resolved to the offset in force at the birth date and time, historical daylight-saving rules included, while a fixed offset or decimal is taken literally and will be wrong if it does not match the daylight-saving state at that moment. On a transition day a time in the repeated hour is read as its first occurrence and a time in the skipped hour is moved forward past the gap. Invalid timezones return 400 with a validation error.',
      [
        s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
        s.string("IANA timezone name, such as America/New_York."),
      ],
    ),
    latitude: s.number(
      "Birth latitude in decimal degrees. Accepted for consistency with the other birth-data endpoints and does not affect any part of a BaZi chart",
      { minimum: -90, maximum: 90 },
    ),
    longitude: s.number("Birth longitude in decimal degrees. Positive is East, negative is West", {
      minimum: -180,
      maximum: 180,
    }),
    dayBoundary: s.stringEnum(
      'Which instant starts the sexagenary DAY, which only matters for a birth between 23:00 and 23:59. "midnight" is the classical position of the Ming compendium San Ming Tong Hui: the day turns at 00:00 and 23:00 to 23:59 is the late zi hour of the day that is ending, so the hour stem is taken from that day. "early-zi" turns the whole day at 23:00, the practice in Hong Kong, Taiwan and much of South East Asia. "split-zi" is the compromise most software implements and the default here: the day still turns at 00:00, but the hour stem is taken from the next day. The three give three different answers for a late-evening birth and identical answers for every other birth.',
      ["split-zi", "midnight", "early-zi"],
    ),
    yearBoundary: s.stringEnum(
      'Which instant starts the sexagenary YEAR. "li-chun" is Beginning of Spring, around 4 February, and is the classical rule every BaZi text uses, so it is the default on this endpoint. "lunar-new-year" is the folk rule people mean when they say which animal they are, and it falls between late January and late February. The two disagree for any birth in the weeks between them: 14 February 2026 is a Wood Snake year under lunar-new-year and a Fire Horse year under li-chun.',
      ["li-chun", "lunar-new-year"],
    ),
    hourClock: s.stringEnum(
      'Which clock the day boundary and the hour branch are read from, so a correction that carries a birth across midnight moves the day pillar with the hour. "clock" is civil time exactly as a birth certificate records it, which is what most calculators use and the default here. "local-mean" shifts to the mean sun over the birth longitude, a correction of up to 59 minutes at the edge of a wide time zone. "solar" adds the equation of time on top of that, up to a further 16 minutes. Both non-civil options need "longitude" in the request and return 400 without it.',
      ["clock", "local-mean", "solar"],
    ),
  },
  { required: ["date", "time", "timezone"] },
);
const humanDesignPersonSchema = s.object(
  "Birth moment of the first person in the connection.",
  {
    date: s.string(
      "Birth date in YYYY-MM-DD format. The anchor for both the Personality activations at birth and the Design activations 88 degrees of solar arc earlier.",
      { format: "date" },
    ),
    time: s.string(
      "Birth time in 24-hour HH:MM:SS format. Precision matters: the profile lines and gate boundaries shift with the exact minute of birth.",
      { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
    ),
    timezone: s.anyOf(
      'IANA name (e.g. "America/New_York", "Europe/London", "UTC"), decimal hours (e.g. -5 for EST, 1 for CET), or a fixed UTC offset (e.g. "-05:00", "+01:00"). Prefer the IANA name: it is resolved to the offset in force at the birth date and time, historical daylight-saving rules included, while a fixed offset or decimal is taken literally and will be wrong if it does not match the daylight-saving state at that moment. On a transition day a time in the repeated hour is read as its first occurrence and a time in the skipped hour is moved forward past the gap. Invalid timezones return 400 with a validation error.',
      [
        s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
        s.string("IANA timezone name, such as America/New_York."),
      ],
    ),
    latitude: s.number(
      "Birth latitude in decimal degrees. Optional and does not affect the bodygraph, which depends only on ecliptic longitudes",
      { minimum: -90, maximum: 90 },
    ),
    longitude: s.number("Birth longitude in decimal degrees. Optional and does not affect the bodygraph", {
      minimum: -180,
      maximum: 180,
    }),
    nodeType: s.stringEnum(
      'Lunar node convention. "mean" is the smoothed average node, which always moves retrograde; "true" is the osculating node, which tracks the real perturbed node, oscillates up to about 1.5 degrees either side of the mean on a 173-day cycle, and can briefly turn direct',
      ["mean", "true"],
    ),
  },
  { required: ["date", "time", "timezone"] },
);
const numerologyPersonSchema = s.object(
  "Details for the first person.",
  {
    fullName: s.string(
      "Full birth name to calculate Expression and Soul Urge numbers automatically. Use instead of passing expression and soulUrge directly.",
      { minLength: 1, maxLength: 200 },
    ),
    year: s.integer(
      "Birth year to calculate Life Path automatically. Use with month and day instead of passing lifePath directly.",
      { minimum: 100, maximum: 2100 },
    ),
    month: s.integer("Birth month (1-12). Required with year and day for automatic Life Path calculation.", {
      minimum: 1,
      maximum: 12,
    }),
    day: s.integer("Birth day (1-31). Required with year and month for automatic Life Path calculation.", {
      minimum: 1,
      maximum: 31,
    }),
    lifePath: s.integer("Person 1 Life Path number (1-9, 11, 22, 33). Optional if year, month, day are provided.", {
      minimum: 1,
      maximum: 33,
    }),
    expression: s.integer("Person 1 Expression number (1-9, 11, 22, 33). Optional if fullName is provided.", {
      minimum: 1,
      maximum: 33,
    }),
    soulUrge: s.integer("Person 1 Soul Urge number (1-9, 11, 22, 33). Optional if fullName is provided.", {
      minimum: 1,
      maximum: 33,
    }),
  },
  { required: [] },
);
const zodiacSignSchema = s.string("Zodiac sign. Case-insensitive input is normalized to lowercase.", {
  pattern:
    "^\\s*(?:[aA][rR][iI][eE][sS]|[tT][aA][uU][rR][uU][sS]|[gG][eE][mM][iI][nN][iI]|[cC][aA][nN][cC][eE][rR]|[lL][eE][oO]|[vV][iI][rR][gG][oO]|[lL][iI][bB][rR][aA]|[sS][cC][oO][rR][pP][iI][oO]|[sS][aA][gG][iI][tT][tT][aA][rR][iI][uU][sS]|[cC][aA][pP][rR][iI][cC][oO][rR][nN]|[aA][qQ][uU][aA][rR][iI][uU][sS]|[pP][iI][sS][cC][eE][sS])\\s*$",
});
const forecastBirthSchema = s.object(
  "Birth details for the single forecast subject. Prefer an IANA timezone for historical daylight saving; latitude and longitude are optional.",
  {
    date: s.string("Birth date in YYYY-MM-DD format. Anchors the natal chart and the Vimshottari dasha sequence.", {
      format: "date",
    }),
    time: s.string(
      "Birth time in 24-hour HH:MM:SS format. Precision matters for the natal positions the transit aspects are measured against.",
      { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
    ),
    timezone: s.anyOf(
      'IANA name (e.g. "America/New_York", "Europe/London", "UTC"), decimal hours (e.g. -5 for EST, 1 for CET), or a fixed UTC offset (e.g. "-05:00", "+01:00"). Prefer the IANA name: it is resolved to the offset in force at the birth date and time, historical daylight-saving rules included, while a fixed offset or decimal is taken literally and will be wrong if it does not match the daylight-saving state at that moment. On a transition day a time in the repeated hour is read as its first occurrence and a time in the skipped hour is moved forward past the gap. Invalid timezones return 400 with a validation error.',
      [
        s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
        s.string("IANA timezone name or fixed UTC offset string."),
      ],
    ),
    latitude: s.number("Birth latitude in decimal degrees. Optional and does not affect the timeline. Defaults to 0.", {
      minimum: -90,
      maximum: 90,
    }),
    longitude: s.number(
      "Birth longitude in decimal degrees. Optional and does not affect the timeline. Defaults to 0.",
      { minimum: -180, maximum: 180 },
    ),
  },
  { required: ["date", "time", "timezone"] },
);
const forecastDomainWeightsSchema = s.object(
  "Per-domain significance multipliers applied before the significance floor and event cap. Bias which domains survive filtering and the cap. Omitted domains default to a weight of 1. Valid keys are western, vedic, and biorhythm.",
  {
    western: s.number(
      "Multiplier for this domain significance. 1 leaves it unchanged, above 1 promotes the domain, below 1 demotes it.",
      { minimum: 0, maximum: 100 },
    ),
    vedic: s.number(
      "Multiplier for this domain significance. 1 leaves it unchanged, above 1 promotes the domain, below 1 demotes it.",
      { minimum: 0, maximum: 100 },
    ),
    biorhythm: s.number(
      "Multiplier for this domain significance. 1 leaves it unchanged, above 1 promotes the domain, below 1 demotes it.",
      { minimum: 0, maximum: 100 },
    ),
  },
  { required: [] },
);
const baziTimingInputSchema = s.describe(baziPersonSchema, "BaZi birth details and school conventions.");
const lunarDateInputSchema = Object.assign(
  s.object(
    "Convert a Gregorian date OR a complete lunar date. Omit both for today in UTC. The calendar uses the UTC+8 reference meridian; isLeapMonth selects the repeated lunar month.",
    {
      date: s.string(
        "Gregorian date to convert to the lunisolar calendar. Send this OR the lunar fields, never both. Converts from the first day of lunar year 1551 to the last day of lunar year 2648, a little inside the supported date span, because numbering a lunar month needs the winter solstice on each side of it and placing a leap month needs the year before; a date outside that answers 400 date_out_of_range.",
        { format: "date" },
      ),
      lunarYear: s.integer("Lunisolar year to convert back to a Gregorian date. Requires lunarMonth and lunarDay.", {
        minimum: 1900,
        maximum: 2100,
      }),
      lunarMonth: s.integer("Lunar month, 1 to 12. Requires lunarYear and lunarDay.", {
        minimum: 1,
        maximum: 12,
      }),
      lunarDay: s.integer("Day of the lunar month, 1 to 30. Requires lunarYear and lunarMonth.", {
        minimum: 1,
        maximum: 30,
      }),
      isLeapMonth: s.boolean(
        "Set true to address the leap repetition of lunarMonth rather than the first pass. Defaults to false. Requesting a leap month a year does not have returns 400.",
      ),
      lang: languageSchema,
    },
    { required: [] },
  ),
  {
    oneOf: [
      {
        description: "Convert an explicit Gregorian date to a lunar date.",
        required: ["date"],
        not: {
          anyOf: [{ required: ["lunarYear"] }, { required: ["lunarMonth"] }, { required: ["lunarDay"] }],
        },
      },
      {
        description: "Convert a complete lunar date to a Gregorian date.",
        required: ["lunarYear", "lunarMonth", "lunarDay"],
        not: { required: ["date"] },
      },
      {
        description: "Use the current UTC date when neither conversion input is supplied.",
        not: {
          anyOf: [
            { required: ["date"] },
            { required: ["lunarYear"] },
            { required: ["lunarMonth"] },
            { required: ["lunarDay"] },
          ],
        },
      },
    ],
  },
);
export const roxyapiActions: ActionDefinition[] = [
  defineProviderAction("roxyapi", {
    name: "get_usage",
    description: "Get API usage statistics.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object("Parameters for getUsageStats.", {}, { required: [] }),
    outputSchema: s.object(
      "Usage statistics retrieved",
      {
        plan: s.string(
          "Name of the subscription plan the API key belongs to. One flat plan covers every domain and the Remote MCP servers, so this is a quota tier, never a per product entitlement.",
        ),
        usedThisMonth: s.number(
          "Billable requests counted against the current calendar month. The quota window is the UTC calendar month and resets on the 1st at 12:00 AM UTC, never on your renewal date, so an annual plan refills every month and a plan bought mid month still refills on the 1st",
        ),
        requestsPerMonth: s.number(
          "Monthly request allowance for the plan. One request, API or MCP, equals one unit: there is no credit weighting and no per domain fee.",
        ),
        remainingThisMonth: s.number(
          "Requests left before the monthly allowance is exhausted, floored at zero. Equal to requestsPerMonth minus usedThisMonth",
        ),
        email: s.string("Billing email the subscription is registered under.", { format: "email" }),
        status: s.string(
          "Subscription lifecycle state. Values: active, cancelled (no longer renewing but usable until endDate), suspended (payment failed, usable until endDate), expired (past endDate), pending (checkout started, payment not captured).",
        ),
        endDate: s.string(
          "ISO 8601 timestamp when the current billing period ends. A renewal extends this date in place",
          { format: "date-time" },
        ),
      },
      {
        required: ["plan", "usedThisMonth", "requestsPerMonth", "remainingThisMonth", "email", "status", "endDate"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "search_cities",
    description:
      "Search cities worldwide. Confirm province and country when multiple cities match; use timezone rather than today's utcOffset for birth charts.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for searchCities.",
      {
        q: s.string(
          "Place to search for, written the way a person would. Accepts a bare city (berlin), a city plus country (berlin germany), a comma-qualified place (richfield, utah), a fully qualified place (richfield, utah, united states), or a historic name (bombay, peking, constantinople)",
          { minLength: 1, maxLength: 100 },
        ),
        limit: s.integer("Maximum items to return per page. Range: 1-50, default 10.", {
          minimum: 1,
          maximum: 50,
        }),
        offset: s.integer("Number of items to skip for pagination. Default 0.", { minimum: 0 }),
      },
      { required: ["q"] },
    ),
    outputSchema: s.object(
      "Matching places, best match first, with coordinates, IANA timezone and UTC offset",
      {
        total: s.number(
          "Number of places matching the query across all pages, not the number returned in this response. Greater than 1 means the name is ambiguous, so show province and country and let the user confirm before using the result for a chart.",
        ),
        limit: s.number("Page size used for this response."),
        offset: s.number("Number of places skipped. Use with limit to page through results."),
        cities: s.array(
          "Matching places for the current page, best match first. Ordered by match quality, then population within equal quality: an exact name beats a qualified name such as richfield, utah, which beats a name merely starting with the query, which beats an incidental match on state or country",
          s.object(
            "Geographic location with coordinates, timezone, and UTC offset. Every field is designed for direct use as input parameters in astrology, horoscope, and location-dependent API calculations.",
            {
              city: s.string(
                "City name as commonly used. Matches the local or internationally recognized name for the location.",
              ),
              province: s.string(
                "State, province, canton, or administrative region. Show it whenever more than one result comes back: it is what separates Richfield, Utah from Richfield, Minnesota, and the six US Springfields from each other",
              ),
              country: s.string("Full country name in English."),
              iso2: s.string(
                "ISO 3166-1 alpha-2 country code. Use for filtering cities by country or building country-specific location pickers.",
              ),
              latitude: s.number(
                "Geographic latitude in decimal degrees (-90 to 90). Pass directly to birth chart, natal chart, horoscope, synastry, transit, kundli, and panchang API endpoints as the latitude parameter.",
              ),
              longitude: s.number(
                "Geographic longitude in decimal degrees (-180 to 180). Pass directly to astrology, horoscope, and panchang API endpoints alongside latitude.",
              ),
              timezone: s.string(
                "IANA timezone identifier following the tz database standard (e.g. Europe/Berlin, America/New_York, Asia/Tokyo). Always present. Pass THIS, not the numeric offset, into any chart or panchang request for a past date: the calculation endpoints resolve it to the offset that was actually in force on that date, including historical daylight saving. Also works directly with JavaScript Date, Luxon, day.js, or any date library.",
              ),
              utcOffset: s.number(
                "UTC offset in decimal hours for TODAY at this place, already adjusted for daylight saving. Convenient for displaying local time now",
              ),
              population: s.number(
                "Population estimate for the place. Breaks ties between results of equal match quality, so among several places matching equally well the largest leads",
              ),
            },
            {
              required: [
                "city",
                "province",
                "country",
                "iso2",
                "latitude",
                "longitude",
                "timezone",
                "utcOffset",
                "population",
              ],
              additionalProperties: true,
            },
          ),
          {},
        ),
      },
      { required: ["total", "limit", "offset", "cities"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_natal_chart",
    description:
      "Generate natal chart. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for generateNatalChart.",
      {
        date: s.string(
          "Birth date in YYYY-MM-DD format. Determines planetary positions for the specific calendar day.",
          { format: "date" },
        ),
        time: s.string(
          "Birth time in 24-hour HH:MM:SS format. Determines the Ascendant (rising sign) and house cusps",
          { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
        ),
        latitude: s.number(
          "Birth location latitude in decimal degrees (-90 to 90). Positive = North, negative = South.",
          { minimum: -90, maximum: 90 },
        ),
        longitude: s.number(
          "Birth location longitude in decimal degrees (-180 to 180). Positive = East, negative = West.",
          { minimum: -180, maximum: 180 },
        ),
        timezone: s.anyOf(
          'Timezone: an IANA name (e.g. "America/New_York", "Europe/London", or `cities[0].timezone` from /location/search) or decimal hours from UTC (e.g. -5 for EST, 5.5 for IST). An IANA name is resolved to the offset in force at the given date and time.',
          [
            s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
            s.string("IANA timezone name, such as America/New_York."),
          ],
        ),
        nodeType: s.stringEnum(
          'Lunar node convention. "mean" is the smoothed average node, which always moves retrograde; "true" is the osculating node, which tracks the real perturbed node, oscillates up to about 1.5 degrees either side of the mean on a 173-day cycle, and can briefly turn direct',
          ["mean", "true"],
        ),
        houseSystem: s.stringEnum(
          "House system for dividing the chart into 12 houses. Placidus (default) is most popular in Western astrology and time-sensitive",
          ["placidus", "whole-sign", "equal", "koch"],
        ),
        lang: languageSchema,
      },
      { required: ["date", "time", "latitude", "longitude", "timezone"] },
    ),
    outputSchema: s.object(
      "Successful natal chart calculation with complete astrological data",
      {
        birthDetails: s.looseObject(
          "Birth details echoed back from the request. Confirms the input used for this chart calculation.",
          {},
        ),
        planets: s.array(
          "All 14 celestial bodies (10 classical planets, lunar nodes, Chiron, Black Moon Lilith) with zodiac signs, house placements, and interpretations.",
          s.looseObject("planets item returned by RoxyAPI.", {}),
          {},
        ),
        houses: s.array(
          "All 12 house cusps with zodiac positions. House cusps divide the chart into life areas.",
          s.looseObject("houses item returned by RoxyAPI.", {}),
          {},
        ),
        houseSystem: s.string("House system used for this chart (placidus, whole-sign, equal, or koch)."),
        aspects: s.array(
          "All planetary aspects found in this chart with orbs, strength, and interpretation.",
          s.looseObject("aspects item returned by RoxyAPI.", {}),
          {},
        ),
        patterns: s.array(
          "Detected multi-planet aspect configurations (Grand Trine, Kite, T-Square, Grand Cross, Yod, Mystic Rectangle, Stellium). Grand Cross suppresses contained T-Squares, Kite suppresses underlying Grand Trine.",
          s.looseObject("patterns item returned by RoxyAPI.", {}),
          {},
        ),
        aspectsInterpretation: s.looseObject(
          "Aspect pattern analysis showing the balance of harmonious vs challenging energies in the chart.",
          {},
        ),
        ascendant: s.looseObject(
          "Ascendant (rising sign). The eastern horizon at birth, defining outward personality and physical appearance.",
          {},
        ),
        midheaven: s.looseObject(
          "Midheaven (MC). The highest point of the ecliptic at birth, representing career direction and public image.",
          {},
        ),
        partOfFortune: s.looseObject(
          "Part of Fortune (Lot of Fortune). A point derived from the Ascendant and the two luminaries that marks an area of ease, vitality, and material wellbeing in the chart.",
          {},
        ),
        vertex: s.looseObject(
          "Vertex. The western intersection of the prime vertical with the ecliptic, often read as a point of fated encounters and turning-point relationships",
          {},
        ),
        summary: s.looseObject(
          "Chart summary with dominant element, modality, retrograde planets, and distribution analysis.",
          {},
        ),
      },
      {
        required: [
          "birthDetails",
          "planets",
          "houses",
          "houseSystem",
          "aspects",
          "aspectsInterpretation",
          "ascendant",
          "midheaven",
          "partOfFortune",
          "vertex",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_synastry",
    description:
      "Calculate synastry. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for calculateSynastry.",
      {
        person1: astrologyPersonSchema,
        person2: astrologyPersonSchema,
        houseSystem: s.stringEnum(
          "House system for both natal charts. Placidus (default), Whole Sign, Equal, or Koch.",
          ["placidus", "whole-sign", "equal", "koch"],
        ),
        lang: languageSchema,
      },
      { required: ["person1", "person2"] },
    ),
    outputSchema: s.object(
      "Synastry calculated successfully with compatibility analysis",
      {
        person1: s.looseObject(
          "Person 1 chart highlights: Ascendant, Sun sign, Moon sign, and plotting positions.",
          {},
        ),
        person2: s.looseObject(
          "Person 2 chart highlights: Ascendant, Sun sign, Moon sign, and plotting positions.",
          {},
        ),
        compatibilityScore: s.number(
          "Overall compatibility score (0-100). Calculated from the balance of harmonious vs challenging inter-chart aspects weighted by planet importance.",
        ),
        interAspects: s.array(
          "All inter-chart (synastry) aspects between person 1 and person 2 planets. Each aspect reveals a specific dynamic in the relationship.",
          s.looseObject("interAspects item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.looseObject(
          "Synastry aspect summary showing the balance of harmonious vs challenging inter-chart connections.",
          {},
        ),
        analysis: s.looseObject("Relationship analysis with strengths, challenges, and overall assessment.", {}),
      },
      {
        required: ["person1", "person2", "compatibilityScore", "interAspects", "summary", "analysis"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_daily_horoscope",
    description: "Daily horoscope by zodiac sign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getDailyHoroscope.",
      {
        sign: zodiacSignSchema,
        lang: languageSchema,
        date: s.string(
          "Forecast date in YYYY-MM-DD format. Past and future dates are both supported, for editorial scheduling and backfill",
          { format: "date" },
        ),
        timezone: s.string(
          'Selects which period counts as current when date is omitted. Defaults to UTC, so the forecast rolls over at 00:00 UTC on each day. Pass the timezone of the end user to roll over on their local clock instead. Ignored when date is set. Accepts an IANA name (e.g. "America/New_York"), decimal hours (e.g. 5.5 for IST), or a fixed UTC offset (e.g. "-05:00").',
        ),
      },
      { required: ["sign"] },
    ),
    outputSchema: s.object(
      "Daily horoscope retrieved successfully",
      {
        sign: s.string("Zodiac sign for this horoscope."),
        date: s.string("Date of this daily horoscope (YYYY-MM-DD)."),
        overview: s.string(
          "The single most relevant event of the period, whichever life area it touches, read into the whole-sign houses of this sign. The same event that leads column, at lede length rather than developed into a full movement, and checkable against the events array",
        ),
        love: s.string(
          "Love and relationship forecast, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to romance and partnership, plus the standing placements that reach it",
        ),
        career: s.string(
          "Career and professional outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to career, work and reputation, plus the standing placements that reach it",
        ),
        health: s.string(
          "Health, energy, and wellness guidance, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to health, plus the standing placements that reach it",
        ),
        finance: s.string(
          "Financial outlook and money-related guidance, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to finance, plus the standing placements that reach it",
        ),
        advice: s.string(
          "The single actionable takeaway from the leading event of the period, read into the whole-sign houses of this sign and checkable against the events array. Drawn from the same event as overview, kept to a short, actionable pair of sentences rather than grown to match the other sections",
        ),
        column: s.string(
          "The full column for this period, ready to run as one piece, with paragraphs separated by a blank line. Names the events driving it and the dates they fall on, read into the whole-sign houses of this sign",
        ),
        events: s.array(
          "The dated astronomical events this reading is built on, earliest first. Every field in every row can be checked against an independent authority, so a column can be fact-checked before it is published",
          s.looseObject("events item returned by RoxyAPI.", {}),
          {},
        ),
        luckyNumber: s.number(
          "Lucky number for the day, 1 to 9, from the traditional planetary number correspondence applied to the planet that governs this sign today. Not a random draw and not a function of the date.",
        ),
        luckyColor: s.string(
          "Lucky color for the day, drawn from the three colors of the sign element and selected by the planet governing the reading.",
        ),
        compatibleSigns: s.array(
          "Most compatible zodiac signs for this sign. Trine partners (same element) followed by a sextile partner (complementary element)",
          s.string("compatibleSigns item returned by RoxyAPI."),
          {},
        ),
        activeTransits: s.array(
          "Active planetary transits affecting this sign today, with house activations. Each transit shows the planet, its current sign, and which house it activates for the queried sign",
          s.string("activeTransits item returned by RoxyAPI."),
          {},
        ),
        moonSign: s.string("Current Moon sign. Changes every 2-3 days, sets the emotional tone for all signs."),
        moonPhase: s.string(
          "Display name of the current lunar phase, one of the eight standard phases from New Moon through Waning Crescent. Translates in place with the lang parameter, like the moonSign beside it, so render it directly.",
        ),
        energyRating: s.number(
          "Overall energy for this sign today (1-10). Derived from how many aspects are in force between the planets, how tight they are, whether they are harmonious or challenging, and which houses they fall in for this sign, so a busy day rates higher than a quiet one and a harmonious day higher than a hostile one of the same weight",
          { minimum: 1, maximum: 10 },
        ),
      },
      {
        required: [
          "sign",
          "date",
          "overview",
          "love",
          "career",
          "health",
          "finance",
          "advice",
          "column",
          "events",
          "luckyNumber",
          "luckyColor",
          "compatibleSigns",
          "activeTransits",
          "moonSign",
          "moonPhase",
          "energyRating",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_weekly_horoscope",
    description: "Weekly horoscope by zodiac sign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getWeeklyHoroscope.",
      {
        sign: zodiacSignSchema,
        lang: languageSchema,
        date: s.string(
          "Any date inside the target week, in YYYY-MM-DD format. The forecast covers the Monday to Sunday week containing it",
          { format: "date" },
        ),
        timezone: s.string(
          'Selects which period counts as current when date is omitted. Defaults to UTC, so the forecast rolls over at 00:00 UTC on each Monday. Pass the timezone of the end user to roll over on their local clock instead. Ignored when date is set. Accepts an IANA name (e.g. "America/New_York"), decimal hours (e.g. 5.5 for IST), or a fixed UTC offset (e.g. "-05:00").',
        ),
      },
      { required: ["sign"] },
    ),
    outputSchema: s.object(
      "Weekly horoscope retrieved successfully",
      {
        sign: s.string("Zodiac sign for this horoscope."),
        week: s.string("Start date of the forecast week (Monday)."),
        overview: s.string(
          "The single most relevant event of the period, whichever life area it touches, read into the whole-sign houses of this sign. The same event that leads column, at lede length rather than developed into a full movement, and checkable against the events array",
        ),
        love: s.string(
          "Weekly love and relationship forecast, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to romance and partnership, plus the standing placements that reach it",
        ),
        career: s.string(
          "Weekly career and professional outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to career, work and reputation, plus the standing placements that reach it",
        ),
        health: s.string(
          "Weekly health, energy, and wellness guidance, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to health, plus the standing placements that reach it",
        ),
        finance: s.string(
          "Weekly financial outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to finance, plus the standing placements that reach it",
        ),
        advice: s.string(
          "The single actionable takeaway from the leading event of the period, read into the whole-sign houses of this sign and checkable against the events array. Drawn from the same event as overview, kept to a short, actionable pair of sentences rather than grown to match the other sections",
        ),
        column: s.string(
          "The full column for this period, ready to run as one piece, with paragraphs separated by a blank line. Names the events driving it and the dates they fall on, read into the whole-sign houses of this sign",
        ),
        events: s.array(
          "The dated astronomical events this reading is built on, earliest first. Every field in every row can be checked against an independent authority, so a column can be fact-checked before it is published",
          s.looseObject("events item returned by RoxyAPI.", {}),
          {},
        ),
        luckyDays: s.array(
          "The three most favorable days this week, from the planetary rulers of the seven weekdays, ranked by how strongly each of those planets stands for this sign.",
          s.string("luckyDays item returned by RoxyAPI."),
          {},
        ),
        luckyNumbers: s.array(
          "Three lucky numbers for the week, each 1 to 9 and all distinct, from the traditional planetary number correspondence applied to the three planets that govern this sign this week.",
          s.number("luckyNumbers item returned by RoxyAPI."),
          {},
        ),
        compatibleSigns: s.array(
          "Most compatible zodiac signs for this sign. Trine partners (same element) followed by a sextile partner (complementary element).",
          s.string("compatibleSigns item returned by RoxyAPI."),
          {},
        ),
      },
      {
        required: [
          "sign",
          "week",
          "overview",
          "love",
          "career",
          "health",
          "finance",
          "advice",
          "column",
          "events",
          "luckyDays",
          "luckyNumbers",
          "compatibleSigns",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_monthly_horoscope",
    description: "Monthly horoscope by zodiac sign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getMonthlyHoroscope.",
      {
        sign: zodiacSignSchema,
        lang: languageSchema,
        date: s.string(
          "Any date inside the target month, in YYYY-MM-DD format. The forecast covers the whole calendar month containing it",
          { format: "date" },
        ),
        timezone: s.string(
          'Selects which period counts as current when date is omitted. Defaults to UTC, so the forecast rolls over at 00:00 UTC on the 1st. Pass the timezone of the end user to roll over on their local clock instead. Ignored when date is set. Accepts an IANA name (e.g. "America/New_York"), decimal hours (e.g. 5.5 for IST), or a fixed UTC offset (e.g. "-05:00").',
        ),
      },
      { required: ["sign"] },
    ),
    outputSchema: s.object(
      "Monthly horoscope retrieved successfully",
      {
        sign: s.string("Zodiac sign for this horoscope."),
        month: s.string("Month of this forecast (YYYY-MM)."),
        overview: s.string(
          "The single most relevant event of the period, whichever life area it touches, read into the whole-sign houses of this sign. The same event that leads column, at lede length rather than developed into a full movement, and checkable against the events array",
        ),
        love: s.string(
          "Monthly love and relationship forecast, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to romance and partnership, plus the standing placements that reach it",
        ),
        career: s.string(
          "Monthly career and professional outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to career, work and reputation, plus the standing placements that reach it",
        ),
        health: s.string(
          "Monthly health and wellness guidance, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to health, plus the standing placements that reach it",
        ),
        finance: s.string(
          "Monthly financial outlook and guidance, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to finance, plus the standing placements that reach it",
        ),
        advice: s.string(
          "The single actionable takeaway from the leading event of the period, read into the whole-sign houses of this sign and checkable against the events array. Drawn from the same event as overview, kept to a short, actionable pair of sentences rather than grown to match the other sections",
        ),
        column: s.string(
          "The full column for this period, ready to run as one piece, with paragraphs separated by a blank line. Names the events driving it and the dates they fall on, read into the whole-sign houses of this sign",
        ),
        events: s.array(
          "The dated astronomical events this reading is built on, earliest first. Every field in every row can be checked against an independent authority, so a column can be fact-checked before it is published",
          s.looseObject("events item returned by RoxyAPI.", {}),
          {},
        ),
        weekByWeek: s.array(
          "The month read one calendar week at a time, off the same ranked events as column and events[]: the life area each week turns on, and the one thing that area asks for. Two weeks may land in the same area, because two events of a month often do; the sentence beside it is always different",
          s.looseObject("weekByWeek item returned by RoxyAPI.", {}),
          {},
        ),
        keyDates: s.array(
          "The dates to circle this month, earliest first: every lunation and eclipse of the month, plus the headline movements the reading is built on, which are the sign changes of the slower planets and every station with the direction it turns. Each is placed in the whole-sign house it reaches for this sign",
          s.looseObject("keyDates item returned by RoxyAPI.", {}),
          {},
        ),
        luckyNumbers: s.array(
          "Four lucky numbers for the month, each 1 to 9 and all distinct, from the traditional planetary number correspondence applied to the four planets that govern this sign this month.",
          s.number("luckyNumbers item returned by RoxyAPI."),
          {},
        ),
        luckyColor: s.string(
          "Lucky color for the month, drawn from the three colors of the sign element and selected by the planet governing the reading.",
        ),
        compatibleSigns: s.array(
          "Most compatible zodiac signs for this sign. Trine partners (same element) followed by a sextile partner (complementary element).",
          s.string("compatibleSigns item returned by RoxyAPI."),
          {},
        ),
      },
      {
        required: [
          "sign",
          "month",
          "overview",
          "love",
          "career",
          "health",
          "finance",
          "advice",
          "column",
          "events",
          "weekByWeek",
          "keyDates",
          "luckyNumbers",
          "luckyColor",
          "compatibleSigns",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_yearly_horoscope",
    description: "Yearly horoscope by zodiac sign.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getYearlyHoroscope.",
      {
        sign: zodiacSignSchema,
        lang: languageSchema,
        year: s.integer(
          "Calendar year to forecast, 1900 to 2100. Defaults to the current year in the timezone parameter.",
          { minimum: 1900, maximum: 2100 },
        ),
        timezone: s.string(
          'Selects which year counts as current when year is omitted. Defaults to UTC, so the forecast rolls over at 00:00 UTC on January 1. Pass the timezone of the end user to roll over on their local clock instead. Ignored when year is set. Accepts an IANA name (e.g. "America/New_York"), decimal hours (e.g. 5.5 for IST), or a fixed UTC offset (e.g. "-05:00").',
        ),
      },
      { required: ["sign"] },
    ),
    outputSchema: s.object(
      "Yearly horoscope retrieved successfully",
      {
        sign: s.string("Zodiac sign for this horoscope."),
        year: s.integer(
          "Calendar year this forecast covers. Echoes the year requested, or the current year when it was omitted.",
        ),
        overview: s.string(
          "The single most relevant event of the period, whichever life area it touches, read into the whole-sign houses of this sign. The same event that leads column, at lede length rather than developed into a full movement, and checkable against the events array",
        ),
        love: s.string(
          "Yearly love and relationship outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to romance and partnership, plus the standing placements that reach it",
        ),
        career: s.string(
          "Yearly career and professional outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to career, work and reputation, plus the standing placements that reach it",
        ),
        health: s.string(
          "Yearly health, energy, and wellness outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to health, plus the standing placements that reach it",
        ),
        finance: s.string(
          "Yearly financial outlook, read into the whole-sign houses of this sign. The same ranked events that drive column, filtered to finance, plus the standing placements that reach it",
        ),
        advice: s.string(
          "The single actionable takeaway from the leading event of the period, read into the whole-sign houses of this sign and checkable against the events array. Drawn from the same event as overview, kept to a short, actionable pair of sentences rather than grown to match the other sections",
        ),
        column: s.string(
          "The full column for this period, ready to run as one piece, with paragraphs separated by a blank line. Names the events driving it and the dates they fall on, read into the whole-sign houses of this sign",
        ),
        events: s.array(
          "The dated astronomical events this reading is built on, earliest first. Every field in every row can be checked against an independent authority, so a column can be fact-checked before it is published",
          s.looseObject("events item returned by RoxyAPI.", {}),
          {},
        ),
        themes: s.array(
          "The backdrop of the year: which whole-sign house each slow-moving body occupies for this sign, Jupiter first and Pluto last. One row per unbroken stretch, so a body that stays put is a single row spanning the year and a body that changes sign is two rows with the exact date between them",
          s.looseObject("themes item returned by RoxyAPI.", {}),
          {},
        ),
        eclipses: s.array(
          "Every solar and lunar eclipse of the year, with the house each one falls in for this sign. Usually four to six, and the dates match the published eclipse canon.",
          s.looseObject("eclipses item returned by RoxyAPI.", {}),
          {},
        ),
        retrogrades: s.array(
          "Every retrograde and direct station of the year, in order, with the house each falls in for this sign. Drives review windows and the not-yet warnings a yearly column is bought for.",
          s.looseObject("retrogrades item returned by RoxyAPI.", {}),
          {},
        ),
        keyPeriods: s.array(
          "The year as a calendar of life areas: for each whole-sign house, the single dated stretch that most strongly activates it, ordered by start date. Twelve rows in a full year, one per house, so every life area gets a date range and none is named twice",
          s.looseObject("keyPeriods item returned by RoxyAPI.", {}),
          {},
        ),
        bestPeriods: s.looseObject(
          "The easiest month of the year for each of the four topic sections, by how many exact harmonious aspects (sextiles and trines) fall in that month and land in the houses that govern the area for this sign. An area is omitted only in the rare year that carries no harmonious aspect for it at all, so treat each key as optional",
          {},
        ),
        luckyNumbers: s.array(
          "Four lucky numbers for the year, each 1 to 9 and all distinct, from the traditional planetary number correspondence applied to the four planets that govern this sign this year.",
          s.number("luckyNumbers item returned by RoxyAPI."),
          {},
        ),
        luckyColor: s.string(
          "Lucky color for the year, drawn from the three colors of the sign element and selected by the planet governing the reading.",
        ),
        compatibleSigns: s.array(
          "Most compatible zodiac signs for this sign. Trine partners (same element) followed by a sextile partner (complementary element).",
          s.string("compatibleSigns item returned by RoxyAPI."),
          {},
        ),
      },
      {
        required: [
          "sign",
          "year",
          "overview",
          "love",
          "career",
          "health",
          "finance",
          "advice",
          "column",
          "events",
          "themes",
          "eclipses",
          "retrogrades",
          "keyPeriods",
          "bestPeriods",
          "luckyNumbers",
          "luckyColor",
          "compatibleSigns",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bazi_chart",
    description:
      "Generate BaZi chart. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for generateBaziChart.",
      {
        date: s.string("Birth date in YYYY-MM-DD format. Sets the year, month and day pillars", {
          format: "date",
        }),
        time: s.string(
          "Birth time in 24-hour HH:MM:SS format. Sets the hour pillar, which is one of the four and carries the whole picture of later life and offspring",
          { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
        ),
        timezone: s.anyOf(
          'IANA name (e.g. "America/New_York", "Europe/London", "UTC"), decimal hours (e.g. -5 for EST, 1 for CET), or a fixed UTC offset (e.g. "-05:00", "+01:00"). Prefer the IANA name: it is resolved to the offset in force at the birth date and time, historical daylight-saving rules included, while a fixed offset or decimal is taken literally and will be wrong if it does not match the daylight-saving state at that moment. On a transition day a time in the repeated hour is read as its first occurrence and a time in the skipped hour is moved forward past the gap. Invalid timezones return 400 with a validation error.',
          [
            s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
            s.string("IANA timezone name, such as America/New_York."),
          ],
        ),
        latitude: s.number(
          "Birth latitude in decimal degrees. Accepted for consistency with the other birth-data endpoints and does not affect any part of a BaZi chart",
          { minimum: -90, maximum: 90 },
        ),
        longitude: s.number("Birth longitude in decimal degrees. Positive is East, negative is West", {
          minimum: -180,
          maximum: 180,
        }),
        dayBoundary: s.stringEnum(
          'Which instant starts the sexagenary DAY, which only matters for a birth between 23:00 and 23:59. "midnight" is the classical position of the Ming compendium San Ming Tong Hui: the day turns at 00:00 and 23:00 to 23:59 is the late zi hour of the day that is ending, so the hour stem is taken from that day. "early-zi" turns the whole day at 23:00, the practice in Hong Kong, Taiwan and much of South East Asia. "split-zi" is the compromise most software implements and the default here: the day still turns at 00:00, but the hour stem is taken from the next day. The three give three different answers for a late-evening birth and identical answers for every other birth.',
          ["split-zi", "midnight", "early-zi"],
        ),
        yearBoundary: s.stringEnum(
          'Which instant starts the sexagenary YEAR. "li-chun" is Beginning of Spring, around 4 February, and is the classical rule every BaZi text uses, so it is the default on this endpoint. "lunar-new-year" is the folk rule people mean when they say which animal they are, and it falls between late January and late February. The two disagree for any birth in the weeks between them: 14 February 2026 is a Wood Snake year under lunar-new-year and a Fire Horse year under li-chun.',
          ["li-chun", "lunar-new-year"],
        ),
        hourClock: s.stringEnum(
          'Which clock the day boundary and the hour branch are read from, so a correction that carries a birth across midnight moves the day pillar with the hour. "clock" is civil time exactly as a birth certificate records it, which is what most calculators use and the default here. "local-mean" shifts to the mean sun over the birth longitude, a correction of up to 59 minutes at the edge of a wide time zone. "solar" adds the equation of time on top of that, up to a further 16 minutes. Both non-civil options need "longitude" in the request and return 400 without it.',
          ["clock", "local-mean", "solar"],
        ),
        lang: languageSchema,
      },
      { required: ["date", "time", "timezone"] },
    ),
    outputSchema: s.object(
      "Four pillars, Day Master, element balance, interactions, and the conventions",
      {
        birthData: s.looseObject("Echo of the birth moment the chart was computed from.", {}),
        conventions: s.looseObject(
          "The three school conventions this result was computed under. Returned on every BaZi response so a chart is self-describing: two calculators can produce different pillars for one birth and both be correct, and this object says which reading you are holding.",
          {},
        ),
        pillars: s.array(
          "The four pillars, year first. Each carries its stem, its branch, the hidden stems stored in the branch, the Ten God relation to the Day Master, and the Na Yin sound element of the pair.",
          s.looseObject("pillars item returned by RoxyAPI.", {}),
          {},
        ),
        dayMaster: s.looseObject(
          "The day stem, which is the subject of the whole chart. Everything else in the response is named by what it does to this one.",
          {},
        ),
        zodiacAnimal: s.string(
          "Zodiac animal of the year branch, under the year boundary this request applied. Always English, whatever the lang parameter says",
        ),
        zodiacAnimalLocalized: s.string(
          "Zodiac animal name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        fiveElements: s.array(
          "Element balance across the eight chart characters, one entry per phase, with the reading for how represented each one is.",
          s.looseObject("fiveElements item returned by RoxyAPI.", {}),
          {},
        ),
        interactions: s.array(
          "Combinations, clashes, harms and punishments running between the four pillars. An empty array means the four pillars stand independently of each other, which is common and is not a defect.",
          s.looseObject("interactions item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.string(
          "One-paragraph reading composed from the Day Master nature and the seasonal state of its element in the birth month. The narrative entry point for a chart, for a consumer that renders one block before the detail.",
        ),
      },
      {
        required: [
          "birthData",
          "conventions",
          "pillars",
          "dayMaster",
          "zodiacAnimal",
          "fiveElements",
          "interactions",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bazi_compatibility",
    description:
      "Calculate BaZi compatibility. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for calculateBaziCompatibility.",
      { personA: baziPersonSchema, personB: baziPersonSchema, lang: languageSchema },
      { required: ["personA", "personB"] },
    ),
    outputSchema: s.object(
      "Both charts, the cross-chart interactions, and the compatibility score",
      {
        personA: s.looseObject("Resolved chart of the first person.", {}),
        personB: s.looseObject("Resolved chart of the second person.", {}),
        dayMasterRelation: s.string(
          "How the two Day Masters stand to each other by the five-phase cycle, read from person A. peer means the same element, output means A generates B, wealth means A controls B, influence means B controls A, resource means B generates A",
        ),
        interactions: s.array(
          "Every combination, clash, harm and punishment that crosses between the two charts, with each position prefixed by its subject. Only cross-chart pairs are searched: a three-branch formation assembled from two different people is not a formation either chart holds, so trines are not reported here.",
          s.looseObject("interactions item returned by RoxyAPI.", {}),
          {},
        ),
        score: s.number(
          "Compatibility score from 0 to 100. A RoxyAPI tally over the interactions listed above rather than a figure from any classical text: it starts at a neutral 50, adds for each binding interaction and subtracts for each breaking one",
        ),
        harmoniousCount: s.number("How many of the interactions bind the two charts together."),
        challengingCount: s.number("How many of the interactions break between them."),
        summary: s.string("One-paragraph reading of the balance between binding and breaking interactions."),
      },
      {
        required: [
          "personA",
          "personB",
          "dayMasterRelation",
          "interactions",
          "score",
          "harmoniousCount",
          "challengingCount",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bodygraph",
    description:
      "Generate full Human Design bodygraph. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for generateBodygraph.",
      {
        date: s.string(
          "Birth date in YYYY-MM-DD format. The anchor for both the Personality activations at birth and the Design activations 88 degrees of solar arc earlier.",
          { format: "date" },
        ),
        time: s.string(
          "Birth time in 24-hour HH:MM:SS format. Precision matters: the profile lines and gate boundaries shift with the exact minute of birth.",
          { pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$" },
        ),
        timezone: s.anyOf(
          'IANA name (e.g. "America/New_York", "Europe/London", "UTC"), decimal hours (e.g. -5 for EST, 1 for CET), or a fixed UTC offset (e.g. "-05:00", "+01:00"). Prefer the IANA name: it is resolved to the offset in force at the birth date and time, historical daylight-saving rules included, while a fixed offset or decimal is taken literally and will be wrong if it does not match the daylight-saving state at that moment. On a transition day a time in the repeated hour is read as its first occurrence and a time in the skipped hour is moved forward past the gap. Invalid timezones return 400 with a validation error.',
          [
            s.number("UTC offset in decimal hours.", { minimum: -14, maximum: 14 }),
            s.string("IANA timezone name, such as America/New_York."),
          ],
        ),
        latitude: s.number(
          "Birth latitude in decimal degrees. Optional and does not affect the bodygraph, which depends only on ecliptic longitudes",
          { minimum: -90, maximum: 90 },
        ),
        longitude: s.number("Birth longitude in decimal degrees. Optional and does not affect the bodygraph", {
          minimum: -180,
          maximum: 180,
        }),
        nodeType: s.stringEnum(
          'Lunar node convention. "mean" is the smoothed average node, which always moves retrograde; "true" is the osculating node, which tracks the real perturbed node, oscillates up to about 1.5 degrees either side of the mean on a 173-day cycle, and can briefly turn direct',
          ["mean", "true"],
        ),
        lang: languageSchema,
      },
      { required: ["date", "time", "timezone"] },
    ),
    outputSchema: s.object(
      "Complete bodygraph with type, authority, profile, centers, channels, and gates",
      {
        type: s.string(
          "Human Design energy type. One of Manifestor, Generator, Manifesting Generator, Projector, Reflector",
        ),
        typeLocalized: s.string(
          "Energy type name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        typeDescription: s.string(
          "What the aura of this type does and how it is designed to engage life. The grounding text for the type label, so a consuming agent does not have to supply the meaning itself.",
        ),
        aura: s.string(
          "The aura mechanic of the type: how the energy field itself operates, for example open and enveloping, or closed and repelling.",
        ),
        strategy: s.string(
          "The aura strategy for engaging life correctly for this type. Always English, whatever the lang parameter says",
        ),
        strategyLocalized: s.string(
          "Strategy name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        strategyDescription: s.string(
          "How to actually apply the strategy. The strategy field alone is a bare label such as Respond or Inform; this is the operating instruction behind it.",
        ),
        authority: s.string(
          "Inner authority for decision making. One of Emotional, Sacral, Splenic, Ego, Self-Projected, Mental, Lunar",
        ),
        authorityLocalized: s.string(
          "Inner authority name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        authorityDescription: s.string(
          "How the decision is made, the timing it requires, and the characteristic trap. Inner authority is the most actionable output of a Human Design chart, so this is the field to lean on when grounding a reading.",
        ),
        signature: s.string(
          "The signature feeling of living in alignment with the type. Always English, whatever the lang parameter says",
        ),
        signatureLocalized: s.string(
          "Signature theme name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        notSelf: s.string(
          "The not-self theme, the recurring feeling that signals being out of alignment. Always English, whatever the lang parameter says",
        ),
        notSelfLocalized: s.string(
          "Not-self theme name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        profile: s.string(
          "Profile in conscious/unconscious form from the Personality Sun line over the Design Sun line.",
        ),
        profileKeynotes: s.looseObject(
          "The two line keynotes the profile is built from, conscious over unconscious, so the profile is readable without a separate lookup.",
          {},
        ),
        profileDescription: s.string(
          "Meaning of the combined profile. A profile is not the sum of its two lines: 6/2 has its own meaning that neither the line 6 nor the line 2 keynote carries alone.",
        ),
        definition: s.string(
          "Definition type from the number of connected components among defined centers. One of None, Single, Split, Triple Split, Quadruple Split",
        ),
        definitionLocalized: s.string(
          "Definition type name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        definitionDescription: s.string(
          "How energy flows through the defined centers in this configuration, and what the configuration needs. For a split, this is where the bridging gates of other people matter.",
        ),
        sides: s.looseObject(
          "What the two chart sides are: personality is the conscious mind side, design is the unconscious body side computed 88 degrees of solar arc before birth. Returned once at the top level rather than repeated across all 26 activations.",
          {},
        ),
        designInstantUtc: s.string(
          "The Design moment as an ISO 8601 UTC instant: the exact time the Sun stood 88 degrees of solar arc before its natal longitude, and the instant every Design activation was computed at. Compare it with the Design date a reference tool prints to validate the chart on the moment itself.",
        ),
        incarnationCross: s.looseObject(
          "The incarnation cross built from the four cardinal gates and the profile angle.",
          {},
        ),
        centers: s.array(
          "All nine centers with their defined state and active gates.",
          s.looseObject("centers item returned by RoxyAPI.", {}),
          {},
        ),
        channels: s.array(
          "The defined channels where both gates are activated.",
          s.looseObject("channels item returned by RoxyAPI.", {}),
          {},
        ),
        gates: s.array(
          "All 26 activations, 13 Personality and 13 Design.",
          s.looseObject("gates item returned by RoxyAPI.", {}),
          {},
        ),
      },
      {
        required: [
          "type",
          "typeDescription",
          "aura",
          "strategy",
          "strategyDescription",
          "authority",
          "authorityDescription",
          "signature",
          "notSelf",
          "profile",
          "profileKeynotes",
          "profileDescription",
          "definition",
          "definitionDescription",
          "sides",
          "designInstantUtc",
          "incarnationCross",
          "centers",
          "channels",
          "gates",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_human_design_connection",
    description:
      "Calculate Human Design connection chart. Resolve ambiguous places with search_cities first; prefer an IANA timezone for historical daylight saving.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for calculateConnection.",
      { personA: humanDesignPersonSchema, personB: humanDesignPersonSchema, lang: languageSchema },
      { required: ["personA", "personB"] },
    ),
    outputSchema: s.object(
      "Connection chart with per-channel dynamics, combined centers, definition, and a dynamic count",
      {
        totalChannels: s.number(
          "Total number of connected channels between the two people. Equals the length of channels and the sum of the summary counts.",
        ),
        channels: s.array(
          "Every connected channel between the two people with its dynamic. A channel is connected when the two people together hold both of its gates.",
          s.looseObject("channels item returned by RoxyAPI.", {}),
          {},
        ),
        centers: s.array(
          "All nine centers with their defined state in the combined connection bodygraph and which person defines each.",
          s.looseObject("centers item returned by RoxyAPI.", {}),
          {},
        ),
        combinedDefinition: s.string(
          "Definition of the combined connection bodygraph from connected components among its defined centers. One of None, Single, Split, Triple Split, Quadruple Split",
        ),
        combinedDefinitionLocalized: s.string(
          "Combined definition name in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        summary: s.looseObject("Count of each connection dynamic across all connected channels.", {}),
      },
      {
        required: ["totalChannels", "channels", "centers", "combinedDefinition", "summary"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_numerology_chart",
    description: "Generate numerology chart.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for generateNumerologyChart.",
      {
        fullName: s.string(
          "Full birth name as it appears on the birth certificate. Used for every letter-based number in the chart: Expression, Soul Urge, Personality, Karmic Lessons, Hidden Passion, Subconscious Self and the special letters",
          { minLength: 1, maxLength: 200 },
        ),
        year: s.integer(
          "Birth year between 100 and 2100. Supports historical figures like Einstein (1879) and Shakespeare (1564).",
          { minimum: 100, maximum: 2100 },
        ),
        month: s.integer("Birth month (1-12)", { minimum: 1, maximum: 12 }),
        day: s.integer("Birth day (1-31)", { minimum: 1, maximum: 31 }),
        currentYear: s.integer(
          "Calendar year for the Personal Year, defaults to the current UTC year. It moves the Personal Year only: the nested personalMonth and maturityStatus.currentAge always read the current UTC date.",
          { minimum: 100, maximum: 2100 },
        ),
        lang: languageSchema,
      },
      { required: ["fullName", "year", "month", "day"] },
    ),
    outputSchema: s.object(
      "Successfully generated complete numerology chart",
      {
        profile: s.looseObject("Input profile data used to generate the chart.", {}),
        coreNumbers: s.looseObject(
          "Six core numerology numbers with full interpretations. The foundation of any complete numerology reading.",
          {},
        ),
        additionalInsights: s.looseObject(
          "Additional numerology insights: karmic analysis, yearly/monthly forecasts, pinnacles, challenges, hidden passion, subconscious self, and name letter analysis.",
          {},
        ),
        birthDayProfile: s.looseObject(
          "Birth Day profile with day-specific meaning (1-31). Unlike the core Birth Day number, this provides unique interpretation per calendar day.",
          {},
        ),
        maturityStatus: s.looseObject("Maturity number activation status based on current age.", {}),
        luckyAssociations: s.looseObject(
          "Lucky associations based on Life Path number: colors, gemstones, day, element, planet, and compatibility.",
          {},
        ),
        summary: s.string(
          "AI-ready holistic summary weaving all core numbers, karmic insights, and yearly forecast into a cohesive narrative. Ideal for generating personalized reports, chatbot responses, or one-page numerology overviews.",
        ),
      },
      {
        required: ["profile", "coreNumbers", "additionalInsights", "maturityStatus", "summary"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_numerology_compatibility",
    description: "Calculate numerology compatibility.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for calculateNumCompatibility.",
      { person1: numerologyPersonSchema, person2: numerologyPersonSchema, lang: languageSchema },
      { required: ["person1", "person2"] },
    ),
    outputSchema: s.object(
      "Successfully calculated compatibility with detailed analysis",
      {
        overallScore: s.number(
          "Overall compatibility score: 50% Life Path, 30% Expression and 20% Soul Urge pair scores, rounded. Every pair score runs 50 to 100, so the overall score does too.",
        ),
        rating: s.string(
          "Compatibility rating from overallScore: Highly Compatible (90 and up), Very Compatible (75 to 89), Compatible (60 to 74) or Moderately Compatible (50 to 59). The scale also names Challenging below 45, which no pair of core numbers reaches.",
        ),
        lifePath: s.looseObject("lifePath returned by RoxyAPI.", {}),
        expression: s.looseObject("expression returned by RoxyAPI.", {}),
        soulUrge: s.looseObject("soulUrge returned by RoxyAPI.", {}),
        strengths: s.array("Key relationship strengths", s.string("strengths item returned by RoxyAPI."), {}),
        challenges: s.array("Potential relationship challenges", s.string("challenges item returned by RoxyAPI."), {}),
        advice: s.string("Practical relationship advice"),
      },
      {
        required: ["overallScore", "rating", "lifePath", "expression", "soulUrge", "strengths", "challenges", "advice"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "list_tarot_cards",
    description: "List all 78 tarot cards.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for listCards.",
      {
        lang: languageSchema,
        limit: s.integer("Maximum items to return per page. Range: 1-100, default 20.", {
          minimum: 1,
          maximum: 100,
        }),
        offset: s.integer("Number of items to skip for pagination. Default 0.", { minimum: 0 }),
        arcana: s.stringEnum(
          "Filter by arcana type. Major arcana (0-21) represents life lessons and spiritual themes",
          ["major", "minor"],
        ),
        suit: s.stringEnum(
          "Filter minor arcana by suit. Cups=emotions/relationships, Wands=creativity/passion, Swords=intellect/conflict, Pentacles=material/finances",
          ["cups", "wands", "swords", "pentacles"],
        ),
        number: s.integer("Filter by card number. Major Arcana: 0 (The Fool) through 21 (The World)", {
          minimum: 0,
          maximum: 21,
        }),
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "List of tarot cards with basic information. Use GET /cards/{id} for full details.",
      {
        total: s.number(
          "Total number of tarot cards matching the applied filters. 78 for the full deck, 22 for Major Arcana, 56 for Minor Arcana, 14 per suit.",
        ),
        limit: s.number("Maximum items returned per page."),
        offset: s.number("Number of items skipped from the start of the result set."),
        cards: s.array(
          "Array of tarot cards with basic metadata. Use GET /cards/{id} for full upright and reversed interpretations.",
          s.looseObject("cards item returned by RoxyAPI.", {}),
          {},
        ),
      },
      { required: ["total", "limit", "offset", "cards"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_tarot_card",
    description: "Get tarot card by id.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getCard.",
      {
        id: s.string('Card identifier. Major arcana: "fool", "magician", "death"'),
        lang: languageSchema,
      },
      { required: ["id"] },
    ),
    outputSchema: s.object(
      "Card details",
      {
        id: s.string(
          "Unique card identifier in kebab-case, with no leading article on Major Arcana (e.g. fool, star, ace-of-cups, queen-of-swords)",
        ),
        name: s.string("Display name of the tarot card as it appears in the Rider-Waite-Smith tradition."),
        arcana: s.stringEnum(
          "Whether this card belongs to the Major Arcana (22 trump cards representing major life themes) or Minor Arcana (56 suit cards for daily situations).",
          ["major", "minor"],
        ),
        suit: s.stringEnum(
          "Suit of the card (Minor Arcana only). Cups=emotions, Wands=creativity, Swords=intellect, Pentacles=material",
          ["cups", "wands", "swords", "pentacles"],
        ),
        number: s.number("Card number within its arcana. Major Arcana: 0 (Fool) through 21 (World)"),
        keywords: s.looseObject(
          "Keywords for both upright and reversed orientations of this tarot card, useful for quick divination reference.",
          {},
        ),
        upright: s.looseObject(
          "Complete upright interpretation including description, keywords, and guidance across love, career, finances, health, and spirituality domains.",
          {},
        ),
        reversed: s.looseObject(
          "Complete reversed (inverted) interpretation including description, keywords, and guidance across love, career, finances, health, and spirituality domains. Reversed cards carry modified or blocked energy.",
          {},
        ),
        imageUrl: s.string("URL to the tarot card artwork image in the Rider-Waite-Smith style."),
      },
      {
        required: ["id", "name", "arcana", "number", "keywords", "upright", "reversed", "imageUrl"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "draw_tarot_cards",
    description: "Draw tarot cards.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for drawCards.",
      {
        count: s.integer(
          "Number of cards to draw (1-78). Common values: 1 for daily card, 3 for past-present-future, 5 for relationship spread, 10 for Celtic Cross",
          { minimum: 1, maximum: 78 },
        ),
        seed: s.string(
          'Optional seed for reproducible results. Same seed = same cards in same order. Use format like "userId-date" for daily consistency, or "readingId" for shareable readings. Omit for true randomness.',
        ),
        allowReversals: s.boolean(
          "Whether cards can appear reversed (upside down). Reversed cards have different meanings",
        ),
        allowDuplicates: s.boolean(
          "Whether same card can be drawn multiple times. Set false for traditional deck behavior (each card drawn only once)",
        ),
        lang: languageSchema,
      },
      { required: ["count"] },
    ),
    outputSchema: s.object(
      "Drawn cards",
      {
        seed: s.string(
          "Seed used for this reading, if one was provided. Same seed reproduces identical draw results for consistent tarot readings.",
        ),
        cards: s.array(
          "Array of drawn tarot cards in draw order, each with orientation, keywords, and full meaning for divination.",
          s.looseObject("cards item returned by RoxyAPI.", {}),
          {},
        ),
      },
      { required: ["cards"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_daily_tarot",
    description: "Daily tarot card.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for getDailyCard.",
      {
        seed: s.string(
          "Optional seed for reproducible readings. Same seed + same date = same card every time. Pass any unique identifier (userId, email hash, session token). Omit for anonymous daily readings.",
        ),
        date: s.string("Date for the reading in YYYY-MM-DD format. Defaults to today (UTC)", {
          format: "date",
        }),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Daily card reading",
      {
        date: s.string(
          "Date of the daily tarot reading in YYYY-MM-DD format (UTC). Determines which card is drawn for seeded readings.",
        ),
        seed: s.string(
          "Seed used for this daily reading. Same seed on the same date always produces the identical card for reproducible daily divination.",
        ),
        card: s.looseObject("card returned by RoxyAPI.", {}),
        dailyMessage: s.string(
          "Concise daily tarot message summarizing the card, its orientation, key themes, and brief guidance for the day.",
        ),
      },
      { required: ["date", "seed", "card", "dailyMessage"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_yes_no_tarot",
    description: "Yes or no answer.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castYesNo.",
      {
        question: s.string("Your specific yes/no question. Be clear and focused"),
        seed: s.string(
          "Optional seed for reproducible results. Same seed + same question = same answer. Useful for testing, sharing readings, or ensuring consistency. Omit for random draws each time.",
        ),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Yes/No answer with interpretation",
      {
        question: s.string("The querent question that was asked, if one was provided."),
        seed: s.string(
          "The seed used for this draw, echoed back when one was supplied. Present only if the request carried a seed. Makes a cached or forwarded response self describing, so a reading can be reproduced or shared without the original request beside it.",
        ),
        answer: s.stringEnum("Tarot-derived answer. Yes = upright card supports a positive outcome", [
          "Yes",
          "No",
          "Maybe",
        ]),
        answerLocalized: s.string(
          "Answer in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        strength: s.stringEnum(
          "Confidence level of the answer. Strong = Major Arcana card drawn (powerful, definitive cosmic energy)",
          ["Strong", "Qualified"],
        ),
        strengthLocalized: s.string(
          "Answer strength in the requested language, for display only. Present only when lang is set to a language other than English, since in English it would repeat its canonical partner field exactly",
        ),
        card: s.looseObject("card returned by RoxyAPI.", {}),
        interpretation: s.string(
          "Contextual narrative explaining why this card answers the question with this result. Connects card meaning, orientation, and arcana strength into actionable guidance.",
        ),
      },
      { required: ["answer", "strength", "card", "interpretation"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_three_card_tarot",
    description: "Three card spread, past present future.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castThreeCard.",
      {
        question: s.string(
          'Optional specific question to focus the reading. Examples: "What should I know about my relationship?", "How can I improve my finances?", "What is blocking my creative growth?" Leave empty for general guidance.',
        ),
        seed: s.string(
          "Optional seed for reproducible results. Same seed = same 3 cards in same positions. Useful for sharing readings, testing, or ensuring users get consistent results. Omit for random draws.",
        ),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Three-card spread reading",
      {
        spread: s.string("Name of the tarot spread used (e.g. Three-Card, Celtic Cross, Career, Love)."),
        question: s.string("The querent question, if one was provided."),
        seed: s.string("Seed used for this reading, if one was provided. Same seed reproduces identical results."),
        positions: s.array(
          "Array of spread positions, each containing a drawn card with position-specific tarot interpretation.",
          s.looseObject("positions item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.string(
          "Narrative summary that connects the cards drawn across the spread positions into one cohesive reading.",
        ),
      },
      { required: ["spread", "positions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_celtic_cross_tarot",
    description: "Celtic Cross spread, 10 cards.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castCelticCross.",
      {
        question: s.string(
          "Optional querent question to focus the Celtic Cross. It is echoed back on the reading and gives the ten positions their context",
        ),
        seed: s.string(
          "Optional seed for reproducible results. The same seed always draws the same ten cards into the same Celtic Cross positions, which is what lets a reading be shared or re-rendered. Omit for a random draw.",
        ),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Celtic Cross spread reading",
      {
        spread: s.string("Name of the tarot spread used (e.g. Three-Card, Celtic Cross, Career, Love)."),
        question: s.string("The querent question, if one was provided."),
        seed: s.string("Seed used for this reading, if one was provided. Same seed reproduces identical results."),
        positions: s.array(
          "Array of 10 spread positions forming the complete Celtic Cross layout, each with a drawn card and position-specific interpretation.",
          s.looseObject("positions item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.string(
          "Narrative summary that connects the cards drawn across the spread positions into one cohesive reading.",
        ),
      },
      { required: ["spread", "positions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_love_tarot",
    description: "Love spread, 5 cards.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castLoveSpread.",
      {
        question: s.string(
          "Optional querent question to focus the love spread. It is echoed back on the reading and gives the five relationship positions their context",
        ),
        seed: s.string(
          "Optional seed for reproducible results. The same seed always draws the same five cards into the same love positions, which is what lets a reading be shared or re-rendered. Omit for a random draw.",
        ),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Love spread reading",
      {
        spread: s.string("Name of the tarot spread used (e.g. Three-Card, Celtic Cross, Career, Love)."),
        question: s.string("The querent question, if one was provided."),
        seed: s.string("Seed used for this reading, if one was provided. Same seed reproduces identical results."),
        positions: s.array(
          "Array of 5 love spread positions exploring relationship dynamics, each with a drawn card and position-specific interpretation.",
          s.looseObject("positions item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.string(
          "Narrative summary that connects the cards drawn across the spread positions into one cohesive reading.",
        ),
      },
      { required: ["spread", "positions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_career_tarot",
    description: "Career spread, 7 cards.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castCareerSpread.",
      {
        question: s.string(
          "Optional querent question to focus the career spread. It is echoed back on the reading and gives the seven career positions their context",
        ),
        seed: s.string(
          "Optional seed for reproducible results. The same seed always draws the same seven cards into the same career positions, which is what lets a reading be shared or re-rendered. Omit for a random draw.",
        ),
        lang: languageSchema,
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Career spread reading",
      {
        spread: s.string("Name of the tarot spread used (e.g. Three-Card, Celtic Cross, Career, Love)."),
        question: s.string("The querent question, if one was provided."),
        seed: s.string("Seed used for this reading, if one was provided. Same seed reproduces identical results."),
        positions: s.array(
          "Array of 7 career spread positions using SWOT framework, each with a drawn card and position-specific interpretation.",
          s.looseObject("positions item returned by RoxyAPI.", {}),
          {},
        ),
        summary: s.string(
          "Narrative summary that connects the cards drawn across the spread positions into one cohesive reading.",
        ),
      },
      { required: ["spread", "positions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_custom_tarot",
    description: "Custom spread builder.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castCustomSpread.",
      {
        spreadName: s.string(
          "Optional name for your custom tarot spread layout. Used as the spread identifier in the response.",
        ),
        positions: s.array(
          "Array of 1-10 custom position definitions for your tarot spread. Each position gets one drawn card with a position-specific interpretation.",
          s.object(
            "positions item returned by RoxyAPI.",
            {
              name: s.string("Name for this position in the spread (e.g. Core Issue, Hidden Factor, Best Action)"),
              interpretation: s.string(
                "Description of what this position reveals in the reading. Guides the tarot interpretation for the card drawn in this slot.",
              ),
            },
            { required: ["name", "interpretation"] },
          ),
          { minItems: 1, maxItems: 10 },
        ),
        question: s.string(
          "Optional querent question to focus the custom tarot reading. Provides context for position-specific interpretations.",
        ),
        seed: s.string(
          "Optional seed for reproducible results. Same seed with the same positions produces identical card draws for consistent divination.",
        ),
        lang: languageSchema,
      },
      { required: ["positions"] },
    ),
    outputSchema: s.object(
      "Custom spread reading",
      {
        spread: s.string("Name of the tarot spread used (e.g. Three-Card, Celtic Cross, Career, Love)."),
        question: s.string("The querent question, if one was provided."),
        seed: s.string("Seed used for this reading, if one was provided. Same seed reproduces identical results."),
        positions: s.array(
          "Array of custom spread positions matching your defined layout, each with a drawn card and position-specific interpretation.",
          s.looseObject("positions item returned by RoxyAPI.", {}),
          {},
        ),
      },
      { required: ["spread", "positions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "cast_iching",
    description: "Cast an I-Ching reading.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for castReading.",
      {
        lang: languageSchema,
        seed: s.string(
          "Optional seed for reproducible castings. Same seed = same casting every time. Pass any unique identifier (userId, session token, question hash). Omit for random casting.",
        ),
      },
      { required: [] },
    ),
    outputSchema: s.object(
      "Complete I-Ching reading with primary and resulting hexagrams.",
      {
        seed: s.string("The seed used for this casting (if provided)"),
        hexagram: s.looseObject("Primary hexagram from the casting", {}),
        lines: s.array(
          "Line values (6-9) from bottom to top. 6=old yin (changing), 7=young yang, 8=young yin, 9=old yang (changing)",
          s.number("lines item returned by RoxyAPI."),
          {},
        ),
        changingLinePositions: s.array(
          "Positions of changing lines (1-6, bottom to top)",
          s.number("changingLinePositions item returned by RoxyAPI."),
          {},
        ),
        resultingHexagram: s.looseObject(
          "Hexagram the primary transforms into after changing lines (present only if there are changing lines)",
          {},
        ),
      },
      { required: ["lines", "changingLinePositions"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_forecast_timeline",
    description:
      "Build a personal, cross-domain forecast timeline. The provider clamps the window to at most 90 days and caps events at 200; use returned startDate and endDate as the resolved window.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for generateTimeline.",
      {
        birthData: forecastBirthSchema,
        startDate: s.string("First day of the forecast window in YYYY-MM-DD format. Defaults to today in UTC.", {
          format: "date",
        }),
        endDate: s.string(
          "Last day of the forecast window in YYYY-MM-DD format. Defaults to startDate plus 30 days. The window is clamped to a maximum of 90 days from startDate.",
          { format: "date" },
        ),
        domains: s.array(
          "Which forecast domains to include. Defaults to all three. Pass a subset to scope the timeline to one or two engines.",
          s.stringEnum(
            "Forecast domain. western covers transit aspects, sign ingresses, retrograde stations, eclipses, and new and full moons. vedic covers Vimshottari mahadasha, antardasha, and pratyantardasha boundaries. biorhythm covers critical days.",
            ["western", "vedic", "biorhythm"],
          ),
          {},
        ),
        minSignificance: s.number(
          "Drop events scoring below this significance threshold from 0 to 100. Defaults to 0, keeping all events.",
          { minimum: 0, maximum: 100 },
        ),
        domainWeights: forecastDomainWeightsSchema,
        lang: languageSchema,
      },
      { required: ["birthData"] },
    ),
    outputSchema: s.object(
      "Merged forecast timeline with time-ordered events across the requested domains",
      {
        birthData: s.looseObject("Echo of the birth subject this forecast was built for.", {}),
        startDate: s.string("First day of the resolved forecast window."),
        endDate: s.string("Last day of the resolved forecast window after the horizon clamp."),
        count: s.number("Number of events in the timeline after deduplication, filtering, and the event cap."),
        events: s.array(
          "The merged, time-ordered forecast events across the requested domains.",
          s.object(
            "The events item.",
            {
              date: s.string("Calendar date of the event in YYYY-MM-DD (UTC)."),
              datetime: s.string(
                "Exact instant of the event as an ISO-8601 UTC datetime, to the nearest second. Astronomical events are refined to this instant by search, not reported at a daily sample point; a dasha-change is the period boundary itself, counted from the birth instant.",
              ),
              domain: s.string(
                "Forecast domain. western covers transit aspects, sign ingresses, retrograde stations, eclipses, and new and full moons. vedic covers Vimshottari mahadasha, antardasha, and pratyantardasha boundaries. biorhythm covers critical days. A stable machine value, never localized, so consumers can branch on it under any language.",
              ),
              type: s.string(
                "Event kind. transit-aspect, sign-ingress, retrograde-station, eclipse, and lunar-phase are western, dasha-change is vedic Vimshottari, critical-day is biorhythm. A stable machine value, never localized, so consumers can branch on it under any language.",
              ),
              body: s.string(
                "Primary subject of the event. A transiting planet for western events, Sun for a solar eclipse, Moon for a lunar eclipse or a new or full moon, or the critical cycle for biorhythm days. For a dasha-change, the Vimshottari lords outermost first, joined by a hyphen, then one space and the level: Saturn Mahadasha, Saturn-Mercury Antardasha, Saturn-Mercury-Ketu Pratyantardasha. Lords are always one of Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury. Never localized.",
              ),
              target: s.string(
                "For a transit-aspect, the natal body the transit aspects. For a sign-ingress, the zodiac sign entered, and for a lunar-phase, the zodiac sign of the New or Full Moon. Absent for other event types.",
              ),
              aspect: s.string(
                "For a transit-aspect, the angular relationship. One of conjunction, sextile, square, trine, opposition. Absent for other event types.",
              ),
              orb: s.number(
                "For a transit-aspect, the separation in degrees from the exact aspect at the reported instant, rounded to three decimals. The instant is the moment the aspect perfects, so this reads 0. Absent for other event types.",
              ),
              station: s.string(
                "For a retrograde-station, whether the planet turns retrograde or direct. A stable machine value, never localized. Absent for other event types.",
              ),
              kind: s.string(
                "For an eclipse, its classification. total and penumbral apply to lunar eclipses, partial applies to both, annular and total apply to solar eclipses. A stable machine value, never localized. Absent for other event types.",
              ),
              obscuration: s.number(
                "For a lunar eclipse, the peak fraction from 0 to 1 of the Moon disc covered by Earth umbra. 1 for a total lunar eclipse, between 0 and 1 for a partial, 0 for a penumbral. Absent for solar eclipses and other event types.",
              ),
              phase: s.string(
                "For a lunar-phase event, which syzygy it is: new-moon (Sun-Moon conjunction) or full-moon (Sun-Moon opposition). The intermediate quarters are not emitted. A stable machine value, never localized. Absent for other event types.",
              ),
              description: s.string(
                "Plain-language summary of the event, suitable for direct display. The only localized field: when lang is set this sentence, and the body, target, and aspect names within it, render in the requested language while the structured fields stay English.",
              ),
              significance: s.number(
                "Importance score from 0 to 100. Outer-planet exact transit aspects and mahadasha changes score highest; fast Moon events and biorhythm critical days score lower. When domainWeights is supplied this is the weighted score, rounded and clamped to 0 to 100, which is the same value the significance floor and the event cap acted on.",
              ),
            },
            {
              required: ["date", "datetime", "domain", "type", "body", "description", "significance"],
              additionalProperties: true,
            },
          ),
          {},
        ),
      },
      { required: ["birthData", "startDate", "endDate", "count", "events"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_forecast_digest",
    description:
      "Summarize personal forecast events into the next 24 hours, 7 days, 30 days, and 90 days. Preserve explicit domains, weights, and per-window top-event count.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for generateDigest.",
      {
        birthData: forecastBirthSchema,
        startDate: s.string(
          "Start anchor for every window in YYYY-MM-DD format. The next 24h, 7d, 30d, and 90d windows are measured forward from this date at 00:00:00 UTC. Defaults to today in UTC.",
          { format: "date" },
        ),
        domains: s.array(
          "Which forecast domains to include before rolling up the windows. Defaults to all three.",
          s.stringEnum(
            "Forecast domain. western covers transit aspects, sign ingresses, retrograde stations, eclipses, and new and full moons. vedic covers Vimshottari mahadasha, antardasha, and pratyantardasha boundaries. biorhythm covers critical days.",
            ["western", "vedic", "biorhythm"],
          ),
          {},
        ),
        minSignificance: s.number(
          "Drop events scoring below this significance threshold from 0 to 100 before the rollup. Defaults to 0.",
          { minimum: 0, maximum: 100 },
        ),
        domainWeights: forecastDomainWeightsSchema,
        top: s.integer("Number of highest-significance events to surface per window. Defaults to 3, capped at 20.", {
          minimum: 0,
          maximum: 20,
        }),
        lang: languageSchema,
      },
      { required: ["birthData"] },
    ),
    outputSchema: s.object(
      "Pre-summarized forecast windows: next 24h, 7d, 30d, and 90d rollups",
      {
        birthData: s.looseObject("Echo of the birth subject this digest was built for.", {}),
        startDate: s.string("Start anchor every window is measured from."),
        endDate: s.string("Last day of the resolved 90 day horizon the timeline was built over before slicing."),
        windows: s.array(
          "The four rollups in ascending window length: next 24h, 7d, 30d, and 90d from the start anchor.",
          s.object(
            "The windows item.",
            {
              days: s.number("Length of this window in days forward from the start anchor. One of 1, 7, 30, 90."),
              from: s.string("Inclusive lower bound of the window as an ISO-8601 UTC datetime, the start anchor."),
              to: s.string(
                "Exclusive upper bound of the window as an ISO-8601 UTC datetime, the start anchor plus the window length.",
              ),
              count: s.number("Number of events whose datetime falls inside this window."),
              byDomain: s.looseObject(
                "Count of events in this window broken down by domain. Only domains with at least one event in the window are present. The values sum to count.",
                {},
              ),
              byType: s.looseObject(
                "Count of events in this window broken down by event type. Only types with at least one event in the window are present. The values sum to count.",
                {},
              ),
              top: s.array(
                "The highest-significance events in this window, most significant first, up to the requested top count. The same TimelineEvent shape as the timeline endpoints.",
                s.object(
                  "The top item.",
                  {
                    date: s.string("Calendar date of the event in YYYY-MM-DD (UTC)."),
                    datetime: s.string(
                      "Exact instant of the event as an ISO-8601 UTC datetime, to the nearest second. Astronomical events are refined to this instant by search, not reported at a daily sample point; a dasha-change is the period boundary itself, counted from the birth instant.",
                    ),
                    domain: s.string(
                      "Forecast domain. western covers transit aspects, sign ingresses, retrograde stations, eclipses, and new and full moons. vedic covers Vimshottari mahadasha, antardasha, and pratyantardasha boundaries. biorhythm covers critical days. A stable machine value, never localized, so consumers can branch on it under any language.",
                    ),
                    type: s.string(
                      "Event kind. transit-aspect, sign-ingress, retrograde-station, eclipse, and lunar-phase are western, dasha-change is vedic Vimshottari, critical-day is biorhythm. A stable machine value, never localized, so consumers can branch on it under any language.",
                    ),
                    body: s.string(
                      "Primary subject of the event. A transiting planet for western events, Sun for a solar eclipse, Moon for a lunar eclipse or a new or full moon, or the critical cycle for biorhythm days. For a dasha-change, the Vimshottari lords outermost first, joined by a hyphen, then one space and the level: Saturn Mahadasha, Saturn-Mercury Antardasha, Saturn-Mercury-Ketu Pratyantardasha. Lords are always one of Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury. Never localized.",
                    ),
                    target: s.string(
                      "For a transit-aspect, the natal body the transit aspects. For a sign-ingress, the zodiac sign entered, and for a lunar-phase, the zodiac sign of the New or Full Moon. Absent for other event types.",
                    ),
                    aspect: s.string(
                      "For a transit-aspect, the angular relationship. One of conjunction, sextile, square, trine, opposition. Absent for other event types.",
                    ),
                    orb: s.number(
                      "For a transit-aspect, the separation in degrees from the exact aspect at the reported instant, rounded to three decimals. The instant is the moment the aspect perfects, so this reads 0. Absent for other event types.",
                    ),
                    station: s.string(
                      "For a retrograde-station, whether the planet turns retrograde or direct. A stable machine value, never localized. Absent for other event types.",
                    ),
                    kind: s.string(
                      "For an eclipse, its classification. total and penumbral apply to lunar eclipses, partial applies to both, annular and total apply to solar eclipses. A stable machine value, never localized. Absent for other event types.",
                    ),
                    obscuration: s.number(
                      "For a lunar eclipse, the peak fraction from 0 to 1 of the Moon disc covered by Earth umbra. 1 for a total lunar eclipse, between 0 and 1 for a partial, 0 for a penumbral. Absent for solar eclipses and other event types.",
                    ),
                    phase: s.string(
                      "For a lunar-phase event, which syzygy it is: new-moon (Sun-Moon conjunction) or full-moon (Sun-Moon opposition). The intermediate quarters are not emitted. A stable machine value, never localized. Absent for other event types.",
                    ),
                    description: s.string(
                      "Plain-language summary of the event, suitable for direct display. The only localized field: when lang is set this sentence, and the body, target, and aspect names within it, render in the requested language while the structured fields stay English.",
                    ),
                    significance: s.number(
                      "Importance score from 0 to 100. Outer-planet exact transit aspects and mahadasha changes score highest; fast Moon events and biorhythm critical days score lower. When domainWeights is supplied this is the weighted score, rounded and clamped to 0 to 100, which is the same value the significance floor and the event cap acted on.",
                    ),
                  },
                  {
                    required: ["date", "datetime", "domain", "type", "body", "description", "significance"],
                    additionalProperties: true,
                  },
                ),
                {},
              ),
            },
            { required: ["days", "from", "to", "count", "byDomain", "byType", "top"], additionalProperties: true },
          ),
          {},
        ),
      },
      { required: ["birthData", "startDate", "endDate", "windows"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bazi_luck_pillars",
    description: "Calculate BaZi ten-year luck pillars and the start age, with optional annual overlays.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: {
      ...baziTimingInputSchema,
      description: "Input for calculateLuckPillars.",
      properties: {
        ...(baziTimingInputSchema.properties as Record<string, Record<string, unknown>>),
        gender: s.stringEnum(
          "Subject sex, used only to pick the luck-pillar direction: a male born in a yang-stem year and a female born in a yin-stem year run forward through the sexagenary cycle, and the other two combinations run backward. It affects nothing else in the response.",
          ["male", "female"],
        ),
        count: s.integer(
          "How many ten-year luck pillars to return, 1 to 12, default 8. Eight covers eighty years from the start age, which reaches past a normal lifetime for most start ages.",
          { minimum: 1, maximum: 12 },
        ),
        annualFromYear: s.integer(
          "First Gregorian year of the annual pillar overlay. Omit it to leave annualPillars out of the response entirely. The annual pillar is the year the chart is currently walking through, read against the ten-year luck pillar underneath it.",
          { minimum: 1551, maximum: 2649 },
        ),
        annualYears: s.integer(
          "How many consecutive years the annual overlay covers, 1 to 20, default 10. Ignored unless annualFromYear is present.",
          { minimum: 1, maximum: 20 },
        ),
        lang: languageSchema,
      },
      required: [...(baziTimingInputSchema.required as string[]), "gender"],
    },
    outputSchema: s.object(
      "Luck pillar sequence with start age, direction, and optional annual overlay",
      {
        birthData: s.looseObject("Echo of the birth moment the chart was computed from.", {}),
        conventions: s.looseObject(
          "The three school conventions this result was computed under. Returned on every BaZi response so a chart is self-describing: two calculators can produce different pillars for one birth and both be correct, and this object says which reading you are holding.",
          {},
        ),
        gender: s.string("Echo of the sex sent, which is what selected the direction below."),
        direction: s.string(
          "Which way the sequence walks the sexagenary cycle. A male born in a yang-stem year and a female born in a yin-stem year run forward, and the other two combinations run backward. Always English, whatever the lang parameter says.",
        ),
        startAge: s.number(
          "Age in whole years at which the first luck pillar begins. Counted from the birth instant to the adjacent minor solar term at three days to the year, forward for a forward direction and backward for a reverse one.",
        ),
        startAgeMonths: s.number(
          "Additional months past startAge, 0 to 11, from the remainder of the same count at one day to four months. Calculators that round the whole count to the nearest year will differ from this by up to six months.",
        ),
        daysToTerm: s.number(
          "Days from the birth instant to the minor solar term the count ran to, before conversion. Published so the start age can be checked rather than taken on trust.",
        ),
        boundaryTerm: s.string(
          "The minor solar term the count ran to. One of the twelve that also move the month pillar. Always the pinyin identifier, whatever the lang parameter says.",
        ),
        boundaryTermName: s.string(
          "Display name of that same term, in the requested language. Always present, and English when lang is en. Several English renderings of a term are in circulation, so treat this as the label and boundaryTerm as the value.",
        ),
        luckPillars: s.array(
          "The ten-year periods in order, each with the relation its stem holds to the natal Day Master.",
          s.looseObject("The luckPillars item.", {}),
          {},
        ),
        annualPillars: s.array(
          "Year-by-year overlay, present only when annualFromYear was sent. Each year names the luck pillar it falls inside.",
          s.looseObject("The annualPillars item.", {}),
          {},
        ),
        summary: s.string("One-paragraph reading of the sequence direction and its start."),
      },
      {
        required: [
          "birthData",
          "conventions",
          "gender",
          "direction",
          "startAge",
          "startAgeMonths",
          "daysToTerm",
          "boundaryTerm",
          "boundaryTermName",
          "luckPillars",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bazi_day_master_strength",
    description: "Assess BaZi Day Master strength with factor scores and favorable and unfavorable elements.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: {
      ...baziTimingInputSchema,
      description: "Input for calculateDayMasterStrength.",
      properties: {
        ...(baziTimingInputSchema.properties as Record<string, Record<string, unknown>>),
        lang: languageSchema,
      },
      required: [...(baziTimingInputSchema.required as string[])],
    },
    outputSchema: s.object(
      "Strength verdict, contributing factors, and favorable elements",
      {
        birthData: s.looseObject("Echo of the birth moment the chart was computed from.", {}),
        conventions: s.looseObject(
          "The three school conventions this result was computed under. Returned on every BaZi response so a chart is self-describing: two calculators can produce different pillars for one birth and both be correct, and this object says which reading you are holding.",
          {},
        ),
        dayMaster: s.looseObject("The day stem whose strength is being assessed.", {}),
        verdict: s.string(
          "Strength verdict. One of very-weak, weak, balanced, strong, very-strong, banded on the composite score below: under -3 is very-weak, -3 to under -1 is weak, -1 to under 1 is balanced, 1 to under 3 is strong, 3 and above is very-strong. Always English, whatever the lang parameter says.",
        ),
        score: s.number(
          "Composite support score, negative for an under-supported Day Master and positive for a well-supported one. A RoxyAPI weighting of the three classical factors rather than a figure from any text, published so the verdict can be audited: the three factor contributions sum to exactly this number.",
        ),
        seasonalState: s.string(
          "State of the Day Master element in the birth month, the strongest single input. One of prosperous, supported, resting, imprisoned, dead, which render the classical five wang xiang xiu qiu si. Always English, whatever the lang parameter says; the translated reading is seasonalStateMeaning.",
        ),
        seasonalStateChinese: s.string("The seasonal state in hanzi. Identical under every lang."),
        seasonalStateMeaning: s.string("What this seasonal state means for the chart."),
        rootCount: s.number(
          "How many of the four branches store a stem of the Day Master element. Zero means the day stem is rootless, which is the single most decisive finding a strength reading can return.",
        ),
        factors: s.array(
          "The three classical factors behind the verdict, each with what it found and what it contributed. These are the citable part of the reading; the score is our arithmetic over them.",
          s.looseObject("The factors item.", {}),
          {},
        ),
        favorableElements: s.array(
          "Elements that help this chart. A weak Day Master wants its own element and the one that generates it; a strong one wants the three that drain, spend, or restrain it. Empty when the verdict is balanced, because a centred chart has no categorically favourable element and the incoming luck pillar decides. Always English, whatever the lang parameter says.",
          s.string("The favorableElements item."),
          {},
        ),
        unfavorableElements: s.array(
          "Elements that burden this chart, the complement of favorableElements. Also empty when the verdict is balanced.",
          s.string("The unfavorableElements item."),
          {},
        ),
        fiveElements: s.array(
          "Element headcount across the eight characters, the plain distribution behind the weighted verdict.",
          s.looseObject("The fiveElements item.", {}),
          {},
        ),
        summary: s.string(
          "One-paragraph reading composed from the verdict, the seasonal state, and the rooting finding.",
        ),
      },
      {
        required: [
          "birthData",
          "conventions",
          "dayMaster",
          "verdict",
          "score",
          "seasonalState",
          "seasonalStateChinese",
          "seasonalStateMeaning",
          "rootCount",
          "factors",
          "favorableElements",
          "unfavorableElements",
          "fiveElements",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_bazi_annual_forecast",
    description: "Read a Gregorian year against a natal BaZi chart, including Ten Gods and pillar interactions.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: {
      ...baziTimingInputSchema,
      description: "Input for calculateAnnualForecast.",
      properties: {
        ...(baziTimingInputSchema.properties as Record<string, Record<string, unknown>>),
        year: s.integer(
          "Gregorian year to read against the natal chart. The annual pillar for that year is resolved under the same year boundary the request selected, so a li-chun reading and a lunar-new-year reading of the same calendar year can differ.",
          { minimum: 1551, maximum: 2649 },
        ),
        lang: languageSchema,
      },
      required: [...(baziTimingInputSchema.required as string[]), "year"],
    },
    outputSchema: s.object(
      "Annual pillar, its relation to the Day Master, and the natal interactions",
      {
        birthData: s.looseObject("Echo of the birth moment the chart was computed from.", {}),
        conventions: s.looseObject(
          "The three school conventions this result was computed under. Returned on every BaZi response so a chart is self-describing: two calculators can produce different pillars for one birth and both be correct, and this object says which reading you are holding.",
          {},
        ),
        year: s.number("Echo of the year requested, which the annual pillar below was resolved for."),
        annualPillar: s.looseObject("The sexagenary pillar of the year being read.", {}),
        animal: s.string(
          "Zodiac animal of the year branch. Always English, whatever the lang parameter says. Use animalLocalized for anything a reader sees.",
        ),
        animalLocalized: s.string(
          "Display copy of the animal name in the requested language. Absent for English, so an English response is unchanged.",
        ),
        tenGod: s.looseObject(
          "Relation the ANNUAL STEM holds to the natal Day Master. This is the single most useful line of an annual reading: it says what the year asks of the chart.",
          {},
        ),
        branchTenGod: s.looseObject(
          "Relation the principal hidden stem of the annual branch holds to the natal Day Master, the slower half of the same reading.",
          {},
        ),
        yearBranchRelation: s.string(
          "How the annual branch stands to the NATAL YEAR branch. same is the twelve-yearly return of the birth animal, the year commonly called ben ming nian. clash, harm and punishment are the three breaking relations, and none means the two branches form no structural relation at all. Always English, whatever the lang parameter says.",
        ),
        benMingNian: s.boolean(
          "True when the year returns the birth animal, which is exactly the case where yearBranchRelation is same. Surfaced as its own boolean because it is the one relation most consumers render on its own.",
        ),
        yearBranchRelationMeaning: s.string(
          "What this relation between the annual branch and the natal year branch means.",
        ),
        interactions: s.array(
          "Every combination, clash, harm and punishment the annual pillar forms with each of the four natal pillars. Positions are named natal.year through natal.hour against annual.",
          s.looseObject("The interactions item.", {}),
          {},
        ),
        summary: s.string("One-paragraph reading of what the year asks of this chart."),
      },
      {
        required: [
          "birthData",
          "conventions",
          "year",
          "annualPillar",
          "animal",
          "tenGod",
          "branchTenGod",
          "yearBranchRelation",
          "benMingNian",
          "yearBranchRelationMeaning",
          "interactions",
          "summary",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "convert_lunar_date",
    description:
      "Convert a Gregorian date OR a complete lunar date. Omit both for today in UTC. The calendar uses the UTC+8 reference meridian; isLeapMonth selects the repeated lunar month.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: lunarDateInputSchema,
    outputSchema: s.object(
      "The converted date, in both calendars.",
      {
        gregorianDate: s.string(
          "The Gregorian date, echoed when one was sent and computed when the lunar fields were. Echoes the request, or the current UTC date when neither side was supplied.",
        ),
        lunar: s.object(
          "The lunar value.",
          {
            year: s.number(
              "Lunisolar year. It advances on the first day of month 1, not at Li Chun, so it can lag the Gregorian year by up to seven weeks.",
            ),
            month: s.number("Lunar month, 1 to 12. A leap month repeats the number of the month it follows."),
            day: s.number("Day of the lunar month, 1 to 30. A lunar month never has 31 days."),
            isLeapMonth: s.boolean(
              "True when this is the leap repetition of the month number rather than the first pass through it.",
            ),
            monthLength: s.number(
              "Days in this lunar month, 29 for a short month or 30 for a long one. It is the interval between two new moons, so it varies month to month.",
            ),
            date: s.string("The Gregorian date this lunar day covers, evaluated at the reference meridian."),
          },
          { required: ["year", "month", "day", "isLeapMonth", "monthLength", "date"], additionalProperties: true },
        ),
        leapMonthOfYear: s.number(
          "The month this lunisolar year repeats, when it has thirteen months. Absent in a twelve month year, so a caller can branch on presence rather than on a sentinel.",
        ),
        referenceOffset: s.number(
          "Decimal UTC offset the calendar was evaluated at. Fixed at 8, which is what makes a Chinese lunar date a world constant.",
        ),
      },
      { required: ["gregorianDate", "lunar", "referenceOffset"], additionalProperties: true },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "get_almanac_day",
    description:
      "Get the Chinese almanac for a date in years 1900 through 2100, with lunar date, pillars, day officer, mansion, favored and avoided activities.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for getAlmanacDay.",
      {
        date: s.string(
          "Gregorian date in YYYY-MM-DD format, evaluated at the reference meridian. Years 1900 to 2100.",
          { format: "date" },
        ),
        lang: languageSchema,
      },
      { required: ["date"] },
    ),
    outputSchema: s.object(
      "The almanac reading for the day.",
      {
        date: s.string("The Gregorian date of the day, at the reference meridian."),
        lunar: s.object(
          "The lunar value.",
          {
            year: s.number(
              "Lunisolar year. It advances on the first day of month 1, not at Li Chun, so it can lag the Gregorian year by up to seven weeks.",
            ),
            month: s.number("Lunar month, 1 to 12. A leap month repeats the number of the month it follows."),
            day: s.number("Day of the lunar month, 1 to 30. A lunar month never has 31 days."),
            isLeapMonth: s.boolean(
              "True when this is the leap repetition of the month number rather than the first pass through it.",
            ),
            monthLength: s.number(
              "Days in this lunar month, 29 for a short month or 30 for a long one. It is the interval between two new moons, so it varies month to month.",
            ),
            date: s.string("The Gregorian date this lunar day covers, evaluated at the reference meridian."),
          },
          { required: ["year", "month", "day", "isLeapMonth", "monthLength", "date"], additionalProperties: true },
        ),
        yearPillar: s.looseObject(
          "Sexagenary year pillar of the day. Attributed by whole days, so the day Li Chun falls on belongs to the new year for its whole length. A BaZi chart built from a birth TIME uses the term instant instead, so a birth in the hours before the term on that same day carries the previous year pillar.",
          {},
        ),
        monthPillar: s.looseObject(
          "Sexagenary month pillar of the day, and the pillar the day officer is counted from. Attributed by whole days like the year pillar, so the day a minor solar term falls on belongs to the new month even when the term arrives late in the evening. This is what an almanac prints, and it is not the same as the month pillar of a birth moment inside that day.",
          {},
        ),
        dayPillar: s.looseObject("The dayPillar value.", {}),
        dayOfficer: s.looseObject("The dayOfficer value.", {}),
        mansion: s.looseObject("The mansion value.", {}),
        clashAnimal: s.string(
          "The zodiac animal the day clashes with, which is the animal six branches away from the day branch. Anyone born in that animal year traditionally avoids the day for anything important.",
        ),
        clashAnimalLocalized: s.string(
          "Display name of the clashing animal in the requested language. Absent when lang is en, so an English response is unchanged.",
        ),
        favours: s.array(
          "Activity identifiers, always English kebab case so they stay safe to compare against in code. Use the /calendar/auspicious-days endpoint to search a date range for one of them.",
          s.string("The favours item."),
          {},
        ),
        avoids: s.array(
          "Activity identifiers, always English kebab case so they stay safe to compare against in code. Use the /calendar/auspicious-days endpoint to search a date range for one of them.",
          s.string("The avoids item."),
          {},
        ),
      },
      {
        required: [
          "date",
          "lunar",
          "yearPillar",
          "monthPillar",
          "dayPillar",
          "dayOfficer",
          "mansion",
          "clashAnimal",
          "favours",
          "avoids",
        ],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("roxyapi", {
    name: "find_auspicious_days",
    description:
      "Find days favored for an activity within a date range of at most 93 days, optionally excluding dates clashing with a zodiac animal.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for lookupAuspiciousDays.",
      {
        activity: s.string(
          "Activity to choose a date for. One of wedding, travel, moving-house, opening-business, signing-contracts, construction, groundbreaking, burial, medical-treatment, praying. Matching folds case and punctuation, so moving-house and MOVING_HOUSE both resolve.",
          {
            pattern:
              "^\\s*(?:[wW][eE][dD][dD][iI][nN][gG]|[tT][rR][aA][vV][eE][lL]|[mM][oO][vV][iI][nN][gG][-_][hH][oO][uU][sS][eE]|[oO][pP][eE][nN][iI][nN][gG][-_][bB][uU][sS][iI][nN][eE][sS][sS]|[sS][iI][gG][nN][iI][nN][gG][-_][cC][oO][nN][tT][rR][aA][cC][tT][sS]|[cC][oO][nN][sS][tT][rR][uU][cC][tT][iI][oO][nN]|[gG][rR][oO][uU][nN][dD][bB][rR][eE][aA][kK][iI][nN][gG]|[bB][uU][rR][iI][aA][lL]|[mM][eE][dD][iI][cC][aA][lL][-_][tT][rR][eE][aA][tT][mM][eE][nN][tT]|[pP][rR][aA][yY][iI][nN][gG])\\s*$",
          },
        ),
        startDate: s.string("First date of the range to search, inclusive.", { format: "date" }),
        endDate: s.string("Last date of the range to search, inclusive. The range may not exceed 93 days.", {
          format: "date",
        }),
        avoidAnimal: s.stringEnum(
          "Zodiac animal to protect. Days that clash with this animal are dropped from the results, which is how a date is chosen around the people attending rather than in the abstract. One of rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig.",
          ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"],
        ),
        lang: languageSchema,
      },
      { required: ["activity", "startDate", "endDate"] },
    ),
    outputSchema: s.object(
      "The favoured days inside the range.",
      {
        activity: s.string("Echo of the activity searched for, folded to its canonical identifier."),
        activityLabel: s.string("Display label for the activity in the requested language."),
        startDate: s.string("Echo of the first date of the range."),
        endDate: s.string("Echo of the last date of the range."),
        daysSearched: s.number("Number of days in the range, counting both ends."),
        avoidAnimal: s.string("Echo of the animal protected. Absent when none was sent, rather than null."),
        avoidAnimalLocalized: s.string(
          "Display name of the protected animal in the requested language, beside the avoidAnimal identifier. Absent when no animal was sent and absent when lang is en, so an English response is unchanged.",
        ),
        total: s.number(
          "Number of favoured days found. This is the count after the clash filter, not the number of days searched.",
        ),
        days: s.array(
          "The favoured days, in date order.",
          s.object(
            "The days item.",
            {
              date: s.string("The Gregorian date of the day, at the reference meridian."),
              lunar: s.object(
                "The lunar value.",
                {
                  year: s.number(
                    "Lunisolar year. It advances on the first day of month 1, not at Li Chun, so it can lag the Gregorian year by up to seven weeks.",
                  ),
                  month: s.number("Lunar month, 1 to 12. A leap month repeats the number of the month it follows."),
                  day: s.number("Day of the lunar month, 1 to 30. A lunar month never has 31 days."),
                  isLeapMonth: s.boolean(
                    "True when this is the leap repetition of the month number rather than the first pass through it.",
                  ),
                  monthLength: s.number(
                    "Days in this lunar month, 29 for a short month or 30 for a long one. It is the interval between two new moons, so it varies month to month.",
                  ),
                  date: s.string("The Gregorian date this lunar day covers, evaluated at the reference meridian."),
                },
                {
                  required: ["year", "month", "day", "isLeapMonth", "monthLength", "date"],
                  additionalProperties: true,
                },
              ),
              yearPillar: s.looseObject(
                "Sexagenary year pillar of the day. Attributed by whole days, so the day Li Chun falls on belongs to the new year for its whole length. A BaZi chart built from a birth TIME uses the term instant instead, so a birth in the hours before the term on that same day carries the previous year pillar.",
                {},
              ),
              monthPillar: s.looseObject(
                "Sexagenary month pillar of the day, and the pillar the day officer is counted from. Attributed by whole days like the year pillar, so the day a minor solar term falls on belongs to the new month even when the term arrives late in the evening. This is what an almanac prints, and it is not the same as the month pillar of a birth moment inside that day.",
                {},
              ),
              dayPillar: s.looseObject("The dayPillar value.", {}),
              dayOfficer: s.looseObject("The dayOfficer value.", {}),
              mansion: s.looseObject("The mansion value.", {}),
              clashAnimal: s.string(
                "The zodiac animal the day clashes with, which is the animal six branches away from the day branch. Anyone born in that animal year traditionally avoids the day for anything important.",
              ),
              clashAnimalLocalized: s.string(
                "Display name of the clashing animal in the requested language. Absent when lang is en, so an English response is unchanged.",
              ),
              favours: s.array(
                "Activity identifiers, always English kebab case so they stay safe to compare against in code. Use the /calendar/auspicious-days endpoint to search a date range for one of them.",
                s.string("The favours item."),
                {},
              ),
              avoids: s.array(
                "Activity identifiers, always English kebab case so they stay safe to compare against in code. Use the /calendar/auspicious-days endpoint to search a date range for one of them.",
                s.string("The avoids item."),
                {},
              ),
            },
            {
              required: [
                "date",
                "lunar",
                "yearPillar",
                "monthPillar",
                "dayPillar",
                "dayOfficer",
                "mansion",
                "clashAnimal",
                "favours",
                "avoids",
              ],
              additionalProperties: true,
            },
          ),
          {},
        ),
      },
      {
        required: ["activity", "activityLabel", "startDate", "endDate", "daysSearched", "total", "days"],
        additionalProperties: true,
      },
    ),
  }),
];
