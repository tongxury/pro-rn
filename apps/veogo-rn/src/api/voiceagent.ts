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

export const createAgent = (data: { 
    name: string, 
    systemPrompt: string, 
    voiceId?: string,
    avatar?: string, 
    desc?: string,
    defaultSceneId?: string,
    isPublic?: boolean,
}) => {
    return instance.request<Agent>({
        url: "/api/va/agents",
        method: "POST",
        data,
    });
};

export const updateAgent = (id: string, data: Partial<Agent>) => {
    return instance.request<Agent>({
        url: `/api/va/agents/${id}`,
        method: "PATCH",
        data,
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

export const updateConversation = (id: string, data: { status?: string, conversationId?: string }) => {
    return instance.request<Conversation>({
        url: `/api/va/conversations/${id}`,
        method: "PATCH",
        data,
    });
};

export const listVoices = (params: { owner?: string } = {}) => {
    return instance.request<{ list: Voice[] }>({
        url: "/api/va/voices",
        params,
    });
};

export const addVoice = (data: { name: string, sampleUrl: string, type?: string }) => {
    return instance.request<Voice>({
        url: "/api/va/voices",
        method: "POST",
        data,
    });
};

export const listConversations = (params: { page?: number, size?: number } = {}) => {
    return instance.request<{ list: Conversation[], total: number }>({
        url: "/api/va/conversations",
        params,
    });
};

export const listTranscriptEntries = (conversationId: string) => {
    return instance.request<{ list: TranscriptEntry[] }>({
        url: `/api/va/conversations/${conversationId}/transcripts`,
    });
};

export const recordTranscriptEntry = (data: { conversationId: string, role: string, message: string }) => {
    return instance.request<TranscriptEntry>({
        url: "/api/va/transcripts",
        method: "POST",
        data,
    });
};

export const sendMessage = (data: { conversationId: string, message: string, enableVoice?: boolean }) => {
    return instance.request<TranscriptEntry>({
        url: "/api/va/messages",
        method: "POST",
        data,
    });
};
