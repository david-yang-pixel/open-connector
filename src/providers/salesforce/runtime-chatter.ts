import type { SalesforceContext, SalesforceHandler } from "./context.ts";

import { recordOrEmpty } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { chatterFeedRoutes } from "./chatter-routes.ts";
import { queryPath, segment } from "./context.ts";
function chatterBase(d: Record<string, unknown>, c: SalesforceContext) {
  return c.base + (d.communityId === undefined ? "" : `/connect/communities/${segment(d.communityId)}`);
}
function elementPath(d: Record<string, unknown>, c: SalesforceContext) {
  return `${chatterBase(d, c)}/chatter/feed-elements/${segment(d.feedElementId)}`;
}
export const salesforceChatterHandlers: Record<string, SalesforceHandler> = {
  async list_chatter_feed_elements(d, c) {
    const route = chatterFeedRoutes[d.feedType as keyof typeof chatterFeedRoutes];
    if (route.communityRequired && d.communityId === undefined)
      throw providerInputError("communityId is required for this feed");
    let path: string = route.path;
    for (const name of ["userId", "recordId", "topicId", "streamId", "favoriteId", "keyPrefix"]) {
      const inputName = ["favoriteId", "keyPrefix"].includes(name) ? name : "subjectId";
      if (path.includes(`{${name}}`)) {
        if (d[inputName] === undefined) throw providerInputError(`${inputName} is required for ${d.feedType}`);
        path = path.replace(`{${name}}`, segment(d[inputName]));
      }
    }
    if (!route.path.includes("{") && d.subjectId !== undefined)
      throw providerInputError("This feed does not accept subjectId");
    if (d.favoriteId !== undefined && d.feedType !== "favorites")
      throw providerInputError("favoriteId requires favorites feed");
    if (d.keyPrefix !== undefined && d.feedType !== "filter")
      throw providerInputError("keyPrefix requires filter feed");
    const {
      apiVersion: _version,
      feedType: _type,
      subjectId: _subject,
      communityId: _community,
      favoriteId: _favorite,
      keyPrefix: _prefix,
      ...params
    } = d;
    for (const name of Object.keys(params))
      if (!(route.parameters as readonly string[]).includes(name))
        throw providerInputError(`${name} is not supported by ${d.feedType} feed`);
    return c.object(queryPath(chatterBase(d, c) + path, params));
  },
  async get_chatter_feed_element(d, c) {
    return {
      element: await c.object(
        queryPath(elementPath(d, c), {
          commentSort: d.commentSort,
          elementsPerBundle: d.elementsPerBundle,
          recentCommentCount: d.recentCommentCount,
          threadedCommentsCollapsed: d.threadedCommentsCollapsed,
        }),
      ),
    };
  },
  async list_chatter_comments(d, c) {
    return c.object(
      queryPath(`${elementPath(d, c)}/capabilities/comments/items`, {
        page: d.page,
        pageSize: d.pageSize,
        sort: d.sort,
        threadedCommentsCollapsed: d.threadedCommentsCollapsed,
      }),
    );
  },
  async create_chatter_comment(d, c) {
    return {
      comment: await c.object(`${elementPath(d, c)}/capabilities/comments/items`, "POST", {
        body: d.body,
        capabilities: d.capabilities,
        threadParentId: d.threadParentId,
      }),
    };
  },
  async create_chatter_feed_element(d, c) {
    const capabilities = recordOrEmpty(d.capabilities);
    if (d.body === undefined && !capabilities.files && !capabilities.link && !capabilities.feedEntityShare)
      throw providerInputError("Provide body or a file, link or feed sharing capability");
    return {
      element: await c.object(`${chatterBase(d, c)}/chatter/feed-elements`, "POST", {
        feedElementType: "FeedItem",
        subjectId: d.subjectId,
        body: d.body,
        capabilities: d.capabilities,
        visibility: d.visibility,
      }),
    };
  },
};
