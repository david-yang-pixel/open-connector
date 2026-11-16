import type { ProviderFetch } from "../provider-runtime.ts";

import { describe, expect, it } from "vitest";
import { googleChatActionHandlers } from "./executors.ts";

const accessToken = "test-token";
const selfId = "111";
const peerId = "222";

interface Membership {
  member: { name: string; type: string; displayName?: string; email?: string };
  role?: string;
  state?: string;
}

/** A directory entry, or a per-person failure carrying a google.rpc.Code. */
type FakePerson = { names: string[]; emails: string[] } | { rpcCode: number };

interface FakeGoogleOptions {
  space?: Record<string, unknown>;
  memberPages?: Membership[][];
  membersStatus?: number;
  selfStatus?: number;
  batchStatus?: number;
  people?: Record<string, FakePerson>;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
}

function googleError(status: number): Response {
  return json({ error: { code: status, message: `status ${status}` } }, status);
}

function human(id: string, role = "ROLE_MEMBER"): Membership {
  return { member: { name: `users/${id}`, type: "HUMAN" }, role };
}

function personResponse(resourceName: string, entry: FakePerson | undefined): Record<string, unknown> {
  if (!entry) {
    return { requestedResourceName: resourceName, status: { code: 5, message: "not found" } };
  }
  if ("rpcCode" in entry) {
    return { requestedResourceName: resourceName, status: { code: entry.rpcCode, message: "failed" } };
  }
  return {
    requestedResourceName: resourceName,
    status: {},
    person: {
      resourceName,
      names: entry.names.map((displayName, index) => ({ displayName, metadata: { primary: index === 0 } })),
      emailAddresses: entry.emails.map((value, index) => ({ value, metadata: { primary: index === 0 } })),
    },
  };
}

/** A fake of the Chat and People endpoints the member resolver talks to, recording every request. */
function fakeGoogle(options: FakeGoogleOptions = {}) {
  const requests: URL[] = [];
  const pages = options.memberPages ?? [[human(selfId), human(peerId)]];
  const fetcher: ProviderFetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    if (url.hostname === "chat.googleapis.com" && url.pathname === "/v1/spaces/D") {
      return json(options.space ?? { name: "spaces/D", spaceType: "DIRECT_MESSAGE" });
    }
    if (url.hostname === "chat.googleapis.com" && url.pathname === "/v1/spaces:findDirectMessage") {
      return json(options.space ?? { name: "spaces/D", spaceType: "DIRECT_MESSAGE" });
    }
    if (url.hostname === "chat.googleapis.com" && url.pathname === "/v1/spaces/D/members") {
      if (options.membersStatus) {
        return googleError(options.membersStatus);
      }
      const index = Number(url.searchParams.get("pageToken") ?? "0");
      const nextPageToken = index + 1 < pages.length ? String(index + 1) : undefined;
      // Like Google Chat, leave invited members out unless showInvited asks for them.
      const showInvited = url.searchParams.get("showInvited") === "true";
      const memberships = pages[index].filter((membership) => showInvited || membership.state !== "INVITED");
      return json({ memberships, nextPageToken });
    }
    if (url.hostname === "people.googleapis.com" && url.pathname === "/v1/people/me") {
      return options.selfStatus ? googleError(options.selfStatus) : json({ resourceName: `people/${selfId}` });
    }
    if (url.hostname === "people.googleapis.com" && url.pathname === "/v1/people:batchGet") {
      if (options.batchStatus) {
        return googleError(options.batchStatus);
      }
      const responses = url.searchParams
        .getAll("resourceNames")
        .map((name) => personResponse(name, options.people?.[name.replace("people/", "")]));
      return json({ responses });
    }
    throw new Error(`unexpected request ${url.toString()}`);
  };

  return { requests, fetcher };
}

describe("Google Chat runtime boundaries", () => {
  it("ends Google's own sentence once when reading the caller's own id is forbidden", async () => {
    const base = fakeGoogle();
    const fetcher: ProviderFetch = async (input, init) =>
      new URL(String(input)).pathname === "/v1/people/me"
        ? json(
            {
              error: {
                code: 403,
                message:
                  "People API has not been used in project 1 before or it is disabled. Enable it by visiting the console, then retry.",
                status: "PERMISSION_DENIED",
              },
            },
            403,
          )
        : base.fetcher(input, init);

    const error = await googleChatActionHandlers
      .get_direct_message_peer({ space: "D" }, { accessToken, fetcher })
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      status: 403,
      message: expect.stringContaining("could not read the authenticated user's own id"),
    });
    expect((error as Error).message).toContain("then retry. The People API must be enabled");
    expect((error as Error).message).not.toContain("..");
  });

  it("stops instead of reporting a peerError when the caller cancels the request", async () => {
    const controller = new AbortController();
    const base = fakeGoogle();
    const fetcher: ProviderFetch = async (input, init) => {
      if (new URL(String(input)).pathname === "/v1/spaces/D/members") {
        controller.abort();
        throw new DOMException("This operation was aborted", "AbortError");
      }
      return base.fetcher(input, init);
    };

    await expect(
      googleChatActionHandlers.find_direct_message(
        { user: "peer@example.com" },
        { accessToken, fetcher, signal: controller.signal },
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
