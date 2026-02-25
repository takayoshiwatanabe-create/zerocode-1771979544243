import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Colors } from "@/constants/colors";

interface RewardModalProps {
  visible: boolean;
  completedCount: number;
  onClose: () => void;
}

export function RewardModal({ visible, completedCount, onClose }: RewardModalProps) {
  const scale = useSharedValue(0);
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 8, stiffness: 120 });
      bounce.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = 0;
      bounce.value = 0;
    }
  }, [visible, scale, bounce]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.Text style={[styles.emoji, emojiStyle]}>🎉</Animated.Text>
          <Text style={styles.title}>すごい！おめでとう！</Text>
          <Text style={styles.message}>
            スタンプ10個達成！{"\n"}
            よくがんばったね！
          </Text>
          <Text style={styles.count}>
            これまでの達成回数: {completedCount}回
          </Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>やったー！</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
});
