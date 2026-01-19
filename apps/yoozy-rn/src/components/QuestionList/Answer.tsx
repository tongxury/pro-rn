import React from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import {Platform, Text, TouchableOpacity, View,} from "react-native";
import MarkdownView from "@/components/QuestionList/MarkdownView";

import {Feather} from "@expo/vector-icons";

// 单个回答视图组件
const Answer = ({
                    data,
                    showAction = false,
                }: {
    data: any;
    showAction?: boolean;
}) => {
    const { colors } = useTailwindVars();

    const answerText = data?.text || "";

    return (
        <View
            className="rounded-xl overflow-hidden"
        >
            <MarkdownView text={answerText}/>

            {/* 底部操作栏 */}
            {showAction && (
                <View
                    className="flex-row p-3.5 border-t"
                >
                    <TouchableOpacity className="flex-row items-center mr-5.5 py-1.5 px-1.5">
                        <Feather name="copy" size={20} color={colors['muted-foreground']}/>
                        <Text className="ml-2 text-base text-muted-foreground">
                            复制
                        </Text>
                    </TouchableOpacity>

                    {/*<TouchableOpacity className="flex-row items-center mr-5.5 py-1.5 px-1.5">*/}
                    {/*  <Icon name="share-2" type="feather" size={20} color={colors['muted-foreground']} />*/}
                    {/*  <Text className="ml-2 text-base text-muted-foreground">*/}
                    {/*    分享*/}
                    {/*  </Text>*/}
                    {/*</TouchableOpacity>*/}
                </View>
            )}
        </View>
    );
};

export default Answer;
