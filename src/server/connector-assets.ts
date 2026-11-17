import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Directory to include in a host's Bun compile.assets. Its basename keeps connector assets namespaced. */
export function getConnectorAssetDirectory(): string {
  return isStandaloneExecutable()
    ? join(import.meta.dirname, "open-connector")
    : fileURLToPath(new URL("../../assets/open-connector/", import.meta.url));
}

/** Only Bun defines the `Bun` global; Node and workerd never do, so the read is safe everywhere. */
export function isStandaloneExecutable(): boolean {
  return (globalThis as { Bun?: { isStandaloneExecutable?: boolean } }).Bun?.isStandaloneExecutable === true;
}
