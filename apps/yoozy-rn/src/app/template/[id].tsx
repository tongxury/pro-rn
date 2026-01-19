import { getTemplate } from "@/api/resource";
import ImagePreview from "@/components/ImagePreview";
import ScreenContainer from "@/components/ScreenContainer";
import Modal from "@/components/ui/Modal";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Video from "react-native-video";

const { height } = Dimensions.get("window");

const Template = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paused, setPaused] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; desc?: string }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { colors } = useTailwindVars();

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplate({ id }),
    enabled: !!id,
  });


  const current = data?.data?.data;
  const coverUrl = current?.highlightFrames?.[0]?.url || current?.coverUrl;
  const videoUrl = current?.url;

  // Template specific fields
  const segments: Array<any> = current?.segments || [];
  const commodityTags = current?.commodity?.tags || [];

  const videoRef = useRef<any>(null);

  // Reuse Inspiration logic for progress if needed, but simple repeat is fine for now.

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer edges={[]}
      style={{ flex: 1, backgroundColor: 'black' }}
      barStyle="light-content">

      {/* Video Background */}
      {videoUrl ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPaused(!paused)}
          style={StyleSheet.absoluteFill}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat={true}
            paused={paused}
            poster={coverUrl}
            posterResizeMode="cover"
            progressUpdateInterval={50}
          />
          {paused && (
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <Image
          source={{ uri: coverUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-black/20"
        style={{ top: insets.top + 10 }}
      >
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Bottom Overlay & Action Bar */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 34, paddingTop: 120 }}
        pointerEvents="box-none"
      >
        <View className="px-4 gap-4">

          {/* Text Info (Title/Tags) */}
          <TouchableOpacity
            className="gap-2"
            activeOpacity={0.8}
            onPress={() => setDetailsVisible(true)}
          >
            {/* <Text className="font-bold text-lg text-white" numberOfLines={1}>
              {current?.commodity?.name || current?.description || '未命名项目'}
            </Text> */}

            {commodityTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {commodityTags.map((t: string, i: number) => (
                  <View key={i} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Text className="text-[white] text-xs font-medium">{t}</Text>
                  </View>
                ))}
              </View>
            )}
            {/* <View className="flex-row items-center gap-1 opacity-60">
              <Text className="text-xs text-white">查看详情</Text>
              <Ionicons name="chevron-forward" size={12} color="white" />
            </View> */}

          </TouchableOpacity>

          {/* <View className="flex-row items-stretch gap-3 mt-2">
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 48,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{Math.floor(Math.random() * 1000) + 100}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.9}
              onPress={() => {
             
              }}
            >
              <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>剪同款</Text>
            </TouchableOpacity>
          </View> */}

        </View>
      </LinearGradient>


      {/* Details Modal */}
      <Modal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        position="bottom"
        contentStyle={{ maxHeight: height * 0.8, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: colors.background }}
      >
        <View className="flex-1 bg-background overflow-hidden rounded-t-[32px]">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-foreground">模板详情</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)} className="w-8 h-8 items-center justify-center rounded-full bg-muted/50">
                <Ionicons name="close" size={20} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            <View className="gap-8">
              {/* Description */}
              {current?.description && (
                <View className="gap-3">
                  <Text className="text-sm font-semibold text-foreground">模板描述</Text>
                  <Text className="text-base leading-7 text-muted-foreground">
                    {current.description}
                  </Text>
                </View>
              )}

              {/* Script Segments */}
              {segments.length > 0 && (
                <View className="gap-4">
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-base font-bold text-foreground">分镜脚本</Text>
                    <Text className="text-xs text-muted-foreground">共 {segments.length} 个镜头</Text>
                  </View>

                  <View className="gap-4">
                    {segments.map((seg: any, i: number) => (
                      <View key={i} className="bg-muted/30 border border-border/50 p-4 rounded-2xl gap-4">
                        {/* Header: Time & Index */}
                        <View className="flex-row justify-between items-center">
                          <View className="bg-primary/10 px-2.5 py-1 rounded-lg">
                            <Text className="text-primary font-bold text-xs">镜头 {i + 1}</Text>
                          </View>
                          <View className="flex-row items-center gap-1 opacity-60">
                            <Ionicons name="time-outline" size={12} color={colors.foreground} />
                            <Text className="text-foreground text-xs font-medium tabular-nums">{seg.timeStart ? seg.timeStart.toFixed(1) : '0.0'}s - {seg.timeEnd.toFixed(1)}s</Text>
                          </View>
                        </View>

                        {/* Main Description */}
                        <View className="gap-1.5">
                          <Text className="text-sm leading-6 text-foreground font-medium">{seg.description}</Text>
                          {(seg.voiceover || seg.subtitle) && (
                            <View className="mt-2 bg-background/50 p-3 rounded-xl border border-border/30">
                              <Text className="text-muted-foreground text-xs mb-1 font-medium">口播/字幕</Text>
                              <Text className="text-foreground/90 text-sm font-medium italic">"{seg.voiceover || seg.subtitle}"</Text>
                            </View>
                          )}
                        </View>

                        {/* Styles Tags */}
                        <View className="flex-row flex-wrap gap-2">
                          {[
                            { label: '场景', value: seg.sceneStyle },
                            { label: '拍摄', value: seg.shootingStyle },
                            { label: '内容', value: seg.contentStyle }
                          ].filter(t => t.value).map((t, idx) => (
                            <View key={idx} className="flex-row items-center bg-background border border-border/40 px-2 py-1 rounded-md gap-1.5">
                              <Text className="text-muted-foreground text-[10px]">{t.label}</Text>
                              <View className="w-[1px] h-2 bg-border" />
                              <Text className="text-foreground text-xs">{t.value}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Highlight Frames */}
                        {seg.highlightFrames?.length > 0 && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1 -mx-1 px-1" contentContainerStyle={{ gap: 8 }}>
                            {seg.highlightFrames.map((frame: any, idx: number) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                  setPreviewImages(seg.highlightFrames);
                                  setPreviewIndex(idx);
                                }}
                                activeOpacity={0.9}
                              >
                                <Image
                                  source={{ uri: frame.url }}
                                  className="w-28 h-[74px] rounded-lg bg-muted border border-border/20"
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Commodity Info */}
              {!!current?.commodity?.name && (
                <View className="gap-3 pb-8">
                  <Text className="text-base font-bold text-foreground">关联商品</Text>
                  <View className="bg-card border border-border/50 rounded-2xl p-4 flex-row items-center gap-4 shadow-sm shadow-black/5">
                    {current.commodity.coverUrl && (
                      <Image source={{ uri: current.commodity.coverUrl }} className="w-12 h-12 rounded-lg bg-muted" />
                    )}
                    <View className="flex-1 gap-1">
                      <Text className="text-foreground text-base font-bold leading-tight" numberOfLines={1}>{current.commodity.name}</Text>
                      {current.commodity.brand && (
                        <Text className="text-muted-foreground text-xs">品牌: {current.commodity.brand}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors['muted-foreground']} />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Preview Helper */}
      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        visible={previewImages.length > 0}
        onClose={() => setPreviewImages([])}
        onIndexChange={(index) => setPreviewIndex(index)}
      />
    </ScreenContainer>
  );
};

export default Template;
