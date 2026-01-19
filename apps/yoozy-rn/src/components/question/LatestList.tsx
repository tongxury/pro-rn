import { listQuestions, retryQuestion } from "@/api/api";
import useDateFormatter from "@/hooks/useDateFormatter";
import { useSettings } from "@/hooks/useSettings";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import MediaView from "@/components/Resource/MediaView";
import { isMedia } from "@/utils/resource";

function LatestQuestionList() {
    // const {theme} = useTheme();

    const { colors } = useTailwindVars();
    const { formatToNow } = useDateFormatter();
    const { t } = useTranslation();
    const {
        settings: { scenes },
    } = useSettings();

    const pathname = usePathname();

    // 关键修改：将 scene 参数加入 queryKey，这样不同场景会有独立的缓存
    const {
        data: qr,
        error,
        isFetching,
        status,
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ["questions", true],
        refetchInterval: 10000,
        enabled: pathname === "/session",
        queryFn: ({ pageParam }) =>
            listQuestions({
                startTs: Math.floor((Date.now() - 60 * 60 * 1000) / 1000),
                sort: "createdAt_-1",
            }),
    });

    useFocusEffect(
        useCallback(() => {
            void refetch();
        }, [])
    );

    const questions = qr?.data?.data?.list;

    if (!questions) {
        return null;
    }

    const routeToSession = (id: string) =>
        router.navigate({
            pathname: "/session/[id]",
            params: {
                id: id,
            },
        });

    // const routeToPricing = () => router.navigate({
    //     pathname: "/pricing",
    // })

    const retry = (id: string) => {
        retryQuestion({ questionId: id }).then((result) => {
            if (result?.data?.code === "exceeded") {
                router.navigate(`/pricing`);
            } else {
                void refetch();
            }
        });
    };

    return (
        <View className={"gap-4"}>
            <Text className={"text-md text-muted-foreground px-[15px]"}>
                {t("lastOneHour")} ({questions?.length || 0})
            </Text>
            <FlatList
                className={"px-5"}
                data={questions}
                horizontal
                ItemSeparatorComponent={() => <View className={"p-[8px]"} />}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: question, index }) => {

                    const media = question.session?.resources?.filter((x: any) =>
                        isMedia(x)
                    )?.[0];

                    const itemScene = scenes?.find((xx) => xx.value === question.session?.scene);


                    if (question.status === "completed") {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => routeToSession(question?.session?._id)}
                                key={index}
                                className={
                                    "relative h-[100px] w-[100px] bg-muted rounded-md"
                                }
                            >
                                <MediaView item={media} width={100} height={100} />
                                {/*<Text className={'text-white'}>{question.status}</Text>*/}

                                <View
                                    className="absolute top-1 left-1 flex-row gap-1 items-center bg-background/90 px-2 py-1 rounded-full">
                                    <View className="w-2 h-2 bg-green-500 rounded-full" />
                                    <Text className="text-white text-xs">
                                        {t(`status.clickToView`)}
                                    </Text>
                                    {/*{itemScene?.getSceneIcon({*/}
                                    {/*    size: 9,*/}
                                    {/*    color: colors['muted-foreground'],*/}
                                    {/*})}*/}
                                </View>

                                <View
                                    className={'rounded-lg absolute top-0 left-0 right-0 bottom-0 bg-background/50 items-center justify-center'}>
                                    {itemScene?.getSceneIcon({ size: 30, color: colors.primary })}
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    if (question.status === "failed") {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => retry(question?._id)}
                                key={index}
                                className={
                                    "relative h-[100px] w-[100px] bg-muted rounded-md"
                                }
                            >
                                <MediaView item={media} width={100} height={100} />
                                {/*<Text className={'text-white'}>{question.status}</Text>*/}

                                <View
                                    className="absolute top-1 left-1 flex-row gap-1 items-center bg-background/90 px-2 py-1 rounded-full">
                                    <View className="w-2 h-2 bg-red-500 rounded-full" />
                                    <Text className="text-muted-foreground text-xs">
                                        {t(`status.clickToRetry`)}{" "}
                                    </Text>
                                    {/*{itemScene?.getSceneIcon({*/}
                                    {/*    size: 9,*/}
                                    {/*    color: colors['muted-foreground'],*/}
                                    {/*})}*/}
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    if (question.status === "created") {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => retry(question?._id)}
                                key={index}
                                className={
                                    "relative h-[100px] w-[100px] bg-muted rounded-md"
                                }
                            >
                                <MediaView item={media} width={100} height={100} />
                                {/*<Text className={'text-white'}>{question.status}</Text>*/}

                                <View
                                    className="absolute top-1 left-1 flex-row gap-1 items-center bg-background/90 px-2 py-1 rounded-full">
                                    <View className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    <Text className="text-muted-foreground text-xs">
                                        {t(`status.noCredit`)}{" "}
                                    </Text>
                                    {/*{itemScene?.getSceneIcon({*/}
                                    {/*    size: 9,*/}
                                    {/*    color: colors['muted-foreground'],*/}
                                    {/*})}*/}
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <View
                            key={index}
                            className={
                                "relative h-[100px] w-[100px] bg-muted rounded-md"
                            }
                        >
                            {/*<View className="absolute top-0 left-0 right-0 bottom-0">*/}
                            {/*  <ProgressBar />*/}
                            {/*</View>*/}
                            <MediaView item={media} width={100} height={100} />
                            {/*<Text className={'text-white'}>{question.status}</Text>*/}
                            <View
                                className="absolute top-1 left-1 flex-row gap-1 items-center bg-background/90 px-2 py-1 rounded-full">
                                <View className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                <Text className="text-muted-foreground text-xs">
                                    {t(`status.clickToProcessing`)}{" "}
                                </Text>
                                {/*{itemScene?.getSceneIcon({*/}
                                {/*    size: 9,*/}
                                {/*    color: colors['muted-foreground'],*/}
                                {/*})}*/}
                            </View>
                        </View>
                    );
                }}
            />
            <View className={"bg-muted h-[0.5px]"} />
        </View>
    );
}

export default LatestQuestionList;
