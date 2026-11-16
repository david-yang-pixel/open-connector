import type { ExecutionContext, ExecutionResult, ResolvedCredential } from "../../core/types.ts";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeAction } from "../../core/execution.ts";
import { setDefaultGuardedFetchDnsLookup } from "../../core/guarded-fetch.ts";
import { readSchemaProperties } from "../../core/json-schema.ts";
import { spotifyActions } from "./actions.ts";
import { executors } from "./executors.ts";

const credential: Extract<ResolvedCredential, { authType: "oauth2" }> = {
  authType: "oauth2",
  accessToken: "spotify-access-token",
  tokenType: "Bearer",
  profile: { accountId: "spotify:test", displayName: "Spotify test", grantedScopes: [] },
  metadata: {},
};

const context: ExecutionContext = {
  getCredential: async () => credential,
};

let requests: URL[] = [];

beforeEach(() => {
  requests = [];
  setDefaultGuardedFetchDnsLookup(async () => [{ address: "35.186.224.25", family: 4 }]);
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push(new URL(input instanceof Request ? input.url : input));
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      if (method === "GET") {
        return Response.json({ tracks: [] });
      }
      return new Response(null, { status: 204 });
    }),
  );
});

afterEach(() => {
  setDefaultGuardedFetchDnsLookup(null);
  vi.unstubAllGlobals();
});

function findAction(name: string) {
  const action = spotifyActions.find((candidate) => candidate.name === name);
  if (!action) {
    throw new Error(`missing Spotify action ${name}`);
  }
  return action;
}

function run(name: string, input: Record<string, unknown>): Promise<ExecutionResult> {
  const action = findAction(name);
  return executeAction(action, executors[`spotify.${name}`], input, context);
}

describe("Spotify player input contracts", () => {
  it("turns shuffle on with a boolean state", async () => {
    const result = await run("toggle_playback_shuffle", { state: true, deviceId: "device-1" });

    expect(result).toEqual({ ok: true, output: { success: true } });
    expect(requests).toHaveLength(1);
    expect(requests[0]!.pathname).toBe("/v1/me/player/shuffle");
    expect(requests[0]!.searchParams.get("state")).toBe("true");
    expect(requests[0]!.searchParams.get("device_id")).toBe("device-1");
  });

  it("turns shuffle off with a boolean state", async () => {
    const result = await run("toggle_playback_shuffle", { state: false });

    expect(result.ok).toBe(true);
    expect(requests[0]!.searchParams.get("state")).toBe("false");
  });

  it("rejects a missing or non-boolean shuffle state before calling Spotify", async () => {
    for (const input of [{}, { state: "true" }, { state: "false" }]) {
      expect(await run("toggle_playback_shuffle", input)).toMatchObject({
        ok: false,
        error: { code: "invalid_input" },
      });
    }
    expect(requests).toHaveLength(0);
  });

  it("sends a repeat mode Spotify defines", async () => {
    const result = await run("set_repeat_mode", { state: "track" });

    expect(result.ok).toBe(true);
    expect(requests[0]!.pathname).toBe("/v1/me/player/repeat");
    expect(requests[0]!.searchParams.get("state")).toBe("track");
  });

  it("rejects a repeat mode Spotify does not define", async () => {
    expect(await run("set_repeat_mode", { state: "shuffle" })).toMatchObject({
      ok: false,
      error: { code: "invalid_input" },
    });
    expect(requests).toHaveLength(0);
  });

  it("sends the target device when skipping tracks", async () => {
    for (const name of ["skip_to_next", "skip_to_previous"]) {
      expect((await run(name, { deviceId: "device-1" })).ok).toBe(true);
    }

    expect(requests.map((request) => [request.pathname, request.searchParams.get("device_id")])).toEqual([
      ["/v1/me/player/next", "device-1"],
      ["/v1/me/player/previous", "device-1"],
    ]);
  });
});

