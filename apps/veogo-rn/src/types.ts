import {ReactNode} from "react";

export interface Settings {
    scenes: Scene[];

    titleMaxLength?: number;
    bodyMaxLength?: number;

    prompts?: PromptConfig[];
}

export interface PromptConfig {
    promptId: string;
    maxFiles?: number;
    cost?: number;
}

export interface Scene {
    value: string;
    isPopular?: boolean;
    isNew?: boolean;
    description?: string;
    getSceneIcon: ({size, color,}: { size: number, color: string }) => ReactNode;

    [key: string]: any;
}

export interface Question {
    _id?: string;
    session?: Session;
    prompt?: {
        id: string;
        content?: string;
    };
    status?: 'created' | 'prepared' | 'generating' | 'completed' | string;

    [key: string]: any;
}

export interface Session {
    _id?: string;
    resources?: Resource[];

    [key: string]: any;

}

export interface Resource {
    [key: string]: any;

    id?: string;
    mimeType?: string;
    category?: string;
    uri?: string; // 本地文件路径
    url?: string;
    coverUrl?: string;
    name?: string;
    content?: string;
    meta?: {
        [key: string]: string;
    } | any;
}

export interface Account {
    _id?: string;
    platform?: string;
    nickname?: string;
    sign?: string;
    domain?: string[];
    followers?: string;
    posts?: string;
    interacts?: string;
    isDefault?: boolean;
    avatar?: string;
    lastUpdatedAt?: number;

    extra?: { [key: string]: any };
}

export interface User {
    id?: string;

    [key: string]: any;
}

// vip接口
export interface VipResponse {
    id: string;
    title: string;
    amount: number;
    months: number;
    creditPerMonth: number;
    unit: string;
    features: {
        coverAnalysisImages: number;
        analysisImages: number;
        preAnalysisImages: number;
        limitAnalysisImages: number;
        analysis: number;
        limitAnalysis: number;
        preAnalysis: number;
        duplicateScript: number;
    };
    // id: 'l1-month',
    // title: '1个月',
    // amount: 38,
    // months: 1,
    // creditPerMonth: 500,
    // unit: "单月",
    // features: {
    //     coverAnalysisImages: 16,
    //     analysisImages: 25,
    //     preAnalysisImages: 25,
    //     limitAnalysisImages: 25,
    //     analysis: 12,
    //     limitAnalysis: 12,
    //     preAnalysis: 6,
    //     duplicateScript: 6
    // }
}

// 更新接口
export interface StoreVersion {
    version: string;
    forceUpdate: boolean;
    description: string;
    downloadUrl: {
        ios: string;
        android: string;
        fallbackIos?: string; // App Store 网页版链接
        fallbackAndroid?: string; // Play Store 网页版链接
    };
}
