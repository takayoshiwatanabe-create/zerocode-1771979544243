import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { StampGrid } from "@/components/StampGrid";
import { ProgressBar } from "@/components/ProgressBar";
import { ActionButton } from "@/components/ActionButton";
import { RewardModal } from "@/components/RewardModal";
import { loadStampCard, resetStampCard } from "@/utils/storage";
import { Colors } from "@/constants/colors";
import { INITIAL_STAMP_CARD, MAX_STAMPS, type StampCard } from "@/types/stamp";

export default function HomeScreen() {
  const router = useRouter();
  const [card, setCard] = useState<StampCard>(INITIAL_STAMP_CARD);
  const [showReward, setShowReward] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStampCard().then((loaded) => {
        setCard(loaded);
        const allFilled = loaded.stamps.every(Boolean);
        if (allFilled) {
          setShowReward(true);
        }
      });
    }, []),
  );

  const currentCount = card.stamps.filter(Boolean).length;
  const allFilled = currentCount >= MAX_STAMPS;

  const handleStampPress = () => {
    if (!allFilled) {
      router.push("/stamp");
    }
  };

  const handleReset = async () => {
    const fresh = await resetStampCard();
    setCard(fresh);
  };

  const handleRewardClose = async () => {
    setShowReward(false);
    const fresh = await resetStampCard();
    setCard(fresh);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>おてつだいスタンプカード</Text>

      <View style={styles.cardContainer}>
        <StampGrid stamps={card.stamps} animateOnFill />
      </View>

      <ProgressBar current={currentCount} />

      <View style={styles.actions}>
        <ActionButton
          label={allFilled ? "🎉 達成！" : "⭐ スタンプをおす"}
          onPress={allFilled ? () => setShowReward(true) : handleStampPress}
          color={allFilled ? Colors.accent : Colors.primary}
          textColor={allFilled ? Colors.text : Colors.surface}
        />
        {currentCount > 0 && !allFilled && (
          <ActionButton
            label="リセット"
            onPress={handleReset}
            color={Colors.surface}
            textColor={Colors.textLight}
            style={styles.resetButton}
          />
        )}
      </View>

      {card.completedCount > 0 && (
        <Text style={styles.completedInfo}>
          達成回数: {card.completedCount}回
        </Text>
      )}

      <RewardModal
        visible={showReward}
        completedCount={card.completedCount}
        onClose={handleRewardClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 24,
  },
  cardContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  actions: {
    marginTop: 32,
    alignItems: "center",
    gap: 12,
  },
  resetButton: {
    minWidth: 140,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.stampEmpty,
    elevation: 0,
    shadowOpacity: 0,
  },
  completedInfo: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.textLight,
  },
});
