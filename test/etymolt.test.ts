import { describe, it, expect } from "vitest";
import { Etymolt, EtymoltError } from "../src/index";

describe("Etymolt", () => {
  it("constructs with defaults", () => {
    const e = new Etymolt();
    expect(e).toBeInstanceOf(Etymolt);
  });

  it("isStale returns true for old verdicts", () => {
    const oldVerdict = {
      issued_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    } as any;
    expect(Etymolt.isStale(oldVerdict)).toBe(true);
  });

  it("isStale returns false for fresh verdicts", () => {
    const freshVerdict = {
      issued_at: new Date().toISOString(),
    } as any;
    expect(Etymolt.isStale(freshVerdict)).toBe(false);
  });
});
