
import CreditEntry from "@/components/CreditEntry";
import useTailwindVars from "@/hooks/useTailwindVars";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import AuthInfo from "./AuthInfo";
import { useAuthUser } from "@/hooks/useAuthUser";
import LatterAvatar from "./LatterAvatar";

interface ScreenHeaderProps {
    title?: string;
    closeable?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title = "", closeable = true }) => {
    const { colors } = useTailwindVars();

    const {user, isLoading} = useAuthUser({fetchImmediately: true})

    return (
        <View className={"px-5 pb-4 flex-row justify-between items-center"}>
            <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>{title}</Text>
            <View className={"flex-row items-center gap-4"}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : user ? (
                    <>
                        <CreditEntry />
                        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/user/my")}>
                            <LatterAvatar size={30} name={user._id!} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        onPress={() => router.push("/login" as any)}
                        activeOpacity={0.7}
                        className="bg-primary/10 px-4 py-2 rounded-full"
                    >
                        <Text className="text-primary text-xs font-bold">登录领积分</Text>
                    </TouchableOpacity>
                )}
                {
                    closeable && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }}
                        >
                            <MaterialCommunityIcons name="arrow-collapse" size={25} color={colors.foreground} />
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    );
};
