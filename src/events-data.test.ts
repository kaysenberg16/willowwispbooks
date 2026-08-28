import { describe, it, expect } from "vitest";
import { events } from "./events-data.ts";
import { splitEvents, nextOccurrence, startOfToday } from "./events-logic.ts";

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

  it("never shows a past date as upcoming and keeps ordering (invariants at today's date)", () => {
    const today = startOfToday(new Date());
    const { upcoming, past } = splitEvents(events, today);

    // Every rendered upcoming date is today or later, and each event's dates ascend.
    for (const u of upcoming) {
      for (const d of u.futureDates) expect(d.getTime()).toBeGreaterThanOrEqual(today.getTime());
      const times = u.futureDates.map((d) => d.getTime());
      expect(times).toEqual([...times].sort((a, b) => a - b));
    }

    // Every past occurrence is strictly before today, sorted newest-first.
    const pastTimes = past.map((p) => p.occurrence.date.getTime());
    for (const t of pastTimes) expect(t).toBeLessThan(today.getTime());
    expect(pastTimes).toEqual([...pastTimes].sort((a, b) => b - a));

    // The "next" banner points at the earliest upcoming date, if any.
    const next = nextOccurrence(events, today);
    if (upcoming.length > 0) {
      const earliest = Math.min(...upcoming.flatMap((u) => u.futureDates.map((d) => d.getTime())));
      expect(next?.date.getTime()).toBe(earliest);
    } else {
      expect(next).toBeNull();
    }
  });
});
