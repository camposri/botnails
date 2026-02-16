import { describe, expect, it } from "vitest";
import {
  DEFAULT_AVAILABILITY,
  buildSlotStartsForDate,
  normalizeAvailability,
} from "@/lib/availability";

describe("availability", () => {
  it("normalizes invalid input to default", () => {
    expect(normalizeAvailability(null)).toEqual(DEFAULT_AVAILABILITY);
    expect(normalizeAvailability({ version: 2 })).toEqual(DEFAULT_AVAILABILITY);
  });

  it("builds slots for enabled weekday", () => {
    const date = new Date("2026-02-16T12:00:00Z");
    const slots = buildSlotStartsForDate(DEFAULT_AVAILABILITY, date, 60);
    expect(slots[0]).toBe("09:00");
    expect(slots.includes("17:30")).toBe(false);
  });

  it("returns no slots for disabled day", () => {
    const date = new Date("2026-02-15T12:00:00Z");
    const slots = buildSlotStartsForDate(DEFAULT_AVAILABILITY, date, 30);
    expect(slots.length).toBe(0);
  });
});

