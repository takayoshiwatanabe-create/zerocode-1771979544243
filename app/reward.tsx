import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ActionButton } from "@/components/ActionButton";
import { loadStampCard, resetStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";

export default function RewardScreen() {
  const router = useRouter();
  const [completedCount, setCompletedCount] = useState(0);
  const titleScale = useSharedValue(0);
  const emojiBounce = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadStampCard().then((card) => {
        setCompletedCount(card.completedCount);
      });

      titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      emojiBounce.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 500 }),
          withTiming(0, { duration: 500 }),
        ),
        -1,
        true,
      );
    }, [titleScale, emojiBounce]),
  );

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: emojiBounce.value }],
  }));

  const handleNewCard = async () => {
    await resetStampCard();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.emoji, emojiStyle]}>🎉</Animated.Text>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>おめでとう！</Text>
      </Animated.View>

      <Text style={styles.message}>
        スタンプ10個あつめたよ！{"\n"}
        すごくがんばったね！
      </Text>

      <Text style={styles.trophyRow}>🏆🌟🏆</Text>

      <Text style={styles.countText}>
        これまでの達成: {completedCount}回
      </Text>

      <ActionButton
        label="あたらしいカード"
        onPress={handleNewCard}
        color={Colors.accent}
        textColor={Colors.text}
      />
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
    marginBottom: 24,
  },
  trophyRow: {
    fontSize: 48,
    marginBottom: 24,
  },
  countText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 40,
  },
});
