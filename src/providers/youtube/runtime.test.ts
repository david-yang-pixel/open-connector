import type { TransitFileStore } from "../../core/types.ts";

import { Validator } from "@cfworker/json-schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withProviderNetworkPolicy } from "../../core/provider-network-policy.ts";
import { createProviderFetch } from "../provider-runtime.ts";
import { youtubeActions } from "./actions.ts";
import { youtubeActionHandlers } from "./runtime.ts";

function fixture() {
  const file = new File(["video bytes"], "video.mp4", { type: "video/mp4" });
  const read = vi.fn(async () => ({ file, sizeBytes: file.size, name: file.name, mimeType: file.type }));
  const transitFiles: TransitFileStore = {
    maxBytes: 512 * 1024 * 1024,
    read,
    create: vi.fn(),
    delete: vi.fn(),
  };
  const transport = vi.fn<typeof fetch>();
  const context = { accessToken: "fixture-token", transitFiles, fetcher: createProviderFetch({ fetch: transport }) };
  return { file, read, transport, context };
}

const upload = youtubeActionHandlers.upload_video_from_url;

describe("YouTube upload sources", () => {
  beforeEach(() => vi.stubEnv("OOMOL_CONNECT_ALLOW_PRIVATE_NETWORK", "true"));
  afterEach(() => vi.unstubAllEnvs());

  it("uploads transit file bytes directly without fetching a local download URL", async () => {
    const { file, read, transport, context } = fixture();
    transport
      .mockResolvedValueOnce(new Response(null, { headers: { location: "https://www.googleapis.com/upload/session" } }))
      .mockResolvedValueOnce(Response.json({ id: "video-1" }));

    await expect(upload({ file: { fileId: "local-file" }, title: "Test" }, context)).resolves.toMatchObject({
      video: { id: "video-1" },
    });
    expect(read).toHaveBeenCalledWith("local-file");
    expect(transport).toHaveBeenCalledTimes(2);
    const [url, init] = transport.mock.calls[0]!;
    expect(String(url)).toContain("https://www.googleapis.com/upload/youtube/v3/videos?");
    expect(new Headers(init?.headers).get("x-upload-content-type")).toBe("video/mp4");
    expect(new Headers(init?.headers).get("x-upload-content-length")).toBe(String(file.size));
    expect(await new Response(transport.mock.calls[1]![1]?.body).text()).toBe("video bytes");
  });

  it("preserves public URL uploads", async () => {
    const { read, transport, context } = fixture();
    transport
      .mockResolvedValueOnce(new Response("remote video", { headers: { "content-type": "video/mp4" } }))
      .mockResolvedValueOnce(new Response(null, { headers: { location: "https://www.googleapis.com/upload/session" } }))
      .mockResolvedValueOnce(Response.json({ id: "video-2" }));
    await expect(
      upload({ mediaUrl: "https://media.example/video.mp4", title: "Test" }, context),
    ).resolves.toMatchObject({
      video: { id: "video-2" },
    });
    expect(read).not.toHaveBeenCalled();
    expect(await new Response(transport.mock.calls[2]![1]?.body).text()).toBe("remote video");
  });

  it.each([{}, { file: { fileId: "local-file" }, mediaUrl: "https://media.example/video.mp4" }])(
    "rejects missing or ambiguous sources before I/O (%j)",
    async (source) => {
      const { read, transport, context } = fixture();
      await expect(upload({ ...source, title: "Test" }, context)).rejects.toThrow("Exactly one");
      expect(read).not.toHaveBeenCalled();
      expect(transport).not.toHaveBeenCalled();
    },
  );

  it("rejects files over the upload limit before sending to YouTube", async () => {
    const { read, transport, context, file } = fixture();
    read.mockResolvedValueOnce({ file, name: file.name, mimeType: file.type, sizeBytes: 256 * 1024 * 1024 + 1 });
    await expect(upload({ file: { fileId: "large-file" }, title: "Test" }, context)).rejects.toThrow();
    expect(transport).not.toHaveBeenCalled();
  });

  it("propagates missing or expired transit file errors without falling back to a URL", async () => {
    const { read, transport, context } = fixture();
    const error = new Error("Transit file not found");
    read.mockRejectedValueOnce(error);
    await expect(upload({ file: { fileId: "expired-file" }, title: "Test" }, context)).rejects.toBe(error);
    expect(transport).not.toHaveBeenCalled();
  });

  it.each(["http://10.0.0.2/internal/export", "http://localhost:3000/api/files/local-file"])(
    "rejects private and loopback source URLs even with runtime permission (%s)",
    async (mediaUrl) => {
      const { transport, context } = fixture();
      await withProviderNetworkPolicy({ allowPrivateNetwork: true }, () =>
        expect(upload({ mediaUrl, title: "Test" }, context)).rejects.toThrow(),
      );
      expect(transport).not.toHaveBeenCalled();
    },
  );

  it("rejects redirects from public upload sources into private networks", async () => {
    const { transport, context } = fixture();
    transport.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "http://10.0.0.2/export" } }),
    );
    context.fetcher = createProviderFetch({ fetch: transport, allowPrivateNetwork: () => true });
    await expect(upload({ mediaUrl: "https://media.example/video.mp4", title: "Test" }, context)).rejects.toThrow(
      "private",
    );
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("validates exactly one upload source in the public action schema", () => {
    const action = youtubeActions.find((action) => action.name === "upload_video_from_url")!;
    const validator = new Validator(action.inputSchema);
    expect(validator.validate({ title: "Test", file: { fileId: "local-file" } }).valid).toBe(true);
    expect(validator.validate({ title: "Test", mediaUrl: "https://media.example/video.mp4" }).valid).toBe(true);
    expect(validator.validate({ title: "Test" }).valid).toBe(false);
    expect(
      validator.validate({ title: "Test", file: { fileId: "local-file" }, mediaUrl: "https://media.example/video.mp4" })
        .valid,
    ).toBe(false);
  });
});
