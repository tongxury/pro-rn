import {Question} from "@/types";
import React, {useMemo, useState} from "react";
import useDateFormatter from "@/hooks/useDateFormatter";
import {useTranslation} from "@/i18n/translation";
import useTailwindVars from "@/hooks/useTailwindVars";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import * as Clipboard from "expo-clipboard";
import {Toast} from "react-native-toast-notifications";
import MarkdownView from "@/components/QuestionList/MarkdownView";
import {Feather} from "@expo/vector-icons";

const QuestionView = ({data}: { data: Question }) => {
    const {formatToNow} = useDateFormatter();
    const {t} = useTranslation();
    const {colors} = useTailwindVars();

    const createdTime = formatToNow(data?.createdAt);
    // const sceneName = t(`prompt.${data?.prompt?.id}`);
    const text = data?.answer?.text || data?.answers?.[0]?.text || '';


    const sceneName = useMemo(() => {
        return data?.prompt?.content || t(`prompt.${data?.prompt?.id}`)
    }, [data])

    return (
        <View className="bg-background rounded-lg">
            <View className="flex-row justify-between items-center">
                {/* 左侧信息 */}
                <View className="flex-1 pr-4">
                    <View className="flex-row items-center mb-2">
                        <Text className="text-xl font-bold text-foreground flex-1">
                            {sceneName}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 bg-grey2 rounded-full mr-2 opacity-60"/>
                        <Text className="text-sm text-muted-foreground font-medium">
                            {createdTime}
                        </Text>
                    </View>
                </View>

                {/* 右侧按钮 */}
                <View className="flex-row items-center gap-1">
                    {
                        data?.status === "completed" &&
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                Clipboard.setStringAsync(text).then(() => {
                                    Toast.show("复制成功!", {type: "success"});
                                });
                            }}
                            className="p-2 bg-background bg-opacity-15 rounded-xl items-center justify-center border border-divider border-opacity-30"
                        >
                            <Feather name="copy" size={16} color={colors.primary}/>
                        </TouchableOpacity>

                    }
                </View>
            </View>


            {/*<View className="flex-row items-center h-0.5 bg-divider my-5"></View>*/}

            {/*<ScrollView>*/}
            {/*    <MarkdownView text={text}/>*/}
            {/*</ScrollView>*/}
        </View>
    );
};

export default QuestionView;
