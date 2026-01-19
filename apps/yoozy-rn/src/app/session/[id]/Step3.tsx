import useTailwindVars from "@/hooks/useTailwindVars";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

interface Step3Props {
    session: any;
}

const Step3 = ({ session }: Step3Props) => {
    const { colors } = useTailwindVars();
    const segments = session?.segments || [];

    return (
        <View className="gap-6 pb-10">
            {/* Status Banner */}
            <View className="bg-primary/15 rounded-xl flex-row items-center gap-5 p-4">
                <View className="w-11 h-11 rounded-xl bg-[#fff] items-center justify-center">
                    <MaterialCommunityIcons name="cube-scan" size={22} className="text-primary" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-[15px] text-primary">制作视频</Text>
                    {session.status !== 'completed' && <Text className="text-xs text-primary mt-1">AI 正在努力生成中，请稍候...</Text>}
                </View>
            </View>

            <View className="gap-5 px-1">
                {segments.map((item: any, index: number) => {
                    const segment = item.segment;
                    // const isConfirmed = item.status === 'newSegmentConfirmed';
                    const frames = segment?.highlightFrames || [];

                    return (
                        <View key={item._id || index} className="gap-3">
                            {/* Header: Index & Status */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <View className="bg-primary/10 w-6 h-6 rounded-full items-center justify-center">
                                        <Text className="text-xs font-bold text-primary">{index + 1}</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-foreground">
                                        分镜 {index + 1}
                                    </Text>
                                </View>
                            </View>

                            {/* Content Card */}
                            <View className="bg-muted rounded-2xl p-4 gap-3 border border-divider">
                                {/* Description */}
                                <View>
                                    <Text className="text-xs text-muted-foreground mb-1 font-medium">画面描述</Text>
                                    <Text className="text-sm text-foreground leading-5">
                                        {segment?.description || "暂无描述"}
                                    </Text>
                                </View>

                                {/* Subtitle / Voiceover */}
                                {(segment?.subtitle || segment?.voiceover) && (
                                    <View className="bg-background rounded-lg p-3">
                                        <Text className="text-xs text-muted-foreground mb-1 font-medium">口播/字幕</Text>
                                        <Text className="text-sm text-muted-foreground italic leading-5">
                                            "{segment?.subtitle || segment?.voiceover}"
                                        </Text>
                                    </View>
                                )}

                                {/* Highlight Frames */}
                                {frames.length > 0 && (
                                    <View>
                                        <Text className="text-xs text-muted-foreground mb-2 font-medium">关键帧参考</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                            {frames.map((frame: any, idx: number) => (
                                                <View key={idx} className="w-24 gap-1">
                                                    <Image
                                                        source={{ uri: frame.url }}
                                                        className="w-24 h-16 rounded-lg bg-input"
                                                        resizeMode="cover"
                                                    />
                                                    {/* <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>{frame.desc}</Text> */}
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            {session?.status === 'completed' && (
                <View style={{ alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.muted }}>
                    <Text style={{ fontSize: 18, marginBottom: 4 }}>🎉</Text>
                    <Text style={{ fontWeight: '700', color: colors.primary, marginBottom: 4 }}>视频生成完成！</Text>
                    <Text style={{ fontSize: 12, color: colors['muted-foreground'] }}>请前往详情页预览及导出</Text>
                </View>
            )}
        </View>
    );
};

export default Step3;
