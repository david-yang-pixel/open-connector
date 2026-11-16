import type { ProviderDefinition } from "../../core/types.ts";

import { saperlyActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "saperly",
  displayName: "Saperly",
  homepageUrl: "https://saperly.com",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "sap_sk_live_...",
      description:
        "Sign in at https://saperly.com/sign-in and create a key in Settings → Keys. Include read access for connection validation via /usage, write for resource changes, and admin for key management. Number allow-lists and spending caps remain enforced by Saperly.",
      extraFields: [],
    },
  ],
  actions: saperlyActions,
};
