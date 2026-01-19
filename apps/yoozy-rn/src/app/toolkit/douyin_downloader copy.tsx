import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useToast } from 'react-native-toast-notifications';

import ScreenContainer from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import VideoPlayer from '@/components/VideoPlayer';
import useTailwindVars from '@/hooks/useTailwindVars';
import { getDouyinVideoUrl } from '@/api/toolkit';
import { extractLink } from '@/utils/url';
import Button from '@/components/ui/Button';
import { ResizeMode } from 'react-native-video';

const DouyinDownloader = () => {
    const { colors } = useTailwindVars();
    const toast = useToast();
    const [inputUrl, setInputUrl] = useState('');
    const [videoData, setVideoData] = useState<{ url: string; title?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const extractMutation = useMutation({
        mutationFn: async (url: string) => {
            const extracted = extractLink(url);
            if (!extracted) throw new Error('未发现有效的抖音链接');
            
            const res = await getDouyinVideoUrl({ url: extracted });
            const data = res.data?.data || res.data;
            
            if (data && (data.url || data.video_url)) {
                return {
                    url: data.url || data.video_url,
                    title: data.title || data.desc || ''
                };
            }
            throw new Error('解析失败，请检查链接是否正确');
        },
        onSuccess: (data) => {
            setVideoData(data);
            Keyboard.dismiss();
            toast.show('解析成功', { type: 'success' });
        },
        onError: (error: any) => {
            Alert.alert('提示', error.message || '解析失败，请稍后重试');
        }
    });

    const handlePaste = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) setInputUrl(text);
    };

    const handleSaveVideo = async () => {
        if (!videoData?.url) return;

        try {
            setIsSaving(true);
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限不足', '请在设置中开启相册权限以保存视频');
                return;
            }

            const fileUri = `${FileSystem.cacheDirectory}douyin_${Date.now()}.mp4`;
            toast.show('正在下载...', { id: 'dl' });
            
            const downloadRes = await FileSystem.downloadAsync(videoData.url, fileUri);
            
            if (downloadRes.status === 200) {
                await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
                toast.hide('dl');
                toast.show('已存入相册', { type: 'success' });
            } else {
                throw new Error('下载异常');
            }
        } catch (error) {
            toast.hide('dl');
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
        <ScreenContainer edges={['top']}>
            <ScreenHeader title="抖音去水印下载" />
            
            <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
                <View className="mt-4">
                    <Text className="text-muted-foreground text-xs mb-3">
                        粘贴包含抖音链接的分享文案即可自动识别
                    </Text>
                    
                    <View className="bg-muted rounded-2xl p-4 min-h-[120px] relative border border-transparent focus:border-primary">
                        <TextInput
                            className="flex-1 text-foreground text-base leading-6"
                            placeholder="请粘贴抖音分享链接..."
                            placeholderTextColor={colors['muted-foreground']}
                            multiline
                            textAlignVertical="top"
                            value={inputUrl}
                            onChangeText={setInputUrl}
                        />
                        {inputUrl.length > 0 && (
                            <TouchableOpacity 
                                onPress={clearInput}
                                className="absolute right-3 top-3 w-8 h-8 items-center justify-center bg-gray-200/50 rounded-full"
                            >
                                <Feather name="x" size={16} color={colors.foreground} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity 
                            onPress={handlePaste}
                            className="flex-1 h-12 flex-row items-center justify-center bg-muted rounded-xl"
                        >
                            <Feather name="clipboard" size={18} color={colors.primary} />
                            <Text className="ml-2 text-primary font-bold">粘贴链接</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => extractMutation.mutate(inputUrl)}
                            disabled={!inputUrl || extractMutation.isPending}
                            className={`flex-[1.5] h-12 flex-row items-center justify-center rounded-xl ${
                                !inputUrl || extractMutation.isPending ? 'bg-primary/40' : 'bg-primary shadow-lg shadow-primary/20'
                            }`}
                        >
                            {extractMutation.isPending ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Feather name="zap" size={18} color="white" />
                                    <Text className="ml-2 text-white font-bold text-base">开始解析</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {videoData && (
                    <View className="mt-10 mb-10">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-5 bg-primary rounded-full mr-2" />
                            <Text className="text-foreground text-lg font-bold">解析结果</Text>
                        </View>

                        <View className="bg-card rounded-3xl overflow-hidden border border-muted/50 shadow-sm">
                            <View className="aspect-[9/16] w-full bg-black">
                                <VideoPlayer 
                                    videoUrl={videoData.url}
                                    shouldLoop
                                    autoPlay={false}
                                    resizeMode={ResizeMode.CONTAIN}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            
                            <View className="p-5">
                                {videoData.title && (
                                    <Text className="text-foreground text-base font-bold mb-4" numberOfLines={2}>
                                        {videoData.title}
                                    </Text>
                                )}
                                
                                <Button
                                    onPress={handleSaveVideo}
                                    loading={isSaving}
                                    style={{ height: 48, borderRadius: 12 }}
                                >
                                    <View className="flex-row items-center justify-center">
                                        <Feather name="download" size={20} color="white" />
                                        <Text className="ml-2 text-white font-bold text-base">保存视频到相册</Text>
                                    </View>
                                </Button>
                                
                                <TouchableOpacity 
                                    onPress={() => {
                                        Clipboard.setStringAsync(videoData.url);
                                        toast.show('链接已复制', { type: 'success' });
                                    }}
                                    className="mt-3 py-3 items-center"
                                >
                                    <Text className="text-muted-foreground text-xs underline">复制视频直链</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/10 mb-20">
                    <Text className="text-primary font-bold mb-3 flex-row items-center">
                        <Ionicons name="information-circle" size={16} color={colors.primary} /> 温馨提示
                    </Text>
                    <Text className="text-muted-foreground text-[13px] leading-5">
                        • 解析后的视频不含抖音水印 {"\n"}
                        • 保持原片高清画质 {"\n"}
                        • 若解析失败，请尝试刷新链接
                    </Text>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
};

export default DouyinDownloader;
