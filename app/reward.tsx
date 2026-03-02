import { useCallback, useEffect, useRef } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { resetStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";
import { THEMES, type ThemeKey } from "@/constants/themes";
import { t } from "@/i18n";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DEFAULT_BG: [string, string] = ["#87CEEB", "#FFE8A3"];

// ── Confetti ──
const CONFETTI_COUNT = 40;
const CONFETTI_COLORS = ["#FF9DD2", "#5BC8F5", "#FFE66D", "#FFA559", "#7BC67E", "#BA68C8"];

interface ConfettiPieceData {
  x: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
  swayAmount: number;
  rotationSpeed: number;
}

function createConfettiPieces(): ConfettiPieceData[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 1000,
    duration: 2500 + Math.random() * 2000,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    width: 8 + Math.random() * 6,
    height: 4 + Math.random() * 3,
    swayAmount: 20 + Math.random() * 40,
    rotationSpeed: 360 + Math.random() * 720,
  }));
}

function ConfettiPiece({ piece }: { piece: ConfettiPieceData }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(1, {
          duration: piece.duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, [progress, piece.delay, piece.duration]);

  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-40, SCREEN_HEIGHT + 40]);
    const translateX = Math.sin(progress.value * Math.PI * 3) * piece.swayAmount;
    const rotate = interpolate(progress.value, [0, 1], [0, piece.rotationSpeed]);
    const opacity = interpolate(progress.value, [0, 0.05, 0.85, 1], [0, 1, 1, 0]);

    return {
      opacity,
      transform: [
        { translateY },
        { translateX },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: piece.x,
          top: 0,
          width: piece.width,
          height: piece.height,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
        animStyle,
      ]}
    />
  );
}

function Confetti() {
  const pieces = useRef(createConfettiPieces()).current;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} piece={piece} />
      ))}
    </View>
  );
}

