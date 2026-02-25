import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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
import { loadStampCard, addStamp, resetStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";
import { MAX_STAMPS, type StampCard, INITIAL_STAMP_CARD } from "@/types/stamp";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = SCREEN_WIDTH * 0.85;
const STAMP_COLS = 4;
const STAMP_ROWS = 3;
const STAMP_SIZE = 55;
const STAMP_GAP = 12;

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
}: {
  size?: number;
  bounceAnim: Animated.SharedValue<number>;
  style?: object;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceAnim.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size * 1.2, alignItems: "center" }, style, animStyle]}>
      {/* Star body */}
      <View style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{ fontSize: size * 0.9, textAlign: "center" }}>⭐</Text>
        {/* Face overlay */}
        <View style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          top: size * 0.25,
        }}>
          {/* Eyes */}
          <View style={{ flexDirection: "row", gap: size * 0.15 }}>
            <View style={{
              width: size * 0.08,
              height: size * 0.08,
              borderRadius: size * 0.04,
              backgroundColor: "#333",
            }} />
            <View style={{
              width: size * 0.08,
              height: size * 0.08,
              borderRadius: size * 0.04,
              backgroundColor: "#333",
            }} />
          </View>
          {/* Cheeks */}
          <View style={{ flexDirection: "row", gap: size * 0.25, marginTop: 1 }}>
            <View style={{
              width: size * 0.1,
              height: size * 0.06,
              borderRadius: size * 0.05,
              backgroundColor: "#FF999980",
            }} />
            <View style={{
              width: size * 0.1,
              height: size * 0.06,
              borderRadius: size * 0.05,
              backgroundColor: "#FF999980",
            }} />
          </View>
          {/* Smile */}
          <View style={{
            width: size * 0.12,
            height: size * 0.06,
            borderBottomLeftRadius: size * 0.06,
            borderBottomRightRadius: size * 0.06,
            borderBottomWidth: 2,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: "#333",
            marginTop: 1,
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
              width: r * 2,
              height: r,
              borderTopLeftRadius: r,
              borderTopRightRadius: r,
              borderWidth: thickness,
              borderBottomWidth: 0,
              borderColor: color,
              bottom: 0,
              left: (baseRadius * 2 - r * 2) / 2,
            }}
          />
        );
      })}
      {/* Clouds at ends */}
      <Text style={[styles.rainbowCloud, { left: -5, bottom: -5 }]}>☁️</Text>
      <Text style={[styles.rainbowCloud, { right: -5, bottom: -5 }]}>☁️</Text>
    </View>
  );
}

// ── Stamp particle burst ──
function StampParticles({
  visible,
  x,
  y,
}: {
  visible: boolean;
  x: number;
  y: number;
}) {
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
  angle,
  color,
  cx,
  cy,
  progress,
}: {
  angle: number;
  color: string;
  cx: number;
  cy: number;
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
          position: "absolute",
          left: cx - 4,
          top: cy - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
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
}: {
  filled: boolean;
  index: number;
  justFilled: boolean;
}) {
  const scale = useSharedValue(filled && !justFilled ? 1 : 0);

  useEffect(() => {
    if (justFilled) {
      scale.value = 0;
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    } else if (filled) {
      scale.value = 1;
    }
  }, [filled, justFilled, scale]);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.stampSlot}>
      {filled ? (
        <Animated.Text style={[styles.stampStar, starStyle]}>⭐</Animated.Text>
      ) : null}
    </View>
  );
}

