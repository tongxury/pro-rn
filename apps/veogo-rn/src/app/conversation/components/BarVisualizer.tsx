import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";

const Bar = ({ index, isActive }: { index: number, isActive: boolean }) => {
    const height = useSharedValue(4);

    useEffect(() => {
        if (isActive) {
            height.value = withRepeat(
                withTiming(Math.random() * 40 + 10, { duration: Math.random() * 300 + 200 }),
                -1,
                true
            );
        } else {
            height.value = withTiming(4);
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    return (
        <Animated.View 
            style={animatedStyle}
            className="w-1.5 rounded-full bg-blue-400/60"
        />
    );
};

export const BarVisualizer = ({ isActive }: { isActive: boolean }) => {
    return (
        <View className="flex-row items-end justify-center h-12 space-x-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Bar key={i} index={i} isActive={isActive} />
            ))}
        </View>
    );
};
