import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAX_STAMPS, type StampCard } from "@/types/stamp";

const STORAGE_KEY = "stamp_card";

function createFreshCard(completedCount = 0): StampCard {
  return {
    stamps: Array.from({ length: MAX_STAMPS }, () => false),
    completedCount,
    lastStampedAt: null,
  };
}

function isValidStampCard(data: unknown): data is StampCard {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.stamps) &&
    obj.stamps.length === MAX_STAMPS &&
    obj.stamps.every((s: unknown) => typeof s === "boolean") &&
    typeof obj.completedCount === "number" &&
    (obj.lastStampedAt === null || typeof obj.lastStampedAt === "string")
  );
}

export async function loadStampCard(): Promise<StampCard> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return createFreshCard();
    const parsed: unknown = JSON.parse(json);
    if (!isValidStampCard(parsed)) return createFreshCard();
    return parsed;
  } catch {
    return createFreshCard();
  }
}

export async function saveStampCard(card: StampCard): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(card));
}

export async function addStamp(card: StampCard): Promise<StampCard | null> {
  const nextIndex = card.stamps.findIndex((s) => !s);
  if (nextIndex === -1) return null;

  const newStamps = [...card.stamps];
  newStamps[nextIndex] = true;

  const isComplete = newStamps.every(Boolean);
  const updated: StampCard = {
    stamps: newStamps,
    completedCount: isComplete ? card.completedCount + 1 : card.completedCount,
    lastStampedAt: new Date().toISOString(),
  };

  await saveStampCard(updated);
  return updated;
}

export async function resetStampCard(): Promise<StampCard> {
  const current = await loadStampCard();
  const fresh = createFreshCard(current.completedCount);
  await saveStampCard(fresh);
  return fresh;
}

export async function clearAllData(): Promise<StampCard> {
  const fresh = createFreshCard();
  await saveStampCard(fresh);
  return fresh;
}
