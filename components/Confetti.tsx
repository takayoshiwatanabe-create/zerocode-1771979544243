import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#FF8E8E",
  "#7EDDD6",
  "#FFD93D",
  "#A29BFE",
  "#FD79A8",
  "#00B894",
  "#E17055",
] as const;

const CONFETTI_COUNT = 40;

interface ConfettiPieceData {
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  swayAmount: number;
  rotationSpeed: number;
}

function createPieces(): ConfettiPieceData[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 800,
    duration: 2500 + Math.random() * 2000,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 10,
    swayAmount: 30 + Math.random() * 60,
    rotationSpeed: 360 + Math.random() * 720,
  }));
}

const PIECES = createPieces();

interface ConfettiPieceProps {
  piece: ConfettiPieceData;
}

function ConfettiPiece({ piece }: ConfettiPieceProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, {
        duration: piece.duration,
        easing: Easing.in(Easing.quad),
      }),
    );
  }, [progress, piece.delay, piece.duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-60, SCREEN_HEIGHT + 40],
    );
    const translateX = Math.sin(progress.value * Math.PI * 3) * piece.swayAmount;
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, piece.rotationSpeed],
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.05, 0.85, 1],
      [0, 1, 1, 0],
    );
    const scaleX = Math.sin(progress.value * Math.PI * 4) * 0.5 + 0.5;

    return {
      opacity,
      transform: [
        { translateY },
        { translateX },
        { rotate: `${rotate}deg` },
        { scaleX },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 1.4,
          backgroundColor: piece.color,
          borderRadius: piece.size * 0.15,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Confetti() {
  return (
    <View style={styles.container} pointerEvents="none">
      {PIECES.map((piece, index) => (
        <ConfettiPiece key={index} piece={piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  piece: {
    position: "absolute",
    top: 0,
  },
});
