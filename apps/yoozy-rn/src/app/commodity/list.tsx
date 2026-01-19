import { fetchCommodities } from "@/api/commodity";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const columnCount = 2;
const gap = 12;
// Adjust card width calculation to account for side padding (16) and gap between cards (12)
const containerPadding = 16;
const cardWidth = (screenWidth - containerPadding * 2 - gap) / columnCount;

export default function CommodityListScreen() {
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
        queryKey: ["commodities-list", queryKeyword], // Include keyword in query key
        queryFn: ({ pageParam = 1 }) => {
            const params: any = {
                page: pageParam,
                size: 20,
                returnFields: "status,medias,images,title,brand",
            };
            if (queryKeyword) {
                params.keyword = queryKeyword;
            }
            return fetchCommodities(params);
        },
        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore
                ? lastPage?.data?.data?.page + 1
                : undefined,
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });

    const flatData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
    }, [data]);

    // 渲染骨架屏项
    const renderSkeletonItem = (index: number) => {
        return (
            <View
                key={`skeleton-${index}`}
                style={{
                    width: cardWidth,
                    marginBottom: 24,
                }}
            >
                {/* Image */}
                <View className="bg-muted rounded-lg overflow-hidden mb-3">
                    <SkeletonLoader
                        width="100%"
                        height={cardWidth * 1.33} // 3:4 Aspect Ratio
                    />
                </View>
                {/* Text */}
                <View className="gap-2">
                    <SkeletonLoader width="40%" height={10} />
                    <SkeletonLoader width="90%" height={14} />
                    <SkeletonLoader width="60%" height={14} />
                </View>
            </View>
        );
    };

    // 渲染商品列表项 - Editorial Style
    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const firstImage = item.images?.[0] || item.medias?.[0]?.url;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    router.push(`/commodity/${item._id}`);
                }}
                style={{
                    width: cardWidth,
                    marginBottom: 32, // More breathing room
                }}
            >
                {/* Image Container - Clean, no shadows, subtle rounding */}
                <View className="bg-muted rounded-lg overflow-hidden mb-3 relative">
                    {firstImage ? (
                        <Image
                            source={{ uri: firstImage }}
                            style={{
                                width: "100%",
                                aspectRatio: 0.75, // 3:4 Ratio for fashion look
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

                    {/* Created Status Overlay - Minimal */}
                    {item.status === 'created' && (
                        <View className="absolute bottom-0 left-0 right-0 bg-primary/90 py-1 items-center">
                            <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
                                添加中
                            </Text>
                        </View>
                    )}
                </View>

                {/* Content - Minimal text below image */}
                <View className="gap-1.5 px-0.5">
                    {/* Brand */}
                    {!!item.brand && (
                        <Text
                            className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase"
                            numberOfLines={1}
                        >
                            {item.brand}
                        </Text>
                    )}

                    {/* Title */}
                    <Text
                        className="text-black font-normal text-[13px] leading-5 tracking-tight"
                        numberOfLines={2}
                    >
                        {item.title || item.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // 商品列表
    return (
        <View className="flex-1 bg-background mt-4">
            {/* Search Header */}
            <View style={{ paddingHorizontal: containerPadding, paddingBottom: 10 }}>
                <View className="flex-row items-center gap-3">
                    <View className="flex-1 flex-row items-center bg-muted rounded-full px-4 py-2.5">
                        <Feather name="search" size={16} color={colors['muted-foreground']} />
                        <TextInput
                            className="flex-1 ml-2 text-sm text-black font-medium leading-5"
                            placeholder="搜索..."
                            placeholderTextColor={colors['muted-foreground']}
                            onChangeText={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                            clearButtonMode="while-editing"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/commodity/create")}
                        className="bg-muted w-10 h-10 rounded-full items-center justify-center"
                        style={{ width: 44, height: 44 }} // Match height roughly
                        activeOpacity={0.8}
                    >
                        <Feather name="plus" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && !data ? (
                <View style={{ padding: containerPadding, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Array.from({ length: 6 }).map((_, index) =>
                        renderSkeletonItem(index)
                    )}
                </View>
            ) : (
                <FlatList
                    data={flatData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `commodity-${item._id}-${index}`}
                    numColumns={columnCount}
                    removeClippedSubviews
                    contentContainerStyle={{
                        paddingHorizontal: containerPadding,
                        paddingTop: 10,
                        paddingBottom: 40,
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
                        <View className="items-center justify-center py-32">
                            <View className="bg-muted rounded-full p-6 mb-4">
                                <Feather name="grid" size={40} color={colors['muted-foreground']} />
                            </View>
                            <Text className="text-muted-foreground text-sm tracking-wide">暂无商品</Text>
                        </View>
                    }
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="small" color={colors['muted-foreground']} />
                            </View>
                        ) : !hasNextPage && flatData.length > 0 ? (
                            <View className="py-12 items-center">
                                <View className="w-12 h-[1px] bg-divider mb-4" />
                                <Text className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase opacity-50">
                                    — 到底了 —
                                </Text>
                            </View>
                        ) : <View className="h-10" />
                    }
                />
            )}
        </View>
    );
}

