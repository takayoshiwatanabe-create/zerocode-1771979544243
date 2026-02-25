export interface Milestone {
  id: string;
  count: number;
  rewardName: string;
  rewardEmoji: string;
  achieved: boolean;
  achievedAt?: string;
}

export const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    count: 10,
    rewardName: "お菓子を買う",
    rewardEmoji: "🍬",
    achieved: false,
  },
];

export const EMOJI_OPTIONS = [
  "🍬", "🍦", "🍰", "🎂", "🍕", "🍩",
  "📚", "🎮", "🎬", "🎡", "⭐", "🎁",
  "🐶", "🐱", "🌟", "🏆", "🎯", "🚀",
];
