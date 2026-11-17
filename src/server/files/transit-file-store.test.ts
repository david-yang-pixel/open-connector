import { describe, expect, it } from "vitest";
import { contentDispositionForFileName, normalizeDescriptor, transitFileResponse } from "./transit-file-store.ts";

describe("contentDispositionForFileName", () => {
  it("leaves an ASCII file name in the plain filename parameter", () => {
    expect(contentDispositionForFileName("report.TXT")).toBe('attachment; filename="report.TXT"');
  });

  it("escapes quotes, backslashes, and control bytes without adding an encoded parameter", () => {
    expect(contentDispositionForFileName('a"b\\c\rd\ne.txt')).toBe('attachment; filename="a_b_c_d_e.txt"');
  });

  it("carries a non-ASCII file name in filename* with an ASCII fallback", () => {
    expect(contentDispositionForFileName("发票.pdf")).toBe(
      "attachment; filename=\"__.pdf\"; filename*=UTF-8''%E5%8F%91%E7%A5%A8.pdf",
    );
  });

  it("encodes characters that are percent-encoded but not attr-char", () => {
    expect(contentDispositionForFileName("i'nvoice(1)*.pdf—x")).toBe(
      "attachment; filename=\"i'nvoice(1)*.pdf_x\"; filename*=UTF-8''i%27nvoice%281%29%2A.pdf%E2%80%94x",
    );
  });

  it("counts an astral character as a single replacement", () => {
    expect(contentDispositionForFileName("chart\u{1f4ca}.pdf")).toBe(
      "attachment; filename=\"chart_.pdf\"; filename*=UTF-8''chart%F0%9F%93%8A.pdf",
    );
  });

  it("repairs a lone surrogate instead of failing while encoding the name", () => {
    // A multipart `filename*` with a UTF-16 charset can carry an unpaired
    // surrogate; `encodeURIComponent` throws on it, which would fail every
    // download of the file for as long as its metadata lives.
    expect(contentDispositionForFileName("\ud800.pdf")).toBe(
      "attachment; filename=\"_.pdf\"; filename*=UTF-8''%EF%BF%BD.pdf",
    );
  });
});

describe("normalizeDescriptor", () => {
  it("repairs a lone surrogate in a stored file name", () => {
    expect(normalizeDescriptor({ name: "\ud800.pdf", mimeType: "application/pdf" })).toEqual({
      name: "\ufffd.pdf",
      mimeType: "application/pdf",
    });
  });
});

describe("transitFileResponse", () => {
  it("builds a response for a file whose name is outside Latin-1", async () => {
    const response = transitFileResponse("hello", { name: "发票.pdf", mimeType: "application/pdf", sizeBytes: 5 });

    expect(response.headers.get("content-disposition")).toBe(
      "attachment; filename=\"__.pdf\"; filename*=UTF-8''%E5%8F%91%E7%A5%A8.pdf",
    );
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-length")).toBe("5");
    expect(await response.text()).toBe("hello");
  });
});
