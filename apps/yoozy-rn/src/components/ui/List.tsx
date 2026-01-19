import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    FlatList,
    Dimensions,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import {useMemo, useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";
import {listResourceSegments} from "@/api/resource"; // or "react-query" depending on your version

export default function List() {
    const {
        data,
        isLoading,
        isRefetching,
        isInitialLoading,
        isFetchingNextPage,
        hasNextPage,
        refetch,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ["items", "veogo"],
        queryFn: ({pageParam}) =>
            listResourceSegments({pageParam}),
        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore
                ? lastPage?.data?.data?.page + 1
                : undefined,
        staleTime: 1000,
        enabled: false,
        refetchOnWindowFocus: false,
    });

    // Flatten all pages into a single array
    const currentData = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap(page => page?.data?.data?.list || []);
    }, [data]);

    // 下拉刷新处理函数
    const onRefresh = () => {
        refetch();
    };

    // 上拉加载更多处理函数
    const loadMore = () => {
        if (isFetchingNextPage || !hasNextPage) return;
        fetchNextPage();
    };

    // 滚动事件处理
    const handleScroll = (event: any) => {
        const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
        // 计算是否滚动到底部（距离底部小于50像素时触发）
        const paddingToBottom = 50;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

        if (isCloseToBottom && hasNextPage && !isFetchingNextPage && !isRefetching) {
            loadMore();
        }
    };

    const screenWidth = Dimensions.get('window').width;
    const numColumns = 2;
    const columnWidth = (screenWidth - 30) / numColumns;

    // 使用 currentData
    const columns = useMemo(() => {
        const cols = Array(numColumns).fill(null).map(() => ({items: [], height: 0}));
        currentData.forEach((item, index) => {
            const textLength = item.description?.length || 0;
            const estimatedHeight = 100 + Math.min(textLength * 2, 200);
            const shortestColumn = cols.reduce((min, col, i) =>
                col.height < cols[min].height ? i : min, 0
            );
            // @ts-ignore
            cols[shortestColumn].items.push(item);
            cols[shortestColumn].height += estimatedHeight;
        });
        return cols;
    }, [currentData, numColumns]);

    const renderItem = (item: any,) => {
        const textLength = item.description?.length || 0;
        const estimatedHeight = 100 + Math.min(textLength * 2, 200);

        return (
            <TouchableOpacity
                key={item.id}
                className={'bg-red-400 '}
                style={{
                    width: columnWidth,
                    marginBottom: 10,
                    borderRadius: 8,
                    padding: 10,
                    minHeight: estimatedHeight,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
                onPress={() => Alert.alert('Item', `点击了项目 ${item.id}`)}
            >
                <View style={{marginBottom: 8}}>
                    <Text className={'text-white leading-snug'}>{item.description}</Text>
                </View>
                <Text style={{fontSize: 14, color: '#333', lineHeight: 20}}>
                    {item.image}
                </Text>
            </TouchableOpacity>
        );
    };

    // Show loading indicator on initial load
    if (isInitialLoading || isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red'}}>
                <ActivityIndicator size="large"/>
                <Text style={{marginTop: 10, color: '#666', fontSize: 14}}>加载中...</Text>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{paddingHorizontal: 10, paddingTop: 10, paddingBottom: 20}}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        // colors={['#ff0000']}
                        // tintColor="#ff0000"
                    />
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    {columns.map((column, columnIndex) => (
                        <View
                            key={columnIndex}
                            style={{width: columnWidth}}
                        >
                            {column.items.map((item, itemIndex) =>
                                renderItem(item)
                            )}
                        </View>
                    ))}
                </View>
                {/* 加载更多指示器 */}
                {isFetchingNextPage && (
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                        width: '100%'
                    }}>
                        <ActivityIndicator size="small"/>
                        <Text style={{marginLeft: 10, color: '#666', fontSize: 14}}>
                            加载中...
                        </Text>
                    </View>
                )}
                {/* 没有更多数据提示 */}
                {!hasNextPage && currentData.length > 0 && (
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                        width: '100%'
                    }}>
                        <Text style={{color: '#999', fontSize: 14}}>
                            没有更多数据了
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
