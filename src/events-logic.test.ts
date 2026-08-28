import { describe, it, expect } from "vitest";
import { parseEventDate, startOfToday } from "./events-logic.ts";

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
