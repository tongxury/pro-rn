import { getUser } from "@/api/api";
import { fetchCreditState } from "@/api/payment";
import LetterAvatar from "@/components/LatterAvatar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { FlashIcon } from "@/constants/scene_icons";
import { useColors } from "@/hooks/uesColors";
import useAppUpdate from "@/hooks/useAppUpdate";
import { useTranslation } from "@/i18n/translation";
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HStack, Stack } from "react-native-flex-layout";


export default function MyScreen() {
    const colors = useColors();


    const {data: ur, refetch, isLoading} = useQuery({
        queryKey: ["myself"],
        queryFn: getUser,
        staleTime: 60 * 60 * 1000,

    });

    const {data: cs, refetch: refetchCs, isLoading: csLoading} = useQuery({
        queryKey: ["fetchCreditState"],
        queryFn: fetchCreditState,
        staleTime: 60 * 60 * 1000,

    });

    const user = ur?.data?.data;
    const creditState = cs?.data?.data;

    const {creditSummary, email, id, phone} = user || {};

    const {currentVersion, checkAndUpdate} = useAppUpdate()

    const {t,} = useTranslation();

    useFocusEffect(
        useCallback(() => {
            refetch().then();
            refetchCs().then();
            return () => {
            };
        }, [])
    );

    const gridMenuItems = [
        {
            title: "history",
            icon: <Ionicons name="time-sharp" size={28} color={colors.primary}/>,
            route: "/session/list",
        },
        {
            title: "account.socialAccounts",
            icon: <MaterialIcons name="switch-account" size={28} color={colors.primary}/>,
            route: "/account/list",
        },
        // {
        //     title: "counselor.name",
        //     icon: <MaterialIcons name="question-answer" size={28} color={colors.primary}/>,
        //     route: "/counselor/list",
        // },
        {
            title: "conversation.title",
            icon: <MaterialIcons name="person" size={28} color={colors.primary}/>,
            route: "/conversation",
        }
    ];

    const menuItems: any[][] = [
        [
            {
                title: "creatorCommunity",
                onPress: () => {
                    router.navigate("/community");
                },
                icon: (size: number, color: string) =>
                    <Feather name="users" size={size} color={color}/>,
            },
            {
                title: "contactUs",
                onPress: () => {
                    router.push("/contact");
                },
                icon: (size: number, color: string) =>
                    <MaterialIcons name="headset-mic" size={size} color={color}/>,
            },
            {
                title: "faq",
                onPress: () => {
                    router.push("/problem");
                },
                icon: (size: number, color: string) =>
                    <MaterialIcons name="help-outline" size={size} color={color}/>,
            },
        ],
        [
            {
                title: "privacyPolicy",
                onPress: () => {
                    router.push("/privacy");
                },
                icon: (size: number, color: string) =>
                    <MaterialCommunityIcons name="shield-account-variant-outline" size={size} color={color}/>,
            },
            // <MaterialCommunityIcons name="shield-account-variant-outline" size={24} color="black" />
            {
                title: "serviceTerms",
                onPress: () => {
                    router.push("/terms");
                },
                icon: (size: number, color: string) =>
                    <AntDesign name="profile" size={size} color={color}/>,
            },
            {
                title: "aboutUs",
                onPress: () => {
                    router.push("/about");
                },
                icon: (size: number, color: string) =>
                    <MaterialIcons name="info-outline" size={size} color={color}/>,
            },
            {
                title: "currentVersion",
                onPress: () => {
                    checkAndUpdate()
                },
                icon: (size: number, color: string) =>
                    <MaterialCommunityIcons name="information-outline" size={size} color={color}/>,
                right: <Text className={'text-sm text-grey2'}>{currentVersion}</Text>
            },
        ],
        [
            {
                title: "accountAndSecure",
                onPress: () => {
                    router.push("/accountAndSecure");
                },
                icon: (size: number, color: string) =>
                    <MaterialCommunityIcons name="account-circle-outline" size={size} color={color}/>,
            },
        ],
    ];

    return (
        <ScrollView
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
            // style={{overflow: "hidden"}}
            // contentContainerStyle={{overflow: "visible"}}
        >
            {/* 用户信息区域 */}
            {!isLoading ? (
                <View className="p-5 pt-10 h-[120px]">
                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity activeOpacity={0.9} onPress={() => {
                            // router.navigate("/user/me")
                        }}>
                            <LetterAvatar name={email || phone} size={55}/>
                        </TouchableOpacity>

                        <View className="flex-1">
                            <View className="flex-row items-center justify-between">
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    className="text-xl font-bold text-white max-w-[180px]">
                                    {user?.username || ''}
                                </Text>
                                {/* 顶部导航栏 */}
                                <View className="flex-row justify-end items-center">
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            router.navigate("/pricing");
                                        }}
                                    >
                                        <View className="flex-row items-center bg-background2 px-3 py-1 rounded-full">
                                            <FlashIcon
                                                size={15}
                                                color={colors.primary}
                                            />
                                            <Text className="text-base text-primary font-bold ml-1">
                                                {creditState?.remaining || 0}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text className="text-sm text-grey2 leading-5 max-w-[180px]" numberOfLines={2}
                                  ellipsizeMode="tail">
                               Veogo ID: {user?.id}
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View className="p-5 pt-10 h-[120px]">
                    <View className="flex-row items-center gap-[15px]">
                        <SkeletonLoader circle width={55} height={55}/>
                        <View className="flex-1 gap-[5px]">
                            <SkeletonLoader width={120} height={15}/>
                            <SkeletonLoader width={60} height={15}/>
                            <SkeletonLoader width={200} height={15}/>
                        </View>
                    </View>
                </View>
            )}

            {/* 功能宫格 */}
            <HStack ph={15} spacing={10} mt={15}>
                {gridMenuItems.map((item, index) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        key={index}
                        onPress={() => router.push(item.route as any)}
                        className="items-center flex-1 gap-[10px] rounded-xl p-4 bg-cardBg/70"
                    >
                        {item.icon}
                        <Text className="text-primary text-sm">{t(item.title)}</Text>
                    </TouchableOpacity>
                ))}
            </HStack>

            {/* 菜单列表 */}
            <Stack ph={15} spacing={10} mt={15}>
                {/* 主题与语言设置 */}
                <View
                    className="mb-6 bg-cardBg/70 rounded-xl"
                    style={{overflow: "visible"}}
                >
                    {/*/!* 主题切换 *!/*/}
                    {/*<View className="px-4 py-4 flex-row items-center justify-between">*/}
                    {/*    <View className="flex-row items-center">*/}
                    {/*        <Feather*/}
                    {/*            name="sun"*/}
                    {/*            size={20}*/}
                    {/*            color={grey0}*/}
                    {/*            style={{marginRight: 12}}*/}
                    {/*        />*/}
                    {/*        <Text className="text-white text-base text-sm">*/}
                    {/*            {t('theme')}*/}
                    {/*        </Text>*/}
                    {/*    </View>*/}
                    {/*    <SimpleSelect*/}
                    {/*        options={getThemeOptions().map((option) => ({*/}
                    {/*            label: t(option.label),*/}
                    {/*            value: option.value,*/}
                    {/*        }))}*/}
                    {/*        value={themeMode}*/}
                    {/*        onSelect={(value) => changeTheme(value as any)}*/}
                    {/*        style={{minWidth: 120}}*/}
                    {/*    />*/}
                    {/*</View>*/}

                    {/*/!* 语言切换 *!/*/}
                    {/*<View className="px-4 py-4 flex-row items-center justify-between">*/}
                    {/*    <View className="flex-row items-center">*/}
                    {/*        <MaterialIcons*/}
                    {/*            name="language"*/}
                    {/*            size={20}*/}
                    {/*            color={grey0}*/}
                    {/*            style={{marginRight: 12}}*/}
                    {/*        />*/}
                    {/*        <Text className="text-white text-base  text-sm">*/}
                    {/*            {t("language")}*/}
                    {/*        </Text>*/}
                    {/*    </View>*/}
                    {/*    <SimpleSelect*/}
                    {/*        options={availableLanguages.map((language) => ({*/}
                    {/*            label: language.name,*/}
                    {/*            value: language.code,*/}
                    {/*        }))}*/}
                    {/*        value={locale}*/}
                    {/*        onSelect={(value) => changeLanguage(value)}*/}
                    {/*        style={{minWidth: 100}}*/}
                    {/*    />*/}
                    {/*</View>*/}
                </View>

                {menuItems.map((section, index) => (
                    <View
                        key={index}
                        className="mt-3 bg-cardBg/70 rounded-xl"
                        // style={{overflow: "visible"}}
                    >
                        {section.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                activeOpacity={0.9}
                                onPress={item?.onPress}
                                className={`px-4 py-5 flex-row items-center justify-between active:opacity-10`}
                            >
                                <View className="flex-row gap-[8px] items-center">
                                    {item.icon(20, colors.grey0)}
                                    <Text
                                        className={`text-white  text-sm ${
                                            item.isDanger ? "text-red-500" : "text-white"
                                        }`}
                                    >
                                        {t(item.title)}
                                    </Text>
                                </View>

                                <View className={'flex-row gap-0.5'}>
                                    {item.right}
                                    {item.onPress && (
                                        <AntDesign name="right" size={14} color={colors.grey3}/>
                                    )}
                                </View>

                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </Stack>

        </ScrollView>
    );
}
