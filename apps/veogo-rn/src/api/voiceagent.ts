import instance from "@/providers/api";
import { Agent, Voice, VoiceScene, Conversation, TranscriptEntry } from "@/types";

export const listAgents = (params: { page?: number, size?: number, category?: string } = {}) => {
    return instance.request<{ list: Agent[], total: number }>({
        url: "/api/va/agents",
        params,
    });
};

export const getAgent = (id: string) => {
    return instance.request<Agent>({
        url: `/api/va/agents/${id}`,
    });
};

export const listScenes = (params: {} = {}) => {
    return instance.request<{ list: VoiceScene[] }>({
        url: "/api/va/scenes",
        params,
    });
};

export const createConversation = (data: { agentId: string, sceneId?: string }) => {
    return instance.request<Conversation>({
        url: "/api/va/conversations",
        method: "POST",
        data,
    });
};

export const listVoices = () => {
    return instance.request<{ list: Voice[] }>({
        url: "/api/va/voices",
    });
};

export const listConversations = (params: { page?: number, size?: number } = {}) => {
    return instance.request<{ list: Conversation[], total: number }>({
        url: "/api/va/conversations",
        params,
    });
};

export const sendMessage = (data: { conversationId: string, message: string, enableVoice?: boolean }) => {
    return instance.request<TranscriptEntry>({
        url: "/api/va/messages",
        method: "POST",
        data,
    });
};
