import type { FeishuActionRuntimeContext, FeishuJsonRequest, FeishuJsonRequestInput } from "./client.ts";

import { describe, expect, it } from "vitest";
import { ProviderRequestError } from "../../provider-runtime.ts";
import { createFeishuImActionHandlers } from "./im-runtime.ts";

function recordingSearch() {
  const calls: FeishuJsonRequestInput[] = [];
  const request: FeishuJsonRequest = async (input) => {
    calls.push(input);
    return { items: [], has_more: false };
  };
  const handlers = createFeishuImActionHandlers({
    identity: "user",
    request,
    context: {} as FeishuActionRuntimeContext,
  });
  return { calls, search: handlers.search_messages! };
}

describe("Feishu search_messages request body", () => {
  it("nests every filter under `filter` with the field names Feishu reads", async () => {
    const { calls, search } = recordingSearch();

    await search({
      query: "SLA",
      chatIds: ["oc_be36a2294a9d0825c480ff38484c907e"],
      senderIds: ["ou_29cb74a229494e83aec43abc50bab5f1"],
      attachmentType: "file",
      chatType: "p2p",
      senderType: "user",
      excludeSenderType: "bot",
      isAtMe: true,
      atUserIds: ["ou_b5da9c767d6e9c968c568402a8e8ea80"],
      startTime: "2026-11-16T00:00:00+08:00",
      endTime: "2026-11-17T23:59:59+08:00",
      pageSize: 20,
      pageToken: "1bc27d5650ac6423",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/im/v1/messages/search",
      query: { page_size: 20, page_token: "1bc27d5650ac6423" },
    });
    expect(calls[0]!.body).toEqual({
      query: "SLA",
      filter: {
        chat_ids: ["oc_be36a2294a9d0825c480ff38484c907e"],
        from_ids: ["ou_29cb74a229494e83aec43abc50bab5f1"],
        include_attachment_types: ["file"],
        chat_type: "p2p",
        from_types: ["user"],
        exclude_from_types: ["bot"],
        is_at_me: true,
        at_chatter_ids: ["ou_b5da9c767d6e9c968c568402a8e8ea80"],
        time_range: {
          start_time: "2026-11-16T00:00:00+08:00",
          end_time: "2026-11-17T23:59:59+08:00",
        },
      },
    });
  });

  it("always sends query and omits an empty filter", async () => {
    const { calls, search } = recordingSearch();

    await search({ isAtMe: false, chatIds: [] });

    expect(calls[0]!.body).toEqual({ query: "" });
  });

  it("sends a one-sided time range without the missing bound", async () => {
    const { calls, search } = recordingSearch();

    await search({ query: "x", startTime: "2026-11-16T00:00:00Z" });

    expect(calls[0]!.body).toEqual({
      query: "x",
      filter: { time_range: { start_time: "2026-11-16T00:00:00Z" } },
    });
  });

  it.each([
    [{ senderType: "bot", excludeSenderType: "bot" }, "senderType and excludeSenderType cannot be the same value"],
    [{ startTime: "yesterday" }, "startTime must be an ISO 8601 time: yesterday"],
    [{ startTime: "2026-11-17T00:00:00Z", endTime: "2026-11-16T00:00:00Z" }, "startTime cannot be later than endTime"],
  ])("rejects invalid filters with a 400 before calling Feishu: %j", async (input, message) => {
    const { calls, search } = recordingSearch();

    const error = await search(input).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ProviderRequestError);
    expect(error).toMatchObject({ status: 400, message });
    expect(calls).toHaveLength(0);
  });
});
