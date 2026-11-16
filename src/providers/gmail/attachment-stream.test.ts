import { describe, expect, it } from "vitest";
import { decodeGmailAttachment } from "./attachment-stream.ts";

function chunks(text: string, width: number): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset === bytes.length) return controller.close();
      controller.enqueue(bytes.subarray(offset, (offset = Math.min(offset + width, bytes.length))));
    },
  });
}

describe("Gmail MessagePartBody stream", () => {
  it("decodes every base64 tail across one-byte chunks, either field order, padding and JSON escapes", async () => {
    for (let size = 0; size < 68; size++) {
      const bytes = Buffer.from(Array.from({ length: size }, (_, index) => (index * 137) % 256));
      const data = bytes
        .toString(size % 2 ? "base64" : "base64url")
        .replaceAll("+", "-")
        .replaceAll("/", "_");
      const escaped = data.replaceAll("A", "\\u0041");
      const json =
        size % 2
          ? `{"size":${size},"data":"${escaped}"}`
          : `{"data":"${escaped}","attachmentId":"ignored \\"id\\"", "size":${size}}`;
      const result = await new Response(decodeGmailAttachment(chunks(json, 1), 1024)).arrayBuffer();
      expect(Buffer.from(result)).toEqual(bytes);
    }
  });

  it("decodes padded data spanning multiple decoder blocks", async () => {
    const bytes = Buffer.alloc(20_003, 251);
    const data = bytes.toString("base64").replaceAll("+", "-").replaceAll("/", "_");
    const body = decodeGmailAttachment(chunks(JSON.stringify({ data, size: bytes.length }), 8191), bytes.length);
    expect(Buffer.from(await new Response(body).arrayBuffer())).toEqual(bytes);
  });

  it.each([
    "{}",
    '{"data":"YQ"}',
    '{"data":"YQ","size":2}',
    '{"data":"YQ","size":1.5}',
    '{"data":"YQ","size":"1"}',
    '{"data":"YQ","size":1',
    '{"data":"YQ',
    '{"data":"YQ","size":1} trailing',
    '{"data":"YQ","data":"Yg","size":2}',
    '{"data":"YQ","size":0,"size":1}',
    '{"data":null,"size":0}',
    '{"data":"Y","size":0}',
    '{"data":"YR","size":1}',
    '{"data":"YQ=","size":1}',
    '{"data":"YQ===","size":1}',
    '{"data":"YQ==YQ","size":2}',
    '{"data":"Y Q","size":1}',
    '{"data":"Y\\nQ","size":1}',
    '{"data":"Y\\x51","size":1}',
    '{"data":"","size":0,"nested":{"data":"not attachment data"}} garbage',
  ])("rejects malformed or incomplete attachments: %s", async (json) => {
    await expect(new Response(decodeGmailAttachment(chunks(json, 3), 1024)).arrayBuffer()).rejects.toThrow();
  });

  it("bounds non-data fields and cancels the source when the decoder fails", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`{"unexpected":"${"x".repeat(20_000)}`));
      },
      cancel() {
        cancelled = true;
      },
    });
    await expect(new Response(decodeGmailAttachment(body, 1024)).arrayBuffer()).rejects.toThrow(
      "envelope is too large",
    );
    await expect.poll(() => cancelled).toBe(true);
  });
});
