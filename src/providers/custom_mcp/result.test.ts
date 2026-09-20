import type { TransitFileStore, TransitFileUpload } from "../../core/types.ts";

import { describe, expect, it } from "vitest";
import { processCustomMcpResult } from "./result.ts";

describe("custom MCP result processing", () => {
  it("preserves small native content without JSON stringifying it", async () => {
    const result = await processCustomMcpResult(
      {
        content: [
          { type: "text", text: '{"rows":[1,2]}' },
          { type: "image", data: Buffer.from("png").toString("base64"), mimeType: "image/png" },
        ],
        structuredContent: { rows: [1, 2] },
      },
      { toolName: "query", inlineMaxBytes: 4096 },
    );

    expect(result.content).toEqual([
      { type: "text", text: '{"rows":[1,2]}' },
      { type: "image", data: Buffer.from("png").toString("base64"), mimeType: "image/png" },
    ]);
    expect(result.structuredContent).toEqual({ rows: [1, 2] });
    expect(result._meta["io.oomol.open-connector/result"]).toMatchObject({
      truncated: false,
      storedFiles: [],
      deduplicatedCopies: 0,
    });
  });

  it("moves oversized binary content to transit storage and returns a resource link", async () => {
    const transitFiles = new MemoryTransitFiles();
    const result = await processCustomMcpResult(
      {
        content: [{ type: "image", data: Buffer.alloc(5000, 1).toString("base64"), mimeType: "image/png" }],
      },
      { toolName: "screenshot", inlineMaxBytes: 4096, transitFiles },
    );

    expect(transitFiles.files).toHaveLength(1);
    expect(result.content).toEqual([
      expect.objectContaining({
        type: "resource_link",
        uri: "https://connector.test/api/files/file-1",
        mimeType: "image/png",
        size: 5000,
      }),
    ]);
    expect(result._meta["io.oomol.open-connector/result"]).toMatchObject({ truncated: false });
  });

  it("fails explicitly instead of silently truncating when transit storage is unavailable", async () => {
    await expect(
      processCustomMcpResult(
        { content: [{ type: "text", text: "x".repeat(5000) }] },
        { toolName: "logs", inlineMaxBytes: 4096 },
      ),
    ).rejects.toMatchObject({ status: 413, details: { reason: "result_too_large" } });
  });

  it("stores one structured file when large JSON is repeated as text", async () => {
    const transitFiles = new MemoryTransitFiles();
    const structuredContent = {
      success: true,
      data: [{ message: "x".repeat(5000) }],
      "io.oomol.open-connector/pagination": { hasMore: false, pagesFetched: 2 },
    };
    const result = await processCustomMcpResult(
      {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      },
      { toolName: "search_logs", inlineMaxBytes: 4096, transitFiles },
    );

    expect(transitFiles.files).toHaveLength(1);
    expect(transitFiles.files[0]?.name).toBe("search_logs-structured.json");
    expect(result.content).toEqual([
      expect.objectContaining({
        type: "resource_link",
        uri: "https://connector.test/api/files/file-1",
        mimeType: "application/json",
      }),
    ]);
    expect(result.structuredContent).toEqual({
      "io.oomol.open-connector/stored-result": {
        name: "search_logs-structured.json",
        uri: "https://connector.test/api/files/file-1",
        mimeType: "application/json",
        size: expect.any(Number),
      },
      "io.oomol.open-connector/pagination": { hasMore: false, pagesFetched: 2 },
    });
    expect(result._meta["io.oomol.open-connector/result"]).toMatchObject({ deduplicatedCopies: 1 });
  });

  it("stores one binary file and replaces duplicate base64 in structured content", async () => {
    const transitFiles = new MemoryTransitFiles();
    const image = Buffer.alloc(5000, 1).toString("base64");
    const structuredContent = { attachment: { data: image, mimeType: "image/png" } };
    const result = await processCustomMcpResult(
      {
        content: [
          { type: "text", text: JSON.stringify(structuredContent) },
          { type: "image", data: image, mimeType: "image/png" },
        ],
        structuredContent,
      },
      { toolName: "download_attachment", inlineMaxBytes: 4096, transitFiles },
    );

    expect(transitFiles.files).toHaveLength(1);
    expect(transitFiles.files[0]?.name).toBe("download_attachment-1.png");
    expect(result.content).toEqual([
      expect.objectContaining({
        type: "resource_link",
        uri: "https://connector.test/api/files/file-1",
        mimeType: "image/png",
      }),
    ]);
    expect(result.structuredContent).toEqual({
      attachment: {
        data: "https://connector.test/api/files/file-1",
        mimeType: "image/png",
      },
    });
    expect(result._meta["io.oomol.open-connector/result"]).toMatchObject({ deduplicatedCopies: 2 });
  });
});

class MemoryTransitFiles implements TransitFileStore {
  readonly maxBytes = 1024 * 1024;
  readonly files: File[] = [];

  async create(file: File): Promise<TransitFileUpload> {
    this.files.push(file);
    return {
      fileId: `file-${this.files.length}`,
      downloadUrl: `https://connector.test/api/files/file-${this.files.length}`,
      sizeBytes: file.size,
      name: file.name,
      mimeType: file.type,
    };
  }

  async read(): Promise<never> {
    throw new Error("not implemented");
  }

  async delete(): Promise<boolean> {
    return false;
  }
}
