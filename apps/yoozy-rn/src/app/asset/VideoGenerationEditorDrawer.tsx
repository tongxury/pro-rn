import { updateWorkflowJob } from "@/api/workflow";
import Modal from "@/components/ui/Modal";
import { aspectRatioConfig } from "@/consts";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useCallback, useState, useRef } from "react";
import {
    ActivityIndicator,
    Dimensions,
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

interface VideoGeneration {
    url?: string;
    firstFrame?: string;
    lastFrame?: string;
    status?: string;
    prompt?: string;
    taskId?: string;
    duration?: number;
    aspectRatio?: string;
}

interface VideoGenerationEditorDrawerProps {
    job: any;
    visible: boolean;
    onClose: () => void;
    video: VideoGeneration | null;
    index: number | null;
    asset: any;
    onRefresh: () => void;
}

const VideoGenerationEditorDrawer: React.FC<VideoGenerationEditorDrawerProps> = ({
    job,
    visible,
    onClose,
    video,
    index,
    asset,
    onRefresh
}) => {
    const { colors } = useTailwindVars();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');
    const insets = useSafeAreaInsets();

    const [prompt, setPrompt] = useState("");
    const [duration, setDuration] = useState<number>(5);
    const [aspectRatio, setAspectRatio] = useState<string>("9:16");
    const [loading, setLoading] = useState(false);
    const [savingPrompt, setSavingPrompt] = useState(false);

    const originalConfigRef = useRef<string>("");

    useEffect(() => {
        if (visible && video) {
            const initialPrompt = video?.prompt || "";
            const initialDuration = video?.duration || 5;
            const initialAspectRatio = video?.aspectRatio || asset?.workflow?.dataBus?.aspectRatio || "9:16";
            
            setPrompt(initialPrompt);
            setDuration(initialDuration);
            setAspectRatio(initialAspectRatio);
            
            originalConfigRef.current = JSON.stringify({ 
                prompt: initialPrompt, 
                duration: initialDuration, 
                aspectRatio: initialAspectRatio 
            });
        }
    }, [visible, video, asset?.workflow?.dataBus?.aspectRatio]);

    const handleSaveConfig = useCallback(async (updates: { prompt?: string, duration?: number, aspectRatio?: string }) => {
        if (!asset || index === null || savingPrompt) return;
        
        setSavingPrompt(true);
        try {
            const currentGenerations = job?.dataBus?.videoGenerations || [];
            const newGenerations = JSON.parse(JSON.stringify(currentGenerations));
            
            if (newGenerations[index]) {
                if (updates.prompt !== undefined) newGenerations[index].prompt = updates.prompt;
                if (updates.duration !== undefined) newGenerations[index].duration = updates.duration;
                if (updates.aspectRatio !== undefined) newGenerations[index].aspectRatio = updates.aspectRatio;
            }

            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'videoGenerations',
                data: {
                    videoGenerations: newGenerations
                },
            });
            originalConfigRef.current = JSON.stringify({ 
                prompt: updates.prompt ?? prompt, 
                duration: updates.duration ?? duration, 
                aspectRatio: updates.aspectRatio ?? aspectRatio 
            });
        } catch (e) {
            console.error('Failed to auto-save config:', e);
        } finally {
            setSavingPrompt(false);
        }
    }, [asset, index, job.index, job.dataBus, savingPrompt, prompt, duration, aspectRatio]);

    // Debounced auto-save
    useEffect(() => {
        if (!visible || !video || loading) return;
        
        const currentConfig = JSON.stringify({ prompt, duration, aspectRatio });
        if (currentConfig === originalConfigRef.current) return;

        const timer = setTimeout(() => {
            handleSaveConfig({ prompt, duration, aspectRatio });
        }, 1500);

        return () => clearTimeout(timer);
    }, [prompt, duration, aspectRatio, visible, video, loading, handleSaveConfig]);

    const isRunning = video?.status?.toLowerCase() === 'running';

    const handleRegenerate = async () => {
        if (!asset || index === null || loading) return;

        setLoading(true);
        try {
            const currentGenerations = job?.dataBus?.videoGenerations || [];
            const newGenerations = [...currentGenerations];

            newGenerations[index] = {
                ...newGenerations[index],
                prompt: prompt,
                duration: duration,
                aspectRatio: aspectRatio,
                status: 'running',
                taskId: '',
                url: '',
            };

            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'videoGenerations',
                data: {
                    videoGenerations: newGenerations
                },
            });
            Toast.show(`视频分镜 #${index + 1} 已加入重新生成队列`);
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
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                            <Text className="text-base font-bold text-gray-800">视频分镜交互面板 #{index + 1}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center -mr-2">
                            <Feather name="x" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        <View className="gap-6 pb-6">
                            {/* Prompt Section */}
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-2">
                                        <Feather name="info" size={12} color="#9CA3AF" />
                                        <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">视频生成提示词</Text>
                                    </View>
                                    {savingPrompt ? (
                                        <View className="flex-row items-center gap-1.5">
                                            <ActivityIndicator size="small" color={colors.primary} />
                                            <Text className="text-[10px] text-primary">自动保存中...</Text>
                                        </View>
                                    ) : JSON.stringify({ prompt, duration, aspectRatio }) !== originalConfigRef.current ? (
                                        <Text className="text-[10px] text-gray-400">修改中...</Text>
                                    ) : (
                                        <View className="flex-row items-center gap-1">
                                            <Feather name="check-circle" size={10} color="#10B981" />
                                            <Text className="text-[10px] text-green-500">已保存</Text>
                                        </View>
                                    )}
                                </View>
                                <TextInput
                                    multiline
                                    value={prompt}
                                    onChangeText={setPrompt}
                                    editable={!isRunning}
                                    placeholder="输入视频生成提示词..."
                                    className={`bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs min-h-[60px] ${isRunning ? 'opacity-60' : ''}`}
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>

                            <View className="flex-row gap-6">
                                {/* Duration Section */}
                                <View className="flex-1">
                                    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">生成时长 (秒)</Text>
                                    <View className="flex-row gap-2">
                                        {[5, 10, 12].map(d => (
                                            <TouchableOpacity
                                                key={d}
                                                onPress={() => !isRunning && setDuration(d)}
                                                className={`flex-1 py-2 rounded-xl border items-center justify-center ${duration === d ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                                            >
                                                <Text className={`text-xs font-bold ${duration === d ? 'text-white' : 'text-gray-500'}`}>{d}s</Text>
                                                {duration === d && (
                                                    <View className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full items-center justify-center shadow-sm">
                                                        <Feather name="check" size={10} color={colors.primary} />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Aspect Ratio Section */}
                                <View className="flex-1">
                                    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">视频尺寸</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {Object.values(aspectRatioConfig).map(r => (
                                            <TouchableOpacity
                                                key={r}
                                                onPress={() => !isRunning && setAspectRatio(r)}
                                                className={`px-3 py-1.5 rounded-lg border items-center justify-center ${aspectRatio === r ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                                            >
                                                <Text className={`text-[10px] font-bold ${aspectRatio === r ? 'text-white' : 'text-gray-500'}`}>{r}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Button */}
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
                                {(isRunning || video?.url) ? '重新生成视频分镜' : '开始生成视频分镜'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default VideoGenerationEditorDrawer;
