import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const Orb = ({ isActive, isSpeaking }: { isActive: boolean, isSpeaking: boolean }) => {
    const pulse = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            pulse.value = withRepeat(
                withTiming(1, { duration: isSpeaking ? 800 : 2000 }),
                -1,
                true
            );
        } else {
            pulse.value = 0;
        }
    }, [isActive, isSpeaking]);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.15]) }],
        opacity: interpolate(pulse.value, [0, 1], [0.6, 0.9]),
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.4]) }],
        opacity: interpolate(pulse.value, [0, 1], [0.1, 0.3]),
    }));

    return (
        <View className="items-center justify-center">
            <Animated.View 
                style={glowStyle}
                className="absolute h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"
            />
            <Animated.View 
                style={orbStyle}
                className="h-48 w-48 rounded-full border border-white/20 bg-black overflow-hidden shadow-2xl items-center justify-center"
            >
                <LinearGradient
                    colors={isActive ? ['#3b82f6', '#8b5cf6', '#d946ef'] : ['#1f2937', '#111827']}
                    className="absolute inset-0 opacity-40"
                />
                <MaterialCommunityIcons 
                    name={isSpeaking ? "waveform" : "microphone"} 
                    size={64} 
                    color="white" 
                />
            </Animated.View>
        </View>
    );
};
