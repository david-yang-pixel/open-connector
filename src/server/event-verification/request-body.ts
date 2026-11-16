/** Maximum inbound event request body size, consistent with existing event sources. */
export const eventRequestMaximumBodyBytes: number = 64 * 1024;

/**
 * Reads a request body without buffering more than the event limit.
 *
 * Returns undefined when the request exceeds the limit. The actual stream size is
 * enforced even when Content-Length is absent or understated.
 */
export async function readEventRequestBody(request: Request): Promise<Uint8Array | undefined> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > eventRequestMaximumBodyBytes) {
    return undefined;
  }
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > eventRequestMaximumBodyBytes) {
        await reader.cancel().catch(() => undefined);
        return undefined;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
