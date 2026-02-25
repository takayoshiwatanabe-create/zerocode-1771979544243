export type ThemeKey = "default" | "animals" | "vehicles" | "space" | "wagara";

export interface ThemeConfig {
  name: string;
  emoji: string;
  stampIcon: string;
  bgColors: [string, string];
  primaryColor: string;
  cardBg: string;
  free: boolean;
  preview?: string;
  darkMode?: boolean;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  default: {
    name: "デフォルト",
    emoji: "⭐",
    stampIcon: "⭐",
    bgColors: ["#87CEEB", "#C8E6F5"],
    primaryColor: "#FF6B35",
    cardBg: "#FFFFFF",
    free: true,
  },
  animals: {
    name: "どうぶつ",
    emoji: "🐾",
    stampIcon: "🐾",
    bgColors: ["#FFF8E1", "#FFE0B2"],
    primaryColor: "#FF8F00",
    cardBg: "#FFFDE7",
    free: false,
    preview: "🐶🐱🐰🐸",
  },
  vehicles: {
    name: "のりもの",
    emoji: "🚗",
    stampIcon: "🚗",
    bgColors: ["#E3F2FD", "#BBDEFB"],
    primaryColor: "#1976D2",
    cardBg: "#F8FBFF",
    free: false,
    preview: "🚗🚂✈️🚀",
  },
  space: {
    name: "うちゅう",
    emoji: "🚀",
    stampIcon: "🌟",
    bgColors: ["#1A1A2E", "#16213E"],
    primaryColor: "#A855F7",
    cardBg: "#1E1E3A",
    free: false,
    preview: "🌟🚀🪐👾",
    darkMode: true,
  },
  wagara: {
    name: "わがら",
    emoji: "🌸",
    stampIcon: "🌸",
    bgColors: ["#FFF0F5", "#FCE4EC"],
    primaryColor: "#E91E8C",
    cardBg: "#FFF9FB",
    free: false,
    preview: "🌸⛩️🎋🍡",
  },
};
