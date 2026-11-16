import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const keyFields = {
  key: s.string("Company identifier, name, unified social credit code, registration number or organization code.", {
    minLength: 1,
  }),
  key_type: s.stringEnum(
    "Identifier type: 0 entity ID (default), 1 company name, 2 unified social credit code, 3 registration number, 4 organization code.",
    ["0", "1", "2", "3", "4"],
  ),
};
const pagination = {
  page_index: s.integer("Page number, starting at 1. Omit for the provider default.", {
    minimum: 1,
  }),
  page_size: s.integer("Number of records per page. Omit for the provider default.", {
    minimum: 1,
  }),
};
const record = s.looseObject("One upstream company record, including provider-specific fields.");
const page = s.looseObject("A page of upstream records.", {
  datalist: s.array("Records on this page.", record),
  total: s.integer("Total matching records."),
});
function companyResponse(result: JsonSchema): JsonSchema {
  return s.object(
    "Bainiu response envelope; upstream fields are preserved.",
    {
      code: s.string("Upstream response code; 200 indicates success."),
      message: s.string("Upstream response message."),
      result,
      ordernum: s.string("Upstream request or order identifier."),
      is_verify: s.string("Billing indicator: 0 not charged, 1 charged."),
    },
    { required: ["code", "message", "result"], additionalProperties: true },
  );
}
export const bainiuActions: ActionDefinition[] = [
  defineProviderAction("bainiu", {
    name: "resolve_companies",
    operationType: "read",
    requiredScopes: [],
    description:
      "Resolve company identifiers in a batch. Separate multiple lookup keys with commas; queries may consume provider credits.",
    inputSchema: s.object("Company identifier lookup parameters.", keyFields, {
      optional: ["key_type"],
    }),
    outputSchema: companyResponse(
      s.record("Mapping from each lookup key to its entity ID.", s.string("Company entity ID.")),
    ),
  }),
  defineProviderAction("bainiu", {
    name: "search_companies",
    operationType: "read",
    requiredScopes: [],
    description:
      "Search companies using Bainiu's DSL with filters, sorting, highlighting and pagination. Queries may consume provider credits.",
    inputSchema: s.requiredObject("Company search parameters.", {
      data: s.object(
        "Search request encoded as JSON by Connector. Supports the full upstream query DSL and additional provider options.",
        {
          dsl_query: s.looseObject(
            'Bainiu filter tree, using must/should and field operators any/all/not/range/exist. Example: {"must":[{"main__ENTNAME":{"all":["小米"]}}]}.',
          ),
          sort: s.looseObject("Upstream sort configuration, including algorithm or geographical sorting."),
          highlight: s.looseObject("Upstream highlight configuration."),
          ...pagination,
        },
        { required: ["dsl_query"], additionalProperties: true },
      ),
    }),
    outputSchema: companyResponse(page),
  }),
  defineProviderAction("bainiu", {
    name: "get_company",
    operationType: "read",
    requiredScopes: [],
    description: "Read company registration and business information. Queries may consume provider credits.",
    inputSchema: s.object("Company detail lookup parameters.", keyFields, { required: ["key"] }),
    outputSchema: companyResponse(
      s.looseObject("Requested company detail nodes.", {
        versions: s.array("Returned detail node codes.", s.string("Detail node code.")),
        basic: record,
      }),
    ),
  }),
  defineProviderAction("bainiu", {
    name: "list_company_branches",
    operationType: "read",
    requiredScopes: [],
    description: "List company branches with pagination. Queries may consume provider credits.",
    inputSchema: s.object("Company detail lookup parameters.", { ...keyFields, ...pagination }, { required: ["key"] }),
    outputSchema: companyResponse(
      s.looseObject("Requested company detail nodes.", {
        versions: s.array("Returned detail node codes.", s.string("Detail node code.")),
        filiation: page,
      }),
    ),
  }),
  defineProviderAction("bainiu", {
    name: "list_company_shareholders",
    operationType: "read",
    requiredScopes: [],
    description: "List company shareholders and managers with pagination. Queries may consume provider credits.",
    inputSchema: s.object("Company detail lookup parameters.", { ...keyFields, ...pagination }, { required: ["key"] }),
    outputSchema: companyResponse(
      s.looseObject("Requested company detail nodes.", {
        versions: s.array("Returned detail node codes.", s.string("Detail node code.")),
        shareholder: page,
        person: page,
      }),
    ),
  }),
  defineProviderAction("bainiu", {
    name: "list_company_changes",
    operationType: "read",
    requiredScopes: [],
    description:
      "List company registration changes with optional type and date filters. Queries may consume provider credits.",
    inputSchema: s.object(
      "Company detail lookup parameters.",
      {
        ...keyFields,
        ...pagination,
        alttype: s.string(
          "Upstream change type code, for example 01 name, 03 representative, 10 business scope or 20 registered capital.",
        ),
        altdate_start: s.date("Inclusive change date lower bound (YYYY-MM-DD)."),
        altdate_end: s.date("Exclusive change date upper bound (YYYY-MM-DD)."),
      },
      { required: ["key"] },
    ),
    outputSchema: companyResponse(
      s.looseObject("Requested company detail nodes.", {
        versions: s.array("Returned detail node codes.", s.string("Detail node code.")),
        alter: page,
      }),
    ),
  }),
];
