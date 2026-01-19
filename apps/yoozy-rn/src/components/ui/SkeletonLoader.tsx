import React from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import { LinearGradient } from "expo-linear-gradient";

import { DimensionValue, StyleProp, ViewStyle, View, Animated } from "react-native";
import { useEffect, useRef } from "react";

interface SkeletonLoaderProps {
    width?: string | number;
    height?: string | number;
    style?: StyleProp<ViewStyle>;
    circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
                                                                  width = "100%",
                                                                  height = "100%",
                                                                  style,
                                                                  circle = false,
                                                              }) => {
    const { colors } = useTailwindVars();
    const animatedValue = useRef(new Animated.Value(0)).current;

    const getColorWithOpacity = (color: string, opacity: number) => {
        return color?.replace("rgb", "rgba")?.replace(")", `, ${opacity})`);
    };

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as DimensionValue,
                    height: height as DimensionValue,
                    borderRadius: circle ? 999 : 8,
                    backgroundColor: getColorWithOpacity(colors.background, 0.06),
                    opacity,
                },
                style,
            ]}
        >
            <LinearGradient
                colors={[
                    getColorWithOpacity(colors.background, 0),
                    getColorWithOpacity(colors.background, 0.1),
                    getColorWithOpacity(colors.background, 0),
                ]}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: circle ? 999 : 8,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />
        </Animated.View>
    );
};
