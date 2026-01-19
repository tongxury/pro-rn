import { fetchCommodities } from "@/api/commodity";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const columnCount = 2;
const cardGap = 12;
// Adjust card width calculation to fit full screen width minus padding
const containerPadding = 16;
const cardWidth = (screenWidth - (containerPadding * 2) - cardGap) / columnCount;

const CommoditySelector = ({ value, onChange }: { value: any, onChange: (value: any) => void }) => {
    const { colors } = useTailwindVars();
    const [queryKeyword, setQueryKeyword] = useState("");
    const searchTimeout = useRef<any>(null);

    const handleSearch = (text: string) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
            setQueryKeyword(text);
        }, 500);
    };

    const {
        data,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["commodities-list-selection-original", queryKeyword],
        queryFn: ({ pageParam = 1 }) => {
            const params: any = {
                page: pageParam,
                size: 10,
                returnFields: "status,medias,images,title,brand,_id",
            };
            if (queryKeyword) {
                params.keyword = queryKeyword;
            }
            return fetchCommodities(params);
        },
        getNextPageParam: (lastPage) =>
            lastPage?.data?.data?.hasMore
                ? lastPage?.data?.data?.page + 1
                : undefined,
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });

    const flatData = useMemo(() => {
        return data?.pages?.flatMap((page) => page?.data?.data?.list || []) || [];
    }, [data]);

    const renderSkeletonItem = (index: number) => {
        return (
            <View
                key={`skeleton-${index}`}
                style={{ width: cardWidth, marginBottom: 16 }}
            >
                <View className="rounded-lg overflow-hidden mb-2" style={{ backgroundColor: colors.muted }}>
                    <SkeletonLoader
                        width="100%"
                        height={cardWidth * 1.33}
                    />
                </View>
                <View className="gap-1">
                    <SkeletonLoader width="40%" height={10} />
                    <SkeletonLoader width="80%" height={12} />
                </View>
            </View>
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const firstImage = item?.images?.[0] || item.medias?.[0]?.url;
        const isSelected = value?._id === item._id;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onChange(item)}
                style={{
                    width: cardWidth,
                    marginBottom: 16,
                }}
            >
                {/* Image */}
                <View
                    className="rounded-lg overflow-hidden mb-2 relative"
                    style={{
                        backgroundColor: colors.muted,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: colors.primary
                    }}
                >
                    {firstImage ? (
                        <Image
                            source={{ uri: firstImage }}
                            style={{
                                width: "100%",
                                aspectRatio: 0.75,
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{
                                width: "100%",
                                aspectRatio: 0.75,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Feather name="image" size={24} color={colors['muted-foreground']} />
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className="px-0.5">
                    {item?.brand && (
                        <Text
                            className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
                            style={{ color: colors['muted-foreground'] }}
                            numberOfLines={1}
                        >
                            {item.brand}
                        </Text>
                    )}
                    <Text
                        className="font-medium text-xs leading-4"
                        style={{ color: isSelected ? colors.primary : colors.foreground }}
                        numberOfLines={2}
                    >
                        {item.title || item.name || "未命名商品"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">
            {/* Search Header */}
            <View className="px-4 py-3 flex-row items-center gap-3">
                <View className="flex-1 flex-row items-center rounded-lg px-3 py-2.5" style={{ backgroundColor: colors.muted }}>
                    <Feather name="search" size={16} color={colors['muted-foreground']} />
                    <TextInput
                        className="flex-1 ml-2 text-sm leading-tight"
                        style={{ color: colors.foreground, paddingVertical: 0 }}
                        placeholder="搜索商品..."
                        placeholderTextColor={colors['muted-foreground']}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                    />
                </View>
                <TouchableOpacity onPress={() => router.push("/commodity/create")} activeOpacity={0.7} style={{ padding: 4 }}>
                    <Text className="text-sm font-bold" style={{ color: colors.primary }}>去创建</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {isLoading && !data ? (
                <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Array.from({ length: 6 }).map((_, index) =>
                        renderSkeletonItem(index)
                    )}
                </View>
            ) : (
                <FlatList
                    data={flatData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `select-commodity-${item._id}-${index}`}
                    numColumns={columnCount}
                    removeClippedSubviews
                    contentContainerStyle={{
                        padding: containerPadding,
                    }}
                    columnWrapperStyle={{
                        justifyContent: "space-between",
                    }}
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
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Feather name="search" size={32} color={colors['muted-foreground']} />
                            <Text className="text-sm mt-3" style={{ color: colors['muted-foreground'] }}>未找到相关商品</Text>
                        </View>
                    }
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-4 items-center">
                                <ActivityIndicator size="small" color={colors['muted-foreground']} />
                            </View>
                        ) : <View className="h-4" />
                    }
                />
            )}
        </View>
    );
};

export default CommoditySelector;