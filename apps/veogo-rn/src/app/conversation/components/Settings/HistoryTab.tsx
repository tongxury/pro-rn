import React from "react";
import { 
    View, 
    Text 
} from "react-native";
import { Feather } from "@expo/vector-icons";

export const HistoryTab = () => {
    return (
        <View className="flex-1 items-center justify-center pb-20">
            <Feather name="clock" size={64} color="rgba(255,255,255,0.1)" />
            <Text className="text-white/40 font-medium text-center mt-4">No recent conversations found.</Text>
        </View>
    );
};
