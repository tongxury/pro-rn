import { createAgent, listAgents, listScenes, listVoices, updateAgent } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import { Agent } from "@/types";
import { upload } from "@/utils/upload/tos";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
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
    const [isManaging, setIsManaging] = useState(false);
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newAvatar, setNewAvatar] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState("");
    const [selectedSceneId, setSelectedSceneId] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [agentStatus, setAgentStatus] = useState("active");
    const [voiceFilter, setVoiceFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();

    const isEditMode = !!editingAgentId;

    const resetForm = () => {
        setNewName("");
        setNewAvatar("");
        setNewDesc("");
        setNewPrompt("");
        setSelectedVoiceId("");
        setSelectedSceneId("");
        setIsPublic(true);
        setAgentStatus("active");
        setIsCreating(false);
        setEditingAgentId(null);
    };

    const handleEditStart = (agent: Agent) => {
        setEditingAgentId(agent._id);
        setNewName(agent.name);
        setNewAvatar(agent.avatar || "");
        setNewDesc(agent.desc || "");
        setNewPrompt(agent.systemPrompt || "");
        setSelectedVoiceId(agent.voiceId || "");
        setSelectedSceneId(agent.defaultSceneId || "");
        setIsPublic(agent.isPublic ?? true);
        setAgentStatus(agent.status || "active");
        setIsCreating(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePickAvatar = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            setIsUploadingAvatar(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const uploadUrl = await upload({
                uri: asset.uri,
                name: asset.fileName || `avatar_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            });

            setNewAvatar(uploadUrl);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("Failed to pick or upload avatar", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // 使用优化后的 useQueryData，自动解开嵌套路径
    const { data: agentsData } = useQueryData({
        queryKey: ['agents'],
        queryFn: () => listAgents(),
    });

    const { data: voicesData, isLoading: isVoicesLoading } = useQueryData({
        queryKey: ['voices', voiceFilter],
        queryFn: () => listVoices({ owner: voiceFilter === 'all' ? '' : voiceFilter }),
    });

    const { data: scenesData } = useQueryData({
        queryKey: ['scenes'],
        queryFn: () => listScenes(),
    });

    const agents = useMemo(() => agentsData?.list || [], [agentsData?.list]);
    const voices = useMemo(() => voicesData?.list || [], [voicesData?.list]);
    const scenes = useMemo(() => scenesData?.list || [], [scenesData?.list]);

    const handleSaveAgent = async () => {
        if (!newName.trim() || !newPrompt.trim() || !selectedVoiceId) return;
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updateAgent(editingAgentId!, {
                    name: newName,
                    avatar: newAvatar,
                    desc: newDesc,
                    systemPrompt: newPrompt,
                    voiceId: selectedVoiceId,
                    defaultSceneId: selectedSceneId,
                    isPublic: isPublic,
                    status: agentStatus,
                });
            } else {
                await createAgent({
                    name: newName,
                    avatar: newAvatar || `https://api.dicebear.com/7.x/bottts/png?seed=${newName}`,
                    desc: newDesc || "Custom AI Agent",
                    systemPrompt: newPrompt,
                    voiceId: selectedVoiceId,
                    defaultSceneId: selectedSceneId,
                    isPublic: isPublic,
                });
            }
            await queryClient.invalidateQueries({ queryKey: ['agents'] });
            resetForm();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("Failed to save agent", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAgentItem = ({ item }: { item: Agent }) => (
        <View className="flex-row items-center mb-3">
            <TouchableOpacity 
                disabled={isManaging}
                onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveAgent(item);
                    await AsyncStorage.setItem("last_agent_id", item._id);
                }}
                className={`flex-1 p-4 rounded-3xl flex-row items-center border ${activeAgent?._id === item._id ? 'bg-white border-white' : 'bg-white/5 border-white/10'} ${isManaging ? 'opacity-80' : ''}`}
            >
                <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-2xl" />
                <View className="ml-4 flex-1">
                    <Text className={`font-bold ${activeAgent?._id === item._id ? 'text-black' : 'text-white'}`}>{item.name}</Text>
                    <Text className={`text-xs ${activeAgent?._id === item._id ? 'text-black/60' : 'text-white/40'}`} numberOfLines={1}>{item.desc}</Text>
                </View>
                {!isManaging && activeAgent?._id === item._id && <Feather name="check-circle" size={20} color="black" />}
            </TouchableOpacity>
            
            {isManaging && (
                <TouchableOpacity 
                    onPress={() => handleEditStart(item)}
                    className="ml-2 h-10 w-10 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-600/20"
                >
                    <Feather name="edit-3" size={16} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );

    if (isCreating) {
        return (
            <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">{isEditMode ? 'Edit Agent' : 'Create New Agent'}</Text>
                    <TouchableOpacity onPress={resetForm}>
                        <Text className="text-indigo-400 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>
                
                <View className="items-center mb-8">
                    <TouchableOpacity 
                        onPress={handlePickAvatar}
                        disabled={isUploadingAvatar}
                        className="relative"
                    >
                        <View className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 overflow-hidden items-center justify-center">
                            {newAvatar ? (
                                <Image source={{ uri: newAvatar }} className="h-full w-full" />
                            ) : (
                                <Feather name="image" size={32} color="white" opacity={0.2} />
                            )}
                            
                            {isUploadingAvatar && (
                                <View className="absolute inset-0 bg-black/60 items-center justify-center">
                                    <ActivityIndicator color="white" />
                                </View>
                            )}
                        </View>
                        <View className="absolute -bottom-2 -right-2 h-8 w-8 bg-indigo-600 rounded-full items-center justify-center border-4 border-[#0D0D0D]">
                            <Feather name="edit-2" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-white/40 text-[10px] font-bold uppercase mt-4 tracking-widest">Tap to upload avatar</Text>
                </View>

                <TextInput
                    placeholder="Agent Name"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 rounded-2xl p-4 text-white mb-4 border border-white/10"
                    value={newName}
                    onChangeText={setNewName}
                />

                <TextInput
                    placeholder="Short Description (Optional)"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 rounded-2xl p-4 text-white mb-4 border border-white/10"
                    value={newDesc}
                    onChangeText={setNewDesc}
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

                <View className="mb-6">
                    <Text className="text-white/60 font-bold uppercase text-xs mb-3 ml-1">Voice Tone</Text>
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row bg-white/5 rounded-lg p-1">
                            {(['all', 'system', 'custom'] as const).map((f) => (
                                <TouchableOpacity 
                                    key={f}
                                    onPress={() => setVoiceFilter(f)}
                                    className={`px-3 py-1.5 rounded-md ${voiceFilter === f ? 'bg-indigo-600' : ''}`}
                                >
                                    <Text className={`text-[10px] font-bold uppercase ${voiceFilter === f ? 'text-white' : 'text-white/40'}`}>
                                        {f === 'custom' ? 'Custom' : f === 'system' ? 'System' : 'All'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    <View className="space-y-2">
                        {isVoicesLoading ? (
                            <View className="h-24 items-center justify-center">
                                <ActivityIndicator color="#818cf8" />
                            </View>
                        ) : voices.length > 0 ? (
                            voices.map((voice: any) => (
                                voice && (
                                    <TouchableOpacity 
                                        key={voice._id}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedVoiceId(voice.voiceId);
                                        }}
                                        className={`mb-2 p-4 rounded-2xl flex-row items-center border ${selectedVoiceId === voice.voiceId ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5'}`}
                                    >
                                        <View className={`h-10 w-10 rounded-full items-center justify-center ${selectedVoiceId === voice.voiceId ? 'bg-indigo-500' : 'bg-white/10'}`}>
                                            <MaterialCommunityIcons 
                                                name={(voice.type === 'cloned' ? "account-voice" : "robot-voice") as any} 
                                                size={20} 
                                                color="white" 
                                            />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="text-white text-sm font-bold">{voice.name}</Text>
                                            <Text className="text-white/30 text-[10px] uppercase mt-0.5">{voice.type === 'cloned' ? 'Custom' : 'System'}</Text>
                                        </View>
                                        
                                        {selectedVoiceId === voice.voiceId && (
                                            <Ionicons name="checkmark-circle" size={20} color="#818cf8" />
                                        )}
                                    </TouchableOpacity>
                                )
                            ))
                        ) : (
                            <View className="py-8 items-center justify-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <Text className="text-white/20 text-xs italic">No voices found...</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <TouchableOpacity 
                    onPress={handleSaveAgent}
                    disabled={isSubmitting || !newName.trim() || !newPrompt.trim() || !selectedVoiceId}
                    className={`py-4 rounded-2xl items-center justify-center mb-10 ${isSubmitting || !newName.trim() || !newPrompt.trim() || !selectedVoiceId ? 'bg-white/10' : 'bg-indigo-600'}`}
                >
                    {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase">{isEditMode ? 'Update Agent' : 'Create Agent'}</Text>}
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <View className="flex-1">
            <FlatList
                data={agents}
                keyExtractor={item => item._id}
                renderItem={renderAgentItem}
                ListHeaderComponent={
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Select Agent</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setIsManaging(!isManaging);
                            }}
                            className={`px-3 py-1.5 rounded-full border ${isManaging ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                        >
                            <Text className={`text-[10px] font-bold uppercase ${isManaging ? 'text-white' : 'text-white/60'}`}>
                                {isManaging ? 'Done' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={
                    !isManaging ? (
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
                    ) : null
                }
        />
        </View>
    );
};
