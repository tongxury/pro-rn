import React, {useEffect, useState} from "react";
import {router, Tabs} from "expo-router";
import {useClientOnlyValue} from "@/components/useClientOnlyValue";
import {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {Pressable, Text, View} from "react-native";
import SceneSelector from "@/components/scene/SceneSelector";
import "../../global.css";
import {getAuthToken} from "@/utils";
import {useTranslation} from "@/i18n/translation";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import useAppUpdate from "@/hooks/useAppUpdate";
import {MaterialIcons} from "@expo/vector-icons";


const barHeight = 50

function CustomTabBar({state, descriptors, navigation}: BottomTabBarProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const {t} = useTranslation();


    return (
        <>
            <View
                className={`flex-row justify-around items-center h-[${barHeight}px] bg-background/90 absolute bottom-0 left-0 right-0`}>
                {state?.routes.map((route, index) => {
                    const {options} = descriptors[route.key];

                    const isFocused = state.index === index;

                    // For center plus button
                    if (route.name === "new") {

                        return (
                            <Pressable
                                key={route.key}
                                className="flex-1 items-center justify-center h-full"
                                onPress={async () => {
                                    // todo 认证判断
                                    const token = await getAuthToken();
                                    if (!token) {
                                        router.navigate("/login");
                                        return;
                                    }
                                    setModalVisible(true);
                                }}
                            >
                                <View className="items-center justify-center h-full w-full">
                                    <View
                                        className="w-[50px] h-[38px] rounded-[10px] items-center justify-center border-2 border-background bg-primary">
                                        <MaterialIcons
                                            name="add"
                                            size={24}
                                            color={'#fff'}
                                        />
                                    </View>
                                </View>
                            </Pressable>
                        );
                    }

                    const onPress = async () => {
                        if (route.name === "my") {
                            // todo 认证判断
                            const token = await getAuthToken();
                            if (!token) {
                                router.navigate("/login");
                                return;
                            }
                        }
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            className="flex-1 items-center justify-center h-full"
                            onPress={onPress}
                        >
                            {/*{options.tabBarIcon?.({*/}
                            {/*    focused: isFocused,*/}
                            {/*    size: 20,*/}
                            {/*    color: isFocused ? whiteColor : grey2Color,*/}
                            {/*})}*/}
                            <Text
                                style={{fontWeight: 600}}
                                className={`text-md mt-[2px] ${
                                    isFocused ? "text-white" : "text-grey2"
                                }`}
                            >
                                {t(`tab.${route.name}`)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <SceneSelector
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}

export default function TabLayout() {
    const {t} = useTranslation();

    useAppUpdate()

    return (
        <>
            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    tabBarStyle: {
                        display: "none", // Hide default tab bar
                    },
                    headerShown: useClientOnlyValue(false, false),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        // title: t("tab.index"),
                        sceneStyle: {marginBottom: barHeight},
                        tabBarIcon: ({size, color}) => (
                            <FontAwesome6 name="house-fire" size={size} color={color}/>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="leaderboard/index"
                    options={{
                        // title: t("tab.hot"),
                        sceneStyle: {marginBottom: barHeight},
                        tabBarIcon: ({size, color}) => (
                            <FontAwesome6 name="house-fire" size={size} color={color}/>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="new"
                    options={{
                        title: "",
                    }}
                />

                <Tabs.Screen
                    name="session"
                    options={{
                        // title: t("tab.session"),
                        sceneStyle: {marginBottom: barHeight},
                        tabBarIcon: ({size, color}) => (
                            <FontAwesome5 name="user-alt" size={size} color={color}/>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="my"
                    options={{
                        // title: t("tab.my"),
                        sceneStyle: {marginBottom: barHeight},
                        tabBarIcon: ({size, color}) => (
                            <FontAwesome5 name="user-alt" size={size} color={color}/>
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}
