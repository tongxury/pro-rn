import ScreenContainer from "@/components/ScreenContainer";

import useAppUpdate from "@/hooks/useAppUpdate";
import { useAuthUser } from "@/hooks/useAuthUser";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import "../../global.css";

const TAB_BAR_HEIGHT = 60;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { colors } = useTailwindVars();
  const { user } = useAuthUser();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <View className="bg-background absolute bottom-0 left-0 right-0 z-50 shadow-sm">

      <View className="flex-row justify-between items-center h-[60px] px-2">
        {state?.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = async () => {
            if (route.name === "record" && !user) {
              router.navigate("/login");
              return;
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
              className="flex-1 items-center justify-center h-full gap-2"
              onPress={onPress}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                size: 20,
                color: isFocused ? colors.primary : colors['muted-foreground'],
              })}
              <Text
                className={`text-[12px] font-medium ${isFocused ? "text-primary" : "text-muted-foreground"}`}
              >
                {t(`tab.${route.name}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTailwindVars();
  useAppUpdate();
  const { user } = useAuthUser({ fetchImmediately: true });

  return (
    <ScreenContainer edges={['bottom']}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { marginBottom: TAB_BAR_HEIGHT, backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            // title: t("tab.index"),

            tabBarIcon: ({ size, color }) => (
              <FontAwesome6 name="house-fire" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5
                name="star-and-crescent"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            headerShown: true,
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="history" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ScreenContainer>
  );
}
