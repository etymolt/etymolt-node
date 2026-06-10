import { describe, it, expect } from "vitest";
import { Etymolt } from "../src/index";

describe("Etymolt", () => {
  it("constructs with no options (free tier)", () => {
    const e = new Etymolt();
    expect(e).toBeInstanceOf(Etymolt);
  });

  it("constructs with baseUrl override (for etymolt-mock)", () => {
    const e = new Etymolt({ baseUrl: "http://localhost:4242" });
    expect(e).toBeInstanceOf(Etymolt);
  });

  it("Etymolt.isStale returns true for past valid_until", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const verdict = { issued_at: "2025-01-01T00:00:00Z", valid_until: past } as any;
    expect(Etymolt.isStale(verdict)).toBe(true);
  });

  it("Etymolt.isStale returns false for future valid_until", () => {
    const future = new Date(Date.now() + 10_000).toISOString();
    const verdict = { issued_at: "2025-01-01T00:00:00Z", valid_until: future } as any;
    expect(Etymolt.isStale(verdict)).toBe(false);
  });

  it("Etymolt.isStale defaults to 24h when valid_until missing", () => {
    const veryOld = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    expect(Etymolt.isStale({ issued_at: veryOld } as any)).toBe(true);
  });

  it("Etymolt.age returns milliseconds since issued_at", () => {
    const issued = new Date(Date.now() - 5000).toISOString();
    const age = Etymolt.age({ issued_at: issued } as any);
    expect(age).toBeGreaterThanOrEqual(5000);
    expect(age).toBeLessThan(6000);
  });
});
