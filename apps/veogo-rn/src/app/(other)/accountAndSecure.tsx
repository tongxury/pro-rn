import React from "react";
import {Alert, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import {useColors} from "@/hooks/uesColors";
import {router} from "expo-router";
import {clearAuthToken} from "@/utils";
import {Stack} from "react-native-flex-layout";
import {useTranslation} from "@/i18n/translation";


export default function Screen() {
    const {primary, grey0, grey2} = useColors();

    const {t} = useTranslation()

    const menuItems: any[][] = [
        [
            {
                title: "deleteAccount",
                route: "deleteAccount",
            },
            {
                title: "logout",
                key: "logout",
            },
        ],
    ];

    const handleMenuPress = async (item: any) => {
        Alert.alert(t(item.title), "", [
            {
                text: t('cancel'), onPress: async () => {
                }
            },
            {
                text: t('confirm'), style: 'destructive', onPress: async () => {
                    await clearAuthToken();
                    router.replace("/");
                }
            }
        ]);


    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
            // style={{overflow: "hidden"}}
            // contentContainerStyle={{overflow: "visible"}}
        >
            {/* 菜单列表 */}
            <Stack ph={15} spacing={10} mt={15}>
                {menuItems.map((section, index) => (
                    <View
                        key={index}
                        className="bg-background0/70 rounded-xl"
                        // style={{overflow: "visible"}}
                    >
                        {section.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                activeOpacity={0.9}
                                onPress={() => handleMenuPress(item)}
                                className={`px-4 py-5 flex-row items-center justify-between active:opacity-10`}
                            >
                                <View className="flex-row gap-[8px] items-center">
                                    {item.icon?.(20, grey0)}
                                    <Text
                                        className={`text-base  text-sm ${
                                            item.isDanger ? "text-red-500" : "text-white"
                                        }`}
                                    >
                                        {t(item.title)}
                                    </Text>
                                </View>
                                {item.route && (
                                    <AntDesign name="right" size={16} color="#666"/>
                                )}
                                {item.right}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </Stack>

        </ScrollView>
    );
}
