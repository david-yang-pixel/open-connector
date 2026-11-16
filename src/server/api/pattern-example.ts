/**
 * Conservative pattern sampler for action-guide examples.
 *
 * A JSON Schema `pattern` is a validation contract; an example that does not
 * match it is rejected by the runtime. This module turns the common shapes
 * (digit runs, fixed-width identifiers, dates, times, literal prefixes, and
 * alternations of them) into a short literal that matches, and returns
 * `undefined` for constructs it cannot sample safely (lookbehind,
 * backreferences, Unicode property escapes) so the caller can fall back.
 */

type PatternNode =
  | { kind: "literal"; value: string }
  | { kind: "sequence"; nodes: PatternNode[] }
  | { kind: "alternation"; branches: PatternNode[] }
  | { kind: "repeat"; node: PatternNode; min: number; max: number };

interface ClassItem {
  sample: string;
  character?: string;
  test: (value: string) => boolean;
}

const negatedClassCandidates = ["a", "0", "A", "z", "_", "-", "+", ".", ":", "1", "x", "q", "/", "?", "#"];

/** Longer samples are not useful as guide examples and can come from pathological quantifiers. */
const maximumSampleLength = 512;

/**
 * Sample a short literal that matches `pattern`, or `undefined` when the
 * pattern uses constructs this sampler does not support. Lookaheads are checked against the result, without searching for a match.
 *
 * `minLength` grows unbounded quantifiers (`+`, `*`, `{n,}`) until the sample
 * reaches the schema's minimum, when the pattern allows it. A `minLength`
 * beyond the sample bound returns `undefined` so the caller can fall back to a
 * placeholder that still honors it.
 */
