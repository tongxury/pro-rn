import React, {useEffect, useRef, useState} from "react";
import {Modal, View, Text, Animated, Image} from "react-native";
import {useTranslation} from "@/i18n/translation";

const WaitingModal = ({
                          visible,
                          progress,
                        onRetry
                      }: {
    visible: boolean;
    progress?: number;
    onRetry?: () => void;
}) => {
    const {t} = useTranslation();

    // 动画值
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const progressValue = useRef(new Animated.Value(0)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // 启动动画
            startAnimations();

            // 模拟进度
            const progressInterval = setInterval(() => {
                progressValue.setValue(Math.random() * 0.7 + 0.1); // 10%-80%的随机进度
            }, 2000);

            return () => {
                clearInterval(progressInterval);
            };
        }
    }, [visible]);

    const startAnimations = () => {
        // 旋转动画
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();

        // 脉冲动画
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 淡入动画
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    const spinInterpolate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const progressWidth = progressValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-[#000000bb] justify-center items-center">
                <Animated.View
                    className="rounded-3xl p-8 mx-8 items-center shadow-lg"
                    style={{opacity: fadeValue}}
                >
                    {/* 主要加载动画 */}
                    <View className="relative mb-6">
                        {/* 外圈脉冲效果 */}
                        <Animated.View
                            className="absolute inset-0 w-20 h-20 rounded-full bg-grey0/20"
                            style={{transform: [{scale: pulseValue}]}}
                        />

                        {/* 旋转的圆环 */}
                        <Animated.View
                            className="w-20 h-20 rounded-full border-4 border-grey4/30 border-t-grey0"
                            style={{transform: [{rotate: spinInterpolate}]}}
                        />

                        {/* 中心图标 */}
                        <View className="absolute inset-0 justify-center items-center">
                            {/*<Text className="text-2xl">☁️</Text>*/}
                            <Image style={{width: 20, height: 20, objectFit: 'contain'}}
                                   source={require("../../assets/images/icon.png")}/>
                            {progress !== undefined && (
                                <Text className="text-grey0 text-xs mt-1">
                                    {Math.round(progress)}%
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* 标题 */}
                    <Text className="text-xl font-bold text-grey0 mb-2 align-middle">
                        {t("uploading")}
                    </Text>

                    <Text className="text-md font-bold text-grey0 mb-2 align-middle">
                        {t("uploading2")}
                    </Text>
                    {/*/!* 进度条 *!/*/}
                    {/*<View className="w-48 h-1 bg-grey4/30 rounded-full mb-6 overflow-hidden">*/}
                    {/*    <Animated.View*/}
                    {/*        className="h-full bg-primary rounded-full"*/}
                    {/*        style={{width: progressWidth}}*/}
                    {/*    />*/}
                    {/*</View>*/}

                    {/* 温馨提示 */}
                    <Text
                        style={{lineHeight: 20}}
                        className="text-xs text-grey3 text-center leading-4 mb-2"
                    >
                        {t("uploadingWaiting")}
                    </Text>
                    <Text
                        style={{lineHeight: 20}}
                        className="text-xs text-grey3 text-center leading-4"
                    >
                        {t("uploadingWaitingTip")}
                    </Text>

                    {/* 装饰点 */}
                    <View className="flex-row mt-4 gap-2">
                        {[0, 1, 2].map((index) => (
                            <Animated.View
                                key={index}
                                className="w-1.5 h-1.5 bg-primary/40 rounded-full"
                                style={{
                                    opacity: pulseValue,
                                    transform: [
                                        {
                                            scale: pulseValue.interpolate({
                                                inputRange: [1, 1.2],
                                                outputRange: [0.8, 1.2],
                                            }),
                                        },
                                    ],
                                }}
                            />
                        ))}
                    </View>

                    <Text className="text-sm text-primary/50 mt-5" onPress={onRetry}>
                        重新提交
                    </Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default WaitingModal;
