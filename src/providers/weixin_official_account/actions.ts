import type { ProviderActionDefinition } from "../../core/provider-definition.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "weixin_official_account";

const emptyInput = s.actionInput({}, [], "This action takes no input.");

const ipListOutputSchema = s.looseObject("The upstream WeChat response with the requested IP list.", {
  ip_list: s.array("The IP addresses reported by WeChat.", s.string("One IP address or CIDR range.")),
});

const callbackCheckOutputSchema = s.looseObject("The upstream WeChat callback check result.", {
  dns: s.array("The DNS check results.", s.looseObject("One DNS check result.")),
  ping: s.array("The ping check results.", s.looseObject("One ping check result.")),
});

const emptyOutputSchema = s.looseObject("The upstream WeChat response. It carries no fields on success.");

const tempMediaUploadOutputSchema = s.looseObject("The upstream WeChat temporary media upload response.", {
  type: s.string("The media type echoed by WeChat."),
  media_id: s.string("The media_id of the uploaded temporary media, valid for 3 days."),
  created_at: s.integer("The upload time as a Unix timestamp."),
});

const transitFileSchema = s.looseObject("The downloaded media stored in local transit storage.", {
  fileId: s.string("The transit file identifier."),
  downloadUrl: s.string("The local download URL."),
  sizeBytes: s.integer("The file size in bytes."),
  name: s.string("The stored file name."),
  mimeType: s.string("The media MIME type."),
});

const mediaDownloadOutputSchema = s.looseObject(
  "A JSON payload for news or video media, or the downloaded file for binary media. Only one branch's fields are present.",
  {
    mediaId: s.string("The requested media_id (binary downloads only)."),
    contentType: s.string("The downloaded media content type (binary downloads only)."),
    file: transitFileSchema,
    video_url: s.string("The video playback URL (temporary video media only)."),
    news_item: s.array("The articles of a permanent news material.", s.looseObject("One news article.")),
    title: s.string("The video title (permanent video material only)."),
    description: s.string("The video description (permanent video material only)."),
    down_url: s.string("The video download URL (permanent video material only)."),
  },
);

const materialUploadOutputSchema = s.looseObject("The upstream WeChat permanent material upload response.", {
  media_id: s.string("The media_id of the uploaded permanent material."),
  url: s.string("The material URL (image material only)."),
});

const materialCountOutputSchema = s.looseObject("The upstream WeChat permanent material counts.", {
  voice_count: s.integer("The number of voice materials."),
  video_count: s.integer("The number of video materials."),
  image_count: s.integer("The number of image materials."),
  news_count: s.integer("The number of news materials."),
});

const materialListOutputSchema = s.looseObject("The upstream WeChat permanent material page.", {
  total_count: s.integer("The total number of materials of this type."),
  item_count: s.integer("The number of materials in this page."),
  item: s.array("The materials in this page.", s.looseObject("One material item.")),
});

const draftMediaIdOutputSchema = s.looseObject("The upstream WeChat response carrying the draft media_id.", {
  media_id: s.string("The media_id of the draft."),
});

const draftOutputSchema = s.looseObject("The upstream WeChat draft content.", {
  news_item: s.array("The draft articles.", s.looseObject("One draft article.")),
});

const draftCountOutputSchema = s.looseObject("The upstream WeChat draft count.", {
  total_count: s.integer("The total number of drafts."),
});

const draftListOutputSchema = s.looseObject("The upstream WeChat draft page.", {
  total_count: s.integer("The total number of drafts."),
  item_count: s.integer("The number of drafts in this page."),
  item: s.array("The drafts in this page.", s.looseObject("One draft item.")),
});

const publishSubmitOutputSchema = s.looseObject("The upstream WeChat publish task response.", {
  publish_id: s.string("The publish task id used to poll the publish status."),
  msg_data_id: s.string("The message data id of the published article."),
});

