import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "baixiao";

const dynamicToolOutputSchema = s.looseObject("The normalized structured result returned by the Baixiao MCP tool.");

const languageSchema = s.stringEnum("The result language, or omit it for automatic detection.", ["zh", "en"]);

const sourceSchema = s.stringEnum("A geographic research-funding data source.", ["cn", "nih", "nsf", "hk", "eu"]);

const collectionIdsSchema = s.array(
  "Baixiao collection IDs used to restrict the search.",
  s.string("A Baixiao collection ID."),
);

const keywordListSchema = s.array("Topic keywords used to rank relevant records.", s.string("A topic keyword."));

const referenceSchema = s.looseObject("A reference to verify against Baixiao's databases.", {
  title: s.optional(s.string("The work title, recommended when no DOI is available.")),
  year: s.optional(s.integer("The publication year.")),
  journal: s.optional(s.string("The journal or publication venue.")),
  doi: s.optional(s.string("The DOI, with or without the DOI prefix.")),
  authors: s.optional(s.array("The known authors.", s.string("An author name."))),
  language: s.optional(languageSchema),
  is_book: s.optional(s.boolean("Whether the reference is a book.")),
});

const toolAnnotationsSchema = s.looseObject("MCP behavior hints supplied by Baixiao for the tool.", {
  title: s.optional(s.string("A human-readable title for the tool.")),
  readOnlyHint: s.optional(s.boolean("Whether the tool is expected not to modify data.")),
  destructiveHint: s.optional(s.boolean("Whether the tool may perform destructive operations.")),
  idempotentHint: s.optional(
    s.boolean("Whether repeated calls with the same arguments are expected to be idempotent."),
  ),
  openWorldHint: s.optional(s.boolean("Whether the tool may interact with entities outside Baixiao.")),
});

const mcpToolSummarySchema = s.object(
  "A tool currently exposed by the connected Baixiao MCP service.",
  {
    name: s.nonEmptyString("The exact Baixiao MCP tool name to pass to call_tool."),
    description: s.string("The current tool description supplied by Baixiao MCP."),
    annotations: toolAnnotationsSchema,
    inputSchema: s.looseObject("The current JSON Schema for the tool arguments, supplied by Baixiao MCP."),
  },
  { optional: ["description", "annotations"] },
);

