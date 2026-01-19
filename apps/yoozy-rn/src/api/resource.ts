import instance from "@/providers/api";

export const getTemplate = async (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/proj/v2/templates/${params.id}`,
    params,
  });
};

export interface InspirationSegment {
  _id: string;
  root: {
    url: string;
    coverUrl: string;
    commodity?: {
      name: string;
      tags: string[];
      brand?: string;
      coverUrl?: string;
    };
  };
  author?: {
    name: string;
    avatar?: string;
  };
  style?: string;
  contentStyle?: string;
  sceneStyle?: string;
  description: string;
  shootingStyle?: string;
  timeEnd?: number;
  subtitle?: string;
  typedTags?: Record<string, string[]>;
  tags: string[];
  highlightFrames?: { timestamp: number; desc: string; url: string }[];
  status: string;
  createdAt: number;
  segments?: {
    description: string;
    timeStart?: number;
    timeEnd: number;
    startFrame: string;
    endFrame: string;
  }[];
  extra?: any;
}

export const getTemplateSegment = async (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/am/v2/resource-segments/${params.id}`,
    params,
  });
};

export const listResourceSegments = async (params: any) => {
  return instance.request<any>({
    url: `/api/am/v2/resource-segments`,
    params,
  });
};

export const listItems = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v2/public-templates`,
    params,
  });
};


export const listPublicTemplates = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v2/public-templates`,
    params
  });
};