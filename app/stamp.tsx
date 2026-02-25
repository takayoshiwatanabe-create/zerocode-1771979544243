import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ActionButton } from "@/components/ActionButton";
import { loadStampCard, saveStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";
import { MAX_STAMPS, type StampCard, INITIAL_STAMP_CARD } from "@/types/stamp";

export default function StampScreen() {
  const router = useRouter();
  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [stamped, setStamped] = useState(false);
  const stampScale = useSharedValue(0);
  const stampRotation = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setStamped(false);
      stampScale.value = 0;
      stampRotation.value = 0;
      loadStampCard().then(setCard);
    }, [stampScale, stampRotation]),
  );

  const currentCount = card.stamps.filter(Boolean).length;

  const handleStamp = async () => {
    if (stamped) return;

    const nextIndex = card.stamps.findIndex((s) => !s);
    if (nextIndex === -1) return;

    stampScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.4, { damping: 6, stiffness: 120 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
    stampRotation.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(720, { damping: 12, stiffness: 80 }),
    );

    const newStamps = [...card.stamps];
    newStamps[nextIndex] = true;

    const isComplete = newStamps.every(Boolean);
    const updatedCard: StampCard = {
      stamps: newStamps,
      completedCount: isComplete ? card.completedCount + 1 : card.completedCount,
      lastStampedAt: new Date().toISOString(),
    };

    await saveStampCard(updatedCard);
    setCard(updatedCard);
    setStamped(true);
  };

  const animatedStampStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: stampScale.value },
      { rotate: `${stampRotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {stamped ? "おしたよ！" : "スタンプをおそう！"}
      </Text>

      <Text style={styles.count}>
        {currentCount} / {MAX_STAMPS}
      </Text>

      <View style={styles.stampArea}>
        {stamped ? (
          <Animated.Text style={[styles.stampEmoji, animatedStampStyle]}>
            ⭐
          </Animated.Text>
        ) : (
          <Text style={styles.promptEmoji}>👆</Text>
        )}
      </View>

      {!stamped ? (
        <ActionButton
          label="スタンプ ポン！"
          onPress={handleStamp}
          color={Colors.secondary}
        />
      ) : (
        <ActionButton
          label="もどる"
          onPress={() => router.back()}
          color={Colors.primary}
        />
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
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 40,
  },
  stampArea: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
    elevation: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  stampEmoji: {
    fontSize: 80,
  },
  promptEmoji: {
    fontSize: 64,
    opacity: 0.6,
  },
});
