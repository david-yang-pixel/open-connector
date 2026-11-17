import { optionalRecord, optionalString, looseArray } from "../../core/cast.ts";
import { requiredResponseRecord, providerResponseError } from "../provider-runtime.ts";
export async function readResearch(response: Response): Promise<Record<string, unknown>> {
  if (!response.body) throw providerResponseError("Octen research stream is empty");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events: Record<string, unknown>[] = [];
  let pending = "";
  let lines: string[] = [];
  let report = "";
  let planId: string | undefined;
  let requiresSelection = false;
  let finished = false;
  let bytes = 0;
  function dispatch() {
    const data = lines.join("\n");
    lines = [];
    if (!data || data === "[DONE]") return;
    const event = requiredResponseRecord(JSON.parse(data), "Octen research event");
    if (event.type === "error" || event.error)
      throw providerResponseError(
        `Octen research failed: ${optionalString(event.message) ?? optionalString(event.error) ?? "upstream error"}`,
      );
    events.push(event);
    if (event.type === "finish") finished = true;
    if (event.type === "plan" && optionalRecord(event.plan)?.requires_selection === true) {
      requiresSelection = true;
      planId = optionalString(event.plan_id);
    }
    if (event.type === "content") {
      for (const choice of looseArray(event.choices)) {
        report += optionalString(optionalRecord(optionalRecord(choice)?.delta)?.content) ?? "";
      }
    }
  }
  function line(value: string) {
    if (value === "") dispatch();
    else if (value.startsWith("data:")) lines.push(value.slice(5).startsWith(" ") ? value.slice(6) : value.slice(5));
  }
  function drain(final = false) {
    while (pending) {
      const lf = pending.indexOf("\n");
      const cr = pending.indexOf("\r");
      const index = lf < 0 ? cr : cr < 0 ? lf : Math.min(lf, cr);
      if (index < 0 || (!final && pending[index] === "\r" && index === pending.length - 1)) break;
      line(pending.slice(0, index));
      const width = pending[index] === "\r" && pending[index + 1] === "\n" ? 2 : 1;
      pending = pending.slice(index + width);
    }
  }
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 32 * 1024 * 1024)
        throw providerResponseError("Octen research exceeds the 32 MiB connector response limit");
      pending += decoder.decode(chunk.value, { stream: true });
      drain();
    }
    pending += decoder.decode();
    drain(true);
    if (pending) line(pending);
    dispatch();
    if (requiresSelection && !planId) throw providerResponseError("Octen research plan is missing plan_id");
    if (!requiresSelection && !finished) throw providerResponseError("Octen research stream ended before completion");
    return {
      status: requiresSelection ? "requires_selection" : "completed",
      plan_id: planId,
      report,
      events,
    };
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
