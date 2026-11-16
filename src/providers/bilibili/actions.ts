import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { bilibiliProviderScopes } from "./scopes.ts";

const service = "bilibili";

const emptyInputSchema = s.object("The input payload for this action.", {});

const resourceIdField = {
  resourceId: s.nonEmptyString("The archive id (BV id) returned by bilibili.upload_video, for example BV17B4y1s7R1."),
};

const archiveSchema = s.object(
  "A Bilibili video archive.",
  {
    resourceId: s.string("The archive id (BV id)."),
    title: s.string("Archive title."),
    cover: s.string("Cover image URL hosted by Bilibili."),
    tid: s.integer("Partition (二级分区) id of the archive."),
    tag: s.string("Comma-separated archive tags."),
    desc: s.string("Archive description."),
    copyright: s.integer("1 for original content, 2 for reposted content."),
    noReprint: s.integer("1 when reposting is forbidden, 0 otherwise."),
    state: s.integer("Review state; 0 means the archive is public."),
    stateDesc: s.string("Human-readable review state, for example 开放浏览."),
    rejectReason: s.string("Review rejection reason, empty when the archive passed."),
    ctime: s.integer("Creation time as a UTC Unix timestamp."),
    ptime: s.integer("Publication time as a UTC Unix timestamp."),
    video: s.object(
      "Video playback information, present once the archive is public.",
      {
        cid: s.integer("Video cid."),
        filename: s.string("Uploaded video filename."),
        duration: s.integer("Video duration in seconds."),
        shareUrl: s.string("Public playback page URL."),
        iframeUrl: s.string("Embeddable iframe player URL."),
      },
      { optional: ["cid", "filename", "duration", "shareUrl", "iframeUrl"] },
    ),
  },
  {
    optional: [
      "resourceId",
      "title",
      "cover",
      "tid",
      "tag",
      "desc",
      "copyright",
      "noReprint",
      "state",
      "stateDesc",
      "rejectReason",
      "ctime",
      "ptime",
      "video",
    ],
  },
);

const archiveStatOutputSchema: JsonSchema = s.object(
  "Engagement counters of one video archive.",
  {
    title: s.string("Archive title."),
    ptime: s.integer("Publication time as a UTC Unix timestamp."),
    view: s.integer("Play count."),
    danmaku: s.integer("Danmaku (bullet comment) count."),
    reply: s.integer("Comment count."),
    favorite: s.integer("Favorite count."),
    coin: s.integer("Coin count."),
    share: s.integer("Share count."),
    like: s.integer("Like count."),
  },
  { optional: ["title", "ptime", "view", "danmaku", "reply", "favorite", "coin", "share", "like"] },
);

const articleStatsSchema: JsonSchema = s.object(
  "Article engagement counters.",
  {
    view: s.integer("Read count."),
    favorite: s.integer("Favorite count."),
    like: s.integer("Like count."),
    dislike: s.integer("Dislike count."),
    reply: s.integer("Comment count."),
    share: s.integer("Share count."),
    coin: s.integer("Coin count."),
  },
  { optional: ["view", "favorite", "like", "dislike", "reply", "share", "coin"] },
);

