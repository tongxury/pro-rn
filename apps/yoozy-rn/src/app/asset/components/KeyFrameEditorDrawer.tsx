import { updateWorkflowJob } from "@/api/workflow";
import Modal from "@/components/ui/Modal";
import useTailwindVars from "@/hooks/useTailwindVars";
import { performSingleUpload } from "@/utils/upload";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-notifications";

interface Frame {
    url?: string;
    desc?: string;
    status?: 'waiting' | 'running' | 'done';
    prompt?: string;
    refs?: string[];
}

interface KeyFrameEditorDrawerProps {
    job: any;
    visible: boolean;
    onClose: () => void;
    frame: Frame | null;
    index: number | null;
    asset: any;
    onRefresh: () => void;
}

const KeyFrameEditorDrawer: React.FC<KeyFrameEditorDrawerProps> = ({
    job,
    visible,
    onClose,
    frame,
    index,
    asset,
    onRefresh
}) => {
    const { colors } = useTailwindVars();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');
    const insets = useSafeAreaInsets();

    const availableImages = useMemo(() => {
        const imgs = new Set<string>();
        // From keyFrames
        job?.dataBus?.keyFrames?.frames?.forEach((f: any) => {
            if (f.url) imgs.add(f.url);
        });
        // From commodity medias
        asset?.commodity?.medias?.forEach((m: any) => {
            if (m.url) imgs.add(m.url);
        });
        return Array.from(imgs);
    }, [asset, job?.dataBus]);

    const formatSegment = (segment: any) => {
        if (!segment) return "";
        const parts = [];
        if (segment.style) parts.push(`【分镜标题：${segment.style}】`);
        if (segment.contentStyle) parts.push(`视觉风格：${segment.contentStyle}`);
        if (segment.sceneStyle) parts.push(`场景：${segment.sceneStyle}`);
        if (segment.description) parts.push(`画面描写：${segment.description}`);

        if (segment.typedTags) {
            const tagsParts = [];
            for (const [key, values] of Object.entries(segment.typedTags)) {
                if (Array.isArray(values) && values.length > 0) {
                    tagsParts.push(`${key}: ${values.join(", ")}`);
                }
            }
            if (tagsParts.length > 0) {
                parts.push(`标签：\n${tagsParts.join("\n")}`);
            }
        }

        if (index !== null) {
            if (index % 2 === 0) {
                parts.push(`依据以上分镜描述，生成一张视频首帧图片`);
            } else {
                parts.push(`依据以上分镜描述，生成一张视频尾帧图片`);
            }
        }

        return parts.join("\n\n");
    };

    const getInitialPrompt = () => {
        if (frame?.prompt || frame?.desc) return frame.prompt || frame.desc || "";
        if (index === null) return "";
        const segmentIndex = Math.floor(index / 2);
        const segment = job?.dataBus?.segmentScript?.segments?.[segmentIndex];
        return formatSegment(segment);
    };

    const [prompt, setPrompt] = useState("");
    const [refs, setRefs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (visible) {
            setPrompt(getInitialPrompt());
            setRefs(frame?.refs || []);
        }
    }, [visible, frame, index]);

    const isRunning = frame?.status?.toLowerCase() === 'running';

    const handlePickImage = async () => {
        if (isRunning || uploading) return;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const remainingSlots = 5 - refs.length;
                if (remainingSlots <= 0) {
                    Toast.show("最多只能选择 5 张图片");
                    return;
                }

                const newAssets = result.assets.slice(0, remainingSlots);
                setUploading(true);
                try {
                    const uploadPromises = newAssets.map(asset => performSingleUpload({
                        uri: asset.uri,
                        name: asset.fileName || `upload_${Date.now()}.jpg`,
                        type: asset.mimeType || 'image/jpeg'
                    }));
                    const uploadedUrls = await Promise.all(uploadPromises);
                    setRefs(prev => [...prev, ...uploadedUrls]);
                } catch (e) {
                    Toast.show("上传图片失败");
                } finally {
                    setUploading(false);
                }
            }
        } catch (error) {
            console.error(error);
            Toast.show("选择素材失败");
        }
    };

    const handleRegenerate = async () => {
        if (!asset || index === null || loading) return;

        setLoading(true);
        try {
            const currentFrames = job?.dataBus?.keyFrames?.frames || [];
            const newFrames = [...currentFrames];

            newFrames[index] = {
                ...newFrames[index],
                prompt: prompt,
                refs: refs,
                status: 'running',
            };

            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'keyFrames',
                data: {
                    keyFrames: {
                        ...job.dataBus.keyFrames,
                        frames: newFrames,
                    }
                },
            });
            Toast.show(`分镜 #${index + 1} 已加入生成队列`);
            onRefresh();
            onClose();
        } catch (e) {
            console.error(e);
            Toast.show('保存失败');
        } finally {
            setLoading(false);
        }
    };

    if (index === null) return null;

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            position="bottom"
            useScale={true}
            showIndicator={true}
            contentStyle={{
                height: SCREEN_HEIGHT * 0.75,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom,
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View className="flex-1 px-5 pt-2">
                    {/* Header - Fixed */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                            <Text className="text-base font-bold text-gray-800">分镜交互面板 #{index + 1}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center -mr-2"
                        >
                            <Feather name="x" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        <View className="gap-6">
                            {/* Prompt Section */}
                            <View>
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Feather name="info" size={12} color="#9CA3AF" />
                                    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">画面描述</Text>
                                </View>
                                <TextInput
                                    multiline
                                    value={prompt}
                                    onChangeText={setPrompt}
                                    editable={!isRunning}
                                    placeholder="输入画面描述词..."
                                    className={`bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs min-h-[60px] ${isRunning ? 'opacity-60' : ''}`}
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>

                            {/* Refs Section */}
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-2">
                                        <Feather name="image" size={12} color="#9CA3AF" />
                                        <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">参考素材</Text>
                                    </View>
                                    <View className="flex-row items-center gap-3">
                                        <Text className="text-[10px] font-bold text-gray-400">{refs.length}/5</Text>
                                        {refs.length > 0 && !isRunning && (
                                            <TouchableOpacity onPress={() => setRefs([])}>
                                                <Text className="text-[10px] font-bold text-primary">清除全部</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* Refs Selection Area */}
                                <View className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 ${isRunning ? 'opacity-60' : ''}`}>
                                    <View className="flex-row flex-wrap gap-3">
                                        {refs.length < 5 && !isRunning && (
                                            <TouchableOpacity
                                                onPress={handlePickImage}
                                                className="w-16 h-16 rounded-xl border border-dashed border-gray-300 items-center justify-center bg-white"
                                            >
                                                {uploading ? (
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                ) : (
                                                    <Feather name="plus" size={20} color="#D1D5DB" />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                        {refs.map((url, i) => (
                                            <View key={i} className="w-16 h-16 rounded-xl overflow-hidden relative bg-white border border-gray-100">
                                                <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                                {!isRunning && (
                                                    <TouchableOpacity
                                                        onPress={() => setRefs(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-0 right-0 bg-black/40 p-1 rounded-bl-lg"
                                                    >
                                                        <Feather name="x" size={10} color="white" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Historical Library */}
                                <View className="mt-4">
                                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">从历史库选择</Text>
                                    {availableImages.length > 0 ? (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 px-1">
                                            {availableImages.map((url, i) => {
                                                const isSelected = refs.includes(url);
                                                return (
                                                    <TouchableOpacity
                                                        key={url + i}
                                                        onPress={() => {
                                                            if (isRunning) return;
                                                            if (isSelected) {
                                                                setRefs(prev => prev.filter(item => item !== url));
                                                            } else if (refs.length < 5) {
                                                                setRefs(prev => [...prev, url]);
                                                            } else {
                                                                Toast.show('参考图数量已达上限 (5张)');
                                                            }
                                                        }}
                                                        className={`w-20 aspect-[9/16] rounded-xl border-2 overflow-hidden mr-2 relative bg-white ${isSelected ? 'border-primary' : 'border-gray-100'}`}
                                                    >
                                                        <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                                        {isSelected && (
                                                            <View className="absolute inset-0 bg-primary/10 items-center justify-center">
                                                                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-white shadow-sm">
                                                                    <Feather name="check" size={12} color="white" />
                                                                </View>
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    ) : (
                                        <View className="py-8 border-2 border-dashed border-gray-100 rounded-2xl items-center justify-center bg-gray-50/30">
                                            <Feather name="image" size={24} color="#E5E7EB" />
                                            <Text className="text-[10px] text-gray-400 mt-2">暂无历史素材</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Button - Sticky at bottom */}
                    <View className="py-4">
                        <TouchableOpacity
                            disabled={isRunning || loading}
                            onPress={handleRegenerate}
                            className={`h-12 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm ${isRunning ? 'bg-gray-100' : 'bg-primary'}`}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Feather name="refresh-cw" size={16} color={isRunning ? "#9CA3AF" : "white"} />
                            )}
                            <Text className={`font-bold ${isRunning ? 'text-gray-400' : 'text-white'}`}>
                                {isRunning ? '生成中...' : frame?.url ? '重新生成分镜' : '开始生成分镜'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default KeyFrameEditorDrawer;
