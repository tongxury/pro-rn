import instance from "@/providers/api";

export const fetchCreditState = async (params: any) => {
    return instance.request<any>({
        url: `/api/crd/credit-states`,
        params
    });
};
