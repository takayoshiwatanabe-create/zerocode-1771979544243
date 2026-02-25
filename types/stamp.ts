export interface StampCard {
  stamps: boolean[];
  completedCount: number;
  lastStampedAt: string | null;
}

export const MAX_STAMPS = 10;

export const INITIAL_STAMP_CARD: StampCard = {
  stamps: Array.from({ length: MAX_STAMPS }, () => false),
  completedCount: 0,
  lastStampedAt: null,
};
