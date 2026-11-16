import type { ProviderDefinition } from "../../core/types.ts";

import { wisburgActions } from "./actions.ts";

const service = "wisburg";

/**
 * Wisburg (智堡) provider backed by the Wisburg open REST API.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "Wisburg",
  description:
    "Wisburg (智堡) macro and market research content: research notes, literature, company research, earnings call minutes, column articles, the AI market daily, news and image feeds, asset-management reports, and Mikko logs.",
  categories: ["Finance", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "Your Wisburg API key",
      description:
        "Wisburg (智堡) API key sent as an Authorization Bearer token to https://api-omen.wisburg.com. Create and manage keys on the Wisburg API key management page; see https://open-docs.wisburg.com/docs/getting-started/first-call.",
    },
  ],
  homepageUrl: "https://www.wisburg.com",
  actions: wisburgActions,
};
