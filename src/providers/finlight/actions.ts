import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const article = s.object(
  "A financial news article returned by Finlight.",
  {
    link: s.string("URL of the original article."),
    source: s.string("Publisher domain."),
    title: s.string("Article title."),
    summary: s.nullable(s.string("Article summary when available.")),
    publishDate: s.string("Publication date as an ISO date string."),
    createdAt: s.string("Indexing date, returned when ordering by createdAt."),
    revisedDate: s.nullable(s.string("Last revision date, returned when ordering by revisedDate.")),
    language: s.string("Article language as an ISO 639-1 code."),
    sentiment: s.string("Sentiment: positive, neutral, or negative."),
    confidence: s.string("Sentiment confidence from 0 to 1 as a stringified number."),
    content: s.nullable(s.string("Full article content when available under the subscription.")),
    images: s.stringArray("Article image URLs.", { itemDescription: "An article image URL." }),
    countries: s.stringArray("Countries related to the article.", {
      itemDescription: "An ISO 3166-1 alpha-2 country code.",
    }),
    categories: s.stringArray("Article categories.", { itemDescription: "An article category." }),
    companies: s.nullable(
      s.array(
        "Company entities, subject to subscription access.",
        s.looseObject("Company identity, confidence, tickers, ISINs, and exchange listings."),
      ),
    ),
  },
  {
    required: ["link", "title"],
    additionalProperties: true,
  },
);
export const finlightActions: ActionDefinition[] = [
  defineProviderAction("finlight", {
    name: "search_articles",
    description:
      "Search financial news with sentiment, source, ticker, country, category, date, and pagination filters.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Financial news search options.",
      {
        query: s.string("Search query, including Finlight advanced query syntax."),
        sources: s.stringArray("Restrict sources; use * to include all sources.", {
          itemDescription: "A source domain or *.",
        }),
        optInSources: s.stringArray("Additional sources to include beyond the default set.", {
          itemDescription: "An additional source domain.",
        }),
        excludeSources: s.stringArray("Sources to exclude.", {
          itemDescription: "A source domain to exclude.",
        }),
        tickers: s.stringArray("Stock tickers to match; supports *.", {
          itemDescription: "A stock ticker or *.",
        }),
        countries: s.stringArray("Filter countries the article is about, not publisher or company domicile.", {
          itemDescription: "An ISO 3166-1 alpha-2 country code.",
        }),
        categories: s.array(
          "Filter by article categories.",
          s.stringEnum("An article category.", [
            "markets",
            "economy",
            "business",
            "politics",
            "geopolitics",
            "regulation",
            "technology",
            "energy",
            "commodities",
            "crypto",
            "health",
            "climate",
            "security",
          ]),
        ),
        includeEntities: s.boolean("Include company entities; requires a suitable subscription. Defaults to false."),
        from: s.nonEmptyString("Start date in YYYY-MM-DD or ISO date format."),
        to: s.nonEmptyString("End date in YYYY-MM-DD or ISO date format."),
        language: s.nonEmptyString("ISO 639-1 language filter. Defaults to en, excluding other languages."),
        orderBy: s.stringEnum("Sort field. Defaults to publishDate.", ["publishDate", "createdAt", "revisedDate"]),
        order: s.stringEnum("Sort direction. Defaults to DESC.", ["ASC", "DESC"]),
        pageSize: s.integer("Results per page. Defaults to 20.", { minimum: 1, maximum: 100 }),
        page: s.integer("Page number, starting at 1. Defaults to 1.", { minimum: 1 }),
      },
      {
        required: [],
      },
    ),
    outputSchema: s.object(
      "Finlight search response with pagination and articles.",
      {
        status: s.string("Upstream response status."),
        page: s.integer("Current page number."),
        pageSize: s.integer("Requested page size."),
        articles: s.array("Matching articles on this page.", article),
      },
      {
        required: ["status", "page", "pageSize", "articles"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("finlight", {
    name: "get_article_by_link",
    description: "Get a Finlight article by its original URL, optionally including company entities and full content.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Article lookup options.",
      {
        link: s.url("Original article URL to look up in Finlight."),
        includeEntities: s.boolean("Include company entities; requires a suitable subscription. Defaults to false."),
        includeContent: s.boolean("Deprecated upstream option to include full article content. Defaults to false."),
      },
      {
        optional: ["includeEntities", "includeContent"],
      },
    ),
    outputSchema: s.object(
      "Finlight single article response.",
      {
        status: s.string("Upstream response status."),
        article,
      },
      {
        required: ["status", "article"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("finlight", {
    name: "list_sources",
    description: "List Finlight news sources, their languages, countries, and default inclusion status.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Options for listing available news sources.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: s.object(
      "Available Finlight news sources.",
      {
        sources: s.array(
          "Supported sources; availability can change.",
          s.object(
            "A news source.",
            {
              domain: s.string("Publisher domain."),
              isDefaultSource: s.boolean("Whether the source is included by default."),
              originCountry: s.string("Publisher country code; may be empty."),
              languages: s.stringArray("Publisher languages, primary language first.", {
                itemDescription: "An ISO 639-1 language code.",
              }),
              isCustomSource: s.boolean("Whether this is a custom source enabled for the subscription."),
              isContentAvailable: s.boolean("Deprecated indication of full content availability on eligible plans."),
            },
            {
              required: ["domain", "isDefaultSource", "originCountry", "languages"],
              additionalProperties: true,
            },
          ),
        ),
      },
      {
        optional: [],
      },
    ),
  }),
];
