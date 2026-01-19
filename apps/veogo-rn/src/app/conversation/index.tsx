import type { ConversationStatus } from "@elevenlabs/react-native";
import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Keyboard,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { Persona, Voice, VoiceScene, VoiceSession } from "../../types";

// --- Sub-components inspired by ElevenLabs UI ---

const Orb = ({ isActive, isSpeaking }: { isActive: boolean, isSpeaking: boolean }) => {
    const pulse = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            pulse.value = withRepeat(
                withTiming(1, { duration: isSpeaking ? 800 : 2000 }),
                -1,
                true
            );
        } else {
            pulse.value = 0;
        }
    }, [isActive, isSpeaking]);

    const orbStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.15]) }],
        opacity: interpolate(pulse.value, [0, 1], [0.6, 0.9]),
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.4]) }],
        opacity: interpolate(pulse.value, [0, 1], [0.1, 0.3]),
    }));

    return (
        <View className="items-center justify-center">
            <Animated.View 
                style={glowStyle}
                className="absolute h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"
            />
            <Animated.View 
                style={orbStyle}
                className="h-48 w-48 rounded-full border border-white/20 bg-black overflow-hidden shadow-2xl items-center justify-center"
            >
                <LinearGradient
                    colors={isActive ? ['#3b82f6', '#8b5cf6', '#d946ef'] : ['#1f2937', '#111827']}
                    className="absolute inset-0 opacity-40"
                />
                <MaterialCommunityIcons 
                    name={isSpeaking ? "waveform" : "microphone"} 
                    size={64} 
                    color="white" 
                />
            </Animated.View>
        </View>
    );
};

const BarVisualizer = ({ isActive }: { isActive: boolean }) => {
    return (
        <View className="flex-row items-end justify-center h-12 space-x-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Bar key={i} index={i} isActive={isActive} />
            ))}
        </View>
    );
};

const Bar = ({ index, isActive }: { index: number, isActive: boolean }) => {
    const height = useSharedValue(4);

    useEffect(() => {
        if (isActive) {
            height.value = withRepeat(
                withTiming(Math.random() * 40 + 10, { duration: Math.random() * 300 + 200 }),
                -1,
                true
            );
        } else {
            height.value = withTiming(4);
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
    }));

    return (
        <Animated.View 
            style={animatedStyle}
            className="w-1.5 rounded-full bg-blue-400/60"
        />
    );
};

const ShimmeringText = ({ text, active }: { text: string, active: boolean }) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        if (active) {
            shimmer.value = withRepeat(
                withTiming(1, { duration: 1500 }),
                -1,
                false
            );
        }
    }, [active]);

    const textStyle = useAnimatedStyle(() => ({
        opacity: active ? interpolate(shimmer.value, [0, 0.5, 1], [0.4, 1, 0.4]) : 0.4,
    }));

    return (
        <Animated.Text style={textStyle} className="text-white text-[10px] font-black uppercase tracking-[4px]">
            {text}
        </Animated.Text>
    );
};

