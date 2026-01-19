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

const QuestionView = ({data, defaultExpanded}: { data: Question, defaultExpanded?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const {formatToNow} = useDateFormatter();
    const {t} = useTranslation();
    const {colors} = useTailwindVars();

    const createdTime = formatToNow(data?.createdAt);
    // const sceneName = t(`prompt.${data?.prompt?.id}`);
    const text = data?.answer?.text || data?.answers?.[0]?.text || '';

    const summary = useMemo(() => {
        const plainText = text
            .replace(/#{1,6}\s+/g, '') // 去除标题标记
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // 去除粗体斜体
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // 去除代码标记
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 去除链接，保留文本
            .replace(/\n+/g, ' ') // 换行替换为空格
            .trim();

        return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

    }, [data?.answer?.text])


    const sceneName = useMemo(() => {
        return data?.prompt?.content || t(`prompt.${data?.prompt?.id}`)
    }, [data])

    return (
        <View className="bg-muted rounded-lg p-5">
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

                    <TouchableOpacity
                        onPress={() => setIsExpanded(!isExpanded)}
                        className={`p-2 bg-background rounded-xl items-center justify-center border border-divider border-opacity-30`}
                    >
                        <Feather
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={isExpanded ? colors.primary : colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>


            <View className="flex-row items-center h-0.5 bg-divider my-5"></View>

            {/* 内容区域 */}
            <ScrollView className="relative">
                {/* 折叠状态 - 简介效果 */}
                {!isExpanded && (
                    <View>
                        {/* 简介区域 */}
                        <View
                            className="rounded-lg"
                        >
                            <Text
                                className="text-sm text-muted-foreground leading-6"
                            >
                                {summary}
                            </Text>
                        </View>

                        {/* 展开提示按钮 */}
                        <TouchableOpacity
                            onPress={() => setIsExpanded(true)}
                            className="mt-4 py-3 px-4 rounded-lg flex-row items-center justify-center"
                            style={{}}
                        >
                            <Feather
                                name="eye"
                                size={16}
                                color={colors['muted-foreground']}
                                style={{marginRight: 8}}
                            />
                            <Text className="text-sm font-medium text-muted-foreground">
                                查看完整内容
                            </Text>
                            <Feather
                                name="chevron-down"
                                size={16}
                                color={colors['muted-foreground']}
                                style={{marginLeft: 8}}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* 展开状态 - 显示完整内容 */}
                {isExpanded && (
                    <View>
                        <MarkdownView text={text}/>

                        {/* 收起提示按钮 */}
                        <TouchableOpacity
                            onPress={() => setIsExpanded(false)}
                            className="mt-6 py-3 px-4 rounded-lg flex-row items-center justify-center"
                            style={{}}
                        >
                            <Feather
                                name="eye-off"
                                size={16}
                                color={colors['muted-foreground']}
                                style={{marginRight: 8}}
                            />
                            <Text className="text-sm font-medium text-muted-foreground">
                                收起内容
                            </Text>
                            <Feather
                                name="chevron-up"
                                size={16}
                                color={colors['muted-foreground']}
                                style={{marginLeft: 8}}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default QuestionView;
