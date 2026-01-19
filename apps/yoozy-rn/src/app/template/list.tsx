import { listItems } from "@/api/resource";
import { CustomRefreshControl } from "@/components/CustomRefreshControl";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 2;
const itemMargin = 12;
const containerPadding = 16;
const columnWidth =
    (screenWidth - containerPadding * 2 - itemMargin * (numColumns - 1)) /
    numColumns;

interface TemplateListProps {
    query?: string;
}

export default function TemplateList({ query = "" }: TemplateListProps) {

    const { colors } = useTailwindVars();
    // Removed internal search state and handlers

    const {
        data,
        isLoading,
        isRefetching,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["items", "video", query], // Use passed query
        queryFn: ({ pageParam }) => {
            const params = {
                page: pageParam || 1,
                size: 20,
                keyword: query, // Use passed query
                returnFields: 'coverUrl,status,commodity.name'
            };
            return listItems(params);
        },
        getNextPageParam: (lastPage) => {
            const { size, total, page } = lastPage?.data?.data;
            return size * page < total ? lastPage?.data?.data?.page + 1 : undefined;
        },
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });

    const flatData = useMemo(() => {
        return data?.pages?.flatMap((page) => page?.data?.data?.list || []) || [];
    }, [data]);

    const { leftData, rightData } = useMemo(() => {
        const left: any[] = [];

        const right: any[] = [];
        flatData.forEach((item, index) => {
            if (index % 2 === 0) left.push(item);
            else right.push(item);
        });
        return { leftData: left, rightData: right };
    }, [flatData]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100;
        if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
        ) {
            if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
            }
        }
    };

    const renderSkeletonItem = (index: number) => {
        return (
            <View
                key={`skeleton-${index}`}
                style={{
                    width: columnWidth,
                    marginBottom: 15,
                }}
                className="bg-background rounded-lg overflow-hidden"
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

    const renderItem = (item: any, index: number) => {
        return (
            <TouchableOpacity
                key={`${item._id}-${index}`}
                activeOpacity={0.8}
                onPress={() => router.push(`/template/${item._id}`)}
                style={{
                    width: columnWidth,
                    marginBottom: itemMargin,
                }}
                className="bg-background rounded-lg overflow-hidden"
            >
                <Image
                    source={{ uri: item.highlightFrames?.[0]?.url || item.coverUrl }}
                    style={{ width: '100%', aspectRatio: 9 / 12 }}
                    className="bg-card"
                    resizeMode="cover"
                />
                {/* <Text
                    className="text-sm text-white leading-6 py-2 px-2"
                    numberOfLines={2}
                >
                    {item?.description || item?.commodity?.name}
                </Text> */}
                <View className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5 backdrop-blur-sm">
                    <Ionicons name="play" size={12} color="white" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1">

            {/* Content */}
            {isLoading && !data ? (
                <View style={{ padding: containerPadding }}>
                    <View className="flex-row flex-wrap justify-between">
                        {Array.from({ length: 6 }).map((_, index) =>
                            renderSkeletonItem(index)
                        )}
                    </View>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: containerPadding,
                        paddingTop: 10,
                    }}
                    refreshControl={
                        <CustomRefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => void refetch()}
                        />
                    }
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-row justify-between">
                        <View style={{ width: columnWidth }}>
                            {leftData.map((item, index) => renderItem(item, index))}
                        </View>
                        <View style={{ width: columnWidth }}>
                            {rightData.map((item, index) => renderItem(item, index))}
                        </View>
                    </View>

                    {isFetchingNextPage && (
                        <View className="py-4 items-center">
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    )}

                    {!hasNextPage && flatData.length > 0 && (
                        <View className="py-6 items-center">
                            <Text className="text-white/30 text-xs">Be The First To Be Best.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
