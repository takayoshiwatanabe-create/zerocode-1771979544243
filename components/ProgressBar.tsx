import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { MAX_STAMPS } from "@/types/stamp";

interface ProgressBarProps {
  current: number;
}

export function ProgressBar({ current }: ProgressBarProps) {
  const percentage = (current / MAX_STAMPS) * 100;

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${percentage}%` as `${number}%`, { duration: 500 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>進捗</Text>
        <Text style={styles.count}>
          {current} / {MAX_STAMPS}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textLight,
  },
  count: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.stampEmpty,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
});
