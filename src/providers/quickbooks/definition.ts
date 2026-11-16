import type { ProviderDefinition } from "../../core/types.ts";

import { quickbooksActions } from "./actions.ts";
import { quickbooksAccountingScope } from "./constants.ts";

const service = "quickbooks";

/**
 * QuickBooks Online provider backed by the Intuit Accounting API.
 *
 * Open-source users bring their own Intuit Developer OAuth app. Every API
 * call is scoped to one company, so the realm ID is captured from the OAuth
 * callback and stored with the credential; see `oauth.ts`.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "QuickBooks Online",
  categories: ["Finance", "Data"],
  authTypes: ["oauth2"],
  auth: [
    {
      type: "oauth2",
      authorizationUrl: "https://appcenter.intuit.com/connect/oauth2",
      tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      revocationUrl: "https://developer.api.intuit.com/v2/oauth2/tokens/revoke",
      scopes: [quickbooksAccountingScope],
      tokenEndpointAuthMethod: "client_secret_basic",
      clientConfigFields: [
        {
          key: "environment",
          label: "Environment",
          inputType: "text",
          required: false,
          secret: false,
          defaultValue: "production",
          placeholder: "production",
          description:
            "Use production with your Production keys, or sandbox with your Development keys and a sandbox company.",
        },
      ],
      clientSetup: {
        docsUrl:
          "https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0",
        steps: [
          "Create an app in the Intuit Developer portal and enable the QuickBooks Online Accounting scope.",
          "Add the callback URL shown here to the app's Redirect URIs under Keys & credentials.",
          "Copy the Client ID and Client Secret from the Development keys for a sandbox company, or from the Production keys for a live company.",
          "Set Environment to sandbox when using Development keys; leave it as production otherwise.",
        ],
      },
    },
  ],
  homepageUrl: "https://quickbooks.intuit.com",
  actions: quickbooksActions,
};
