import type { SalesforceHandler } from "./context.ts";

import { recordOrEmpty } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
export const salesforceKnowledgeHandlers: Record<string, SalesforceHandler> = {
  async list_knowledge_articles(d, c) {
    if (d.queryMethod && !Object.keys(recordOrEmpty(d.categories)).length)
      throw providerInputError("queryMethod requires categories");
    if (d.order && !d.sort) throw providerInputError("order requires sort");
    if (d.sort === "ViewScore" && (d.searchText || d.pageNumber !== undefined))
      throw providerInputError("ViewScore does not support searchText or pageNumber");
    return c.object(
      queryPath(`${c.base}/support/knowledgeArticles`, {
        q: d.searchText,
        channel: d.channel,
        categories: d.categories === undefined ? undefined : JSON.stringify(d.categories),
        queryMethod: d.queryMethod,
        sort: d.sort,
        order: d.order,
        pageSize: d.pageSize,
        pageNumber: d.pageNumber,
      }),
      "GET",
      undefined,
      { "Accept-Language": String(d.language) },
    );
  },
  async get_knowledge_article(d, c) {
    if ((d.articleId !== undefined) === (d.urlName !== undefined))
      throw providerInputError("Provide exactly one of articleId or urlName");
    return {
      article: await c.object(
        queryPath(`${c.base}/support/knowledgeArticles/${segment(d.articleId ?? d.urlName)}`, {
          channel: d.channel,
          isUrlName: d.urlName === undefined ? undefined : true,
          updateViewStat: d.updateViewStat ?? false,
        }),
        "GET",
        undefined,
        { "Accept-Language": String(d.language) },
      ),
    };
  },
};
