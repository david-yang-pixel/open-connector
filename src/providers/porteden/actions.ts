import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const emailId = s.nonEmptyString("Provider-prefixed email ID, such as google:abc123 or m365:xyz789.");
const bodyType = s.stringEnum("Body content type; defaults to html.", ["html", "text"]);
const participant = s.object(
  "Email recipient.",
  {
    email: s.nonEmptyString("Email address."),
    name: s.string("Display name."),
  },
  { optional: ["name"] },
);
const recipients = s.array("Recipient addresses and optional display names.", participant, {
  minItems: 1,
});
const email = s.looseObject(
  "Email with permission-filtered fields and attachment metadata; additional fields are preserved.",
  {
    id: s.string("Provider-prefixed email ID."),
    threadId: s.nullable(s.string("Provider-prefixed thread ID.")),
    subject: s.nullable(s.string("Email subject.")),
    from: s.nullable(s.looseObject("Sender details.", {})),
    to: s.nullable(s.array("Recipients.", s.looseObject("Recipient details.", {}))),
    body: s.nullable(s.string("Email body when requested and permitted.")),
    bodyPreview: s.nullable(s.string("Short body preview.")),
    bodyType: s.nullable(s.string("Body content type.")),
    receivedAt: s.nullable(s.string("Receipt timestamp in UTC.")),
    isRead: s.boolean("Whether the email is read."),
    hasAttachments: s.boolean("Whether attachments exist."),
    attachments: s.nullable(
      s.array("Attachment metadata; no file content is downloaded.", s.looseObject("Attachment details.", {})),
    ),
    labels: s.nullable(s.stringArray("Labels or categories.")),
    provider: s.string("Source provider, such as GOOGLE or M365."),
    emailAccountOwner: s.nullable(s.string("Mailbox owner address.")),
  },
);
const sent = s.looseObject("Send result; Microsoft 365 can return null message and thread IDs.", {
  success: s.boolean("Whether the operation succeeded."),
  emailId: s.nullable(s.string("Provider-prefixed sent email ID, when available.")),
  threadId: s.nullable(s.string("Provider-prefixed thread ID, when available.")),
  errorMessage: s.nullable(s.string("Upstream failure details, when available.")),
});
const success = s.requiredObject("Successful operation result.", {
  success: s.boolean("Whether the operation succeeded."),
});
export const portedenActions: ActionDefinition[] = [
  defineProviderAction("porteden", {
    name: "search_emails",
    operationType: "read",
    requiredScopes: [],
    description:
      "Search emails across connected Gmail and Microsoft 365 accounts. Email access and search_emails permission must be enabled in PortEden; pass nextPageToken as pageToken to continue.",
    inputSchema: s.object(
      "Email search filters and pagination.",
      {
        q: s.string("Free-text search query."),
        from: s.string("Filter by sender email address."),
        to: s.string("Filter by recipient email address."),
        subject: s.string("Partial subject filter."),
        label: s.string("Label or category filter."),
        unread: s.boolean("Filter by read status; true selects unread emails."),
        after: s.string("Emails received after this UTC timestamp.", { format: "date-time" }),
        before: s.string("Emails received before this UTC timestamp.", { format: "date-time" }),
        hasAttachment: s.boolean("Filter by attachment presence."),
        limit: s.integer("Maximum results; defaults to 20, at most 50.", {
          minimum: 1,
          maximum: 50,
        }),
        includeBody: s.boolean("Include full bodies; defaults to false."),
        pageToken: s.string("Opaque nextPageToken from the previous result."),
      },
      { required: [] },
    ),
    outputSchema: s.looseObject("Merged email search results sorted newest first.", {
      emails: s.array("Matching emails.", email),
      totalCount: s.integer("Total matching count reported by PortEden."),
      hasMore: s.boolean("Whether more results are available."),
      nextPageToken: s.nullable(s.string("Opaque continuation token.")),
      accessInfo: s.unknown("Active access restrictions, if present."),
      authWarnings: s.unknown("Upstream account authentication warnings, if present."),
    }),
  }),
  defineProviderAction("porteden", {
    name: "get_email",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read a provider-prefixed email, including its body by default, subject to PortEden view_email permissions.",
    inputSchema: s.object(
      "Email lookup.",
      { emailId, includeBody: s.boolean("Include full body; defaults to true.") },
      { optional: ["includeBody"] },
    ),
    outputSchema: email,
  }),
  defineProviderAction("porteden", {
    name: "get_thread",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read a complete email thread in chronological order with body content, subject to PortEden view_thread permissions.",
    inputSchema: s.requiredObject("Thread lookup.", {
      threadId: s.nonEmptyString("Provider-prefixed thread ID, such as google:abc123 or m365:xyz789."),
    }),
    outputSchema: s.looseObject("Email thread.", {
      id: s.string("Provider-prefixed thread ID."),
      subject: s.nullable(s.string("Thread subject.")),
      messages: s.array("Messages in chronological order.", email),
      messageCount: s.integer("Message count."),
      participants: s.array("Thread participants.", s.looseObject("Participant details.", {})),
      lastMessageAt: s.nullable(s.string("Most recent message timestamp.")),
      provider: s.string("Source provider."),
    }),
  }),
  defineProviderAction("porteden", {
    name: "send_email",
    operationType: "write",
    requiredScopes: [],
    description:
      "Send an email through a connected account with PortEden send_email permission. Choose sendFrom or connectionId when needed; the default account is otherwise used.",
    inputSchema: s.object(
      "New email.",
      {
        to: recipients,
        cc: s.array("Recipient addresses and optional display names.", participant),
        bcc: s.array("Recipient addresses and optional display names.", participant),
        subject: s.string("Email subject."),
        body: s.string("Email body content."),
        bodyType,
        importance: s.stringEnum("Priority; defaults to normal.", ["low", "normal", "high"]),
        sendFrom: s.nonEmptyString("Connected account email address to send from."),
        connectionId: s.integer("Provider connection ID to send from."),
      },
      { optional: ["cc", "bcc", "bodyType", "importance", "sendFrom", "connectionId"] },
    ),
    outputSchema: sent,
  }),
  defineProviderAction("porteden", {
    name: "reply_email",
    operationType: "write",
    requiredScopes: [],
    description: "Reply to an email, preserving its thread, with PortEden reply_to_email permission.",
    inputSchema: s.object(
      "Email reply.",
      {
        emailId,
        body: s.string("Reply body content."),
        bodyType,
        replyAll: s.boolean("Reply to all original recipients except the sending account; defaults to false."),
      },
      { optional: ["bodyType", "replyAll"] },
    ),
    outputSchema: sent,
  }),
  defineProviderAction("porteden", {
    name: "forward_email",
    operationType: "write",
    requiredScopes: [],
    description: "Forward an email to recipients with PortEden forward_email permission.",
    inputSchema: s.object(
      "Email forwarding options.",
      {
        emailId,
        to: recipients,
        cc: s.array("Recipient addresses and optional display names.", participant),
        body: s.string("Optional message to prepend."),
        bodyType,
      },
      { optional: ["cc", "body", "bodyType"] },
    ),
    outputSchema: sent,
  }),
  defineProviderAction("porteden", {
    name: "modify_email",
    operationType: "write",
    requiredScopes: [],
    description:
      "Change read status or labels/categories. PortEden requires mark_as_read and/or apply_labels permission for the requested changes.",
    inputSchema: s.requireAnyProperty(
      s.object(
        "Email property changes.",
        {
          emailId,
          markAsRead: s.boolean("Mark as read (true) or unread (false)."),
          addLabels: s.stringArray("Labels or categories to add."),
          removeLabels: s.stringArray("Labels or categories to remove."),
        },
        { optional: ["markAsRead", "addLabels", "removeLabels"] },
      ),
      ["markAsRead", "addLabels", "removeLabels"],
    ),
    outputSchema: success,
  }),
  defineProviderAction("porteden", {
    name: "delete_email",
    operationType: "destructive",
    requiredScopes: [],
    description:
      "Move an email to Trash or Deleted Items with PortEden delete_email permission. This is a recoverable soft delete.",
    inputSchema: s.requiredObject("Email to move to trash.", { emailId }),
    outputSchema: success,
  }),
];
