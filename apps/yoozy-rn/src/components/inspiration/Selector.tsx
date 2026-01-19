import { listResourceSegments } from "@/api/resource";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
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
const cardGap = 8;
const containerPadding = 16;
// Calculate width similar to inspiration list
const cardWidth = (screenWidth - (containerPadding * 2) - (cardGap * (columnCount - 1))) / columnCount;

interface SelectorProps {
    value?: any;
    onChange: (value: any) => void;
}

const Selector = ({ value, onChange }: SelectorProps) => {
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
        queryKey: ["inspiration-list-selection", queryKeyword],
        queryFn: ({ pageParam = 1 }) => {
            const params: any = {
                page: pageParam,
                size: 20,
                keyword: queryKeyword,
                returnFields: [
                    "segments",
                    "highlightFrames",
                    "status",
                    "typedTags.text",
                    "typedTags.picture",
                    "typedTags.scene",
                    "description",
                    "_id"
                ].join(",")
            };
            return listResourceSegments(params);
        },
        getNextPageParam: (lastPage) => {
            const { size, total, page } = lastPage?.data?.data || {};
            return size * page < total ? page + 1 : undefined;
        },
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
                style={{ width: cardWidth, marginBottom: 15 }}
                className="rounded-lg overflow-hidden"
            >
                <SkeletonLoader
                    width="100%"
                    height={cardWidth * (12 / 9)}
                    style={{ aspectRatio: 9 / 12 }}
                />
                <View className="py-2 px-2 gap-1.5">
                    <SkeletonLoader width="90%" height={14} />
                    <SkeletonLoader width="70%" height={14} />
                </View>
            </View>
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isSelected = value?._id === item._id;
        const imageUrl = item.segments?.[0]?.startFrame || item.highlightFrames?.[0]?.url || item.coverUrl;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onChange(item)}
                style={{
                    width: cardWidth,
                    // marginBottom: 15,
                }}
                className="rounded-lg overflow-hidden self-start"
            >
                <View
                    className={`rounded-lg overflow-hidden relative ${isSelected ? 'border-2 border-primary' : ''}`}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', aspectRatio: 9 / 12 }}
                        resizeMode="cover"
                    />
                    {isSelected && (
                        <View className="absolute inset-0 bg-primary/20 items-center justify-center">
                            <Feather name="check" size={24} color={"#ffffff"} />
                        </View>
                    )}
                </View>
                <Text
                    className="text-xs text-white/90 leading-5 py-2 px-1"
                    numberOfLines={2}
                >
                    {item?.description || item?.commodity?.name || "未命名灵感"}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">
            {/* Search Header */}
            <View className="px-4 py-3">
                <View className="flex-row items-center rounded-xl px-3 py-2.5" style={{ backgroundColor: colors.muted }}>
                    <Feather name="search" size={16} color={colors['muted-foreground']} />
                    <TextInput
                        className="flex-1 ml-2 text-sm leading-tight"
                        style={{ color: colors.foreground, paddingVertical: 0 }}
                        placeholder="搜索灵感..."
                        placeholderTextColor={colors['muted-foreground']}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                    />
                </View>
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
                    keyExtractor={(item, index) => `select-inspiration-${item._id}-${index}`}
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
                            <Text className="text-sm mt-3" style={{ color: colors['muted-foreground'] }}>未找到相关灵感</Text>
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

export default Selector;
