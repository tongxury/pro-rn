import React, {useCallback} from "react";
import {FlatList, Image, Text, TouchableOpacity, View,} from "react-native";
import {useInfiniteQuery} from "@tanstack/react-query";
import {listItems} from "@/api/api";
import {useTranslation} from "@/i18n/translation";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import {Grid} from "@/components/ui/Grid";
import useLinking from "@/hooks/useLinking";
import useTailwindVars from "@/hooks/useTailwindVars";
import {FontAwesome6, AntDesign, MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from "expo-router";

export default function VeogoList() {
    const {t} = useTranslation();

    const {colors} = useTailwindVars()

    const {
        data,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ["items", "veogo"],
        queryFn: ({pageParam}) =>
            listItems({pageParam, category: "veogo"}),
        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore
                ? lastPage?.data?.data?.page + 1
                : undefined,
        staleTime: 1000,
        enabled: false,
        refetchOnWindowFocus: false,
    });

    useFocusEffect(useCallback(() => {
        void refetch()
    }, []))


    const formatCount = (count: any) => {
        if (typeof count === "string") return count;
        if (count >= 10000) {
            return (count / 10000).toFixed(1) + t("tenThousand");
        }
        return count.toString();
    };

    const {openXhsVideo} = useLinking()

    const renderVideoCard = ({item, index}: { item: any, index: number }) => (
        <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => {
                void openXhsVideo(item._id)
                // void Linking.openURL(`xhsdiscover://item/${item._id}?type=video`);
            }}
            // className="rounded-lg bg-cardBg/70 overflow-hidden flex-1 transition active:opacity-90 active:scale-95 active:duration-100"
            className="rounded-lg overflow-hidden flex-1 bg-background1"
        >
            <View className="aspect-[3/4] relative">
                <Image
                    source={{uri: item.cover}}
                    className="rounded-lg w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80">
                    <FontAwesome6 name="play" size={40} color="white"/>
                </View>
                {
                    item.interactInfo?.likedCount &&
                    <View className="flex-row items-center gap-1 absolute bottom-2 right-2">
                        <AntDesign name="heart" size={16} color="white"/>
                        <Text className="text-[#fff] text-sm">
                            {formatCount(item.interactInfo?.likedCount)}
                        </Text>
                    </View>
                }
            </View>
            <View className="p-2">
                <Text
                    className="text-sm text-black font-semibold min-h-[40px]"
                    numberOfLines={2}
                    style={{lineHeight: 30}}
                >
                    {item.title}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            {/* 顶部背书横幅 */}
            <View className="flex-row items-center justify-center mb-2.5 bg-background1 mx-5 py-2 rounded-lg ">
                <MaterialIcons
                    name="verified"
                    color={colors.white}
                    size={20}
                />
                <Text className="text-white text-base font-bold ml-2">
                    {t("appEndorsedVideos")}
                </Text>
            </View>

            {/* 视频列表容器 */}
            <View className="flex-1 px-5">
                {/* 视频列表 */}
                {isLoading ? (
                    <Grid
                        columns={2}
                        data={Array(6).fill(null)}
                        spacing={10}
                        renderItem={() => (
                            <View className="rounded-lg bg-cardBg/70 overflow-hidden flex-1">
                                {/* 图片区域骨架 */}
                                <View className="aspect-[4/4] relative">
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
                        // columnWrapperStyle={{gap: 15,}}
                        keyExtractor={(_, index) => index.toString()}
                    />
                ) : (
                    <FlatList
                        columnWrapperClassName={'gap-5'}
                        ItemSeparatorComponent={() => <View className={'h-5'}/>}
                        numColumns={2}
                        data={
                            data?.pages?.map((page) => page?.data?.data?.list || []).flat() ||
                            []
                        }
                        renderItem={renderVideoCard}
                        keyExtractor={(item) => item?._id}
                    />
                )}
            </View>
        </View>
    );
}
