import { describe, it, expect } from "vitest";
import { events } from "./events-data.ts";
import { splitEvents } from "./events-logic.ts";

describe("events data", () => {
  it("has at least one event", () => {
    expect(events.length).toBeGreaterThan(0);
  });

  it("every date string is valid ISO YYYY-MM-DD", () => {
    for (const ev of events) {
      for (const entry of ev.dates) {
        const iso = typeof entry === "string" ? entry : entry.date;
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("splits without throwing against a fixed date", () => {
    const { upcoming, past } = splitEvents(events, new Date(2026, 7, 27));
    expect(Array.isArray(upcoming)).toBe(true);
    expect(Array.isArray(past)).toBe(true);
  });
});
