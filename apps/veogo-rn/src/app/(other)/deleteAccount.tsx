import React from "react";
import {View, Text, ScrollView} from "react-native";
import {useTranslation} from "@/i18n/translation";


export default function Screen() {
    const {t} = useTranslation();

    return (
        <ScrollView className="flex-1 bg-background">

        </ScrollView>
    );
}
