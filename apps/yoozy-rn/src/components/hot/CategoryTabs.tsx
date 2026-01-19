import {Animated, Dimensions, FlatList, Pressable, Text, TouchableOpacity, View} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import {CATEGORIES} from "@/constants/leaderboard";
import {LinearGradient} from "expo-linear-gradient";
import {Feather} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";

import {useTranslation} from "@/i18n/translation";


const CategoryTabs = ({category = '', onChange}: { category?: string, onChange: (category: string) => void }) => {

    const [visible, setVisible] = useState(false);
    const translateY = useRef(new Animated.Value(100)).current;

    const { colors } = useTailwindVars();

    const {t} = useTranslation()

    const {height, width} = Dimensions.get("window");


    // 渲染分类项
    const renderCategoryItem = (x: any, index: number) => (
        <Pressable
            key={x.id}
            className={`h-10 relative flex items-center justify-center`}
            onPress={() => onChange(x.id)}
        >
            <Text
                className={`text-md ${
                    category === x.id
                        ? "text-black font-semibold"
                        : "text-muted-foreground font-normal"
                }`}
            >
                {t(`item.${x.label}`)}
            </Text>
            {category === x.id && (
                <View className="absolute bottom-0 w-[18px] h-[4px] bg-black rounded-full"/>
            )}
        </Pressable>
    );


    // 打开弹框
    const showModal = () => {
        setVisible(true);
        // 先重置动画位置
        translateY.setValue(-height);

        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // 关闭弹框
    const hideModal = () => {
        Animated.timing(translateY, {
            toValue: -height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    return (
        <View className="border-b border-grey5 flex-row">
            <View className="relative flex-1">
                <FlatList
                    className={'px-5'}
                    horizontal
                    data={CATEGORIES}
                    renderItem={({item, index}) => renderCategoryItem(item, index)}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View className={'w-5'}/>}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    style={{opacity: 10000}}
                />

                <View className={"absolute w-[70px] h-full right-0"}>
                    <LinearGradient
                        colors={["transparent", colors.background]} // 透明到更深的红色
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={{width: "100%", height: "100%"}}
                    />
                </View>
            </View>
            <TouchableOpacity
                activeOpacity={1}
                className={`w-[30px] bg-background justify-center items-center`}
                onPress={showModal}
            >
                <Feather name="chevron-down" size={19} color={colors['muted-foreground']}/>
            </TouchableOpacity>
            {visible && (
                <TouchableOpacity
                    style={{
                        flex: 1,
                        zIndex: 1000,
                        backgroundColor: colors.muted,
                        position: "absolute",
                        // height: "100%",
                        // width: "100%",
                    }}
                    activeOpacity={1}
                    // 防止点击弹框内容时关闭
                >
                    <Animated.View
                        // className="bg-card"
                        style={[
                            {
                                transform: [{translateY}],
                                width: width,
                                top: 0,
                                maxHeight: height * 0.8,
                                overflow: "hidden",
                                paddingVertical: 16,
                            },
                        ]}
                    >
                        <View>
                            <View className="flex-row justify-between mb-5 px-5">
                                <Text className="text-white text-lg">{t("tab.leaderboard")}</Text>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    className={`justify-center items-center`}
                                    onPress={hideModal}
                                >
                                    <Feather name="chevron-up" size={19} color={colors['muted-foreground']}/>
                                </TouchableOpacity>
                            </View>
                            <View className=" flex-wrap flex-row">
                                {CATEGORIES.map((x, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            onChange(x.id);
                                            hideModal();
                                        }}
                                        className={`w-1/4 p-[10px]`}
                                    >
                                        <View
                                            className={`h-[35px] border-black/20 border-[0.5px] justify-center items-center rounded-md ${
                                                category === x.id && "bg-black/20"
                                            }`}
                                        >
                                            <Text className="text-white/90 text-sm">
                                                {t(`item.${x.label}`)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default CategoryTabs;
