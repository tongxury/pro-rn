import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import PagerView from 'react-native-pager-view';
import VideoGenerationEditorDrawer from "./components/VideoGenerationEditorDrawer";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
    selectedItem?: any;
    onSelect?: (item: any) => void;
}

const VideoCard = React.memo(({
    item,
    index,
    editable,
    onPreview,
    onEdit,
}: {
    item: any;
    index: number;
    editable?: boolean;
    onPreview: (url: string) => void;
    onEdit: (index: number) => void;
}) => {
    const { colors } = useTailwindVars();
    const isRunning = item.status?.toLowerCase() === 'running';

    return (
        <View
            style={{ flex: 1 }}
            className="px-4"
            collapsable={false}
        >
            <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Text className="text-primary text-[10px] font-black">#{index + 1}</Text>
                        </View>
                        <Text className="font-bold text-gray-800 text-sm">视频生成</Text>
                    </View>
                </View>

                {/* Content */}
                <View className="p-4 flex-1">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => item.url && !isRunning ? onPreview(item.url) : null}
                        className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden border border-gray-100"
                    >
                        {item.url && !isRunning ? (
                            <View className="w-full h-full">
                                <Image
                                    source={{ uri: item.coverUrl || item.lastFrame }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                {/* Centered Play Icon - Video Indicator */}
                                <View className="absolute inset-0 items-center justify-center">
                                    <View className="w-12 h-12 rounded-full bg-black/40 items-center justify-center backdrop-blur-sm">
                                        <Feather name="play" size={24} color="white" style={{ marginLeft: 2 }} />
                                    </View>
                                </View>

                                {/* Floating Edit Button */}
                                {editable && (
                                    <TouchableOpacity 
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onEdit(index);
                                        }}
                                        className="absolute bottom-3 right-3 w-10 h-10 bg-primary rounded-full items-center justify-center shadow-md shadow-black/20"
                                    >
                                        <Feather name="edit-2" size={18} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-black/5">
                                {(item.lastFrame || item.coverUrl) && (
                                    <Image
                                        source={{ uri: item.lastFrame || item.coverUrl }}
                                        className="absolute inset-0 w-full h-full opacity-40"
                                        blurRadius={1}
                                    />
                                )}
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text className="text-[10px] text-gray-500 mt-2 font-bold tracking-widest uppercase">生成中</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

const VideoSegmentsGenerationJob = ({ index: jobIndex, job, asset, refetch, selectedItem, onSelect }: JobProps) => {
    const data = job?.dataBus?.videoGenerations || [];
    const editable = job.status === 'confirming';
    
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePreview = (url: string) => {
        router.push(`/video?url=${encodeURIComponent(url)}`);
    };

    const onPageSelected = (e: any) => {
        setActiveIndex(e.nativeEvent.position);
    };

    if (data.length === 0) return null;

    return (
        <View className="flex-1 py-4">
            <View className="flex-row items-center gap-2 mb-4 px-5">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">视频生成详情</Text>
                <Text className="text-[10px] text-gray-300 font-bold">({activeIndex + 1}/{data.length})</Text>
            </View>

            <PagerView
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={onPageSelected}
                pageMargin={0}
            >
                {data.map((item: any, index: number) => (
                    <VideoCard
                        key={index}
                        item={item}
                        index={index}
                        editable={editable}
                        onPreview={handlePreview}
                        onEdit={setSelectedIdx}
                    />
                ))}
            </PagerView>

            {/* Indicator Dots */}
            {data.length > 1 && (
                <View className="flex-row justify-center items-center mt-4 gap-1.5">
                    {data.map((_: any, idx: number) => (
                        <View 
                            key={idx}
                            className={`h-1.5 rounded-full ${idx === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                        />
                    ))}
                </View>
            )}

            <VideoGenerationEditorDrawer
                job={job}
                visible={selectedIdx !== null}
                onClose={() => setSelectedIdx(null)}
                video={selectedIdx !== null ? data[selectedIdx] : null}
                index={selectedIdx}
                asset={asset}
                onRefresh={refetch}
            />
        </View>
    );
};

export default React.memo(VideoSegmentsGenerationJob);
