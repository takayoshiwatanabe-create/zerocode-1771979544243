import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Milestone } from "@/types/milestone";
import { DEFAULT_MILESTONES } from "@/types/milestone";

const MILESTONE_KEY = "milestones";

export async function loadMilestones(): Promise<Milestone[]> {
  try {
    const json = await AsyncStorage.getItem(MILESTONE_KEY);
    if (!json) return DEFAULT_MILESTONES;
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_MILESTONES;
  } catch {
    return DEFAULT_MILESTONES;
  }
}

export async function saveMilestones(milestones: Milestone[]): Promise<void> {
  await AsyncStorage.setItem(MILESTONE_KEY, JSON.stringify(milestones));
}

export async function checkAndUpdateMilestones(
  totalStamps: number
): Promise<{ milestones: Milestone[]; newlyAchieved: Milestone[] }> {
  const milestones = await loadMilestones();
  const newlyAchieved: Milestone[] = [];

  const updated = milestones.map((ms) => {
    if (!ms.achieved && totalStamps >= ms.count) {
      newlyAchieved.push({ ...ms, achieved: true, achievedAt: new Date().toISOString() });
      return { ...ms, achieved: true, achievedAt: new Date().toISOString() };
    }
    return ms;
  });

  if (newlyAchieved.length > 0) {
    await saveMilestones(updated);
  }

  return { milestones: updated, newlyAchieved };
}
