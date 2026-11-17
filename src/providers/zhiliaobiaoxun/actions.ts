import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const bidFields = {
  bid_id: s.integer("The notice ID."),
  title: s.string("The notice title."),
  bid_type: s.string("The notice type returned by the provider, such as 招标 or 中标."),
  bid_process: s.string("The procurement stage name."),
  pub_time: s.string("The publication time as returned by the provider."),
  money: s.nullable(s.number("The amount in CNY.")),
  money_wan: s.nullable(s.number("The amount in ten thousand CNY.")),
  province: s.string("The province name."),
  city: s.string("The city name."),
  county: s.string("The county or district name."),
  caller_name: s.string("The purchaser name."),
  winner_names: s.array("Winning suppliers.", s.string("A supplier name.")),
  url: s.string("The notice URL on Zhiliao Biaoxun."),
};
const meta = s.looseObject("Request and billing metadata.", {
  request_id: s.string("The upstream request ID."),
  tool_name: s.string("The upstream tool name."),
  cost_units: s.number("Credits charged for this request."),
  execution_time_ms: s.number("Upstream execution time in milliseconds."),
});
function output(data: Record<string, unknown>) {
  return s.looseRequiredObject("The successful upstream response, including billing metadata.", {
    success: s.literal(true, { description: "Whether the request succeeded." }),
    data,
    error: s.nullable(s.looseObject("Upstream error information; null on success.", {})),
    meta,
  });
}
const bidList = s.looseObject("Matching procurement notices.", {
  total: s.integer("The total number of matching notices."),
  returned: s.integer("The number of notices returned on this page."),
  items: s.array("Notices on this page.", s.looseObject("A procurement notice.", bidFields)),
});
const identity = {
  bid_id: s.integer("The notice ID; pair it with bid_type."),
  bid_type: s.integer("The notice type: 1 for tenders, 2 for awards.", { minimum: 1, maximum: 2 }),
  bid_url: s.nonWhitespaceString("The notice URL; forwarded to the provider without downloading it."),
};
export const zhiliaobiaoxunActions: ActionDefinition[] = [
  defineProviderAction("zhiliaobiaoxun", {
    name: "search_bids",
    operationType: "read",
    requiredScopes: [],
    description:
      "Search Chinese tender and award notices by keywords, region, publication date, or amount. Returns one page per call and charges provider credits. Increase page to continue.",
    inputSchema: s.object(
      "Notice search filters.",
      {
        keywords: s.array("Search keywords.", s.nonWhitespaceString("A search keyword."), {
          minItems: 1,
        }),
        match_modes: s.array(
          "Fields in which to match keywords; omit for provider defaults.",
          s.stringEnum("A keyword matching mode.", [
            "all",
            "sm",
            "title",
            "brand",
            "fulltext",
            "caller",
            "winner",
            "winner_tender",
            "tender",
            "agency",
          ]),
        ),
        bid_type: s.stringEnum("Notice category: 招标 for tenders, 中标 for awards, 全部 for both.", [
          "招标",
          "中标",
          "全部",
        ]),
        bid_process: s.array(
          "Procurement stages: 1 intent, 2 pre-tender, 4 tender, 5 amendment, 6 award candidates, 7 award, 8 contract, 9 acceptance, 10 cancellation. Default: [1,2,4,7,8].",
          s.integer("A procurement stage ID."),
        ),
        begin_date: s.string("Inclusive publication start date, YYYY-MM-DD.", { format: "date" }),
        end_date: s.string("Inclusive publication end date, YYYY-MM-DD.", { format: "date" }),
        provinces: s.array("Province names, such as 北京 or 内蒙古.", s.nonWhitespaceString("A province name.")),
        cities: s.array("City names, such as 石家庄 or 合肥.", s.nonWhitespaceString("A city name.")),
        counties: s.array(
          "County or district names, such as 长安区.",
          s.nonWhitespaceString("A county or district name."),
        ),
        min_amount: s.number("Minimum amount in ten thousand CNY."),
        max_amount: s.number("Maximum amount in ten thousand CNY."),
        page: s.integer("Page number, starting at 1; defaults to 1.", { minimum: 1, default: 1 }),
        page_size: s.integer("Notices per page; defaults to 20.", { minimum: 1, default: 20 }),
      },
      { required: ["keywords"] },
    ),
    outputSchema: output(bidList),
  }),
  defineProviderAction("zhiliaobiaoxun", {
    name: "get_bid_detail",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read a procurement notice with its full text and attachment links. Supply a notice URL, unique key, or notice ID. Charges provider credits; attachments are returned as URLs.",
    inputSchema: {
      ...s.object(
        "Notice identifiers; supply at least one locator.",
        {
          ...identity,
          uniq_key: s.nonWhitespaceString("The provider's unique notice key."),
        },
        { required: [] },
      ),
      anyOf: [{ required: ["bid_id"] }, { required: ["bid_url"] }, { required: ["uniq_key"] }],
    },
    outputSchema: output(
      s.looseObject("Notice details, preserving additional provider fields.", {
        ...bidFields,
        uniq_key: s.string("The provider's unique notice key."),
        source: s.string("The notice body."),
        source_ext: s.string("Extracted attachment content."),
        source_url: s.string("The original publication URL."),
        attachment_urls: s.array(
          "Attachment URLs; no files are downloaded by this action.",
          s.string("An attachment URL."),
        ),
        contact_privacy: s.string("Provider contact visibility: full or masked, depending on the account."),
      }),
    ),
  }),
  defineProviderAction("zhiliaobiaoxun", {
    name: "get_bid_timeline",
    operationType: "read",
    requiredScopes: [],
    description:
      "Retrieve notices for every stage of the same procurement project, ordered by publication time ascending. Supply a notice URL or a notice ID with its type. Charges provider credits.",
    inputSchema: {
      ...s.object(
        "A notice identifying the procurement project.",
        {
          ...identity,
          bid_type: {
            type: ["integer", "string"],
            enum: [1, 2, "1", "2"],
            description: "The notice type: 1 for tenders, 2 for awards; numeric strings are accepted.",
          },
        },
        { required: [] },
      ),
      anyOf: [{ required: ["bid_url"] }, { required: ["bid_id", "bid_type"] }],
    },
    outputSchema: output(
      s.looseObject("The project timeline.", {
        total: s.integer("The number of notices across project stages."),
        items: s.array(
          "Project notices ordered by publication time ascending.",
          s.looseObject("A procurement notice.", bidFields),
        ),
      }),
    ),
  }),
  defineProviderAction("zhiliaobiaoxun", {
    name: "get_account_balance",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read available credits and cumulative charged and consumed credits for the connected account. This endpoint does not consume credits.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: output(
      s.looseObject("Account credit balance.", {
        user_id: s.integer("The account ID associated with the API key."),
        balance: s.number("Available credits."),
        total_charged: s.number("Cumulative credits added to the account."),
        total_consumed: s.number("Cumulative credits consumed."),
      }),
    ),
  }),
];
