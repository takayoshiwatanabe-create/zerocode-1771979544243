import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StampCard } from "@/types/stamp";

const STORAGE_KEY = "stamp_card";
const GOAL_KEY = "totalGoal";
const DEFAULT_GOAL = 12;

export async function loadTotalGoal(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(GOAL_KEY);
    if (v) {
      const n = parseInt(v, 10);
      if (n >= 3 && n <= 12) return n;
    }
  } catch {}
  return DEFAULT_GOAL;
}

export async function saveTotalGoal(goal: number): Promise<void> {
  await AsyncStorage.setItem(GOAL_KEY, String(goal));
}

function createFreshCard(goal: number, completedCount = 0): StampCard {
  return {
    stamps: Array.from({ length: goal }, () => false),
    completedCount,
    lastStampedAt: null,
  };
}

function isValidStampCard(data: unknown, goal: number): data is StampCard {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    Array.isArray(obj.stamps) &&
    obj.stamps.length === goal &&
    obj.stamps.every((s: unknown) => typeof s === "boolean") &&
    typeof obj.completedCount === "number" &&
    (obj.lastStampedAt === null || typeof obj.lastStampedAt === "string")
  );
}

export async function loadStampCard(goal?: number): Promise<StampCard> {
  const totalGoal = goal ?? await loadTotalGoal();
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return createFreshCard(totalGoal);
    const parsed: unknown = JSON.parse(json);
    if (!isValidStampCard(parsed, totalGoal)) {
      // Try to migrate: keep filled stamps up to new goal
      if (typeof parsed === "object" && parsed !== null && Array.isArray((parsed as any).stamps)) {
        const old = parsed as StampCard;
        const newStamps = Array.from({ length: totalGoal }, (_, i) =>
          i < old.stamps.length ? old.stamps[i] : false
        );
        const migrated: StampCard = {
          stamps: newStamps,
          completedCount: old.completedCount ?? 0,
          lastStampedAt: old.lastStampedAt ?? null,
        };
        await saveStampCard(migrated);
        return migrated;
      }
      return createFreshCard(totalGoal);
    }
    return parsed;
  } catch {
    return createFreshCard(totalGoal);
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

export async function removeStamp(card: StampCard): Promise<StampCard | null> {
  const filledCount = card.stamps.filter(Boolean).length;
  if (filledCount <= 0) return null;

  // Find the last filled index
  const newStamps = [...card.stamps];
  for (let i = newStamps.length - 1; i >= 0; i--) {
    if (newStamps[i]) {
      newStamps[i] = false;
      break;
    }
  }

  const updated: StampCard = {
    stamps: newStamps,
    completedCount: card.completedCount,
    lastStampedAt: card.lastStampedAt,
  };

  await saveStampCard(updated);
  return updated;
}

export async function resetStampCard(): Promise<StampCard> {
  const goal = await loadTotalGoal();
  const current = await loadStampCard(goal);
  const fresh = createFreshCard(goal, current.completedCount);
  await saveStampCard(fresh);
  return fresh;
}

export async function clearAllData(): Promise<StampCard> {
  const goal = await loadTotalGoal();
  const fresh = createFreshCard(goal);
  await saveStampCard(fresh);
  return fresh;
}
