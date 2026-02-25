import { StyleSheet, Text, View } from "react-native";
import { StampSlot } from "@/components/StampSlot";
import { Colors } from "@/constants/colors";
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from "@/constants/theme";
import { MAX_STAMPS } from "@/types/stamp";

interface StampCardProps {
  stamps: boolean[];
  currentCount: number;
  animateOnFill?: boolean;
}

export function StampCard({ stamps, currentCount, animateOnFill = false }: StampCardProps) {
  const isComplete = currentCount >= MAX_STAMPS;

  return (
    <View style={[styles.card, isComplete && styles.cardComplete]}>
      <View style={styles.header}>
        <Text style={styles.title}>スタンプカード</Text>
        <View style={[styles.badge, isComplete && styles.badgeComplete]}>
          <Text style={[styles.badgeText, isComplete && styles.badgeTextComplete]}>
            {currentCount} / {MAX_STAMPS}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        {stamps.map((filled, index) => (
          <StampSlot
            key={index}
            filled={filled}
            index={index}
            animateOnFill={animateOnFill}
          />
        ))}
      </View>

      {isComplete && (
        <View style={styles.completeBar}>
          <Text style={styles.completeText}>🎉 コンプリート！</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    ...Shadow.md,
  },
  cardComplete: {
    borderColor: Colors.accent,
    backgroundColor: "#FFFDF0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeComplete: {
    backgroundColor: Colors.accent,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.surface,
  },
  badgeTextComplete: {
    color: Colors.text,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.stampEmpty,
    borderRadius: 1,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    maxWidth: 400,
    alignSelf: "center",
  },
  completeBar: {
    marginTop: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  completeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extrabold,
    color: Colors.text,
  },
});
