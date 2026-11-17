import type { ProviderDefinition } from "../../core/types.ts";

import { search1apiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "search1api",
  displayName: "Search1API",
  homepageUrl: "https://s1.dev",
  categories: ["AI", "Data"],
  authTypes: ["api_key", "oauth2"],
  auth: [
    {
      type: "oauth2",
      authorizationUrl: "https://clerk.s1.dev/oauth/authorize",
      tokenUrl: "https://clerk.s1.dev/oauth/token",
      scopes: ["openid", "offline_access"],
      tokenEndpointAuthMethod: "none",
      pkce: { method: "S256" },
    },
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Search1API key",
      description:
        "Sign in at https://app.s1.dev, open API Keys and create a key. Connecting checks your balance without consuming credits.",
      extraFields: [],
    },
  ],
  actions: search1apiActions,
};
