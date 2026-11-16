import type { ProviderDefinition } from "../../core/types.ts";

import { commonninjaActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "commonninja",
  displayName: "Common Ninja",
  homepageUrl: "https://www.commoninja.com/",
  categories: ["Developer Tools"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Account API Key",
      placeholder: "YOUR_ACCOUNT_API_KEY",
      description:
        "Copy your Account Level API Key from https://www.commoninja.com/account to manage your own Common Ninja widgets and projects.",
    },
  ],
  actions: commonninjaActions,
};
