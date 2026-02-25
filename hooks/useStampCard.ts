import { useState, useEffect, useCallback } from "react";
import type { StampCard } from "@/types/stamp";
import { INITIAL_STAMP_CARD, MAX_STAMPS, toStampSlots } from "@/types/stamp";
import {
  loadStampCard,
  addStamp,
  resetStampCard,
  clearAllData,
} from "@/utils/storage";

interface UseStampCardReturn {
  card: StampCard;
  isLoading: boolean;
  isComplete: boolean;
  currentCount: number;
  slots: ReturnType<typeof toStampSlots>;
  handleAddStamp: () => Promise<boolean>;
  handleReset: () => Promise<void>;
  handleClearAll: () => Promise<void>;
}

export function useStampCard(): UseStampCardReturn {
  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStampCard()
      .then(setCard)
      .finally(() => setIsLoading(false));
  }, []);

  const isComplete = card.stamps.every(Boolean);
  const currentCount = card.stamps.filter(Boolean).length;
  const slots = toStampSlots(card.stamps);

  const handleAddStamp = useCallback(async (): Promise<boolean> => {
    const updated = await addStamp(card);
    if (!updated) return false;
    setCard(updated);
    return updated.stamps.every(Boolean);
  }, [card]);

  const handleReset = useCallback(async () => {
    const fresh = await resetStampCard();
    setCard(fresh);
  }, []);

  const handleClearAll = useCallback(async () => {
    const fresh = await clearAllData();
    setCard(fresh);
  }, []);

  return {
    card,
    isLoading,
    isComplete,
    currentCount,
    slots,
    handleAddStamp,
    handleReset,
    handleClearAll,
  };
}
