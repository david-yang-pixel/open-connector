import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { chatterFeedRoutes } from "./chatter-routes.ts";
import { apiVersion } from "./schemas.ts";
import { recordId } from "./schemas.ts";
const communityId = s.string("Experience Cloud community ID; omit for the internal organization.", {
  minLength: 1,
});
const feedElementId = { ...recordId, description: "Chatter feed element ID." };
const page = s.string("Opaque page token from the corresponding nextPageUrl query parameter; do not use query_more.");
const pageSize = s.integer("Number of items per page.", { minimum: 1, maximum: 100 });
const commentSort = s.stringEnum("Comment order; descending order is not supported.", [
  "CreatedDateLatestAsc",
  "CreatedDateOldestAsc",
  "Relevance",
]);
const threadedCommentsCollapsed = s.boolean("Return threaded comments collapsed when true; defaults to false.");
const elementsPerBundle = s.integer("Maximum feed elements per bundle.", {
  minimum: 0,
  maximum: 10,
});
const recentCommentCount = s.integer(
  "Number of preview comments per feed element; use list_chatter_comments for full pagination.",
  { minimum: 0, maximum: 25 },
);
const body = s.object(
  "Structured Chatter message body.",
  {
    messageSegments: s.array(
      "Ordered message segments; retain mentions and rich text structure.",
      s.object(
        "Message segment with type-specific fields such as text, id, url, markupType or fileId.",
        {
          type: s.stringEnum("Input message segment type.", [
            "Text",
            "Mention",
            "Hashtag",
            "Link",
            "MarkupBegin",
            "MarkupEnd",
            "InlineImage",
            "EntityLink",
          ]),
          text: s.string("Text or hashtag content."),
          id: s.string("Mentioned or linked Salesforce entity ID."),
          url: s.string("Link URL."),
          markupType: s.string("Rich text markup type supported by Salesforce."),
          fileId: s.string("Previously uploaded ContentDocument image ID (069 prefix)."),
        },
        {
          required: ["type"],
          additionalProperties: true,
        },
      ),
      { minItems: 1 },
    ),
  },
  {
    optional: [],
  },
);
const capabilities = s.looseObject(
  "Native feed element capabilities, including files.items with ContentDocument IDs, link, poll, topics, bookmarks, associatedActions, canvas, directMessage, extensions, feedEntityShare, questionAndAnswers and status. Upload files with upload_file first.",
);
const element = s.looseObject("Full feed element including structured body and capabilities.");
const comment = s.looseObject("Full comment including body, capabilities and threading metadata.");
export const salesforceChatterActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "list_chatter_feed_elements",
    description:
      "Read a Chatter feed with native pagination, search and filters. Feed types support different query options; unsupported combinations are rejected. Embedded comments are previews only.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        communityId,
        feedType: s.stringEnum("Native feed type.", Object.keys(chatterFeedRoutes)),
        subjectId: s.string("User, record, topic or stream ID required by the feed type; user feeds also accept me.", {
          minLength: 1,
        }),
        favoriteId: s.string("Favorite ID, required for favorites feeds.", { minLength: 1 }),
        keyPrefix: s.string("Object key prefix, required for filter feeds.", { minLength: 1 }),
        page,
        pageSize,
        elementsPerBundle,
        recentCommentCount,
        threadedCommentsCollapsed,
        density: s.stringEnum("Feed update density.", ["AllUpdates", "FewerUpdates"]),
        q: s.string("Search keywords for feed bodies and comments; at least two non-wildcard characters."),
        filter: s.string("Native filter supported by the selected feed, such as UnansweredQuestions or AuthoredBy."),
        customFilter: s.string("Custom record feed filter ID."),
        showInternalOnly: s.boolean("Show only internal items in a record feed."),
        sort: s.stringEnum("Feed order; availability depends on feed type and filter.", [
          "CreatedDateAsc",
          "CreatedDateDesc",
          "LastModifiedDateDesc",
          "MostViewed",
          "Relevance",
        ]),
        updatedSince: s.string("Opaque updatesToken from a previous feed page; do not construct it."),
      },
      {
        optional: [
          "apiVersion",
          "communityId",
          "subjectId",
          "favoriteId",
          "keyPrefix",
          "page",
          "pageSize",
          "elementsPerBundle",
          "recentCommentCount",
          "threadedCommentsCollapsed",
          "density",
          "q",
          "filter",
          "customFilter",
          "showInternalOnly",
          "sort",
          "updatedSince",
        ],
      },
    ),
    outputSchema: s.object(
      "Feed element page and native pagination metadata.",
      {
        elements: s.array("Feed elements in this page.", element),
        nextPageUrl: s.nullable(s.string("URL containing the next page token.")),
        updatesToken: s.string("Opaque token for subsequent updates."),
      },
      {
        required: ["elements"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "get_chatter_feed_element",
    description: "Get a complete Chatter feed element, preserving capabilities and structured message content.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        communityId,
        feedElementId,
        commentSort,
        elementsPerBundle,
        recentCommentCount,
        threadedCommentsCollapsed,
      },
      {
        optional: [
          "apiVersion",
          "communityId",
          "commentSort",
          "elementsPerBundle",
          "recentCommentCount",
          "threadedCommentsCollapsed",
        ],
      },
    ),
    outputSchema: s.object(
      "Chatter feed element result.",
      { element },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "list_chatter_comments",
    description:
      "Read a full page of Chatter comments for a feed element; continue with the page token in nextPageUrl.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        communityId,
        feedElementId,
        page,
        pageSize,
        sort: commentSort,
        threadedCommentsCollapsed,
      },
      { optional: ["apiVersion", "communityId", "page", "pageSize", "sort", "threadedCommentsCollapsed"] },
    ),
    outputSchema: s.object(
      "Comment page and native pagination metadata.",
      {
        items: s.array("Comments in this page.", comment),
        nextPageUrl: s.nullable(s.string("URL containing the next comment page token.")),
      },
      {
        required: ["items"],
        additionalProperties: true,
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "create_chatter_comment",
    description:
      "Reply to a Chatter feed element with structured message segments and optional file, article or shared-feed capabilities.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        communityId,
        feedElementId,
        body,
        capabilities: s.looseObject(
          "Comment capabilities: content.contentDocumentId for an existing Salesforce file, record.recordId for a Knowledge article, or feedEntityShare.feedEntityId for a shared feed entity. Upload new files with upload_file first.",
        ),
        threadParentId: s.string("Parent comment ID when creating a threaded reply."),
      },
      { optional: ["apiVersion", "communityId", "capabilities", "threadParentId"] },
    ),
    outputSchema: s.object(
      "Created Chatter comment.",
      { comment },
      {
        optional: [],
      },
    ),
  }),
  defineProviderAction("salesforce", {
    name: "create_chatter_feed_element",
    description:
      "Post a structured Chatter feed item to an explicitly chosen user, group or record. Supports native capabilities and previously uploaded files.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.object(
      "Salesforce action input.",
      {
        apiVersion,
        communityId,
        subjectId: s.string("Target user, group or record ID, or me for the current user.", {
          minLength: 1,
        }),
        body,
        capabilities,
        visibility: s.stringEnum(
          "Post visibility; omit to use Salesforce defaults. User, group and direct-message parents require AllUsers.",
          ["AllUsers", "InternalUsers"],
        ),
      },
      { optional: ["apiVersion", "communityId", "body", "capabilities", "visibility"] },
    ),
    outputSchema: s.object(
      "Created Chatter feed element.",
      { element },
      {
        optional: [],
      },
    ),
  }),
];
