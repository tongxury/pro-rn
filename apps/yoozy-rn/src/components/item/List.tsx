import React from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import {FlatList, Image, Text, TouchableOpacity, View,} from "react-native";
import {useInfiniteQuery, useMutation} from "@tanstack/react-query";
import {listItems, quickSessions} from "@/api/api";
import {useTranslation} from "@/i18n/translation";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";

import useLinking from "@/hooks/useLinking";
import {router} from "expo-router";
import {MaterialIcons} from "@expo/vector-icons";


export default function ItemList({category}: { category?: string }) {
    const {t} = useTranslation();
    const { colors } = useTailwindVars();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
        refetch,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["items", category],
        queryFn: ({pageParam}) =>
            listItems({pageParam, category}),
        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore ? lastPage?.data?.data?.page + 1 : 1,
        staleTime: 1000,
        refetchOnWindowFocus: false,
    });

    const {mutate: createQuickSessions} = useMutation({
        mutationFn: quickSessions,
        onSuccess: (data) => {
            router.navigate({
                pathname: "/session/[id]",
                params: {
                    id: data.data.data._id,
                },
            });
        },
    });

    const formatCount = (count: any) => {
        if (typeof count === "string") return count;
        if (count >= 10000) {
            return (count / 10000).toFixed(1) + t("tenThousand");
        }
        return count.toString();
    };

    const {openXhsVideo} = useLinking()

    const renderVideoCard = ({item}: { item: any }) => {

        // console.log(item);

        // return <Text>xxx</Text>

        return <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => {
                // createQuickSessions({itemId: item._id});

                void openXhsVideo(item._id);
                // void Linking.openURL(`xhsdiscover://item/6862438800000000110025fb?type=video`);
                // void Linking.openURL(`xhsdiscover://user/5f1234567890abcdef123456`);
                // void Linking.openURL(`xhsdiscover://home/explore`);
                // void Linking.openURL(`xhsdiscover://post`);
            }}
            // className="rounded-lg bg-card/70 overflow-hidden flex-1 transition active:opacity-90 active:scale-95 active:duration-100"
            className="rounded-lg bg-muted overflow-hidden flex-1"
        >
            <View className="aspect-[3/3] relative">
                <Image
                    source={{uri: item.cover}}
                    className="rounded-t-lg w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80">
                    <MaterialIcons
                        name="play-circle-outline"
                        color="white"
                        size={36}
                    />
                </View>

            </View>
            <View className="p-2 gap-2">
                <Text
                    className="text-sm text-black font-semibold"
                    numberOfLines={1}
                >
                    {item.title}
                </Text>
                <View className="flex-row items-center gap-0.5">
                    <View className={'w-4 h-4 rounded-full bg-muted justify-center items-center'}>
                        <Text className={'text-xs'} style={{color: '#fff'}}>
                            {item.profile?.username?.[0] || 0}
                        </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
                        {item.profile?.username || ''}
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <MaterialIcons type="material" color={colors['muted-foreground']} size={12}/>
                        <Text className="text-muted-foreground text-xs">
                            {formatCount(item.interactInfo?.likedCount)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => createQuickSessions({itemId: item._id})}
                    className="flex-row justify-center h-[30px] items-center gap-1 rounded-full bg-foreground"
                >
                    <Text className="text-[#000] text-sm px-[8px] py-[3px] ">
                        {t(`item.viewReport`)}
                    </Text>
                </TouchableOpacity>
            </View>

        </TouchableOpacity>
    };

    return (
        <View className="flex-1 bg-background">
            {/* 视频列表 */}
            {isLoading ? (
                <FlatList
                    numColumns={2}
                    data={Array(6).fill(null)}
                    renderItem={() => (
                        <View className="rounded-lg bg-card/70 overflow-hidden flex-1">
                            {/* 图片区域骨架 */}
                            <View className="aspect-[3/3] relative">
                                <SkeletonLoader width="100%" height="100%"/>
                            </View>

                            {/* 标题和用户信息区域骨架 */}
                            <View className="p-2">
                                {/* 标题骨架 - 两行 */}
                                <View className="min-h-[40px] gap-2">
                                    <SkeletonLoader width="100%" height={16}/>
                                    <SkeletonLoader width="100%" height={16}/>
                                </View>

                                {/* 用户信息区域骨架 */}
                                <View className="flex-row items-center gap-2 mt-2">
                                    {/* 头像骨架 */}
                                    <SkeletonLoader width={24} height={24} circle/>
                                    {/* 用户名骨架 */}
                                    <SkeletonLoader width="60%" height={16}/>
                                    {/* 点赞图标位置骨架 */}
                                    <SkeletonLoader width={16} height={16}/>
                                </View>
                            </View>
                        </View>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                    ItemSeparatorComponent={() => <View className={'h-5'}/>}
                    showsVerticalScrollIndicator={false}
                    columnWrapperClassName={'gap-3.5'}
                    contentContainerClassName={'p-5'}
                />
            ) : (
                <FlatList
                    // data={getFilteredVideos()}
                    numColumns={2}
                    // onItemPress={handleVideoPress}
                    onEndReached={() => {
                        fetchNextPage().then();
                    }}
                    refreshing={isFetching}
                    onRefresh={() => {
                        refetch();
                    }}
                    onEndReachedThreshold={0.5}
                    data={
                        data?.pages?.map((page) => page?.data?.data?.list || []).flat() ||
                        []
                    }
                    renderItem={renderVideoCard}
                    keyExtractor={(item) => item._id}
                    ItemSeparatorComponent={() => <View className={'h-5'}/>}
                    showsVerticalScrollIndicator={false}
                    columnWrapperClassName={'gap-3.5'}
                    contentContainerClassName={'p-5'}
                />
            )}
        </View>
    );
}

