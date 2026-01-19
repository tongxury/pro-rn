import ScreenContainer from "@/components/ScreenContainer";
import { useTranslation } from "@/i18n/translation";
import React from "react";
import { ScrollView } from "react-native";

export default function Screen() {
    const { t } = useTranslation();

    return (
        <ScreenContainer stackScreenProps={{ headerShown: true, title: "注销账号" }}>
            <ScrollView className="flex-1">

            </ScrollView>
        </ScreenContainer>
    );
}
