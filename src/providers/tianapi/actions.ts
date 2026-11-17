import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { tianapiFolkloreActions } from "./folklore-actions.ts";

const service = "tianapi";
const newsTopicSchema = s.looseObject("A trending news topic returned by TianAPI.", {
  title: s.string("The trending topic title."),
  digest: s.string("The topic summary, which may be empty."),
  hotnum: s.integer("The topic popularity index."),
});
function hotListOutputSchema(item: Record<string, unknown>) {
  return s.object(
    "The trending list result returned by TianAPI, preserving extra fields.",
    {
      list: s.array("The trending topics in the order returned by TianAPI.", item),
    },
    { additionalProperties: true, optional: [] },
  );
}
const newsListOutputSchema = hotListOutputSchema(newsTopicSchema);
const emptyInputSchema = s.object("No input parameters are required for this trending list.", {}, { optional: [] });
export const tianapiActions: ActionDefinition[] = [
  ...tianapiFolkloreActions,
  defineProviderAction(service, {
    name: "get_account_usage",
    description:
      "Query TianAPI account membership, remaining TianDou credits, and usage for an API ID. Enable the Account Information API (96) first; this request consumes its quota or TianDou credits.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Parameters for querying TianAPI account and API usage.",
      {
        apiId: s.integer(
          "The API ID whose usage to query, shown in its documentation URL or the TianAPI console. For example, 223 is the network trending API and 96 is the account information API.",
        ),
      },
      { optional: [] },
    ),
    outputSchema: s.looseObject("The account and API usage result returned by TianAPI, preserving extra fields.", {
      txcoin: s.integer("The remaining TianDou credits in the account."),
      api_give: s.integer("The remaining free calls for the requested API."),
      api_type: s.integer("The API billing type: 0 for membership quota, 1 for per-call billing."),
      api_getnum: s.integer("The total request count for the requested API."),
      user_level: s.integer("The account membership level reported by TianAPI; 0 means invalid."),
      update_time: s.integer("The Unix timestamp when the account information was updated."),
    }),
  }),
  defineProviderAction(service, {
    name: "list_network_trending",
    description:
      "List aggregated trending topics across Chinese platforms with titles, summaries, and popularity indexes. Enable the Network Trending API (223) in TianAPI first.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: newsListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "list_netease_trending",
    description:
      "List NetEase news trending topics through TianAPI. This endpoint belongs to the Network Trending API (223), which must be enabled first.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: newsListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "list_phoenix_trending",
    description:
      "List Phoenix news trending topics through TianAPI. This endpoint belongs to the Network Trending API (223), which must be enabled first.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: newsListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "list_baidu_trending",
    description:
      "List Baidu trending search keywords, summaries, popularity indexes, and trends through TianAPI. Enable the Baidu Trending API (68) first.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: hotListOutputSchema(
      s.looseObject("A Baidu trending search topic returned by TianAPI.", {
        brief: s.string("The topic summary."),
        index: s.string("The search popularity index, returned as a string."),
        trend: s.string("The search trend reported by TianAPI, such as fall."),
        keyword: s.string("The trending search keyword."),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "list_weibo_trending",
    description:
      "List Weibo trending search topics, tags, and popularity indexes through TianAPI. Enable the Weibo Trending API (100) first. TianAPI documents a 30-minute update interval.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: hotListOutputSchema(
      s.looseObject("A Weibo trending search topic returned by TianAPI.", {
        hottag: s.string("The topic tag, such as hot or new."),
        hotword: s.string("The trending search topic."),
        hotwordnum: s.string("The topic popularity index, returned as a string."),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "list_douyin_trending",
    description:
      "List Douyin trending search topics, labels, and popularity indexes through TianAPI. Enable the Douyin Trending API (155) first. TianAPI documents a 3-minute update interval.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: hotListOutputSchema(
      s.looseObject("A Douyin trending topic returned by TianAPI.", {
        word: s.string("The trending topic."),
        label: s.integer("The topic label: 1 for new, 2 for recommended, 3 for hot."),
        hotindex: s.integer("The topic popularity index."),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "list_toutiao_trending",
    description:
      "List Toutiao trending news topics and popularity indexes through TianAPI. Enable the Toutiao Trending API (244) first. TianAPI documents a 20-minute update interval.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: hotListOutputSchema(
      s.looseObject("A Toutiao trending topic returned by TianAPI.", {
        word: s.string("The trending topic."),
        hotindex: s.integer("The topic popularity index."),
      }),
    ),
  }),
  defineProviderAction(service, {
    name: "list_tencent_trending",
    description:
      "List Tencent ecosystem trending topics and ordering indexes through TianAPI. Enable the Tencent Trending API (196) first. TianAPI documents a 10-to-30-minute update interval.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: emptyInputSchema,
    outputSchema: hotListOutputSchema(
      s.looseObject("A Tencent trending topic returned by TianAPI.", {
        word: s.string("The trending topic."),
        index: s.integer("The ordering index reported by TianAPI, not a popularity score."),
      }),
    ),
  }),
];
