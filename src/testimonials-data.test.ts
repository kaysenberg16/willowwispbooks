import { describe, it, expect } from "vitest";
import { testimonials } from "./testimonials-data.ts";

describe("testimonials data", () => {
  it("every entry has a non-empty quote and attribution", () => {
    for (const t of testimonials) {
      expect(t.quote.trim().length).toBeGreaterThan(0);
      expect(t.attribution.trim().length).toBeGreaterThan(0);
    }
  });

  it("no quote is wrapped in quotation marks (the card adds its own)", () => {
    for (const t of testimonials) {
      expect(t.quote.trim().startsWith('"')).toBe(false);
      expect(t.quote.trim().endsWith('"')).toBe(false);
    }
  });

  it("no attribution carries a leading dash (the card adds its own)", () => {
    for (const t of testimonials) {
      expect(t.attribution.trim()).not.toMatch(/^[-–—]/);
    }
  });
});
