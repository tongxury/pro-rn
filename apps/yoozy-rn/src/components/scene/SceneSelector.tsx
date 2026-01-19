import {View, Text, TouchableOpacity, Animated, Platform} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import Modal from "@/components/ui/Modal";
import {useEffect, useRef} from "react";
import {LinearGradient} from "expo-linear-gradient";
import useGlobal from "@/hooks/useGlobal";
import {useTranslation} from "@/i18n/translation";

import {Grid} from "@/components/ui/Grid";
import {Scene} from "@/types";
import {Toast} from "react-native-toast-notifications";

export default function SceneSelector(
    {
        visible,
        onClose,
    }: {
        visible?: boolean;
        onClose?: () => void;
    }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { colors } = useTailwindVars();
    const {
        settings: {scenes},
    } = useGlobal();
    const {t} = useTranslation();

    // 添加淡入动画
    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleScenePress = (scene: Scene) => {
            router.navigate({
                pathname: "/starter",
                params: {scene: scene.value},
            });
            onClose?.();
    };


    const closeButtonStyle = {
        width: 33,
        height: 33,
        borderRadius: 22,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        // ...Platform.select({
        //     ios: {
        //         shadowColor: "#000",
        //         shadowOffset: {width: 0, height: 2},
        //         shadowOpacity: 0.25,
        //         shadowRadius: 4,
        //     },
        //     android: {
        //         elevation: 5,
        //     },
        // }),
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            position="bottom"
        >
            <View className="mb-6 px-[20px]">
                <Text className="text-2xl font-bold text-white mb-2">{t("selectScene")}</Text>
                <Text className="text-sm text-white/60">{t("selectSceneSubtitle")}</Text>
            </View>

            <Grid columns={3} containerStyle={{padding: 15}} spacing={10} data={scenes!} renderItem={(scene, index) => {
                const isNew = scene.isNew;
                const isPopular = scene.isPopular;

                return (
                    <Animated.View
                        key={index}
                        className="p-[10px]"
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <TouchableOpacity
                            className="items-center justify-center"
                            onPress={() => handleScenePress(scene)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                // colors={["rgba(80, 80, 80, 0.9)", "rgba(40, 40, 40, 0.9)"]}
                                colors={[colors.muted, colors.muted]}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 10,
                                    alignItems: 'center' as const,
                                    justifyContent: 'center' as const,
                                    marginBottom: 12,
                                    position: 'relative' as const,
                                }}
                                start={{x: 0, y: 0}}
                                end={{x: 1, y: 1}}
                            >
                                {scene.getSceneIcon?.({
                                    size: 30,
                                    color: colors.background,
                                })}
                            </LinearGradient>

                            <Text numberOfLines={2}
                                  className="max-w-[80px] text-sm font-semibold text-white text-center mb-1">
                                {t(`scene.${scene.value}`)}
                            </Text>

                            {scene.tag && (
                                <View
                                    className={'absolute top-[-6px] right-[-1px] rounded-full '}
                                    style={{
                                        // ...badgeStyle,
                                        backgroundColor: scene.tag.color,
                                    }}
                                >
                                    <Text
                                        className={`text-white text-xs px-2 py-1 font-semibold tracking-wider`}>
                                        {t(`tag.${scene.tag?.value}`)}
                                    </Text>
                                </View>
                            )}

                            {/*{isNew && (*/}
                            {/*    <View*/}
                            {/*        style={{*/}
                            {/*            ...badgeStyle,*/}
                            {/*            backgroundColor: "#FF6B6B",*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <Text className="text-white text-[9px] font-semibold tracking-wider">NEW</Text>*/}
                            {/*    </View>*/}
                            {/*)}*/}

                            {/*{isPopular && (*/}
                            {/*    <View*/}
                            {/*        style={{*/}
                            {/*            ...badgeStyle,*/}
                            {/*            backgroundColor: "#4CAF50",*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <Text className="text-white text-[9px] font-semibold tracking-wider">HOT</Text>*/}
                            {/*    </View>*/}
                            {/*)}*/}

                            {scene.description && (
                                <Text className="text-xs text-white/50 text-center px-[5px]">
                                    {scene.description}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                );
            }}/>


            <TouchableOpacity
                className="self-center mt-[30px]"
                onPress={onClose}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={["rgba(100, 100, 100, 0.9)", "rgba(60, 60, 60, 0.9)"]}
                    style={closeButtonStyle}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                >
                    <Ionicons name="close" size={24} color="white"/>
                </LinearGradient>
            </TouchableOpacity>
        </Modal>
    );
}
