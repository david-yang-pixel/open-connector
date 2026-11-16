import { providerResponseError, ProviderRequestError } from "../provider-runtime.ts";

const chunkSize = 16 * 1024;
const maxEnvelopeCharacters = 16 * 1024;

/** Decode MessagePartBody.data while retaining only a small JSON envelope and one base64 block. */
export function decodeGmailAttachment(body: ReadableStream<Uint8Array>, maxBytes: number): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const parser = new AttachmentParser(maxBytes);
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        for (let offset = 0; offset < chunk.length; offset += chunkSize) {
          parser.push(decoder.decode(chunk.subarray(offset, offset + chunkSize), { stream: true }), controller);
        }
      },
      flush(controller) {
        parser.push(decoder.decode(), controller);
        parser.finish();
      },
    }),
  );
}

/** Strip only the top-level data string; JSON.parse validates the remaining bounded envelope at EOF. */
class AttachmentParser {
  private readonly maxBytes: number;
  private envelope = "";
  private depth = 0;
  private previous = "";
  private stringKind: "key" | "data" | "other" | undefined;
  private escaped = false;
  private keyToken = "";
  private key = "";
  private readonly keys = new Set<string>();
  private sawData = false;
  private dataEscape = "";
  private base64 = "";
  private padding = false;
  private sizeBytes = 0;

  constructor(maxBytes: number) {
    this.maxBytes = maxBytes;
  }

  push(text: string, controller: TransformStreamDefaultController<Uint8Array>): void {
    for (const character of text) {
      if (this.stringKind === "data") {
        this.pushData(character, controller);
        continue;
      }
      this.envelope += character;
      if (this.envelope.length > maxEnvelopeCharacters) {
        throw providerResponseError("Gmail attachment JSON envelope is too large");
      }
      if (this.stringKind) {
        if (this.stringKind === "key") this.keyToken += character;
        if (this.escaped) {
          this.escaped = false;
        } else if (character === "\\") {
          this.escaped = true;
        } else if (character === '"') {
          if (this.stringKind === "key") {
            this.key = JSON.parse(this.keyToken) as string;
            if (this.keys.has(this.key)) throw providerResponseError("Duplicate Gmail attachment field");
            this.keys.add(this.key);
          }
          this.stringKind = undefined;
          this.previous = '"';
        }
        continue;
      }
      if (character === '"') {
        if (this.depth === 1 && (this.previous === "{" || this.previous === ",")) {
          this.stringKind = "key";
          this.keyToken = '"';
        } else if (this.depth === 1 && this.previous === ":" && this.key === "data") {
          this.stringKind = "data";
          this.sawData = true;
        } else {
          this.stringKind = "other";
        }
      } else if (character === "{" || character === "[") {
        this.depth++;
      } else if (character === "}" || character === "]") {
        this.depth--;
      }
      if (!/\s/.test(character)) this.previous = character;
    }
  }

  finish(): void {
    let envelope: { data?: unknown; size?: unknown };
    try {
      envelope = JSON.parse(this.envelope) as typeof envelope;
    } catch {
      throw providerResponseError("Invalid Gmail attachment JSON");
    }
    if (
      !this.sawData ||
      this.stringKind ||
      envelope?.data !== "" ||
      !Number.isSafeInteger(envelope.size) ||
      envelope.size !== this.sizeBytes
    ) {
      throw providerResponseError("Gmail attachment is incomplete or its size does not match");
    }
  }

  private pushData(character: string, controller: TransformStreamDefaultController<Uint8Array>): void {
    if (this.dataEscape) {
      this.dataEscape += character;
      if (this.dataEscape === "\\u" || (this.dataEscape.startsWith("\\u") && this.dataEscape.length < 6)) return;
      try {
        character = JSON.parse(`"${this.dataEscape}"`) as string;
      } catch {
        throw providerResponseError("Invalid Gmail attachment JSON escape");
      }
      this.dataEscape = "";
    } else if (character === "\\") {
      this.dataEscape = character;
      return;
    } else if (character === '"') {
      // Buffer's decoder is permissive. Round-tripping the tail rejects bad padding and unused bits.
      const tail = Buffer.from(this.base64, "base64url");
      if (
        !/^[A-Za-z0-9_-]*={0,2}$/.test(this.base64) ||
        (this.padding && this.base64.length % 4 !== 0) ||
        tail.toString("base64url") !== this.base64.replace(/=+$/, "")
      ) {
        throw providerResponseError("Invalid Gmail attachment base64url data");
      }
      this.emit(tail, controller);
      this.base64 = "";
      this.stringKind = undefined;
      this.previous = '"';
      this.envelope += '"';
      return;
    }
    if (!/^[A-Za-z0-9_=-]$/.test(character) || (this.padding && character !== "=")) {
      throw providerResponseError("Invalid Gmail attachment base64url data");
    }
    this.padding ||= character === "=";
    this.base64 += character;
    if (this.padding && this.base64.length > chunkSize + 2) {
      throw providerResponseError("Invalid Gmail attachment base64url padding");
    }
    if (!this.padding && this.base64.length === chunkSize) {
      this.emit(Buffer.from(this.base64, "base64url"), controller);
      this.base64 = "";
    }
  }

  private emit(bytes: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>): void {
    this.sizeBytes += bytes.length;
    if (this.sizeBytes > this.maxBytes) {
      throw new ProviderRequestError(413, `Gmail attachment exceeds transit file limit of ${this.maxBytes} bytes`);
    }
    if (bytes.length) controller.enqueue(bytes);
  }
}
