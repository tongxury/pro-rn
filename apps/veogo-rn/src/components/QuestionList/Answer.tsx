import React from "react";
import {Platform, Text, TouchableOpacity, View,} from "react-native";
import MarkdownView from "@/components/QuestionList/MarkdownView";
import {useColors} from "@/hooks/uesColors";
import {Feather} from "@expo/vector-icons";

// 单个回答视图组件
const Answer = ({
                    data,
                    showAction = false,
                }: {
    data: any;
    showAction?: boolean;
}) => {
    const {grey1, grey3, grey4, grey5} = useColors();

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
                        <Feather name="copy" size={20} color={grey1}/>
                        <Text className="ml-2 text-base text-grey1">
                            复制
                        </Text>
                    </TouchableOpacity>

                    {/*<TouchableOpacity className="flex-row items-center mr-5.5 py-1.5 px-1.5">*/}
                    {/*  <Icon name="share-2" type="feather" size={20} color={grey1} />*/}
                    {/*  <Text className="ml-2 text-base text-grey1">*/}
                    {/*    分享*/}
                    {/*  </Text>*/}
                    {/*</TouchableOpacity>*/}
                </View>
            )}
        </View>
    );
};

export default Answer;
