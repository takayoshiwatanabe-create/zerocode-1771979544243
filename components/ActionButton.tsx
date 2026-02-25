import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionButton({
  label,
  onPress,
  color = Colors.primary,
  textColor = Colors.surface,
  style,
  disabled = false,
}: ActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: disabled ? Colors.stampEmpty : color },
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? Colors.textLight : textColor }]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 200,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
