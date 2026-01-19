import React, {useCallback} from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";

import {router, useFocusEffect} from "expo-router";
import {HStack, Stack} from "react-native-flex-layout";
import LetterAvatar from "@/components/LatterAvatar";
import {useTranslation} from "@/i18n/translation";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import {useQuery} from "@tanstack/react-query";
import {getUser} from "@/api/api";
import {FlashIcon} from "@/constants/scene_icons";
import useAppUpdate from "@/hooks/useAppUpdate";
import {fetchCreditState} from "@/api/payment";
import {useAuthUser} from "@/hooks/useAuthUser";


export default function MyScreen() {
    const { colors } = useTailwindVars();

    const {user, isLoading} = useAuthUser({fetchImmediately: true});


    const {currentVersion, checkAndUpdate} = useAppUpdate()

    const {t,} = useTranslation();


    const menuItems: any[][] = [
        [
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
                right: <Text className={'text-sm text-muted-foreground'}>{currentVersion}</Text>
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
            {user ? (
                <View className="p-5 h-[120px]">
                    <View className="flex-col items-center gap-4">
                        <TouchableOpacity activeOpacity={0.9} onPress={() => {
                            // router.navigate("/user/me")
                        }}>
                            <LetterAvatar name={user._id!} size={70}/>
                        </TouchableOpacity>

                        <Text className="text-sm text-muted-foreground leading-5 max-w-[120px]" numberOfLines={1}
                              ellipsizeMode="tail">
                            Yoozy ID: {user?._id}
                        </Text>
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

            {/* 菜单列表 */}
            <Stack ph={15} spacing={10} mt={15}>
                {/* 主题与语言设置 */}
                <View
                    className="mb-6 bg-card/70 rounded-xl"
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
                        className="mt-3 bg-card/70 rounded-xl"
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
                                    {item.icon(20, colors.foreground)}
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
                                        <AntDesign name="right" size={14} color={colors['muted-foreground']}/>
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
