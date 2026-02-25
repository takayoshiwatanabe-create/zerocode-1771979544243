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

interface ResetConfirmDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmDialog({
  visible,
  onConfirm,
  onCancel,
}: ResetConfirmDialogProps) {
  const scale = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      shake.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 300 }),
          withTiming(8, { duration: 300 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = 0;
      shake.value = 0;
    }
  }, [visible, scale, shake]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shake.value}deg` }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            🤔
          </Animated.Text>
          <Text style={styles.title}>ほんとうにリセットする？</Text>
          <Text style={styles.message}>
            あつめたスタンプが{"\n"}ぜんぶなくなるよ！
          </Text>
          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>やめる</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>リセットする</Text>
            </Pressable>
          </View>
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
    fontSize: 24,
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
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: Colors.stampEmpty,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.surface,
  },
});
