import instance from "@/providers/api";

export const createAssetV2 = async (params: {
    commodityId: string,
    segmentId?: string,
    workflowName?: string,
}) => {
    return instance.request<any>({
        url: "/api/proj/v2/assets",
        method: "POST",
        data: params,
    });
};


export const createAssetV3 = async (params: {
    prompt: string,
    images?: string[],
}) => {
    return instance.request<any>({
        url: "/api/proj/v3/assets",
        method: "POST",
        data: params,
    });
};



export const listAssets = async (params: { page?: number, [key: string]: any }) => {
    return instance.request<any>({
        url: `/api/proj/v2/assets`,
        params: params
    });
};

export const getAsset = async (params: { id: string }) => {
    return instance.request<any>({
        url: `/api/proj/v2/assets/${params.id}`,
        method: "GET",
    });
};


