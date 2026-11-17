import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { taskInputSchema, taskSubmissionSchema, searchResultSchema } from "./schemas.ts";

export const searchActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "submit_kimi_search",
    operationType: "write",
    description: "Start an AI search with Kimi and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_kimi_search", statusActionId: "redfox.get_kimi_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_kimi_search",
    operationType: "read",
    description: "Get the status and results of a Kimi AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_kimi_search", statusActionId: "redfox.get_kimi_search" },
  }),
  defineProviderAction("redfox", {
    name: "submit_yuanbao_search",
    operationType: "write",
    description: "Start an AI search with Yuanbao and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_yuanbao_search", statusActionId: "redfox.get_yuanbao_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_yuanbao_search",
    operationType: "read",
    description: "Get the status and results of a Yuanbao AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_yuanbao_search", statusActionId: "redfox.get_yuanbao_search" },
  }),
  defineProviderAction("redfox", {
    name: "submit_qwen_search",
    operationType: "write",
    description: "Start an AI search with Qwen and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_qwen_search", statusActionId: "redfox.get_qwen_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_qwen_search",
    operationType: "read",
    description: "Get the status and results of a Qwen AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_qwen_search", statusActionId: "redfox.get_qwen_search" },
  }),
  defineProviderAction("redfox", {
    name: "submit_baidu_search",
    operationType: "write",
    description: "Start an AI search with Baidu and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_baidu_search", statusActionId: "redfox.get_baidu_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_baidu_search",
    operationType: "read",
    description: "Get the status and results of a Baidu AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_baidu_search", statusActionId: "redfox.get_baidu_search" },
  }),
  defineProviderAction("redfox", {
    name: "submit_doubao_search",
    operationType: "write",
    description: "Start an AI search with Doubao and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_doubao_search", statusActionId: "redfox.get_doubao_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_doubao_search",
    operationType: "read",
    description: "Get the status and results of a Doubao AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_doubao_search", statusActionId: "redfox.get_doubao_search" },
  }),
  defineProviderAction("redfox", {
    name: "submit_deepseek_search",
    operationType: "write",
    description: "Start an AI search with DeepSeek and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      inquiryText: s.nonEmptyString("Question or search text."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: { startActionId: "redfox.submit_deepseek_search", statusActionId: "redfox.get_deepseek_search" },
  }),
  defineProviderAction("redfox", {
    name: "get_deepseek_search",
    operationType: "read",
    description: "Get the status and results of a DeepSeek AI search task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: searchResultSchema,
    asyncLifecycle: { startActionId: "redfox.submit_deepseek_search", statusActionId: "redfox.get_deepseek_search" },
  }),
];
