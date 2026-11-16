import { optionalRecord, optionalRawString } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { numerologyProfiles } from "./constants.ts";

export function validateCalendarDate(input: Record<string, unknown>): void {
  const year = input.year as number;
  const month = input.month as number;
  const day = input.day as number;
  const leap = year % 4 === 0 && (input.calendar === "julian" || year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]!)
    throw providerInputError("The supplied calendar date does not exist");
}
function hasLocation(input: Record<string, unknown>) {
  return (
    Boolean(optionalRawString(input.city)?.trim()) || (input.latitude !== undefined && input.longitude !== undefined)
  );
}
function validateCoordinates(input: Record<string, unknown>) {
  if ((input.latitude !== undefined) !== (input.longitude !== undefined))
    throw providerInputError("latitude and longitude must be supplied together");
}
function validateTimezone(value: unknown, allowAuto = true, allowLmt = false) {
  const timezone = optionalRawString(value);
  if (timezone === undefined || (allowAuto && timezone === "AUTO") || (allowLmt && timezone === "LMT")) return;
  try {
    if (timezone.startsWith("+") || timezone.startsWith("-")) throw new Error("fixed offset");
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    throw providerInputError("timezone must be an IANA timezone name or a documented automatic time mode");
  }
}
function parseInstant(value: string, field: string, dateEnd = false) {
  const date = value.slice(0, 10);
  const parts = date.split("-");
  if (
    parts.length !== 3 ||
    parts[0]!.length !== 4 ||
    parts[1]!.length !== 2 ||
    parts[2]!.length !== 2 ||
    !parts.every((part) => [...part].every((character) => character >= "0" && character <= "9"))
  )
    throw providerInputError(`${field} must be an ISO date or datetime`);
  const [year, month, day] = parts.map(Number);
  validateCalendarDate({ year, month, day });
  if (year! < 1) throw providerInputError(`${field} year must be positive`);
  if (value.length !== 10 && value[10] !== "T") throw providerInputError(`${field} must be an ISO date or datetime`);
  const time = value.slice(11);
  const hasOffset = time.endsWith("Z") || time.includes("+") || time.includes("-");
  const normalized =
    value.length === 10 ? `${value}T${dateEnd ? "23:59:59" : "00:00:00"}Z` : hasOffset ? value : `${value}Z`;
  const instant = Date.parse(normalized);
  if (!Number.isFinite(instant)) throw providerInputError(`${field} must be an ISO date or datetime`);
  return { instant, comparable: hasOffset };
}
export function validateExpansionInput(actionName: string, input: Record<string, unknown>): void {
  if (actionName === "get_moon_phase" || actionName === "get_moon_calendar" || actionName === "calculate_ephemeris") {
    validateCoordinates(input);
    validateTimezone(input.timezone);
  }
  if (actionName === "get_moon_phase") {
    if (input.includeRiseSet === true && !hasLocation(input))
      throw providerInputError("includeRiseSet requires a city or paired coordinates");
    if (input.date !== undefined && input.date !== "now") parseInstant(input.date as string, "date");
  }
  if (actionName === "list_sky_events") validateTimezone(input.timezone, false);
  if (actionName === "calculate_vedic_chart") {
    validateCalendarDate(input);
    validateCoordinates(input);
    validateTimezone(input.timezone, true, true);
  }
  if (actionName === "calculate_ephemeris") {
    const startValue = input.start as string;
    const endValue = optionalRawString(input.end);
    const start = parseInstant(startValue, "start");
    const end = endValue === undefined ? undefined : parseInstant(endValue, "end");
    const dateOnlyRange = startValue.length === 10 && endValue?.length === 10;
    const knownInstants = (start.comparable && end?.comparable) || input.timezone === "UTC";
    if (end && (dateOnlyRange || knownInstants) && end.instant < start.instant)
      throw providerInputError("end must not precede start");
    const step = (input.step ?? "1d") as string;
    const unit = step.slice(-1);
    const digits = step.slice(0, -1);
    if (
      !digits ||
      ![...digits].every((character) => character >= "0" && character <= "9") ||
      !Number.isInteger(Number(digits)) ||
      Number(digits) <= 0 ||
      !["m", "h", "d"].includes(unit)
    )
      throw providerInputError("step must be a positive whole minute, hour, or day interval such as 5m, 1h, or 1d");
    if (end && knownInstants) {
      const stepMs = Number(digits) * ({ m: 60000, h: 3600000, d: 86400000 }[unit] as number);
      const rows = Math.floor((end.instant - start.instant) / stepMs) + 1;
      if (unit === "m" && rows > 1440) throw providerInputError("Minute-step ephemeris ranges cannot exceed 1440 rows");
      if (input.format === "table" && input.tableStyle === "grid" && rows > 31)
        throw providerInputError("Grid ephemeris ranges cannot exceed 31 rows");
    }
  }
  if (actionName === "calculate_transit_timeline") {
    const natal = input.natal as Record<string, unknown>;
    validateCalendarDate(natal);
    validateTimezone(natal.timezone);
    const anglePoints = ["ascendant", "midheaven", "descendant", "ic", "vertex", "part_of_fortune"];
    const natalPoints = input.natalPoints as string[] | undefined;
    const usesAngles =
      natalPoints === undefined ||
      natalPoints.some((point) => anglePoints.includes(point)) ||
      input.includeHouses === true;
    if (natal.timeKnown !== false && usesAngles && natal.hour === undefined)
      throw providerInputError(
        "natal.hour is required for angle-sensitive timelines; otherwise provide planet-only natalPoints or set natal.timeKnown to false",
      );
    const start = parseInstant(input.rangeStart as string, "rangeStart");
    const end = parseInstant(input.rangeEnd as string, "rangeEnd", true);
    if (end.instant < start.instant) throw providerInputError("rangeEnd must not precede rangeStart");
    if (input.mode === "year_slow") {
      if (end.instant - start.instant > 366 * 86400000)
        throw providerInputError("year_slow ranges cannot exceed 366 days");
      const categories = input.transitCategories as string[] | undefined;
      if (categories?.some((category) => category !== "medium" && category !== "slow"))
        throw providerInputError("year_slow transitCategories can only contain medium and slow");
    } else {
      const a = new Date(start.instant),
        b = new Date(end.instant);
      if (a.getUTCFullYear() !== b.getUTCFullYear() || a.getUTCMonth() !== b.getUTCMonth())
        throw providerInputError("month mode must stay within one UTC calendar month");
    }
    if (
      natal.timeKnown === false &&
      (input.natalPoints as string[] | undefined)?.some((point) => anglePoints.includes(point))
    )
      throw providerInputError("Angle-derived natal points require a known birth time");
  }
  if (actionName === "calculate_numerology_profile") validateNumerologyInput(input);
}
function validateNumerologyInput(input: Record<string, unknown>) {
  const method = input.method as Record<string, unknown>;
  const subject = input.subject as Record<string, unknown>;
  const system = method.system as keyof typeof numerologyProfiles;
  const profiles: readonly string[] = numerologyProfiles[system];
  if (method.profile !== undefined && !profiles.includes(method.profile as string))
    throw providerInputError("method.profile must belong to the selected numerology system");
  const master =
    system === "pythagorean" ? "preserve_core_11_22_33" : system === "kabbalah" ? "not_applicable" : "reduce_all";
  if (method.masterPolicy !== undefined && method.masterPolicy !== master)
    throw providerInputError("method.masterPolicy is incompatible with the selected numerology system");
  if (method.compoundPolicy === "root_only" && system !== "pythagorean")
    throw providerInputError("root_only is only supported by Pythagorean profiles");
  if ((system === "pythagorean" || system === "chaldean") && method.nameSource !== undefined)
    throw providerInputError(
      "method.nameSource is only supported by Kabbalah and Ank Jyotish; Chaldean selects names through method.profile",
    );
  validateCoordinates(subject);
  if (system === "pythagorean") {
    const referenceDate = optionalRecord(input.dateContext)?.referenceDate;
    if (referenceDate === undefined && subject.timezone === undefined)
      throw providerInputError("Pythagorean cycles require dateContext.referenceDate or subject.timezone");
    validateTimezone(subject.timezone);
    if (referenceDate === undefined && subject.timezone === "AUTO" && !hasLocation(subject))
      throw providerInputError("AUTO timezone requires a city or paired coordinates when no referenceDate is provided");
  }
  const name = optionalRecord(subject.name);
  if (!name) return;
  const bothNames = name.birth !== undefined && name.current !== undefined;
  let selected = optionalRawString(method.nameSource);
  if (system === "chaldean") {
    const profile = optionalRawString(method.profile);
    if (profile === "birth_name" || profile === "chaldean-cheiro-birth-name-v1") selected = "birth";
    if (profile === "current_name" || profile === "chaldean-cheiro-current-name-v1") selected = "current";
    if (bothNames && !selected)
      throw providerInputError(
        "Chaldean input with both names requires an explicit current_name or birth_name profile",
      );
  }
  if ((system === "kabbalah" || system === "ank_jyotish") && bothNames && !selected)
    throw providerInputError("method.nameSource is required when both birth and current names are supplied");
  if (selected && name[selected] === undefined) throw providerInputError(`The selected ${selected} name is missing`);
  const transliteration = optionalRecord(name.transliteration);
  const needsTransliteration = name.script !== undefined && name.script !== "Latn" && system !== "kabbalah";
  const sources =
    system === "ank_jyotish" ? [selected ?? (name.birth === undefined ? "current" : "birth")] : ["birth", "current"];
  for (const source of sources) {
    if (
      name[source] !== undefined &&
      (needsTransliteration ||
        (transliteration !== undefined && (system === "pythagorean" || system === "chaldean"))) &&
      transliteration?.[source] === undefined
    )
      throw providerInputError(`subject.name.transliteration.${source} is required for the supplied name`);
  }
}
