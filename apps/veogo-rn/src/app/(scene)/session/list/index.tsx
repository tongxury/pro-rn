import {View} from "react-native";
import React from "react";
import AdvancedSessionList from "@/components/session/AdvancedList";

export default function SessionListScreen() {

    return (
        <View className={'flex-1 bg-background'}>
            <AdvancedSessionList/>
        </View>
    )
}
