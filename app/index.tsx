import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import {
  loadStampCard,
  addStamp,
  removeStamp,
  resetStampCard,
  clearAllData,
  saveStampCard,
  loadTotalGoal,
  saveTotalGoal,
} from "@/utils/storage";
import {
  loadMilestones,
  saveMilestones,
  checkAndUpdateMilestones,
} from "@/utils/milestoneStorage";
import { Colors } from "@/constants/colors";
import { THEMES, type ThemeKey, type ThemeConfig } from "@/constants/themes";
import { type StampCard, INITIAL_STAMP_CARD } from "@/types/stamp";
import type { Milestone } from "@/types/milestone";
import { EMOJI_OPTIONS } from "@/types/milestone";
import { usePremium } from "@/hooks/usePremium";
import { PaywallModal } from "@/components/PaywallModal";
import { AdBanner } from "@/components/AdBanner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

// ── Grid layout logic ──
function getGridCols(goal: number): number {
  switch (goal) {
    case 3: return 3;
    case 4: return 2;
    case 5: return 3;
    case 6: return 3;
    case 7: return 4;
    case 8: return 4;
    case 9: return 3;
    case 10: return 5;
    case 11: return 4;
    case 12: return 4;
    default: return 4;
  }
}

function getCellSize(cols: number): number {
  const raw = Math.floor((CARD_WIDTH - 32 - (cols - 1) * 8) / cols);
  return Math.max(44, Math.min(80, raw));
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Cloud decoration ──
function Cloud({ style }: { style: object }) {
  return (
    <View style={[styles.cloud, style]}>
      <View style={[styles.cloudBall, { width: 60, height: 40, top: 10, left: 0 }]} />
      <View style={[styles.cloudBall, { width: 80, height: 50, top: 0, left: 20 }]} />
      <View style={[styles.cloudBall, { width: 60, height: 40, top: 10, left: 50 }]} />
    </View>
  );
}

// ── Star character ──
function StarCharacter({
  size = 50,
  bounceAnim,
  style,
  stampIcon = "⭐",
}: {
  size?: number;
  bounceAnim: Animated.SharedValue<number>;
  style?: object;
  stampIcon?: string;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceAnim.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.2, alignItems: "center" }, style, animStyle]}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: size * 0.9, textAlign: "center" }}>{stampIcon}</Text>
        <View style={{ position: "absolute", alignItems: "center", justifyContent: "center", top: size * 0.25 }}>
          <View style={{ flexDirection: "row", gap: size * 0.15 }}>
            <View style={{ width: size * 0.08, height: size * 0.08, borderRadius: size * 0.04, backgroundColor: "#333" }} />
            <View style={{ width: size * 0.08, height: size * 0.08, borderRadius: size * 0.04, backgroundColor: "#333" }} />
          </View>
          <View style={{ flexDirection: "row", gap: size * 0.25, marginTop: 1 }}>
            <View style={{ width: size * 0.1, height: size * 0.06, borderRadius: size * 0.05, backgroundColor: "#FF999980" }} />
            <View style={{ width: size * 0.1, height: size * 0.06, borderRadius: size * 0.05, backgroundColor: "#FF999980" }} />
          </View>
          <View style={{
            width: size * 0.12, height: size * 0.06,
            borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06,
            borderBottomWidth: 2, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#333", marginTop: 1,
          }} />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Rainbow arch ──
function RainbowArch() {
  const rainbowColors = ["#FF6B6B", "#FFA559", "#FFE66D", "#7BC67E", "#5BC8F5", "#7B68EE", "#BA68C8"];
  const baseRadius = 120;
  const thickness = 8;

  return (
    <View style={styles.rainbowContainer}>
      {rainbowColors.map((color, i) => {
        const r = baseRadius - i * thickness;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              width: r * 2, height: r,
              borderTopLeftRadius: r, borderTopRightRadius: r,
              borderWidth: thickness, borderBottomWidth: 0, borderColor: color,
              bottom: 0, left: (baseRadius * 2 - r * 2) / 2,
            }}
          />
        );
      })}
      <Text style={[styles.rainbowCloud, { left: -5, bottom: -5 }]}>☁️</Text>
      <Text style={[styles.rainbowCloud, { right: -5, bottom: -5 }]}>☁️</Text>
    </View>
  );
}

