import instance from "@/providers/api";

export const fetchCommodities = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities`,
    params,
  });
};

export const createCommodities = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities`,
    method: "POST",
    data: params,
  });
};

export const deleteCommodities = async (id: string) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities/${id}`,
    method: "PATCH",
    data: {
      action: "delete"
    },
  });
};

export const getCommodity = async (id: string) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities/${id}`,
  });
};
