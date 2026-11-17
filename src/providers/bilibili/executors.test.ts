import type { ExecutionContext, ResolvedCredential, TransitFileStore } from "../../core/types.ts";

import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { executors } from "./executors.ts";

interface CapturedCall {
  url: string;
  init?: RequestInit;
}

const oauthCredential: Extract<ResolvedCredential, { authType: "oauth2" }> = {
  authType: "oauth2",
  accessToken: "test-access-token",
  tokenType: "Bearer",
  profile: { accountId: "openid-1", displayName: "Bilibili test", grantedScopes: [] },
  metadata: {
    oauthClientId: "test-client-id",
    oauthClientSecretExtra: { appSecret: "test-app-secret" },
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetchRoutes(routes: Record<string, unknown>): CapturedCall[] {
  const calls: CapturedCall[] = [];
  vi.stubGlobal("fetch", async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    for (const [match, payload] of Object.entries(routes)) {
      if (url.includes(match)) {
        return new Response(JSON.stringify(payload), { status: 200 });
      }
    }
    return new Response(JSON.stringify({ code: -1, message: `unstubbed route: ${url}` }), { status: 200 });
  });
  return calls;
}

function executionContext(transitFiles?: TransitFileStore): ExecutionContext {
  return {
    getCredential: async () => oauthCredential,
    transitFiles,
  };
}

function transitStore(files: Record<string, File>): TransitFileStore {
  return {
    maxBytes: 100 * 1024 * 1024,
    async create(file) {
      return {
        fileId: "new-id",
        downloadUrl: `https://transit/new-id`,
        sizeBytes: file.size,
        name: file.name,
        mimeType: file.type,
      };
    },
    async read(fileId) {
      const file = files[fileId];
      if (!file) {
        throw new Error(`unknown transit file ${fileId}`);
      }
      return { file, sizeBytes: file.size, name: file.name, mimeType: file.type };
    },
    async delete() {
      return true;
    },
  };
}

function headersOf(call: CapturedCall): Record<string, string> {
  return (call.init?.headers ?? {}) as Record<string, string>;
}

describe("bilibili.get_user_info", () => {
  it("calls the signed endpoint and maps the profile", async () => {
    const calls = stubFetchRoutes({
      "/arcopen/fn/user/account/info": {
        code: 0,
        message: "0",
        data: { name: "uid_42", face: "https://face", openid: "openid-1" },
      },
    });

    const result = await executors["bilibili.get_user_info"]!({}, executionContext());

    expect(result).toEqual({ ok: true, output: { name: "uid_42", face: "https://face", openid: "openid-1" } });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://member.bilibili.com/arcopen/fn/user/account/info");
    expect(calls[0]!.init?.method).toBe("GET");
    const headers = headersOf(calls[0]!);
    expect(headers["x-bili-accesskeyid"]).toBe("test-client-id");
    expect(headers["x-bili-content-md5"]).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(headers["access-token"]).toBe("test-access-token");
    expect(headers["content-type"]).toBe("application/json");
    expect(headers["authorization"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("maps code -101 to an authorization failure", async () => {
    stubFetchRoutes({ "/arcopen/fn/user/account/info": { code: -101, message: "账号未登录" } });

    const result = await executors["bilibili.get_user_info"]!({}, executionContext());

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("authorization_failed");
  });
});

describe("bilibili.upload_video", () => {
  it("orchestrates cover upload, init, single upload and submission", async () => {
    const videoBytes = new Uint8Array([1, 2, 3, 4, 5]);
    const calls = stubFetchRoutes({
      "/arcopen/fn/archive/cover/upload": { code: 0, message: "0", data: { url: "https://cover/bfs/cover.jpg" } },
      "/arcopen/fn/archive/video/init": { code: 0, message: "0", data: { upload_token: "upload-token-1" } },
      "/video/v2/upload": { code: 0, message: "0" },
      "/arcopen/fn/archive/add-by-utoken": { code: 0, message: "0", data: { resource_id: "BV1abc" } },
    });
    const store = transitStore({
      "video-id": new File([videoBytes], "test.mp4", { type: "video/mp4" }),
      "cover-id": new File([new Uint8Array([9, 9])], "cover.jpg", { type: "image/jpeg" }),
    });

    const result = await executors["bilibili.upload_video"]!(
      {
        file: { fileId: "video-id" },
        cover: { fileId: "cover-id" },
        title: "测试投稿",
        tid: 21,
        tag: "生活记录",
        copyright: 1,
      },
      executionContext(store),
    );

    expect(result).toEqual({ ok: true, output: { resourceId: "BV1abc", coverUrl: "https://cover/bfs/cover.jpg" } });

    const paths = calls.map((call) => new URL(call.url).pathname);
    expect(paths).toEqual([
      "/arcopen/fn/archive/cover/upload",
      "/arcopen/fn/archive/video/init",
      "/video/v2/upload",
      "/arcopen/fn/archive/add-by-utoken",
    ]);

    const initBody = JSON.parse(String(calls[1]!.init?.body)) as Record<string, unknown>;
    expect(initBody).toEqual({ name: "test.mp4", utype: "1" });

    const uploadCall = calls[2]!;
    expect(new URL(uploadCall.url).searchParams.get("upload_token")).toBe("upload-token-1");
    expect(headersOf(uploadCall)["content-type"]).toBe("application/octet-stream");
    const uploadBody = uploadCall.init?.body as Blob;
    expect(uploadBody.size).toBe(videoBytes.byteLength);
    expect(new Uint8Array(await uploadBody.arrayBuffer())).toEqual(videoBytes);

    const submitCall = calls[3]!;
    expect(new URL(submitCall.url).searchParams.get("upload_token")).toBe("upload-token-1");
    const submitBodyText = String(submitCall.init?.body);
    const submitBody = JSON.parse(submitBodyText) as Record<string, unknown>;
    expect(submitBody).toEqual({
      title: "测试投稿",
      tid: 21,
      tag: "生活记录",
      copyright: 1,
      cover: "https://cover/bfs/cover.jpg",
      no_reprint: 0,
    });
    // The signed content MD5 must be the MD5 of the exact body that was sent.
    expect(headersOf(submitCall)["x-bili-content-md5"]).toBe(createHash("md5").update(submitBodyText).digest("hex"));
  });

  it("rejects a repost without source before any upload", async () => {
    const calls = stubFetchRoutes({});
    const store = transitStore({ "video-id": new File([new Uint8Array([1])], "a.mp4", { type: "video/mp4" }) });

    const result = await executors["bilibili.upload_video"]!(
      { file: { fileId: "video-id" }, title: "t", tid: 21, tag: "x", copyright: 2 },
      executionContext(store),
    );

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("invalid_input");
    expect(calls).toHaveLength(0);
  });

  it("uploads files over 100MB in consecutive 10MB parts, then completes and submits", async () => {
    const videoBytes = new Uint8Array(100 * 1024 * 1024 + 1);
    const calls = stubFetchRoutes({
      "/arcopen/fn/archive/video/init": { code: 0, message: "0", data: { upload_token: "tok-big" } },
      "/video/v2/part/upload": { code: 0, message: "0" },
      "/arcopen/fn/archive/video/complete": { code: 0, message: "0" },
      "/arcopen/fn/archive/add-by-utoken": { code: 0, message: "0", data: { resource_id: "BVbig" } },
    });
    const store = transitStore({ "big-id": new File([videoBytes], "big.mp4", { type: "video/mp4" }) });

    const result = await executors["bilibili.upload_video"]!(
      { file: { fileId: "big-id" }, title: "大文件投稿", tid: 21, tag: "x", copyright: 1 },
      executionContext(store),
    );

    expect(result).toEqual({ ok: true, output: { resourceId: "BVbig" } });
    const paths = calls.map((call) => new URL(call.url).pathname);
    expect(paths[0]).toBe("/arcopen/fn/archive/video/init");
    expect(JSON.parse(String(calls[0]!.init?.body))).toEqual({ name: "big.mp4", utype: "0" });

    const partCalls = calls.filter((call) => call.url.includes("/video/v2/part/upload"));
    expect(partCalls).toHaveLength(11);
    partCalls.forEach((call, index) => {
      const url = new URL(call.url);
      expect(url.searchParams.get("upload_token")).toBe("tok-big");
      expect(url.searchParams.get("part_number")).toBe(String(index + 1));
      expect(headersOf(call)["content-type"]).toBe("application/octet-stream");
    });
    expect((partCalls[0]!.init!.body as Blob).size).toBe(10 * 1024 * 1024);
    expect((partCalls[10]!.init!.body as Blob).size).toBe(1);

    expect(paths[paths.length - 2]).toBe("/arcopen/fn/archive/video/complete");
    expect(paths[paths.length - 1]).toBe("/arcopen/fn/archive/add-by-utoken");
  });

  it("never submits the archive when the video upload fails", async () => {
    const calls = stubFetchRoutes({
      "/arcopen/fn/archive/video/init": { code: 0, message: "0", data: { upload_token: "tok-fail" } },
      "/video/v2/upload": { code: 21001, message: "file broken" },
    });
    const store = transitStore({ "video-id": new File([new Uint8Array([1, 2])], "a.mp4", { type: "video/mp4" }) });

    const result = await executors["bilibili.upload_video"]!(
      { file: { fileId: "video-id" }, title: "t", tid: 21, tag: "x", copyright: 1 },
      executionContext(store),
    );

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("provider_error");
    expect(calls.some((call) => call.url.includes("add-by-utoken"))).toBe(false);
  });
});

describe("bilibili.edit_article", () => {
  const currentArticle = {
    id: 5678,
    title: "old title",
    summary: "old summary",
    content: "<p>old</p>",
    category: { id: 3, parent_id: 0, name: "生活" },
    banner_url: "https://banner/bfs/banner.jpg",
    template_id: 5,
    original: 1,
    image_urls: ["https://img/1.jpg", "https://img/2.jpg"],
    tags: [{ tid: 600, name: "测试" }],
    list: { id: 462, name: "文集1" },
    top_video_bvid: "",
  };

  it("merges over the current article and suppresses the inherited banner when switching to a header video", async () => {
    const calls = stubFetchRoutes({
      "/arcopen/fn/article/detail": { code: 0, message: "0", data: currentArticle },
      "/arcopen/fn/article/edit": { code: 0, message: "0" },
    });

    const result = await executors["bilibili.edit_article"]!(
      { articleId: 5678, topVideoBvid: "BV9xyz" },
      executionContext(),
    );

    expect(result).toEqual({ ok: true, output: { articleId: 5678 } });
    expect(calls).toHaveLength(2);
    const form = calls[1]!.init?.body as FormData;
    expect(form.get("id")).toBe("5678");
    expect(form.get("title")).toBe("old title");
    expect(form.get("category")).toBe("3");
    expect(form.get("template_id")).toBe("5");
    expect(form.get("summary")).toBe("old summary");
    expect(form.get("content")).toBe("<p>old</p>");
    expect(form.get("original")).toBe("1");
    expect(form.get("image_urls")).toBe("https://img/1.jpg,https://img/2.jpg");
    expect(form.get("tags")).toBe("测试");
    expect(form.get("list_id")).toBe("462");
    expect(form.get("top_video_bvid")).toBe("BV9xyz");
    expect(form.get("banner_url")).toBeNull();
  });

  it("rejects bannerUrl and topVideoBvid together", async () => {
    const calls = stubFetchRoutes({});

    const result = await executors["bilibili.edit_article"]!(
      { articleId: 5678, bannerUrl: "https://b/1.jpg", topVideoBvid: "BV9xyz" },
      executionContext(),
    );

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("invalid_input");
    expect(calls).toHaveLength(0);
  });
});

describe("bilibili.delete_articles", () => {
  it("joins article ids with commas into the form", async () => {
    const calls = stubFetchRoutes({ "/arcopen/fn/article/delete": { code: 0, message: "0" } });

    const result = await executors["bilibili.delete_articles"]!({ articleIds: [5678, 123] }, executionContext());

    expect(result).toEqual({ ok: true, output: { articleIds: [5678, 123], deleted: true } });
    const form = calls[0]!.init?.body as FormData;
    expect(form.get("ids")).toBe("5678,123");
  });
});

describe("bilibili edit actions", () => {
  it("reject identifier-only calls before any request", async () => {
    const calls = stubFetchRoutes({});

    const archive = await executors["bilibili.edit_archive"]!({ resourceId: "BV1abc" }, executionContext());
    const article = await executors["bilibili.edit_article"]!({ articleId: 5678 }, executionContext());
    const anthology = await executors["bilibili.edit_anthology"]!({ anthologyId: 462 }, executionContext());

    for (const result of [archive, article, anthology]) {
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe("invalid_input");
    }
    expect(calls).toHaveLength(0);
  });
});

describe("bilibili.get_archive_inc_stats", () => {
  it("falls back to the document's icn_reply typo", async () => {
    stubFetchRoutes({
      "/arcopen/fn/data/arc/inc-stats": {
        code: 0,
        message: "0",
        data: { inc_click: 53, icn_reply: 7, inc_like: 3 },
      },
    });

    const result = await executors["bilibili.get_archive_inc_stats"]!({}, executionContext());

    expect(result).toEqual({ ok: true, output: { incClick: 53, incReply: 7, incLike: 3 } });
  });
});
