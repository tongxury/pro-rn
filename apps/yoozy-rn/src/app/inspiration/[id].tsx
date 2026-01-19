import { getTemplateSegment } from "@/api/resource";
import ImagePreview from "@/components/ImagePreview";
import ScreenContainer from "@/components/ScreenContainer";
import ExpandableText from "@/components/ui/ExpandableText";
import Modal from "@/components/ui/Modal";
import useTailwindVars from "@/hooks/useTailwindVars";
import { getCachedVideoUri } from "@/utils/videoCache";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VideoPlayer from "@/components/VideoPlayer";
import { ResizeMode } from "react-native-video";

const { width, height } = Dimensions.get("window");

const Inspiration = () => {
  const { id, videoUrl: initialVideoUrl, coverUrl: initialCoverUrl } = useLocalSearchParams<{ 
    id: string; 
    videoUrl?: string; 
    coverUrl?: string; 
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; desc?: string }>>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const { colors } = useTailwindVars();

  // Data Fetching
  const { data, isLoading: isQueryLoading } = useQuery({
    queryKey: ["inspiration", id],
    queryFn: () => getTemplateSegment({ id }),
    enabled: !!id,
  });

  const current = data?.data?.data;

  // Use passed params if available, otherwise use query data
  const videoUrl = useMemo(() => {
    return (initialVideoUrl ? decodeURIComponent(initialVideoUrl) : null) || current?.root?.url;
  }, [current, initialVideoUrl]);

  const coverUrl = useMemo(() => {
    return (initialCoverUrl ? decodeURIComponent(initialCoverUrl) : null) || 
    current?.highlightFrames?.[0]?.url ||
    current?.root?.coverUrl;
  }, [current, initialCoverUrl]);

  const startTime = useMemo(() => current?.timeStart || 0, [current]);
  const endTime = useMemo(() => current?.timeEnd, [current]);

  const onReadyForDisplay = () => {
    setVideoReady(true);
  };

  const tags: string[] =
    [
      ...(current?.typedTags?.text || []),
      ...(current?.typedTags?.picture || []),
      ...(current?.typedTags?.scene || []),
    ];

  const highlightFrames: Array<{ url: string; desc?: string }> =
    current?.highlightFrames || [];

  return (
    <ScreenContainer edges={[]}
      style={{ flex: 1, backgroundColor: 'black' }}
      barStyle="light-content">

      {/* Video Background */}
      {videoUrl ? (
        <View style={StyleSheet.absoluteFill}>
          <VideoPlayer
            videoUrl={videoUrl}
            timeStart={startTime}
            timeEnd={endTime}
            shouldLoop={true}
            autoPlay={true}
            resizeMode={ResizeMode.COVER}
            onReadyForDisplay={onReadyForDisplay}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Custom Cover Overlay - Prevents the "Flash" */}
          {!videoReady && coverUrl && (
            <Image
              source={{ uri: coverUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}
        </View>
      ) : (
        <View style={StyleSheet.absoluteFill} className="justify-center items-center bg-black">
          {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        </View>
      )}

      {/* Loading overlay for query (optional, can be removed for even smoother experience) */}
      {isQueryLoading && !current && (
        <View className="absolute top-1/2 left-1/2 -ml-4 -mt-4 z-20">
          <ActivityIndicator size="small" color="white" />
        </View>
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

          {/* Text Info */}
          <TouchableOpacity
            className="gap-2"
            activeOpacity={0.8}
            onPress={() => setDetailsVisible(true)}
          >
            {/* <Text className="font-bold text-lg" style={{ color: 'white' }}>@{current?.author?.name || '小云雀官方精选'}</Text> */}

            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {tags.map((t, i) => (
                  <View key={i} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md">
                    <Text className="text-[white] text-xs font-medium">{t}</Text>
                  </View>
                ))}
              </View>
            )}

          </TouchableOpacity>

          {/* Horizontal Action Bar */}
          <View className="flex-row items-stretch gap-3 mt-2">

            {/* Test It Button (Right - Expands) */}
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
                router.replace(`/create/segment-replication?inspirationId=${id}`);
              }}
            >
              <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>复刻同款</Text>
            </TouchableOpacity>
          </View>

        </View>
      </LinearGradient>


      {/* Details Modal */}
      <Modal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        position="bottom"
        contentStyle={{ maxHeight: height * 0.7, borderTopLeftRadius: 24, borderTopRightRadius: 24, }}
      >
        <ScrollView className="px-5 py-2 mb-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">作品详情</Text>
          </View>

          <View className="gap-6 pb-10">
            {/* Description Full */}
            <View className="gap-3">
              <Text className="text-white/60 text-sm font-medium">作品描述</Text>
              <Text className="text-white/90 text-base leading-6">
                {current?.description || '暂无描述'}
              </Text>
            </View>

            {/* Script Segments (New) */}
            {current?.segments && current.segments.length > 0 && (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">分镜脚本</Text>
                <View className="gap-3">
                  {current.segments.map((seg: any, i: number) => (
                    <View key={i} className="flex-row gap-3 bg-white/5 p-3 rounded-lg">
                      <View className="w-20 h-14 bg-white/10 rounded overflow-hidden flex-shrink-0">
                        {seg.startFrame && <Image source={{ uri: seg.startFrame }} className="w-full h-full" resizeMode="cover" />}
                      </View>
                      <View className="flex-1 gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-white/40 text-xs">镜头 {i + 1}</Text>
                          <Text className="text-white/40 text-xs">{seg.timeStart ? seg.timeStart.toFixed(1) : '0.0'}s - {seg.timeEnd.toFixed(1)}s</Text>
                        </View>
                        <Text className="text-white/90 text-sm leading-5">{seg.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Structured Tags (New - replacing simple tags if available) */}
            {current?.typedTags ? (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">标签信息</Text>
                <View className="gap-4">
                  {Object.entries(current.typedTags).map(([category, tags]) => (
                    <View key={category} className="gap-2">
                      <Text className="text-white/40 text-xs uppercase">{category}</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(tags as string[]).map((t, i) => (
                          <View key={`${category}-${i}`} className="px-2.5 py-1 rounded bg-white/10">
                            <Text className="text-white/80 text-xs">{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              (current?.tags?.length || 0) > 0 && (
                <View className="gap-3">
                  <Text className="text-white/60 text-sm font-medium">标签</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {(current?.tags || []).map((t: any, i: number) => (
                      <View
                        key={`${t}-${i}`}
                        className="px-3 py-1.5 rounded-full bg-white/10"
                      >
                        <Text className="text-sm text-white/90">{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )
            )}

            {/* Commodity Info */}
            {!!current?.root?.commodity?.name && (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">关联商品</Text>
                <View className="bg-white/5 rounded-xl p-4 flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden">
                    {current?.root?.commodity?.coverUrl && (
                      <Image source={{ uri: current.root.commodity.coverUrl }} className="w-full h-full" resizeMode="cover" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/90 text-base font-medium" numberOfLines={1}>{current?.root?.commodity?.name}</Text>
                    <Text className="text-white/50 text-xs mt-1">品牌: {current?.root?.commodity?.brand || '未知'}</Text>
                  </View>
                  <TouchableOpacity className="bg-primary/20 px-3 py-1.5 rounded-full">
                    <Text className="text-primary text-xs font-bold">去购买</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Shooting Style */}
            {!!current?.shootingStyle && (
              <View className="gap-3">
                <Text className="text-white/60 text-sm font-medium">拍摄说明</Text>
                <ExpandableText
                  content={current?.shootingStyle}
                  maxLength={150}
                  className="text-white/90 text-base leading-6"
                />
              </View>
            )}
          </View>
        </ScrollView>
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

export default Inspiration;
