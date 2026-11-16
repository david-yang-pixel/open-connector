import type { ActionDefinition, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import * as schemas from "./schemas.ts";
const actionLifecycles: Record<string, ActionDefinition["asyncLifecycle"]> = {
  place_call: { startActionId: "saperly.place_call", statusActionId: "saperly.get_call" },
  create_custom_voice: { startActionId: "saperly.create_custom_voice", statusActionId: "saperly.get_custom_voice" },
};
export interface SaperlyEndpoint {
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  pathKeys: string[];
  queryKeys: string[];
  outputKind: "object" | "list" | "recording" | "transcript";
  operationType: ActionDefinition["operationType"];
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}
const saperlyEndpoints: SaperlyEndpoint[] = [
  {
    name: "health",
    method: "GET",
    path: "/health",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "read",
    description: "Liveness probe",
    inputSchema: s.object("Parameters for health.", {}, { required: [] }),
    outputSchema: schemas.healthOutput,
  },
  {
    name: "list_workspace_members",
    method: "GET",
    path: "/workspaces/{slug}/members",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the workspace members",
    inputSchema: s.object(
      "Parameters for list workspace members.",
      {
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
      },
      { required: ["slug"] },
    ),
    outputSchema: schemas.listWorkspaceMembersOutput,
  },
  {
    name: "list_workspace_keys",
    method: "GET",
    path: "/workspaces/{slug}/api-tokens",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the workspace API tokens",
    inputSchema: s.object(
      "Parameters for list workspace keys.",
      {
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
      },
      { required: ["slug"] },
    ),
    outputSchema: schemas.listWorkspaceKeysOutput,
  },
  {
    name: "create_workspace_key",
    method: "POST",
    path: "/workspaces/{slug}/api-tokens",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Create a scoped API token",
    inputSchema: s.object(
      "Parameters for create workspace key.",
      {
        name: s.string("Human-readable name.", { minLength: 1, maxLength: 100 }),
        scopes: s.array("Granted API key scopes.", s.stringEnum("Scopes item.", ["read", "write", "admin"]), {
          minItems: 1,
          maxItems: 3,
        }),
        numberScope: s.nullable(
          s.array(
            "Phone number allow-list; null or empty means all numbers within the parent grant.",
            s.string("Number scope item."),
          ),
        ),
        spendLimitCents: s.nullable(s.number("Per-key spending cap in cents.", { minimum: 1 })),
        spendLimitResetPeriod: s.nullable(s.stringEnum("Monthly reset or null for a lifetime cap.", ["monthly"])),
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["name", "scopes", "slug"] },
    ),
    outputSchema: schemas.createWorkspaceKeyOutput,
  },
  {
    name: "list_workspace_webhooks",
    method: "GET",
    path: "/workspaces/{slug}/webhooks",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the workspace webhook endpoints",
    inputSchema: s.object(
      "Parameters for list workspace webhooks.",
      {
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
      },
      { required: ["slug"] },
    ),
    outputSchema: schemas.listWorkspaceWebhooksOutput,
  },
  {
    name: "create_workspace_webhook",
    method: "POST",
    path: "/workspaces/{slug}/webhooks",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Create a webhook endpoint",
    inputSchema: s.object(
      "Parameters for create workspace webhook.",
      {
        url: s.string("The HTTPS URL Saperly will POST each subscribed event to.", {
          minLength: 1,
          maxLength: 2048,
        }),
        events: s.array(
          "The event types this endpoint subscribes to (e.g. `call.completed`, `message.received`). At least one.",
          s.string("Events item."),
          { minItems: 1 },
        ),
        description: s.nullable(s.string("An optional human label for the endpoint.", { maxLength: 500 })),
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["url", "events", "slug"] },
    ),
    outputSchema: schemas.createWorkspaceWebhookOutput,
  },
  {
    name: "list_webhook_deliveries",
    method: "GET",
    path: "/workspaces/{slug}/webhooks/{webhookId}/deliveries",
    pathKeys: ["slug", "webhookId"],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List a webhook endpoint's recent delivery attempts",
    inputSchema: s.object(
      "Parameters for list webhook deliveries.",
      {
        slug: s.string("The URL-safe slug identifying the workspace.", { minLength: 1 }),
        webhookId: s.string("The id of the webhook endpoint whose delivery history to read.", {
          minLength: 1,
        }),
      },
      { required: ["slug", "webhookId"] },
    ),
    outputSchema: schemas.listWebhookDeliveriesOutput,
  },
  {
    name: "list_workspace_audit_events",
    method: "GET",
    path: "/workspaces/{slug}/audit-events",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the workspace audit-log events",
    inputSchema: s.object(
      "Parameters for list workspace audit events.",
      {
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
      },
      { required: ["slug"] },
    ),
    outputSchema: schemas.listWorkspaceAuditEventsOutput,
  },
  {
    name: "revoke_workspace_key",
    method: "POST",
    path: "/workspaces/{slug}/api-tokens/{tokenId}/revoke",
    pathKeys: ["slug", "tokenId"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Revoke an API token",
    inputSchema: s.object(
      "Parameters for revoke workspace key.",
      {
        slug: s.string("The URL-safe slug identifying the workspace.", { minLength: 1 }),
        tokenId: s.string("The id of the API token to revoke.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["slug", "tokenId"] },
    ),
    outputSchema: schemas.revokeWorkspaceKeyOutput,
  },
  {
    name: "send_workspace_invitation",
    method: "POST",
    path: "/workspaces/{slug}/invitations",
    pathKeys: ["slug"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Invite a member by email",
    inputSchema: s.object(
      "Parameters for send workspace invitation.",
      {
        to: s.string("The email address to send the workspace invitation to.", {
          minLength: 3,
          maxLength: 320,
          pattern: "^[^\\s@]+@[^\\s@]+$",
        }),
        slug: s.string("The workspace's URL slug.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["to", "slug"] },
    ),
    outputSchema: schemas.sendWorkspaceInvitationOutput,
  },
  {
    name: "ask_assistant",
    method: "POST",
    path: "/assistant/answer",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Ask the workspace assistant a question; the assistant may use workspace tools.",
    inputSchema: s.object(
      "Parameters for ask assistant.",
      {
        workspaceSlug: s.string("Workspace URL slug.", { minLength: 1, maxLength: 100 }),
        question: s.string("Question for the workspace assistant.", {
          minLength: 1,
          maxLength: 2000,
        }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["workspaceSlug", "question"] },
    ),
    outputSchema: schemas.askAssistantOutput,
  },
  {
    name: "list_numbers",
    method: "GET",
    path: "/numbers",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List all phone numbers in the workspace",
    inputSchema: s.object("Parameters for list numbers.", {}, { required: [] }),
    outputSchema: schemas.listNumbersOutput,
  },
  {
    name: "provision_number",
    method: "POST",
    path: "/numbers",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Provision a phone number",
    inputSchema: s.object(
      "Parameters for provision number.",
      {
        country: s.nullable(
          s.string("ISO 3166-1 alpha-2 country code to provision a number in (e.g. `US`, `GB`). Defaults to `US`."),
        ),
        numberType: s.nullable(
          s.string(
            "The kind of number to provision (e.g. `local`, `toll_free`, `mobile`, `national`). Defaults to `local`.",
          ),
        ),
        areaCode: s.nullable(
          s.string(
            "Preferred area code / city prefix to search within the country (e.g. `415`). Omit to take any available number.",
          ),
        ),
        expectedMonthlyPriceCents: s.nullable(
          s.number(
            "The monthly price (in cents) you quoted to the customer. If the live order price exceeds it, provision fails with `PriceChanged` instead of charging \u2014 resubmit with `approveHigherPrice: true` to accept the higher price.",
          ),
        ),
        expectedUpfrontPriceCents: s.nullable(
          s.number(
            "The one-time upfront price (in cents) you quoted to the customer. If the live order price exceeds it, provision fails with `PriceChanged` instead of charging \u2014 resubmit with `approveHigherPrice: true` to accept the higher price.",
          ),
        ),
        approveHigherPrice: s.nullable(
          s.boolean(
            "Set true to accept a live order price higher than the `expected*` values you quoted, instead of failing with `PriceChanged`.",
          ),
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: [] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "get_number",
    method: "GET",
    path: "/numbers/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "read",
    description: "Get a phone number by id",
    inputSchema: s.object(
      "Parameters for get number.",
      {
        id: s.string("The phone number's id.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "release_number",
    method: "POST",
    path: "/numbers/{id}/release",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Release a phone number",
    inputSchema: s.object(
      "Parameters for release number.",
      {
        id: s.string("The phone number's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.releaseNumberOutput,
  },
  {
    name: "assign_connection",
    method: "POST",
    path: "/numbers/{id}/connection",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Bind a connection to a number",
    inputSchema: s.object(
      "Parameters for assign connection.",
      {
        connectionId: s.string(
          "The id of the connection to bind to this number. The connection becomes the handler that answers calls and messages on the line.",
        ),
        id: s.string("The phone number's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["connectionId", "id"] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "set_number_webhook",
    method: "POST",
    path: "/numbers/{id}/webhook",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Set a number's manual-mode brain URL",
    inputSchema: s.object(
      "Parameters for set number webhook.",
      {
        url: s.string(
          "The per-number MANUAL-mode brain URL: a public `https://` endpoint Saperly POSTs each conversation turn to for a manual-mode line, as a fallback when the connection has no `manualWebhookUrl` and no live agent socket. This is NOT for receiving call/SMS event notifications \u2014 for those, register a workspace webhook endpoint (`POST /workspaces/:slug/webhooks`).",
        ),
        id: s.string("The phone number's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["url", "id"] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "set_sms_sender",
    method: "POST",
    path: "/numbers/{id}/sms-sender",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Set the alphanumeric SMS sender id",
    inputSchema: s.object(
      "Parameters for set sms sender.",
      {
        smsSenderId: s.nullable(
          s.string(
            "Alphanumeric sender id (1\u201311 alphanumeric characters) to present on international SMS, or `null` to clear the override and send from the phone number itself.",
          ),
        ),
        id: s.string("The phone number's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["smsSenderId", "id"] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "set_caller_id",
    method: "POST",
    path: "/numbers/{id}/caller-id",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Set the outbound caller ID name (CNAM)",
    inputSchema: s.object(
      "Parameters for set caller id.",
      {
        callerIdName: s.nullable(
          s.string(
            "Outbound caller ID name (1\u201315 letters, digits, or spaces) registered as the line's CNAM listing, or `null` to clear it and show the bare number.",
          ),
        ),
        id: s.string("The phone number's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["callerIdName", "id"] },
    ),
    outputSchema: schemas.provisionNumberOutput,
  },
  {
    name: "list_connections",
    method: "GET",
    path: "/connections",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List all connections in the workspace",
    inputSchema: s.object("Parameters for list connections.", {}, { required: [] }),
    outputSchema: schemas.listConnectionsOutput,
  },
  {
    name: "create_connection",
    method: "POST",
    path: "/connections",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Create a connection (provisions inline)",
    inputSchema: s.object(
      "Parameters for create connection.",
      {
        name: s.string("A human-readable name for the connection (1\u2013120 characters).", {
          minLength: 1,
          maxLength: 120,
        }),
        mode: s.nullable(
          s.stringEnum(
            "How the line is handled. 'hosted' (default): an in-network voice assistant (cascade STT \u2192 LLM \u2192 TTS) is the brain. 'manual': your own LLM is the brain \u2014 Saperly forwards text turns and executes the directives you return. Audio stays in-network in both modes.",
            ["hosted", "manual"],
          ),
        ),
        backend: s.nullable(
          s.stringEnum(
            "The hosted brain backend. Today only 'network' (an in-network voice assistant) is available; 'openai_realtime' is disabled and rejected on create/update.",
            ["network", "openai_realtime"],
          ),
        ),
        instructions: s.nullable(
          s.string(
            "The system prompt that defines the assistant's behavior. Put any opening line here \u2014 there is no separate greeting field.",
          ),
        ),
        llm: s.nullable(
          s.object(
            "The model the hosted assistant runs. Omit to use the managed default. Hosted mode only.",
            {
              kind: s.stringEnum("Always 'managed' \u2014 the hosted assistant runs the model in-network.", [
                "managed",
              ]),
              model: s.string('The in-network managed model the hosted assistant runs, e.g. "openai/gpt-4o".'),
            },
            { required: ["kind", "model"] },
          ),
        ),
        tts: s.nullable(
          s.object(
            'The hosted assistant\'s text-to-speech voice. Omit `tts` to use the managed default voice; otherwise `{ "voiceId": "<id from GET /voices>" }` is enough.',
            {
              provider: s.nullable(
                s.string(
                  "The text-to-speech provider. Optional \u2014 defaults to the in-network provider, which is all you normally need.",
                ),
              ),
              voiceId: s.string(
                "The voice the hosted assistant speaks with. Use an `id` returned by `GET /voices` (optionally filtered by `?language=`). Hosted mode only.",
              ),
            },
            { required: ["voiceId"] },
          ),
        ),
        backgroundAudio: s.anyOf("Background audio.", [
          s.object(
            "Background audio.",
            {
              type: s.stringEnum("Configuration type.", ["off"]),
            },
            { required: ["type"] },
          ),
          s.object(
            "Background audio.",
            {
              type: s.stringEnum("Configuration type.", ["office"]),
              volume: s.number("Office background audio volume."),
            },
            { required: ["type", "volume"] },
          ),
          s.literal(null, {
            description: "Background audio.",
          }),
        ]),
        language: s.nullable(
          s.string(
            'The spoken language as a BCP-47 tag (e.g. "en", "es", "en-US"). On hosted lines it is the in-network transcription hint \u2014 which language the caller speaks (pair it with a voice that speaks the same language, and instruct the model to reply in it). On manual lines it is the Conversation Relay language, steering in-network transcription AND the spoken voice. Discover the supported set from `GET /languages` (or filter `GET /voices` by language); any well-formed tag is accepted. Send "" to clear it (auto-detect).',
          ),
        ),
        mcpServers: s.nullable(
          s.array(
            "MCP servers the hosted assistant may call as tools during a conversation. Hosted mode only.",
            s.object(
              "A Model Context Protocol server the hosted assistant may call as tools mid-conversation. Hosted mode only.",
              {
                url: s.string(
                  "Public `https://` URL of your streamable-HTTP MCP server (commonly ending in `/mcp`). SSE-only servers are not supported.",
                ),
                auth: s.nullable(
                  s.object(
                    "How Saperly authenticates to your MCP server. Use { type: 'none' } (or omit `auth`) for an open server.",
                    {
                      type: s.stringEnum("Configuration type.", ["bearer", "none"]),
                      token: s.nullable(
                        s.string(
                          "Bearer token sent as `Authorization: Bearer <token>` on every request to your server. Required when `type` is 'bearer'; stored encrypted and never returned in reads.",
                        ),
                      ),
                    },
                    { required: ["type"] },
                  ),
                ),
                allowedTools: s.nullable(
                  s.array(
                    "Allow-list of tool names to expose to the assistant. Omit to expose every tool the server advertises.",
                    s.string("Allowed tools item."),
                  ),
                ),
              },
              { required: ["url"] },
            ),
          ),
        ),
        callControl: s.nullable(
          s.object(
            "Which call-control actions the connection's brain may take, projected to whichever backend handles the call. Omitted fields fall back to defaults (end-call + DTMF on, transfer off).",
            {
              endCall: s.nullable(s.boolean("Allow the brain to hang up the call. Defaults on.")),
              sendDtmf: s.nullable(s.boolean("Allow the brain to send DTMF (touch-tone) digits. Defaults on.")),
              transfer: s.nullable(
                s.object(
                  "Blind-transfer enablement and its allowed targets.",
                  {
                    targets: s.array(
                      "Allowed blind-transfer destinations (E.164 numbers or `sip:` URIs). Transfer only takes effect with at least one target.",
                      s.string("Targets item."),
                    ),
                    from: s.nullable(s.string("Optional caller ID to present on the transferred leg.")),
                  },
                  { required: ["targets"] },
                ),
              ),
            },
            { required: [] },
          ),
        ),
        complianceEnabled: s.nullable(
          s.boolean(
            "When true (the default), the do-not-message tool is exposed and `disclosure` is spoken as the line's first, uninterruptible utterance (the TCPA notice). When on with no `disclosure`, a standard org-named default is filled in.",
          ),
        ),
        smsAutoReply: s.nullable(
          s.boolean(
            "Hosted-line opt-in to auto-answer inbound SMS with the model. Defaults off. (Manual lines forward to their webhook brain regardless.)",
          ),
        ),
        disclosure: s.nullable(
          s.string(
            "The TCPA notice spoken first, uninterruptibly, when `complianceEnabled` is on. Leave empty with compliance on and Saperly fills a standard org-named default.",
          ),
        ),
        openaiRealtime: s.nullable(
          s.object(
            "Config for the OpenAI-Realtime hosted backend. Only meaningful when `backend` is 'openai_realtime' (currently disabled). The OpenAI project is operator-hosted and not settable here.",
            {
              model: s.string("The OpenAI Realtime model id."),
              voice: s.nullable(
                s.string(
                  "The OpenAI Realtime voice. Distinct from the hosted `tts.voiceId` \u2014 this names a built-in OpenAI Realtime voice.",
                ),
              ),
            },
            { required: ["model"] },
          ),
        ),
        manualWebhookUrl: s.nullable(
          s.string(
            'Manual-mode webhook-brain URL: where Saperly POSTs each turn (signed with the connection\'s `manualSecret`) when no live agent socket is connected. Only meaningful for manual mode; send "" to clear it.',
          ),
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["name"] },
    ),
    outputSchema: schemas.createConnectionOutput,
  },
  {
    name: "get_connection",
    method: "GET",
    path: "/connections/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "read",
    description: "Get a connection by id",
    inputSchema: s.object(
      "Parameters for get connection.",
      {
        id: s.string("The connection's id.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.createConnectionOutput,
  },
  {
    name: "update_connection",
    method: "PATCH",
    path: "/connections/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Update a connection (re-syncs the carrier)",
    inputSchema: s.object(
      "Parameters for update connection.",
      {
        name: s.nullable(
          s.string("A human-readable name for the connection (1\u2013120 characters).", {
            minLength: 1,
            maxLength: 120,
          }),
        ),
        mode: s.nullable(
          s.stringEnum(
            "How the line is handled. 'hosted' (default): an in-network voice assistant (cascade STT \u2192 LLM \u2192 TTS) is the brain. 'manual': your own LLM is the brain \u2014 Saperly forwards text turns and executes the directives you return. Audio stays in-network in both modes.",
            ["hosted", "manual"],
          ),
        ),
        backend: s.nullable(
          s.stringEnum(
            "The hosted brain backend. Today only 'network' is available; 'openai_realtime' is disabled and rejected.",
            ["network", "openai_realtime"],
          ),
        ),
        instructions: s.nullable(s.string("The system prompt that defines the assistant's behavior.")),
        llm: s.nullable(
          s.object(
            "The model the hosted assistant runs. Omit to use the managed default. Hosted mode only.",
            {
              kind: s.stringEnum("Always 'managed' \u2014 the hosted assistant runs the model in-network.", [
                "managed",
              ]),
              model: s.string('The in-network managed model the hosted assistant runs, e.g. "openai/gpt-4o".'),
            },
            { required: ["kind", "model"] },
          ),
        ),
        tts: s.nullable(
          s.object(
            'The hosted assistant\'s text-to-speech voice. Omit `tts` to use the managed default voice; otherwise `{ "voiceId": "<id from GET /voices>" }` is enough.',
            {
              provider: s.nullable(
                s.string(
                  "The text-to-speech provider. Optional \u2014 defaults to the in-network provider, which is all you normally need.",
                ),
              ),
              voiceId: s.string(
                "The voice the hosted assistant speaks with. Use an `id` returned by `GET /voices` (optionally filtered by `?language=`). Hosted mode only.",
              ),
            },
            { required: ["voiceId"] },
          ),
        ),
        backgroundAudio: s.anyOf("Background audio.", [
          s.object(
            "Background audio.",
            {
              type: s.stringEnum("Configuration type.", ["off"]),
            },
            { required: ["type"] },
          ),
          s.object(
            "Background audio.",
            {
              type: s.stringEnum("Configuration type.", ["office"]),
              volume: s.number("Office background audio volume."),
            },
            { required: ["type", "volume"] },
          ),
          s.literal(null, {
            description: "Background audio.",
          }),
        ]),
        language: s.nullable(
          s.string(
            'The spoken language as a BCP-47 tag (e.g. "en", "es", "en-US"). Hosted: the in-network transcription hint. Manual: the Conversation Relay language (steers in-network transcription + the spoken voice). Discover values from `GET /languages`. Send "" to clear it back to auto-detect.',
          ),
        ),
        mcpServers: s.nullable(
          s.array(
            "Replaces the full set of MCP servers on the connection (send `[]` to clear). Hosted mode only.",
            s.object(
              "A Model Context Protocol server the hosted assistant may call as tools mid-conversation. Hosted mode only.",
              {
                url: s.string(
                  "Public `https://` URL of your streamable-HTTP MCP server (commonly ending in `/mcp`). SSE-only servers are not supported.",
                ),
                auth: s.nullable(
                  s.object(
                    "How Saperly authenticates to your MCP server. Use { type: 'none' } (or omit `auth`) for an open server.",
                    {
                      type: s.stringEnum("Configuration type.", ["bearer", "none"]),
                      token: s.nullable(
                        s.string(
                          "Bearer token sent as `Authorization: Bearer <token>` on every request to your server. Required when `type` is 'bearer'; stored encrypted and never returned in reads.",
                        ),
                      ),
                    },
                    { required: ["type"] },
                  ),
                ),
                allowedTools: s.nullable(
                  s.array(
                    "Allow-list of tool names to expose to the assistant. Omit to expose every tool the server advertises.",
                    s.string("Allowed tools item."),
                  ),
                ),
              },
              { required: ["url"] },
            ),
          ),
        ),
        callControl: s.nullable(
          s.object(
            "Which call-control actions the connection's brain may take, projected to whichever backend handles the call. Omitted fields fall back to defaults (end-call + DTMF on, transfer off).",
            {
              endCall: s.nullable(s.boolean("Allow the brain to hang up the call. Defaults on.")),
              sendDtmf: s.nullable(s.boolean("Allow the brain to send DTMF (touch-tone) digits. Defaults on.")),
              transfer: s.nullable(
                s.object(
                  "Blind-transfer enablement and its allowed targets.",
                  {
                    targets: s.array(
                      "Allowed blind-transfer destinations (E.164 numbers or `sip:` URIs). Transfer only takes effect with at least one target.",
                      s.string("Targets item."),
                    ),
                    from: s.nullable(s.string("Optional caller ID to present on the transferred leg.")),
                  },
                  { required: ["targets"] },
                ),
              ),
            },
            { required: [] },
          ),
        ),
        complianceEnabled: s.nullable(s.boolean("Toggle the do-not-message tool + the TCPA `disclosure` opener.")),
        smsAutoReply: s.nullable(
          s.boolean("Hosted-line opt-in to auto-answer inbound SMS with the model. Default off."),
        ),
        disclosure: s.nullable(s.string("The TCPA notice spoken first, uninterruptibly, when compliance is on.")),
        openaiRealtime: s.nullable(
          s.object(
            "Config for the OpenAI-Realtime hosted backend. Only meaningful when `backend` is 'openai_realtime' (currently disabled). The OpenAI project is operator-hosted and not settable here.",
            {
              model: s.string("The OpenAI Realtime model id."),
              voice: s.nullable(
                s.string(
                  "The OpenAI Realtime voice. Distinct from the hosted `tts.voiceId` \u2014 this names a built-in OpenAI Realtime voice.",
                ),
              ),
            },
            { required: ["model"] },
          ),
        ),
        manualWebhookUrl: s.nullable(
          s.string('Manual-mode webhook-brain URL. Only meaningful for manual mode; send "" to clear it.'),
        ),
        id: s.string("The connection's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.createConnectionOutput,
  },
  {
    name: "delete_connection",
    method: "DELETE",
    path: "/connections/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Delete a connection",
    inputSchema: s.object(
      "Parameters for delete connection.",
      {
        id: s.string("The connection's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.deleteConnectionOutput,
  },
  {
    name: "send_message",
    method: "POST",
    path: "/messages",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Send an SMS message",
    inputSchema: s.object(
      "Parameters for send message.",
      {
        fromNumberId: s.string(
          "The id of one of your numbers to send the SMS from. Must be a number you own; with a scoped key it must also be within the key's number allow-list.",
        ),
        to: s.string("The recipient phone number in E.164 format (e.g. `+14155550123`)."),
        body: s.string(
          "The message text (1\u20131600 characters). Long messages are split into multiple segments automatically and billed per segment.",
          { minLength: 1, maxLength: 1600 },
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["fromNumberId", "to", "body"] },
    ),
    outputSchema: schemas.sendMessageOutput,
  },
  {
    name: "list_messages",
    method: "GET",
    path: "/messages",
    pathKeys: [],
    queryKeys: ["numberId"],
    outputKind: "list",
    operationType: "read",
    description: "List messages (optionally filtered by number)",
    inputSchema: s.object(
      "Parameters for list messages.",
      {
        numberId: s.nullable(
          s.string(
            "Filter to messages sent from or received on this number. Omit to list every message in the workspace.",
          ),
        ),
      },
      { required: [] },
    ),
    outputSchema: schemas.listMessagesOutput,
  },
  {
    name: "place_call",
    method: "POST",
    path: "/calls",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Place an outbound call",
    inputSchema: s.object(
      "Parameters for place call.",
      {
        fromNumberId: s.string("The Saperly number id to place the call from."),
        to: s.string('The destination in E.164 format, e.g. "+15555550123".'),
        connectionId: s.nullable(
          s.string("Optional. Use this connection for the call instead of the number's bound one."),
        ),
        instructions: s.nullable(
          s.string(
            "A per-call system prompt that overrides the connection's saved instructions for this call only. Omit to run the call on the line's saved config. (Voice/model/language are not per-call overridable via the API \u2014 set them on the connection.)",
          ),
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["fromNumberId", "to"] },
    ),
    outputSchema: schemas.placeCallOutput,
  },
  {
    name: "list_calls",
    method: "GET",
    path: "/calls",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List calls",
    inputSchema: s.object("Parameters for list calls.", {}, { required: [] }),
    outputSchema: schemas.listCallsOutput,
  },
  {
    name: "end_call",
    method: "POST",
    path: "/calls/{id}/end",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "End a live call",
    inputSchema: s.object(
      "Parameters for end call.",
      {
        id: s.string("The call's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.placeCallOutput,
  },
  {
    name: "transfer_call",
    method: "POST",
    path: "/calls/{id}/transfer",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Blind-transfer a live call",
    inputSchema: s.object(
      "Parameters for transfer call.",
      {
        to: s.string(
          'Where to blind-transfer the live leg \u2014 an E.164 number (e.g. "+15551230000") or a `sip:` URI.',
        ),
        id: s.string("The call's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["to", "id"] },
    ),
    outputSchema: schemas.placeCallOutput,
  },
  {
    name: "get_call",
    method: "GET",
    path: "/calls/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "read",
    description: "Get a call by id",
    inputSchema: s.object(
      "Parameters for get call.",
      {
        id: s.string("The call's id.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.placeCallOutput,
  },
  {
    name: "get_recording",
    method: "GET",
    path: "/calls/{id}/recording",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "recording",
    operationType: "read",
    description: "Get a temporary download URL for a completed call recording.",
    inputSchema: s.object(
      "Parameters for get recording.",
      {
        id: s.string("The call's id.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.getRecordingOutput,
  },
  {
    name: "get_transcript",
    method: "GET",
    path: "/calls/{id}/transcript",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "transcript",
    operationType: "read",
    description: "Get a call transcript",
    inputSchema: s.object(
      "Parameters for get transcript.",
      {
        id: s.string("The call's id.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.getTranscriptOutput,
  },
  {
    name: "list_voices",
    method: "GET",
    path: "/voices",
    pathKeys: [],
    queryKeys: ["language"],
    outputKind: "list",
    operationType: "read",
    description: "List available voices (optionally filtered by language)",
    inputSchema: s.object(
      "Parameters for list voices.",
      {
        language: s.nullable(
          s.string(
            'Filter voices by language \u2014 a case-insensitive BCP-47 prefix. "en" matches "en", "en-US", "en-GB", \u2026 Omit to list every voice.',
          ),
        ),
      },
      { required: [] },
    ),
    outputSchema: schemas.listVoicesOutput,
  },
  {
    name: "list_custom_voices",
    method: "GET",
    path: "/custom-voices",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List custom voices",
    inputSchema: s.object("Parameters for list custom voices.", {}, { required: [] }),
    outputSchema: schemas.listCustomVoicesOutput,
  },
  {
    name: "create_custom_voice",
    method: "POST",
    path: "/custom-voices",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Upload a voice sample from a public URL; poll get_custom_voice until the voice is active or failed.",
    inputSchema: s.object(
      "Parameters for create custom voice.",
      {
        name: s.string("Human-readable name."),
        language: s.string("Spoken language code."),
        gender: s.stringEnum("Voice gender.", ["male", "female", "neutral"]),
        audioUrl: s.string("Public URL of a voice sample to download and upload; connector limit is 20 MiB.", {
          format: "uri",
        }),
        fileName: s.string("Audio filename with an extension matching the sample format.", {
          minLength: 1,
        }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["name", "language", "gender", "audioUrl", "idempotencyKey"] },
    ),
    outputSchema: schemas.createCustomVoiceOutput,
  },
  {
    name: "get_custom_voice",
    method: "GET",
    path: "/custom-voices/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "read",
    description: "Get custom voice",
    inputSchema: s.object(
      "Parameters for get custom voice.",
      {
        id: s.string("Resource identifier.", { minLength: 1 }),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.createCustomVoiceOutput,
  },
  {
    name: "delete_custom_voice",
    method: "DELETE",
    path: "/custom-voices/{id}",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Delete custom voice",
    inputSchema: s.object(
      "Parameters for delete custom voice.",
      {
        id: s.string("Resource identifier.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.deleteConnectionOutput,
  },
  {
    name: "list_languages",
    method: "GET",
    path: "/languages",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the supported spoken languages",
    inputSchema: s.object("Parameters for list languages.", {}, { required: [] }),
    outputSchema: schemas.listLanguagesOutput,
  },
  {
    name: "get_usage",
    method: "GET",
    path: "/usage",
    pathKeys: [],
    queryKeys: ["since"],
    outputKind: "object",
    operationType: "read",
    description: "Get a usage summary (optionally since a timestamp)",
    inputSchema: s.object(
      "Parameters for get usage.",
      {
        since: s.nullable(
          s.string(
            "Lower bound of the reporting window as an ISO-8601 timestamp (e.g. `2026-01-01T00:00:00Z`). Only usage at or after this instant is counted. Omit for all-time totals.",
          ),
        ),
      },
      { required: [] },
    ),
    outputSchema: schemas.getUsageOutput,
  },
  {
    name: "list_consent",
    method: "GET",
    path: "/consent",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List all consent records in the workspace",
    inputSchema: s.object("Parameters for list consent.", {}, { required: [] }),
    outputSchema: schemas.listConsentOutput,
  },
  {
    name: "record_consent",
    method: "POST",
    path: "/consent",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Record consent for a contact",
    inputSchema: s.object(
      "Parameters for record consent.",
      {
        numberId: s.string("The id of your number the consent is scoped to."),
        peerNumber: s.string(
          "The contact phone number, in E.164 format (e.g. `+14155550123`), that the consent applies to.",
        ),
        consentType: s.stringEnum(
          "How consent was obtained: `implied_inbound` (the contact messaged you first) or `explicit_outbound` (the contact explicitly agreed to be contacted).",
          ["implied_inbound", "explicit_outbound"],
        ),
        source: s.string(
          'A free-text note recording where or how consent was captured, kept for your audit trail (e.g. "web signup form").',
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["numberId", "peerNumber", "consentType", "source"] },
    ),
    outputSchema: schemas.recordConsentOutput,
  },
  {
    name: "revoke_consent",
    method: "POST",
    path: "/consent/revoke",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Revoke consent for a contact",
    inputSchema: s.object(
      "Parameters for revoke consent.",
      {
        numberId: s.string("The id of your number the consent to revoke is scoped to."),
        peerNumber: s.string(
          "The contact phone number, in E.164 format (e.g. `+14155550123`), whose consent should be revoked.",
        ),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["numberId", "peerNumber"] },
    ),
    outputSchema: schemas.revokeWorkspaceKeyOutput,
  },
  {
    name: "check_consent",
    method: "GET",
    path: "/consent/check",
    pathKeys: [],
    queryKeys: ["numberId", "peerNumber"],
    outputKind: "object",
    operationType: "read",
    description: "Check whether a contact has active consent",
    inputSchema: s.object(
      "Parameters for check consent.",
      {
        numberId: s.string("The id of your number to check consent against."),
        peerNumber: s.string(
          "The contact phone number, in E.164 format (e.g. `+14155550123`), to check for active consent.",
        ),
      },
      { required: ["numberId", "peerNumber"] },
    ),
    outputSchema: schemas.checkConsentOutput,
  },
  {
    name: "get_price_quote",
    method: "GET",
    path: "/pricing/quote",
    pathKeys: [],
    queryKeys: ["country", "numberType"],
    outputKind: "object",
    operationType: "read",
    description: "Quote the price of a phone number",
    inputSchema: s.object(
      "Parameters for get price quote.",
      {
        country: s.string("ISO 3166-1 alpha-2 country code to price a number in (e.g. `US`, `GB`)."),
        numberType: s.string("The kind of number to price (e.g. `local`, `toll_free`, `mobile`, `national`)."),
      },
      { required: ["country", "numberType"] },
    ),
    outputSchema: schemas.getPriceQuoteOutput,
  },
  {
    name: "list_keys",
    method: "GET",
    path: "/api-tokens",
    pathKeys: [],
    queryKeys: [],
    outputKind: "list",
    operationType: "read",
    description: "List the workspace's API keys",
    inputSchema: s.object("Parameters for list keys.", {}, { required: [] }),
    outputSchema: schemas.listWorkspaceKeysOutput,
  },
  {
    name: "mint_key",
    method: "POST",
    path: "/api-tokens",
    pathKeys: [],
    queryKeys: [],
    outputKind: "object",
    operationType: "write",
    description: "Mint a scoped API key",
    inputSchema: s.object(
      "Parameters for mint key.",
      {
        name: s.string("Human-readable name.", { minLength: 1, maxLength: 100 }),
        scopes: s.array("Granted API key scopes.", s.stringEnum("Scopes item.", ["read", "write", "admin"]), {
          minItems: 1,
          maxItems: 3,
        }),
        numberScope: s.nullable(
          s.array(
            "Phone number allow-list; null or empty means all numbers within the parent grant.",
            s.string("Number scope item."),
          ),
        ),
        spendLimitCents: s.nullable(s.number("Per-key spending cap in cents.", { minimum: 1 })),
        spendLimitResetPeriod: s.nullable(s.stringEnum("Monthly reset or null for a lifetime cap.", ["monthly"])),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["name", "scopes"] },
    ),
    outputSchema: schemas.createWorkspaceKeyOutput,
  },
  {
    name: "revoke_key",
    method: "POST",
    path: "/api-tokens/{id}/revoke",
    pathKeys: ["id"],
    queryKeys: [],
    outputKind: "object",
    operationType: "destructive",
    description: "Revoke an API key",
    inputSchema: s.object(
      "Parameters for revoke key.",
      {
        id: s.string("The API key's id.", { minLength: 1 }),
        idempotencyKey: s.string(
          "Caller-supplied stable idempotency key. Use a UUID v4 and reuse it for retries of the same request.",
          { minLength: 1 },
        ),
      },
      { required: ["id"] },
    ),
    outputSchema: schemas.revokeWorkspaceKeyOutput,
  },
];
export const saperlyActions: ActionDefinition[] = saperlyEndpoints.map((endpoint) =>
  defineProviderAction("saperly", {
    name: endpoint.name,
    description: endpoint.description,
    operationType: endpoint.operationType,
    requiredScopes: [],
    inputSchema: endpoint.inputSchema,
    outputSchema: endpoint.outputSchema,
    asyncLifecycle: actionLifecycles[endpoint.name],
  }),
);
export const saperlyEndpointByName: Map<string, (typeof saperlyEndpoints)[number]> = new Map(
  saperlyEndpoints.map((endpoint) => [endpoint.name, endpoint]),
);
