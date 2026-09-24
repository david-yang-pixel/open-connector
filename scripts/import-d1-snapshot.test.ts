import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { afterEach, expect, test } from "vitest";
import { AesGcmSecretCodec } from "../src/server/secrets/secret-codec.ts";
import { WorkerAesGcmSecretCodec } from "../src/server/secrets/worker-secret-codec.ts";
import { SqliteRuntimeDatabase } from "../src/server/storage/sqlite-runtime-store.ts";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function fixture(): Promise<{ path: string; dump: string }> {
  const directory = await mkdtemp(join(tmpdir(), "openconnector-d1-import-"));
  directories.push(directory);
  const path = join(directory, "connect.sqlite");
  new SqliteRuntimeDatabase(path).close();
  const database = new DatabaseSync(path, { readOnly: true });
  const schema = database
    .prepare("select sql from sqlite_master where type = 'table' and name not in ('runtime_migrations', 'sqlite_sequence')")
    .all()
    .map((row) => `${String(row.sql)};`)
    .join("\n");
  database.close();
  return {
    path,
    dump: `${schema}\n
insert into connections (id, revision, service, connection_name, value, updated_at)
values ('connection-1', 'revision-1', 'custom_mcp', 'test', '{"apiKey":"synthetic-test-only"}', '2026-01-01T00:00:00Z');
insert into runtime_tokens (id, name, token_hash, created_at, connection_permissions)
values ('token-1', 'test', 'synthetic-hash', '2026-01-01T00:00:00Z', '[{"connectionId":"connection-1","operationType":"read"}]');
`,
  };
}

async function runImport(path: string, dump: string, sourceKey?: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const script = fileURLToPath(new URL("./import-d1-snapshot.ts", import.meta.url));
  const child = spawn(process.execPath, [script], {
    env: {
      ...process.env,
      OOMOL_CONNECT_ENCRYPTION_KEY: "synthetic-test-key",
      OOMOL_CONNECT_IMPORT_TARGET: path,
      OOMOL_CONNECT_IMPORT_FRAMED: sourceKey ? "1" : "0",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk: string) => { stdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk: string) => { stderr += chunk; });
  child.stdin.end(sourceKey ? `${Buffer.from(sourceKey).toString("base64")}\n${dump}` : dump);
  const code = await new Promise<number | null>((resolve) => child.on("exit", resolve));
  return { code, stdout, stderr };
}

test("copies D1 rows while encrypting credentials and preserving connection-scoped token policy", async () => {
  const { path, dump } = await fixture();
  const result = await runImport(path, dump);
  expect(result.code).toBe(0);
  expect(result.stdout).not.toContain("synthetic-test-only");
  expect(result.stdout).toContain('"connections":1');

  const database = new DatabaseSync(path, { readOnly: true });
  const value = String(database.prepare("select value from connections").get()?.value);
  expect(value).toMatch(/^enc:v1:/);
  expect(await new AesGcmSecretCodec("synthetic-test-key").decode(value)).toBe('{"apiKey":"synthetic-test-only"}');
  expect(database.prepare("select connection_permissions from runtime_tokens").get()?.connection_permissions)
    .toBe('[{"connectionId":"connection-1","operationType":"read"}]');
  database.close();
});

test("refuses a second import without changing existing rows", async () => {
  const { path, dump } = await fixture();
  expect((await runImport(path, dump)).code).toBe(0);
  const second = await runImport(path, dump);
  expect(second.code).toBe(1);
  expect(second.stderr).toContain("target_not_empty:connections");
  expect(second.stderr).not.toContain("synthetic-test-only");
  const database = new DatabaseSync(path, { readOnly: true });
  expect(database.prepare("select count(*) as n from connections").get()?.n).toBe(1);
  database.close();
});

test("decrypts Worker-format source credentials before destination encryption", async () => {
  const { path, dump } = await fixture();
  const sourceKey = "synthetic-worker-key";
  const workerCodec = await WorkerAesGcmSecretCodec.create(sourceKey);
  const workerValue = await workerCodec.encode('{"apiKey":"synthetic-test-only"}');
  const encryptedDump = dump.replace('{"apiKey":"synthetic-test-only"}', workerValue);
  const result = await runImport(path, encryptedDump, sourceKey);
  expect(result.code).toBe(0);
  expect(result.stdout).not.toContain(sourceKey);
  const database = new DatabaseSync(path, { readOnly: true });
  const destinationValue = String(database.prepare("select value from connections").get()?.value);
  expect(destinationValue).toMatch(/^enc:v1:/);
  expect(await new AesGcmSecretCodec("synthetic-test-key").decode(destinationValue))
    .toBe('{"apiKey":"synthetic-test-only"}');
  database.close();
});
