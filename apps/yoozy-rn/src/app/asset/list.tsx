import { listAssets } from "@/api/asset";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { workflowConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const containerPadding = 16;

const AssetList = () => {
    const { colors } = useTailwindVars();

    const {
        data,
        isLoading,
        isRefetching,
        hasNextPage,
        refetch,
        fetchNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["assets"],
        queryFn: ({ pageParam = 1 }) => listAssets({ page: pageParam }),
        getNextPageParam: (lastPage: any) => {
            const { size, total, page } = lastPage?.data?.data || {};
            return size * page < total ? page + 1 : undefined;
        },
    });

    const flatData = useMemo(() => {
        return data?.pages?.flatMap((page: any) => page?.data?.data?.list || []) || [];
    }, [data]);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const coverUrl = item.coverUrl || item.commodity?.media?.[0]?.url;
        // Logic: If workflow exists and status is NOT completed, it is creating.
        const isCreating = item?.workflow?.status !== 'completed';

        const workflowName = item.workflow?.name ;
        const workflowLabel = workflowConfig[workflowName]?.label;

        const iconUrl = item.commodity?.images?.[0];

        return (
            <Animated.View
                entering={FadeInDown.delay(index % 10 * 100).springify()}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/asset/${item._id}`)}
                    className="flex-col gap-2"
                >
                    {/* Header: Workflow Label */}
                    <Text className="text-sm text-muted-foreground font-medium">{workflowLabel}</Text>

                    {/* <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-6 h-6 rounded-md bg-muted items-center justify-center overflow-hidden">
                            {iconUrl ? (
                                <Image source={{ uri: iconUrl }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <Feather name="box" size={10} color={colors['muted-foreground']} />
                            )}
                        </View>
                        <Text className="text-md text-foreground max-w-[220px]" numberOfLines={1}>
                            {item.title || item.commodity?.title}
                        </Text>
                    </View> */}

                    {/* Main Content Card */}
                    <View className={`w-[130px] aspect-[3/4] rounded-xl overflow-hidden relative ${isCreating ? 'bg-[#F5F3FF]' : 'bg-muted'}`}>
                        {coverUrl && !isCreating ? (
                            <Image
                                source={{ uri: coverUrl }}
                                className="absolute inset-0 w-full h-full"
                                resizeMode="cover"
                            />
                        ) : isCreating ? (
                            <View className="flex-1 items-center justify-center gap-3">
                                {/* Custom Spinner Placeholder or ActivityIndicator */}
                                <View className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 items-center justify-center">
                                    <ActivityIndicator size="small" color="#8B5CF6" />
                                </View>
                                <Text className="text-[#8B5CF6] text-sm font-bold tracking-wide">创作进行中</Text>
                            </View>
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Feather name="image" size={32} color={colors['muted-foreground']} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Animated.FlatList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={(item: any) => item._id}
            contentContainerStyle={{
                padding: containerPadding,
            }}
            ItemSeparatorComponent={() => <View className="h-5" />}
            refreshControl={
                <CustomRefreshControl
                    refreshing={isRefetching}
                    onRefresh={() => void refetch()}
                />
            }
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            // Use itemLayoutAnimation for smooth reordering if needed
            itemLayoutAnimation={Layout.springify()}
            ListEmptyComponent={
                !isLoading ? (
                    <View className="items-center justify-center py-32">
                        <View className="bg-gray-100 p-8 rounded-full mb-6">
                            <Feather name="video" size={40} color={colors['muted-foreground']} />
                        </View>
                        <Text className="text-lg font-bold text-foreground mb-2">暂无作品内容</Text>
                        <Text className="text-sm text-muted-foreground mb-8 text-center px-10">
                            您还没有创作过作品，快去开启您的智能视频创作之旅吧
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/new' as any)}
                            className="bg-primary px-8 py-3 rounded-full shadow-lg shadow-primary/20"
                        >
                            <Text className="text-white font-bold text-base">立即创作</Text>
                        </TouchableOpacity>
                    </View>
                ) : null
            }
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View className="py-6 items-center">
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : <View className="h-8" />
            }
        />
    );
};

export default AssetList;
