import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cn } from "./lib/utils";

// Compose the classes actually supplied by the shell and shared dialog. The
// portal does not render in SSR; production-build geometry is checked separately.
const shellSource = readFileSync(new URL("./ui.tsx", import.meta.url), "utf8");
const dialogSource = readFileSync(new URL("./components/ui/dialog.tsx", import.meta.url), "utf8");
const settingsClasses = shellSource.match(/<DialogContent\s+className="([^"]*\bconsole-settings-panel\b[^"]*)"/)?.[1];
const defaultClasses = dialogSource.match(/"(fixed top-1\/2 left-1\/2[^"]*)"/)?.[1];

if (!settingsClasses || !defaultClasses) {
  throw new Error("Could not read the Settings and default dialog class lists");
}

const settings = cn(defaultClasses, settingsClasses).split(/\s+/);
const centered = cn(defaultClasses).split(/\s+/);

describe("Settings dialog positioning", () => {
  it("does not inherit the centered dialog's half-width or half-height translation", () => {
    expect(settings).not.toContain("-translate-x-1/2");
    expect(settings).not.toContain("-translate-y-1/2");
  });

  it("neutralizes both translation axes without relying on the stylesheet reset", () => {
    expect(settings).toContain("translate-x-0");
    expect(settings).toContain("translate-y-0");
  });

  it("keeps the shared dialog default centered", () => {
    expect(centered).toContain("-translate-x-1/2");
    expect(centered).toContain("-translate-y-1/2");
  });
});
