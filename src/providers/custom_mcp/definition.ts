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
      ],
    },
  ],
  homepageUrl: "https://modelcontextprotocol.io",
  actions: customMcpActions,
};
