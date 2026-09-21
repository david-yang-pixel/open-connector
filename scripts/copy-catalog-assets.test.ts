import type { AssetsBinding } from "../src/server/cloudflare/cloudflare-bindings.ts";

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalogFromAssets } from "../src/server/cloudflare/catalog-assets.ts";
import { copyCatalogAssets } from "./copy-catalog-assets.ts";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("copyCatalogAssets", () => {
  it("writes deterministic, size-bounded chunks in provider filename order", async () => {
    const { sourceDir, targetDir } = await fixture();
    const zulu = providerDefinition("zulu", "中中");
    const alpha = providerDefinition("alpha", "中中");
    await writeFile(join(sourceDir, "zulu.json"), JSON.stringify(zulu));
    await writeFile(join(sourceDir, "alpha.json"), JSON.stringify(alpha));
    const maxChunkBytes =
      Math.max(Buffer.byteLength(JSON.stringify(alpha)), Buffer.byteLength(JSON.stringify(zulu))) + 3;

    const index = await copyCatalogAssets({ sourceDir, targetDir, maxChunkBytes });

    expect(index).toEqual({
      version: 1,
      providerCount: 2,
      chunks: ["apps-0000.json", "apps-0001.json"],
    });
    expect(JSON.parse(await readFile(join(targetDir, "index.json"), "utf8"))).toEqual(index);
    expect(JSON.parse(await readFile(join(targetDir, "apps-0000.json"), "utf8"))).toEqual([alpha]);
    expect(JSON.parse(await readFile(join(targetDir, "apps-0001.json"), "utf8"))).toEqual([zulu]);
    for (const chunk of index.chunks) {
      expect(Buffer.byteLength(await readFile(join(targetDir, chunk), "utf8"))).toBeLessThanOrEqual(maxChunkBytes);
    }
    expect((await readdir(targetDir)).sort()).toEqual([
      "apps-0000.json",
      "apps-0001.json",
      "core-providers.json",
      "index.json",
      "provider-summaries.json",
    ]);
  });

  // Production chunks hold ~170 providers each, so the greedy fill and its separator accounting —
  // not the one-provider-per-chunk degenerate case above — are what the byte cap actually rests on.
  it("packs as many providers into a chunk as the byte cap allows", async () => {
    const { sourceDir, targetDir } = await fixture();
    const definitions = ["a", "b", "c", "d"].map((service) => providerDefinition(service));
    for (const s of ["a", "b", "c", "d"]) {
      await writeFile(join(sourceDir, `${s}.json`), JSON.stringify(providerDefinition(s)));
    }
    const providerBytes = Buffer.byteLength(JSON.stringify(definitions[0]));
    const maxChunkBytes = providerBytes * 3 + 5;

    const index = await copyCatalogAssets({ sourceDir, targetDir, maxChunkBytes });

    expect(index.chunks).toEqual(["apps-0000.json", "apps-0001.json"]);
    expect(JSON.parse(await readFile(join(targetDir, "apps-0000.json"), "utf8"))).toEqual(definitions.slice(0, 3));
    expect(JSON.parse(await readFile(join(targetDir, "apps-0001.json"), "utf8"))).toEqual(definitions.slice(3));
    expect(Buffer.byteLength(await readFile(join(targetDir, "apps-0000.json"), "utf8"))).toBe(maxChunkBytes);
  });

  it("replaces chunks left behind by an earlier build", async () => {
    const { sourceDir, targetDir } = await fixture();
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, "apps-0007.json"), "[]\n");
    await writeFile(join(targetDir, "apps.json"), "[]\n");
    await writeFile(join(sourceDir, "alpha.json"), JSON.stringify(providerDefinition("alpha")));

    await copyCatalogAssets({ sourceDir, targetDir });

    expect((await readdir(targetDir)).sort()).toEqual([
      "apps-0000.json",
      "core-providers.json",
      "index.json",
      "provider-summaries.json",
    ]);
  });

  it("accounts for UTF-8 bytes when rejecting an oversized provider", async () => {
    const { sourceDir, targetDir } = await fixture();
    const provider = providerDefinition("unicode", "中中");
    const providerBytes = Buffer.byteLength(JSON.stringify(provider));
    await writeFile(join(sourceDir, "unicode.json"), JSON.stringify(provider));

    await expect(copyCatalogAssets({ sourceDir, targetDir, maxChunkBytes: providerBytes + 2 })).rejects.toThrow(
      `unicode.json requires ${providerBytes + 3} bytes`,
    );
  });

  it("includes the provider filename when JSON parsing fails", async () => {
    const { sourceDir, targetDir } = await fixture();
    await writeFile(join(sourceDir, "broken-provider.json"), "{invalid");

    await expect(copyCatalogAssets({ sourceDir, targetDir })).rejects.toMatchObject({
      message: "Failed to parse catalog provider file: broken-provider.json",
      cause: expect.any(SyntaxError),
    });
  });

  it("writes an empty index for an empty catalog", async () => {
    const { sourceDir, targetDir } = await fixture();

    const index = await copyCatalogAssets({ sourceDir, targetDir });

    expect(index).toEqual({ version: 1, providerCount: 0, chunks: [] });
    expect((await readdir(targetDir)).sort()).toEqual(["core-providers.json", "index.json", "provider-summaries.json"]);
  });

  // The index shape and the `apps-NNNN.json` naming are declared once here and once in the worker
  // loader, so nothing but this round trip stops the two ends of the asset contract from drifting.
  it("produces an asset layout the Cloudflare worker loader can read back", async () => {
    const { sourceDir, targetDir } = await fixture();
    for (const service of ["alpha", "zulu"]) {
      await writeFile(join(sourceDir, `${service}.json`), JSON.stringify(providerDefinition(service)));
    }

    const index = await copyCatalogAssets({ sourceDir, targetDir, maxChunkBytes: 256 });
    const catalog = await loadCatalogFromAssets(directoryAssets(targetDir));

    expect(index.chunks.length).toBeGreaterThan(1);
    expect(catalog.providers.map((entry) => entry.service)).toEqual(["alpha", "zulu"]);
    expect(JSON.parse(await readFile(join(targetDir, "provider-summaries.json"), "utf8"))).toEqual(
      catalog.providers.map((provider) => ({ ...provider, actions: [], setup: [{ type: "no_auth" }] })),
    );
  });

  it("keeps curated credentialed providers in the Cloudflare runtime catalog", async () => {
    const { sourceDir, targetDir } = await fixture();
    for (const service of ["cloudflare_worker", "docker_hub", "front", "openai", "anthropic", "unlisted_api"]) {
      await writeFile(join(sourceDir, `${service}.json`), JSON.stringify(credentialedProviderDefinition(service)));
    }

    await copyCatalogAssets({ sourceDir, targetDir });

    const coreProviders = JSON.parse(await readFile(join(targetDir, "core-providers.json"), "utf8")) as Array<{
      service: string;
    }>;
    expect(coreProviders.map((provider) => provider.service)).toEqual([
      "anthropic",
      "cloudflare_worker",
      "docker_hub",
      "front",
      "openai",
    ]);
  });
});

