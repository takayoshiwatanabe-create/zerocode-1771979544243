import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.surface },
  secondary: { bg: Colors.secondary, text: Colors.surface },
  accent: { bg: Colors.accent, text: Colors.text },
  outline: { bg: Colors.surface, text: Colors.textLight, border: Colors.stampEmpty },
};

const SIZE_STYLES: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; minWidth: number }> = {
  small: { paddingV: Spacing.sm, paddingH: Spacing.md, fontSize: FontSize.sm, minWidth: 120 },
  medium: { paddingV: 12, paddingH: Spacing.lg, fontSize: FontSize.md, minWidth: 160 },
  large: { paddingV: Spacing.md, paddingH: Spacing.xl, fontSize: FontSize.lg, minWidth: 200 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "large",
  disabled = false,
  style,
}: ButtonProps) {
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

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isOutline = variant === "outline";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.stampEmpty : variantStyle.bg,
          paddingVertical: sizeStyle.paddingV,
          paddingHorizontal: sizeStyle.paddingH,
          minWidth: sizeStyle.minWidth,
        },
        isOutline && styles.outline,
        variantStyle.border ? { borderWidth: 1, borderColor: variantStyle.border } : undefined,
        !isOutline && styles.shadow,
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeStyle.fontSize,
            color: disabled ? Colors.textLight : variantStyle.text,
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  outline: {
    elevation: 0,
    shadowOpacity: 0,
  },
  shadow: {
    ...Shadow.md,
  },
  label: {
    fontWeight: FontWeight.bold,
  },
});