// ── Stamp particle burst ──
function StampParticles({ visible, x, y }: { visible: boolean; x: number; y: number }) {
  const particles = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2 + Math.random() * 0.5,
      color: ["#FFD700", "#FF6B6B", "#5BC8F5", "#7BC67E", "#FF9DD2"][i],
    }))
  ).current;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    }
  }, [visible, progress]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleDot key={i} angle={p.angle} color={p.color} cx={x} cy={y} progress={progress} />
      ))}
    </View>
  );
}

function ParticleDot({
  angle, color, cx, cy, progress,
}: {
  angle: number; color: string; cx: number; cy: number;
  progress: Animated.SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => {
    const dist = interpolate(progress.value, [0, 1], [0, 40]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [1, 1, 0]);
    const scale = interpolate(progress.value, [0, 0.3, 1], [0, 1.5, 0.3]);
    return {
      opacity,
      transform: [
        { translateX: Math.cos(angle) * dist },
        { translateY: Math.sin(angle) * dist },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute", left: cx - 4, top: cy - 4,
          width: 8, height: 8, borderRadius: 4, backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

// ── Single stamp slot ──
function StampSlotCell({
  filled,
  index,
  justFilled,
  cellSize,
  isLastFilled,
  onLongPress,
  stampIcon = "⭐",
}: {
  filled: boolean;
  index: number;
  justFilled: boolean;
  cellSize: number;
  isLastFilled: boolean;
  onLongPress: () => void;
  stampIcon?: string;
}) {
  const scale = useSharedValue(filled && !justFilled ? 1 : 0);

  useEffect(() => {
    if (justFilled) {
      scale.value = 0;
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    } else if (filled) {
      scale.value = 1;
    } else {
      scale.value = 0;
    }
  }, [filled, justFilled, scale]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fontSize = Math.max(18, cellSize * 0.55);

  return (
    <Pressable
      onLongPress={isLastFilled ? onLongPress : undefined}
      delayLongPress={500}
      style={[
        styles.stampSlot,
        {
          width: cellSize,
          height: cellSize,
          borderRadius: cellSize / 2,
        },
      ]}
    >
      {filled ? (
        <Animated.Text style={[{ fontSize, textAlign: "center" }, starStyle]}>{stampIcon}</Animated.Text>
      ) : null}
    </Pressable>
  );
}

// ── Toast notification ──
function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1200, withTiming(0, { duration: 300 })),
      );
    }
  }, [visible, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, animStyle]} pointerEvents="none">
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ── Emoji Picker Modal ──
function EmojiPickerModal({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.emojiPickerOverlay} onPress={onClose}>
        <View style={styles.emojiPickerContent}>
          <Text style={styles.emojiPickerTitle}>えらんでね</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
                style={styles.emojiOption}
              >
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Settings Modal ──
function SettingsModal({
  visible,
  currentGoal,
  onChangeGoal,
  onUndo,
  canUndo,
  onResetTotal,
  onResetAll,
  onClose,
  isPremium,
  currentTheme,
  onChangeTheme,
  milestones,
  onUpdateMilestones,
  onShowPaywall,
}: {
  visible: boolean;
  currentGoal: number;
  onChangeGoal: (goal: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  onResetTotal: () => void;
  onResetAll: () => void;
  onClose: () => void;
  isPremium: boolean;
  currentTheme: ThemeKey;
  onChangeTheme: (key: ThemeKey) => void;
  milestones: Milestone[];
  onUpdateMilestones: (milestones: Milestone[]) => void;
  onShowPaywall: (reason: "theme" | "milestone" | "roadmap" | "general") => void;
}) {
  const goals = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [editingEmojiIdx, setEditingEmojiIdx] = useState<number | null>(null);

  const addMilestone = () => {
    const nextCount = milestones.length > 0
      ? milestones[milestones.length - 1].count + 10
      : 10;
    const newMs: Milestone = {
      id: `ms-${Date.now()}`,
      count: nextCount,
      rewardName: "",
      rewardEmoji: "🎁",
      achieved: false,
    };
    onUpdateMilestones([...milestones, newMs]);
  };

  const removeMilestone = (idx: number) => {
    onUpdateMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx: number, updates: Partial<Milestone>) => {
    const updated = milestones.map((ms, i) =>
      i === idx ? { ...ms, ...updates } : ms
    );
    onUpdateMilestones(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>⚙️ せってい</Text>

            {/* Theme selector */}
            <Text style={styles.modalSectionTitle}>テーマ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themeScroll}
            >
              {(Object.entries(THEMES) as [ThemeKey, ThemeConfig][]).map(
                ([key, theme]) => {
                  const locked = !theme.free && !isPremium;
                  const selected = currentTheme === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        if (locked) {
                          onShowPaywall("theme");
                          return;
                        }
                        onChangeTheme(key);
                      }}
                      style={[
                        styles.themeCard,
                        selected && styles.themeCardSelected,
                        locked && styles.themeCardLocked,
                      ]}
                    >
                      <LinearGradient
                        colors={theme.bgColors}
                        style={styles.themePreview}
                      >
                        <Text style={{ fontSize: 24 }}>{theme.emoji}</Text>
                        {locked && (
                          <View style={styles.lockBadge}>
                            <Text style={{ fontSize: 12 }}>🔒</Text>
                          </View>
                        )}
                      </LinearGradient>
                      <Text style={styles.themeName}>{theme.name}</Text>
                      {!theme.free && !isPremium && (
                        <Text style={styles.premiumBadge}>PRO</Text>
                      )}
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            {/* Stamp count selector */}
            <Text style={styles.modalSectionTitle}>スタンプのかず</Text>
            <View style={styles.goalGrid}>
              {goals.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => onChangeGoal(g)}
                  style={[
                    styles.goalButton,
                    g === currentGoal && styles.goalButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalButtonText,
                      g === currentGoal && styles.goalButtonTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Milestone settings */}
            <View style={styles.milestoneSection}>
              <View style={styles.milestoneSectionHeader}>
                <Text style={styles.modalSectionTitle}>ごほうびマイルストーン</Text>
                {!isPremium && (
                  <Pressable
                    onPress={() => onShowPaywall("milestone")}
                    style={styles.proBadgeLarge}
                  >
                    <Text style={styles.proBadgeLargeText}>✨ PROで解放</Text>
                  </Pressable>
                )}
              </View>

              {isPremium ? (
                <>
                  {milestones.map((ms, i) => (
                    <View key={ms.id} style={styles.milestoneRow}>
                      <Text style={styles.milestoneCount}>🎯 {ms.count}こ</Text>
                      <Pressable
                        onPress={() => setEditingEmojiIdx(i)}
                        style={styles.emojiBtn}
                      >
                        <Text style={{ fontSize: 24 }}>{ms.rewardEmoji}</Text>
                      </Pressable>
                      <TextInput
                        value={ms.rewardName}
                        onChangeText={(text) =>
                          updateMilestone(i, { rewardName: text })
                        }
                        placeholder="ごほうびを入力..."
                        style={styles.milestoneInput}
                      />
                      <Pressable onPress={() => removeMilestone(i)}>
                        <Text style={{ color: "#EF4444", fontSize: 16 }}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                  <Pressable onPress={addMilestone} style={styles.addMilestoneBtn}>
                    <Text style={styles.addMilestoneBtnText}>
                      + {milestones.length > 0
                        ? milestones[milestones.length - 1].count + 10
                        : 10}
                      こ目のごほうびを追加
                    </Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.lockedPreview}>
                  {[10, 20, 30].map((n) => (
                    <View key={n} style={[styles.milestoneRow, { opacity: 0.4 }]}>
                      <Text style={styles.milestoneCount}>🎯 {n}こ</Text>
                      <Text style={{ fontSize: 24 }}>🍦</Text>
                      <Text style={[styles.milestoneInput, { color: "#999" }]}>
                        アイスを買ってもらう
                      </Text>
                    </View>
                  ))}
                  <Pressable
                    style={styles.lockOverlay}
                    onPress={() => onShowPaywall("milestone")}
                  >
                    <Text style={styles.lockText}>🔒 プレミアムで解放</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Undo button */}
            <Pressable
              onPress={() => {
                if (!canUndo) return;
                Alert.alert(
                  "スタンプをもどす",
                  "さいごのスタンプを1こもどしますか？",
                  [
                    { text: "キャンセル", style: "cancel" },
                    { text: "もどす", style: "destructive", onPress: onUndo },
                  ],
                );
              }}
              style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
            >
              <Text style={[styles.undoButtonText, !canUndo && styles.undoButtonTextDisabled]}>
                ↩️ スタンプを1こもどす
              </Text>
            </Pressable>

            {/* Danger zone */}
            <View style={styles.dangerZone}>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    "スタンプ総合計をリセット",
                    "これまでのスタンプ総合計（⭐の数）が0になります。\n現在のカードのスタンプは変わりません。\nよろしいですか？",
                    [
                      { text: "キャンセル", style: "cancel" },
                      { text: "リセット", style: "destructive", onPress: onResetTotal },
                    ],
                  );
                }}
                style={styles.resetTotalButton}
              >
                <Text style={styles.resetTotalButtonText}>⭐ 総合計をリセット</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Alert.alert(
                    "すべてリセット",
                    "現在のカードのスタンプと総合計を\nすべて0にします。本当によろしいですか？",
                    [
                      { text: "キャンセル", style: "cancel" },
                      { text: "すべてリセット", style: "destructive", onPress: onResetAll },
                    ],
                  );
                }}
                style={styles.resetAllButton}
              >
                <Text style={styles.resetAllButtonText}>🗑️ すべてリセット</Text>
              </Pressable>
            </View>

            {/* Close button */}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>とじる</Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Emoji picker */}
          <EmojiPickerModal
            visible={editingEmojiIdx !== null}
            onSelect={(emoji) => {
              if (editingEmojiIdx !== null) {
                updateMilestone(editingEmojiIdx, { rewardEmoji: emoji });
              }
            }}
            onClose={() => setEditingEmojiIdx(null)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ──
export default function HomeScreen() {
  const router = useRouter();
  const { isPremium, price, purchasePremium, restorePurchases } = usePremium();

  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [totalGoal, setTotalGoal] = useState(12);
  const [lastFilledIndex, setLastFilledIndex] = useState(-1);
  const [particlePos, setParticlePos] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false, x: 0, y: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("default");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [paywallReason, setPaywallReason] = useState<"theme" | "milestone" | "roadmap" | "general" | null>(null);

  const theme = THEMES[currentTheme];

  // Sound refs
  const stampSound = useRef<Audio.Sound | null>(null);
  const completeSound = useRef<Audio.Sound | null>(null);
  const undoSound = useRef<Audio.Sound | null>(null);

  // Animations
  const buttonScale = useSharedValue(1);
  const starBounce = useSharedValue(0);
  const star2Bounce = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  // Load sounds
  useEffect(() => {
    async function loadSounds() {
      try {
        const { sound: s1 } = await Audio.Sound.createAsync(require("@/assets/sounds/stamp.wav"));
        stampSound.current = s1;
        const { sound: s2 } = await Audio.Sound.createAsync(require("@/assets/sounds/complete.wav"));
        completeSound.current = s2;
        const { sound: s3 } = await Audio.Sound.createAsync(require("@/assets/sounds/undo.wav"));
        undoSound.current = s3;
      } catch {}
    }
    loadSounds();
    return () => {
      stampSound.current?.unloadAsync();
      completeSound.current?.unloadAsync();
      undoSound.current?.unloadAsync();
    };
  }, []);

  const playSound = async (sound: Audio.Sound | null) => {
    try {
      if (!sound) return;
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      setLastFilledIndex(-1);
      // Load theme
      AsyncStorage.getItem("theme").then((v) => {
        if (v && v in THEMES) setCurrentTheme(v as ThemeKey);
      });
      // Load milestones
      loadMilestones().then(setMilestones);
      // Load card
      loadTotalGoal().then((goal) => {
        setTotalGoal(goal);
        loadStampCard(goal).then(setCard);
      });
    }, [])
  );

  // Star character bouncing
  useEffect(() => {
    starBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
    star2Bounce.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true,
      ),
    );
  }, [starBounce, star2Bounce]);

  const currentCount = card.stamps.filter(Boolean).length;
  const remaining = totalGoal - currentCount;
  const allFilled = currentCount >= totalGoal;
  const gridCols = getGridCols(totalGoal);
  const cellSize = getCellSize(gridCols);
  const gridGap = Math.max(6, Math.min(12, cellSize * 0.15));
  const totalStamps = card.completedCount * totalGoal + currentCount;

  const lastFilledStampIndex = (() => {
    for (let i = card.stamps.length - 1; i >= 0; i--) {
      if (card.stamps[i]) return i;
    }
    return -1;
  })();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  };

  const navigateToReward = useCallback(() => {
    router.push("/reward");
  }, [router]);

  const handleStampPress = async () => {
    if (allFilled) return;

    buttonScale.value = withSequence(
      withTiming(0.93, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updated = await addStamp(card);
    if (!updated) return;

    const newIndex = updated.stamps.findIndex((s, i) => s && !card.stamps[i]);
    setLastFilledIndex(newIndex);
    setCard(updated);

    // Check milestones
    const newTotal = updated.completedCount * totalGoal + updated.stamps.filter(Boolean).length;
    const { milestones: updatedMs, newlyAchieved } = await checkAndUpdateMilestones(newTotal);
    if (newlyAchieved.length > 0) {
      setMilestones(updatedMs);
      showToast(`🎯 ${newlyAchieved[0].rewardEmoji} ${newlyAchieved[0].rewardName} 達成！`);
    }

    // Particle burst position
    const col = newIndex % gridCols;
    const row = Math.floor(newIndex / gridCols);
    const gridWidth = gridCols * (cellSize + gridGap) - gridGap;
    const gridStartX = (CARD_WIDTH - gridWidth) / 2;
    const px = gridStartX + col * (cellSize + gridGap) + cellSize / 2;
    const py = 180 + row * (cellSize + gridGap) + cellSize / 2;
    setParticlePos({ visible: true, x: px, y: py });
    setTimeout(() => setParticlePos((p) => ({ ...p, visible: false })), 600);

    // Check if completed
    const isComplete = updated.stamps.every(Boolean);
    if (isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound(completeSound.current);

      flashOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0, { duration: 300 }),
      );

      setTimeout(() => {
        runOnJS(navigateToReward)();
      }, 1200);
    } else {
      playSound(stampSound.current);
    }
  };

  const handleUndo = async () => {
    const updated = await removeStamp(card);
    if (!updated) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound(undoSound.current);
    setLastFilledIndex(-1);
    setCard(updated);
    showToast("1こもどしたよ");
  };

  const handleLongPressUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "スタンプをもどす",
      "さいごのスタンプを1こもどしますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "もどす", style: "destructive", onPress: handleUndo },
      ],
    );
  };

  const handleChangeGoal = async (newGoal: number) => {
    if (newGoal === totalGoal) return;
    await saveTotalGoal(newGoal);
    setTotalGoal(newGoal);
    const updated = await loadStampCard(newGoal);
    setCard(updated);
    setLastFilledIndex(-1);
  };

  const handleChangeTheme = async (key: ThemeKey) => {
    setCurrentTheme(key);
    await AsyncStorage.setItem("theme", key);
  };

  const handleUpdateMilestones = async (updated: Milestone[]) => {
    setMilestones(updated);
    await saveMilestones(updated);
  };

  const handleResetTotal = async () => {
    const fresh = await resetStampCard();
    const zeroed = { ...fresh, completedCount: 0 };
    await saveStampCard(zeroed);
    setCard(zeroed);
    setLastFilledIndex(-1);
    showToast("総合計をリセットしました");
  };

  const handleResetAll = async () => {
    const fresh = await clearAllData();
    setCard(fresh);
    setLastFilledIndex(-1);
    showToast("すべてリセットしました");
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  // Build stamp grid rows for centering last row
  const gridRows: number[][] = [];
  for (let i = 0; i < totalGoal; i += gridCols) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + gridCols, totalGoal); j++) {
      row.push(j);
    }
    gridRows.push(row);
  }

  const isDark = theme.darkMode;
  const textColor = isDark ? "#FFFFFF" : "#333";

  return (
    <LinearGradient colors={theme.bgColors} style={styles.container}>
      {/* Clouds */}
      <Cloud style={{ position: "absolute", top: 60, right: -10, opacity: 0.7 }} />
      <Cloud style={{ position: "absolute", bottom: 80, left: -20, opacity: 0.5 }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>{theme.stampIcon}</Text>
          <Text style={[styles.headerCount, { color: textColor }]}>{totalStamps}</Text>
        </View>
        <View style={styles.headerRightGroup}>
          {/* Roadmap button */}
          <Pressable
            style={styles.roadmapBtn}
            onPress={() => {
              if (!isPremium) {
                setPaywallReason("roadmap");
                return;
              }
              router.push("/roadmap");
            }}
          >
            <Text style={{ fontSize: 18 }}>🗺️</Text>
          </Pressable>
          <Pressable style={styles.headerRight} onPress={() => setShowSettings(true)}>
            <Text style={styles.headerIcon}>⚙️</Text>
            <Text style={[styles.headerSettingsText, { color: isDark ? "#CCC" : "#555" }]}>せってい</Text>
          </Pressable>
        </View>
      </View>

      {/* Main card */}
      <View style={[styles.mainCard, { backgroundColor: theme.cardBg }]}>
        {/* Rainbow arch on top */}
        <View style={styles.rainbowWrapper}>
          <RainbowArch />
        </View>

        {/* Task banner */}
        <View style={styles.taskBanner}>
          <Text style={styles.taskLabel}>すたんぷをあつめよう</Text>
        </View>
        <Text style={[styles.taskName, { color: isDark ? "#EEE" : "#333" }]}>おてつだいをする</Text>

        {/* Stamp grid */}
        <View style={{ alignItems: "center" }}>
          {gridRows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: gridGap,
                marginBottom: rowIdx < gridRows.length - 1 ? gridGap : 0,
              }}
            >
              {row.map((stampIdx) => (
                <StampSlotCell
                  key={stampIdx}
                  filled={card.stamps[stampIdx]}
                  index={stampIdx}
                  justFilled={stampIdx === lastFilledIndex}
                  cellSize={cellSize}
                  isLastFilled={stampIdx === lastFilledStampIndex}
                  onLongPress={handleLongPressUndo}
                  stampIcon={theme.stampIcon}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Particle effects */}
        <StampParticles visible={particlePos.visible} x={particlePos.x} y={particlePos.y} />

        {/* Star character inside card */}
        <StarCharacter
          size={40}
          bounceAnim={starBounce}
          style={{ position: "absolute", left: 8, top: 170 }}
          stampIcon={theme.stampIcon}
        />
      </View>

      {/* Stamp button */}
      <AnimatedPressable onPress={handleStampPress} disabled={allFilled} style={[styles.stampButton, buttonAnimStyle]}>
        <LinearGradient
          colors={allFilled ? ["#FFD700", "#FFA559"] : [theme.primaryColor || "#5BC8F5", "#4AB8E5"]}
          style={styles.stampButtonGradient}
        >
          <View style={styles.buttonGlow} />
          <Text style={styles.stampButtonText}>
            {allFilled ? "🎉 たっせい！" : "スタンプをゲット！"}
          </Text>
        </LinearGradient>
      </AnimatedPressable>

      {/* Remaining count banner */}
      {!allFilled && (
        <View style={styles.remainingBanner}>
          <Text style={styles.remainingText}>
            ごほうびまであと<Text style={styles.remainingNumber}>{remaining}</Text>こ！
          </Text>
        </View>
      )}

      {/* Star character 2 (bottom left) */}
      <StarCharacter
        size={35}
        bounceAnim={star2Bounce}
        style={{ position: "absolute", bottom: 80, left: 20 }}
        stampIcon={theme.stampIcon}
      />

      {/* Ad Banner (free users only) */}
      <View style={styles.adContainer}>
        <AdBanner isPremium={isPremium} />
      </View>

      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, flashStyle]} pointerEvents="none" />

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        currentGoal={totalGoal}
        onChangeGoal={handleChangeGoal}
        onUndo={handleUndo}
        canUndo={currentCount > 0}
        onResetTotal={handleResetTotal}
        onResetAll={handleResetAll}
        onClose={() => setShowSettings(false)}
        isPremium={isPremium}
        currentTheme={currentTheme}
        onChangeTheme={handleChangeTheme}
        milestones={milestones}
        onUpdateMilestones={handleUpdateMilestones}
        onShowPaywall={(reason) => {
          setShowSettings(false);
          setTimeout(() => setPaywallReason(reason), 300);
        }}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={paywallReason !== null}
        reason={paywallReason ?? "general"}
        price={price}
        onPurchase={purchasePremium}
        onRestore={restorePurchases}
        onClose={() => setPaywallReason(null)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSettingsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  roadmapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF80",
    alignItems: "center",
    justifyContent: "center",
  },
  // Cloud
  cloud: {
    width: 120,
    height: 60,
  },
  cloudBall: {
    position: "absolute",
    backgroundColor: "#FFFFFFCC",
    borderRadius: 30,
  },
  // Rainbow
  rainbowContainer: {
    width: 240,
    height: 120,
    position: "relative",
  },
  rainbowCloud: {
    position: "absolute",
    fontSize: 22,
  },
  rainbowWrapper: {
    alignItems: "center",
    marginTop: -50,
    marginBottom: -20,
  },
  // Main card
  mainCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: CARD_WIDTH / 2,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: "visible",
  },
  // Task banner
  taskBanner: {
    backgroundColor: "#FFE0EE",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 4,
  },
  taskLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E91E8C",
    textAlign: "center",
  },
  taskName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  // Stamp slot
  stampSlot: {
    borderWidth: 2,
    borderColor: "#B8E4F9",
    borderStyle: "dashed",
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  // Button
  stampButton: {
    marginTop: 16,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#5BC8F5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  stampButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF30",
    borderRadius: 30,
  },
  stampButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.surface,
    textShadowColor: "#00000030",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Remaining banner
  remainingBanner: {
    marginTop: 12,
    backgroundColor: "#FFFFFFEE",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  remainingNumber: {
    color: "#FF3B30",
    fontSize: 20,
    fontWeight: "900",
  },
  // Ad container
  adContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 8,
  },
  // Flash
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  // Toast
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#333333EE",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#CCCCCC",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 12,
  },
  // Theme selector
  themeScroll: {
    marginBottom: 20,
    marginHorizontal: -8,
  },
  themeCard: {
    width: 80,
    marginHorizontal: 6,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 4,
  },
  themeCardSelected: {
    borderColor: "#FF6B35",
  },
  themeCardLocked: {
    opacity: 0.7,
  },
  themePreview: {
    width: 68,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  themeName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
    marginTop: 4,
    textAlign: "center",
  },
  premiumBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FF6B35",
    backgroundColor: "#FFF0E0",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  // Goal grid
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  goalButton: {
    width: 52,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  goalButtonActive: {
    backgroundColor: "#FFA559",
  },
  goalButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  goalButtonTextActive: {
    color: "#FFFFFF",
  },
  // Milestones
  milestoneSection: {
    marginBottom: 20,
  },
  milestoneSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  proBadgeLarge: {
    backgroundColor: "#FFF0E0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proBadgeLargeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    marginBottom: 6,
  },
  milestoneCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#666",
    width: 60,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  milestoneInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addMilestoneBtn: {
    borderWidth: 1,
    borderColor: "#5BC8F5",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addMilestoneBtnText: {
    fontSize: 14,
    color: "#5BC8F5",
    fontWeight: "600",
  },
  lockedPreview: {
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF99",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
    backgroundColor: "#FFF0E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  // Undo
  undoButton: {
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  undoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  undoButtonTextDisabled: {
    color: "#999",
  },
  // Danger zone
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  resetTotalButton: {
    borderWidth: 1,
    borderColor: "#FFB347",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  resetTotalButtonText: {
    color: "#F97316",
    fontSize: 15,
  },
  resetAllButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  resetAllButtonText: {
    color: "#EF4444",
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: "#5BC8F5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Emoji picker
  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiPickerContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "80%",
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
  },
});
