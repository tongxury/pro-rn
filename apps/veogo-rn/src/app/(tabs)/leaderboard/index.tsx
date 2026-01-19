import React from "react";
import {Text, TouchableOpacity, View,} from "react-native";
import {useTranslation} from "@/i18n/translation";
import {useColors} from "@/hooks/uesColors";
import Octicons from '@expo/vector-icons/Octicons';
import {router} from "expo-router";
import AdvancedItemList from "@/components/item/AdvancedList";


export default function TrendingScreen() {
    const {t} = useTranslation();
    const colors = useColors();

    return (
        <View className="flex-1 bg-background">
            {/*<TouchableOpacity activeOpacity={0.9} onPress={() => router.navigate('/search')}*/}
            {/*                  className="flex-row items-center bg-background2 rounded-full py-3 mx-5 px-4 gap-1">*/}
            {/*    <Octicons name="search" color={colors.grey3} size={17}/>*/}
            {/*    <Text className="text-grey3 text-md">{t("leaderboard.search")}</Text>*/}
            {/*</TouchableOpacity>*/}

            <AdvancedItemList/>
        </View>
    );

}

