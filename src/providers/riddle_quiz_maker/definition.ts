import type { ProviderDefinition } from "../../core/types.ts";

import { riddleQuizMakerActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "riddle_quiz_maker",
  displayName: "Riddle Quiz Maker",
  description: "Manage Riddle Quiz Maker projects, content, leads, and statistics.",
  categories: ["Marketing", "Documents & Content"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "RIDDLE_API_KEY",
      description:
        "Riddle API key sent as a Bearer token. Create or copy a key in the Riddle Creator: https://www.riddle.com/creator/account/access-token.",
    },
  ],
  homepageUrl: "https://www.riddle.com",
  actions: riddleQuizMakerActions,
};
