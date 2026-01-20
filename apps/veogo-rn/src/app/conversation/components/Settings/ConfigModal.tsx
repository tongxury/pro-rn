import { Agent, VoiceScene } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { AgentTab } from "./AgentTab";
import { HistoryTab } from "./HistoryTab";
import { SceneTab } from "./SceneTab";
import { VoiceTab } from "./VoiceTab";

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
                            <AgentTab activeAgent={activeAgent} setActiveAgent={setActiveAgent} />
                        )}
                        {activeTab === 'scene' && (
                            <SceneTab activeScene={activeScene} setActiveScene={setActiveScene} />
                        )}
                        {activeTab === 'voice' && (
                            <VoiceTab />
                        )}
                        {activeTab === 'history' && (
                            <HistoryTab />
                        )}
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
};
