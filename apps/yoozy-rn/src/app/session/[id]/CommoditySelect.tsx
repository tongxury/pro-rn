import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const CommoditySelect = ({ session }: { session: any; }) => {
    return (
        <View className="gap-6">
            {/* Status Banner */}
            <View className="bg-primary/15 rounded-xl flex-row items-center gap-5 p-4">
                <View className="w-11 h-11 rounded-xl bg-[#fff] items-center justify-center">
                    <MaterialCommunityIcons name="cube-scan" size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-[15px] text-primary">选择推广商品</Text>
                </View>
            </View>

            {/* Product Info Card */}
            <View className="gap-5">
                <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                        <Text className="text-xs text-muted-foreground mb-1.5 font-medium">商品标题</Text>
                        <Text className="text-base font-semibold text-foreground leading-6">
                            {session?.commodity?.title || '正在读取商品信息...'}
                        </Text>
                    </View>
                </View>

                {session?.commodity?.images?.length > 0 && (
                    <View>
                        <Text className="text-xs text-muted-foreground mb-2 font-medium">商品素材</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {session.commodity.images.map((img: string, i: number) => (
                                <Image key={i} source={{ uri: img }} className="w-[72px] h-[72px] rounded-xl mr-2.5 bg-gray-100" resizeMode="cover" />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Target Chance - 目标受众 */}
                {session?.targetChance?.targetAudience && (
                    <View>
                        <Text className="text-xs text-muted-foreground mb-2 font-medium">目标受众</Text>
                        <View className="bg-card rounded-xl p-3.5">
                            <Text className="text-sm font-medium text-foreground leading-5 mb-2.5">
                                {session.targetChance.targetAudience.description}
                            </Text>
                            <View className="flex-row flex-wrap gap-1.5">
                                {session.targetChance.targetAudience.tags?.map((tag: string, i: number) => (
                                    <View key={i} className="bg-primary/15 px-2.5 py-1 rounded-md">
                                        <Text className="text-[11px] font-medium text-primary">{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Target Chance - 推广卖点 */}
                {session?.targetChance?.sellingPoints?.length > 0 && (
                    <View>
                        <Text className="text-xs text-muted-foreground mb-2 font-medium">推广卖点</Text>
                        <View className="gap-2.5">
                            {session.targetChance.sellingPoints.map((point: { description: string; tags: string[] }, i: number) => (
                                <View key={i} className="bg-card rounded-xl p-3.5">
                                    <Text className="text-sm font-medium text-foreground leading-5 mb-2.5">
                                        {point.description}
                                    </Text>
                                    <View className="flex-row flex-wrap gap-1.5">
                                        {point.tags?.map((tag: string, j: number) => (
                                            <View key={j} className="bg-primary/15 px-2.5 py-1 rounded-md">
                                                <Text className="text-[11px] font-medium text-primary">{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default CommoditySelect;
