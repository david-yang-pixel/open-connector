import type { JsonSchema as ActionJsonSchema } from "../../core/types.ts";
import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "eastmoney_miaoxiang";
function responseSchema(data: ActionJsonSchema) {
  return {
    ...s.looseObject("The original Miaoxiang response, including provider-defined fields.", {
      status: s.integer("The global API status; zero indicates success."),
      message: s.string("The provider's response message."),
      data: s.nullable(data),
    }),
    required: ["status"],
  };
}
export const eastmoneyMiaoxiangActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "query_financial_data",
    description:
      "Query Eastmoney Miaoxiang market, financial, company and relationship data using natural language. Specify securities, indicators and a bounded date range to keep results manageable.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requiredObject("Financial data query parameters.", {
      toolQuery: s.nonEmptyString("A natural-language question specifying securities, indicators and dates.", {}),
    }),
    outputSchema: responseSchema(
      s.looseObject("Financial data and query metadata.", {
        questionId: s.string("The unique identifier for this query."),
        dataTableDTOList: s.array(
          "Standardized indicator tables.",
          s.looseObject("One security indicator table.", {
            code: s.string("The security code including its market suffix."),
            entityName: s.string("The security name."),
            title: s.string("The indicator table title."),
            table: s.looseObject(
              "Indicator values keyed by indicator code, with time or dimension values under headName.",
            ),
            nameMap: s.looseObject("Mappings from indicator codes to display names."),
            indicatorOrder: s.array("The display order of indicator columns.", s.string("An indicator code.")),
          }),
        ),
        rawDataTableDTOList: s.array(
          "Original unprocessed indicator tables.",
          s.looseObject("An original indicator table."),
        ),
        condition: s.looseObject("The interpreted query conditions."),
        entityTagDTOList: s.array(
          "Distinct security entities involved in the query.",
          s.looseObject("A security entity and its attributes."),
        ),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "search_news",
    description:
      "Search Eastmoney Miaoxiang financial news, announcements, research reports and policies using a natural-language question.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requiredObject("Financial news search parameters.", {
      query: s.nonEmptyString("The financial topic, security, event or date range to search.", {}),
    }),
    outputSchema: responseSchema(
      s.looseObject("The search response, preserving source metadata and provider-defined content.", {
        data: s.looseObject("Search results and interpreted query metadata.", {
          llmSearchResponse: s.looseObject("The financial search result payload.", {
            data: s.array(
              "Relevant financial information items.",
              s.looseObject("One news, announcement or research result.", {
                title: s.string("The information title."),
                content: s.string("The information content."),
                date: s.string("The source publication date."),
                insName: s.string("The publishing institution."),
                informationType: s.string("The provider's information category."),
              }),
            ),
          }),
        }),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "screen_stocks",
    description:
      "Screen securities by natural-language market or financial conditions, or find sector and index constituents. Preserve the same keyword while paging; result formats depend on the interpreted query.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Stock screening parameters.",
      {
        keyword: s.nonEmptyString("Natural-language screening conditions or a constituent query.", {}),
        pageNo: s.integer("The page number, starting at one. Defaults to 1.", {
          minimum: 1,
          default: 1,
        }),
        pageSize: s.integer("The requested number of results per page. Defaults to 20.", {
          minimum: 1,
          default: 20,
        }),
      },
      { optional: ["pageNo", "pageSize"] },
    ),
    outputSchema: responseSchema(
      s.looseObject("Screening business status and results.", {
        code: s.string("The screening business status; 100 indicates successful parsing."),
        msg: s.string("The screening business message."),
        data: s.looseObject("Screening results, conditions and provider-specific result variants.", {
          resultType: s.integer("The result format; 2000 denotes standard stock screening."),
          result: s.looseObject("A standard screening result table.", {
            total: s.integer("The total number of matches."),
            totalRecordCount: s.integer("The provider's total record count."),
            columns: s.array(
              "Column definitions mapping display names to row keys.",
              s.looseObject("A column definition and its metadata."),
            ),
            dataList: s.array(
              "Rows matching the screening conditions.",
              s.looseObject("A security row keyed by the returned column definitions."),
            ),
          }),
          allResults: s.looseObject("An alternative full-results wrapper returned by the provider."),
          partialResults: s.string("A partial-result Markdown table when returned by the provider."),
          parserText: s.string("The interpreted screening conditions."),
          responseConditionList: s.array(
            "Per-condition match statistics.",
            s.looseObject("One interpreted condition and its match count."),
          ),
          totalCondition: s.looseObject("Combined screening conditions and match count."),
        }),
      }),
    ),
  }),
];
