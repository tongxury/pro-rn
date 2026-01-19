import {FlatList, Text, TouchableOpacity, View} from "react-native";
import {useInfiniteQuery} from "@tanstack/react-query";
import {listSessions} from "@/api/api";
import React, {useCallback, useMemo} from "react";
import {router, useFocusEffect} from "expo-router";
import useDateFormatter from "@/hooks/useDateFormatter";
import {isMedia} from "@/utils/resource";
import {useSettings} from "@/hooks/useSettings";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import {useTranslation} from "@/i18n/translation";
import MediaTextGroupView from "@/components/Resource/MediaTextGroupView";
import {useColors} from "@/hooks/uesColors";
import AccountInfo from "@/components/account/AccountInfo";
import AccountInfoSimple from "@/components/account/AccountInfoSimple";

function SessionList({scene}: { scene?: string }) {
    // const {theme} = useTheme();

    const colors = useColors()
    const {formatToNow} = useDateFormatter();
    const {t} = useTranslation();
    const {settings: {scenes}} = useSettings();


    // 关键修改：将 scene 参数加入 queryKey，这样不同场景会有独立的缓存
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
        queryKey: ["sessions", scene], // 🔑 关键：scene 参数加入 queryKey
        queryFn: ({pageParam}) => listSessions({
            scene: scene,
            page: pageParam,
            size: 20
        }),
        refetchOnWindowFocus: false,
        // 优化配置
        // staleTime: 1000 * 60 * 5, // 5分钟内认为数据是新鲜的，避免频繁请求
        // gcTime: 1000 * 60 * 30,   // 缓存保留30分钟

        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore
                ? lastPage?.data?.data?.page + 1
                : undefined,
    });

    const sessions = useMemo(
        () => data?.pages.flatMap((page) => page?.data?.data?.list || []) || [],
        [data]
    );

    // useFocusEffect(useCallback(() => {
    //     void refetch()
    // }, []))

    const handleSessionPress = useCallback((session: any) => {
        router.navigate({
            pathname: "/session/[id]",
            params: {
                id: session._id,
            },
        });
    }, []);

    const renderItem = useCallback(({item}: { item: any }) => {
        const itemScene = scenes?.find((x) => x.value === item.scene);
        const medias = item.resources?.filter((x: any) => isMedia(x)) || [];
        const texts = item.resources?.filter((x: any) => x.category === "title") || [];
        const profiles = item.resources?.filter((x: any) => x.category === "personalProfile") || [];


        const renderMain = () => {

            switch (item.scene) {
                case "accountAnalysis":

                    const acc = profiles?.[0]?.content ? JSON.parse(profiles?.[0]?.content) : undefined

                    return acc ? <AccountInfoSimple account={acc}/> : <></>
                // return <Text className={'text-white'}>{JSON.stringify(profiles)}</Text>
                default:
                    return <MediaTextGroupView resources={item.resources}/>
            }
        }

        return (
            <TouchableOpacity
                className={"px-[15px]"}
                onPress={() => handleSessionPress(item)}
                activeOpacity={1}
            >
                <View className={'gap-5 py-5'}>

                    <View className={'flex-row justify-between items-center'}>
                        <View className={'flex-row gap-[2px] '}>
                            {itemScene?.getSceneIcon({
                                size: 15,
                                color: colors.grey2,
                            })}
                            <Text className="text-sm font-medium text-grey2">
                                {t(`scene.${itemScene?.value}`)}
                            </Text>
                        </View>
                        <View className="mb-[8px]">
                            <Text className="text-sm text-grey2">
                                {formatToNow(item.createdAt)}
                            </Text>
                        </View>
                    </View>

                    <View>
                        {renderMain()}
                    </View>

                </View>
            </TouchableOpacity>
        );
    }, [scenes]);

    return (
        <View className="flex-1 bg-background">
            {isLoading ? (
                <FlatList
                    data={Array(4).fill(null)}
                    renderItem={() => (
                        <View className="p-[15px] gap-2">
                            <SkeletonLoader width={150} height={20}/>
                            <SkeletonLoader width={150} height={200}/>
                            <SkeletonLoader width={150} height={20}/>
                        </View>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                />
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.3}
                    showsVerticalScrollIndicator={false}
                    // initialNumToRender={8}
                    // maxToRenderPerBatch={5}
                    // windowSize={10}
                    // removeClippedSubviews={true}
                    refreshing={isFetching && !isFetchingNextPage}
                    onRefresh={refetch}
                    ItemSeparatorComponent={() => (
                        <View className="bg-divider mx-5"/>
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center p-8">
                            <Text className="text-grey2 text-center text-lg mb-4">
                                {t('session.empty', '暂无会话记录')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="bg-primary px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-medium">
                                    {t('retry')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}


export default SessionList;
