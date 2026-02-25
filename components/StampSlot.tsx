import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Colors } from "@/constants/colors";

const SLOT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A29BFE",
  "#FD79A8",
  "#00B894",
  "#FDCB6E",
  "#6C5CE7",
  "#FF7675",
  "#74B9FF",
] as const;

interface StampSlotProps {
  filled: boolean;
  index: number;
  animateOnFill?: boolean;
}

export function StampSlot({ filled, index, animateOnFill = false }: StampSlotProps) {
  const scale = useSharedValue(filled ? 1 : 0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (filled && animateOnFill) {
      scale.value = 0;
      rotation.value = 0;
      scale.value = withSequence(
        withTiming(0, { duration: index * 50 }),
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
      rotation.value = withSequence(
        withTiming(0, { duration: index * 50 }),
        withSpring(360, { damping: 15, stiffness: 100 }),
      );
    } else if (filled) {
      scale.value = 1;
    } else {
      scale.value = 0;
    }
  }, [filled, animateOnFill, index, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const slotColor = SLOT_COLORS[index % SLOT_COLORS.length];

  return (
    <View style={styles.slot}>
      {filled ? (
        <View style={[styles.filledCircle, { backgroundColor: slotColor }]}>
          <View style={[styles.filledInnerRing, { borderColor: `${slotColor}80` }]} />
        </View>
      ) : (
        <View style={styles.emptyCircle}>
          <View style={styles.emptyInner} />
        </View>
      )}
      <Animated.Text style={[styles.stampEmoji, animatedStyle]}>
        {filled ? "⭐" : ""}
      </Animated.Text>
      <Animated.Text style={[styles.indexText, filled && styles.indexTextFilled]}>
        {index + 1}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
  },
  emptyCircle: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.stampEmpty,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBEBEB",
  },
  filledCircle: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  filledInnerRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFFFF80",
  },
  stampEmoji: {
    fontSize: 36,
    position: "absolute",
  },
  indexText: {
    position: "absolute",
    bottom: -2,
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: "600",
  },
  indexTextFilled: {
    color: Colors.text,
    fontWeight: "700",
  },
});
