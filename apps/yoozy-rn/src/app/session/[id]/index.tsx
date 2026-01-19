import { confirmSelectTemplate, fetchSession, startSelectTemplate } from "@/api/session";
import CreditEntry from "@/components/CreditEntry";
import ButtonV2 from "@/components/ui/ButtonV2";
import useTailwindVars from "@/hooks/useTailwindVars";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CommoditySelect from "./CommoditySelect";
import Step3 from "./Step3";
import TemplateSelect from "./TemplateSelect";

const Session = () => {
    const { id } = useLocalSearchParams();
    const { colors } = useTailwindVars();

    // Step definitions
    const steps = [
        { index: 1, title: "选择商品", icon: (c: string) => <MaterialCommunityIcons name="cube-outline" size={18} color={c} /> },
        { index: 2, title: "选择模板", icon: (c: string) => <FontAwesome name="lightbulb-o" size={18} color={c} /> },
        { index: 3, title: "视频生成", icon: (c: string) => <Ionicons name="videocam" size={18} color={c} /> },
    ];

    // Session Data
    const { data: ur, refetch } = useQuery({
        queryKey: ["session", id],
        queryFn: () => fetchSession({ id: id as string }),
    });

    const [pendingTemplate, setPendingTemplate] = useState<any>(null);

    const session = useMemo(() => ur?.data?.data, [ur]);
    const status = session?.status || '';

    // Derive real step from status
    const realTab = useMemo(() => {
        if (status?.startsWith("chanceSelected")) return 1;
        if (status?.startsWith("templateSelecting")) return 2;
        if (status?.startsWith("generating")) return 3;
        return 1;
    }, [status]);

    const [tab, setTab] = useState(realTab);
    useEffect(() => { setTab(realTab); }, [realTab]);

    const handleTabChange = (index: number) => {
        if (realTab >= index) setTab(index);
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-5 pt-4 flex-row justify-between items-center">
                <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>智能成片</Text>
                <View className="flex-row items-center gap-2">
                    <CreditEntry />
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }} activeOpacity={0.7}>
                        <MaterialCommunityIcons name="arrow-collapse" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top Tab Navigation */}
            <View className="px-5 pt-2 pb-3">
                <View
                    className="flex-row items-center justify-between bg-plain rounded-full p-1"
                >
                    {steps.map((step) => {
                        const isActive = step.index === tab;
                        const isAvailable = realTab >= step.index;
                        return (
                            <TouchableOpacity
                                key={step.index}
                                activeOpacity={0.7}
                                disabled={!isAvailable}
                                onPress={() => handleTabChange(step.index)}
                                className="flex-1"
                                style={{ opacity: isAvailable ? 1 : 0.4 }}
                            >
                                {isActive ? (
                                    <LinearGradient
                                        colors={[colors.primary, colors.primary + 'cc']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ height: 38, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        {step.icon('#fff')}
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{step.title}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View className="h-[38px] flex-row items-center justify-center gap-1.5">
                                        {step.icon(colors['muted-foreground'])}
                                        <Text className="text-xs font-medium" style={{ color: colors['muted-foreground'] }}>{step.title}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Content Area */}
            <View className="flex-1 px-5">
                {tab === 1 && (
                    <>
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <CommoditySelect session={session} />
                        </ScrollView>
                        <View style={{ paddingTop: 12, paddingBottom: 12, backgroundColor: colors.background }}>
                            <ButtonV2
                                text="去选择模版"
                                size="lg"
                                icon={<MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />}
                                disabled={status !== 'chanceSelected'}
                                onPress={() => {
                                    startSelectTemplate({
                                        id: id as string,
                                    }).then(() => refetch());
                                }}
                            />
                        </View>
                    </>
                )}
                {tab === 2 &&
                    <>
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            <TemplateSelect
                                session={session}
                                pendingTemplate={pendingTemplate}
                                onSelect={setPendingTemplate}
                            />
                        </ScrollView>
                        <View style={{ paddingTop: 12, paddingBottom: 16, backgroundColor: colors.background }}>
                            <ButtonV2
                                text="确认模版并开始创作"
                                size="lg"
                                icon={<MaterialCommunityIcons name="arrow-right" size={22} color="#fff" />}
                                disabled={status !== 'templateSelecting' || !pendingTemplate}
                                onPress={() => {
                                    confirmSelectTemplate({
                                        id: id as string,
                                        templateId: pendingTemplate._id,
                                    }).then(() => refetch());
                                }}
                            />
                        </View>
                    </>
                }
                {tab === 3 && (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <Step3 session={session} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default Session;
