import { describe, it, expect } from "@jest/globals";
import {
  MAX_STAMPS,
  INITIAL_STAMP_CARD,
  getStampStatus,
  toStampSlots,
} from "@/types/stamp";

describe("MAX_STAMPS", () => {
  it("is 10", () => {
    expect(MAX_STAMPS).toBe(10);
  });
});

describe("INITIAL_STAMP_CARD", () => {
  it("has all stamps empty", () => {
    expect(INITIAL_STAMP_CARD.stamps).toHaveLength(MAX_STAMPS);
    expect(INITIAL_STAMP_CARD.stamps.every((s) => s === false)).toBe(true);
  });

  it("has completedCount of 0", () => {
    expect(INITIAL_STAMP_CARD.completedCount).toBe(0);
  });

  it("has null lastStampedAt", () => {
    expect(INITIAL_STAMP_CARD.lastStampedAt).toBeNull();
  });
});

describe("getStampStatus", () => {
  it('returns "filled" when true', () => {
    expect(getStampStatus(true)).toBe("filled");
  });

  it('returns "empty" when false', () => {
    expect(getStampStatus(false)).toBe("empty");
  });
});

describe("toStampSlots", () => {
  it("converts boolean array to StampSlot array", () => {
    const stamps = [true, false, true, false, false, false, false, false, false, false];
    const slots = toStampSlots(stamps);

    expect(slots).toHaveLength(10);
    expect(slots[0]).toEqual({ index: 0, status: "filled" });
    expect(slots[1]).toEqual({ index: 1, status: "empty" });
    expect(slots[2]).toEqual({ index: 2, status: "filled" });
  });

  it("returns all empty slots for fresh card", () => {
    const slots = toStampSlots(INITIAL_STAMP_CARD.stamps);
    expect(slots.every((s) => s.status === "empty")).toBe(true);
  });

  it("returns all filled slots for complete card", () => {
    const stamps = Array.from({ length: MAX_STAMPS }, () => true);
    const slots = toStampSlots(stamps);
    expect(slots.every((s) => s.status === "filled")).toBe(true);
  });

  it("preserves correct index values", () => {
    const stamps = Array.from({ length: MAX_STAMPS }, () => false);
    const slots = toStampSlots(stamps);
    slots.forEach((slot, i) => {
      expect(slot.index).toBe(i);
    });
  });
});
