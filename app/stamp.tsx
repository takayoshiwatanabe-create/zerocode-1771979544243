import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import {
  StampAnimation,
  type StampAnimationHandle,
} from "@/components/StampAnimation";
import { ProgressBar } from "@/components/ProgressBar";
import { addStamp, loadStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";
import { MAX_STAMPS, type StampCard, INITIAL_STAMP_CARD } from "@/types/stamp";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StampScreen() {
  const router = useRouter();
  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [stamped, setStamped] = useState(false);
  const animationRef = useRef<StampAnimationHandle>(null);
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setStamped(false);
      resultOpacity.value = 0;
      buttonScale.value = 1;
      buttonGlow.value = withSequence(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      );
      loadStampCard().then(setCard);
    }, [resultOpacity, buttonScale, buttonGlow]),
  );

  const navigateToReward = useCallback(() => {
    router.replace("/reward");
  }, [router]);

  const handleStamp = async () => {
    if (stamped) return;

    const updated = await addStamp(card);
    if (!updated) return;

    setCard(updated);
    setStamped(true);

    animationRef.current?.play();

    resultOpacity.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
    );

    const isComplete = updated.stamps.every(Boolean);
    if (isComplete) {
      setTimeout(() => {
        navigateToReward();
      }, 1500);
    }
  };

  const handlePressIn = () => {
    if (stamped) return;
    buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (stamped) return;
    buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonGlow.value,
    transform: [{ scale: 1.15 }],
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  const newCount = card.stamps.filter(Boolean).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {stamped ? "ポン！おしたよ！" : "スタンプをおそう！"}
      </Text>

      <Text style={styles.count}>
        {newCount} / {MAX_STAMPS}
      </Text>

      <View style={styles.stampWrapper}>
        <StampAnimation
          ref={animationRef}
          trigger={false}
          size={120}
        >
          <AnimatedPressable
            onPress={handleStamp}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={stamped}
            style={[styles.stampButton, buttonAnimatedStyle]}
          >
            <Animated.View style={[styles.stampGlow, glowAnimatedStyle]} />
            {stamped ? (
              <Text style={styles.stampEmoji}>⭐</Text>
            ) : (
              <Text style={styles.promptEmoji}>👆</Text>
            )}
          </AnimatedPressable>
        </StampAnimation>
      </View>

      {stamped && (
        <Animated.View style={[styles.resultContainer, resultStyle]}>
          <Text style={styles.resultText}>
            {newCount >= MAX_STAMPS
              ? "🎉 コンプリート！ごほうびへ..."
              : `あと ${MAX_STAMPS - newCount} こ！`}
          </Text>
        </Animated.View>
      )}

      <View style={styles.progressContainer}>
        <ProgressBar current={newCount} />
      </View>

      <View style={styles.stampDots}>
        {card.stamps.map((filled, i) => (
          <View
            key={i}
            style={[styles.dot, filled && styles.dotFilled]}
          />
        ))}
      </View>

      {stamped && newCount < MAX_STAMPS && (
        <Animated.View style={resultStyle}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>もどる</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  count: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 16,
  },
  stampWrapper: {
    marginBottom: 16,
  },
  stampButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.accent,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: "hidden",
  },
  stampGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.accentDark,
  },
  stampEmoji: {
    fontSize: 80,
  },
  promptEmoji: {
    fontSize: 72,
  },
  resultContainer: {
    marginBottom: 8,
  },
  resultText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 16,
  },
  stampDots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.stampEmpty,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  dotFilled: {
    backgroundColor: Colors.stampFilled,
    borderColor: Colors.stampFilled,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.surface,
  },
});
