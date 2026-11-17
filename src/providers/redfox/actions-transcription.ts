import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { taskInputSchema, taskSubmissionSchema, transcriptionResultSchema, commentsResultSchema } from "./schemas.ts";

export const transcriptionActions: ActionDefinition[] = [
  defineProviderAction("redfox", {
    name: "submit_douyin_transcription",
    operationType: "write",
    description: "Start transcribing a Douyin video and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_douyin_transcription",
      statusActionId: "redfox.get_douyin_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_douyin_transcription",
    operationType: "read",
    description: "Get the status and transcript of a Douyin transcription task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: transcriptionResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_douyin_transcription",
      statusActionId: "redfox.get_douyin_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_xiaohongshu_comments",
    operationType: "write",
    description:
      "Start collecting comments on a Xiaohongshu note and return a task ID. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      opusId: s.nonEmptyString("Work ID."),
      dataNum: {
        ...s.integer("Number of comments to collect. Use -1 for all comments."),
        anyOf: [{ const: -1 }, { minimum: 1 }],
      },
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_xiaohongshu_comments",
      statusActionId: "redfox.get_xiaohongshu_comments",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_xiaohongshu_comments",
    operationType: "read",
    description:
      "Get the status and collected comments of a Xiaohongshu comment task. Uses the broad database. Data is updated on a T+1 schedule, not in real time.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: commentsResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_xiaohongshu_comments",
      statusActionId: "redfox.get_xiaohongshu_comments",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_xiaohongshu_transcription",
    operationType: "write",
    description: "Start transcribing a Xiaohongshu video and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_xiaohongshu_transcription",
      statusActionId: "redfox.get_xiaohongshu_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_xiaohongshu_transcription",
    operationType: "read",
    description: "Get the status and transcript of a Xiaohongshu transcription task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: transcriptionResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_xiaohongshu_transcription",
      statusActionId: "redfox.get_xiaohongshu_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_wechat_channel_transcription",
    operationType: "write",
    description: "Start transcribing a WeChat channel video and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_wechat_channel_transcription",
      statusActionId: "redfox.get_wechat_channel_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_wechat_channel_transcription",
    operationType: "read",
    description: "Get the status and transcript of a WeChat channel transcription task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: transcriptionResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_wechat_channel_transcription",
      statusActionId: "redfox.get_wechat_channel_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_kuaishou_transcription",
    operationType: "write",
    description: "Start transcribing a Kuaishou video and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_kuaishou_transcription",
      statusActionId: "redfox.get_kuaishou_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_kuaishou_transcription",
    operationType: "read",
    description: "Get the status and transcript of a Kuaishou transcription task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: transcriptionResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_kuaishou_transcription",
      statusActionId: "redfox.get_kuaishou_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "submit_bilibili_transcription",
    operationType: "write",
    description: "Start transcribing a Bilibili video and return a task ID.",
    requiredScopes: [],
    inputSchema: s.requiredObject("Request parameters.", {
      url: s.nonEmptyString("Public content URL or platform share text containing the URL."),
    }),
    outputSchema: taskSubmissionSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_bilibili_transcription",
      statusActionId: "redfox.get_bilibili_transcription",
    },
  }),
  defineProviderAction("redfox", {
    name: "get_bilibili_transcription",
    operationType: "read",
    description: "Get the status and transcript of a Bilibili transcription task.",
    requiredScopes: [],
    inputSchema: taskInputSchema,
    outputSchema: transcriptionResultSchema,
    asyncLifecycle: {
      startActionId: "redfox.submit_bilibili_transcription",
      statusActionId: "redfox.get_bilibili_transcription",
    },
  }),
];
