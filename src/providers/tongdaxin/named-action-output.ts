import {
  optionalBoolean,
  optionalRecord,
  optionalString,
  optionalStringOrNull,
  recordOrEmpty,
} from "../../core/cast.ts";
import { providerResponseError, requiredResponseRecord } from "../provider-runtime.ts";

export function normalizeTongdaxinNamedActionOutput(actionName: string, result: unknown): unknown {
  const resultObject = requiredResponseRecord(result, "Tongdaxin named action result");
  throwNamedActionFailure(resultObject);

  switch (actionName) {
    case "lookup_security":
      return {
        matches: normalizeLookupMatches(resultObject.data),
        result,
      };
    case "get_quotes":
      return normalizeQuotes(resultObject, result);
    case "get_kline":
      return normalizeKline(resultObject, result);
    case "query_indicators":
      return {
        data: requireResponseArray(resultObject.data, "Tongdaxin indicator data"),
        result,
      };
    case "screen_stocks":
    case "screen_hk_stocks":
    case "screen_funds":
    case "screen_indices":
    case "screen_fund_managers":
      return normalizeScreening(resultObject, result);
    case "search_news":
    case "search_announcements":
    case "search_reports":
    case "query_macro_data":
      return normalizeSearch(resultObject, result);
    case "get_financial_statements":
    case "get_company_profile":
    case "get_shareholder_research":
    case "get_institutional_holdings":
    case "get_capital_and_trading_data":
    case "get_dividends_and_financing":
    case "get_share_capital":
    case "get_valuation_and_ranking":
    case "get_board_and_industry_data":
    case "get_hot_topics":
    case "get_hk_financials":
      return normalizeF10(resultObject);
    default:
      return assertNever(actionName);
  }
}

function normalizeLookupMatches(value: unknown) {
  return requireResponseObjectArray(value, "Tongdaxin lookup data").map((match) => {
    const marketCode = match.setcode;
    if (typeof marketCode !== "string" && typeof marketCode !== "number") {
      throw providerResponseError("Tongdaxin lookup setcode is required");
    }
    return {
      ...match,
      code: requireResponseString(match.code, "Tongdaxin lookup code"),
      marketCode: String(marketCode),
    };
  });
}

function normalizeQuotes(resultObject: Record<string, unknown>, result: unknown) {
  return {
    baseInformation: requiredResponseRecord(resultObject.BaseInfo, "Tongdaxin quote BaseInfo"),
    quote: requiredResponseRecord(resultObject.HQInfo, "Tongdaxin quote HQInfo"),
    extendedInformation: requiredResponseRecord(resultObject.ExtInfo, "Tongdaxin quote ExtInfo"),
    orderBook:
      resultObject.BspInfo == null ? [] : requireResponseObjectArray(resultObject.BspInfo, "Tongdaxin quote BspInfo"),
    professionalInformation:
      resultObject.ProInfo == null ? {} : requiredResponseRecord(resultObject.ProInfo, "Tongdaxin quote ProInfo"),
    financialInformation:
      resultObject.CwInfo == null ? {} : requiredResponseRecord(resultObject.CwInfo, "Tongdaxin quote CwInfo"),
    statistics:
      resultObject.StatInfo == null ? {} : requiredResponseRecord(resultObject.StatInfo, "Tongdaxin quote StatInfo"),
    result,
  };
}

function normalizeKline(resultObject: Record<string, unknown>, result: unknown) {
  const period = resultObject.Period;
  if (typeof period !== "string" && typeof period !== "number") {
    throw providerResponseError("Tongdaxin K-line Period is required");
  }
  return {
    code: requireResponseString(resultObject.Code, "Tongdaxin K-line Code"),
    period,
    rows: requireResponseObjectArray(resultObject.Rows, "Tongdaxin K-line Rows"),
    statistics: requiredResponseRecord(resultObject.Stats, "Tongdaxin K-line Stats"),
    result,
  };
}

function normalizeScreening(resultObject: Record<string, unknown>, result: unknown) {
  return {
    summary: asStringOrNull(resultObject.summary),
    metadata: requiredResponseRecord(resultObject.meta, "Tongdaxin screening meta"),
    headers: requireResponseStringArray(resultObject.headers, "Tongdaxin screening headers"),
    data: requireResponseObjectArray(resultObject.data, "Tongdaxin screening data"),
    result,
  };
}

function normalizeSearch(resultObject: Record<string, unknown>, result: unknown) {
  if (!Object.hasOwn(resultObject, "data")) {
    throw providerResponseError("Tongdaxin search data is required");
  }
  return {
    ok: optionalBoolean(resultObject.ok) ?? null,
    query: asStringOrNull(resultObject.query),
    data: resultObject.data ?? null,
    result,
  };
}

function normalizeF10(resultObject: Record<string, unknown>) {
  const response = requiredResponseRecord(resultObject.response, "Tongdaxin F10 response");
  return response.transformed ?? null;
}

function assertNever(value: string): never {
  throw providerResponseError(`unhandled Tongdaxin action output: ${value}`);
}

function throwNamedActionFailure(result: Record<string, unknown>) {
  const response = asObjectOrEmpty(result.response);
  if (optionalBoolean(result.ok) !== false && optionalBoolean(response.ok) !== false) {
    return;
  }

  throw providerResponseError("Tongdaxin returned an unsuccessful tool result");
}

function requireResponseArray(value: unknown, label: string) {
  if (!Array.isArray(value)) throw providerResponseError(`${label} must be an array`);
  return value;
}

function requireResponseObjectArray(value: unknown, label: string) {
  return requireResponseArray(value, label).map((item) => {
    const record = optionalRecord(item);
    if (!record) throw providerResponseError(`${label} must contain objects`);
    return record;
  });
}

function requireResponseString(value: unknown, label: string) {
  const string = optionalString(value);
  if (string === undefined) throw providerResponseError(`${label} must be a string`);
  return string;
}

function requireResponseStringArray(value: unknown, label: string) {
  return requireResponseArray(value, label).map((item) => requireResponseString(item, label));
}

const asObjectOrEmpty = recordOrEmpty;
const asStringOrNull = optionalStringOrNull;
