import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface SpinningIconProps {
  name?: string;
  size?: number;
  color?: string;
  duration?: number;
}

export default function SpinningIcon({
  name = "circle-notch",
  size = 24,
  color = "black",
  duration = 1000,
}: SpinningIconProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  // 旋转动画
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [duration]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <FontAwesome5 name={name} size={size} color={color} />
    </Animated.View>
  );
}
