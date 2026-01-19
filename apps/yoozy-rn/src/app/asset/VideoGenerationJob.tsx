import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import VideoGenerationEditorDrawer from "./components/VideoGenerationEditorDrawer";

interface JobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const VideoGenerationJob = ({ index: jobIndex, job, asset, refetch }: JobProps) => {
    const { colors } = useTailwindVars();
    const data = job?.dataBus?.videoGenerations || [];
    const item = data?.[0]; 
    
    const [isEditing, setIsEditing] = useState(false);
    const editable = job.status === 'confirming';
    
    const status = item?.status?.toLowerCase() || job.status?.toLowerCase();
    const isFailed = status === 'failed';
    const isCompleted = !!item?.url;
    const isRunning = !isCompleted && !isFailed;

    const handlePreview = () => {
        if (item?.url && isCompleted) {
            router.push(`/video?url=${encodeURIComponent(item.url)}`);
        }
    };

    const renderError = () => (
        <View className="flex-1 relative bg-red-50 rounded-[32px] overflow-hidden items-center justify-center px-8 border border-red-100">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
                <Feather name="alert-circle" size={40} color="#ef4444" />
            </View>
            <Text className="text-red-500 text-xl font-black mb-3 tracking-tight">生成失败</Text>
            <Text className="text-red-400 text-xs text-center leading-5 px-4 font-medium">
                {item?.error || "发生了一些错误，请尝试重新生成"}
            </Text>
            <TouchableOpacity 
                onPress={refetch}
                className="mt-8 px-6 py-3 bg-red-500 rounded-full"
            >
                <Text className="text-white font-bold">重试</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLoading = (title: string, subtitle: string) => (
        <View className="flex-1 relative bg-primary/20 rounded-[32px] overflow-hidden items-center justify-center px-8">
            {/* Background Blur Preview */}
            {(item?.lastFrame || item?.coverUrl) && (
                <Image
                    source={{ uri: item.lastFrame || item.coverUrl }}
                    className="absolute inset-0 w-full h-full opacity-30"
                    blurRadius={10}
                />
            )}
            
            <View className="items-center">
                <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
                
                <Text className="text-primary text-xl font-black mb-3 tracking-tight">{title}</Text>
                
                <View className="bg-white/10 px-4 py-2 rounded-2xl mb-6 border border-white/5">
                    <Text className="text-gray-400 text-sm font-bold">预计还需 5 分钟</Text>
                </View>

                <Text className="text-gray-400 text-xs text-center leading-5 px-4 font-medium">
                    {subtitle}
                </Text>

                <View className="absolute -bottom-24 w-full">
                    <View className="flex-row justify-center gap-1">
                        {[1, 2, 3].map(i => (
                            <View key={i} className="w-1 h-1 bg-primary/40 rounded-full" />
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 p-5">
            <View className="flex-1">
                {isRunning ? (
                    renderLoading(
                         "视频生成中",
                        "智能 AI 正在进行像素级渲染，请耐心等待"
                    )
                ) : isFailed ? (
                    renderError()
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePreview}
                        className="flex-1 relative bg-gray-100 rounded-[32px] overflow-hidden border border-gray-100 shadow-2xl"
                    >
                        <View className="w-full h-full bg-gray-200">
                            {(item?.coverUrl || item?.lastFrame) ? (
                                <Image
                                    source={{ uri: item.coverUrl || item.lastFrame }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-primary/5">
                                    <Feather name="video" size={48} color={colors.primary} style={{ opacity: 0.2 }} />
                                </View>
                            )}
                            
                            <View className="absolute inset-0 items-center justify-center bg-black/10">
                                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center backdrop-blur-md border border-white/30">
                                    <Feather name="play" size={32} color="white" style={{ marginLeft: 4 }} />
                                </View>
                            </View>

                            {editable && (
                                <TouchableOpacity 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    className="absolute bottom-6 right-6 w-12 h-12 bg-primary rounded-full items-center justify-center shadow-xl shadow-primary/40 border-4 border-white"
                                >
                                    <Feather name="edit-2" size={20} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {item && (
                <VideoGenerationEditorDrawer
                    job={job}
                    visible={isEditing}
                    onClose={() => setIsEditing(false)}
                    video={item}
                    index={0}
                    asset={asset}
                    onRefresh={refetch}
                />
            )}
        </View>
    );
};

export default React.memo(VideoGenerationJob);
