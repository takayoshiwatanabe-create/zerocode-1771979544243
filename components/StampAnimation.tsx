import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  type SharedValue,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

const PARTICLE_EMOJIS = ["✨", "🌟", "💫", "⭐"] as const;
const PARTICLE_COUNT = 8;

interface StampAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  size?: number;
  children: React.ReactNode;
}

export interface StampAnimationHandle {
  play: () => void;
  reset: () => void;
}

interface ParticleProps {
  index: number;
  total: number;
  radius: number;
  progress: SharedValue<number>;
  centerX: number;
  centerY: number;
}

function Particle({
  index,
  total,
  radius,
  progress,
  centerX,
  centerY,
}: ParticleProps) {
  const angle = (index / total) * Math.PI * 2;
  const emoji = PARTICLE_EMOJIS[index % PARTICLE_EMOJIS.length];

  const animatedStyle = useAnimatedStyle(() => {
    const distance = interpolate(progress.value, [0, 1], [0, radius]);
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.7, 1],
      [0, 1, 0.8, 0],
    );
    const particleScale = interpolate(
      progress.value,
      [0, 0.2, 0.5, 1],
      [0, 1.3, 1, 0.2],
    );

    return {
      opacity,
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: particleScale },
        { rotate: `${progress.value * 360}deg` },
      ],
    };
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: centerX - 12, top: centerY - 12 },
        animatedStyle,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export const StampAnimation = forwardRef<
  StampAnimationHandle,
  StampAnimationProps
>(function StampAnimation(
  { trigger, onComplete, size = 120, children },
  ref,
) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const particleProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const play = useCallback(() => {
    scale.value = 0;
    rotation.value = 0;
    bounceY.value = 0;
    particleProgress.value = 0;
    glowOpacity.value = 0;

    scale.value = withSequence(
      withTiming(1.5, { duration: 150, easing: Easing.out(Easing.quad) }),
      withSpring(0.8, { damping: 8, stiffness: 300 }),
      withSpring(1.2, { damping: 10, stiffness: 250 }),
      withSpring(1, { damping: 14, stiffness: 200 }),
    );

    rotation.value = withSpring(720, { damping: 18, stiffness: 50 });

    bounceY.value = withSequence(
      withTiming(0, { duration: 200 }),
      withSpring(-24, { damping: 5, stiffness: 220 }),
      withSpring(0, { damping: 8, stiffness: 200 }),
      withSpring(-10, { damping: 10, stiffness: 200 }),
      withSpring(0, { damping: 14, stiffness: 200 }),
    );

    particleProgress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    glowOpacity.value = withSequence(
      withTiming(0.7, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 700, easing: Easing.in(Easing.quad) }),
    );
  }, [scale, rotation, bounceY, particleProgress, glowOpacity]);

  const reset = useCallback(() => {
    scale.value = withTiming(0, { duration: 200 });
    rotation.value = 0;
    bounceY.value = 0;
    particleProgress.value = 0;
    glowOpacity.value = 0;
  }, [scale, rotation, bounceY, particleProgress, glowOpacity]);

  useImperativeHandle(ref, () => ({ play, reset }), [play, reset]);

  useEffect(() => {
    if (trigger) {
      play();
    }
  }, [trigger, play]);

  useEffect(() => {
    if (trigger && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trigger, onComplete]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounceY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(scale.value, [0, 1], [0, 1.4]) }],
  }));

  const containerSize = size * 2.2;
  const center = containerSize / 2;

  return (
    <View
      style={[styles.container, { width: containerSize, height: containerSize }]}
    >
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            left: center - size * 0.6,
            top: center - size * 0.6,
          },
          glowStyle,
        ]}
      />

      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <Particle
          key={i}
          index={i}
          total={PARTICLE_COUNT}
          radius={size * 0.9}
          progress={particleProgress}
          centerX={center}
          centerY={center}
        />
      ))}

      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: Colors.accent,
  },
  particle: {
    position: "absolute",
    fontSize: 24,
    width: 24,
    height: 24,
    textAlign: "center",
  },
});