const publishStatusOutputSchema = s.looseObject("The upstream WeChat publish task status.", {
  publish_id: s.string("The publish task id."),
  publish_status: s.integer(
    "The publish status: 0 succeeded, 1 publishing, 2/3/4 failed, 5/6 deleted or blocked after success.",
  ),
  article_id: s.string("The published article_id when publish_status is 0."),
  article_detail: s.looseObject("The published article details when publish_status is 0."),
  fail_idx: s.array("The 1-based indexes of the articles that failed.", s.integer("One failed article index.")),
});

const publishedArticleOutputSchema = s.looseObject("The upstream WeChat published article content.", {
  news_item: s.array("The published articles.", s.looseObject("One published article.")),
});

const publishedListOutputSchema = s.looseObject("The upstream WeChat published article page.", {
  total_count: s.integer("The total number of publish records."),
  item_count: s.integer("The number of publish records in this page."),
  item: s.array("The publish records in this page.", s.looseObject("One publish record.")),
});

const statisticsOutputSchema = s.looseObject("The upstream WeChat statistics response.", {
  list: s.array("The per-day statistics rows.", s.looseObject("One statistics row.")),
  is_delay: s.boolean("Whether WeChat marked the returned data as delayed."),
});

const mediaTypeSchema = s.stringEnum("The media type.", ["image", "voice", "video", "thumb"]);

const draftArticleSchema = s.looseObject(
  "One draft article. Known fields are camelCase here and are sent to WeChat in snake_case; any additional field is passed through unchanged.",
  {
    articleType: s.string("The article type; set to `newspic` for a picture message. Omit for a regular news article."),
    title: s.string("The article title."),
    author: s.string("The author name."),
    digest: s.string("The article digest shown in the article list."),
    content: s.string("The article HTML content. Image URLs inside must come from upload_article_image."),
    contentSourceUrl: s.string("The original URL linked by the read-more button."),
    thumbMediaId: s.string("The media_id of the cover image permanent material."),
    thumbUrl: s.string("The cover image URL, used instead of thumbMediaId for `newspic` articles."),
    needOpenComment: s.integer("Whether to open comments: 0 or 1."),
    onlyFansCanComment: s.integer("Whether only followers can comment: 0 or 1."),
    imageInfo: s.looseObject("The image_info payload passed through to WeChat."),
    coverInfo: s.looseObject("The cover_info payload passed through to WeChat."),
    productInfo: s.looseObject("The product_info payload passed through to WeChat."),
  },
);

const offsetSchema = s.nonNegativeInteger("The zero-based offset of the first item to return. Defaults to 0.", {
  default: 0,
});
const pageSizeSchema = s.positiveInteger("The number of items to return, between 1 and 20. Defaults to 20.", {
  maximum: 20,
  default: 20,
});
const noContentSchema = s.boolean(
  "Whether to omit the article content field from the returned items. Defaults to false.",
);

const customMessageTypeSchema = s.stringEnum("The customer service message type.", [
  "text",
  "image",
  "voice",
  "video",
  "music",
  "news",
  "mpnews",
  "mpnewsarticle",
  "wxcard",
  "miniprogrampage",
  "msgmenu",
]);

const customMessageContentSchema = s.looseObject(
  "The content object for the chosen msgType, passed through as the message body. Shapes: text {content}; image/voice {media_id}; video {media_id, thumb_media_id, title, description}; music {title, description, musicurl, hqmusicurl, thumb_media_id}; news {articles: [{title, description, url, picurl}]}; mpnews {media_id}; mpnewsarticle {article_id}; wxcard {card_id}; miniprogrampage {title, appid, pagepath, thumb_media_id}; msgmenu {head_content, list: [{id, content}], tail_content}.",
);

const massMessageTypeSchema = s.stringEnum("The mass message type.", [
  "mpnews",
  "text",
  "voice",
  "image",
  "mpvideo",
  "wxcard",
]);

