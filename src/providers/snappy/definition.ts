import type { ProviderDefinition } from "../../core/types.ts";

import { snappyActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "snappy",
  displayName: "Snappy",
  homepageUrl: "https://www.snappy.com/",
  categories: ["Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create a standard API key in Company Settings > Sharing & Access > API Access: https://login.snappy.com/company-settings/general. Enable accounts:read for connection verification and products:read / collections:read for catalog browsing. Keys requiring mTLS are not supported.",
    },
  ],
  actions: snappyActions,
};
