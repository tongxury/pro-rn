import useTailwindVars from "@/hooks/useTailwindVars";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import ScreenContainer from "@/components/ScreenContainer";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useTranslation } from "@/i18n/translation";
import { clearAuthToken } from "@/utils";
import { router } from "expo-router";
import { Stack } from "react-native-flex-layout";

export default function Screen() {
  const { colors } = useTailwindVars();

  const { t } = useTranslation();

  const { setUser } = useAuthUser();

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
        text: t("cancel"),
        onPress: async () => { },
      },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          await clearAuthToken();
          setUser(undefined);
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ScreenContainer stackScreenProps={{ headerShown: true, title: "账户和安全" }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      // style={{overflow: "hidden"}}
      // contentContainerStyle={{overflow: "visible"}}
      >
        {/* 菜单列表 */}
        <Stack ph={15} spacing={10} mt={15}>
          {menuItems.map((section, index) => (
            <View
              key={index}
              className="bg-card/50 rounded-xl"
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
                    {item.icon?.(20, colors.foreground)}
                    <Text
                      className={`text-base  text-sm ${item.isDanger ? "text-red-500" : ""
                        }`}
                    >
                      {t(item.title)}
                    </Text>
                  </View>
                  {item.route && (
                    <AntDesign name="right" size={16} color="#666" />
                  )}
                  {item.right}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </Stack>
      </ScrollView>
    </ScreenContainer>
  );
}
