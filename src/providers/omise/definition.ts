import type { ProviderDefinition } from "../../core/types.ts";

import { omiseActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "omise",
  displayName: "Omise",
  description: "Inspect and manage Omise customers, charges, balances, and account data.",
  categories: ["Finance"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Secret Key",
      placeholder: "skey_test_... or skey_live_...",
      description:
        "Omise secret key used for server-side API requests. Copy a test key from https://dashboard.omise.co/test/keys or a live key from https://dashboard.omise.co/live/api-keys",
    },
  ],
  homepageUrl: "https://www.omise.co",
  actions: omiseActions,
};
