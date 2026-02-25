import { describe, it, expect, beforeEach } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadStampCard,
  saveStampCard,
  addStamp,
  resetStampCard,
  clearAllData,
} from "@/utils/storage";
import { MAX_STAMPS, type StampCard } from "@/types/stamp";

function createEmptyCard(completedCount = 0): StampCard {
  return {
    stamps: Array.from({ length: MAX_STAMPS }, () => false),
    completedCount,
    lastStampedAt: null,
  };
}

function createFullCard(completedCount = 1): StampCard {
  return {
    stamps: Array.from({ length: MAX_STAMPS }, () => true),
    completedCount,
    lastStampedAt: new Date().toISOString(),
  };
}

function createPartialCard(filledCount: number): StampCard {
  const stamps = Array.from({ length: MAX_STAMPS }, (_, i) => i < filledCount);
  return { stamps, completedCount: 0, lastStampedAt: null };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("loadStampCard", () => {
  it("returns fresh card when storage is empty", async () => {
    const card = await loadStampCard();
    expect(card).toEqual(createEmptyCard());
  });

  it("loads saved card from storage", async () => {
    const saved: StampCard = {
      stamps: [true, true, false, false, false, false, false, false, false, false],
      completedCount: 3,
      lastStampedAt: "2024-01-01T00:00:00.000Z",
    };
    await AsyncStorage.setItem("stamp_card", JSON.stringify(saved));

    const card = await loadStampCard();
    expect(card).toEqual(saved);
  });

  it("returns fresh card for invalid JSON", async () => {
    await AsyncStorage.setItem("stamp_card", "not-json");
    const card = await loadStampCard();
    expect(card).toEqual(createEmptyCard());
  });

  it("returns fresh card for invalid stamp card structure", async () => {
    await AsyncStorage.setItem("stamp_card", JSON.stringify({ stamps: [1, 2, 3] }));
    const card = await loadStampCard();
    expect(card).toEqual(createEmptyCard());
  });

  it("returns fresh card when stamps array has wrong length", async () => {
    const invalid = { stamps: [true, false], completedCount: 0, lastStampedAt: null };
    await AsyncStorage.setItem("stamp_card", JSON.stringify(invalid));
    const card = await loadStampCard();
    expect(card).toEqual(createEmptyCard());
  });

  it("returns fresh card when stamps contain non-boolean values", async () => {
    const invalid = {
      stamps: Array.from({ length: MAX_STAMPS }, () => "yes"),
      completedCount: 0,
      lastStampedAt: null,
    };
    await AsyncStorage.setItem("stamp_card", JSON.stringify(invalid));
    const card = await loadStampCard();
    expect(card).toEqual(createEmptyCard());
  });
});

describe("saveStampCard", () => {
  it("persists card to storage", async () => {
    const card = createPartialCard(3);
    await saveStampCard(card);

    const stored = await AsyncStorage.getItem("stamp_card");
    expect(JSON.parse(stored!)).toEqual(card);
  });
});

describe("addStamp", () => {
  it("fills the first empty slot", async () => {
    const card = createEmptyCard();
    const updated = await addStamp(card);

    expect(updated).not.toBeNull();
    expect(updated!.stamps[0]).toBe(true);
    expect(updated!.stamps.slice(1).every((s) => !s)).toBe(true);
  });

  it("fills the next available slot", async () => {
    const card = createPartialCard(3);
    const updated = await addStamp(card);

    expect(updated).not.toBeNull();
    expect(updated!.stamps[3]).toBe(true);
    expect(updated!.stamps.filter(Boolean)).toHaveLength(4);
  });

  it("returns null when card is already full", async () => {
    const card = createFullCard();
    const updated = await addStamp(card);
    expect(updated).toBeNull();
  });

  it("increments completedCount when filling the last stamp", async () => {
    const card = createPartialCard(MAX_STAMPS - 1);
    card.completedCount = 2;
    const updated = await addStamp(card);

    expect(updated).not.toBeNull();
    expect(updated!.stamps.every(Boolean)).toBe(true);
    expect(updated!.completedCount).toBe(3);
  });

  it("does not increment completedCount for non-completing stamps", async () => {
    const card = createPartialCard(5);
    card.completedCount = 1;
    const updated = await addStamp(card);

    expect(updated!.completedCount).toBe(1);
  });

  it("sets lastStampedAt to a valid ISO string", async () => {
    const card = createEmptyCard();
    const before = new Date().toISOString();
    const updated = await addStamp(card);
    const after = new Date().toISOString();

    expect(updated!.lastStampedAt).not.toBeNull();
    expect(updated!.lastStampedAt! >= before).toBe(true);
    expect(updated!.lastStampedAt! <= after).toBe(true);
  });

  it("persists the updated card to storage", async () => {
    const card = createEmptyCard();
    await addStamp(card);

    const stored = await AsyncStorage.getItem("stamp_card");
    const parsed = JSON.parse(stored!);
    expect(parsed.stamps[0]).toBe(true);
  });
});

describe("resetStampCard", () => {
  it("clears all stamps", async () => {
    const card = createPartialCard(5);
    card.completedCount = 2;
    await saveStampCard(card);

    const fresh = await resetStampCard();
    expect(fresh.stamps.every((s) => !s)).toBe(true);
  });

  it("preserves completedCount", async () => {
    const card = createPartialCard(5);
    card.completedCount = 3;
    await saveStampCard(card);

    const fresh = await resetStampCard();
    expect(fresh.completedCount).toBe(3);
  });

  it("resets lastStampedAt to null", async () => {
    const card = createPartialCard(5);
    card.lastStampedAt = "2024-01-01T00:00:00.000Z";
    await saveStampCard(card);

    const fresh = await resetStampCard();
    expect(fresh.lastStampedAt).toBeNull();
  });
});

describe("clearAllData", () => {
  it("resets everything including completedCount", async () => {
    const card = createFullCard(5);
    await saveStampCard(card);

    const fresh = await clearAllData();
    expect(fresh).toEqual(createEmptyCard());
  });

  it("persists the cleared card", async () => {
    const card = createFullCard(5);
    await saveStampCard(card);
    await clearAllData();

    const loaded = await loadStampCard();
    expect(loaded.completedCount).toBe(0);
  });
});
