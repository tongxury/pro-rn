import {useQuery} from '@tanstack/react-query';
import {router, Stack, useLocalSearchParams} from 'expo-router';
import React from 'react';
import {ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {getCounselor} from "@/api/counselor";
import useTailwindVars from "@/hooks/useTailwindVars";

export default function ExpertDetailScreen() {
    const {id} = useLocalSearchParams<any>();

    const {colors} = useTailwindVars()

    const {data, isLoading} = useQuery({
        queryKey: ['counselors', id],
        queryFn: () => getCounselor({id}),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const expert = data?.data?.data;

    if (isLoading) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary}/>
                <Text className="text-grey2 mt-4">加载中...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: expert?.name,
                    headerShown: true,
                }}
            />
            <View className="flex-1 bg-background">
                {/*<Text className={'text-white'}>{JSON.stringify(expert)}</Text>*/}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* 头部封面区域 */}
                    <View className="relative">
                        <Image
                            source={{uri: expert.cover}}
                            className="w-full h-60"
                            resizeMode="cover"
                        />
                        {/* 渐变遮罩 */}
                        {/*<View className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"/>*/}
                    </View>

                    {/* 专家信息卡片 */}
                    <View className="bg-background p-6 rounded-t-3xl">
                        {/* 头像和基本信息 */}
                        <View className="flex-row gap-4 items-start mb-6">
                            <Image
                                source={{uri: expert.avatar}}
                                className="w-20 h-20 rounded-full border-2 border-white shadow-lg"
                                resizeMode="cover"
                            />

                            <View className="flex-1 gap-2">
                                <Text className="text-white text-2xl font-bold">
                                    {expert.name}
                                </Text>
                                <Text className="text-grey2 text-base leading-6">
                                    {expert.desc}
                                </Text>

                                {/* 在线状态 */}
                                <View className="flex-row items-center gap-2 mt-2">
                                    <View className="w-3 h-3 bg-green-500 rounded-full"></View>
                                    <Text className="text-green-500 text-sm font-medium">在线</Text>
                                </View>
                            </View>
                        </View>

                        {/* 专业话题 */}
                        <View className="mb-6">
                            <Text className="text-grey1 text-xs font-semibold mb-3 uppercase tracking-wide">
                                专业话题
                            </Text>
                            <View className=" gap-2">
                                {expert?.topics?.map((topic: any, index: number) => (
                                    <View
                                        key={index}
                                        className=""
                                    >
                                        <Text className="text-grey1 text-sm font-medium">
                                            # {topic.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* 技能标签 */}
                        <View className="mb-6">
                            <Text className="text-grey1 text-xs font-semibold mb-3 uppercase tracking-wide">
                                技能标签
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {expert.tags?.map((tag: any, index: number) => (
                                    <View
                                        key={index}
                                        className="bg-background1 px-4 py-2 rounded-full border border-border1"
                                    >
                                        <Text className="text-grey2 text-sm font-medium">
                                            {tag.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* 位置和帮助信息 */}
                        <View className="bg-background1 rounded-2xl p-4 gap-4 border border-border1">
                            <View className="flex-row items-center gap-3">
                                <MaterialIcons name="location-on" size={20} color={colors.grey3}/>
                                <Text className="text-grey2 text-sm">位置</Text>
                                <Text className="text-white text-sm font-medium">
                                    {expert?.location || '未知地点'}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-3">
                                <MaterialIcons name="people" size={20} color={colors.primary}/>
                                <Text className="text-grey2 text-sm">帮助人数</Text>
                                <Text className="text-white text-sm font-bold">
                                    {expert?.state?.persons || 0}人
                                </Text>
                            </View>

                            {/*<View className="flex-row items-center gap-3">*/}
                            {/*    <MaterialIcons name="schedule" size={20} color={colors.grey3}/>*/}
                            {/*    <Text className="text-grey2 text-sm">加入时间</Text>*/}
                            {/*    <Text className="text-white text-sm font-medium">*/}
                            {/*        {new Date(expert.createdAt * 1000).toLocaleDateString()}*/}
                            {/*    </Text>*/}
                            {/*</View>*/}
                        </View>
                    </View>
                </ScrollView>
                <View className={'p-4'}>
                    <TouchableOpacity onPress={() => router.navigate('/contact')} activeOpacity={0.9} className="bg-primary py-4 rounded-2xl items-center">
                        <Text className="text-white text-lg font-bold">立即咨询(联系客服)</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}
