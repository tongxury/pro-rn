import ScreenContainer from "@/components/ScreenContainer";
import React from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";

export default function CommunityScreen() {
    const screenWidth = Dimensions.get("window").width;
    const imageSize = screenWidth * 0.8;

    return (
        <ScreenContainer stackScreenProps={{ headerShown: true, title: "加入社群" }}>
            <ScrollView className="flex-1">
                <View className="p-5 items-center">
                    <View className="items-center mb-8 mt-10">
                        <Image
                            source={{ uri: 'https://veogoresources.s3.cn-north-1.amazonaws.com.cn/support/support.jpg' }}
                            style={{
                                width: imageSize,
                                height: imageSize * 2,
                                borderRadius: 12,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}
