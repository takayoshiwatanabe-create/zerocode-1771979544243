import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ActionButton } from "@/components/ActionButton";
import { Confetti } from "@/components/Confetti";
import { loadStampCard, resetStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";

export default function RewardScreen() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);
  const titleScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const emojiBounce = useSharedValue(0);
  const trophyScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadStampCard().then((card) => {
        setCompletedCount(card.completedCount);
      });

      titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });

      messageOpacity.value = withDelay(
        400,
        withTiming(1, { duration: 600 }),
      );

      emojiBounce.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 500 }),
          withTiming(0, { duration: 500 }),
        ),
        -1,
        true,
      );

      trophyScale.value = withDelay(
        600,
        withSpring(1, { damping: 6, stiffness: 80 }),
      );

      buttonsOpacity.value = withDelay(
        900,
        withTiming(1, { duration: 500 }),
      );
    }, [titleScale, messageOpacity, emojiBounce, trophyScale, buttonsOpacity]),
  );

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: emojiBounce.value }],
  }));

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleNewCard = async () => {
    await resetStampCard();
    router.replace("/");
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Confetti />

      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>
          🎉
        </Animated.Text>

        <Animated.View style={titleStyle}>
          <Text style={styles.title}>おめでとう！</Text>
        </Animated.View>

        <Animated.View style={messageStyle}>
          <Text style={styles.message}>
            スタンプ10個あつめたよ！{"\n"}
            すごくがんばったね！
          </Text>

          <Text style={styles.rewardMessage}>
            🌟 ごほうびゲット！🌟
          </Text>
        </Animated.View>

        <Animated.View style={trophyStyle}>
          <Text style={styles.trophyRow}>🏆🌟🏆</Text>
        </Animated.View>

        <Animated.View style={messageStyle}>
          <Text style={styles.countText}>
            これまでの達成: {completedCount}回
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttons, buttonsStyle]}>
          <ActionButton
            label="あたらしいカード"
            onPress={handleNewCard}
            color={Colors.accent}
            textColor={Colors.text}
          />
          <ActionButton
            label="ホームにもどる"
            onPress={handleGoHome}
            color={Colors.surface}
            textColor={Colors.primary}
            style={styles.homeButton}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 16,
  },
  message: {
    fontSize: 20,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  rewardMessage: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.accent,
    textAlign: "center",
    marginBottom: 24,
  },
  trophyRow: {
    fontSize: 48,
    marginBottom: 24,
  },
  countText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
  },
  buttons: {
    alignItems: "center",
    gap: 12,
  },
  homeButton: {
    minWidth: 200,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    elevation: 0,
    shadowOpacity: 0,
  },
});