/** Serve a directory the way the Cloudflare assets binding does, including its SPA miss behaviour. */
function directoryAssets(directory: string): AssetsBinding {
  return {
    async fetch(request) {
      const name = new URL(request.url).pathname.replace("/catalog/", "");
      try {
        return new Response(await readFile(join(directory, name), "utf8"), {
          headers: { "content-type": "application/json" },
        });
      } catch {
        return new Response("<!doctype html><html></html>", {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    },
  };
}

function providerDefinition(service: string, displayName = service): Record<string, unknown> {
  return {
    service,
    displayName,
    categories: ["Developer Tools"],
    authTypes: ["no_auth"],
    auth: [{ type: "no_auth" }],
    actions: [],
  };
}

function credentialedProviderDefinition(service: string): Record<string, unknown> {
  return {
    ...providerDefinition(service),
    authTypes: ["api_key"],
    auth: [{ type: "api_key", label: "API Key", placeholder: "secret" }],
  };
}

async function fixture(): Promise<{ sourceDir: string; targetDir: string }> {
  const root = await mkdtemp(join(tmpdir(), "open-connector-catalog-"));
  temporaryDirectories.push(root);
  const sourceDir = join(root, "source");
  const targetDir = join(root, "target");
  await mkdir(sourceDir);
  return { sourceDir, targetDir };
}