describe("Spotify discovery input contracts", () => {
  it("declares the device that skip actions target", () => {
    for (const name of ["skip_to_next", "skip_to_previous"]) {
      expect(readSchemaProperties(findAction(name).inputSchema)).toHaveProperty("deviceId");
    }
  });

  it("declares the artist ID cursor that get_followed_artists pages with", () => {
    const schema = findAction("get_followed_artists").inputSchema;

    expect(readSchemaProperties(schema).after).toMatchObject({ type: "string" });
    expect(readSchemaProperties(schema)).not.toHaveProperty("offset");
  });

  it("pages followed artists from the artist ID cursor", async () => {
    const result = await run("get_followed_artists", { after: "0TnOYISbd1XYRBk9myaseg", limit: 5 });

    expect(result.ok).toBe(true);
    expect(requests).toHaveLength(1);
    expect(requests[0]!.pathname).toBe("/v1/me/following");
    expect(requests[0]!.search).toBe("?type=artist&after=0TnOYISbd1XYRBk9myaseg&limit=5");
  });

  it("fetches the first page of followed artists when the cursor is omitted or blank", async () => {
    for (const input of [{}, { after: "" }, { after: "  " }]) {
      expect((await run("get_followed_artists", input)).ok).toBe(true);
    }

    expect(requests.map((request) => request.search)).toEqual(["?type=artist", "?type=artist", "?type=artist"]);
  });

  it("treats empty seed categories as omitted", async () => {
    const result = await run("get_recommendations", {
      seedTracks: ["0c6xIDDpzE81m2q797ordA"],
      seedArtists: [],
      seedGenres: [],
    });

    expect(result.ok).toBe(true);
    expect(requests).toHaveLength(1);
    expect(requests[0]!.pathname).toBe("/v1/recommendations");
    expect([...requests[0]!.searchParams.keys()]).toEqual(["seed_tracks"]);
    expect(requests[0]!.searchParams.get("seed_tracks")).toBe("0c6xIDDpzE81m2q797ordA");
  });

  it("sends recommendations for one seed and for five seeds across categories", async () => {
    expect((await run("get_recommendations", { seedGenres: ["jazz"] })).ok).toBe(true);
    expect(
      (
        await run("get_recommendations", {
          seedArtists: ["4NHQUGzhtTLFvgF5SZesLK"],
          seedTracks: ["0c6xIDDpzE81m2q797ordA", "7ouMYWpwJ422jRcDASZB7P"],
          seedGenres: ["jazz", "classical"],
        })
      ).ok,
    ).toBe(true);

    expect(requests.map((request) => request.search)).toEqual([
      "?seed_genres=jazz",
      "?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_tracks=0c6xIDDpzE81m2q797ordA%2C7ouMYWpwJ422jRcDASZB7P&seed_genres=jazz%2Cclassical",
    ]);
  });

  it("rejects recommendations without any seed before calling Spotify", async () => {
    for (const input of [{}, { seedArtists: [], seedTracks: [], seedGenres: [] }, { seedGenres: [""] }]) {
      expect(await run("get_recommendations", input)).toMatchObject({
        ok: false,
        error: { code: "invalid_input" },
      });
    }
    expect(requests).toHaveLength(0);
  });

  it("rejects more than five seeds across categories before calling Spotify", async () => {
    const result = await run("get_recommendations", {
      seedTracks: ["t1", "t2", "t3", "t4", "t5"],
      seedGenres: ["jazz"],
    });

    expect(result).toMatchObject({ ok: false, error: { code: "invalid_input" } });
    expect(requests).toHaveLength(0);
  });

  it("declares the seeds get_recommendations sends", () => {
    const properties = readSchemaProperties(findAction("get_recommendations").inputSchema);

    expect(properties).toHaveProperty("seedArtists");
    expect(properties).toHaveProperty("seedTracks");
    expect(properties).toHaveProperty("seedGenres");
  });

  it("requests up to the 100 recommendations Spotify allows", async () => {
    expect((await run("get_recommendations", { seedGenres: ["jazz"], limit: 100 })).ok).toBe(true);
    expect(await run("get_recommendations", { seedGenres: ["jazz"], limit: 101 })).toMatchObject({
      ok: false,
      error: { code: "invalid_input" },
    });

    expect(requests.map((request) => request.search)).toEqual(["?limit=100&seed_genres=jazz"]);
  });
});