export const baixiaoActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "corpus_search",
    operationType: "read",
    description:
      "Search Baixiao's curated humanities and social-science corpus, especially for Chinese-language scholarship and Chinese authors.",
    followUpActions: ["baixiao.get_pdf", "baixiao.citation_graph"],
    inputSchema: s.object(
      "A query and optional Baixiao corpus filters.",
      {
        query: s.string("The literature or research question to search for."),
        collection_ids: collectionIdsSchema,
        page_size: s.integer("The maximum number of documents to return. Defaults to 15.", {
          default: 15,
        }),
      },
      { optional: ["collection_ids", "page_size"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "get_pdf",
    operationType: "read",
    description:
      "Get a short-lived PDF download link for an available document in Baixiao's public corpus; a successful lookup consumes the connected account's credits.",
    inputSchema: s.object("A Baixiao corpus document to download.", {
      identifier: s.string("The external_id returned by a Baixiao corpus or advanced search result."),
    }),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "external_search",
    operationType: "read",
    description: "Search Baixiao's international academic coverage for English-language papers and citable metadata.",
    followUpActions: ["baixiao.citation_graph"],
    inputSchema: s.object(
      "A query, result limit, and optional publication-year range.",
      {
        query: s.string("The international literature query."),
        limit: s.integer("The maximum number of papers to return. Defaults to 15.", {
          default: 15,
        }),
        from_year: s.integer("The earliest publication year to include."),
        to_year: s.integer("The latest publication year to include."),
      },
      { optional: ["limit", "from_year", "to_year"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "citation_graph",
    operationType: "read",
    description:
      "Traverse the works that cite a paper or the references cited by that paper for literature-review expansion.",
    inputSchema: s.object(
      "A paper identifier and citation-graph direction.",
      {
        paper_id: s.string("A DOI or the external_id returned by a previous Baixiao search."),
        direction: s.withDefault(
          s.stringEnum("The citation-graph direction. Defaults to cited_by.", ["cited_by", "references"]),
          "cited_by",
        ),
        limit: s.integer("The maximum number of related works to return. Defaults to 20.", {
          default: 20,
        }),
      },
      { optional: ["direction", "limit"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "verify_reference",
    operationType: "read",
    description:
      "Look up one reference across Baixiao's databases and report its match status, best candidate, confidence, and metadata warnings.",
    inputSchema: s.object(
      "Known metadata for one reference.",
      {
        title: s.string("The title of the work to verify."),
        year: s.integer("The expected publication year."),
        journal: s.string("The expected journal or publication venue."),
        doi: s.string("The expected DOI, with or without the DOI prefix."),
        authors: s.array("The expected authors.", s.string("An expected author name.")),
        language: languageSchema,
        is_book: s.boolean({ description: "Whether the reference is a book.", default: false }),
      },
      { optional: ["year", "journal", "doi", "authors", "language", "is_book"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "fetch_metadata",
    operationType: "read",
    description: "Complete a partial or messy citation into clean publication metadata and return alternate matches.",
    inputSchema: s.object(
      "A partial citation and optional disambiguation settings.",
      {
        query: s.string("The partial citation, rough title, or author-year-title text."),
        year: s.integer("The publication year used to disambiguate matches."),
        top: s.integer("The maximum number of candidate matches to return. Defaults to 5.", {
          default: 5,
        }),
      },
      { optional: ["year", "top"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "journal_fit",
    operationType: "read",
    description:
      "Recommend publication venues for a manuscript by ranking journals with topic-matching works in Baixiao's databases.",
    inputSchema: s.object(
      "Manuscript keywords and ranking options.",
      {
        keywords: keywordListSchema,
        language: languageSchema,
        top: s.integer("The maximum number of journals to return. Defaults to 10.", {
          default: 10,
        }),
        rounds: s.integer("The number of deterministic keyword-expansion rounds. Defaults to 2.", {
          default: 2,
        }),
      },
      { optional: ["language", "top", "rounds"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "find_reviewers",
    operationType: "read",
    description:
      "Suggest potential peer reviewers by ranking authors of topic-matching works while excluding manuscript authors when requested.",
    inputSchema: s.object(
      "Manuscript keywords, optional author exclusions, and ranking options.",
      {
        keywords: keywordListSchema,
        language: s.string("The result language filter."),
        exclude_authors: s.array(
          "Manuscript authors to exclude from reviewer suggestions.",
          s.string("An author name to exclude."),
        ),
        top: s.integer("The maximum number of reviewers to return. Defaults to 15.", {
          default: 15,
        }),
        rounds: s.integer("The number of deterministic keyword-expansion rounds. Defaults to 2.", {
          default: 2,
        }),
      },
      { optional: ["language", "exclude_authors", "top", "rounds"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "advanced_search",
    operationType: "read",
    description:
      "Search across Baixiao's databases by title, author, journal, publisher, publication period, document type, and language.",
    followUpActions: ["baixiao.get_pdf"],
    inputSchema: s.object(
      "Optional fields combined to narrow an academic search.",
      {
        title: s.string("A fuzzy title query."),
        author: s.string("An exact author name, matched case-insensitively where supported."),
        journal: s.string("An exact journal name, matched case-insensitively where supported."),
        publisher: s.string("An exact publisher name, matched case-insensitively where supported."),
        year: s.integer("One publication year to match."),
        year_from: s.integer("The earliest publication year to include."),
        year_to: s.integer("The latest publication year to include."),
        doc_type: s.string("The document type to include."),
        language: s.string("The result language filter."),
        limit: s.integer("The maximum number of works to return. Defaults to 20.", {
          default: 20,
        }),
      },
      {
        optional: [
          "title",
          "author",
          "journal",
          "publisher",
          "year",
          "year_from",
          "year_to",
          "doc_type",
          "language",
          "limit",
        ],
      },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "verify_references",
    operationType: "read",
    description:
      "Batch-check a bibliography across Baixiao's databases and return per-reference match results with aggregate counts.",
    inputSchema: s.object(
      "A bibliography and optional concurrency limit.",
      {
        references: s.array("References to verify.", referenceSchema),
        max_concurrency: s.integer("The maximum number of parallel lookups performed by Baixiao. Defaults to 8.", {
          default: 8,
        }),
      },
      { optional: ["max_concurrency"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "fetch_metadata_batch",
    operationType: "read",
    description: "Complete multiple partial references into clean publication metadata in one request.",
    inputSchema: s.object(
      "Partial references and an optional concurrency limit.",
      {
        queries: s.array(
          "Partial references to resolve.",
          s.string("A partial citation, rough title, or author-year-title string."),
        ),
        max_concurrency: s.integer("The maximum number of parallel lookups performed by Baixiao. Defaults to 8.", {
          default: 8,
        }),
      },
      { optional: ["max_concurrency"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "my_kb_search",
    operationType: "read",
    description: "Search the connected user's personal, team, teaching, and subscribed Baixiao knowledge bases.",
    inputSchema: s.object(
      "A query and optional personal knowledge-base filters.",
      {
        query: s.string("The query to search across the connected user's knowledge bases."),
        collection_ids: collectionIdsSchema,
        limit: s.integer("The maximum number of results to return. Defaults to 15.", {
          default: 15,
        }),
      },
      { optional: ["collection_ids", "limit"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "list_my_kbs",
    operationType: "read",
    description:
      "List the connected user's available Baixiao knowledge bases and their collection IDs for later searches.",
    followUpActions: ["baixiao.my_kb_search"],
    inputSchema: s.object("No input is required.", {}),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "policy_search",
    operationType: "read",
    description:
      "Search Baixiao's central and local Chinese government policy collection by text, issuer, author, period, or document type.",
    inputSchema: s.object(
      "Optional filters for Chinese government policy documents.",
      {
        query: s.string("A free-text policy topic or phrase."),
        author: s.string("The document author."),
        issuer: s.string("The issuing government body."),
        year: s.integer("One publication year to match."),
        year_from: s.integer("The earliest publication year to include."),
        year_to: s.integer("The latest publication year to include."),
        doc_type: s.string("The policy document type to include."),
        limit: s.integer("The maximum number of policies to return. Defaults to 15.", {
          default: 15,
        }),
      },
      {
        optional: ["query", "author", "issuer", "year", "year_from", "year_to", "doc_type", "limit"],
      },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "xi_thought_search",
    operationType: "read",
    description:
      "Search Baixiao's New Thought collection of key theoretical and ideological texts by topic, author, period, or document type.",
    inputSchema: s.object(
      "Optional filters for theoretical and ideological texts.",
      {
        query: s.string("A free-text topic or phrase."),
        author: s.string("The document author."),
        year: s.integer("One publication year to match."),
        year_from: s.integer("The earliest publication year to include."),
        year_to: s.integer("The latest publication year to include."),
        doc_type: s.string("The document type to include."),
        limit: s.integer("The maximum number of texts to return. Defaults to 15.", {
          default: 15,
        }),
      },
      {
        optional: ["query", "author", "year", "year_from", "year_to", "doc_type", "limit"],
      },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "hk_grants_search",
    operationType: "read",
    description: "Search Baixiao's Hong Kong RGC funded-project collection by free text and award period.",
    inputSchema: s.object(
      "Optional filters for Hong Kong research grants.",
      {
        query: s.string("A short free-text query for a topic, principal investigator, institution, or funding scheme."),
        year: s.integer("One award year to match."),
        year_from: s.integer("The earliest award year to include."),
        year_to: s.integer("The latest award year to include."),
        limit: s.integer("The maximum number of projects to return, up to 50. Defaults to 5.", {
          maximum: 50,
          default: 5,
        }),
      },
      { optional: ["query", "year", "year_from", "year_to", "limit"] },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "grants_cfp_search",
    operationType: "read",
    description:
      "Search Baixiao's research funding calls by topic, geography, funder, status, deadline, year, and minimum award amount.",
    inputSchema: s.object(
      "Optional filters for research funding calls.",
      {
        query: s.string("Topic terms without generic funding or application words."),
        region: s.string("A mainland China province or national for nationwide calls."),
        funder: s.string("A funding-body name or Baixiao funder ID."),
        status: s.stringEnum("The application status to include.", ["open", "closed", "unknown"]),
        deadline_from: s.string("The earliest application deadline in YYYY-MM-DD format.", {
          format: "date",
        }),
        deadline_to: s.string("The latest application deadline in YYYY-MM-DD format.", {
          format: "date",
        }),
        year_from: s.integer("The earliest notice publication year to include."),
        year_to: s.integer("The latest notice publication year to include."),
        amount_min: s.number("The minimum parsed single-project award amount in yuan."),
        sources: s.array("The geographic data sources to search.", sourceSchema),
        limit: s.integer("The maximum number of calls to return. Defaults to 10.", {
          default: 10,
        }),
      },
      {
        optional: [
          "query",
          "region",
          "funder",
          "status",
          "deadline_from",
          "deadline_to",
          "year_from",
          "year_to",
          "amount_min",
          "sources",
          "limit",
        ],
      },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "grants_award_search",
    operationType: "read",
    description:
      "Search Baixiao's awarded research projects by topic, investigator, institution, geography, funder, program, discipline, outcome, or year.",
    inputSchema: s.object(
      "Optional filters for awarded research projects.",
      {
        query: s.string("Topic terms found in project titles or descriptions."),
        person: s.string("The principal investigator or project leader."),
        institution: s.string("The host or investigator institution."),
        region: s.string("A mainland China region associated with the investigator."),
        funder: s.string("A funding-body name or Baixiao funder ID."),
        program: s.string("The funding program or project category."),
        discipline: s.string("The academic discipline."),
        outcome_grade: s.string("The completion or outcome grade."),
        year_from: s.integer("The earliest award year to include."),
        year_to: s.integer("The latest award year to include."),
        sources: s.array("The geographic data sources to search.", sourceSchema),
        limit: s.integer("The maximum number of project records to return. Defaults to 10.", {
          default: 10,
        }),
      },
      {
        optional: [
          "query",
          "person",
          "institution",
          "region",
          "funder",
          "program",
          "discipline",
          "outcome_grade",
          "year_from",
          "year_to",
          "sources",
          "limit",
        ],
      },
    ),
    outputSchema: dynamicToolOutputSchema,
  }),
  defineProviderAction(service, {
    name: "list_tools",
    operationType: "read",
    description:
      "Discover the current Baixiao literature, knowledge-base, policy, and research-funding MCP tools with their live input schemas and behavior annotations.",
    followUpActions: ["baixiao.call_tool"],
    inputSchema: s.object("No input is required.", {}),
    outputSchema: s.object("The current Baixiao MCP tool catalog.", {
      tools: s.array("Tools currently exposed by the Baixiao MCP service.", mcpToolSummarySchema),
    }),
  }),
  defineProviderAction(service, {
    name: "call_tool",
    operationType: "write",
    description:
      "Call a current Baixiao MCP tool with JSON arguments after inspecting its live schema and behavior annotations with list_tools.",
    followUpActions: ["baixiao.list_tools"],
    inputSchema: s.object(
      "Input for invoking one current Baixiao MCP tool.",
      {
        toolName: s.nonEmptyString("The exact tool name returned by list_tools."),
        arguments: s.looseObject("JSON arguments matching the inputSchema returned for the selected tool."),
      },
      { optional: ["arguments"] },
    ),
    outputSchema: s.object("The normalized result returned by the Baixiao MCP tool.", {
      result: s.unknown(
        "The tool result. Structured MCP content is returned directly; otherwise the MCP content envelope is preserved.",
      ),
    }),
  }),
];
