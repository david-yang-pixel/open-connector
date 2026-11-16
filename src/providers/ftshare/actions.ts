import type { JsonSchema as ActionJsonSchema } from "../../core/types.ts";
import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const stockFields = {
  stock_code: s.string("Stock code returned by FTShare."),
  stock_name: s.string("Stock name."),
};
const reportFields = {
  ...stockFields,
  year: s.integer("Report year."),
  report_type: s.string("Report period type."),
  report_type_cn: s.string("Chinese report period name."),
  publish_date: s.string("Publication date in YYYY-MM-DD format."),
};
function reportInput(allowHalfYear: boolean) {
  return {
    ...s.object(
      "Choose either one stock's full history or a paginated market report period.",
      {
        stock_code: s.string(
          "Six-digit A-share code with exchange suffix, for example 000001.SZ. Returns all historical periods without pagination.",
          { pattern: "^[0-9]{6}\\.[A-Z]+$" },
        ),
        year: s.integer("Report year, required for market-wide queries."),
        report_type: s.stringEnum(
          "Report period: q1, q2 (half-year), q3, or annual. Income and balance sheets also accept h1 as q2.",
          allowHalfYear ? ["q1", "q2", "q3", "annual", "h1"] : ["q1", "q2", "q3", "annual"],
        ),
        page: s.integer("Market query page, starting at 1; defaults to 1.", { minimum: 1 }),
        page_size: s.integer("Market query page size; defaults to 50, maximum 500.", {
          minimum: 1,
          maximum: 500,
        }),
      },
      { required: [] },
    ),
    oneOf: [
      {
        required: ["stock_code"],
        not: {
          anyOf: ["year", "report_type", "page", "page_size"].map((key) => ({ required: [key] })),
        },
      },
      { required: ["year", "report_type"], not: { required: ["stock_code"] } },
    ],
  };
}
function envelope(data: ActionJsonSchema) {
  return s.looseObject("FTShare response envelope; upstream extension fields are preserved.", {
    code: s.integer("Upstream status code; 200 indicates success."),
    message: s.string("Upstream status message."),
    data,
  });
}
function report(name: string, description: string, fields: Record<string, ActionJsonSchema>, allowHalfYear = false) {
  return defineProviderAction("ftshare", {
    name,
    description,
    operationType: "read",
    requiredScopes: [],
    inputSchema: reportInput(allowHalfYear),
    outputSchema: envelope(
      s.looseObject("Report records and pagination totals.", {
        items: s.array(
          "Records, retaining financial strings, nulls, and additional upstream fields.",
          s.looseObject("One report record with provider-defined financial fields.", {
            ...reportFields,
            ...fields,
          }),
        ),
        total_items: s.integer("Total matching records."),
        total_pages: s.integer("Total result pages."),
      }),
    ),
  });
}
export const ftshareActions: ActionDefinition[] = [
  defineProviderAction("ftshare", {
    name: "list_companies",
    description: "List company snapshots with optional exact stock name and unsuffixed stock code filters.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Company filters and pagination.",
      {
        stock_code: s.nonEmptyString("Exact stock code without exchange suffix, for example 000001."),
        stock_name: s.nonEmptyString("Exact stock name."),
        page: s.integer("Page number; defaults to 1.", { minimum: 1 }),
        page_size: s.integer("Page size; defaults to 50, maximum 200.", {
          minimum: 1,
          maximum: 200,
        }),
      },
      { required: [] },
    ),
    outputSchema: envelope(
      s.looseObject("Company result page.", {
        pageNum: s.integer("Current page number."),
        pageSize: s.integer("Current page size."),
        total: s.integer("Total matching companies."),
        pages: s.integer("Total result pages."),
        records: s.array(
          "Company snapshots.",
          s.looseObject("Company details; additional upstream fields are preserved.", {
            ...stockFields,
            company_code: s.string("Company code."),
            main_business: s.nullableString("Main business activities."),
            company_profile: s.nullableString("Company profile."),
            total_market_value: s.nullableString("Total market capitalization as reported by FTShare."),
          }),
        ),
      }),
    ),
  }),
  report(
    "get_income_statements",
    "Read A-share income statements for one stock's full history or one market-wide report period.",
    {
      report_form_type: s.string("Statement consolidation and adjustment type."),
      t_revenue: s.nullableString("Total revenue."),
      n_profit: s.nullableString("Net profit including minority interests."),
      parcomp_n_profit: s.nullableString("Net profit attributable to the parent company."),
    },
    true,
  ),
  report(
    "get_balance_sheets",
    "Read A-share balance sheets for one stock's full history or one market-wide report period.",
    {
      report_form_type: s.string("Statement consolidation and adjustment type."),
      t_assets: s.nullableString("Total assets."),
      t_liability: s.nullableString("Total liabilities."),
      t_equity: s.nullableString("Total equity."),
    },
    true,
  ),
  report(
    "get_cashflow_statements",
    "Read A-share cash flow statements for one stock's full history or one market-wide report period.",
    {
      detail_report_type: s.string("Detailed statement consolidation and adjustment type."),
      net_oper_cash_flow: s.nullableString("Net cash flow from operating activities."),
      net_invest_cash_flow: s.nullableString("Net cash flow from investing activities."),
      net_fin_cash_flow: s.nullableString("Net cash flow from financing activities."),
    },
  ),
  report(
    "get_earnings_reports",
    "Read A-share earnings express reports by stock or market report period, preserving multiple disclosures and corrections.",
    {
      eps: s.nullableString("Earnings per share."),
      total_revenue: s.nullableString("Total revenue."),
      net_profit: s.nullableString("Net profit."),
      roe: s.nullableString("Return on equity."),
    },
  ),
  report(
    "get_earnings_forecasts",
    "Read A-share earnings forecasts by stock or market report period, including forecast ranges and year-over-year changes.",
    {
      forecast_subject: s.string("Forecast financial metric."),
      forecast_type: s.string("Forecast category reported by FTShare."),
      forecast_value_min: s.nullableString("Lower forecast value."),
      forecast_value_max: s.nullableString("Upper forecast value."),
      unit: s.string("Forecast value unit."),
      yoy_change_min: s.nullableString("Lower year-over-year percentage change."),
      yoy_change_max: s.nullableString("Upper year-over-year percentage change."),
      last_year_value: s.nullableString("Value for the same period last year."),
    },
  ),
];
