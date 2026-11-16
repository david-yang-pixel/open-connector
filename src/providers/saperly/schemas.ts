import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const healthOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    status: s.stringEnum("Resource status.", ["ok"]),
  },
  {
    required: ["status"],
    additionalProperties: true,
  },
);
export const listWorkspaceMembersOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          name: s.string("Human-readable name."),
          email: s.string("Email."),
          image: s.nullable(s.string("Image.")),
          role: s.stringEnum("Role.", ["owner", "admin", "member"]),
          systemRole: s.stringEnum("System role.", ["admin", "user"]),
        },
        {
          required: ["id", "name", "email", "image", "role", "systemRole"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const listWorkspaceKeysOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          name: s.string("Human-readable name."),
          token: s.string("API key secret."),
          prefix: s.string("Key prefix."),
          scopes: s.array("Granted API key scopes.", s.stringEnum("Scopes item.", ["read", "write", "admin"])),
          lastUsedAt: s.nullable(s.string("Last used at.")),
          createdAt: s.string("Created at."),
          numberScope: s.nullable(
            s.array(
              "Phone number allow-list; null or empty means all numbers within the parent grant.",
              s.string("Number scope item."),
            ),
          ),
          spendLimitCents: s.nullable(s.number("Per-key spending cap in cents.")),
          spendLimitResetPeriod: s.nullable(s.stringEnum("Monthly reset or null for a lifetime cap.", ["monthly"])),
          spentThisPeriodCents: s.nullable(s.number("Spent this period cents.")),
          canProvisionKeys: s.nullable(s.boolean("Can provision keys.")),
          permissions: s.nullable(s.array("Permissions.", s.string("Permissions item."))),
          mintedByTokenId: s.nullable(s.string("Minted by token id.")),
        },
        {
          required: ["id", "name", "token", "prefix", "scopes", "lastUsedAt", "createdAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const createWorkspaceKeyOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    name: s.string("Human-readable name."),
    prefix: s.string("Key prefix."),
    scopes: s.array("Granted API key scopes.", s.stringEnum("Scopes item.", ["read", "write", "admin"])),
    lastUsedAt: s.nullable(s.string("Last used at.")),
    createdAt: s.string("Created at."),
    token: s.string("API key secret."),
  },
  {
    required: ["id", "name", "prefix", "scopes", "lastUsedAt", "createdAt", "token"],
    additionalProperties: true,
  },
);
export const listWorkspaceWebhooksOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          url: s.string("The HTTPS URL Saperly POSTs each subscribed event to."),
          enabled: s.boolean("Enabled."),
          events: s.array("The event types this endpoint is subscribed to.", s.string("Events item.")),
          successRate: s.number(
            "Delivery success rate (0\u2013100) over all recorded attempts for this endpoint; 100 when there are none yet.",
          ),
          signingSecret: s.string(
            "The endpoint signing secret (`whsec_\u2026`). Verify each delivery by recomputing HMAC-SHA256 over `${x-saperly-timestamp}.${rawBody}` and comparing (constant-time) against the hex in the `x-saperly-signature: v1=<hex>` header.",
          ),
        },
        {
          required: ["id", "url", "enabled", "events", "successRate", "signingSecret"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const createWorkspaceWebhookOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    url: s.string("The HTTPS URL Saperly POSTs each subscribed event to."),
    enabled: s.boolean("Enabled."),
    events: s.array("The event types this endpoint is subscribed to.", s.string("Events item.")),
    successRate: s.number(
      "Delivery success rate (0\u2013100) over all recorded attempts for this endpoint; 100 when there are none yet.",
    ),
    signingSecret: s.string(
      "The endpoint signing secret (`whsec_\u2026`). Verify each delivery by recomputing HMAC-SHA256 over `${x-saperly-timestamp}.${rawBody}` and comparing (constant-time) against the hex in the `x-saperly-signature: v1=<hex>` header.",
    ),
  },
  {
    required: ["id", "url", "enabled", "events", "successRate", "signingSecret"],
    additionalProperties: true,
  },
);
export const listWebhookDeliveriesOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          eventType: s.string("The event type that was delivered (e.g. `call.completed`)."),
          status: s.string("The attempt outcome: `delivered` (a 2xx) or `failed`."),
          attempts: s.number("The global attempt number: 1 for the inline first attempt, \u22652 for a queued retry."),
          responseStatus: s.nullable(
            s.number(
              "The HTTP status the receiver returned, or `null`/`0` when the request never got one (DNS/TLS/timeout \u2014 e.g. 530 = the receiver's origin/tunnel is unreachable).",
            ),
          ),
          lastAttemptAt: s.nullable(s.string("ISO timestamp of this attempt.")),
          nextAttemptAt: s.nullable(
            s.string("ISO timestamp of the next scheduled retry, or `null` when none is pending."),
          ),
        },
        {
          required: ["id", "eventType", "status", "attempts", "responseStatus", "lastAttemptAt", "nextAttemptAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const listWorkspaceAuditEventsOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          eventType: s.string("Event type."),
          targetType: s.string("Target type."),
          actor: s.string("Actor."),
          createdAt: s.string("Created at."),
        },
        {
          required: ["id", "eventType", "targetType", "actor", "createdAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const revokeWorkspaceKeyOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    status: s.stringEnum("Resource status.", ["revoked"]),
  },
  {
    required: ["status"],
    additionalProperties: true,
  },
);
export const sendWorkspaceInvitationOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    status: s.stringEnum("Resource status.", ["queued"]),
    delivery: s.unknown("Delivery."),
  },
  {
    required: ["status", "delivery"],
    additionalProperties: true,
  },
);
export const askAssistantOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    answer: s.string("Answer."),
    provider: s.stringEnum("Provider.", ["workers-ai", "openai-compatible", "mock"]),
    modelId: s.string("Model id."),
    usedTools: s.array("Used tools.", s.string("Used tools item.")),
    assistantConfigured: s.boolean("Assistant configured."),
  },
  {
    required: ["answer", "provider", "modelId", "usedTools", "assistantConfigured"],
    additionalProperties: true,
  },
);
export const listNumbersOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          phoneNumber: s.string("Phone number."),
          connectionId: s.nullable(s.string("Connection id.")),
          webhookUrl: s.nullable(s.string("Webhook url.")),
          smsSenderId: s.nullable(s.string("Sms sender id.")),
          callerIdName: s.nullable(s.string("Caller id name.")),
          country: s.nullable(s.string("Country.")),
          numberType: s.nullable(s.string("Number type.")),
          monthlyPriceCents: s.nullable(s.number("Monthly price cents.")),
          currency: s.nullable(s.string("Currency.")),
          nextChargeAt: s.nullable(s.string("Next charge at.")),
          releasedAt: s.nullable(s.string("Released at.")),
          createdAt: s.string("Created at."),
        },
        {
          required: [
            "id",
            "phoneNumber",
            "connectionId",
            "webhookUrl",
            "country",
            "numberType",
            "monthlyPriceCents",
            "currency",
            "nextChargeAt",
            "releasedAt",
            "createdAt",
          ],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const provisionNumberOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    phoneNumber: s.string("Phone number."),
    connectionId: s.nullable(s.string("Connection id.")),
    webhookUrl: s.nullable(s.string("Webhook url.")),
    smsSenderId: s.nullable(s.string("Sms sender id.")),
    callerIdName: s.nullable(s.string("Caller id name.")),
    country: s.nullable(s.string("Country.")),
    numberType: s.nullable(s.string("Number type.")),
    monthlyPriceCents: s.nullable(s.number("Monthly price cents.")),
    currency: s.nullable(s.string("Currency.")),
    nextChargeAt: s.nullable(s.string("Next charge at.")),
    releasedAt: s.nullable(s.string("Released at.")),
    createdAt: s.string("Created at."),
  },
  {
    required: [
      "id",
      "phoneNumber",
      "connectionId",
      "webhookUrl",
      "country",
      "numberType",
      "monthlyPriceCents",
      "currency",
      "nextChargeAt",
      "releasedAt",
      "createdAt",
    ],
    additionalProperties: true,
  },
);
export const releaseNumberOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    status: s.stringEnum("Resource status.", ["released"]),
  },
  {
    required: ["status"],
    additionalProperties: true,
  },
);
export const listConnectionsOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          name: s.string("Human-readable name."),
          mode: s.stringEnum("Mode.", ["hosted", "manual"]),
          instructions: s.string("Instructions."),
          llm: s.nullable(s.looseObject("Llm.", {})),
          backgroundAudio: s.anyOf("Background audio.", [
            s.looseObject("Background audio.", {}),
            s.looseObject("Background audio.", {}),
            s.literal(null, {
              description: "Background audio.",
            }),
          ]),
          language: s.nullable(s.string("Spoken language code.")),
          mcpServers: s.nullable(s.array("Mcp servers.", s.looseObject("Mcp servers item.", {}))),
          callControl: s.nullable(s.looseObject("Call control.", {})),
          complianceEnabled: s.boolean("Compliance enabled."),
          smsAutoReply: s.boolean("Sms auto reply."),
          disclosure: s.string("Disclosure."),
          recordingEnabled: s.boolean("Recording enabled."),
          openaiRealtime: s.nullable(s.looseObject("Openai realtime.", {})),
          manualSecret: s.nullable(s.string("Manual-mode connection secret.")),
          manualWebhookUrl: s.nullable(s.string("Manual webhook url.")),
          createdAt: s.string("Created at."),
          backend: s.stringEnum("Backend.", ["network", "openai_realtime"]),
          tts: s.nullable(s.looseObject("Tts.", {})),
        },
        {
          required: [
            "id",
            "name",
            "mode",
            "instructions",
            "llm",
            "language",
            "mcpServers",
            "callControl",
            "complianceEnabled",
            "smsAutoReply",
            "disclosure",
            "recordingEnabled",
            "openaiRealtime",
            "manualSecret",
            "manualWebhookUrl",
            "createdAt",
            "backend",
            "tts",
          ],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const createConnectionOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    name: s.string("Human-readable name."),
    mode: s.stringEnum("Mode.", ["hosted", "manual"]),
    instructions: s.string("Instructions."),
    llm: s.nullable(
      s.object(
        "Llm.",
        {
          kind: s.stringEnum("Kind.", ["managed"]),
          model: s.string("Model."),
        },
        {
          required: ["kind", "model"],
          additionalProperties: true,
        },
      ),
    ),
    backgroundAudio: s.anyOf("Background audio.", [
      s.object(
        "Background audio.",
        {
          type: s.stringEnum("Configuration type.", ["off"]),
        },
        {
          required: ["type"],
          additionalProperties: true,
        },
      ),
      s.object(
        "Background audio.",
        {
          type: s.stringEnum("Configuration type.", ["office"]),
          volume: s.number("Office background audio volume."),
        },
        {
          required: ["type", "volume"],
          additionalProperties: true,
        },
      ),
      s.literal(null, {
        description: "Background audio.",
      }),
    ]),
    language: s.nullable(s.string("Spoken language code.")),
    mcpServers: s.nullable(
      s.array(
        "Mcp servers.",
        s.object(
          "Mcp servers item.",
          {
            url: s.string("Destination URL."),
            auth: s.nullable(s.looseObject("Auth.", {})),
            allowedTools: s.nullable(s.array("Allowed tools.", s.string("Allowed tools item."))),
          },
          {
            required: ["url"],
            additionalProperties: true,
          },
        ),
      ),
    ),
    callControl: s.nullable(
      s.object(
        "Call control.",
        {
          endCall: s.nullable(s.boolean("End call.")),
          sendDtmf: s.nullable(s.boolean("Send dtmf.")),
          transfer: s.nullable(
            s.object(
              "Transfer.",
              {
                targets: s.array("Targets.", s.string("Targets item.")),
                from: s.nullable(s.string("From.")),
              },
              {
                required: ["targets"],
                additionalProperties: true,
              },
            ),
          ),
        },
        {
          required: [],
          additionalProperties: true,
        },
      ),
    ),
    complianceEnabled: s.boolean("Compliance enabled."),
    smsAutoReply: s.boolean("Sms auto reply."),
    disclosure: s.string("Disclosure."),
    recordingEnabled: s.boolean("Recording enabled."),
    openaiRealtime: s.nullable(
      s.object(
        "Openai realtime.",
        {
          model: s.string("Model."),
          voice: s.nullable(s.string("Voice.")),
        },
        {
          required: ["model"],
          additionalProperties: true,
        },
      ),
    ),
    manualSecret: s.nullable(s.string("Manual-mode connection secret.")),
    manualWebhookUrl: s.nullable(s.string("Manual webhook url.")),
    createdAt: s.string("Created at."),
    backend: s.stringEnum("Backend.", ["network", "openai_realtime"]),
    tts: s.nullable(
      s.object(
        "Tts.",
        {
          voiceId: s.string("Voice id."),
        },
        {
          required: ["voiceId"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: [
      "id",
      "name",
      "mode",
      "instructions",
      "llm",
      "language",
      "mcpServers",
      "callControl",
      "complianceEnabled",
      "smsAutoReply",
      "disclosure",
      "recordingEnabled",
      "openaiRealtime",
      "manualSecret",
      "manualWebhookUrl",
      "createdAt",
      "backend",
      "tts",
    ],
    additionalProperties: true,
  },
);
export const deleteConnectionOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    status: s.stringEnum("Resource status.", ["deleted"]),
  },
  {
    required: ["status"],
    additionalProperties: true,
  },
);
export const sendMessageOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    numberId: s.string("Number id."),
    direction: s.stringEnum("Direction.", ["inbound", "outbound"]),
    to: s.string("Recipient address or destination."),
    from: s.string("From."),
    body: s.string("Body."),
    segments: s.number("Segments."),
    status: s.string("Resource status."),
    createdAt: s.string("Created at."),
  },
  {
    required: ["id", "numberId", "direction", "to", "from", "body", "segments", "status", "createdAt"],
    additionalProperties: true,
  },
);
export const listMessagesOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          numberId: s.string("Number id."),
          direction: s.stringEnum("Direction.", ["inbound", "outbound"]),
          to: s.string("Recipient address or destination."),
          from: s.string("From."),
          body: s.string("Body."),
          segments: s.number("Segments."),
          status: s.string("Resource status."),
          createdAt: s.string("Created at."),
        },
        {
          required: ["id", "numberId", "direction", "to", "from", "body", "segments", "status", "createdAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const placeCallOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    numberId: s.string("Number id."),
    direction: s.stringEnum("Direction.", ["inbound", "outbound"]),
    to: s.string("Recipient address or destination."),
    from: s.string("From."),
    status: s.string(
      "Lifecycle status. `initiated` (placed or ringing, not yet finalized), `completed` (connected and hung up; billed by duration), `no_answer` (the callee never picked up; zero cost), `failed` (the carrier could not connect it, or it was expired unfinalized; zero cost), `rejected` (refused before answer \u2014 insufficient balance; zero cost). Only `completed` bills.",
    ),
    rateCentsPerMin: s.nullable(s.number("Rate cents per min.")),
    durationSec: s.nullable(s.number("Duration sec.")),
    costCents: s.nullable(s.number("Cost cents.")),
    hasRecording: s.boolean("Has recording."),
    hasTranscript: s.boolean("Has transcript."),
    createdAt: s.string("Created at."),
  },
  {
    required: [
      "id",
      "numberId",
      "direction",
      "to",
      "from",
      "status",
      "rateCentsPerMin",
      "durationSec",
      "costCents",
      "hasRecording",
      "hasTranscript",
      "createdAt",
    ],
    additionalProperties: true,
  },
);
export const listCallsOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          numberId: s.string("Number id."),
          direction: s.stringEnum("Direction.", ["inbound", "outbound"]),
          to: s.string("Recipient address or destination."),
          from: s.string("From."),
          status: s.string(
            "Lifecycle status. `initiated` (placed or ringing, not yet finalized), `completed` (connected and hung up; billed by duration), `no_answer` (the callee never picked up; zero cost), `failed` (the carrier could not connect it, or it was expired unfinalized; zero cost), `rejected` (refused before answer \u2014 insufficient balance; zero cost). Only `completed` bills.",
          ),
          rateCentsPerMin: s.nullable(s.number("Rate cents per min.")),
          durationSec: s.nullable(s.number("Duration sec.")),
          costCents: s.nullable(s.number("Cost cents.")),
          hasRecording: s.boolean("Has recording."),
          hasTranscript: s.boolean("Has transcript."),
          createdAt: s.string("Created at."),
        },
        {
          required: [
            "id",
            "numberId",
            "direction",
            "to",
            "from",
            "status",
            "rateCentsPerMin",
            "durationSec",
            "costCents",
            "hasRecording",
            "hasTranscript",
            "createdAt",
          ],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const getRecordingOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    downloadUrl: s.string("Temporary recording download URL.", { format: "uri" }),
  },
  {
    required: ["downloadUrl"],
    additionalProperties: true,
  },
);
export const getTranscriptOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    transcript: s.unknown("Call transcript returned by Saperly."),
  },
  {
    required: ["transcript"],
    additionalProperties: true,
  },
);
export const listVoicesOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "A selectable in-network text-to-speech voice. Use `id` as a connection's `tts.voiceId`.",
        {
          id: s.string("The voice's opaque, stable id. Pass it straight back as a connection's `tts.voiceId`."),
          name: s.string('The voice\'s display name (e.g. "Clara - Instructor").'),
          gender: s.string('The voice\'s gender (e.g. "female", "male").'),
          language: s.string(
            'The language the voice speaks, as a BCP-47 tag (e.g. "en-US"). Also the value to use for a connection\'s `language` field if you want transcription in this language.',
          ),
        },
        {
          required: ["id", "name", "gender", "language"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const listCustomVoicesOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          name: s.string("Human-readable name."),
          language: s.string("Spoken language code."),
          gender: s.stringEnum("Voice gender.", ["male", "female", "neutral"]),
          status: s.stringEnum("Resource status.", ["pending", "active", "failed", "expired"]),
          failureReason: s.nullable(s.string("Failure reason.")),
          deletionPending: s.nullable(s.boolean("Deletion pending.")),
          createdAt: s.string("Created at."),
          updatedAt: s.string("Updated at."),
        },
        {
          required: ["id", "name", "language", "gender", "status", "failureReason", "createdAt", "updatedAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const createCustomVoiceOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    name: s.string("Human-readable name."),
    language: s.string("Spoken language code."),
    gender: s.stringEnum("Voice gender.", ["male", "female", "neutral"]),
    status: s.stringEnum("Resource status.", ["pending", "active", "failed", "expired"]),
    failureReason: s.nullable(s.string("Failure reason.")),
    deletionPending: s.nullable(s.boolean("Deletion pending.")),
    createdAt: s.string("Created at."),
    updatedAt: s.string("Updated at."),
  },
  {
    required: ["id", "name", "language", "gender", "status", "failureReason", "createdAt", "updatedAt"],
    additionalProperties: true,
  },
);
export const listLanguagesOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "A spoken language a connection's `language` field can be set to. Use `code` as the connection's `language`.",
        {
          code: s.string(
            'The BCP-47 primary language subtag (e.g. "en", "es", "fr"). Pass it as a connection\'s `language`.',
          ),
          name: s.string('The language\'s English display name (e.g. "English", "Spanish").'),
        },
        {
          required: ["code", "name"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const getUsageOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    calls: s.object(
      "Calls.",
      {
        count: s.number("Count."),
        totalCostCents: s.number("Total cost cents."),
        totalDurationSec: s.number("Total duration sec."),
      },
      {
        required: ["count", "totalCostCents", "totalDurationSec"],
        additionalProperties: true,
      },
    ),
    messages: s.object(
      "Messages.",
      {
        count: s.number("Count."),
      },
      {
        required: ["count"],
        additionalProperties: true,
      },
    ),
    balanceCents: s.number("Balance cents."),
  },
  {
    required: ["calls", "messages", "balanceCents"],
    additionalProperties: true,
  },
);
export const listConsentOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    items: s.array(
      "Returned records.",
      s.object(
        "Items item.",
        {
          id: s.string("Resource identifier."),
          numberId: s.string("Number id."),
          peerNumber: s.string("Peer number."),
          consentType: s.stringEnum("Consent type.", ["implied_inbound", "explicit_outbound"]),
          source: s.string("Source."),
          grantedAt: s.string("Granted at."),
          revokedAt: s.nullable(s.string("Revoked at.")),
        },
        {
          required: ["id", "numberId", "peerNumber", "consentType", "source", "grantedAt", "revokedAt"],
          additionalProperties: true,
        },
      ),
    ),
  },
  {
    required: ["items"],
    additionalProperties: true,
  },
);
export const recordConsentOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    id: s.string("Resource identifier."),
    numberId: s.string("Number id."),
    peerNumber: s.string("Peer number."),
    consentType: s.stringEnum("Consent type.", ["implied_inbound", "explicit_outbound"]),
    source: s.string("Source."),
    grantedAt: s.string("Granted at."),
    revokedAt: s.nullable(s.string("Revoked at.")),
  },
  {
    required: ["id", "numberId", "peerNumber", "consentType", "source", "grantedAt", "revokedAt"],
    additionalProperties: true,
  },
);
export const checkConsentOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    hasConsent: s.boolean("Has consent."),
    type: s.nullable(s.stringEnum("Configuration type.", ["implied_inbound", "explicit_outbound"])),
  },
  {
    required: ["hasConsent"],
    additionalProperties: true,
  },
);
export const getPriceQuoteOutput: JsonSchema = s.object(
  "Saperly response.",
  {
    customerMonthlyCents: s.number("Customer monthly cents."),
    customerUpfrontCents: s.number("Customer upfront cents."),
  },
  {
    required: ["customerMonthlyCents", "customerUpfrontCents"],
    additionalProperties: true,
  },
);
