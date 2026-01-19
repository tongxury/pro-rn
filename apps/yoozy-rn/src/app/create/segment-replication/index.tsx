import { createAssetV2 } from "@/api/asset";
import { getCommodity } from "@/api/commodity";
import { getTemplateSegment } from "@/api/resource";
import CommoditySelectorModal from "@/components/commodity/selector_modal";
import InspirationSelectorModal from "@/components/inspiration/selector_modal";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Animated, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "react-native-toast-notifications";

const SelectorCard = ({
    step,
    title,
    placeholder,
    item,
    onPress,
    onDetail,
    icon,
    required = false,
}: {
    step: string;
    title: string;
    placeholder: string;
    item?: any;
    onPress: () => void;
    onDetail?: () => void;
    icon: any;
    required?: boolean;
}) => {
    const { colors } = useTailwindVars();
    const imageUrl = item?.segments?.[0]?.startFrame || item?.highlightFrames?.[0]?.url || item?.root?.url || item?.coverUrl || item?.images?.[0] || item?.medias?.[0]?.url;

    const handlePress = () => {
        if (item && onDetail) {
            onDetail();
        } else {
            onPress();
        }
    };
    return (
        <View className="mb-8">
            {/* ... SelectorCard Content ... */}
            {/* Header with Step */}
            <View className="flex-row items-center justify-between mb-4 px-1">
                <View className="flex-row items-center gap-3">
                    <View className="w-7 h-7 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: item ? colors.primary : colors.muted }}>
                        <Text className="text-white text-xs font-bold">{step}</Text>
                    </View>
                    <Text className="text-lg font-bold" style={{ color: colors.foreground }}>{title}</Text>
                </View>
                {item && (
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.7}
                        className="bg-muted/30 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-xs font-bold" style={{ color: colors.primary }}>更换</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                className={`w-full rounded-2xl overflow-hidden relative transition-all duration-200`}
                style={{
                    height: item ? 120 : 140,
                    backgroundColor: item ? colors.card : 'transparent',
                    borderWidth: item ? 1 : 2,
                    borderColor: item ? colors.border : colors.border + '40',
                    borderStyle: item ? 'solid' : 'dashed',
                    shadowColor: item ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: item ? 2 : 0,
                }}
            >
                {item ? (
                    <View className="flex-1 flex-row">
                        {/* Image Section - More prominent */}
                        <View className="w-[30%] h-full relative">
                            {imageUrl ? (
                                <Image
                                    source={{ uri: imageUrl }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-muted">
                                    <Feather name="image" size={20} color={colors['muted-foreground']} />
                                </View>
                            )}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.2)']}
                                className="absolute inset-0"
                            />
                        </View>

                        {/* Info Section */}
                        <View className="flex-1 p-4 justify-center gap-2">
                            <View>
                                <Text
                                    numberOfLines={2}
                                    className="text-base font-bold leading-tight"
                                    style={{ color: colors.foreground }}
                                >
                                    {item.title || item.description || item.name || "未命名"}
                                </Text>
                            </View>

                            <View className="flex-row items-start justify-between mt-1">
                                {(item.brand || item.status) && (
                                    <Text className="text-xs font-medium opacity-60 flex-1" style={{ color: colors['muted-foreground'] }}>
                                        {item.brand || 'No Brand'}
                                    </Text>
                                )}

                                <View className="bg-primary/10 px-2 py-1 rounded-md self-start">
                                    <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>已选择</Text>
                                </View>
                            </View>
                        </View>

                        {/* Navigation Icon Overlay */}
                        <View className="absolute right-3 top-1/2 -mt-3 opacity-30">
                            <Feather name="chevron-right" size={24} color={colors['muted-foreground']} />
                        </View>
                    </View>
                ) : (
                    <View className="w-full h-full items-center justify-center gap-4 bg-muted/5">
                        <View
                            className="w-16 h-16 rounded-full items-center justify-center shadow-sm"
                            style={{ backgroundColor: colors.card }}
                        >
                            <Feather name={icon} size={28} color={colors.primary} />
                        </View>
                        <View className="items-center gap-1">
                            <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>{placeholder}</Text>
                            <Text className="text-xs text-muted-foreground opacity-60">点击选择内容</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const SegmentReplication = () => {
    const { colors } = useTailwindVars();
    const { commodityId, inspirationId } = useLocalSearchParams<{ commodityId: string; inspirationId: string }>();

    const [selectedCommodity, setSelectedCommodity] = useState<any>(null);
    const [selectedInspiration, setSelectedInspiration] = useState<any>(null);

    const [isCommoditySelectorVisible, setCommoditySelectorVisible] = useState(false);
    const [isInspirationSelectorVisible, setInspirationSelectorVisible] = useState(false);

    const [isCreating, setIsCreating] = useState(false);

    // New Footer Logic
    const [workflowName, setWorkflowName] = useState<'VideoReplication' | 'VideoReplication2'>('VideoReplication2');
    const footerAnim = React.useRef(new Animated.Value(0)).current;

    const canSubmit = !!selectedCommodity && !!selectedInspiration;

    React.useEffect(() => {
        Animated.spring(footerAnim, {
            toValue: canSubmit ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();
    }, [canSubmit]);

    // Fetch Commodity Details if ID is present
    useQuery({
        queryKey: ["commodity", commodityId],
        queryFn: async () => {
            if (!commodityId) return null;
            const res = await getCommodity(commodityId);
            if (res?.data?.data) {
                setSelectedCommodity(res.data.data);
            }
            return res?.data?.data;
        },
        enabled: !!commodityId && !selectedCommodity,
    });

    // Fetch Inspiration Details if ID is present
    useQuery({
        queryKey: ["inspiration-segment", inspirationId],
        queryFn: async () => {
            if (!inspirationId) return null;
            const res = await getTemplateSegment({ id: inspirationId });
            if (res?.data?.data) {
                setSelectedInspiration(res.data.data);
            }
            return res?.data?.data;
        },
        enabled: !!inspirationId && !selectedInspiration,
    });

    // Manual Fetch for selection
    const fetchCommodityDetail = async (id: string) => {
        const res = await getCommodity(id);
        if (res?.data?.data) setSelectedCommodity(res.data.data);
    };

    const fetchInspirationDetail = async (id: string) => {
        const res = await getTemplateSegment({ id });
        if (res?.data?.data) setSelectedInspiration(res.data.data);
    };


    const handleCreate = async () => {
        if (!selectedCommodity?._id || !selectedInspiration?._id) {
            Toast.show("请先选择商品和灵感");
            return;
        }

        setIsCreating(true);
        try {
            const payload: any = {
                commodityId: selectedCommodity._id,
                segmentId: selectedInspiration._id,
                workflowName: workflowName,
            };

            const session = await createAssetV2(payload);
            if (session?.data?.data?._id) {
                router.replace(`/asset/${session.data.data._id}`);
            } else {
                Toast.show("创建会话失败");
            }
        } catch (error) {
            console.error(error);
            Toast.show("创建会话失败，请重试");
        } finally {
            setIsCreating(false);
        }
    };

    // const canSubmit = selectedCommodity && selectedInspiration;

    return (
        <ScreenContainer
            stackScreenProps={{
                animation: "fade_from_bottom",
                animationDuration: 100,
            }} >
            {/* Header */}
            <ScreenHeader title="复刻灵感" />

            {/* Content */}
            <View className="flex-1 px-6 pt-6">
                <Text className="text-base opacity-70 mb-8 leading-6 tracking-wide" style={{ color: colors.foreground }}>
                    即刻生成您的专属视频。请选择一个<Text className="font-bold text-primary">灵感片段</Text>和即将在视频中展示的<Text className="font-bold text-primary">商品</Text>。
                </Text>

                <SelectorCard
                    step="01"
                    title="复刻灵感"
                    placeholder="选择灵感视频"
                    icon="film"
                    required
                    item={selectedInspiration}
                    onPress={() => setInspirationSelectorVisible(true)}
                    onDetail={() => {
                        if (selectedInspiration?._id) router.push(`/inspiration/${selectedInspiration._id}`);
                    }}
                />

                <SelectorCard
                    step="02"
                    title="目标商品"
                    placeholder="选择推广商品"
                    icon="shopping-bag"
                    required
                    item={selectedCommodity}
                    onPress={() => setCommoditySelectorVisible(true)}
                    onDetail={() => {
                        if (selectedCommodity?._id) router.push(`/commodity/${selectedCommodity._id}`);
                    }}
                />
            </View>

            {/* Floating Footer */}
            <Animated.View
                className="absolute bottom-12 self-center z-50"
                style={{
                    opacity: footerAnim,
                    transform: [{
                        translateY: footerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [40, 0]
                        })
                    }],
                }}
                pointerEvents={canSubmit ? 'auto' : 'none'}
            >
                <BlurView
                    intensity={80}
                    tint="light"
                    className="flex-row items-center gap-6 pl-2 pr-8 py-2 rounded-full border border-white/50 overflow-hidden"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 24,
                        elevation: 10
                    }}
                >
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={isCreating}
                        activeOpacity={0.8}
                        className="w-14 h-14 bg-gray-900 rounded-full items-center justify-center shadow-lg"
                        style={{ backgroundColor: '#111827' }}
                    >
                        {isCreating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Feather name="arrow-right" size={24} color="white" />
                        )}
                    </TouchableOpacity>

                        <View className="flex-row items-center gap-3 ">
                            <Text className="text-base font-bold text-gray-900 leading-none">开始生成</Text>
                            {/* <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === 'ios') {
                                        ActionSheetIOS.showActionSheetWithOptions(
                                            {
                                                options: ['取消', '标准版', '专业版'],
                                                cancelButtonIndex: 0,
                                            },
                                            (buttonIndex) => {
                                                if (buttonIndex === 1) setWorkflowName('VideoReplication');
                                                if (buttonIndex === 2) setWorkflowName('VideoReplication2');
                                            }
                                        );
                                    } else {
                                        // Simple toggle for Android for now
                                        setWorkflowName(prev => prev === 'VideoReplication' ? 'VideoReplication2' : 'VideoReplication');
                                    }
                                }}
                                activeOpacity={0.6}
                                className="bg-gray-100 rounded-lg px-2 py-1 flex-row items-center gap-1"
                            >
                                <Text className="text-xs font-bold text-gray-600">
                                    {workflowName === 'VideoReplication' ? '标准版' : '专业版'}
                                </Text>
                                <Feather name="chevron-down" size={10} color="#666" />
                            </TouchableOpacity> */}
                        </View>
                </BlurView>
            </Animated.View>

            {/* Spacer for scroll content */}
            <View className="h-32" />

            {/* Drawers */}
            <CommoditySelectorModal
                visible={isCommoditySelectorVisible}
                onClose={() => setCommoditySelectorVisible(false)}
                onSelect={(id: string) => fetchCommodityDetail(id)}
            />

            <InspirationSelectorModal
                visible={isInspirationSelectorVisible}
                onClose={() => setInspirationSelectorVisible(false)}
                onSelect={(id) => fetchInspirationDetail(id)}
            />

        </ScreenContainer>
    );
};

export default SegmentReplication;
