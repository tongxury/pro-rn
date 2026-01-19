import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Modal,
    TextInput,
    Dimensions,
    Alert,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { updateWorkflowJob } from "@/api/workflow";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoGenerationJobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const SegmentCard = React.memo(({ 
    item, 
    index, 
    editable, 
    isRemixing, 
    onOpenEditor 
}: { 
    item: any; 
    index: number; 
    editable?: boolean; 
    isRemixing: boolean; 
    onOpenEditor: (index: number) => void;
}) => {
    const crop = item.remixOptions?.crop || [0, item.videoGeneration?.duration || 0];
    const speed = item.remixOptions?.speed || 1;

    return (
        <View className="flex flex-col gap-3 w-[160px] mr-4">
            {/* Header */}
            <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                    <View className="w-5 h-5 rounded bg-primary/10 items-center justify-center">
                        <Text className="text-primary text-[10px] font-bold">#{index + 1}</Text>
                    </View>
                    <Text className="text-[11px] font-bold text-gray-500">分段</Text>
                </View>
            </View>

            {/* Video Card */}
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => editable && !isRemixing && onOpenEditor(index)}
                className="relative aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
            >
                <Image
                    source={{ uri: item.videoGeneration?.lastFrame || item.videoGeneration?.firstFrame }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 items-center justify-center bg-black/10">
                    <Feather name="play-circle" size={24} color="white" />
                </View>
            </TouchableOpacity>

            {/* Config Preview */}
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => editable && !isRemixing && onOpenEditor(index)}
                className={`flex flex-col gap-1.5 px-1 ${editable && !isRemixing ? 'bg-gray-50/50 rounded-lg p-2' : ''}`}
            >
                <View className="flex-row items-center gap-2">
                    <Feather name="scissors" size={12} color="#9CA3AF" />
                    <Text className="text-[10px] text-gray-500">
                        裁剪: {crop[0].toFixed(1)}s - {crop[1].toFixed(1)}s
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Feather name="clock" size={12} color="#9CA3AF" />
                    <Text className="text-[10px] text-gray-500">
                        倍速: {speed}x
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
});

