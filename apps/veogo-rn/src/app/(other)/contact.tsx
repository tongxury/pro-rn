import React from "react";
import {View, Text, ScrollView, Image, Dimensions} from "react-native";
import {useTranslation} from "@/i18n/translation";

export default function ContactScreen() {
    const {t} = useTranslation();
    const screenWidth = Dimensions.get("window").width;
    const imageSize = screenWidth * 0.8;

    return (
        <ScrollView className="flex-1 bg-background">
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
                    <Text className="text-grey2 text-base mb-4 text-center">
                        {t("contactQRText")}
                    </Text>
                    <Text className="text-grey2 text-sm text-center">
                        {t("contactEmail")}
                    </Text>
                </View>

            </View>
        </ScrollView>
    );
}
