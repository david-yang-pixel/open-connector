import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { numerologyInputSchema } from "./numerology-schema.ts";
import { dateFields, dateInput, defineFreeastroapiAction as action } from "./schemas.ts";

const city = s.nonWhitespaceString("City or locality name for location lookup.", {
  maxLength: 200,
});
const latitude = s.number("Latitude in degrees.", { minimum: -90, maximum: 90 });
const longitude = s.number("Longitude in degrees.", { minimum: -180, maximum: 180 });
const timezone = s.nonWhitespaceString("IANA timezone or AUTO for automatic resolution. Defaults to AUTO.");
const observer = { city, latitude, longitude, timezone };
const moonFlags = {
  includeZodiac: s.boolean("Include the Moon's tropical zodiac sign. Defaults to false."),
  includeVisuals: s.boolean("Include the moon SVG and shadow ratio. Defaults to false."),
  includeSpecial: s.boolean("Include special moon labels such as supermoon and harvest moon. Defaults to false."),
  includeEclipse: s.boolean(
    "Include nearby solar or lunar eclipse details and local visibility when a location is provided. Defaults to false.",
  ),
  includeForecast: s.boolean(
    "Include next moon phases, lunar eclipse, and solar eclipse forecasts. Defaults to false.",
  ),
  includeTraditionalMoon: s.boolean("Include traditional North American full moon names. Defaults to false."),
  moonColor: s.nonWhitespaceString("Hex color for illuminated moon SVG fill. Defaults to #E0E0E0."),
  shadowColor: s.nonWhitespaceString("Hex color for moon SVG shadow. Defaults to #1A1A1A."),
};
const isoDate = s.string("Gregorian calendar date in YYYY-MM-DD format.", { format: "date" });
const isoTime = s.nonWhitespaceString(
  "ISO 8601 date or datetime, with an optional UTC offset. Dates expand to offset-free midnight. The endpoint docs do not define timezone-free datetime parsing.",
);
const bodyList = s.array(
  "Requested celestial bodies or points using official names.",
  s.nonWhitespaceString("One official celestial body or point name."),
);
const zodiac = s.stringEnum("Zodiac system. Defaults to tropical.", ["tropical", "sidereal"]);
const orbValues = s.record(
  "Aspect names mapped to orb values in degrees; default sets the fallback orb.",
  s.number("Orb value in degrees.", { minimum: 0 }),
);
const aspectOrbFields = {
  conjunction: s.number("Conjunction orb in degrees.", { minimum: 0 }),
  sextile: s.number("Sextile orb in degrees.", { minimum: 0 }),
  square: s.number("Square orb in degrees.", { minimum: 0 }),
  trine: s.number("Trine orb in degrees.", { minimum: 0 }),
  opposition: s.number("Opposition orb in degrees.", { minimum: 0 }),
};
export const expansionActions: ActionDefinition[] = [
  defineProviderAction("freeastroapi", {
    name: "search_cities",
    description:
      "Search cities and localities, including province-qualified queries, and return coordinates and IANA timezones for subsequent chart calculations.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "City search input.",
      {
        query: s.string(
          "City-name prefix or a city and province query such as Jingzhou, Hubei. At least two characters.",
          { minLength: 2, pattern: "\\S" },
        ),
        country: s.string("Optional ISO 3166-1 alpha-2 country filter.", {
          pattern: "^\\s*[A-Za-z]{2}\\s*$",
        }),
        limit: s.integer(
          "Maximum number of results. Defaults to 10; queries shorter than four characters are capped upstream at five.",
          { minimum: 1, maximum: 50 },
        ),
      },
      { required: ["query"] },
    ),
    outputSchema: s.object(
      "City search results.",
      {
        cities: s.array(
          "Matching cities in upstream result order.",
          s.object(
            "A matching location ready for use in chart inputs.",
            {
              name: s.string("City or locality name."),
              country: s.string("Country code."),
              state: s.nullable(s.string("State or province when available.")),
              district: s.nullable(s.string("Indian district when available.")),
              latitude,
              longitude,
              timezone: s.nullable(s.string("IANA timezone when available.")),
              population: s.nullable(s.integer("Population used by the upstream search ranking.")),
              raw: s.looseObject("Complete upstream city record, including future fields."),
            },
            { optional: [] },
          ),
        ),
        count: s.integer("Number of returned city results."),
        raw: s.looseObject("Complete upstream search response, including future fields."),
      },
      { optional: [] },
    ),
  }),
  action(
    "get_moon_phase",
    "Get moon phase, illumination, and optional zodiac, rise/set, eclipse, forecasts, interpretation, and SVG visuals for a date or the current instant.",
    s.object(
      "Moon phase input.",
      {
        date: s.nonWhitespaceString("ISO date or datetime, or now. Defaults to the current instant."),
        ...observer,
        ...moonFlags,
        includeRiseSet: s.boolean(
          "Include moon rise and set times; requires a city or paired coordinates. Defaults to false.",
        ),
        includeInterpretation: s.boolean(
          "Include the optional Moon sign, phase, and decan interpretation. Defaults to false.",
        ),
      },
      { required: [] },
    ),
    "moon",
    "Complete moon phase data and all requested optional results.",
    false,
  ),
  action(
    "get_moon_calendar",
    "Get a complete monthly moon calendar with optional SVG visuals, eclipses, forecasts, sign intervals, and ingress events. Requires an Entry or High plan.",
    s.object(
      "Monthly moon calendar input.",
      {
        year: s.integer("Four-digit calendar year.", { minimum: 1, maximum: 9999 }),
        month: dateFields.month,
        ...observer,
        ...moonFlags,
        includeSignTimeline: s.boolean("Include sign intervals and ingress events for the month. Defaults to false."),
      },
      { required: ["year", "month"] },
    ),
    "calendar",
    "Complete monthly moon calendar, daily snapshots, and any sign timeline and ingress events.",
    false,
  ),
  action(
    "list_sky_events",
    "Get planetary ingresses, exact aspects, stations, and lunations for a local calendar date. This returns event data for downstream notifications.",
    s.object(
      "Daily sky event input.",
      {
        date: isoDate,
        timezone: s.nonWhitespaceString("IANA timezone defining local-day boundaries. Defaults to UTC."),
        preset: s.stringEnum("Event-volume preset. Explicit include flags override the preset. Defaults to quiet.", [
          "quiet",
          "daily",
          "full",
        ]),
        includeMoon: s.boolean("Include Moon sign ingress events."),
        includeExactHits: s.boolean("Include exact major planetary aspects."),
        includeMoonExactHits: s.boolean("Include exact Moon aspects."),
        includeIngresses: s.boolean("Include non-Moon planetary ingresses."),
        includeRetrogrades: s.boolean("Include retrograde and direct stations."),
        includeLunations: s.boolean("Include new and full moons."),
        includeFormulation: s.boolean("Include deterministic notification phrases."),
      },
      { required: ["date"] },
    ),
    "events",
    "Complete sky event feed with metadata, timestamps, and optional notification phrases.",
    false,
  ),
  action(
    "calculate_ephemeris",
    "Calculate celestial positions at an instant or over a date range, including optional aspects, houses, angles, fixed stars, Moon void-of-course data, and table outputs.",
    s.object(
      "Ephemeris calculation input.",
      {
        start: isoTime,
        end: s.describe(isoTime, "Optional ISO end date or datetime. Must not precede start."),
        step: s.nonWhitespaceString("Positive whole minute/hour/day step such as 5m, 1h, or 1d. Defaults to 1d."),
        ...observer,
        bodies: bodyList,
        format: s.stringEnum("Response layout. Defaults to json.", ["json", "table"]),
        tableStyle: s.stringEnum("Table style; grid is capped at 31 rows.", ["rows", "columns", "grid"]),
        zodiacType: zodiac,
        siderealAyanamsa: s.nonWhitespaceString("Sidereal ayanamsa when using the sidereal zodiac."),
        houseSystem: s.nonWhitespaceString("House system for houses and angles. Defaults to placidus."),
        includeAspects: s.boolean("Include aspects for every snapshot."),
        includeMinorAspects: s.boolean("Include minor aspect types."),
        includeMoonVoidOfCourse: s.boolean(
          "Include Moon void-of-course state and next sign ingress and applying aspect.",
        ),
        includeFixedStars: s.boolean("Include the default fixed star set."),
        fixedStars: s.array(
          "Optional explicit fixed star names.",
          s.nonWhitespaceString("One official fixed star name."),
        ),
        includeHouses: s.boolean(
          "Include houses; auto-enabled upstream when coordinates are available unless explicitly false.",
        ),
        includeAngles: s.boolean(
          "Include angles; auto-enabled upstream when coordinates are available unless explicitly false.",
        ),
      },
      { required: ["start"] },
    ),
    "ephemeris",
    "Complete ephemeris response, preserving snapshot, range, and table layouts.",
  ),
  action(
    "calculate_transit_timeline",
    "Calculate transit-to-natal intervals for a calendar month or a long-cycle range up to 366 days, with configurable planets, points, aspects, and orbs. Requires a High plan.",
    s.object(
      "Transit timeline input.",
      {
        natal: s.object(
          "Natal reference chart; provide the birth city and coordinates. Supply hour when birth time is known.",
          {
            ...dateFields,
            city,
            latitude,
            longitude,
            hour: s.integer("Birth hour, required for angle-sensitive timelines when birth time is known.", {
              minimum: 0,
              maximum: 23,
            }),
            minute: s.integer("Birth minute.", { minimum: 0, maximum: 59 }),
            name: s.string("Optional display name for the chart owner."),
            timeKnown: s.boolean("Whether birth time is known. Set false to omit angle-based calculations."),
            timezone,
            zodiacType: zodiac,
            siderealAyanamsa: s.stringEnum("Sidereal ayanamsa for the natal and transit calculations.", [
              "lahiri",
              "raman",
              "kp",
              "fagan_bradley",
              "yukteshwar",
            ]),
          },
          { required: ["year", "month", "day", "city", "latitude", "longitude"] },
        ),
        rangeStart: s.nonWhitespaceString("Range start as an ISO date or datetime. Date-only values use 00:00:00Z."),
        rangeEnd: s.nonWhitespaceString("Range end as an ISO date or datetime. Date-only values use 23:59:59Z."),
        mode: s.stringEnum(
          "Timeline mode. Defaults to month; year_slow accepts medium and slow bodies across up to 366 days.",
          ["month", "year_slow"],
        ),
        includeHouses: s.boolean("Include natal and transit house context when available."),
        transitCategories: s.array(
          "Transit category filter. In year_slow mode use medium, slow, or both.",
          s.stringEnum("One transit category.", ["fast", "medium", "slow", "all"]),
        ),
        transitPlanets: s.describe(
          bodyList,
          "Official transit planet keys, including nodes, Chiron, and Lilith variants.",
        ),
        natalPoints: s.describe(
          bodyList,
          "Official natal point keys, including nodes and angle-derived points when birth time is known.",
        ),
        aspectTypes: s.array(
          "Aspect type filter. Defaults to the five major aspects.",
          s.nonWhitespaceString("One official aspect type."),
        ),
        orbSettings: s.object(
          "Orb override policy. Planet overrides take precedence over category and aspect overrides.",
          {
            ...aspectOrbFields,
            byAspect: orbValues,
            byCategory: s.object(
              "Category-specific orb overrides.",
              { fast: orbValues, medium: orbValues, slow: orbValues },
              { required: [] },
            ),
            byPlanet: s.record("Transit planet keys mapped to orb overrides.", orbValues),
          },
          {
            required: [],
            additionalProperties: s.number("Additional flat per-aspect orb in degrees.", {
              minimum: 0,
            }),
          },
        ),
      },
      { required: ["natal", "rangeStart", "rangeEnd"] },
    ),
    "timeline",
    "Complete timeline, retaining true interval boundaries and month-clipped display fields.",
  ),
  action(
    "calculate_vedic_chart",
    "Run the V2 integrated Vedic calculation with optional divisional charts, Dasha, Yogas, Panchang, Shadbala, Ashtakavarga, and Avastha.",
    dateInput(
      "Integrated Vedic calculation input.",
      {
        ...dateFields,
        hour: s.integer("Birth hour.", { minimum: 0, maximum: 23 }),
        minute: s.integer("Birth minute.", { minimum: 0, maximum: 59 }),
        timezone: s.nonWhitespaceString("Timezone override: IANA name, AUTO, or LMT. Defaults to AUTO."),
        ayanamsha: s.nonWhitespaceString("Vedic ayanamsha. Defaults to lahiri."),
        houseSystem: s.nonWhitespaceString("Vedic house system. Defaults to whole_sign."),
        nodeType: s.stringEnum("Lunar node type.", ["mean", "true"]),
        vargas: s.array(
          "Divisional chart numbers, for example 1, 9, 10, and 60. Defaults to D1.",
          s.integer("One divisional chart number.", { minimum: 1 }),
        ),
        includeAvastha: s.boolean("Include Baladi Avastha planet age states."),
        includeYogas: s.boolean("Include V2 Yoga detection."),
        includePanchang: s.boolean("Include V2 Panchang for the birth date and location."),
        includeShadbala: s.boolean("Include calibrated V2 Shadbala values."),
        includeAshtakavarga: s.boolean("Include V2 Ashtakavarga values."),
        dashaLevels: s.integer("Dasha depth: 0 off, 1 Mahadasha, 2 Antardasha, or 3 Pratyantardasha.", {
          minimum: 0,
          maximum: 3,
        }),
        referenceDate: s.describe(isoDate, "Date for active Dasha lookup. Defaults to today in the resolved timezone."),
      },
      ["year", "month", "day", "hour", "minute"],
    ),
    "calculation",
    "Complete V2 Vedic calculation with all requested component results and ruleset metadata.",
  ),
  action(
    "calculate_numerology_profile",
    "Calculate a Pythagorean, Chaldean, Kabbalah/Gematria, or Ank Jyotish profile with method-specific name, date, transliteration, and optional interpretation settings.",
    numerologyInputSchema,
    "profile",
    "Complete numerology profile, including resolved method policies, provenance, optional interpretations, and nonfatal warnings.",
  ),
];
