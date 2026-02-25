export type StampStatus = "empty" | "filled";

export interface StampSlot {
  index: number;
  status: StampStatus;
}

export interface StampCard {
  stamps: boolean[];
  completedCount: number;
  lastStampedAt: string | null;
}

export const MAX_STAMPS = 12;

export const INITIAL_STAMP_CARD: StampCard = {
  stamps: Array.from({ length: MAX_STAMPS }, () => false),
  completedCount: 0,
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