const massMessageContentSchema = s.looseObject(
  "The content object for the chosen msgType. Shapes: mpnews {media_id} (a draft or permanent news material media_id); text {content}; voice {media_id}; image {media_ids: [...], recommend?, title?, need_open_comment?, only_fans_can_comment?}; mpvideo {media_id, title?, description?}; wxcard {card_id}.",
);

const previewMessageTypeSchema = s.stringEnum("The message type to preview.", [
  "mpnews",
  "text",
  "voice",
  "music",
  "image",
  "mpvideo",
  "wxcard",
]);

const previewMessageContentSchema = s.looseObject(
  "The content object for the chosen msgType, sent under the msgtype key itself. Shapes: mpnews {media_id}; text {content}; voice {media_id}; music {media_id}; image {media_id}; mpvideo {media_id, title?, description?}; wxcard {card_id, card_ext?}. Note the preview image content takes a single media_id, unlike the media_ids list used by the mass send actions.",
);

const massMessageIdSchema = s.union(
  [
    s.nonEmptyString("The msg_id returned by send_mass_message or send_mass_message_by_tag."),
    s.nonNegativeInteger("The msg_id returned by send_mass_message or send_mass_message_by_tag."),
  ],
  { description: "The msg_id returned by send_mass_message or send_mass_message_by_tag." },
);

const massSendOutputSchema = s.looseObject("The upstream WeChat mass send response.", {
  msg_id: s.integer("The mass send task id used to poll or delete the task."),
  msg_data_id: s.integer("The message data id, returned for news (mpnews) messages only."),
});

const massStatusOutputSchema = s.looseObject("The upstream WeChat mass send status.", {
  msg_id: s.integer("The mass send task id."),
  msg_status: s.string("The task status: SEND_SUCCESS, SENDING, SEND_FAIL, or DELETE."),
});

const templateSendOutputSchema = s.looseObject("The upstream WeChat template message response.", {
  msgid: s.integer("The template message id."),
});

const templateIdOutputSchema = s.looseObject("The upstream WeChat response carrying the new template_id.", {
  template_id: s.string("The full template_id created from the short id."),
});

const templateListOutputSchema = s.looseObject("The upstream WeChat private template list.", {
  template_list: s.array("The private templates of the account.", s.looseObject("One template.")),
});

const templateIndustryOutputSchema = s.looseObject("The upstream WeChat template industry settings.", {
  primary_industry: s.looseObject("The primary industry, with first_class and second_class names."),
  secondary_industry: s.looseObject("The secondary industry, with first_class and second_class names."),
});

const sendFollowersPermission = "Send messages to followers of the connected WeChat Official Account";
const templateManagePermission = "Manage message templates of the connected WeChat Official Account";

