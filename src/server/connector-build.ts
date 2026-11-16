import type { CatalogIndexSource } from "../catalog-index.ts";
import type { ProviderDefinition } from "../core/types.ts";

import { access, cp, mkdir, mkdtemp, readdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogIndexFileName, createCatalogIndex } from "../catalog-index.ts";
import { assertProviderId } from "../core/provider-id.ts";
import { getConnectorAssetDirectory } from "./connector-assets.ts";

export interface ConnectorBuildOptions {
  /** Omit to include all providers. An empty array includes none. */
  providers?: readonly string[];
}

export interface ConnectorBuild {
  /** Pass to Bun.build's compile.assets. */
  assets: string[];
  /** Pass to Bun.build alongside plugins. */
  external: string[];
  plugins: ConnectorBuildPlugin[];
  /** Remove staged assets after the build, including when it fails. */
  dispose(): Promise<void>;
}

// Keep the Bun plugin boundary structural so importing this helper does not change Node's global types.
interface ConnectorBuildPlugin {
  name: string;
  setup(build: ConnectorBuildHooks): void;
}

interface ConnectorBuildHooks {
  onLoad(
    options: { filter: RegExp },
    callback: (args: { path: string }) => { contents: string; loader: "js" } | undefined,
  ): unknown;
  onEnd(callback: (result: { success: boolean }) => void): unknown;
}

/** Prepare a headless Bun executable with only the requested provider code and catalog entries. */
export async function getConnectorBuildOptions(options: ConnectorBuildOptions = {}): Promise<ConnectorBuild> {
  const sourceAssets = getConnectorAssetDirectory();
  const external = ["proxy-agent"];
  if (options.providers === undefined) {
    return { assets: [sourceAssets], external, plugins: [], dispose: () => Promise.resolve() };
  }

  const services = [...new Set(options.providers)].sort();
  const catalogDir = join(sourceAssets, "catalog/apps");
  const files = new Set(await readdir(catalogDir));
  for (const service of services) {
    assertProviderId(service);
    if (!files.has(`${service}.json`)) throw new Error(`Unknown provider: ${service}`);
  }

  const directory = await mkdtemp(join(tmpdir(), "open-connector-build-"));
  const dispose = (): Promise<void> => rm(directory, { recursive: true, force: true });
  try {
    const assets = join(directory, "open-connector");
    const apps = join(assets, "catalog/apps");
    await mkdir(apps, { recursive: true });
    const providerDir = fileURLToPath(new URL("../providers/", import.meta.url));
    const extension = extname(import.meta.filename);
    const registry = await realpath(join(providerDir, `registry.generated${extension}`));
    const sources: CatalogIndexSource[] = [];
    for (const service of services) {
      await access(join(providerDir, service, `executors${extension}`));
      const file = `${service}.json`;
      const content = await readFile(join(catalogDir, file));
      const provider = JSON.parse(content.toString()) as ProviderDefinition;
      if (provider.service !== service) throw new Error(`Catalog service does not match ${file}`);
      await writeFile(join(apps, file), content);
      sources.push({ file, bytes: content.byteLength, provider });
    }
    // Bun embeds files, so preserve the directory that the runtime reads even with no providers.
    if (!services.length) await writeFile(join(apps, "empty"), "");
    await writeFile(join(assets, "catalog", catalogIndexFileName), JSON.stringify(createCatalogIndex(sources)));
    await cp(join(sourceAssets, "migrations"), join(assets, "migrations"), { recursive: true });
    const contents = `export const executorModules = {\n${services
      .map(
        (service) =>
          `${JSON.stringify(service)}: () => import(${JSON.stringify(`./${service}/executors${extension}`)}),`,
      )
      .join("\n")}\n};`;
    const plugin: ConnectorBuildPlugin = {
      name: "open-connector-providers",
      setup(build) {
        let replaced = false;
        build.onLoad({ filter: /[/\\]providers[/\\]registry\.generated\.[jt]s$/ }, ({ path }) => {
          if (path !== registry) return;
          replaced = true;
          return { contents, loader: "js" };
        });
        build.onEnd((result) => {
          if (result.success && !replaced)
            throw new Error("The build did not load Open Connector's executor registry.");
        });
      },
    };
    return { assets: [assets], external, plugins: [plugin], dispose };
  } catch (error) {
    await dispose();
    throw error;
  }
}