export function samplePattern(pattern: string, options: { minLength?: number } = {}): string | undefined {
  const requestedMinLength = options.minLength ?? 0;
  if (requestedMinLength > maximumSampleLength) {
    return undefined;
  }
  try {
    const root = new PatternParser(pattern).parse();
    const minLength = requestedMinLength;
    const growth = new Map<PatternNode, number>();
    const budget = { remaining: maximumSampleLength };
    let sample = generateSample(root, minLength, growth, budget);
    const growthLimit = minLength * 2 + 8;
    for (let step = 0; sample.length < minLength && step < growthLimit; step += 1) {
      const growable = findGrowable(root, growth);
      if (!growable) {
        break;
      }
      growth.set(growable, (growth.get(growable) ?? 0) + 1);
      budget.remaining = maximumSampleLength;
      sample = generateSample(root, minLength, growth, budget);
    }
    // Unanchored patterns and prefix patterns can satisfy minLength by padding.
    if (sample.length < minLength) {
      const padded = sample.padEnd(minLength, "a");
      if (matchesPattern(pattern, padded)) {
        sample = padded;
      }
    }
    if (sample.length > maximumSampleLength) {
      return undefined;
    }
    if (matchesPattern(pattern, sample)) {
      return sample;
    }
    // Try explicit alternatives when an assertion rejects the shortest branch.
    // Bound the work; this is a sampler, not a general regex constraint solver.
    for (const candidate of alternativeRoots(root)) {
      const value = generateSample(candidate, minLength, growth, { remaining: maximumSampleLength });
      if (value.length >= minLength && matchesPattern(pattern, value)) {
        return value;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function alternativeRoots(root: PatternNode): PatternNode[] {
  switch (root.kind) {
    case "literal":
      return [];
    case "alternation":
      return root.branches.slice(0, 32);
    case "repeat":
      return alternativeRoots(root.node).map((node) => ({ ...root, node }));
    case "sequence": {
      const variants: PatternNode[] = [];
      for (let index = 0; index < root.nodes.length && variants.length < 32; index += 1) {
        for (const node of alternativeRoots(root.nodes[index]!)) {
          const nodes = root.nodes.slice();
          nodes[index] = node;
          variants.push({ kind: "sequence", nodes });
          if (variants.length === 32) break;
        }
      }
      return variants;
    }
  }
}

function matchesPattern(pattern: string, sample: string): boolean {
  try {
    // The runtime validator compiles patterns with the `u` flag (@cfworker/json-schema).
    return new RegExp(pattern, "u").test(sample);
  } catch {
    return false;
  }
}

function generateSample(
  node: PatternNode,
  targetLength: number,
  growth: Map<PatternNode, number>,
  budget: { remaining: number },
): string {
  switch (node.kind) {
    case "literal": {
      if (node.value.length > budget.remaining) {
        throw new PatternTooLongError();
      }
      budget.remaining -= node.value.length;
      return node.value;
    }
    case "sequence":
      return node.nodes.map((child) => generateSample(child, targetLength, growth, budget)).join("");
    case "alternation": {
      // Prefer the shortest branch that already reaches the target, so a
      // minimum length can pick a longer alternative instead of failing.
      const start = budget.remaining;
      const samples: string[] = [];
      for (const branch of node.branches) {
        budget.remaining = start;
        try {
          samples.push(generateSample(branch, targetLength, growth, budget));
        } catch (error) {
          if (!(error instanceof PatternTooLongError)) {
            throw error;
          }
        }
      }
      if (samples.length === 0) {
        throw new PatternTooLongError();
      }
      const longEnough = samples.filter((candidate) => candidate.length >= targetLength);
      const chosen = (longEnough.length > 0 ? longEnough : samples).reduce((best, candidate) =>
        candidate.length < best.length ? candidate : best,
      );
      budget.remaining = start - chosen.length;
      return chosen;
    }
    case "repeat": {
      const count = Math.min(node.max, node.min + (growth.get(node) ?? 0));
      const atom = generateSample(node.node, 0, growth, { remaining: maximumSampleLength });
      const total = atom.length * count;
      if (total > budget.remaining) {
        throw new PatternTooLongError();
      }
      budget.remaining -= total;
      return atom.repeat(count);
    }
  }
}

/** The first repeat that can still grow and would add characters. */
function findGrowable(node: PatternNode, growth: Map<PatternNode, number>): PatternNode | undefined {
  switch (node.kind) {
    case "literal":
      return undefined;
    case "sequence":
      for (const child of node.nodes) {
        const growable = findGrowable(child, growth);
        if (growable) {
          return growable;
        }
      }
      return undefined;
    case "alternation":
      for (const branch of node.branches) {
        const growable = findGrowable(branch, growth);
        if (growable) {
          return growable;
        }
      }
      return undefined;
    case "repeat": {
      if (node.min + (growth.get(node) ?? 0) >= node.max) {
        return undefined;
      }
      return generateSample(node.node, 0, growth, { remaining: maximumSampleLength }).length > 0 ? node : undefined;
    }
  }
}

class PatternTooLongError extends Error {}

class PatternParser {
  private readonly pattern: string;
  private index = 0;

  constructor(pattern: string) {
    this.pattern = pattern;
  }

  parse(): PatternNode {
    const node = this.parseAlternation();
    if (this.index < this.pattern.length) {
      throw new Error("unexpected token");
    }
    return node;
  }

  private parseAlternation(): PatternNode {
    const branches = [this.parseSequence()];
    while (this.peek() === "|") {
      this.index += 1;
      branches.push(this.parseSequence());
    }
    return branches.length === 1 ? branches[0]! : { kind: "alternation", branches };
  }

  private parseSequence(): PatternNode {
    const nodes: PatternNode[] = [];
    while (this.index < this.pattern.length) {
      const character = this.pattern[this.index]!;
      if (character === "|" || character === ")") {
        break;
      }
      nodes.push(this.parseQuantified());
    }
    return nodes.length === 1 ? nodes[0]! : { kind: "sequence", nodes };
  }

  private parseQuantified(): PatternNode {
    const atom = this.parseAtom();
    const quantifier = this.parseQuantifier();
    return quantifier ? { kind: "repeat", node: atom, ...quantifier } : atom;
  }

  private parseAtom(): PatternNode {
    const character = this.pattern[this.index];
    if (character === undefined) {
      throw new Error("unexpected end of pattern");
    }
    if (character === "(") {
      this.index += 1;
      if (this.pattern.startsWith("?=", this.index) || this.pattern.startsWith("?!", this.index)) {
        // Assertions contribute no characters. The final regex check still decides
        // whether the sample is usable; there is no search to satisfy an assertion.
        this.index += 2;
        this.parseAlternation();
        this.expect(")");
        return { kind: "literal", value: "" };
      }
      if (this.pattern.startsWith("?:", this.index)) {
        this.index += 2;
      } else if (this.pattern[this.index] === "?") {
        throw new Error("unsupported group");
      }
      const node = this.parseAlternation();
      this.expect(")");
      return node;
    }
    if (character === "[") {
      return this.parseClass();
    }
    if (character === ".") {
      this.index += 1;
      return { kind: "literal", value: "a" };
    }
    if (character === "^" || character === "$") {
      this.index += 1;
      return { kind: "literal", value: "" };
    }
    if (character === "\\") {
      return this.parseEscape();
    }
    if (character === "*" || character === "+" || character === "?") {
      throw new Error("quantifier without atom");
    }
    this.index += 1;
    return { kind: "literal", value: character };
  }

  private parseQuantifier(): { min: number; max: number } | undefined {
    const character = this.peek();
    if (character === "?") {
      this.index += 1;
      return { min: 0, max: 1 };
    }
    if (character === "*") {
      this.index += 1;
      return { min: 0, max: Number.POSITIVE_INFINITY };
    }
    if (character === "+") {
      this.index += 1;
      return { min: 1, max: Number.POSITIVE_INFINITY };
    }
    if (character !== "{") {
      return undefined;
    }
    const match = /^\{(\d+)(,(\d*))?\}/.exec(this.pattern.slice(this.index));
    if (!match) {
      return undefined;
    }
    this.index += match[0].length;
    const min = Number(match[1]);
    if (match[2] === undefined) {
      return { min, max: min };
    }
    const max = match[3] ? Number(match[3]) : Number.POSITIVE_INFINITY;
    if (max < min) {
      throw new Error("invalid quantifier range");
    }
    return { min, max };
  }

  private parseEscape(): PatternNode {
    this.index += 1;
    const character = this.pattern[this.index];
    if (character === undefined) {
      throw new Error("dangling escape");
    }
    this.index += 1;
    return { kind: "literal", value: readEscape(character, this) };
  }

  private parseClass(): PatternNode {
    this.expect("[");
    let negated = false;
    if (this.peek() === "^") {
      negated = true;
      this.index += 1;
    }
    const items: ClassItem[] = [];
    let first = true;
    while (true) {
      if (this.index >= this.pattern.length) {
        throw new Error("unterminated class");
      }
      if (this.pattern[this.index] === "]" && !first) {
        this.index += 1;
        break;
      }
      first = false;
      const item = this.parseClassItem();
      const next = this.pattern[this.index + 1];
      if (this.pattern[this.index] === "-" && next !== undefined && next !== "]" && item.character !== undefined) {
        this.index += 1;
        const end = this.parseClassItem();
        if (end.character === undefined || end.character < item.character) {
          throw new Error("invalid character range");
        }
        items.push(classRange(item.character, end.character));
      } else {
        items.push(item);
      }
    }
    if (items.length === 0) {
      throw new Error("empty class");
    }
    if (!negated) {
      return { kind: "literal", value: items[0]!.sample };
    }
    const value = negatedClassCandidates.find((candidate) => !items.some((item) => item.test(candidate)));
    if (value === undefined) {
      throw new Error("no sample for negated class");
    }
    return { kind: "literal", value };
  }

  private parseClassItem(): ClassItem {
    const character = this.pattern[this.index];
    if (character === undefined) {
      throw new Error("unexpected end of class");
    }
    if (character !== "\\") {
      this.index += 1;
      return classLiteral(character);
    }
    this.index += 1;
    const escaped = this.pattern[this.index];
    if (escaped === undefined) {
      throw new Error("dangling class escape");
    }
    this.index += 1;
    const sets: Record<string, ClassItem> = {
      d: classSet("0", (value) => /\d/.test(value)),
      D: classSet("a", (value) => !/\d/.test(value)),
      w: classSet("a", (value) => /[A-Za-z0-9_]/.test(value)),
      W: classSet("-", (value) => !/[A-Za-z0-9_]/.test(value)),
      s: classSet(" ", (value) => /\s/.test(value)),
      S: classSet("a", (value) => !/\s/.test(value)),
    };
    const set = sets[escaped];
    if (set) {
      return set;
    }
    return classLiteral(readEscape(escaped, this));
  }

  /** Read `length` hex digits at the cursor, or `undefined` when they are absent. */
  readHex(length: number): string | undefined {
    const digits = this.pattern.slice(this.index, this.index + length);
    if (digits.length !== length || !/^[0-9a-fA-F]+$/.test(digits)) {
      return undefined;
    }
    this.index += length;
    return digits;
  }

  private peek(): string | undefined {
    return this.pattern[this.index];
  }

  private expect(character: string): void {
    if (this.pattern[this.index] !== character) {
      throw new Error(`expected ${character}`);
    }
    this.index += 1;
  }
}

function readEscape(character: string, parser: PatternParser): string {
  const single: Record<string, string> = {
    d: "0",
    D: "a",
    w: "a",
    W: "-",
    s: " ",
    S: "a",
    n: "\n",
    t: "\t",
    r: "\r",
    f: "\f",
    v: "\v",
  };
  const value = single[character];
  if (value !== undefined) {
    return value;
  }
  if (/[1-9]/.test(character)) {
    throw new Error("backreference");
  }
  if (character === "p" || character === "P") {
    throw new Error("unicode property escape");
  }
  if (character === "b" || character === "B") {
    throw new Error("word boundary");
  }
  if (character === "k") {
    throw new Error("named backreference");
  }
  if (character === "c") {
    throw new Error("control escape");
  }
  if (character === "u" || character === "x") {
    const length = character === "u" ? 4 : 2;
    const digits = parser.readHex(length);
    if (digits === undefined) {
      throw new Error("invalid hex escape");
    }
    return String.fromCodePoint(Number.parseInt(digits, 16));
  }
  return character;
}

function classLiteral(character: string): ClassItem {
  return { sample: character, character, test: (value) => value === character };
}

function classRange(from: string, to: string): ClassItem {
  return { sample: from, test: (value) => value >= from && value <= to };
}

function classSet(sample: string, test: (value: string) => boolean): ClassItem {
  return { sample, test };
}
