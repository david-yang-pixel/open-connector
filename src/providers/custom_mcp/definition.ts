import type { ProviderDefinition } from "../../core/types.ts";

import { customMcpActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "custom_mcp",
  displayName: "Custom Remote MCP",
  description: "Connect and operate any custom remote MCP server through its streamable HTTP or SSE endpoint.",
  categories: ["Developer Tools", "Infrastructure"],
  authTypes: ["custom_credential"],
  auth: [
    {
      type: "custom_credential",
      fields: [
        {
          key: "serverUrl",
          label: "MCP Server URL",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "https://your-mcp-server.com/mcp",
          description: "Full remote MCP HTTP endpoint (e.g. https://domain.com/mcp or https://domain.com/sse).",
        },
        {
          key: "authorizationToken",
          label: "Authorization Token (Optional)",
          inputType: "password",
          required: false,
          secret: true,
          placeholder: "Optional Bearer token or API key",
          description: "Sent in the Authorization header as Bearer <token> if provided.",
        },
        {
          key: "requestTimeoutMs",
          label: "Default Request Timeout (ms)",
          inputType: "text",
          required: false,
          secret: false,
          placeholder: "60000",
          description: "Connection and default tool-call timeout from 1000 to 900000 milliseconds.",
        },
        {
          key: "toolTimeouts",
          label: "Per-tool Timeouts (JSON)",
          inputType: "json",
          required: false,
          secret: false,
          placeholder: '{"query_range":180000,"download_attachment":300000}',
          description: "Optional JSON object mapping remote tool names to timeout milliseconds.",
        },
        {
          key: "toolOperationTypes",
          label: "Per-tool Risk Levels (JSON)",
          inputType: "json",
          required: false,
          secret: false,
          placeholder: '{"query_logs":"read","update_ticket":"write","delete_record":"destructive"}',
          description: "Optional trusted overrides for remote tools that omit or misstate MCP risk annotations.",
        },
        {
          key: "inlineResultMaxBytes",
          label: "Inline Result Limit (bytes)",
          inputType: "text",
          required: false,
          secret: false,
          placeholder: "262144",
          description: "Larger MCP content blocks are stored as transit files instead of being embedded in JSON.",
        },
        {
          key: "fallbackServerUrls",
          label: "Fallback MCP URLs (JSON)",
          inputType: "json",
          required: false,
          secret: false,
          placeholder: '["https://secondary.example.com/mcp"]',
          description: "Optional ordered JSON array of alternate MCP endpoints used when connection setup fails.",
        },
        {
          key: "paginationRules",
          label: "Remote Pagination Rules (JSON)",
          inputType: "json",
          required: false,
          secret: false,
          placeholder:
            '{"list_tickets":{"mode":"page","requestPageField":"page","requestLimitField":"per_page","responseItemsPath":"data.tickets","responseNextPagePath":"data.next_page","stable":false}}',
          description:
            "Optional per-tool cursor, offset, or page-number mappings used for visible page metadata, continuation, and bounded automatic collection.",
        },
      ],
    },
  ],
  homepageUrl: "https://modelcontextprotocol.io",
  actions: customMcpActions,
};
