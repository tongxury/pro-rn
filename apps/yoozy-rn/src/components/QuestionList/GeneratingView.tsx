import useDateFormatter from "@/hooks/useDateFormatter";
import {useTranslation} from "@/i18n/translation";
import useEventSource from "@/hooks/useEventSource";
import useTailwindVars from "@/hooks/useTailwindVars";
import React, {useEffect, useMemo} from "react";
import {Text, View} from "react-native";
import QuestionView from "./QuestionView";
import {Feather} from "@expo/vector-icons";

const LoadingView = ({data}: { data: any }) => {
    const {formatToNow} = useDateFormatter();
    const {t} = useTranslation();
    const {colors} = useTailwindVars();

    const createdTime = formatToNow(data?.createdAt);
    // const sceneName = t(`prompt.${data?.prompt?.id}`);
    const sceneName = useMemo(() => {
        return data?.content || t(`prompt.${data?.prompt?.id}`)
    }, [data])
    return (
        <View className="bg-muted rounded-lg p-5 mb-4">
            {/* Header - 与QuestionView保持一致 */}
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

            </View>

            {/* 分割线 */}
            <View className="mt-4 pt-4 border-t border-divider border-opacity-40"/>

            {/* Loading内容区域 */}
            <View className="items-center py-8">
                {/* 脉冲动画圆圈 */}
                <View className="relative mb-6">
                    <View className="w-16 h-16 bg-primary bg-opacity-10 rounded-full items-center justify-center">
                        <Feather
                            name="edit-3"
                            size={24}
                            color={colors['muted-foreground']}
                        />
                    </View>
                    {/* 脉冲效果 */}
                    <View className="absolute inset-0 w-16 h-16 bg-primary bg-opacity-5 rounded-full animate-pulse"/>
                    <View className="absolute -inset-2 w-20 h-20 bg-primary bg-opacity-5 rounded-full animate-pulse"
                          style={{animationDelay: '0.5s'}}/>
                </View>

                {/* 状态文字 */}
                <Text className="text-lg font-semibold text-foreground mb-2">
                    正在生成报告
                </Text>
                <Text className="text-sm text-muted-foreground text-center mb-4">
                    AI正在思考中，请稍候...
                </Text>

                {/* 进度指示器 */}
                <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}/>
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}/>
                </View>
            </View>
        </View>
    );
};


const GeneratingView = ({
                            data,
                            onComplete,
                        }: {
    data: any;
    onComplete?: () => void;
}) => {

    const {text: generatingText, startPolling} = useEventSource();

    const text = generatingText || data?.answer?.text

    useEffect(() => {
        startPolling({questionId: data?._id, onComplete}).then();
    }, []);

    if (text) {
        return (
            <QuestionView data={{...data, answer: {...data?.answer, text}}} defaultExpanded/>
        )
    }

    return (
        <LoadingView data={{...data, answer: {...data?.answer, text}}}/>
    )
}

export default GeneratingView;
