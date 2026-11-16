import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { responseSchema } from "./schemas.ts";

export const zhihuActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "search_zhihu_works",
    operationType: "read",
    description: "Search Zhihu content by keyword.",
    requiredScopes: [],
    inputSchema: s.object(
      "Request parameters.",
      {
        offset: s.withDefault(s.nonEmptyString("Pagination offset. Start with 0 and increase by 20."), "0"),
        sort: s.stringEnum("Sort order.", ["upvoted_count", "created_time"]),
        timeInterval: s.stringEnum("Publication age: a_day, a_week, a_month, three_months, half_a_year or a_year.", [
          "a_day",
          "a_week",
          "a_month",
          "three_months",
          "half_a_year",
          "a_year",
        ]),
        vertical: s.stringEnum("Content type: answer, article or zvide.", ["answer", "article", "zvide"]),
        keword: s.nonEmptyString("Search keyword; this spelling is required by the upstream API."),
      },
      { optional: ["offset", "sort", "timeInterval", "vertical"] },
    ),
    outputSchema: responseSchema,
  }),
];
