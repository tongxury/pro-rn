import useTailwindVars from "@/hooks/useTailwindVars";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode, useRef } from "react";
import { ActivityIndicator, Animated, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

interface ButtonV2Props {
    onPress?: () => void;
    icon?: ReactNode; // Deprecated, alias for iconLeft
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    text: string;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    gradientColors?: readonly [string, string, ...string[]];
    fullWidth?: boolean;
}

const ButtonV2 = ({
    onPress,
    icon,
    iconLeft,
    iconRight,
    text,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    style,
    textStyle,
    gradientColors,
    fullWidth = false,
}: ButtonV2Props) => {
    const { colors } = useTailwindVars();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const actualIconLeft = iconLeft || icon;

    // Default Premium Gradient
    const defaultPremiumGradient = [colors.primary, '#7C3AED'] as const;

    // Size Config
    const sizeConfig = {
        sm: { height: 32, paddingHorizontal: 12, fontSize: 13, gap: 4, borderRadius: 999 },
        md: { height: 44, paddingHorizontal: 20, fontSize: 15, gap: 8, borderRadius: 999 },
        lg: { height: 50, paddingHorizontal: 24, fontSize: 16, gap: 10, borderRadius: 999 },
        xl: { height: 56, paddingHorizontal: 32, fontSize: 18, gap: 12, borderRadius: 999 },
    };
    const currentSize = sizeConfig[size];

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start();
    };

    const getContainerStyle = () => {
        const base: ViewStyle = {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
            borderRadius: currentSize.borderRadius,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.6 : 1,
            width: fullWidth ? '100%' : undefined,
            shadowColor: variant === 'premium' || variant === 'primary' ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'premium' ? 0.3 : 0,
            shadowRadius: 10,
            elevation: variant === 'premium' ? 4 : 0,
        };

        if (variant === 'premium') {
            return {
                ...base,
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                overflow: 'hidden',
                borderTopWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)'
            } as ViewStyle;
        }

        switch (variant) {
            case 'primary': return { ...base, backgroundColor: colors.primary };
            case 'secondary': return { ...base, backgroundColor: colors.primary + '15' };
            case 'outline': return { ...base, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
            case 'ghost': return { ...base, backgroundColor: 'transparent' };
            default: return { ...base, backgroundColor: colors.primary };
        }
    };

    const getTextColor = () => {
        if (disabled) return variant === 'outline' || variant === 'ghost' ? colors['muted-foreground'] : '#fff';
        if (variant === 'premium') return '#fff';
        if (variant === 'primary') return '#fff';
        if (variant === 'secondary' || variant === 'ghost' || variant === 'outline') return colors.primary;
        return '#fff';
    };

    const Content = () => (
        <View className="flex-row items-center justify-center" style={{ gap: currentSize.gap }}>
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <>
                    {actualIconLeft}
                    <Text style={[{
                        color: getTextColor(),
                        fontWeight: '600',
                        fontSize: currentSize.fontSize
                    }, textStyle]}>
                        {text}
                    </Text>
                    {iconRight}
                </>
            )}
        </View>
    );

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth ? { width: '100%' } : {}]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={[getContainerStyle(), style]}
            >
                {variant === 'premium' ? (
                    <LinearGradient
                        colors={gradientColors || defaultPremiumGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-full h-full flex-row items-center justify-center relative"
                    >
                        {/* Shine Effect */}
                        <View className="absolute top-0 left-0 right-0 h-1/2 opacity-20 bg-white"
                            style={{ transform: [{ scaleX: 1.5 }, { translateY: -10 }] }} />
                        <Content />
                    </LinearGradient>
                ) : (
                    <Content />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default ButtonV2;