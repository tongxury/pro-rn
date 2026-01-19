import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const PulseLoader = ({
                         size = 24,
                         color = '#6A5ACD',
                         duration = 1000
                     }) => {
    const pulseValue = useRef(new Animated.Value(0)).current;
    const rotationValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 脉冲动画
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 0,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
            ])
        );

        // 旋转动画
        const rotationAnimation = Animated.loop(
            Animated.timing(rotationValue, {
                toValue: 1,
                duration: duration * 2,
                useNativeDriver: true,
            })
        );

        pulseAnimation.start();
        rotationAnimation.start();

        return () => {
            pulseAnimation.stop();
            rotationAnimation.stop();
        };
    }, [duration]);

    const scale = pulseValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2],
    });

    const rotation = rotationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    transform: [{ scale }, { rotate: rotation }],
                },
            ]}
        >
            <View
                style={[
                    styles.circle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                    },
                ]}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
    },
});

export default PulseLoader;