const ConversationScreen = () => {
    const params = useLocalSearchParams();
    
    // API State
    const [personas, setPersonas] = useState<Persona[]>([
        { id: "1", name: "Lumina AI", desc: "Your creative companion.", avatar: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500" },
        { id: "2", name: "Atlas", desc: "Data and logic expert.", avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500" }
    ]);
    const [activePersona, setActivePersona] = useState<Persona>(personas[0]);
    const [scenes, setScenes] = useState<VoiceScene[]>([
        { id: "1", name: "Neon Studio", desc: "Vibrant and energetic" },
        { id: "2", name: "Zen Garden", desc: "Peaceful and quiet" }
    ]);
    const [activeScene, setActiveScene] = useState<VoiceScene>(scenes[0]);
    
    // UI State
    const [isStarting, setIsStarting] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [activeTab, setActiveTab] = useState<'persona' | 'voice' | 'scene' | 'history'>('persona');
    const [showConfig, setShowConfig] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    const conversation = useConversation({
        onConnect: ({ conversationId }: { conversationId: string }) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCurrentConversationId(conversationId);
        },
        onDisconnect: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCurrentConversationId(null);
        },
        onMessage: ({ message, role }) => {
            if (role === "agent") setLastMessage(message);
        },
        onStatusChange: ({ status }: { status: ConversationStatus }) => {
            if (status === "connected") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onInterruption: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
    });

    const handleStart = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsStarting(true);
        try {
            await conversation.startSession({
                agentId: 'agent_5301kf9mt9hhfb6tpbezkx6m66pa',
                userId: "demo-user",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsStarting(false);
        }
    }, [conversation]);

    const toggleMute = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const next = !isMicMuted;
        setIsMicMuted(next);
        conversation.setMicMuted(next);
    }, [isMicMuted, conversation]);

    const renderPersonaItem = ({ item }: { item: Persona }) => (
        <TouchableOpacity 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePersona(item);
            }}
            className={`mb-3 p-4 rounded-3xl flex-row items-center border ${activePersona.id === item.id ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
        >
            <Image source={{ uri: item.avatar }} className="h-12 w-12 rounded-2xl" />
            <View className="ml-4 flex-1">
                <Text className={`font-bold ${activePersona.id === item.id ? 'text-black' : 'text-white'}`}>{item.name}</Text>
                <Text className={`text-xs ${activePersona.id === item.id ? 'text-black/60' : 'text-white/40'}`} numberOfLines={1}>{item.desc}</Text>
            </View>
            {activePersona.id === item.id && <Feather name="check-circle" size={20} color="black" />}
        </TouchableOpacity>
    );

    const renderSceneItem = ({ item }: { item: VoiceScene }) => (
        <TouchableOpacity 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveScene(item);
            }}
            className={`mb-3 p-5 rounded-3xl border ${activeScene.id === item.id ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}
        >
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <Text className="text-white/50 text-xs mt-1">{item.desc}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#050505]">
            <LinearGradient
                colors={['#0f172a', '#050505', '#1e1b4b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0"
            />

            {/* Top Navigation */}
            <View className="flex-row items-center justify-between px-6 pt-16 pb-4 z-10">
                <TouchableOpacity onPress={() => router.back()} className="h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <Feather name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
                
                <View className="items-center">
                    <ShimmeringText 
                        text={conversation.status === "connected" ? (conversation.isSpeaking ? "Speaking" : "Listening") : "Voice Agent"} 
                        active={conversation.status === "connected"} 
                    />
                    <Text className="text-white text-lg font-black mt-1">{activePersona.name}</Text>
                </View>

                <TouchableOpacity 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowConfig(true);
                    }}
                    className="h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10"
                >
                    <Feather name="settings" size={22} color="white" />
                </TouchableOpacity>
            </View>

            {/* Visualizer Area */}
            <View className="flex-1 items-center justify-center">
                <View className="items-center justify-center">
                    <Orb 
                        isActive={conversation.status === "connected"} 
                        isSpeaking={conversation.isSpeaking} 
                    />

                    <View className="mt-12 h-12">
                        <BarVisualizer isActive={conversation.isSpeaking} />
                    </View>

                    {/* Subtitle/Captions - Inspired by Transcript Viewer */}
                    <View className="mt-12 px-12 h-28 items-center justify-center">
                        <Text className="text-white/90 text-center text-xl leading-relaxed font-medium tracking-tight">
                            {conversation.status === "connected" ? (lastMessage || `Hello, I am ${activePersona.name}. How can I help?`) : `Tap below to start session`}
                        </Text>
                        <View className="mt-4 flex-row items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <View className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            <Text className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{activeScene.name}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Interaction Bar */}
            <View className="px-8 pb-16">
                {conversation.status === "disconnected" ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleStart}
                        className="bg-white h-20 rounded-[35px] flex-row items-center justify-center space-x-3 shadow-2xl"
                    >
                        <MaterialCommunityIcons name="power" size={26} color="black" />
                        <Text className="text-black font-black text-xl tracking-tighter">
                            {isStarting ? "CONNECTING..." : "START SESSION"}
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
                            onPress={() => conversation.endSession()}
                            className="h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-2xl shadow-red-600/50 border-4 border-black/20"
                        >
                            <Ionicons name="close" size={40} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setShowTextInput(true)}
                            className="h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/5"
                        >
                            <Ionicons name="chatbubble-ellipses" size={26} color="white" />
                        </TouchableOpacity>
                    </BlurView>
                )}
            </View>

            {/* Configuration Overlay (Persona/Voice/Scene/History) */}
            <Modal visible={showConfig} transparent animationType="slide">
                <View className="flex-1 justify-end">
                    <TouchableOpacity className="flex-1" onPress={() => setShowConfig(false)} />
                    <BlurView intensity={95} tint="dark" className="h-[75%] rounded-t-[50px] bg-black/40 border-t border-white/10 overflow-hidden">
                        <View className="p-8 pb-0">
                            <View className="flex-row items-center justify-between mb-8">
                                <Text className="text-3xl font-black text-white">Agent Settings</Text>
                                <TouchableOpacity onPress={() => setShowConfig(false)} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center">
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Tabs */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-8">
                                {['persona', 'voice', 'scene', 'history'].map((tab) => (
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
                            {activeTab === 'persona' && (
                                <View className="flex-1">
                                    <FlatList
                                        data={personas}
                                        keyExtractor={item => item.id}
                                        renderItem={renderPersonaItem}
                                        ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Select Persona</Text>}
                                        ListFooterComponent={
                                            <TouchableOpacity className="mt-2 py-6 border border-dashed border-white/20 rounded-3xl items-center flex-row justify-center space-x-2">
                                                <Feather name="plus" size={20} color="white" className="opacity-40" />
                                                <Text className="text-white/40 font-bold">Create New Persona</Text>
                                            </TouchableOpacity>
                                        }
                                    />
                                </View>
                            )}
                            {activeTab === 'scene' && (
                                <View className="flex-1">
                                    <FlatList
                                        data={scenes}
                                        keyExtractor={item => item.id}
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
                                    <Text className="text-white/40 font-medium text-center mt-4">No recent sessions found.</Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </View>
            </Modal>

            {/* Text Message Modal */}
            <Modal visible={showTextInput} transparent animationType="fade">
                <BlurView intensity={80} tint="dark" className="flex-1 justify-end px-6 pb-12">
                    <TouchableOpacity className="flex-1" onPress={() => setShowTextInput(false)} />
                    <View className="bg-[#111] rounded-[45px] p-8 border border-white/10 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-white">Send Message</Text>
                            <TouchableOpacity onPress={() => setShowTextInput(false)} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            autoFocus
                            multiline
                            className="bg-white/5 rounded-3xl p-6 text-white text-lg min-h-[150px] border border-white/5"
                            placeholder="Type a message or provide context..."
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={textInput}
                            onChangeText={setTextInput}
                            selectionColor="white"
                        />
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                conversation.sendUserMessage(textInput);
                                setTextInput("");
                                setShowTextInput(false);
                            }}
                            disabled={!textInput.trim()}
                            className={`mt-6 py-5 rounded-[25px] items-center ${textInput.trim() ? 'bg-white' : 'bg-white/20'}`}
                        >
                            <Text className={`font-black text-lg ${textInput.trim() ? 'text-black' : 'text-white/40'}`}>SEND SIGNAL</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
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
