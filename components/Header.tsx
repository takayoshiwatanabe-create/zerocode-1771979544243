import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Spacing } from "@/constants/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function Header({ title, subtitle, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
