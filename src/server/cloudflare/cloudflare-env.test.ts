import { describe, expect, it } from "vitest";
import { readNonNegativeInteger } from "./cloudflare-env.ts";

describe("readNonNegativeInteger", () => {
  it("reads zero and positive integers", () => {
    expect(readNonNegativeInteger("0", 5)).toBe(0);
    expect(readNonNegativeInteger("3", 5)).toBe(3);
  });

  it("falls back for missing, empty, negative, and non-integer values", () => {
    for (const value of [undefined, "", "  ", "-1", "1.5", "abc", "NaN", "Infinity"]) {
      expect(readNonNegativeInteger(value, 5), String(value)).toBe(5);
    }
  });
});