const articleSchema: JsonSchema = s.object(
  "A Bilibili article.",
  {
    articleId: s.integer("Article id."),
    title: s.string("Article title."),
    summary: s.string("Article summary."),
    content: s.string("Article body HTML. Only present in bilibili.get_article."),
    bannerUrl: s.string("Top banner image URL."),
    templateId: s.integer("Cover template id."),
    state: s.integer("Review state; 0 means the article is public."),
    reason: s.string("Review rejection reason, empty when the article passed."),
    imageUrls: s.array(s.string({}), { description: "Cover image URLs." }),
    publishTime: s.integer("Publication time as a UTC Unix timestamp."),
    ctime: s.integer("Creation time as a UTC Unix timestamp."),
    words: s.integer("Word count."),
    original: s.integer("1 for original content, 0 otherwise."),
    topVideoBvid: s.string("BV id of the header video."),
    type: s.integer("Editor type: 0 legacy editor, 1 note, 2 new editor."),
    category: s.object(
      "Article category.",
      {
        id: s.integer("Category id."),
        parentId: s.integer("Parent category id."),
        name: s.string("Category name."),
      },
      { optional: ["id", "parentId", "name"] },
    ),
    stats: articleStatsSchema,
    tags: s.array(
      s.object("A tag.", { tid: s.integer("Tag id."), name: s.string("Tag name.") }, { optional: ["tid", "name"] }),
      { description: "Article tags." },
    ),
    anthology: s.object(
      "The anthology this article belongs to.",
      { anthologyId: s.integer("Anthology id."), name: s.string("Anthology name.") },
      { optional: ["anthologyId", "name"] },
    ),
  },
  {
    optional: [
      "articleId",
      "title",
      "summary",
      "content",
      "bannerUrl",
      "templateId",
      "state",
      "reason",
      "imageUrls",
      "publishTime",
      "ctime",
      "words",
      "original",
      "topVideoBvid",
      "type",
      "category",
      "stats",
      "tags",
      "anthology",
    ],
  },
);

const anthologySchema: JsonSchema = s.object(
  "A Bilibili anthology (文集).",
  {
    anthologyId: s.integer("Anthology id."),
    name: s.string("Anthology name."),
    imageUrl: s.string("Anthology cover image URL."),
    summary: s.string("Anthology summary."),
    words: s.integer("Total word count of the articles in the anthology."),
    read: s.integer("Total read count of the articles in the anthology."),
    state: s.integer("Review state; 1 means approved."),
    reason: s.string("Review rejection reason, empty when approved."),
    total: s.integer("Number of articles in the anthology."),
    ctime: s.integer("Creation time as a UTC Unix timestamp."),
    publishTime: s.integer("Publication time as a UTC Unix timestamp."),
    updateTime: s.integer("Last modification time as a UTC Unix timestamp."),
    applyTime: s.string("Submission time as an ISO 8601 string."),
    checkTime: s.string("Review time as an ISO 8601 string."),
  },
  {
    optional: [
      "anthologyId",
      "name",
      "imageUrl",
      "summary",
      "words",
      "read",
      "state",
      "reason",
      "total",
      "ctime",
      "publishTime",
      "updateTime",
      "applyTime",
      "checkTime",
    ],
  },
);

const articleRequiredFields = {
  title: s.nonEmptyString("Article title; keep it within 40 characters.", { maxLength: 40 }),
  categoryId: s.integer("Second-level article category id from bilibili.list_article_categories."),
  templateId: s.integer({
    minimum: 3,
    maximum: 5,
    description:
      "Cover template: 3 = three cover images; 4 = single or no cover image with bannerUrl or topVideoBvid set; 5 = no image at all, Bilibili generates a default cover.",
  }),
  summary: s.nonEmptyString("Article summary."),
  content: s.nonEmptyString(
    'Article body HTML (200-40000 characters, or at least three images). Embed images with the <figure class="img-box"> template using URLs from bilibili.upload_article_image, and cards from bilibili.get_article_card_snippet.',
  ),
};

const articleOptionalFields = {
  bannerUrl: s.optional(
    s.url("Top banner image URL from bilibili.upload_article_image; mutually exclusive with topVideoBvid."),
  ),
  original: s.optional(s.boolean("Mark the article as original content.")),
  imageUrls: s.optional(
    s.array(s.url("A cover image URL from bilibili.upload_article_image."), {
      description: "Cover image URLs. Three images are required when templateId is 3.",
    }),
  ),
  tags: s.optional(s.string("Comma-separated custom tags.")),
  anthologyId: s.optional(s.positiveInteger("Anthology (文集) id to file the article under.")),
  upClosedReply: s.optional(s.boolean("Close the comment section when true.")),
  topVideoBvid: s.optional(s.string("BV id of the header video; mutually exclusive with bannerUrl.")),
};

const anthologyIdField = {
  anthologyId: s.positiveInteger("Anthology (文集) id."),
};

const articleIdsField = {
  articleIds: s.array(s.positiveInteger("An article id."), {
    minItems: 1,
    description: "Article ids.",
  }),
};

