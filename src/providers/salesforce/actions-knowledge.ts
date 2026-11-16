import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion } from "./schemas.ts";
import { recordId } from "./schemas.ts";
const language = s.string("Active Knowledge language in the organization, sent as Accept-Language.", { minLength: 1 });
const channel = s.stringEnum("Article visibility channel. Omit to use the Salesforce user context.", [
  "App",
  "Pkb",
  "Csp",
  "Prm",
]);
const article = s.looseObject("Online article metadata and organization-defined layout fields.");
export const salesforceKnowledgeActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_knowledge_articles",
    description:
      "Search or browse visible online Knowledge articles by language, channel and categories. Results are summaries; get_knowledge_article retrieves content. Increment pageNumber for subsequent pages.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        language,
        channel,
        searchText: s.string("SOSL search text; omit or leave empty to browse articles."),
        categories: s.object(
          "Map of unique category group API names to category API names; at most three conditions.",
          {},
          {
            additionalProperties: s.string("Category API name.", { minLength: 1 }),
            maxProperties: 3,
          },
        ),
        queryMethod: s.stringEnum("Category matching method; requires categories.", [
          "AT",
          "BELOW",
          "ABOVE",
          "ABOVE_OR_BELOW",
        ]),
        sort: s.stringEnum("Sort field. ViewScore only supports browsing and a single page.", [
          "LastPublishedDate",
          "CreatedDate",
          "Title",
          "ViewScore",
        ]),
        order: s.stringEnum("Sort direction; requires an explicit sort field.", ["ASC", "DESC"]),
        pageSize: s.integer("Articles per page.", { minimum: 1, maximum: 100 }),
        pageNumber: s.integer("Page number starting at one; unavailable with ViewScore sorting.", {
          minimum: 1,
        }),
      },
      {
        optional: [
          "apiVersion",
          "channel",
          "searchText",
          "categories",
          "queryMethod",
          "sort",
          "order",
          "pageSize",
          "pageNumber",
        ],
      },
    ),
    outputSchema: s.object(
      "Page of online article summaries.",
      {
        articles: s.array("Visible article summaries.", article),
        currentPageUrl: s.string("URL of this article page."),
        nextPageUrl: s.nullable(s.string("URL of the next article page, or null at the end.")),
        pageNumber: s.integer("Current page number."),
      },
      {
        required: ["articles"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_knowledge_article",
    description:
      "Get a visible online Knowledge article by article ID or URL name, including custom layout content. Does not retrieve draft versions or custom binary file fields.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        language,
        channel,
        articleId: {
          ...recordId,
          description:
            "Permanent Knowledge article ID, not a Knowledge article version ID; mutually exclusive with urlName.",
        },
        urlName: s.string("Article URL name; mutually exclusive with articleId.", { minLength: 1 }),
        updateViewStat: {
          ...s.boolean("Increment article view counts when true. Defaults to false."),
          default: false,
        },
      },
      { optional: ["apiVersion", "channel", "articleId", "urlName", "updateViewStat"] },
    ),
    outputSchema: s.object(
      "Online Knowledge article.",
      { article },
      {
        optional: [],
      },
    ),
  }),
];
