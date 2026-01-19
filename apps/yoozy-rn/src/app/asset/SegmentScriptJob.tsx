import { updateWorkflowJob } from "@/api/workflow";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import PagerView from 'react-native-pager-view';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SegmentItemProps {
    segment: any;
    index: number;
    editable?: boolean;
    onSubtitleChange: (index: number, value: string) => void;
}

const SegmentItem = React.memo(({
    segment,
    index,
    editable,
    onSubtitleChange,
}: SegmentItemProps) => {
    return (
        <View 
            style={{ flex: 1 }}
            className="px-4"
            collapsable={false}
        >
            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                {/* Header: Style & Index */}
                <View className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                            <Text className="text-primary text-xs font-bold">{index + 1}</Text>
                        </View>
                        <Text className="font-bold text-gray-800 text-sm">
                            {segment.style || `分镜 ${index + 1}`}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                        <Feather name="clock" size={10} color="#9CA3AF" />
                        <Text className="text-[10px] font-bold text-gray-500">
                            {segment.timeStart || 0}s - {segment.timeEnd || 0}s
                        </Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="p-4 gap-y-4">
                        {/* Key Fields Section */}
                        <View className="gap-y-3">
                            {segment.coreAction && (
                                <View>
                                    <Text className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider pl-1">核心动作</Text>
                                    <View className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                                        <Text className="text-sm text-primary font-bold">{segment.coreAction}</Text>
                                    </View>
                                </View>
                            )}

                            {segment.elementTransformation && (
                                <View>
                                    <Text className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider pl-1">元素变换</Text>
                                    <Text className="text-sm text-gray-700 leading-relaxed pl-1">
                                        {segment.elementTransformation}
                                    </Text>
                                </View>
                            )}

                            {segment.visualChange && (
                                <View>
                                    <Text className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider pl-1">视觉变化</Text>
                                    <Text className="text-sm text-gray-600 leading-relaxed pl-1">
                                        {segment.visualChange}
                                    </Text>
                                </View>
                            )}

                            {segment.intention && (
                                <View>
                                    <Text className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider pl-1">意图</Text>
                                    <Text className="text-sm text-gray-600 leading-relaxed pl-1">
                                        {segment.intention}
                                    </Text>
                                </View>
                            )}

                            <View>
                                <View className="flex-row items-center gap-1.5 mb-1 pl-1">
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">文案</Text>
                                    {editable && <Feather name="edit-2" size={10} color="#7150FF" style={{ opacity: 0.6 }} />}
                                </View>
                                {editable ? (
                                    <TextInput
                                        value={segment.subtitle}
                                        onChangeText={(val) => onSubtitleChange(index, val)}
                                        multiline
                                        className="bg-primary/5 text-sm text-primary font-bold rounded-xl p-3 border border-primary/10 min-h-[40px]"
                                        style={{ textAlignVertical: 'top' }}
                                    />
                                ) : (
                                    <View className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                                        <Text className="text-sm text-primary font-bold">{segment.subtitle}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Styles Grid */}
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                                <Text className="text-[10px] text-gray-400 mb-1 font-medium">内容风格</Text>
                                <Text className="text-xs text-gray-600 font-medium" numberOfLines={1}>{segment.contentStyle}</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                                <Text className="text-[10px] text-gray-400 mb-1 font-medium">场景风格</Text>
                                <Text className="text-xs text-gray-600 font-medium" numberOfLines={1}>{segment.sceneStyle}</Text>
                            </View>
                        </View>

                        {/* Tags */}
                        {segment.typedTags && (
                            <View className="flex-row flex-wrap gap-2 pt-2 border-t border-dashed border-gray-100">
                                {Object.values(segment.typedTags)
                                    .flat()
                                    .filter(tag => typeof tag === 'string')
                                    .map((tag: any, i: number) => (
                                        <View key={i} className="px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                                            <Text className="text-[10px] text-primary font-medium">{tag}</Text>
                                        </View>
                                    ))
                                }
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
});

interface SegmentsEditorProps {
    job: any;
    data: any;
    asset: any;
    refetch: () => void;
    editable: boolean;
}

const SegmentsEditor = ({ job, data, asset, refetch, editable }: SegmentsEditorProps) => {
    const segments = data?.segments || [];
    const [localSegments, setLocalSegments] = useState<any[]>(segments);
    const [saving, setSaving] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const originalSegmentsRef = useRef(JSON.stringify(segments));

    useEffect(() => {
        setLocalSegments(segments);
        originalSegmentsRef.current = JSON.stringify(segments);
    }, [segments]);

    const handleSave = async (updatedSegments: any[]) => {
        if (!asset || saving) return;
        setSaving(true);
        try {
            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'segmentScript',
                data: {
                    segmentScript: {
                        ...data,
                        segments: updatedSegments,
                    }
                }
            });
            refetch();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "自动保存失败");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!editable) return;
        const timeout = setTimeout(() => {
            const segmentsStr = JSON.stringify(localSegments);
            if (segmentsStr !== originalSegmentsRef.current) {
                handleSave(localSegments);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [localSegments, editable]);

    const handleSubtitleChange = useCallback((idx: number, value: string) => {
        setLocalSegments(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], subtitle: value };
            return next;
        });
    }, []);

    const onPageSelected = (e: any) => {
        setActiveIndex(e.nativeEvent.position);
    };

    return (
        <View className="py-4 flex-1">
            <View className="flex-row items-center justify-between mb-4 px-5">
                <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">分镜详情</Text>
                    <Text className="text-[10px] text-gray-300 font-bold">({activeIndex + 1}/{localSegments.length})</Text>
                </View>
                {saving && <ActivityIndicator size="small" color="#7150FF" />}
            </View>

            <PagerView 
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={onPageSelected}
                pageMargin={0}
            >
                {localSegments.map((segment: any, idx: number) => (
                    <SegmentItem
                        key={idx}
                        segment={segment}
                        index={idx}
                        editable={editable}
                        onSubtitleChange={handleSubtitleChange}
                    />
                ))}
            </PagerView>

            {/* Indicator Dots */}
            {localSegments.length > 1 && (
                <View className="flex-row justify-center items-center mt-4 gap-1.5">
                    {localSegments.map((_, idx) => (
                        <View 
                            key={idx}
                            className={`h-1.5 rounded-full ${idx === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

// --- Sub-component 2: Script Editor (for plain text script) ---

interface ScriptEditorProps {
    job: any;
    data: any;
    asset: any;
    refetch: () => void;
    editable: boolean;
}

const ScriptEditor = ({ job, data, asset, refetch, editable }: ScriptEditorProps) => {
    const script = data?.script || '';
    const [localScript, setLocalScript] = useState(script);
    const [saving, setSaving] = useState(false);
    const originalScriptRef = useRef(script);

    useEffect(() => {
        setLocalScript(script);
        originalScriptRef.current = script;
    }, [script]);

    const handleSave = async (updatedScript: string) => {
        if (!asset || saving) return;
        setSaving(true);
        try {
            await updateWorkflowJob({
                id: asset.workflow?._id,
                index: job.index,
                dataKey: 'segmentScript',
                data: {
                    segmentScript: {
                        ...data,
                        script: updatedScript,
                    }
                }
            });
            refetch();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "自动保存失败");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!editable) return;
        const timeout = setTimeout(() => {
            if (localScript !== originalScriptRef.current) {
                handleSave(localScript);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [localScript, editable]);

    return (
        <View className="p-4 flex-1 ">
            <View className="flex-row items-center justify-between mb-4 px-1">
                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">脚本编辑</Text>
                {saving && <ActivityIndicator size="small" color="#7150FF" />}
            </View>
            <TextInput
                value={localScript}
                onChangeText={setLocalScript}
                multiline
                placeholder="输入或粘贴脚本内容..."
                editable={editable}
                className={`bg-card p-4  border border-gray-100 rounded-2xl p-4 text-sm leading-relaxed flex-1 ${!editable ? 'opacity-80' : ''}`}
                style={{ textAlignVertical: 'top' }}
            />
        </View>
    );
};

// --- Main Switcher Component ---

interface SegmentScriptJobProps {
    index: number;
    job: any;
    asset: any;
    refetch: () => void;
}

const SegmentScriptJob = ({ index, job, asset, refetch }: SegmentScriptJobProps) => {
    const { colors } = useTailwindVars();
    const data = job?.dataBus?.segmentScript;
    const editable = job.status === 'confirming';
    const isRunning = job.status === 'running' || !data;

    if (isRunning) {
        return (
            <View className="flex-1 p-5">
                <View className="flex-1 bg-card rounded-[24px] border border-dashed border-gray-200 items-center justify-center">
                    <View className="bg-primary/10 w-16 h-16 rounded-full items-center justify-center mb-4">
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                    <Text className="text-gray-800 text-base font-bold mb-2">脚本生成中</Text>
                    <Text className="text-gray-400 text-xs text-center px-10 leading-5">
                        智能 AI 正在为您构思创意分镜，请稍后...
                    </Text>
                </View>
            </View>
        );
    }

    if (data?.segments?.length > 0) {
        return (
            <SegmentsEditor
                job={job}
                data={data}
                asset={asset}
                refetch={refetch}
                editable={editable}
            />
        );
    }

    return (
        <ScriptEditor
            job={job}
            data={data}
            asset={asset}
            refetch={refetch}
            editable={editable}
        />
    );
};

export default React.memo(SegmentScriptJob);
