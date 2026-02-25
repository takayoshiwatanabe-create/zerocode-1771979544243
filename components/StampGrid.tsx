import { StyleSheet, View } from "react-native";
import { StampSlot } from "@/components/StampSlot";

interface StampGridProps {
  stamps: boolean[];
  animateOnFill?: boolean;
}

export function StampGrid({ stamps, animateOnFill = false }: StampGridProps) {
  return (
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
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
    maxWidth: 400,
  },
});
