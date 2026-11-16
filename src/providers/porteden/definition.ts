import type { ProviderDefinition } from "../../core/types.ts";

import { portedenActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "porteden",
  displayName: "PortEden",
  homepageUrl: "https://porteden.com/",
  categories: ["Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "pe_k1_...",
      description:
        "Create an API key at https://my.porteden.com/ and connect your email accounts in PortEden. Enable email access and the required email operations on the token. Setup: https://porteden.com/docs/api/authentication/.",
    },
  ],
  actions: portedenActions,
};