function pageSchema(entryNoun: string): JsonSchema {
  return s.object(
    "Pagination information.",
    {
      pn: s.integer("Current page number."),
      ps: s.integer("Page size."),
      total: s.integer(`Total ${entryNoun} count.`),
    },
    { optional: ["pn", "ps", "total"] },
  );
}

function deletionResultSchema(idField: Record<string, JsonSchema>): JsonSchema {
  return s.actionOutput(
    { ...idField, deleted: s.boolean("Always true when the deletion succeeded.") },
    "Deletion result.",
  );
}

export const bilibiliActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_user_info",
    operationType: "read",
    description: "Get the authorized Bilibili user's public profile (nickname, avatar, openid).",
    requiredScopes: [bilibiliProviderScopes.userInfo],
    providerPermissions: [bilibiliProviderScopes.userInfo],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "The authorized user's public profile.",
      {
        name: s.string("User nickname."),
        face: s.string("Avatar image URL. Cache it yourself before serving it to end users."),
        openid: s.string("The user's openid, unique per Bilibili application."),
      },
      { optional: ["name", "face", "openid"] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_user_scopes",
    operationType: "read",
    description:
      "List the Bilibili interface permission points (scopes) the authorized user actually granted to this application.",
    requiredScopes: [bilibiliProviderScopes.userInfo],
    providerPermissions: [bilibiliProviderScopes.userInfo],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "The user's granted scope list.",
      {
        openid: s.string("The user's openid, unique per Bilibili application."),
        scopes: s.array(s.string({}), { description: "Granted permission points, for example ARC_BASE." }),
      },
      { optional: ["openid"] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_user_union_id",
    operationType: "read",
    description:
      "Get the authorized user's union_id, which is stable across all applications of the same developer. Bilibili must enable this endpoint for your application separately.",
    requiredScopes: [bilibiliProviderScopes.userInfo],
    providerPermissions: [bilibiliProviderScopes.userInfo],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "The union_id of the authorized user.",
      { unionId: s.string("The user's union_id within this developer.") },
      { optional: ["unionId"] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_user_stat",
    operationType: "read",
    description: "Get account-level counters of the authorized user: followers, followings, and passed video archives.",
    requiredScopes: [bilibiliProviderScopes.userData],
    providerPermissions: [bilibiliProviderScopes.userData],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "Account-level counters.",
      {
        following: s.integer("Number of accounts the user follows."),
        follower: s.integer("Follower count."),
        arcPassedTotal: s.integer("Number of video archives that passed review."),
      },
      { optional: ["following", "follower", "arcPassedTotal"] },
    ),
  }),
  defineProviderAction(service, {
    name: "list_archive_types",
    operationType: "read",
    description:
      "List Bilibili video partitions (分区). Pick a second-level partition id as the tid of bilibili.upload_video; refresh it periodically because partitions change over time.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: emptyInputSchema,
    outputSchema: s.actionOutput(
      {
        types: s.array(
          s.unknownObject("A partition node with id, parent, name, description, and nested second-level children."),
          { description: "Top-level partitions with their second-level children." },
        ),
      },
      "The partition tree.",
    ),
    followUpActions: ["bilibili.upload_video"],
  }),
  defineProviderAction(service, {
    name: "upload_video",
    operationType: "write",
    description:
      "Upload a video file to Bilibili and submit it as a new archive. Files up to 100MB use a single upload; larger files (up to 4GB) are uploaded in 10MB parts. The archive enters review after submission and becomes public once approved.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: s.object(
      {
        file: s.transitFile("The video file to upload (mp4/mov/mkv recommended, up to 4GB)."),
        title: s.nonEmptyString(
          "Archive title, shorter than 80 characters. Identical titles in a short time window are rejected.",
          {
            maxLength: 79,
          },
        ),
        tid: s.positiveInteger("Second-level partition id from bilibili.list_archive_types."),
        tag: s.nonEmptyString("Comma-separated tags; total length below 200 characters.", { maxLength: 199 }),
        copyright: s.integer({
          minimum: 1,
          maximum: 2,
          description: "1 for original content, 2 for reposted content.",
        }),
        cover: s.optional(
          s.transitFile("Optional cover image (jpeg/png, up to 5MB, at least 960x600). Uploaded before submission."),
        ),
        desc: s.optional(
          s.string({ maxLength: 249, description: "Archive description, shorter than 250 characters." }),
        ),
        source: s.optional(s.nonEmptyString("Repost source. Required when copyright is 2.")),
        noReprint: s.optional(s.boolean("Set true to forbid reposting this archive.")),
      },
      { description: "Video submission input." },
    ),
    outputSchema: s.object(
      "The submitted archive.",
      {
        resourceId: s.string("The new archive id (BV id)."),
        coverUrl: s.string("The Bilibili-hosted cover URL, present when a cover was uploaded."),
      },
      { optional: ["coverUrl"] },
    ),
    followUpActions: ["bilibili.list_archives", "bilibili.get_archive_stat"],
  }),
  defineProviderAction(service, {
    name: "list_archives",
    operationType: "read",
    description: "List the authorized user's video archives with review state, publication time, and playback links.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: s.object(
      {
        pn: s.optional(s.positiveInteger("Page number, starting at 1.")),
        ps: s.optional(s.integer({ minimum: 1, maximum: 50, description: "Page size, at most 50." })),
        status: s.optional(s.stringEnum("Filter by archive status.", ["all", "is_pubing", "pubed", "not_pubed"])),
      },
      { description: "Archive list query. Defaults to the first page of 20 entries in any status." },
    ),
    outputSchema: s.actionOutput(
      {
        archives: s.array(archiveSchema, { description: "Archives on this page." }),
        page: pageSchema("archive"),
      },
      "A page of archives.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_archive",
    operationType: "read",
    description: "Get one video archive of the authorized user, including its review state and playback links.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: s.requiredObject("Archive lookup input.", resourceIdField),
    outputSchema: archiveSchema,
    followUpActions: ["bilibili.get_archive_stat", "bilibili.edit_archive"],
  }),
  defineProviderAction(service, {
    name: "edit_archive",
    operationType: "write",
    description:
      "Edit descriptive fields of an existing archive (title, partition, cover, description, repost permission). Unchanged fields keep their current values. The video file itself cannot be replaced, and the archive is reviewed again after editing.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: s.requireAnyProperty(
      s.object(
        {
          ...resourceIdField,
          title: s.optional(s.nonEmptyString("New archive title, shorter than 80 characters.", { maxLength: 79 })),
          tid: s.optional(s.positiveInteger("New second-level partition id from bilibili.list_archive_types.")),
          coverUrl: s.optional(s.url("New cover URL. Must come from a Bilibili cover upload, not an arbitrary link.")),
          desc: s.optional(s.string({ maxLength: 249, description: "New archive description." })),
          noReprint: s.optional(s.boolean("Set true to forbid reposting, false to allow it again.")),
        },
        { description: "Archive edit input. Only provided fields change; at least one is required." },
      ),
      ["title", "tid", "coverUrl", "desc", "noReprint"],
    ),
    outputSchema: s.actionOutput({ resourceId: s.string("The edited archive id (BV id).") }, "The edited archive."),
  }),
  defineProviderAction(service, {
    name: "delete_archive",
    operationType: "destructive",
    description: "Delete one video archive of the authorized user. This cannot be undone.",
    requiredScopes: [bilibiliProviderScopes.archiveBase],
    providerPermissions: [bilibiliProviderScopes.archiveBase],
    inputSchema: s.requiredObject("Archive deletion input.", resourceIdField),
    outputSchema: deletionResultSchema({ resourceId: s.string("The deleted archive id (BV id).") }),
  }),
  defineProviderAction(service, {
    name: "get_archive_stat",
    operationType: "read",
    description:
      "Get engagement counters of one video archive: plays, danmaku, comments, favorites, coins, shares, likes.",
    requiredScopes: [bilibiliProviderScopes.archiveData],
    providerPermissions: [bilibiliProviderScopes.archiveData],
    inputSchema: s.requiredObject("Archive statistics input.", resourceIdField),
    outputSchema: archiveStatOutputSchema,
  }),
  defineProviderAction(service, {
    name: "get_archive_inc_stats",
    operationType: "read",
    description:
      "Get the authorized user's overall archive increments over the last 30 days: plays, danmaku, comments, favorites, coins, shares, likes, and charges.",
    requiredScopes: [bilibiliProviderScopes.archiveData],
    providerPermissions: [bilibiliProviderScopes.archiveData],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "Overall archive increments over the last 30 days.",
      {
        incClick: s.integer("Play count increment."),
        incDanmaku: s.integer("Danmaku count increment."),
        incReply: s.integer("Comment count increment."),
        incFavorite: s.integer("Favorite count increment."),
        incCoin: s.integer("Coin count increment."),
        incShare: s.integer("Share count increment."),
        incLike: s.integer("Like count increment."),
        incElec: s.integer("Charge (充电) count increment."),
      },
      { optional: ["incClick", "incDanmaku", "incReply", "incFavorite", "incCoin", "incShare", "incLike", "incElec"] },
    ),
  }),
  defineProviderAction(service, {
    name: "list_article_categories",
    operationType: "read",
    description:
      "List Bilibili article categories. Pick a second-level category id as the categoryId of bilibili.submit_article.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: emptyInputSchema,
    outputSchema: s.actionOutput(
      {
        categories: s.array(
          s.unknownObject("A category node with id, parent_id, name, and nested second-level children."),
          { description: "Top-level categories with their second-level children." },
        ),
      },
      "The article category tree.",
    ),
    followUpActions: ["bilibili.submit_article"],
  }),
  defineProviderAction(service, {
    name: "upload_article_image",
    operationType: "write",
    description:
      "Upload an image (jpg/png, up to 5MB) for article content, covers, or banners. The returned Bilibili-hosted URL is what article fields accept.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(
      {
        file: s.transitFile("The image file to upload (jpg/png, up to 5MB)."),
        watermark: s.optional(s.boolean("Add a watermark with the Bilibili logo and the uploader's nickname.")),
      },
      { description: "Article image upload input." },
    ),
    outputSchema: s.object(
      "The uploaded image.",
      {
        url: s.string("The Bilibili-hosted image URL."),
        size: s.integer("Image size in bytes."),
      },
      { optional: ["size"] },
    ),
    followUpActions: ["bilibili.submit_article"],
  }),
  defineProviderAction(service, {
    name: "submit_article",
    operationType: "write",
    description:
      "Submit a new Bilibili article (专栏). Image URLs in the content and covers must come from bilibili.upload_article_image. The article enters review after submission and becomes public once approved.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(
      { ...articleRequiredFields, ...articleOptionalFields },
      { description: "Article submission input." },
    ),
    outputSchema: s.actionOutput(
      { articleId: s.integer("The new article id (cv number without the prefix).") },
      "The submitted article.",
    ),
    followUpActions: ["bilibili.list_articles", "bilibili.get_article_stats"],
  }),
  defineProviderAction(service, {
    name: "edit_article",
    operationType: "write",
    description:
      "Edit an existing article. Only provided fields change; the rest keep their current values. The article is reviewed again after editing. The article detail endpoint does not return the comment-section setting, so omitting upClosedReply resets it to the provider default.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requireAnyProperty(
      s.object(
        {
          articleId: s.positiveInteger("The article id to edit."),
          title: s.optional(articleRequiredFields.title),
          categoryId: s.optional(articleRequiredFields.categoryId),
          templateId: s.optional(articleRequiredFields.templateId),
          summary: s.optional(articleRequiredFields.summary),
          content: s.optional(articleRequiredFields.content),
          ...articleOptionalFields,
        },
        { description: "Article edit input. Only provided fields change; at least one is required." },
      ),
      [
        "title",
        "categoryId",
        "templateId",
        "summary",
        "content",
        "bannerUrl",
        "original",
        "imageUrls",
        "tags",
        "anthologyId",
        "upClosedReply",
        "topVideoBvid",
      ],
    ),
    outputSchema: s.actionOutput({ articleId: s.integer("The edited article id.") }, "The edited article."),
    followUpActions: ["bilibili.get_article"],
  }),
  defineProviderAction(service, {
    name: "delete_articles",
    operationType: "destructive",
    description: "Delete one or more articles of the authorized user. This cannot be undone.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(articleIdsField, { description: "Article deletion input." }),
    outputSchema: deletionResultSchema({
      articleIds: s.array(s.integer("A deleted article id."), { description: "The deleted article ids." }),
    }),
  }),
  defineProviderAction(service, {
    name: "get_article",
    operationType: "read",
    description: "Get one article of the authorized user, including body HTML, review state, tags, and counters.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requiredObject("Article lookup input.", {
      articleId: s.positiveInteger("The article id."),
    }),
    outputSchema: articleSchema,
    followUpActions: ["bilibili.edit_article", "bilibili.get_article_stats"],
  }),
  defineProviderAction(service, {
    name: "list_articles",
    operationType: "read",
    description:
      "List the authorized user's articles with review state and counters, plus the account-level counts by review state.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(
      {
        pn: s.optional(s.positiveInteger("Page number, starting at 1.")),
        ps: s.optional(s.positiveInteger("Page size; the provider default is 10.")),
        sort: s.optional(
          s.integer({
            minimum: 1,
            maximum: 6,
            description: "Sort: 1 creation time (default), 2 likes, 3 comments, 4 reads, 5 favorites, 6 coins.",
          }),
        ),
        group: s.optional(
          s.integer({
            minimum: 0,
            maximum: 3,
            description:
              "Filter by review state: 0 all except drafts and deleted (default), 1 in review, 2 passed, 3 rejected.",
          }),
        ),
        categoryId: s.optional(s.integer("Filter by category id.")),
      },
      { description: "Article list query." },
    ),
    outputSchema: s.actionOutput(
      {
        articles: s.array(articleSchema, { description: "Articles on this page." }),
        page: pageSchema("article"),
        counts: s.object(
          "Account-level article counts by review state.",
          {
            all: s.integer("All articles."),
            audit: s.integer("In review."),
            passed: s.integer("Passed."),
            notPassed: s.integer("Rejected."),
          },
          { optional: ["all", "audit", "passed", "notPassed"] },
        ),
      },
      "A page of articles.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_article_card_snippet",
    operationType: "read",
    description:
      "Get the card HTML snippet of a video (BV id) or article (cv id) to embed into article content when submitting or editing an article.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requiredObject("Card lookup input.", {
      resourceId: s.nonEmptyString("A BV id (video) or cv id (article)."),
    }),
    outputSchema: s.object(
      "The card snippet.",
      { snippet: s.string("The card HTML snippet to embed in article content.") },
      { optional: ["snippet"] },
    ),
    followUpActions: ["bilibili.submit_article", "bilibili.edit_article"],
  }),
  defineProviderAction(service, {
    name: "create_anthology",
    operationType: "write",
    description: "Create an anthology (文集) that groups articles of the authorized user.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(
      {
        name: s.nonEmptyString("Anthology name."),
        summary: s.optional(s.string("Anthology summary.")),
        imageUrl: s.optional(s.url("Anthology cover image URL from bilibili.upload_article_image.")),
      },
      { description: "Anthology creation input." },
    ),
    outputSchema: s.object(
      "The created anthology.",
      {
        anthologyId: s.integer("The new anthology id."),
        name: s.string("The anthology name."),
      },
      { optional: ["anthologyId", "name"] },
    ),
    followUpActions: ["bilibili.set_anthology_articles"],
  }),
  defineProviderAction(service, {
    name: "edit_anthology",
    operationType: "write",
    description: "Edit an anthology's name, summary, or cover. Only provided fields change.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requireAnyProperty(
      s.object(
        {
          ...anthologyIdField,
          name: s.optional(s.nonEmptyString("New anthology name.")),
          summary: s.optional(s.string("New anthology summary.")),
          imageUrl: s.optional(s.url("New anthology cover image URL from bilibili.upload_article_image.")),
        },
        { description: "Anthology edit input. Only provided fields change; at least one is required." },
      ),
      ["name", "summary", "imageUrl"],
    ),
    outputSchema: s.actionOutput({ anthologyId: s.integer("The edited anthology id.") }, "The edited anthology."),
  }),
  defineProviderAction(service, {
    name: "delete_anthology",
    operationType: "destructive",
    description: "Delete an anthology of the authorized user. This cannot be undone.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requiredObject("Anthology deletion input.", anthologyIdField),
    outputSchema: deletionResultSchema({ anthologyId: s.integer("The deleted anthology id.") }),
  }),
  defineProviderAction(service, {
    name: "list_anthologies",
    operationType: "read",
    description: "List all anthologies of the authorized user with review state and article counts.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "The user's anthologies.",
      {
        anthologies: s.array(anthologySchema, { description: "The anthologies." }),
        total: s.integer("Total anthology count."),
      },
      { optional: ["total"] },
    ),
  }),
  defineProviderAction(service, {
    name: "get_anthology",
    operationType: "read",
    description: "Get one anthology with the articles it contains.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.requiredObject("Anthology lookup input.", anthologyIdField),
    outputSchema: s.object(
      "The anthology and its articles.",
      {
        anthology: anthologySchema,
        articles: s.array(
          s.object(
            "An article in the anthology.",
            {
              articleId: s.integer("Article id."),
              title: s.string("Article title."),
              state: s.integer("Review state; 0 means public."),
              publishTime: s.integer("Publication time as a UTC Unix timestamp."),
            },
            { optional: ["articleId", "title", "state", "publishTime"] },
          ),
          { description: "Articles in the anthology." },
        ),
        total: s.integer("Number of articles in the anthology."),
      },
      { optional: ["total"] },
    ),
    followUpActions: ["bilibili.set_anthology_articles", "bilibili.edit_anthology"],
  }),
  defineProviderAction(service, {
    name: "set_anthology_articles",
    operationType: "write",
    description:
      "Replace the article list of an anthology. An article already filed under another anthology is not moved. Pass an empty list to clear the anthology.",
    requiredScopes: [bilibiliProviderScopes.articleBase],
    providerPermissions: [bilibiliProviderScopes.articleBase],
    inputSchema: s.object(
      {
        ...anthologyIdField,
        articleIds: s.array(s.positiveInteger("An article id."), {
          description: "The new article list of the anthology; empty clears it.",
        }),
      },
      { description: "Anthology article replacement input." },
    ),
    outputSchema: s.actionOutput(
      {
        anthologyId: s.integer("The anthology id."),
        articleIds: s.array(s.integer("An article id."), { description: "The submitted article ids." }),
      },
      "The updated anthology.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_article_stats",
    operationType: "read",
    description:
      "Get engagement counters of one or more articles: reads, favorites, likes, dislikes, comments, shares, coins.",
    requiredScopes: [bilibiliProviderScopes.articleData],
    providerPermissions: [bilibiliProviderScopes.articleData],
    inputSchema: s.object(articleIdsField, { description: "Article statistics input." }),
    outputSchema: s.actionOutput(
      { articles: s.array(articleSchema, { description: "Per-article data keyed by the requested ids." }) },
      "Article statistics.",
    ),
  }),
  defineProviderAction(service, {
    name: "get_article_inc_stats",
    operationType: "read",
    description:
      "Get the authorized user's overall article increments over the last 30 days: reads, comments, favorites, likes, shares, coins.",
    requiredScopes: [bilibiliProviderScopes.articleData],
    providerPermissions: [bilibiliProviderScopes.articleData],
    inputSchema: emptyInputSchema,
    outputSchema: s.object(
      "Overall article increments over the last 30 days.",
      {
        incRead: s.integer("Read count increment."),
        incReply: s.integer("Comment count increment."),
        incFavorite: s.integer("Favorite count increment."),
        incLikes: s.integer("Like count increment."),
        incShare: s.integer("Share count increment."),
        incCoin: s.integer("Coin count increment."),
      },
      { optional: ["incRead", "incReply", "incFavorite", "incLikes", "incShare", "incCoin"] },
    ),
  }),
];
