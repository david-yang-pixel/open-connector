import type { ProviderFetch } from "../provider-runtime.ts";

import { describe, expect, it } from "vitest";
import { googleChatActionHandlers } from "./executors.ts";

const accessToken = "test-token";

interface FakeSender {
  name: string;
  type: string;
  displayName?: string;
  email?: string;
}

interface FakeOptions {
  messages?: { name: string; sender?: FakeSender }[];
  batchStatus?: number;
  directory?: Record<string, string>;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
}

function humanSender(id: string): FakeSender {
  return { name: `users/${id}`, type: "HUMAN" };
}

/** A fake of the Chat message endpoints plus the People batch lookup, recording every request. */
function fakeGoogle(options: FakeOptions) {
  const requests: URL[] = [];
  const fetcher: ProviderFetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    if (url.pathname === "/v1/people:batchGet") {
      if (options.batchStatus) {
        return json({ error: { code: options.batchStatus, message: "denied" } }, options.batchStatus);
      }
      const responses = url.searchParams.getAll("resourceNames").map((resourceName) => {
        const displayName = options.directory?.[resourceName.replace("people/", "")];
        return displayName
          ? {
              requestedResourceName: resourceName,
              person: {
                names: [{ displayName, metadata: { primary: true } }],
                emailAddresses: [{ value: `${displayName.toLowerCase()}@example.com`, metadata: { primary: true } }],
              },
            }
          : { requestedResourceName: resourceName, status: { code: 5, message: "not found" } };
      });
      return json({ responses });
    }
    if (url.pathname === "/v1/spaces/A/messages" && url.hostname === "chat.googleapis.com") {
      return json({ messages: options.messages ?? [] });
    }
    if (url.pathname.startsWith("/v1/spaces/A/messages/")) {
      return json(options.messages?.[0]);
    }
    throw new Error(`unexpected request ${url.toString()}`);
  };

  return { requests, fetcher };
}

describe("Google Chat runtime boundaries", () => {
  it("still stops when the caller cancels during the directory lookup", async () => {
    const controller = new AbortController();
    const base = fakeGoogle({ messages: [{ name: "spaces/A/messages/1", sender: humanSender("1") }] });
    const fetcher: ProviderFetch = async (input, init) => {
      if (new URL(String(input)).pathname === "/v1/people:batchGet") {
        controller.abort();
        throw new DOMException("The operation was aborted.", "AbortError");
      }
      return base.fetcher(input, init);
    };

    await expect(
      googleChatActionHandlers.list_messages({ space: "A" }, { accessToken, fetcher, signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
