/** Import a Cloudflare D1 SQL export into an already-migrated, empty local SQLite runtime.
 *
 * The export is read from stdin and held only in memory. Credential-bearing
 * fields are encrypted with the destination runtime key before SQLite writes.
 * This script intentionally never prints rows, SQL, or secret values.
 */
import { createHash } from "node:crypto";
import { chmodSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { AesGcmSecretCodec } from "../src/server/secrets/secret-codec.ts";
import { WorkerAesGcmSecretCodec } from "../src/server/secrets/worker-secret-codec.ts";

const tables = [
  "connections",
  "oauth_client_configs",
  "oauth_states",
  "runtime_tokens",
  "runs",
  "runtime_policy",
  "idempotency_records",
  "marketplace_config",
  "provider_preferences",
  "connection_requests",
] as const;

const secretColumns: Record<string, readonly string[]> = {
  connections: ["value"],
  oauth_client_configs: ["value"],
  oauth_states: ["value"],
  idempotency_records: ["response_value"],
  connection_requests: ["value"],
};

const maxExportBytes = 96 * 1024 * 1024;
const targetPath = process.env.OOMOL_CONNECT_IMPORT_TARGET ?? "/app/data/connect.sqlite";
let phase = "configuration";

async function readDump(): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > maxExportBytes) throw new Error("export_too_large");
    chunks.push(bytes);
  }
  if (size === 0) throw new Error("empty_export");
  return Buffer.concat(chunks, size);
}

function columns(database: DatabaseSync, table: string): string[] {
  return database.prepare(`pragma table_info("${table}")`).all().map((row) => String(row.name));
}

async function main(): Promise<void> {
  const destinationKey = process.env.OOMOL_CONNECT_ENCRYPTION_KEY;
  if (!destinationKey) throw new Error("missing_destination_key");
  const destinationCodec = new AesGcmSecretCodec(destinationKey);

  phase = "read_export";
  const input = await readDump();
  let dump = input;
  let sourceKey = process.env.OOMOL_CONNECT_SOURCE_ENCRYPTION_KEY;
  if (process.env.OOMOL_CONNECT_IMPORT_FRAMED === "1") {
    const end = input.indexOf(10);
    if (end < 1 || end > 4096) throw new Error("invalid_source_key_frame");
    const encoded = input.subarray(0, end).toString("ascii");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error("invalid_source_key_frame");
    sourceKey = Buffer.from(encoded, "base64").toString("utf8");
    dump = input.subarray(end + 1);
  }
  const localSourceCodec = sourceKey ? new AesGcmSecretCodec(sourceKey) : undefined;
  const workerSourceCodec = sourceKey ? await WorkerAesGcmSecretCodec.create(sourceKey) : undefined;
  const sourceHash = createHash("sha256").update(dump).digest("hex");

  phase = "load_export";
  const source = new DatabaseSync(":memory:");
  source.exec(dump.toString("utf8"));

  phase = "validate_target";
  chmodSync(dirname(targetPath), 0o700);
  chmodSync(targetPath, 0o600);
  const target = new DatabaseSync(targetPath);
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const sourceColumns = columns(source, table);
    const targetColumns = columns(target, table);
    if (sourceColumns.length === 0 || sourceColumns.join("\0") !== targetColumns.join("\0")) {
      throw new Error(`schema_mismatch:${table}`);
    }
    if (Number(target.prepare(`select count(*) as n from "${table}"`).get()?.n) !== 0) {
      throw new Error(`target_not_empty:${table}`);
    }
  }

  async function reencrypt(value: unknown): Promise<string> {
    if (typeof value !== "string") throw new Error("invalid_secret_value");
    if (value.startsWith("enc:worker:v1:")) {
      if (!workerSourceCodec) throw new Error("missing_source_key");
      value = await workerSourceCodec.decode(value);
    } else if (value.startsWith("enc:v1:")) {
      if (!localSourceCodec) throw new Error("missing_source_key");
      value = await localSourceCodec.decode(value);
    } else if (value.startsWith("enc:")) {
      throw new Error("unknown_source_encryption");
    }
    return await destinationCodec.encode(value as string);
  }

  phase = "copy_rows";
  target.exec("begin immediate");
  try {
    for (const table of tables) {
      const names = columns(target, table);
      const quoted = names.map((name) => `"${name}"`).join(", ");
      const placeholders = names.map(() => "?").join(", ");
      const insert = target.prepare(`insert into "${table}" (${quoted}) values (${placeholders})`);
      const rows = source.prepare(`select ${quoted} from "${table}"`).iterate();
      let count = 0;
      for (const row of rows) {
        const values = await Promise.all(names.map(async (name) => {
          const raw = row[name];
          if (raw == null) return null;
          if (secretColumns[table]?.includes(name)) return await reencrypt(raw);
          if (table === "marketplace_config" && name === "value") {
            const config = JSON.parse(String(raw)) as Record<string, unknown>;
            if (typeof config.apiKeyEncrypted === "string") {
              config.apiKeyEncrypted = await reencrypt(config.apiKeyEncrypted);
            }
            return JSON.stringify(config);
          }
          return raw;
        }));
        insert.run(...values);
        count += 1;
      }
      counts[table] = count;
    }
    target.exec("commit");
  } catch (error) {
    target.exec("rollback");
    throw error;
  } finally {
    source.close();
    target.close();
  }

  phase = "complete";
  console.log(JSON.stringify({ ok: true, sourceSha256: sourceHash, counts }));
}

main().catch((error: unknown) => {
  const code = error instanceof Error && /^[a-z_]+(?::[a-z_]+)?$/.test(error.message)
    ? error.message
    : "unexpected_error";
  console.error(JSON.stringify({ ok: false, phase, code }));
  process.exitCode = 1;
});
