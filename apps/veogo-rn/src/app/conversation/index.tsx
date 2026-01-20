import { createConversation, listAgents, listScenes, recordTranscriptEntry, updateConversation } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import type { ConversationStatus } from "@elevenlabs/react-native";
import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Agent, VoiceScene } from "../../types";
import { BarVisualizer } from "./components/LiveCall/BarVisualizer";
import { Orb } from "./components/LiveCall/Orb";
import { ShimmeringText } from "./components/LiveCall/ShimmeringText";
import { MessageModal } from "./components/Messaging/MessageModal";
import { ConfigModal } from "./components/Settings/ConfigModal";

const ConversationScreen = () => {
    const params = useLocalSearchParams();
    
    // 使用优化后的 useQueryData，它会自动处理 data.data 路径并保持引用稳定
    const { data: agentsData } = useQueryData({
        queryKey: ['agents'],
        queryFn: () => listAgents(),
    });

    const { data: scenesData } = useQueryData({
        queryKey: ['scenes'],
        queryFn: () => listScenes(),
    });

    const agents = useMemo(() => agentsData?.list || [], [agentsData?.list]);
    const scenes = useMemo(() => scenesData?.list || [], [scenesData?.list]);

    const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
    const [activeScene, setActiveScene] = useState<VoiceScene | null>(null);
    
    const [isStarting, setIsStarting] = useState(false);
    const localIdRef = useRef<string | null>(null);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null); // ElevenLabs ID
    const [textInput, setTextInput] = useState("");
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (agents.length > 0 && !activeAgent) {
            const init = async () => {
                const savedId = await AsyncStorage.getItem("last_agent_id");
                const targetId = (params.agentId as string) || savedId;
                
                const initialAgent = targetId 
                    ? agents.find((p: Agent) => p._id === targetId) || agents[0]
                    : agents[0];
                
                setActiveAgent(initialAgent);
                if (initialAgent?._id) {
                    await AsyncStorage.setItem("last_agent_id", initialAgent._id);
                }
            };
            init();
        }
    }, [agents, params.agentId]);

    useEffect(() => {
        if (scenes.length > 0 && !activeScene) {
            setActiveScene(scenes[0]);
        }
    }, [scenes]);

    const conversation = useConversation({
        onConnect: ({ conversationId }: { conversationId: string }) => {
            if (__DEV__) console.log(">>> [Conversation] Connected:", conversationId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCurrentConversationId(conversationId);
            setIsStarting(false);
            
            // 串联逻辑：将 ElevenLabs 的会话 ID 同步到本地数据库记录中
            if (localIdRef.current) {
                updateConversation(localIdRef.current, { conversationId });
            }
        },
        onDisconnect: () => {
            if (__DEV__) console.log(">>> [Conversation] Disconnected");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCurrentConversationId(null);
            localIdRef.current = null;
            setIsStarting(false);
        },
        onMessage: ({ message, role }) => {
            if (role === "agent") setLastMessage(message);
            
            // 串联逻辑：将对话过程中的消息实时记录到本地数据库
            if (localIdRef.current) {
                recordTranscriptEntry({
                    conversationId: localIdRef.current,
                    role: role,
                    message: message
                });
            }
        },
        onStatusChange: ({ status }: { status: ConversationStatus }) => {
            if (__DEV__) console.log(">>> [Conversation] Status changed:", status);
            if (status === "connected") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (status === "disconnected") setIsStarting(false);
        },
        onInterruption: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
    });

    const handleStart = useCallback(async () => {
        if (__DEV__) console.log(">>> [Conversation] Starting flow...", { activeAgent: activeAgent?.name, activeScene: activeScene?.name });
        
        if (!activeAgent) {
            if (__DEV__) console.error(">>> [Conversation] No active agent selected!");
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsStarting(true);
        try {
            // 1. 在本地数据库创建通话记录
            const res = await createConversation({
                agentId: activeAgent._id,
                sceneId: activeScene?._id
            });
            
            if (__DEV__) console.log(">>> [Conversation] API Response:", res.data);

            // 修正路径：Axios 返回 res.data，业务数据在 .data 中
            const payload = (res.data as any)?.data;
            const { _id, signedUrl, token } = payload || {};
            
            if (_id) {
                localIdRef.current = _id;
            }

            if (token) {
                const config = { conversationToken: token };
                if (__DEV__) console.log(">>> [Conversation] Starting session with config:", config);
                
                // 2. 启动 ElevenLabs 会话
                await (conversation as any).startSession(config);
                
                if (__DEV__) console.log(">>> [Conversation] startSession called");
            } else {
                throw new Error("No signedUrl or token returned from backend");
            }
        } catch (error) {
            console.error(">>> [Conversation] Failed to start conversation:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsStarting(false);
        }
    }, [conversation, activeAgent, activeScene]);

    const toggleMute = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const next = !isMicMuted;
        setIsMicMuted(next);
        conversation.setMicMuted(next);
    }, [isMicMuted, conversation]);

    return (
        <View className="flex-1 bg-[#050505]">
            <View className="flex-row items-center justify-between px-6 pt-16 pb-4 z-10">
                <View className="items-center">
                    <ShimmeringText 
                        text={conversation.status === "connected" ? (conversation.isSpeaking ? "Speaking" : "Listening") : "Voice Agent"} 
                        active={conversation.status === "connected"} 
                    />
                    <Text className="text-white text-lg font-black mt-1">{activeAgent?.name || "Select Agent"}</Text>
                </View>
                <TouchableOpacity 
                    disabled={conversation.status === "connected" || isStarting}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowConfig(true);
                    }}
                    className={`h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${(conversation.status === "connected" || isStarting) ? 'opacity-20' : 'opacity-100'}`}
                >
                    <Feather name="settings" size={22} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center">
                <View className="items-center justify-center">
                    <Orb isActive={conversation.status === "connected"} isSpeaking={conversation.isSpeaking} />
                    <View className="mt-12 h-12">
                        <BarVisualizer isActive={conversation.isSpeaking} />
                    </View>
                    <View className="mt-12 px-12 h-28 items-center justify-center">
                        {activeScene && (
                            <View className="mt-4 flex-row items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <View className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{activeScene.name}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View className="px-8 pb-16">
                {conversation.status === "disconnected" ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleStart}
                        className="h-20 rounded-[35px] flex-row items-center justify-center space-x-3 shadow-2xl bg-white"
                    >
                        <MaterialCommunityIcons name="power" size={26} color="black" />
                        <Text className="text-black font-black text-xl tracking-tighter">
                            {isStarting ? "CONNECTING..." : "START CONVERSATION"}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <BlurView intensity={40} tint="dark" className="rounded-[45px] border border-white/15 overflow-hidden bg-white/5 p-4 flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={toggleMute}
                            className={`h-16 w-16 items-center justify-center rounded-full ${isMicMuted ? 'bg-red-500/30 border border-red-500/50' : 'bg-white/10 border border-white/5'}`}
                        >
                            <Ionicons name={isMicMuted ? "mic-off" : "mic"} size={28} color={isMicMuted ? "#EF4444" : "white"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await conversation.endSession();
                                } finally {
                                    setIsStarting(false);
                                }
                            }}
                            className="h-20 w-20 items-center justify-center rounded-full bg-red-600 border-4 border-black/20"
                        >
                            <Ionicons name="close" size={40} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowTextInput(true)} className="h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/5">
                            <Ionicons name="chatbubble-ellipses" size={26} color="white" />
                        </TouchableOpacity>
                    </BlurView>
                )}
            </View>

            <ConfigModal 
                visible={showConfig} 
                onClose={() => setShowConfig(false)} 
                activeAgent={activeAgent}
                setActiveAgent={setActiveAgent}
                activeScene={activeScene}
                setActiveScene={setActiveScene}
            />

            <MessageModal 
                visible={showTextInput}
                onClose={() => setShowTextInput(false)}
                textInput={textInput}
                setTextInput={setTextInput}
                onSendMessage={(text) => conversation.sendUserMessage(text)}
            />
        </View>
    );
};

export default function App() {
    return (
        <ElevenLabsProvider>
            <ConversationScreen />
        </ElevenLabsProvider>
    );
}
