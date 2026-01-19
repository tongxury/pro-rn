import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'react-native-toast-notifications';
import { useRouter } from 'expo-router';

import VideoPlayer from '@/components/VideoPlayer';
import useTailwindVars from '@/hooks/useTailwindVars';
// import toolkit from '../../api/toolkit';
import { extractLink } from '@/utils/url';
import { ResizeMode } from 'react-native-video';
import instance from "@/providers/api";
import ScreenContainer from '@/components/ScreenContainer';

const getDouyinVideoUrl = (params: { url?: string }) => {
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
};

const DouyinDownloader = () => {
    const { colors } = useTailwindVars();
    const toast = useToast();
    const router = useRouter();
    
    const [inputUrl, setInputUrl] = useState('');
    const [videoData, setVideoData] = useState<{ url: string; title?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Extraction Logic
    const extractMutation = useMutation({
        mutationFn: async (url: string) => {
            const extracted = extractLink(url);
            if (!extracted) throw new Error('未发现有效的抖音链接');
            
            const res = await getDouyinVideoUrl({ url: extracted });

            if (res.data?.code) throw new Error(res.data?.message || '解析失败，该链接可能已失效或暂不支持');

            const data = res.data?.data || res.data;
            
            if (data && (data.url || data.video_url)) {
                return {
                    url: data.url || data.video_url,
                    title: data.title || data.desc || ''
                };
            }
            throw new Error('解析失败，该链接可能已失效或暂不支持');
        },
        onSuccess: (data) => {
            setVideoData(data);
            Keyboard.dismiss();
            toast.show('解析成功', { type: 'success' });
        },
        onError: (error: any) => {
            Alert.alert('提示', error.message || '系统繁忙，请稍后再试');
        }
    });

    const handlePaste = async () => {
        try {
            const text = await Clipboard.getStringAsync();
            if (text) setInputUrl(text);
        } catch (e) {
            // Ignore clipboard errors
        }
    };

    const handleSaveVideo = async () => {
        if (!videoData?.url) return;

        try {
            setIsSaving(true);
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限提示', '请在系统设置中开启相册权限以保存视频');
                return;
            }

            const filename = `yoozy_douyin_${Date.now()}.mp4`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            toast.show('下载中...', { id: 'downloading' });
            
            const downloadRes = await FileSystem.downloadAsync(videoData.url, fileUri);
            
            if (downloadRes.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
                toast.hide('downloading');
                toast.show('已存入系统相册', { type: 'success' });
            } else {
                throw new Error('下载失败');
            }
        } catch (error) {
            toast.hide('downloading');
            toast.show('保存失败', { type: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    const clearInput = () => {
        setInputUrl('');
        setVideoData(null);
    };

    return (
        <ScreenContainer  stackScreenProps={{
            animation: "fade_from_bottom",
            animationDuration: 100,
        }} edges={['top']}>
            {/* Custom Header - Replicates ScreenHeader without the Navigation Context issue */}
            <View className="px-5 pb-4 flex-row justify-between items-center">
                <Text className="text-[22px] font-bold" style={{ color: colors.foreground }}>抖音去水印下载</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ width: 32, height: 32, justifyContent: "center", alignItems: "center" }}
                >
                    <MaterialCommunityIcons name="arrow-collapse" size={25} color={colors.foreground} />
                </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View className="mt-2 mb-6">
                    <View className="flex-row items-center mb-4">
                        {/* <Text className="text-foreground text-lg font-black">抖音去水印下载</Text> */}
                    </View>
                    
                    <View className="bg-muted rounded-[24px] p-5 min-h-[140px] relative border-2 border-transparent focus:border-primary shadow-sm">
                        <TextInput
                            className="flex-1 text-foreground text-base leading-6"
                            placeholder="粘贴抖音分享文案，系统将自动识别并提取无水印视频..."
                            placeholderTextColor={colors['muted-foreground']}
                            multiline
                            textAlignVertical="top"
                            value={inputUrl}
                            onChangeText={setInputUrl}
                            editable={!extractMutation.isPending}
                        />
                        {inputUrl.length > 0 && !extractMutation.isPending && (
                            <TouchableOpacity 
                                onPress={clearInput}
                                className="absolute right-4 top-4 w-8 h-8 items-center justify-center bg-gray-200/50 rounded-full"
                            >
                                <Feather name="x" size={16} color={colors.foreground} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row gap-4 mt-6">
                        <TouchableOpacity 
                            onPress={handlePaste}
                            activeOpacity={0.8}
                            className="flex-1 h-14 flex-row items-center justify-center bg-muted rounded-2xl border border-muted-foreground/5"
                        >
                            <Feather name="clipboard" size={20} color={colors.primary} />
                            <Text className="ml-2 text-primary font-bold text-base">粘贴链接</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => extractMutation.mutate(inputUrl)}
                            disabled={!inputUrl || extractMutation.isPending}
                            activeOpacity={0.9}
                            className={`flex-[2] h-14 flex-row items-center justify-center rounded-2xl shadow-lg ${
                                !inputUrl || extractMutation.isPending ? 'bg-primary/40' : 'bg-primary shadow-primary/30'
                            }`}
                        >
                            {extractMutation.isPending ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Feather name="zap" size={20} color="white" />
                                    <Text className="ml-2 text-white font-bold text-lg">开始解析</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {videoData && (
                    <View className="mt-4 mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-5 bg-primary rounded-full mr-3" />
                            <Text className="text-foreground text-lg font-bold">解析结果</Text>
                        </View>

                        <View className="bg-card rounded-[32px] overflow-hidden border border-muted/50 shadow-xl">
                            <View className="aspect-[9/16] w-full bg-black">
                                <VideoPlayer 
                                    videoUrl={videoData.url}
                                    shouldLoop
                                    autoPlay={false}
                                    resizeMode={ResizeMode.CONTAIN}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            
                            <View className="p-6">
                                {videoData.title ? (
                                    <Text className="text-foreground text-base font-bold mb-6" numberOfLines={2}>
                                        {videoData.title}
                                    </Text>
                                ) : null}
                                
                                <TouchableOpacity
                                    onPress={handleSaveVideo}
                                    disabled={isSaving}
                                    activeOpacity={0.8}
                                    className={`h-14 rounded-2xl items-center justify-center bg-primary flex-row shadow-md ${isSaving ? 'opacity-70' : ''}`}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Feather name="download" size={22} color="white" />
                                            <Text className="ml-2 text-white font-bold text-lg">保存无水印视频</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    onPress={() => {
                                        Clipboard.setStringAsync(videoData.url);
                                        toast.show('已复制直链', { type: 'success' });
                                    }}
                                    className="mt-4 py-2 items-center"
                                >
                                    <Text className="text-gray-400 text-xs underline font-medium">复制视频下载直链</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View className="mt-6 p-6 bg-primary/5 rounded-[24px] mb-20 border border-primary/10">
                    <Text className="text-primary font-black mb-3 text-[15px]">💡 使用帮助</Text>
                    <Text className="text-muted-foreground text-[13px] leading-6">
                        • 复制抖音视频分享文案，粘贴到输入框即可 {"\n"}
                        • 提取成功后可直接保存无水印视频到手机相册 {"\n"}
                        • 如果解析失败，请检查链接是否在有效期内
                    </Text>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

export default DouyinDownloader;
