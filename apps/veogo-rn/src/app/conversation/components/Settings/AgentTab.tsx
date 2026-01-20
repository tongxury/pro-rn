import { createAgent, listAgents, listVoices } from "@/api/voiceagent";
import { Agent } from "@/types";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface AgentTabProps {
    activeAgent: Agent | null;
    setActiveAgent: (agent: Agent) => void;
}

export const AgentTab = (props: AgentTabProps) => {
    const { activeAgent, setActiveAgent } = props;
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [selectedVoiceId, setSelectedVoiceId] = useState("");
    const [voiceFilter, setVoiceFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();

    // 1. 使用 useQuery 直接拉取数据，确保稳定性
    const { data: agentsRes } = useQuery({
        queryKey: ['agents'],
        queryFn: () => listAgents(),
    });

    const { data: voicesRes, isLoading: isVoicesLoading } = useQuery({
        queryKey: ['voices', voiceFilter],
        queryFn: () => listVoices({ owner: voiceFilter === 'all' ? '' : voiceFilter }),
    });

    // 2. 锁定数据引用，防止主页面 useEffect 被误触发
    const agents = useMemo(() => (agentsRes?.data as any)?.data?.list || [], [(agentsRes?.data as any)?.data?.list]);
    const voices = useMemo(() => (voicesRes?.data as any)?.data?.list || [], [(voicesRes?.data as any)?.data?.list]);

    const handleCreateAgent = async () => {
        if (!newName.trim() || !newPrompt.trim() || !selectedVoiceId) return;
        setIsSubmitting(true);
        try {
            await createAgent({
                name: newName,
                systemPrompt: newPrompt,
                voiceId: selectedVoiceId,
                desc: "Custom AI Agent",
                avatar: `https://api.dicebear.com/7.x/bottts/png?seed=${newName}`
            });
            await queryClient.invalidateQueries({ queryKey: ['agents'] });
            setNewName("");
            setNewPrompt("");
            setSelectedVoiceId("");
            setIsCreating(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("Failed to create agent", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAgentItem = ({ item }: { item: Agent }) => (
        <TouchableOpacity 
            onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveAgent(item);
                await AsyncStorage.setItem("last_agent_id", item._id);
            }}
            className={`mb-3 p-4 rounded-3xl flex-row items-center border ${activeAgent?._id === item._id ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
        >
            <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-2xl" />
            <View className="ml-4 flex-1">
                <Text className={`font-bold ${activeAgent?._id === item._id ? 'text-black' : 'text-white'}`}>{item.name}</Text>
                <Text className={`text-xs ${activeAgent?._id === item._id ? 'text-black/60' : 'text-white/40'}`} numberOfLines={1}>{item.desc}</Text>
            </View>
            {activeAgent?._id === item._id && <Feather name="check-circle" size={20} color="black" />}
        </TouchableOpacity>
    );

    if (isCreating) {
        return (
            <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Create New Agent</Text>
                    <TouchableOpacity onPress={() => setIsCreating(false)}>
                        <Text className="text-indigo-400 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
                
                <TextInput
                    placeholder="Agent Name"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 rounded-2xl p-4 text-white mb-4 border border-white/10"
                    value={newName}
                    onChangeText={setNewName}
                />
                
                <TextInput
                    placeholder="System Prompt"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 rounded-2xl p-4 text-white mb-6 border border-white/10 min-h-[100px]"
                    multiline
                    textAlignVertical="top"
                    value={newPrompt}
                    onChangeText={setNewPrompt}
                />

                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white/60 text-xs font-bold uppercase">Voice Tone</Text>
                    <View className="flex-row bg-white/5 rounded-lg p-1">
                        {(['all', 'system', 'custom'] as const).map((f) => (
                            <TouchableOpacity 
                                key={f}
                                onPress={() => setVoiceFilter(f)}
                                className={`px-2 py-1 rounded ${voiceFilter === f ? 'bg-indigo-600' : ''}`}
                            >
                                <Text className={`text-[10px] font-bold uppercase ${voiceFilter === f ? 'text-white' : 'text-white/40'}`}>
                                    {f === 'custom' ? 'Custom' : f === 'system' ? 'System' : 'All'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="mb-8">
                    {isVoicesLoading ? (
                        <ActivityIndicator color="#818cf8" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {voices.map((voice) => (
                                <TouchableOpacity 
                                    key={voice._id}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedVoiceId(voice.voiceId);
                                    }}
                                    className={`mr-3 p-4 rounded-3xl w-32 items-center border ${selectedVoiceId === voice.voiceId ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5'}`}
                                >
                                    <View className={`h-10 w-10 rounded-full items-center justify-center mb-2 ${selectedVoiceId === voice.voiceId ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                        <MaterialCommunityIcons 
                                            name={(voice.type === 'cloned' ? "account-voice" : "robot-voice") as any} 
                                            size={20} 
                                            color="white" 
                                        />
                                    </View>
                                    <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>{voice.name}</Text>
                                    {selectedVoiceId === voice.voiceId && (
                                        <View className="absolute top-2 right-2">
                                            <Ionicons name="checkmark-circle" size={16} color="#818cf8" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
                
                <TouchableOpacity 
                    onPress={handleCreateAgent}
                    disabled={isSubmitting || !newName.trim() || !newPrompt.trim() || !selectedVoiceId}
                    className={`py-4 rounded-2xl items-center justify-center mb-10 ${isSubmitting || !newName.trim() || !newPrompt.trim() || !selectedVoiceId ? 'bg-white/10' : 'bg-indigo-600'}`}
                >
                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase">Create Agent</Text>}
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <FlatList
            data={agents}
            keyExtractor={item => item._id}
            renderItem={renderAgentItem}
            ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Select Agent</Text>}
            ListFooterComponent={
                <TouchableOpacity 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setIsCreating(true);
                    }}
                    className="mt-2 py-6 border border-dashed border-white/20 rounded-3xl items-center flex-row justify-center space-x-2"
                >
                    <Feather name="plus" size={20} color="white" className="opacity-40" />
                    <Text className="text-white/40 font-bold">Create New Agent</Text>
                </TouchableOpacity>
            }
        />
    );
};
