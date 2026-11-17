import { optionalRecord, optionalString } from "../../core/cast.ts";

export const minimaxTextModels: string[] = ["MiniMax-M3.1-Flash", "MiniMax-M3"];

export function selectMinimaxModels(payload: unknown, gateway = false): unknown {
  const record = optionalRecord(payload);
  if (!Array.isArray(record?.data)) return payload;
  const preferred = gateway ? ["minimax/minimax-m3.1-flash:free", "minimax/minimax-m3"] : minimaxTextModels;
  const current: unknown[] = [];
  const remaining: unknown[] = [];
  let insertionIndex: number | undefined;
  for (const item of record.data) {
    const id = optionalString(optionalRecord(item)?.id) ?? "";
    if (preferred.includes(id)) {
      insertionIndex ??= remaining.length;
      current.push(item);
      continue;
    }
    const name = (gateway && id.startsWith("minimax/") ? id.slice(8) : gateway ? "" : id)
      .toLowerCase()
      .split(":", 1)[0]!;
    const oldGeneration = ["minimax-m1", "minimax-m2"].some(
      (prefix) => name === prefix || name.startsWith(`${prefix}.`) || name.startsWith(`${prefix}-`),
    );
    const legacy =
      oldGeneration ||
      name.startsWith("minimax-text-") ||
      name === "minimax-01" ||
      name === "m2-her" ||
      (name.startsWith("abab") && "0123456789".includes(name[4] ?? " "));
    if (!legacy) remaining.push(item);
  }
  current.sort(
    (a, b) =>
      preferred.indexOf(optionalString(optionalRecord(a)?.id) ?? "") -
      preferred.indexOf(optionalString(optionalRecord(b)?.id) ?? ""),
  );
  remaining.splice(gateway ? (insertionIndex ?? remaining.length) : 0, 0, ...current);
  return { ...record, data: remaining };
}
