import { listItems } from "@/api/resource";
import useTailwindVars from "@/hooks/useTailwindVars";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

interface TemplateSelectProps {
    session: any;
    pendingTemplate?: any,
    onSelect: (item: any) => void;
}

const TemplateSelect = ({ session, pendingTemplate, onSelect }: TemplateSelectProps) => {
    const { colors } = useTailwindVars();
    // const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    // Check if template already selected
    const hasSelectedTemplate = !!session?.template;

    // Templates Data - search by keyword
    const { data: templateList } = useQuery({
        queryKey: ["items", "video", searchKeyword],
        queryFn: () => listItems({ page: 1, keyword: searchKeyword, size: 8 }),
        enabled: !hasSelectedTemplate,
    });

    const templates = useMemo(() => {
        return templateList?.data?.data?.list || [];
    }, [templateList]);


    // 搜索或选择适合您商品的视频模板
    return (
        <View className="gap-6">
            {/* Status Banner */}
            <View className="bg-primary/15 rounded-xl flex-row items-center gap-5 p-4">
                <View className="w-11 h-11 rounded-xl bg-[#fff] items-center justify-center">
                    <MaterialCommunityIcons name="cube-scan" size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-[15px] text-primary">选择合适的模板</Text>
                    {/* <Text className="font-bold text-[15px] text-primary">选择推广商品</Text> */}
                </View>
            </View>
            {hasSelectedTemplate ?
                <>
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 16,
                            padding: 12,
                            flexDirection: 'row',
                            gap: 12,
                            borderWidth: 2,
                            borderColor: colors.primary
                        }}
                    >
                        <View style={{ width: 80, height: 100, borderRadius: 10, backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                            <Image source={{ uri: session?.template?.coverUrl || session?.template?.highlightFrames?.[0]?.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        </View>
                        <View style={{ flex: 1, paddingVertical: 4, justifyContent: 'space-between' }}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontWeight: '700', fontSize: 15, color: colors.foreground }} numberOfLines={1}>{session?.template?.description || '热门模板'}</Text>
                                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                                </View>
                                <Text style={{ fontSize: 12, color: colors['muted-foreground'], lineHeight: 18 }} numberOfLines={2}>{session?.template?.commodity?.name || '适合带货、种草视频，转化率高。'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* <View className="flex-row gap-2">
                                    {(session?.template?.tags || ['爆款', '高转化']).slice(0, 2).map((tag: string, idx: number) => (
                                        <View key={idx} style={{ backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ fontSize: 10, color: colors['muted-foreground'] }}>{tag}</Text>
                                        </View>
                                    ))}
                                </View> */}
                                <TouchableOpacity
                                    onPress={() => router.push(`/template/${session.template._id}`)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text className="text-xs font-medium underline" style={{ color: colors.primary }}>查看详情</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </>
                :
                <>
                    <View style={{ backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <MaterialCommunityIcons name="magnify" size={20} color={colors['muted-foreground']} />
                        <TextInput
                            placeholder="搜索模板关键词..."
                            placeholderTextColor={colors['muted-foreground']}
                            value={searchKeyword}
                            onChangeText={setSearchKeyword}
                            style={{ flex: 1, fontSize: 14, color: colors.foreground, padding: 0 }}
                        />
                        {searchKeyword.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchKeyword("")}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={colors['muted-foreground']} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="gap-3">
                        {templates?.map((item: any, i: number) => (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: colors.card,
                                    borderRadius: 16,
                                    padding: 12,
                                    flexDirection: 'row',
                                    gap: 12,
                                    borderWidth: pendingTemplate?._id === item._id ? 2 : 0,
                                    borderColor: colors.primary
                                }}
                                onPress={() => onSelect(item)}
                            >
                                <View style={{ width: 80, height: 100, borderRadius: 10, backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                                    <Image source={{ uri: item.coverUrl || item.highlightFrames?.[0]?.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>
                                <View style={{ flex: 1, paddingVertical: 4, justifyContent: 'space-between' }}>
                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text style={{ fontWeight: '700', fontSize: 15, color: colors.foreground }} numberOfLines={1}>{item.description || '热门模板'}</Text>
                                            {pendingTemplate?._id === item._id && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
                                        </View>
                                        <Text style={{ fontSize: 12, color: colors['muted-foreground'], lineHeight: 18 }} numberOfLines={2}>{item.commodity?.name || '适合带货、种草视频，转化率高。'}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {/* <View className="flex-row gap-2">
                                            {(item.tags || ['爆款', '高转化']).slice(0, 2).map((tag: string, idx: number) => (
                                                <View key={idx} style={{ backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                    <Text style={{ fontSize: 10, color: colors['muted-foreground'] }}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View> */}
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                router.push(`/template/${item._id}`)
                                            }}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Text className="text-xs font-medium underline" style={{ color: colors.primary }}>查看详情</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            }
        </View>
    );
};

export default TemplateSelect;
