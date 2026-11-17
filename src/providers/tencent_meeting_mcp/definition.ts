import type { ProviderDefinition } from "../../core/types.ts";

import { tencentMeetingMcpActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "tencent_meeting_mcp",
  displayName: "Tencent Meeting MCP",
  homepageUrl: "https://meeting.tencent.com/",
  categories: ["Communication", "Productivity"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Tencent Meeting Token",
      placeholder: "Paste your Tencent Meeting MCP token",
      description:
        "Sign in at https://meeting.tencent.com/ai-skill/ and copy your Token. Switch to a personal account if your enterprise account does not yet have access. The Token represents your account; reset it on the same page if exposed.",
    },
  ],
  actions: tencentMeetingMcpActions,
};
