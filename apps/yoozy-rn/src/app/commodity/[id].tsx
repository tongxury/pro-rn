import { getCommodity } from "@/api/commodity";
import ScreenContainer from "@/components/ScreenContainer";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState, } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CommodityDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTailwindVars();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showAllImages, setShowAllImages] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["commodity", id],
        queryFn: () => getCommodity(id!),
        enabled: !!id,
    });

    const commodity = data?.data?.data;

    const images = useMemo(() => {
        return commodity?.images || commodity?.medias?.map((m: any) => m.url) || [];
    }, [commodity]);

    const displayedImages = useMemo(() => {
        if (showAllImages) {
            return images;
        }
        return images.slice(0, 5);
    }, [images, showAllImages]);

    const hasMoreImages = !showAllImages && images.length > 5;

    if (isLoading) {
        return (
            <ScreenContainer className="flex-1 bg-background" edges={['bottom']}>
                <SkeletonLoader width={screenWidth} height={screenHeight * 0.55} />
                <View className="flex-1 -mt-8 bg-background rounded-t-3xl p-6 gap-6">
                    <View className="gap-2">
                        <SkeletonLoader width="30%" height={14} />
                        <SkeletonLoader width="80%" height={28} />
                    </View>
                    <SkeletonLoader width="100%" height={100} />
                    <SkeletonLoader width="100%" height={150} />
                </View>
            </ScreenContainer>
        );
    }
    const carouselHeight = screenHeight * 0.55;

    return (
        <ScreenContainer className="flex-1 bg-background" edges={[]}>
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/20"
                style={{ top: insets.top + 10 }}
            >
                <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Immersive Horizontal Image List */}
                <View style={{ height: carouselHeight, width: screenWidth }} className="relative bg-muted">
                    <View className="absolute z-10 top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" pointerEvents="none" />

                    {images.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            className="flex-1"
                        >
                            {displayedImages.map((img: string, index: number) => (
                                <View key={index} style={{ width: screenWidth, height: carouselHeight }}>
                                    <Image
                                        source={{ uri: img }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}

                            {/* Load All Button as last item if has more */}
                            {hasMoreImages && (
                                <View style={{ width: screenWidth, height: carouselHeight }} className="items-center justify-center bg-black/90">
                                    <Image
                                        source={{ uri: images[4] }}
                                        className="absolute w-full h-full opacity-30"
                                        blurRadius={10}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowAllImages(true)}
                                        className="bg-white px-8 py-4 rounded-full flex-row items-center gap-2"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-black font-bold tracking-widest text-sm">
                                            查看全部 {images.length} 张图片
                                        </Text>
                                        <Feather name="arrow-right" size={16} color="black" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center bg-input">
                            <Feather name="image" size={48} color={colors['muted-foreground']} />
                        </View>
                    )}
                </View>

                {/* Content Container */}
                <View className="flex-1 -mt-8 bg-background rounded-t-[32px] overflow-hidden shadow-2xl shadow-black/5">
                    <View className="px-6 pt-8 pb-10 gap-6">

                        {/* Header Section */}
                        <View className="gap-3">
                            {/* Brand & Tags Row */}
                            <View className="flex-row items-center justify-between">
                                {!!commodity.brand && (
                                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                                        <Text className="text-primary text-[10px] font-bold tracking-wider uppercase">
                                            {commodity.brand}
                                        </Text>
                                    </View>
                                )}
                                {commodity.tags && commodity.tags.length > 0 && (
                                    <View className="flex-row gap-2">
                                        {commodity.tags.slice(0, 2).map((tag: string, index: number) => (
                                            <Text key={index} className="text-muted-foreground text-xs opacity-60">#{tag}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Title */}
                            <Text className="text-foreground text-2xl font-bold leading-9 tracking-tight">
                                {commodity.title}
                            </Text>

                            {/* Subtitle */}
                            {!!commodity.name && (
                                <Text className="text-muted-foreground text-sm font-medium leading-relaxed">
                                    {commodity.name}
                                </Text>
                            )}
                        </View>

                        {/* Description */}
                        {!!commodity.description && (
                            <View className="py-2">
                                <Text
                                    className="text-foreground/90 text-[15px] leading-7 font-normal text-justify"
                                    numberOfLines={isDescriptionExpanded ? undefined : 3}
                                >
                                    {commodity.description}
                                </Text>
                                {(commodity.description.length > 80) && (
                                    <TouchableOpacity
                                        onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="mt-2 flex-row items-center self-start p-1 -ml-1"
                                    >
                                        <Text className="text-primary text-xs font-bold mr-0.5">
                                            {isDescriptionExpanded ? '收起' : '展开全部'}
                                        </Text>
                                        <Feather
                                            name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
                                            size={12}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Marketing Angles / Chances */}
                        {(commodity.chances && commodity.chances.length > 0) && (
                            <View className="gap-4 pt-2">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-1 h-4 bg-primary rounded-full" />
                                    <Text className="text-base font-bold text-foreground">营销切入点</Text>
                                    <Text className="text-xs text-muted-foreground ml-auto opacity-60">滑动查看更多</Text>
                                </View>

                                <View className="-mx-6">
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                                        className="pb-4"
                                    >
                                        {commodity.chances.map((chance: any, cIdx: number) => (
                                            <View
                                                key={cIdx}
                                                className="bg-card rounded-[24px] p-5 w-[280px] border border-border/60 shadow-sm shadow-black/5"
                                            >
                                                {/* Audience Header */}
                                                <View className="flex-row items-center justify-between mb-4">
                                                    <View className="flex-row items-center gap-3">
                                                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                                            <Feather name="users" size={18} color={colors.primary} />
                                                        </View>
                                                        <View>
                                                            <Text className="text-[10px] text-muted-foreground font-medium mb-0.5">目标受众</Text>
                                                            <Text className="text-foreground text-sm font-bold w-[180px]" numberOfLines={1}>{chance.targetAudience?.name || '通用受众'}</Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Selling Points */}
                                                {chance.sellingPoints?.length > 0 && (
                                                    <View className="gap-3 bg-muted/30 p-3 rounded-xl">
                                                        {chance.sellingPoints.map((point: any, pIdx: number) => (
                                                            <View key={pIdx} className="flex-row items-start gap-2.5">
                                                                <View className="bg-primary/40 w-1.5 h-1.5 rounded-full mt-1.5" />
                                                                <Text className="flex-1 text-foreground/80 text-xs leading-5">
                                                                    {point?.description || point}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>



        </ScreenContainer>
    );
}