const SegmentEditor = ({ 
    item, 
    visible, 
    onClose, 
    onSave 
}: { 
    item: any; 
    visible: boolean; 
    onClose: () => void; 
    onSave: (crop: [number, number], speed: number) => void 
}) => {
    const videoDuration = item.videoGeneration?.duration || 0;
    const initialCrop = item.remixOptions?.crop || [0, videoDuration];
    const initialSpeed = item.remixOptions?.speed || 1;

    const [crop, setCrop] = useState<[number, number]>(initialCrop);
    const [speed, setSpeed] = useState<number>(initialSpeed);
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

    useEffect(() => {
        if (visible) {
            setCrop(initialCrop);
            setSpeed(initialSpeed);
        }
    }, [visible, item]);

    const handleStatusUpdate = (newStatus: AVPlaybackStatus) => {
        setStatus(newStatus);
        if (newStatus.isLoaded && newStatus.isPlaying) {
            // If we've played past the end of the crop, seek back to the start
            if (newStatus.positionMillis >= crop[1] * 1000) {
                videoRef.current?.setPositionAsync(crop[0] * 1000);
            }
        }
    };

    const handleCropChange = (index: number, val: string) => {
        const num = parseFloat(val) || 0;
        const newCrop = [...crop] as [number, number];
        newCrop[index] = Math.max(0, Math.min(videoDuration, num));
        
        // Ensure start < end
        if (index === 0 && newCrop[0] >= newCrop[1]) {
            newCrop[1] = Math.min(videoDuration, newCrop[0] + 0.1);
        } else if (index === 1 && newCrop[1] <= newCrop[0]) {
            newCrop[0] = Math.max(0, newCrop[1] - 0.1);
        }

        setCrop(newCrop);
        // Seek to the start of the crop to show result
        videoRef.current?.setPositionAsync(newCrop[0] * 1000);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white">
                <View className="px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-800">调整分段参数</Text>
                    <TouchableOpacity onPress={onClose} className="p-1">
                        <Feather name="x" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4 pt-4">
                    {/* Video Preview */}
                    <View className="w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden mb-6 self-center max-h-[400px]">
                        <Video
                            ref={videoRef}
                            source={{ uri: item.videoGeneration?.url }}
                            className="w-full h-full"
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            isLooping={false} // We handle looping manually in handleStatusUpdate
                            onPlaybackStatusUpdate={handleStatusUpdate}
                            rate={speed}
                            shouldCorrectPitch={true}
                        />
                    </View>

                    {/* Crop Controls */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-3">裁剪时长 (最大: {videoDuration.toFixed(1)}s)</Text>
                        <View className="flex-row items-center gap-4">
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 mb-1 font-bold">开始时间</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={crop[0].toString()}
                                    onChangeText={(val) => handleCropChange(0, val)}
                                    className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm font-bold"
                                />
                            </View>
                            <View className="pt-4">
                                <Text className="text-gray-300">-</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] text-gray-400 mb-1 font-bold">结束时间</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={crop[1].toString()}
                                    onChangeText={(val) => handleCropChange(1, val)}
                                    className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm font-bold"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Speed Controls */}
                    <View className="mb-10">
                        <Text className="text-sm font-bold text-gray-700 mb-3">播放倍速</Text>
                        <View className="flex-row gap-2">
                            {[0.5, 1, 1.5, 2, 3].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setSpeed(s)}
                                    className={`flex-1 py-3 rounded-xl border items-center justify-center ${speed === s ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <Text className={`text-xs font-bold ${speed === s ? 'text-white' : 'text-gray-500'}`}>{s}x</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        onPress={() => onSave(crop, speed)}
                        className="w-full bg-primary py-4 rounded-2xl items-center justify-center mb-10 shadow-lg shadow-primary/30"
                    >
                        <Text className="text-white font-bold text-base">保存配置</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

const RemixJob = ({ job, asset, refetch }: VideoGenerationJobProps) => {
    const { colors } = useTailwindVars();
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [showSegments, setShowSegments] = useState(false);

    const data = job?.dataBus?.remix;
    const editable = job.status === 'confirming';
    const isRemixing = data?.status === 'running';

    const handleUpdateSegment = async (crop: [number, number], speed: number) => {
        if (editingIdx === null || !asset || saving) return;

        setSaving(true);
        try {
            const currentSegments = JSON.parse(JSON.stringify(data.segments));
            const segment = currentSegments[editingIdx];
            
            if (!segment.remixOptions) segment.remixOptions = {};
            segment.remixOptions.crop = crop;
            segment.remixOptions.speed = speed;
        
            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'remix',
                data: {
                    remix: {
                        ...data,
                        segments: currentSegments,
                        status: 'waiting' 
                    },
                }
            });

            refetch();
            setEditingIdx(null);
        } catch (e) {
            console.error('Update failed:', e);
            Alert.alert("错误", "保存失败");
        } finally {
            setSaving(false);
        }
    };

    const handleStartGeneration = async () => {
        if (!asset || saving) return;
        setSaving(true);
        try {
            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'remix',
                data: {
                    remix: {
                        ...data,
                        status: 'running',
                        taskId: '',
                        url: '',
                        coverUrl: '',
                    },
                }
            });
            refetch();
            Alert.alert("成功", "已开始生成视频");
        } catch (e) {
            console.error('Failed to start generation:', e);
            Alert.alert("错误", "启动生成失败");
        } finally {
            setSaving(false);
        }
    };

    if (!data?.segments) return null;

    const hasResult = !!(data.url || data.coverUrl);
    const displayMode = (hasResult && !showSegments && !isRemixing) ? 'result' : 'edit';

    const renderResult = () => (
        <View className="flex-1 p-4">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push(`/video?url=${data.url}`)}
                className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-xl border-[6px] border-white"
                        >
                <Image 
                    source={{ uri: data.coverUrl || data.lastFrame }} 
                    className="w-full h-full" 
                    resizeMode="cover" 
                />
                            <View className="absolute inset-0 items-center justify-center bg-black/10">
                    <Feather name="play-circle" size={64} color="white" />
                </View>
            </TouchableOpacity>

            <View className="mt-6 px-2">
                <View className="flex-row items-center gap-2 mb-2">
                    <View className="px-3 py-1 bg-green-100 rounded-full flex-row items-center">
                        <Feather name="check-circle" size={12} color="#10B981" />
                        <Text className="text-[10px] text-green-700 font-bold ml-1 uppercase">合成完成</Text>
                    </View>
                </View>
                <Text className="text-2xl font-black text-gray-900 mb-2">混剪成片预览</Text>
                
                <View className="flex-row gap-3 mt-4">
                    {editable && (
                        <TouchableOpacity 
                            onPress={() => setShowSegments(true)}
                            className="flex-1 h-14 bg-gray-50 rounded-2xl flex-row items-center justify-center border border-gray-100"
                        >
                            <Feather name="settings" size={18} color="#4B5563" />
                            <Text className="text-sm font-bold text-gray-700 ml-2">调整参数</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        onPress={() => router.push(`/video?url=${data.url}`)}
                        className="flex-1 h-14 bg-primary rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
                    >
                        <Feather name="play" size={18} color="white" />
                        <Text className="text-sm font-bold text-white ml-2">查看成片</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEdit = () => (
        <View className="flex-1">
            <View className="flex-row items-center justify-between mb-6 px-2">
                <View className="flex-row items-center gap-3">
                    <View className={`px-3 py-1 rounded-full flex-row items-center ${isRemixing ? 'bg-blue-50' : 'bg-green-50'}`}>
                        {isRemixing ? <ActivityIndicator size="small" color="#3B82F6" /> : <Feather name="check-circle" size={12} color="#10B981" />}
                        <Text className={`text-[10px] font-bold ml-1 uppercase ${isRemixing ? 'text-blue-600' : 'text-green-600'}`}>
                            {data.status === 'waiting' ? '等待队列' : 
                             data.status === 'running' ? '正在合成' : 
                             data.status === 'completed' ? '合成完成' : data.status}
                        </Text>
                            </View>
                    
                    {editable && !isRemixing && (
                        <TouchableOpacity 
                            onPress={handleStartGeneration}
                            className="flex-row items-center gap-1.5"
                        >
                            <Feather name="refresh-cw" size={14} color="#7150FF" />
                            <Text className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {hasResult ? '重新合成' : '开始合成'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {hasResult && !isRemixing && (
                        <TouchableOpacity 
                            onPress={() => setShowSegments(false)}
                            className="flex-row items-center gap-1.5 border-l border-gray-100 pl-3"
                        >
                            <Feather name="play" size={14} color="#6B7280" />
                            <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">返回成片</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {saving && <ActivityIndicator size="small" color="#7150FF" />}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-2">
                {data.segments.map((item: any, index: number) => (
                    <SegmentCard
                        key={index}
                        item={item}
                        index={index}
                        editable={editable}
                        isRemixing={isRemixing}
                        onOpenEditor={(idx) => setEditingIdx(idx)}
                    />
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View className="flex-1 mt-4">
            {displayMode === 'result' ? renderResult() : renderEdit()}

            {editingIdx !== null && (
                <SegmentEditor
                    item={data.segments[editingIdx]}
                    visible={editingIdx !== null}
                    onClose={() => setEditingIdx(null)}
                    onSave={handleUpdateSegment}
                />
            )}
        </View>
    );
};

export default RemixJob;