// ── Main screen ──
export default function HomeScreen() {
  const router = useRouter();
  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [lastFilledIndex, setLastFilledIndex] = useState(-1);
  const [particlePos, setParticlePos] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Animations
  const buttonScale = useSharedValue(1);
  const starBounce = useSharedValue(0);
  const star2Bounce = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setLastFilledIndex(-1);
      loadStampCard().then(setCard);
    }, [])
  );

  // Star character bouncing
  useEffect(() => {
    starBounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    star2Bounce.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [starBounce, star2Bounce]);

  const currentCount = card.stamps.filter(Boolean).length;
  const remaining = MAX_STAMPS - currentCount;
  const allFilled = currentCount >= MAX_STAMPS;

  const navigateToReward = useCallback(() => {
    router.push("/reward");
  }, [router]);

  const handleStampPress = async () => {
    if (allFilled) return;

    // Button bounce
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

    // Particle burst position (approximate center of the stamp slot)
    const col = newIndex % STAMP_COLS;
    const row = Math.floor(newIndex / STAMP_COLS);
    const gridWidth = STAMP_COLS * (STAMP_SIZE + STAMP_GAP) - STAMP_GAP;
    const gridStartX = (CARD_SIZE - gridWidth) / 2;
    const px = gridStartX + col * (STAMP_SIZE + STAMP_GAP) + STAMP_SIZE / 2;
    const py = 180 + row * (STAMP_SIZE + STAMP_GAP) + STAMP_SIZE / 2;
    setParticlePos({ visible: true, x: px, y: py });
    setTimeout(() => setParticlePos((p) => ({ ...p, visible: false })), 600);

    // Check if completed
    const isComplete = updated.stamps.every(Boolean);
    if (isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Flash effect
      flashOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0, { duration: 300 }),
      );

      setTimeout(() => {
        runOnJS(navigateToReward)();
      }, 1200);
    }
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <LinearGradient
      colors={["#87CEEB", "#C8E6F5"]}
      style={styles.container}
    >
      {/* Clouds */}
      <Cloud style={{ position: "absolute", top: 60, right: -10, opacity: 0.7 }} />
      <Cloud style={{ position: "absolute", bottom: 80, left: -20, opacity: 0.5 }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>⭐</Text>
          <Text style={styles.headerCount}>{card.completedCount * MAX_STAMPS + currentCount}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerSettingsText}>せってい</Text>
        </View>
      </View>

      {/* Main card */}
      <View style={styles.mainCard}>
        {/* Rainbow arch on top */}
        <View style={styles.rainbowWrapper}>
          <RainbowArch />
        </View>

        {/* Task banner */}
        <View style={styles.taskBanner}>
          <Text style={styles.taskLabel}>きょうのたっせいだい</Text>
        </View>
        <Text style={styles.taskName}>おてつだいをする</Text>

        {/* Stamp grid */}
        <View style={styles.stampGrid}>
          {card.stamps.map((filled, i) => (
            <StampSlotCell
              key={i}
              filled={filled}
              index={i}
              justFilled={i === lastFilledIndex}
            />
          ))}
        </View>

        {/* Particle effects */}
        <StampParticles
          visible={particlePos.visible}
          x={particlePos.x}
          y={particlePos.y}
        />

        {/* Star character inside card */}
        <StarCharacter
          size={40}
          bounceAnim={starBounce}
          style={{ position: "absolute", left: 8, top: 170 }}
        />
      </View>

      {/* Stamp button */}
      <AnimatedPressable
        onPress={handleStampPress}
        disabled={allFilled}
        style={[styles.stampButton, buttonAnimStyle]}
      >
        <LinearGradient
          colors={allFilled ? ["#FFD700", "#FFA559"] : ["#5BC8F5", "#4AB8E5"]}
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
        style={{ position: "absolute", bottom: 30, left: 20 }}
      />

      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, flashStyle]} pointerEvents="none" />
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
    width: CARD_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: CARD_SIZE / 2,
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
  // Stamp grid
  stampGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: STAMP_GAP,
    width: STAMP_COLS * (STAMP_SIZE + STAMP_GAP),
  },
  stampSlot: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
    borderRadius: STAMP_SIZE / 2,
    borderWidth: 2,
    borderColor: "#B8E4F9",
    borderStyle: "dashed",
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stampStar: {
    fontSize: 30,
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
  // Flash
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
});
