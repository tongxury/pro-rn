import {FlatList, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useInfiniteQuery} from "@tanstack/react-query";
import {listCounselors} from "@/api/counselor";
import {parse} from "@/utils/tanstack";
import {MaterialIcons} from "@expo/vector-icons";
import useTailwindVars from "@/hooks/useTailwindVars";
import {router} from "expo-router";


const CounselorList = () => {

    const {colors} = useTailwindVars()


    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        isRefetching,
        isLoading,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['counselors'],
        queryFn: ({pageParam}) => listCounselors({page: pageParam || 1, category: ''}),
        getNextPageParam: (lastPage, pages) =>
            lastPage?.data?.data?.hasMore ? lastPage?.data?.data?.page + 1 : undefined,
        // staleTime: 5 * 60 * 1000,
        // refetchOnWindowFocus: false,
    })

    const renderExpertCard = ({item}: { item: any }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                className="p-4 gap-5"
                onPress={() => {
                    router.push({
                        pathname: '/counselor/[id]',
                        params: {id: item._id}
                    })
                }}
            >
                {/* 头像和基本信息 */}
                <View className="flex-row gap-4 items-center">

                    <Image
                        source={{uri: item.avatar}}
                        className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                        resizeMode="cover"
                    />

                    <View className="flex-1 gap-2">
                        <Text className="text-white text-lg font-bold">
                            {item.name}
                        </Text>
                        <Text className="text-grey2 text-sm leading-5" numberOfLines={2}>
                            {item.desc}
                        </Text>
                    </View>
                </View>

                {/* 专业话题 */}
                <View className="gap-3">
                    {item.topics.map((topic: any, index: number) => (
                        <View
                            key={index}
                            className=""
                        >
                            <Text className="text-grey1 text-sm font-medium">
                                <Text className={'text-grey2 font-bold'}>#</Text>   {topic.name}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* 技能标签 */}
                <View className="flex-row flex-wrap gap-2">
                    {item.tags.map((tag: any, index: number) => (
                        <View
                            key={index}
                            className="bg-background1 px-3 py-1.5 rounded-full border border-border1"
                        >
                            <Text className="text-grey2 text-xs font-medium">
                                {tag.name}
                            </Text>
                        </View>
                    ))}
                </View>

                <View>
                    <View className={'flex-row gap-2 items-center'}>
                        <MaterialIcons name="location-on" size={20} color={colors.grey3}/>
                        <Text className="text-grey3 text-sm font-medium">
                            {item?.location || '未知地点'}
                        </Text>
                        <Text className="text-grey3 text-sm font-medium">
                            帮助了<Text className={'text-white font-bold'}>{item?.state?.persons || 0}</Text>人
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <View className="flex-1 bg-background">
            <FlatList
                // data={data}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    fetchNextPage().then();
                }}
                onEndReachedThreshold={0.5}
                data={parse(data)}
                renderItem={renderExpertCard}
                // estimatedItemSize={200}
                ItemSeparatorComponent={() => {
                    return <View className={'h-[0.5px] mx-5 my-2.5 bg-divider'}/>
                }}
                // refreshControl={
                //     <RefreshControl
                //         refreshing={isRefetching}
                //         onRefresh={refetch}
                //     />
                // }
                // ListFooterComponent={
                //     isLoading ? (
                //         <ActivityIndicator style={styles.loader}/>
                //     ) : null
                // }
            />
        </View>
    )
}

export default CounselorList
