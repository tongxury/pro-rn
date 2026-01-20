import React, { useState } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    ScrollView, 
    FlatList, 
    Image 
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listAgents, listScenes } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import { Agent, VoiceScene } from "@/types";

interface ConfigModalProps {
    visible: boolean;
    onClose: () => void;
    activeAgent: Agent | null;
    setActiveAgent: (agent: Agent) => void;
    activeScene: VoiceScene | null;
    setActiveScene: (scene: VoiceScene) => void;
}

export const ConfigModal = ({ 
    visible, 
    onClose, 
    activeAgent, 
    setActiveAgent, 
    activeScene, 
    setActiveScene 
}: ConfigModalProps) => {
    const [activeTab, setActiveTab] = useState<'agent' | 'voice' | 'scene' | 'history'>('agent');

    const { data: agentsData } = useQueryData<any>({
        queryKey: ['agents'],
        queryFn: () => listAgents(),
        enabled: visible
    });

    const { data: scenesData } = useQueryData<any>({
        queryKey: ['scenes'],
        queryFn: () => listScenes(),
        enabled: visible
    });

    const agents = (agentsData?.list || []) as Agent[];
    const scenes = (scenesData?.list || []) as VoiceScene[];

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

    const renderSceneItem = ({ item }: { item: VoiceScene }) => (
        <TouchableOpacity 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveScene(item);
            }}
            className={`mb-3 p-5 rounded-3xl border ${activeScene?._id === item._id ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}
        >
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <Text className="text-white/50 text-xs mt-1">{item.desc}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 justify-end">
                <TouchableOpacity className="flex-1" onPress={onClose} />
                <BlurView intensity={95} tint="dark" className="h-[75%] rounded-t-[50px] bg-black/40 border-t border-white/10 overflow-hidden">
                    <View className="p-8 pb-0">
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-3xl font-black text-white">Agent Settings</Text>
                            <TouchableOpacity onPress={onClose} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Tabs */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
                            {['agent', 'voice', 'scene', 'history'].map((tab) => (
                                <TouchableOpacity 
                                    key={tab}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setActiveTab(tab as any);
                                    }}
                                    className={`mr-4 px-6 py-3 rounded-full border ${activeTab === tab ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
                                >
                                    <Text className={`font-bold capitalize ${activeTab === tab ? 'text-black' : 'text-white/60'}`}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="flex-1 px-8">
                        {activeTab === 'agent' && (
                            <View className="flex-1">
                                <FlatList
                                    data={agents}
                                    keyExtractor={item => item._id}
                                    renderItem={renderAgentItem}
                                    ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Select Agent</Text>}
                                    ListFooterComponent={
                                        <TouchableOpacity className="mt-2 py-6 border border-dashed border-white/20 rounded-3xl items-center flex-row justify-center space-x-2">
                                            <Feather name="plus" size={20} color="white" className="opacity-40" />
                                            <Text className="text-white/40 font-bold">Create New Agent</Text>
                                        </TouchableOpacity>
                                    }
                                />
                            </View>
                        )}
                        {activeTab === 'scene' && (
                            <View className="flex-1">
                                <FlatList
                                    data={scenes}
                                    keyExtractor={item => item._id}
                                    renderItem={renderSceneItem}
                                    ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Select Atmosphere</Text>}
                                />
                            </View>
                        )}
                        {activeTab === 'voice' && (
                            <View className="flex-1 items-center justify-center pb-20">
                                <MaterialCommunityIcons name="microphone-settings" size={64} color="rgba(255,255,255,0.1)" />
                                <Text className="text-white/40 font-medium text-center mt-4">Voice cloning and fine-tuning{"\n"}options available in Pro mode.</Text>
                                <TouchableOpacity className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl">
                                    <Text className="text-white font-bold">Add Custom Voice</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeTab === 'history' && (
                            <View className="flex-1 items-center justify-center pb-20">
                                <Feather name="clock" size={64} color="rgba(255,255,255,0.1)" />
                                <Text className="text-white/40 font-medium text-center mt-4">No recent conversations found.</Text>
                            </View>
                        )}
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
};
