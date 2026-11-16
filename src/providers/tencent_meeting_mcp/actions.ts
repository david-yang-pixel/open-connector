import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "tencent_meeting_mcp";
const fields = {
  _client_info: s.looseObject(
    "Optional client environment metadata. Connector supplies its OS and agent identity when omitted; provide model only when known.",
  ),
  audio_watermark: s.boolean("Enable audio watermarking. Omit to use account or enterprise settings."),
  auto_asr: s.boolean("Enable automatic transcription. Omit to use account or enterprise settings."),
  auto_in_waiting_room: s.boolean("Enable the waiting room. Preserve omission when updating a meeting."),
  auto_record_type: s.string(
    "Automatic recording after the host joins: none, local, or cloud. Omit to use account or enterprise settings.",
  ),
  end_time: s.string(
    "End time in ISO 8601 or the provider-supported date-time format. Times without an offset use Asia/Shanghai.",
  ),
  invitees: s.array(
    "Invited enterprise member open_id values, up to 100. Discover contact lookup tools with list_tools if needed.",
    s.string("Enterprise member open_id."),
  ),
  meeting_type: s.number("Meeting type: 0 for a normal meeting or 1 for a recurring meeting."),
  only_user_join_type: s.number(
    "Join restriction: 1 for all members, 2 for invited members, or 3 for enterprise members.",
  ),
  password: s.string("Optional meeting password of 4 to 6 digits."),
  recurring_rule: s.looseObject(
    "Provider recurring-meeting configuration: recurring_type, until_type, until_count, until_date. For updates, sub_meeting_id selects one occurrence and cannot be combined with recurrence-rule changes.",
  ),
  start_time: s.string(
    "Start time in ISO 8601 or the provider-supported date-time format. Times without an offset use Asia/Shanghai.",
  ),
  subject: s.string("Meeting subject."),
  time_zone: s.string(
    "The meeting timezone, such as Asia/Shanghai. This sets the meeting timezone rather than response formatting.",
  ),
  water_mark_type: s.number(
    "Text watermark: 0 for single row, 1 for double row, or 2 for disabled. Omit to use account or enterprise settings.",
  ),
  invitees_operate_type: s.stringEnum("How to update nonempty invitees: add, remove, or replace.", [
    "add",
    "remove",
    "replace",
  ]),
  meeting_id: s.string(
    "Meeting ID as a string. Resolve a meeting code with get_meeting_by_code; do not convert uint64 IDs to JavaScript numbers.",
  ),
  is_compact: s.boolean("Request a compact response. Omit or pass false for the full upstream response."),
  sub_meeting_id: s.string("Recurring meeting occurrence ID, obtained from current_sub_meeting_id in meeting details."),
  timezone: s.string(
    "IANA timezone for displaying response timestamps, default Asia/Shanghai. This does not change the meeting timezone; use time_zone for that.",
  ),
  meeting_code: s.string("Meeting code in an upstream-supported format, including hyphenated or spaced codes."),
  page_size: s.number("Number of records per page. Omit to use the upstream default."),
  page_token: s.string(
    "Pagination cursor from next_page_token. Omit for the first page; continue while has_more is true.",
  ),
  is_show_all_sub_meetings: s.number("Whether to include all recurring meeting occurrences."),
  meeting_record_id: s.string("Meeting recording ID returned by get_records_list. Preserve the ID as a string."),
  record_file_id: s.string(
    "Recording file ID returned by get_records_list. This is distinct from meeting_record_id; preserve the ID as a string.",
  ),
  limit: s.number("Number of transcript paragraphs to return. Omit to request all remaining paragraphs."),
  pid: s.string("Starting paragraph ID, inclusive. Obtain it using get_transcripts_paragraphs."),
  text: s.string("Transcript search keyword. The official skill requests URL encoding for Chinese keywords."),
  lang: s.stringEnum(
    "Minutes language: default for the original language, zh for Simplified Chinese, en for English, or ja for Japanese.",
    ["default", "zh", "en", "ja"],
  ),
  pwd: s.string("Recording access password."),
};
const resultSchema = s.requiredObject("Tencent Meeting MCP response.", {
  result: s.looseObject(
    "Complete MCP result, including content, structuredContent, and upstream metadata when present. JSON text can contain _meta and data with status_code, headers, and body. Preserve trace IDs and unknown fields.",
  ),
});
export const tencentMeetingMcpActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "schedule_meeting",
    operationType: "write",
    description:
      "Schedule a normal or recurring meeting. Supply the subject and intended start/end times; omitted options use Tencent Meeting defaults.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for schedule_meeting.",
      {
        _client_info: fields._client_info,
        audio_watermark: fields.audio_watermark,
        auto_asr: fields.auto_asr,
        auto_in_waiting_room: fields.auto_in_waiting_room,
        auto_record_type: fields.auto_record_type,
        end_time: fields.end_time,
        invitees: fields.invitees,
        meeting_type: fields.meeting_type,
        only_user_join_type: fields.only_user_join_type,
        password: fields.password,
        recurring_rule: fields.recurring_rule,
        start_time: fields.start_time,
        subject: fields.subject,
        time_zone: fields.time_zone,
        water_mark_type: fields.water_mark_type,
      },
      {
        optional: [
          "_client_info",
          "audio_watermark",
          "auto_asr",
          "auto_in_waiting_room",
          "auto_record_type",
          "end_time",
          "invitees",
          "meeting_type",
          "only_user_join_type",
          "password",
          "recurring_rule",
          "start_time",
          "time_zone",
          "water_mark_type",
        ],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "update_meeting",
    operationType: "write",
    description:
      "Update a meeting after showing the existing meeting and obtaining user confirmation. Omitted fields are left to the provider; do not supply unrelated changes.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for update_meeting.",
      {
        _client_info: fields._client_info,
        audio_watermark: fields.audio_watermark,
        auto_asr: fields.auto_asr,
        auto_in_waiting_room: fields.auto_in_waiting_room,
        auto_record_type: fields.auto_record_type,
        end_time: fields.end_time,
        invitees: fields.invitees,
        invitees_operate_type: fields.invitees_operate_type,
        meeting_id: fields.meeting_id,
        meeting_type: fields.meeting_type,
        only_user_join_type: fields.only_user_join_type,
        password: fields.password,
        recurring_rule: fields.recurring_rule,
        start_time: fields.start_time,
        subject: fields.subject,
        time_zone: fields.time_zone,
        water_mark_type: fields.water_mark_type,
      },
      {
        optional: [
          "_client_info",
          "audio_watermark",
          "auto_asr",
          "auto_in_waiting_room",
          "auto_record_type",
          "end_time",
          "invitees",
          "invitees_operate_type",
          "meeting_type",
          "only_user_join_type",
          "password",
          "recurring_rule",
          "start_time",
          "subject",
          "time_zone",
          "water_mark_type",
        ],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "cancel_meeting",
    operationType: "destructive",
    description:
      "Cancel a meeting, one recurring occurrence, or the whole series after showing the meeting and obtaining user confirmation.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for cancel_meeting.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        meeting_type: fields.meeting_type,
        sub_meeting_id: fields.sub_meeting_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "meeting_type", "sub_meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_meeting",
    operationType: "read",
    description: "Get meeting details by meeting_id. Resolve a meeting code with get_meeting_by_code first.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_meeting.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_meeting_by_code",
    operationType: "read",
    description:
      "Resolve a meeting code to meeting_id and meeting details. Accept the meeting-code formats supported by Tencent Meeting.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_meeting_by_code.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_code: fields.meeting_code,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_meeting_participants",
    operationType: "read",
    description:
      "List meeting participants. Pass next_page_token as page_token while has_more is true. Recurring meetings require sub_meeting_id; time filters apply to non-recurring meetings and cover at most 90 days.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_meeting_participants.",
      {
        _client_info: fields._client_info,
        end_time: fields.end_time,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        page_size: fields.page_size,
        page_token: fields.page_token,
        start_time: fields.start_time,
        sub_meeting_id: fields.sub_meeting_id,
        timezone: fields.timezone,
      },
      {
        optional: [
          "_client_info",
          "end_time",
          "is_compact",
          "page_size",
          "page_token",
          "start_time",
          "sub_meeting_id",
          "timezone",
        ],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_meeting_invitees",
    operationType: "read",
    description: "List invited meeting members, preserving pagination cursors.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_meeting_invitees.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        page_size: fields.page_size,
        page_token: fields.page_token,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "page_size", "page_token", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_waiting_room",
    operationType: "read",
    description: "List members in the meeting waiting room, preserving pagination cursors.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_waiting_room.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        page_size: fields.page_size,
        page_token: fields.page_token,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "page_size", "page_token", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_user_meetings",
    operationType: "read",
    description: "List upcoming and ongoing meetings. Use get_user_ended_meetings separately for ended meetings.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_user_meetings.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        is_show_all_sub_meetings: fields.is_show_all_sub_meetings,
        page_size: fields.page_size,
        page_token: fields.page_token,
        timezone: fields.timezone,
      },
      {
        optional: ["_client_info", "is_compact", "is_show_all_sub_meetings", "page_size", "page_token", "timezone"],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_user_ended_meetings",
    operationType: "read",
    description:
      "List ended meetings, optionally filtered by time. Use get_user_meetings separately for upcoming and ongoing meetings.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_user_ended_meetings.",
      {
        _client_info: fields._client_info,
        end_time: fields.end_time,
        is_compact: fields.is_compact,
        page_size: fields.page_size,
        page_token: fields.page_token,
        start_time: fields.start_time,
        timezone: fields.timezone,
      },
      {
        optional: ["_client_info", "end_time", "is_compact", "page_size", "page_token", "start_time", "timezone"],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_records_list",
    operationType: "read",
    description:
      "List recordings by meeting ID, meeting code, or time range. Without a meeting ID or code, supply both times; the range must not exceed 31 days or start more than one year ago.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_records_list.",
      {
        _client_info: fields._client_info,
        end_time: fields.end_time,
        is_compact: fields.is_compact,
        meeting_code: fields.meeting_code,
        meeting_id: fields.meeting_id,
        page_size: fields.page_size,
        page_token: fields.page_token,
        start_time: fields.start_time,
        timezone: fields.timezone,
      },
      {
        optional: [
          "_client_info",
          "end_time",
          "is_compact",
          "meeting_code",
          "meeting_id",
          "page_size",
          "page_token",
          "start_time",
          "timezone",
        ],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_record_addresses",
    operationType: "read",
    description:
      "Get recording download URLs. Return the URLs without downloading the media. A permission failure does not automatically submit an access request.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_record_addresses.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_record_id: fields.meeting_record_id,
        page_size: fields.page_size,
        page_token: fields.page_token,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "page_size", "page_token", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_transcripts_paragraphs",
    operationType: "read",
    description:
      "Get transcript paragraph identifiers for a recording file. Use get_transcripts_details to retrieve the text.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_transcripts_paragraphs.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        record_file_id: fields.record_file_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_transcripts_details",
    operationType: "read",
    description:
      "Get transcript text starting at a paragraph ID returned by get_transcripts_paragraphs. Omit limit to request all remaining paragraphs.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_transcripts_details.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        limit: fields.limit,
        meeting_id: fields.meeting_id,
        pid: fields.pid,
        record_file_id: fields.record_file_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "limit", "meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "search_transcripts",
    operationType: "read",
    description:
      "Search a recording transcript using the upstream text parameter. Preserve the keyword encoding required by the current tool schema.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for search_transcripts.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        record_file_id: fields.record_file_id,
        text: fields.text,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "get_smart_minutes",
    operationType: "read",
    description:
      "Get AI meeting minutes, optionally translated into a supported language. Supply the recording file ID, not the meeting recording ID.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for get_smart_minutes.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        lang: fields.lang,
        pwd: fields.pwd,
        record_file_id: fields.record_file_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "lang", "pwd", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "apply_record_permission_prepare",
    operationType: "read",
    description:
      "Preview a recording-access request. Show the meeting, owner, applicant, and requested permission to the user before submitting.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for apply_record_permission_prepare.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        meeting_record_id: fields.meeting_record_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "apply_record_permission_commit",
    operationType: "write",
    description:
      "Submit a recording-access request only after prepare has displayed the preview and the user has explicitly confirmed. Use the same meeting_record_id; refresh an expired preview first.",
    requiredScopes: [],
    inputSchema: s.object(
      "Arguments for apply_record_permission_commit.",
      {
        _client_info: fields._client_info,
        is_compact: fields.is_compact,
        meeting_id: fields.meeting_id,
        meeting_record_id: fields.meeting_record_id,
        timezone: fields.timezone,
      },
      { optional: ["_client_info", "is_compact", "meeting_id", "timezone"] },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction(service, {
    name: "list_tools",
    operationType: "read",
    description:
      "Discover current Tencent Meeting MCP tools and their live schemas, including capabilities not exposed as dedicated actions.",
    requiredScopes: [],
    inputSchema: s.requiredObject("No input is required.", {}),
    outputSchema: s.requiredObject("Current MCP catalog.", {
      tools: s.array(
        "Available tool definitions.",
        s.looseObject("Official tool name, description, inputSchema, optional outputSchema, and annotations."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "call_tool",
    operationType: "destructive",
    description:
      "Call a tool discovered by list_tools using its current argument schema. This can modify or delete business data. Confirm meeting changes and cancellations with the user. Preview recording-access requests with apply_record_permission_prepare and obtain user confirmation before commit. Submit feedback only with explicit consent. Async tools may require get_job_result.",
    requiredScopes: [],
    inputSchema: s.object(
      "Call a discovered MCP tool.",
      {
        toolName: s.nonEmptyString("Exact tool name from list_tools."),
        arguments: s.looseObject("Arguments matching the live tool schema; explicit _client_info is preserved."),
      },
      { optional: ["arguments"] },
    ),
    outputSchema: resultSchema,
  }),
];