const dateRangeProperties = {
  beginDate: s.nonEmptyString("The first date of the statistics range in YYYY-MM-DD format.", {
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  }),
  endDate: s.nonEmptyString(
    "The last date of the statistics range in YYYY-MM-DD format. WeChat returns data up to yesterday at the latest.",
    { pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  ),
};

function dateRangeAction(input: { name: string; description: string; maxSpanDays: number }): ProviderActionDefinition {
  return defineProviderAction(service, {
    name: input.name,
    operationType: "read",
    description: `${input.description} Both dates use YYYY-MM-DD, and WeChat returns data up to yesterday at the latest. The range spans at most ${input.maxSpanDays} day(s) including both ends. Only certified WeChat Official Accounts can use this API.`,
    inputSchema: s.actionInput(dateRangeProperties, ["beginDate", "endDate"], "The statistics date range."),
    outputSchema: statisticsOutputSchema,
    providerPermissions: ["Read WeChat Official Account analytics (certified accounts only)"],
  });
}

export const weixinOfficialAccountActions: ProviderActionDefinition[] = [
  defineProviderAction(service, {
    name: "get_api_domain_ip",
    operationType: "read",
    description: "Get the WeChat API server IP addresses that the official account servers may call from.",
    inputSchema: emptyInput,
    outputSchema: ipListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "get_callback_ip",
    operationType: "read",
    description:
      "Get the WeChat callback server IP addresses. Allowlist them when the official account receives message callbacks.",
    inputSchema: emptyInput,
    outputSchema: ipListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "callback_check",
    operationType: "read",
    description:
      "Check network connectivity between WeChat servers and the callback URL configured for the official account. Fails with errcode 40201 when the account has no callback URL configured.",
    inputSchema: s.actionInput(
      {
        action: s.withDefault(s.stringEnum("The check action to run.", ["dns", "ping", "all"]), "all"),
        checkOperator: s.withDefault(
          s.stringEnum("The carrier line to check from.", ["CHINANET", "UNICOM", "CAP", "DEFAULT"]),
          "DEFAULT",
        ),
      },
      [],
      "The callback check parameters.",
    ),
    outputSchema: callbackCheckOutputSchema,
  }),
  defineProviderAction(service, {
    name: "clear_quota",
    operationType: "write",
    description:
      "Reset the monthly API call quota of the connected official account. The account's appId is taken from the credential. Each account can clear its quota at most 10 times per calendar month.",
    inputSchema: emptyInput,
    outputSchema: emptyOutputSchema,
  }),
  defineProviderAction(service, {
    name: "upload_temp_media",
    operationType: "write",
    description:
      "Upload a temporary media file to the official account. Temporary media expires 3 days after upload. Size limits: image 10 MB, voice 2 MB, video 10 MB, thumb 64 KB.",
    inputSchema: s.actionInput(
      {
        type: mediaTypeSchema,
        file: s.transitFile("The media file previously uploaded to the local transit file API."),
      },
      ["type", "file"],
      "The temporary media to upload.",
    ),
    outputSchema: tempMediaUploadOutputSchema,
    providerPermissions: ["Upload temporary media to the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "get_temp_media",
    operationType: "read",
    description:
      "Download a temporary media file by media_id. Image, voice, and thumb media are stored in local transit storage; video media returns a video_url instead.",
    inputSchema: s.actionInput(
      {
        mediaId: s.nonEmptyString("The media_id returned by upload_temp_media or a message."),
        fileName: s.nonEmptyString("An optional file name override for the downloaded media."),
      },
      ["mediaId"],
      "The temporary media to download.",
    ),
    outputSchema: mediaDownloadOutputSchema,
    providerPermissions: ["Download temporary media from the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "upload_article_image",
    operationType: "write",
    description:
      "Upload an image used inside article HTML content and get back its WeChat-hosted URL. Only the returned URL renders inside article content. JPG/PNG only, at most 1 MB. Does not consume the material quota.",
    inputSchema: s.actionInput(
      { file: s.transitFile("The JPG or PNG image previously uploaded to the local transit file API.") },
      ["file"],
      "The article image to upload.",
    ),
    outputSchema: s.looseObject("The upstream WeChat article image upload response.", {
      url: s.string("The WeChat-hosted image URL to embed in article content."),
    }),
    providerPermissions: ["Upload article images to the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "add_material",
    operationType: "write",
    description:
      "Upload a permanent media material. Permanent materials do not expire but count toward the account material quota. Size limits: image 10 MB, voice 2 MB, video 10 MB, thumb 64 KB. Video uploads require title and introduction.",
    inputSchema: s.actionInput(
      {
        type: mediaTypeSchema,
        file: s.transitFile("The media file previously uploaded to the local transit file API."),
        title: s.nonEmptyString("The video title. Required when type is video."),
        introduction: s.nonEmptyString("The video introduction. Required when type is video."),
      },
      ["type", "file"],
      "The permanent material to upload.",
    ),
    outputSchema: materialUploadOutputSchema,
    providerPermissions: ["Upload permanent materials to the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "get_material",
    operationType: "read",
    description:
      "Get a permanent material by media_id. News materials return their articles and video materials return title, description, and down_url as JSON; image and voice materials are stored in local transit storage.",
    inputSchema: s.actionInput(
      {
        mediaId: s.nonEmptyString("The media_id of the permanent material."),
        fileName: s.nonEmptyString("An optional file name override for binary downloads."),
      },
      ["mediaId"],
      "The permanent material to get.",
    ),
    outputSchema: mediaDownloadOutputSchema,
    providerPermissions: ["Download permanent materials from the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "delete_material",
    operationType: "destructive",
    description: "Permanently delete a permanent material by media_id. This cannot be undone.",
    inputSchema: s.actionInput(
      { mediaId: s.nonEmptyString("The media_id of the permanent material to delete.") },
      ["mediaId"],
      "The permanent material to delete.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: ["Delete permanent materials from the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "get_material_count",
    operationType: "read",
    description: "Get the permanent material counts of the official account, grouped by media type.",
    inputSchema: emptyInput,
    outputSchema: materialCountOutputSchema,
  }),
  defineProviderAction(service, {
    name: "batch_get_material",
    operationType: "read",
    description: "List permanent materials of one type in pages of at most 20 items.",
    inputSchema: s.actionInput(
      {
        type: s.stringEnum("The material type to list.", ["image", "video", "voice", "news"]),
        offset: offsetSchema,
        count: pageSizeSchema,
      },
      ["type"],
      "The permanent material page to list.",
    ),
    outputSchema: materialListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "add_draft",
    operationType: "write",
    description: "Create an article draft with 1 to 8 articles. Cover images must be permanent material media_ids.",
    inputSchema: s.actionInput(
      {
        articles: s.array("The draft articles, in display order.", draftArticleSchema, { minItems: 1, maxItems: 8 }),
      },
      ["articles"],
      "The draft to create.",
    ),
    outputSchema: draftMediaIdOutputSchema,
    providerPermissions: ["Manage article drafts of the connected WeChat Official Account"],
    followUpActions: ["weixin_official_account.publish_draft"],
  }),
  defineProviderAction(service, {
    name: "get_draft",
    operationType: "read",
    description: "Get the content of one article draft by media_id.",
    inputSchema: s.actionInput(
      { mediaId: s.nonEmptyString("The media_id of the draft.") },
      ["mediaId"],
      "The draft to get.",
    ),
    outputSchema: draftOutputSchema,
    providerPermissions: ["Manage article drafts of the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "delete_draft",
    operationType: "destructive",
    description: "Permanently delete one article draft by media_id. This cannot be undone.",
    inputSchema: s.actionInput(
      { mediaId: s.nonEmptyString("The media_id of the draft to delete.") },
      ["mediaId"],
      "The draft to delete.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: ["Manage article drafts of the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "update_draft",
    operationType: "write",
    description: "Replace one article inside a draft. index is zero-based: the first article is 0.",
    inputSchema: s.actionInput(
      {
        mediaId: s.nonEmptyString("The media_id of the draft to update."),
        index: s.nonNegativeInteger("The zero-based index of the article inside the draft."),
        article: draftArticleSchema,
      },
      ["mediaId", "index", "article"],
      "The draft article update.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: ["Manage article drafts of the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "get_draft_count",
    operationType: "read",
    description: "Get the total number of article drafts of the official account.",
    inputSchema: emptyInput,
    outputSchema: draftCountOutputSchema,
  }),
  defineProviderAction(service, {
    name: "batch_get_draft",
    operationType: "read",
    description: "List article drafts in pages of at most 20 items.",
    inputSchema: s.actionInput(
      {
        offset: offsetSchema,
        count: pageSizeSchema,
        noContent: noContentSchema,
      },
      [],
      "The draft page to list.",
    ),
    outputSchema: draftListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "publish_draft",
    operationType: "write",
    description:
      "Submit one article draft for publishing. The returned publish_id only means the publish task was accepted; poll get_publish_status for the result. Only certified accounts can publish.",
    inputSchema: s.actionInput(
      { mediaId: s.nonEmptyString("The media_id of the draft to publish.") },
      ["mediaId"],
      "The draft to publish.",
    ),
    outputSchema: publishSubmitOutputSchema,
    providerPermissions: ["Publish article drafts of the connected WeChat Official Account"],
    followUpActions: ["weixin_official_account.get_publish_status"],
  }),
  defineProviderAction(service, {
    name: "get_publish_status",
    operationType: "read",
    description: "Poll the status of a publish task by publish_id.",
    inputSchema: s.actionInput(
      { publishId: s.nonEmptyString("The publish_id returned by publish_draft.") },
      ["publishId"],
      "The publish task to poll.",
    ),
    outputSchema: publishStatusOutputSchema,
    providerPermissions: ["Publish article drafts of the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "delete_publish",
    operationType: "destructive",
    description:
      "Delete a published article by article_id. index selects one article inside the published message, counting from 1; omit index to delete the whole message. Deleted articles show as unavailable to readers. This cannot be undone.",
    inputSchema: s.actionInput(
      {
        articleId: s.nonEmptyString("The article_id of the published message to delete."),
        index: s.positiveInteger("The 1-based index of the article inside the message. Omit to delete all articles."),
      },
      ["articleId"],
      "The published article to delete.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: ["Delete published articles of the connected WeChat Official Account"],
  }),
  defineProviderAction(service, {
    name: "get_published_article",
    operationType: "read",
    description: "Get the content of a published article by article_id.",
    inputSchema: s.actionInput(
      { articleId: s.nonEmptyString("The article_id returned when the publish task succeeded.") },
      ["articleId"],
      "The published article to get.",
    ),
    outputSchema: publishedArticleOutputSchema,
  }),
  defineProviderAction(service, {
    name: "batch_get_published",
    operationType: "read",
    description: "List successfully published article records in pages of at most 20 items.",
    inputSchema: s.actionInput(
      {
        offset: offsetSchema,
        count: pageSizeSchema,
        noContent: noContentSchema,
      },
      [],
      "The published article page to list.",
    ),
    outputSchema: publishedListOutputSchema,
  }),
  defineProviderAction(service, {
    name: "send_custom_message",
    operationType: "write",
    description:
      "Send a customer service message to one follower. Only certified accounts can use this API, and the follower must have interacted with the account within the last 48 hours. content is the message-type-specific object documented per msgType.",
    inputSchema: s.actionInput(
      {
        toUser: s.nonEmptyString("The OpenID of the follower to message."),
        msgType: customMessageTypeSchema,
        content: customMessageContentSchema,
      },
      ["toUser", "msgType", "content"],
      "The customer service message to send.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [sendFollowersPermission],
  }),
  defineProviderAction(service, {
    name: "set_typing_status",
    operationType: "write",
    description:
      "Show or hide the customer service typing indicator for one follower. Only certified accounts can use this API, and the follower must have interacted with the account within the last 48 hours.",
    inputSchema: s.actionInput(
      {
        toUser: s.nonEmptyString("The OpenID of the follower."),
        command: s.withDefault(s.stringEnum("Whether to start or stop typing.", ["Typing", "CancelTyping"]), "Typing"),
      },
      ["toUser"],
      "The typing status command.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [sendFollowersPermission],
  }),
  defineProviderAction(service, {
    name: "send_mass_message",
    operationType: "write",
    description:
      "Mass-send a message to a list of follower OpenIDs (between 2 and 10000). Only certified accounts can mass-send: certified subscription accounts once per day, certified service accounts 4 times per calendar month. A successful response only means the task was accepted; poll get_mass_message_status for the result.",
    inputSchema: s.actionInput(
      {
        toUsers: s.array("The recipient OpenIDs, between 2 and 10000.", s.nonEmptyString("One follower OpenID."), {
          minItems: 2,
          maxItems: 10000,
        }),
        msgType: massMessageTypeSchema,
        content: massMessageContentSchema,
        sendIgnoreReprint: s.boolean(
          "For mpnews only: whether to continue sending when the article is judged a reprint. Defaults to false (stop sending).",
        ),
      },
      ["toUsers", "msgType", "content"],
      "The mass message to send.",
    ),
    outputSchema: massSendOutputSchema,
    providerPermissions: [sendFollowersPermission],
    followUpActions: ["weixin_official_account.get_mass_message_status"],
  }),
  defineProviderAction(service, {
    name: "send_mass_message_by_tag",
    operationType: "write",
    description:
      "Mass-send a message to all followers or to one follower tag. Only certified accounts can mass-send: certified subscription accounts once per day, certified service accounts 4 times per calendar month. A successful response only means the task was accepted; poll get_mass_message_status for the result.",
    inputSchema: s.actionInput(
      {
        isToAll: s.withDefault(s.boolean("Whether to send to all followers. Defaults to false."), false),
        tagId: s.integer("The tag id to send to. Required when isToAll is false. Ignored when isToAll is true."),
        msgType: massMessageTypeSchema,
        content: massMessageContentSchema,
      },
      ["msgType", "content"],
      "The mass message to send.",
    ),
    outputSchema: massSendOutputSchema,
    providerPermissions: [sendFollowersPermission],
    followUpActions: ["weixin_official_account.get_mass_message_status"],
  }),
  defineProviderAction(service, {
    name: "preview_mass_message",
    operationType: "write",
    description:
      "Preview a mass message to one follower before sending, to check its style and layout. Only certified accounts can use this API. Previewing by WeChat ID (toWxName) is limited to 100 calls per day.",
    inputSchema: s.actionInput(
      {
        toUser: s.nonEmptyString(
          "The OpenID of the follower to preview to. Exactly one of toUser and toWxName is required.",
        ),
        toWxName: s.nonEmptyString(
          "The WeChat ID of the user to preview to. Exactly one of toUser and toWxName is required.",
        ),
        msgType: previewMessageTypeSchema,
        content: previewMessageContentSchema,
      },
      ["msgType", "content"],
      "The mass message to preview.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [sendFollowersPermission],
  }),
  defineProviderAction(service, {
    name: "get_mass_message_status",
    operationType: "read",
    description: "Poll the send status of a mass message task by msg_id.",
    inputSchema: s.actionInput({ msgId: massMessageIdSchema }, ["msgId"], "The mass message task to poll."),
    outputSchema: massStatusOutputSchema,
  }),
  defineProviderAction(service, {
    name: "delete_mass_message",
    operationType: "destructive",
    description:
      "Delete a mass-sent message by msg_id. articleIdx selects one article inside the message, counting from 1; omit it to delete the whole message. Only messages sent through the API that finished sending can be deleted, and only news and video messages qualify. Deletion invalidates the article content page for everyone; users who already received the message still see its card locally. When several mass sends shared one article, deleting one send invalidates all of them.",
    inputSchema: s.actionInput(
      {
        msgId: massMessageIdSchema,
        articleIdx: s.positiveInteger(
          "The 1-based index of the article inside the message. Omit to delete all articles.",
        ),
      },
      ["msgId"],
      "The mass message to delete.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [sendFollowersPermission],
  }),
  defineProviderAction(service, {
    name: "send_template_message",
    operationType: "write",
    description:
      "Send a template message to one follower. Only certified service accounts can use this API. data maps each template keyword to {value, color?}.",
    inputSchema: s.actionInput(
      {
        toUser: s.nonEmptyString("The OpenID of the follower to message."),
        templateId: s.nonEmptyString("The template_id of a private template of the account."),
        url: s.url("An optional URL opened when the follower taps the message."),
        miniprogram: s.looseObject("An optional mini program jump target with appid and pagepath.", {
          appid: s.string("The mini program appid."),
          pagepath: s.string("The mini program page path."),
        }),
        clientMsgId: s.nonEmptyString("An optional caller-side id (at most 32 bytes) that deduplicates retries."),
        data: s.looseObject("The template data, mapping each keyword to {value, color?}."),
      },
      ["toUser", "templateId", "data"],
      "The template message to send.",
    ),
    outputSchema: templateSendOutputSchema,
    providerPermissions: [sendFollowersPermission],
  }),
  defineProviderAction(service, {
    name: "add_template",
    operationType: "write",
    description:
      "Add a private template from the template library by its short id and get back the full template_id. Only certified service accounts can use this API.",
    inputSchema: s.actionInput(
      { templateIdShort: s.nonEmptyString("The template_id_short from the public template library.") },
      ["templateIdShort"],
      "The template to add.",
    ),
    outputSchema: templateIdOutputSchema,
    providerPermissions: [templateManagePermission],
  }),
  defineProviderAction(service, {
    name: "get_all_templates",
    operationType: "read",
    description: "List all private templates of the account. Only certified service accounts can use this API.",
    inputSchema: emptyInput,
    outputSchema: templateListOutputSchema,
    providerPermissions: [templateManagePermission],
  }),
  defineProviderAction(service, {
    name: "delete_template",
    operationType: "destructive",
    description:
      "Delete one private template by template_id. Only certified service accounts can use this API. This cannot be undone.",
    inputSchema: s.actionInput(
      { templateId: s.nonEmptyString("The template_id of the private template to delete.") },
      ["templateId"],
      "The template to delete.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [templateManagePermission],
  }),
  defineProviderAction(service, {
    name: "set_template_industry",
    operationType: "write",
    description:
      "Set the primary and secondary industry of the account, which decides which template library entries are available. Only certified service accounts can use this API.",
    inputSchema: s.actionInput(
      {
        industryId1: s.nonEmptyString("The primary industry id from the WeChat template industry table."),
        industryId2: s.nonEmptyString("The secondary industry id from the WeChat template industry table."),
      },
      ["industryId1", "industryId2"],
      "The industry ids to set.",
    ),
    outputSchema: emptyOutputSchema,
    providerPermissions: [templateManagePermission],
  }),
  defineProviderAction(service, {
    name: "get_template_industry",
    operationType: "read",
    description:
      "Get the primary and secondary industry currently set on the account. Only certified service accounts can use this API.",
    inputSchema: emptyInput,
    outputSchema: templateIndustryOutputSchema,
    providerPermissions: [templateManagePermission],
  }),
  dateRangeAction({
    name: "get_user_summary",
    description: "Get per-day follower gains and losses of the official account.",
    maxSpanDays: 7,
  }),
  dateRangeAction({
    name: "get_user_cumulate",
    description: "Get the per-day cumulative follower count of the official account.",
    maxSpanDays: 7,
  }),
  dateRangeAction({
    name: "get_article_read",
    description: "Get the daily read metrics of every published article that was read on the given day.",
    maxSpanDays: 1,
  }),
  dateRangeAction({
    name: "get_article_share",
    description: "Get the daily share metrics of every published article that was shared on the given day.",
    maxSpanDays: 1,
  }),
  dateRangeAction({
    name: "get_biz_summary",
    description: "Get the per-day overview metrics aggregated across all content published in the range.",
    maxSpanDays: 30,
  }),
  dateRangeAction({
    name: "get_article_total_detail",
    description:
      "Get the cumulative per-article metrics for everything published in the range. Each article accumulates at most 30 days of data from its publish date.",
    maxSpanDays: 1,
  }),
];
