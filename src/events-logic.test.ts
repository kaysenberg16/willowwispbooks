import { describe, it, expect } from "vitest";
import {
  parseEventDate, startOfToday,
  splitEvents, nextOccurrence, formatChip, formatFull, isWithinDays,
  type WWEvent,
} from "./events-logic.ts";

const TODAY = new Date(2026, 7, 27); // Aug 27, 2026

const sample: WWEvent[] = [
  { name: "Farmers Market", place: "Maple Valley, WA",
    dates: ["2026-05-02", "2026-08-01", "2026-09-05", "2026-10-03"] },
  { name: "NW Metaphysical", place: "Tacoma, WA",
    dates: ["2026-07-25", "2026-08-22"] },
  { name: "Bees in the Burbs", place: "Maple Valley, WA",
    dates: [{ date: "2026-04-04", photos: ["/images/Bees.jpeg"] }] },
];

describe("parseEventDate", () => {
  it("parses an ISO date into a local midnight Date", () => {
    const d = parseEventDate("2026-09-05");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // September is month 8
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(0);
  });
});

describe("startOfToday", () => {
  it("strips the time off a Date", () => {
    const d = startOfToday(new Date(2026, 7, 27, 14, 30, 5));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(27);
  });
});

describe("splitEvents", () => {
  const { upcoming, past } = splitEvents(sample, TODAY);

  it("keeps only events with a future date in upcoming", () => {
    expect(upcoming.map((u) => u.event.name)).toEqual(["Farmers Market"]);
  });

  it("keeps only the future dates within an upcoming event, sorted ascending", () => {
    const chips = upcoming[0].futureDates.map(formatChip);
    expect(chips).toEqual(["Sep 5", "Oct 3"]);
  });

  it("lists every past date as its own past occurrence, newest first", () => {
    expect(past.map((p) => formatFull(p.occurrence.date))).toEqual([
      "Aug 22, 2026", "Aug 1, 2026", "Jul 25, 2026", "May 2, 2026", "Apr 4, 2026",
    ]);
  });

  it("preserves photos on a past occurrence", () => {
    const bees = past.find((p) => p.event.name === "Bees in the Burbs");
    expect(bees?.occurrence.photos).toEqual(["/images/Bees.jpeg"]);
  });
});

describe("nextOccurrence", () => {
  it("returns the single soonest future occurrence", () => {
    const n = nextOccurrence(sample, TODAY);
    expect(n?.event.name).toBe("Farmers Market");
    expect(formatFull(n!.date)).toBe("Sep 5, 2026");
  });

  it("returns null when nothing is upcoming", () => {
    expect(nextOccurrence([sample[1], sample[2]], TODAY)).toBeNull();
  });
});

describe("formatters", () => {
  it("formatChip omits the year", () => {
    expect(formatChip(new Date(2026, 8, 5))).toBe("Sep 5");
  });
  it("formatFull includes the year", () => {
    expect(formatFull(new Date(2026, 8, 5))).toBe("Sep 5, 2026");
  });
  it("isWithinDays is true for a near future date and false for a far one", () => {
    expect(isWithinDays(new Date(2026, 8, 5), TODAY, 21)).toBe(true);
    expect(isWithinDays(new Date(2026, 9, 30), TODAY, 21)).toBe(false);
    expect(isWithinDays(new Date(2026, 7, 20), TODAY, 21)).toBe(false); // past
  });
});
