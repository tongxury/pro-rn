import { listResourceSegments } from "@/api/resource";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { prefetchVideo, initVideoCache } from "@/utils/videoCache";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    TouchableOpacity,
    View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 12;
const containerPadding = 16;
const columnWidth =
    (screenWidth - containerPadding * 2 - itemMargin * (numColumns - 1)) / numColumns;

interface InspirationListProps {
    query?: string;
}

export default function InspirationList({ query = "" }: InspirationListProps) {
    const { colors } = useTailwindVars();

    // Removed local initVideoCache as it's now global in _layout.tsx

    const {
        data,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["items", "inspiration", query],
        queryFn: ({ pageParam }) => {
            const params = {
                page: pageParam || 1,
                size: 20,
                keyword: query,
                returnFields: [
                    "segments",
                    "highlightFrames",
                    "status",
                    "typedTags.text",
                    "typedTags.picture",
                    "typedTags.scene",
                    "description",
                    "root.url"
                ].join(",")
            };
            return listResourceSegments(params);
        },
        getNextPageParam: (lastPage) => {
            const { size, total, page } = lastPage?.data?.data || {};
            return size * page < total ? (page || 0) + 1 : undefined;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours persistence
        refetchOnWindowFocus: false,
    });

    const flatData = useMemo(() => {
        return data?.pages.flatMap((page) => page?.data?.data?.list || []) || [];
    }, [data]);

    useEffect(() => {
        if (flatData.length > 0) {
            // 立即触发全局预加载，确保进入详情页前视频已就绪
            // 我们优先处理前 6 个，然后再异步处理剩余的
            const topItems = flatData.slice(0, 10);
            const remainingItems = flatData.slice(10);

            topItems.forEach(item => {
                const videoUrl = item.root?.url;
                if (videoUrl) void prefetchVideo(videoUrl);
            });

            // 稍微延迟处理后续视频，避免抢占列表首屏图片的带宽
            const timer = setTimeout(() => {
                remainingItems.forEach(item => {
                    const videoUrl = item.root?.url;
                    if (videoUrl) void prefetchVideo(videoUrl);
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [flatData]);

    const renderSkeletonItem = (index: number) => {
        return (
            <View
                key={`skeleton-${index}`}
                style={{
                    width: columnWidth,
                    marginBottom: 15,
                }}
                className="bg-card rounded-lg overflow-hidden"
            >
                <SkeletonLoader
                    width="100%"
                    height={columnWidth * (12 / 9)}
                    style={{ aspectRatio: 9 / 12 }}
                />
                <View className="py-2 px-2 gap-1.5">
                    <SkeletonLoader width="90%" height={14} />
                    <SkeletonLoader width="70%" height={14} />
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const videoUrl = item.root?.url;
        const coverUrl = item.segments?.[0]?.startFrame || item.highlightFrames?.[0]?.url || item.coverUrl;

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => router.push({
                    pathname: `/inspiration/${item._id}` as any,
                    params: { 
                        videoUrl: videoUrl ? encodeURIComponent(videoUrl) : '',
                        coverUrl: coverUrl ? encodeURIComponent(coverUrl) : ''
                    }
                })}
                style={{
                    width: columnWidth,
                }}
                className="bg-background rounded-lg overflow-hidden self-start relative"
            >
                <Image
                    source={{ uri: coverUrl }}
                    className="aspect-[9/12] bg-card"
                    resizeMode="cover"
                />
                <View className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 backdrop-blur-sm">
                    <Ionicons name="play" size={12} color="white" />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading && !data) {
        return (
            <View className="flex-1">
                <View style={{ padding: containerPadding }}>
                    <View className="flex-row flex-wrap justify-between">
                        {Array.from({ length: 8 }).map((_, index) =>
                            renderSkeletonItem(index)
                        )}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <FlatList
                data={flatData}
                numColumns={numColumns}
                contentContainerStyle={{
                    paddingHorizontal: containerPadding,
                    paddingTop: 10,
                }}
                ItemSeparatorComponent={() => <View className={"h-[15px]"} />}
                columnWrapperStyle={
                    numColumns > 1 ? { justifyContent: "space-between" } : undefined
                }
                renderItem={renderItem}
                keyExtractor={(item, index) => `item-${item.id}-${index}`}
                refreshing={isRefetching}
                onRefresh={() => {
                    void refetch();
                }}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        void fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshControl={
                    <CustomRefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
                }
            />
        </View>
    );
}
