import type { ProviderDefinition } from "../../core/types.ts";

import { bilibiliActions } from "./actions.ts";
import { bilibiliOAuthScopes } from "./scopes.ts";

const service = "bilibili";

/**
 * Bilibili open platform provider covering video archive submission, archive
 * management, and creator operation data.
 *
 * Every arcopen API request is signed with HMAC-SHA256 over an MD5 content
 * digest (signature version 2.0), which requires node:crypto.
 */
export const nodeOnly = true;

export const provider: ProviderDefinition = {
  service,
  displayName: "Bilibili",
  description: "Submit and manage Bilibili video archives and articles, and read creator operation data.",
  categories: ["Marketing", "Data"],
  authTypes: ["oauth2"],
  auth: [
    {
      type: "oauth2",
      authorizationUrl: "https://account.bilibili.com/pc/account-pc/auth/oauth",
      tokenUrl: "https://api.bilibili.com/x/account-oauth2/v1/token",
      refreshTokenUrl: "https://api.bilibili.com/x/account-oauth2/v1/refresh_token",
      scopes: bilibiliOAuthScopes,
      tokenEndpointAuthMethod: "client_secret_post",
      // Bilibili's consent page only accepts client_id, gourl (the redirect URI)
      // and state; granted scopes are configured per application, not per request.
      authorizationRequestFields: {
        redirectUri: "gourl",
        responseType: false,
        scope: false,
      },
      clientConfigFields: [
        {
          key: "appSecret",
          label: "App Secret",
          inputType: "password",
          required: true,
          secret: true,
          location: "secretExtra",
          description:
            "The application App Secret from the Bilibili open platform (same value as Client Secret). It signs every API request with HMAC-SHA256.",
        },
      ],
      clientSetup: {
        docsUrl: "https://open.bilibili.com",
        steps: [
          "Register as a developer on the Bilibili open platform and create an application to receive its Client ID and Client Secret (App Secret).",
          "In the application settings, set the authorization callback URL (授权回调域) to this runtime's redirect URI.",
          "Apply for the USER_INFO, USER_DATA, ARC_BASE, ARC_DATA, ATC_BASE, and ATC_DATA interface permissions and wait for Bilibili to approve them.",
          "Paste the Client ID, Client Secret, and the same value once more as App Secret, which signs API requests.",
        ],
      },
    },
  ],
  homepageUrl: "https://www.bilibili.com",
  actions: bilibiliActions,
};
