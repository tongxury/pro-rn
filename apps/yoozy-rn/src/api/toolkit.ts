import instance from "@/providers/api";

export function getDouyinVideoUrl(params: { url?: string }) {
  return instance.request<any>({
    url: "/api/tk/toolkits",
    method: "POST",
    data: {
      method: "getDouyinVideoUrl",
      params: {
        url: params.url,
      },
    },
  });
}

const toolkit = {
    getDouyinVideoUrl
};

export default toolkit;
