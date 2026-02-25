export type StampStatus = "empty" | "filled";

export interface StampSlot {
  index: number;
  status: StampStatus;
}

export interface StampCard {
  stamps: boolean[];
  completedCount: number;
  totalEarnedStamps: number;
  lastStampedAt: string | null;
}

export const DEFAULT_GOAL = 12;
/** @deprecated Use dynamic goal from storage instead */
export const MAX_STAMPS = DEFAULT_GOAL;

export const INITIAL_STAMP_CARD: StampCard = {
  stamps: Array.from({ length: DEFAULT_GOAL }, () => false),
  completedCount: 0,
  totalEarnedStamps: 0,
  lastStampedAt: null,
};

export function getStampStatus(filled: boolean): StampStatus {
  return filled ? "filled" : "empty";
}

export function toStampSlots(stamps: boolean[]): StampSlot[] {
  return stamps.map((filled, index) => ({
    index,
    status: getStampStatus(filled),
  }));
}
