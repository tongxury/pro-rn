import React, { useMemo, useState } from "react";
import { 
    View, 
    Text, 
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Modal,
    ScrollView
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { listConversations, listAgents, listTranscriptEntries } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import { Conversation, Agent, TranscriptEntry } from "@/types";
import { BlurView } from "expo-blur";

export const HistoryTab = () => {
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

    const { data: historyData, isLoading: isHistoryLoading } = useQueryData({
        queryKey: ['conversations'],
        queryFn: () => listConversations(),
    });

    const { data: agentsData } = useQueryData({
        queryKey: ['agents'],
        queryFn: () => listAgents(),
    });

    const conversations = useMemo(() => historyData?.list || [], [historyData]);
    const agents = useMemo(() => agentsData?.list || [], [agentsData]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const renderItem = ({ item }: { item: Conversation }) => {
        const agent = agents.find(a => a._id === item.agentId);
        
        return (
            <TouchableOpacity 
                onPress={() => setSelectedConv(item)}
                className="bg-white/5 border border-white/10 rounded-3xl p-4 mb-3 flex-row items-center"
            >
                <View className="h-12 w-12 rounded-2xl bg-white/10 overflow-hidden items-center justify-center">
                    {agent?.avatar ? (
                        <Image source={{ uri: agent.avatar }} className="h-full w-full" />
                    ) : (
                        <Feather name="user" size={20} color="white" opacity={0.2} />
                    )}
                </View>
                
                <View className="ml-4 flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-white font-bold">{agent?.name || 'Deleted Agent'}</Text>
                        <Text className="text-white/40 text-[10px]">{formatDate(item.startedAt)}</Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                        <View className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-white/20'}`} />
                        <Text className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{item.status}</Text>
                    </View>
                </View>
                
                <Feather name="chevron-right" size={16} color="white" opacity={0.2} />
            </TouchableOpacity>
        );
    };

    if (isHistoryLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#818cf8" />
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View className="flex-1 items-center justify-center pb-20">
                <Feather name="clock" size={64} color="rgba(255,255,255,0.05)" />
                <Text className="text-white/30 font-medium text-center mt-4">No call history yet</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <FlatList
                data={conversations}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest px-1">Recent Calls</Text>}
            />

            {selectedConv && (
                <TranscriptModal 
                    conversation={selectedConv} 
                    agent={agents.find(a => a._id === selectedConv.agentId)}
                    onClose={() => setSelectedConv(null)} 
                />
            )}
        </View>
    );
};

const TranscriptModal = ({ conversation, agent, onClose }: { conversation: Conversation, agent?: Agent, onClose: () => void }) => {
    const { data: transcriptData, isLoading } = useQueryData({
        queryKey: ['transcript', conversation._id],
        queryFn: () => listTranscriptEntries(conversation._id),
        enabled: !!conversation._id
    });

    const transcripts = useMemo(() => transcriptData?.list || [], [transcriptData]);

    return (
        <Modal transparent animationType="slide" visible={!!conversation}>
            <View className="flex-1 justify-end">
                <TouchableOpacity className="absolute inset-0 bg-black/80" onPress={onClose} activeOpacity={1} />
                <BlurView intensity={80} tint="dark" className="h-[80%] rounded-t-[40px] overflow-hidden border-t border-white/10">
                    <View className="p-6 flex-row items-center justify-between border-b border-white/5">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 rounded-xl bg-white/10 overflow-hidden mr-3">
                                {agent?.avatar && <Image source={{ uri: agent.avatar }} className="h-full w-full" />}
                            </View>
                            <View>
                                <Text className="text-white font-bold">{agent?.name || 'Call History'}</Text>
                                <Text className="text-white/40 text-[10px] uppercase">Conversation Transcript</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-white/5">
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator color="#818cf8" />
                        </View>
                    ) : (
                        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                            {transcripts.length === 0 ? (
                                <View className="items-center justify-center py-20">
                                    <Text className="text-white/20 italic">No transcript recorded for this call.</Text>
                                </View>
                            ) : (
                                transcripts.map((entry: TranscriptEntry) => (
                                    <View key={entry._id} className={`mb-6 ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <View className="flex-row items-center mb-1 space-x-2">
                                            <Text className="text-white/20 text-[8px] font-bold uppercase tracking-tighter">
                                                {entry.role === 'user' ? 'You' : agent?.name || 'Agent'}
                                            </Text>
                                        </View>
                                        <View className={`max-w-[85%] p-4 rounded-3xl ${entry.role === 'user' ? 'bg-indigo-600 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'}`}>
                                            <Text className="text-white text-sm leading-5">{entry.message}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                            <View className="h-20" />
                        </ScrollView>
                    )}
                </BlurView>
            </View>
        </Modal>
    );
};
