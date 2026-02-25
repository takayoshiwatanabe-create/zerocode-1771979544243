import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_STAMP_CARD, type StampCard } from "@/types/stamp";

const STORAGE_KEY = "stamp_card";

export async function loadStampCard(): Promise<StampCard> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return { ...INITIAL_STAMP_CARD, stamps: [...INITIAL_STAMP_CARD.stamps] };
  return JSON.parse(json) as StampCard;
}

export async function saveStampCard(card: StampCard): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(card));
}

export async function resetStampCard(): Promise<StampCard> {
  const current = await loadStampCard();
  const fresh: StampCard = {
    stamps: Array.from({ length: 10 }, () => false),
    completedCount: current.completedCount,
    lastStampedAt: null,
  };
  await saveStampCard(fresh);
  return fresh;
}
