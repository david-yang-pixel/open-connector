import { describe, expect, it } from "vitest";
import { samplePattern } from "./pattern-example.ts";

describe("samplePattern", () => {
  it("samples grouped alternatives, escaped literals, and negated classes", () => {
    expect(samplePattern("^[0-9]{4}-(0[1-9]|1[0-2])$")).toBe("0000-01");
    expect(samplePattern("^https://api\\.calendly\\.com/event_types/[^/]+(?:/.*)?$")).toBe(
      "https://api.calendly.com/event_types/a",
    );
    expect(samplePattern("^(?:id:[1-9][0-9]*|email:.*\\S.*)$")).toBe("id:1");
  });

  it("grows unbounded quantifiers to the minimum length", () => {
    expect(samplePattern("^[0-9]+$", { minLength: 5 })).toBe("00000");
    expect(samplePattern("^\\d{2,}$", { minLength: 4 })).toBe("0000");
    expect(samplePattern("^[a-z]*$", { minLength: 3 })).toBe("aaa");
  });

  it("pads unanchored patterns without changing anchored matches", () => {
    expect(samplePattern("^prj_", { minLength: 5 })).toBe("prj_a");
    expect(samplePattern("\\S", { minLength: 2 })).toBe("aa");
    expect(samplePattern("^a$", { minLength: 2 })).toBe("a");
  });

  it("checks lookaheads against a sample without searching", () => {
    expect(samplePattern("^(?!https?://)[^/]+/.+")).toBe("a/a");
    expect(samplePattern("^(?=.{1,253}$)[A-Z]+$")).toBe("A");
    expect(samplePattern("^(?!a)a$")).toBeUndefined();
    expect(samplePattern("(?<=a)b")).toBeUndefined();
  });

  it("returns undefined for unsupported or invalid patterns", () => {
    expect(samplePattern("(a)\\1")).toBeUndefined();
    expect(samplePattern("^\\p{L}+$")).toBeUndefined();
    expect(samplePattern("^a{2,1}$")).toBeUndefined();
    expect(samplePattern("[")).toBeUndefined();
  });

  it("refuses repeats that would allocate beyond the sample bound", () => {
    expect(samplePattern("^a{99999999999}$")).toBeUndefined();
    expect(samplePattern("^(?:a{100000}){100000}$")).toBeUndefined();
    expect(samplePattern("^(a{600}|b)$")).toBe("b");
  });

  it("refuses a minimum length beyond the sample bound", () => {
    expect(samplePattern("^a+$", { minLength: 513 })).toBeUndefined();
    expect(samplePattern("^a+$", { minLength: 512 })).toBe("a".repeat(512));
  });
});

it("tries explicit alternatives when a lookahead rejects the shortest branch", () => {
  const pattern = "^(?=.*[1-9])(?:0|[1-9]\\d{0,11})(?:\\.\\d{1,2})?$";
  const sample = samplePattern(pattern);
  expect(sample).toBeDefined();
  expect(new RegExp(pattern, "u").test(sample!)).toBe(true);
});
