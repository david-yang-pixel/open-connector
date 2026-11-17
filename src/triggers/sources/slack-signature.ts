import { verifySourceHmac } from "./signature.ts";

interface SlackSignatureInput {
  timestamp: string;
  signature: string;
  rawBody: Uint8Array;
  signingSecret: string;
  now: number;
}

/** Verify Slack's timestamp and signature over the original request bytes. */
export async function verifySlackSignature(input: SlackSignatureInput): Promise<"timestamp" | "signature" | undefined> {
  if (!/^\d{10}$/.test(input.timestamp) || Math.abs(input.now - Number(input.timestamp) * 1000) > 300_000)
    return "timestamp";
  if (!/^v0=[0-9a-f]{64}$/.test(input.signature) || !input.signingSecret) return "signature";
  const prefix = new TextEncoder().encode(`v0:${input.timestamp}:`);
  const signed = new Uint8Array(prefix.length + input.rawBody.byteLength);
  signed.set(prefix);
  signed.set(input.rawBody, prefix.length);
  return (await verifySourceHmac(signed, input.signature.slice(3), input.signingSecret)) ? undefined : "signature";
}
