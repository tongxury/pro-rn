import instance from "@/providers/api";
import { runOnUIImmediately } from "react-native-reanimated/lib/typescript/threads";


export const updatePrompt = async (params: { id: string }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflow/${params.id}`,
        method: "PATCH",
        data: {
            action: "updatePrompt",
        },
    });
}



export const cancelWorkflow = async (params: { id: string }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}`,
        method: "PATCH",
        data: {
            action: "cancel",
        },
    });
}



export const retryWorkflowJob = async (params: { id: string, index: number }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}/jobs/${params.index || 0}`,
        method: "PATCH",
        data: {
            action: "retry",
            params: {
            }
        },
    });
}

export const backWorkflowJob = async (params: { id: string, index: number }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}/jobs/${params.index || 0}`,
        method: "PATCH",
        data: {
            action: "back",
            params: {
            }
        },
    });
}



export const confirmWorkflowJob = async (params: { id: string, index: number, runImmediately?: boolean }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}/jobs/${params.index || 0}`,
        method: "PATCH",
        data: {
            action: "confirm",
            runImmediately: params.runImmediately,
        },
    });
}



export const updateWorkflowJob = async (params: { id: string, index: number, dataKey: string, data: any }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}/jobs/${params.index || 0}`,
        method: "PATCH",
        data: {
            action: "updateData",
            dataKey: params.dataKey,
            data: params.data,
        },
    });
}





export const updateWorkflowJobData = async (params: { id: string, name: string, data: any }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}/job-data/${params.name}`,
        method: "PATCH",
        data: params,
    });
}

export const updateWorkflowSettings = async (params: { id: string, data: any }) => {
    return instance.request<any>({
        url: `/api/proj/v1/workflows/${params.id}`,
        method: "PATCH",
        data: {
            action: "updateSettings",
            data: params.data,
        },
    });
}
