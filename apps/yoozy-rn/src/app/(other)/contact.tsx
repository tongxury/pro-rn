import ScreenContainer from "@/components/ScreenContainer";
import { useTranslation } from "@/i18n/translation";
import React from "react";
import { Dimensions, Image, ScrollView, Text, View } from "react-native";

export default function ContactScreen() {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth * 0.8;

  return (
    <ScreenContainer stackScreenProps={{ headerShown: true, title: "联系客服" }}>
      <ScrollView className="flex-1">
        <View className="p-5 items-center">
          <View className="items-center mb-8 mt-10">
            <Image
              source={require("../../assets/images/kefu.png")}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 12,
              }}
              resizeMode="contain"
            />
          </View>

          <View className="w-full">
            <Text className="text-muted-foreground text-base mb-4 text-center">
              {t("contactQRText")}
            </Text>
            <Text className="text-muted-foreground text-sm text-center">
              {t("contactEmail")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