// ── Sun rays ──
function SunRays() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rays = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Animated.View style={[styles.sunRaysContainer, animStyle]}>
      {rays.map((i) => (
        <View
          key={i}
          style={[
            styles.sunRay,
            {
              transform: [{ rotate: `${i * 30}deg` }],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

// ── Puppy character (default theme) ──
function PuppyCharacter() {
  const bounce = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [bounce]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  return (
    <Animated.View style={[styles.puppyContainer, animStyle]}>
      {/* Body */}
      <View style={styles.puppyBody}>
        {/* Right arm raised */}
        <View style={styles.puppyArmRight}>
          <Text style={{ fontSize: 16 }}>🖐️</Text>
        </View>
        {/* Left arm */}
        <View style={styles.puppyArmLeft} />
      </View>
      {/* Head */}
      <View style={styles.puppyHead}>
        {/* Ears */}
        <View style={[styles.puppyEar, { left: -5, transform: [{ rotate: "-20deg" }] }]} />
        <View style={[styles.puppyEar, { right: -5, transform: [{ rotate: "20deg" }] }]} />
        {/* Eyes */}
        <View style={styles.puppyFace}>
          <View style={styles.puppyEye}>
            <View style={styles.puppyEyeShine} />
          </View>
          <View style={styles.puppyEye}>
            <View style={styles.puppyEyeShine} />
          </View>
        </View>
        {/* Nose */}
        <View style={styles.puppyNose} />
        {/* Tongue */}
        <View style={styles.puppyTongue} />
      </View>
      {/* Legs */}
      <View style={styles.puppyLegs}>
        <View style={styles.puppyLeg} />
        <View style={styles.puppyLeg} />
      </View>
    </Animated.View>
  );
}

// ── Bouncing emoji (for theme characters) ──
function BouncingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const bounce = useSharedValue(1);

  useEffect(() => {
    bounce.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [bounce, delay]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  return (
    <Animated.View style={[styles.emojiCell, animStyle]}>
      <Text style={styles.emojiText}>{emoji}</Text>
    </Animated.View>
  );
}

// ── Theme character (switches between puppy and emoji grid) ──
function ThemeCharacter({ theme }: { theme: string }) {
  const themeKey = theme as ThemeKey;
  const themeConfig = THEMES[themeKey];
  const preview = themeConfig?.preview;

  if (!preview) {
    return <PuppyCharacter />;
  }

  const emojis = [...preview];

  return (
    <View style={styles.emojiGrid}>
      {emojis.map((emoji, i) => (
        <BouncingEmoji key={i} emoji={emoji} delay={i * 150} />
      ))}
    </View>
  );
}

// ── Cloud ──
function Cloud({ style }: { style: object }) {
  return (
    <View style={[styles.cloud, style]}>
      <View style={[styles.cloudBall, { width: 50, height: 35, top: 8, left: 0 }]} />
      <View style={[styles.cloudBall, { width: 65, height: 42, top: 0, left: 18 }]} />
      <View style={[styles.cloudBall, { width: 50, height: 35, top: 8, left: 42 }]} />
    </View>
  );
}

// ── Main reward screen ──
export default function RewardScreen() {
  const router = useRouter();
  const { theme, rewardEmoji, rewardName } = useLocalSearchParams<{
    theme?: string;
    rewardEmoji?: string;
    rewardName?: string;
  }>();
  const titleScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  const themeKey = (theme && theme in THEMES ? theme : "default") as ThemeKey;
  const bgColors = themeKey !== "default" ? THEMES[themeKey].bgColors : DEFAULT_BG;

  useFocusEffect(
    useCallback(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    }, [titleScale, buttonsOpacity])
  );

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleRewardGet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await resetStampCard();
    router.replace("/");
  };

  const hasRewardName = !!rewardName;

  return (
    <LinearGradient
      colors={bgColors}
      style={styles.container}
    >
      {/* Sun rays */}
      <SunRays />

      {/* Clouds */}
      <Cloud style={{ position: "absolute", top: 80, left: -10, opacity: 0.6 }} />
      <Cloud style={{ position: "absolute", top: 120, right: -15, opacity: 0.5 }} />

      {/* Confetti */}
      <Confetti />

      {/* Content */}
      <View style={styles.content}>
        {/* Title area */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <LinearGradient
            colors={["#FF9DD2", "#FFFFFF", "#FF9DD2", "#FFFFFF", "#FF9DD2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            {hasRewardName ? (
              <>
                <Text style={styles.rewardEmojiText}>{rewardEmoji}</Text>
                <Text
                  style={styles.rewardNameText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {rewardName}
                </Text>
                <Text style={styles.subtitleText}>{t("reward.title")}</Text>
              </>
            ) : (
              <Text
                style={styles.titleText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t("reward.title")}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Theme character */}
        <ThemeCharacter theme={themeKey} />

        {/* Reward button */}
        <Animated.View style={buttonsStyle}>
          <Pressable onPress={handleRewardGet} style={styles.rewardButton}>
            <LinearGradient
              colors={["#5BC8F5", "#FFA559", "#5BC8F5", "#FFA559"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rewardButtonGradient}
            >
              <Text style={styles.rewardButtonText}>{t("reward.getReward")}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  // Sun rays
  sunRaysContainer: {
    position: "absolute",
    width: SCREEN_WIDTH * 2,
    height: SCREEN_WIDTH * 2,
    top: SCREEN_HEIGHT / 2 - SCREEN_WIDTH,
    left: -SCREEN_WIDTH / 2,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  sunRay: {
    position: "absolute",
    width: 3,
    height: SCREEN_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  // Cloud
  cloud: {
    width: 100,
    height: 50,
    zIndex: 5,
  },
  cloudBall: {
    position: "absolute",
    backgroundColor: "#FFFFFFCC",
    borderRadius: 25,
  },
  // Title
  titleContainer: {
    marginBottom: 24,
  },
  titleGradient: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignItems: "center",
  },
  titleText: {
    fontSize: 72,
    fontWeight: "900",
    color: "#FF9DD2",
    textAlign: "center",
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  rewardEmojiText: {
    fontSize: 56,
    textAlign: "center",
    marginBottom: 4,
  },
  rewardNameText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FF6B9D",
    textAlign: "center",
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  subtitleText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF9DD2",
    textAlign: "center",
    marginTop: 2,
  },
  // Puppy
  puppyContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  puppyHead: {
    width: 100,
    height: 90,
    backgroundColor: "#D4A574",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  puppyEar: {
    position: "absolute",
    top: -8,
    width: 30,
    height: 40,
    backgroundColor: "#C4956A",
    borderRadius: 15,
    zIndex: 1,
  },
  puppyFace: {
    flexDirection: "row",
    gap: 20,
    marginTop: -5,
  },
  puppyEye: {
    width: 20,
    height: 22,
    backgroundColor: "#333",
    borderRadius: 10,
  },
  puppyEyeShine: {
    width: 7,
    height: 7,
    backgroundColor: "#FFF",
    borderRadius: 4,
    position: "absolute",
    top: 3,
    right: 3,
  },
  puppyNose: {
    width: 14,
    height: 10,
    backgroundColor: "#333",
    borderRadius: 7,
    marginTop: 4,
  },
  puppyTongue: {
    width: 16,
    height: 12,
    backgroundColor: "#FF8FAB",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 2,
  },
  puppyBody: {
    width: 70,
    height: 50,
    backgroundColor: "#D4A574",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: -15,
    zIndex: 1,
  },
  puppyArmRight: {
    position: "absolute",
    right: -15,
    top: -10,
  },
  puppyArmLeft: {
    position: "absolute",
    left: -8,
    top: 5,
    width: 18,
    height: 30,
    backgroundColor: "#D4A574",
    borderRadius: 9,
    transform: [{ rotate: "-15deg" }],
  },
  puppyLegs: {
    flexDirection: "row",
    gap: 20,
    marginTop: -5,
  },
  puppyLeg: {
    width: 18,
    height: 20,
    backgroundColor: "#D4A574",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Emoji grid (theme characters)
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 160,
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
  },
  emojiCell: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 48,
  },
  // Reward button
  rewardButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  rewardButtonGradient: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
  },
  rewardButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "#00000030",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
