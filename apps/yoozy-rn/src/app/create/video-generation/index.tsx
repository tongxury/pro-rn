import { createAssetV3 } from "@/api/asset";
import { createCommodities } from "@/api/commodity";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import Uploader from "@/components/Uploader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { upload } from "@/utils/upload/tos";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Toast } from "react-native-toast-notifications";

export default function VideoGenerationScreen() {
    const { colors } = useTailwindVars();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [prompt, setPrompt] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const { mutate: createCommodity, isPending } = useMutation({
        mutationFn: createCommodities,
        onSuccess: (res) => {
            if (res.data?.code) {
                Toast.show(res.data.message || "创建失败");
                return;
            }
            Toast.show("创建成功");
            queryClient.invalidateQueries({ queryKey: ["commodities-list"] });
            router.back();
        },
        onError: (error: any) => {
            Toast.show("创建失败，请稍后重试");
            console.error(error);
        },
    });

    const handleCreate = async () => {
        Keyboard.dismiss();
        if (!prompt && !files.length) {
            Toast.show("请输入描述或上传素材");
            return;
        }

        setIsUploading(true);
        try {
            const medias = [];
            if (files?.length) {
                for (let file of files) {
                    const url = await upload({ uri: file.uri, type: file.type || 'image/jpeg', name: file.fileName || 'upload.jpg' });
                    if (url) {
                        medias.push(url);
                    }
                }
            }

            const res = await createAssetV3({
                prompt: prompt,
                images: medias,
            });

            if (res?.data?.data?._id) {
                router.replace(`/asset/${res.data.data._id}`);
            } else {
                Toast.show("创建会话失败");
            }

        } catch (e) {
            console.error(e);
            Toast.show("上传资源失败");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScreenContainer stackScreenProps={{
            animation: "fade_from_bottom",
            animationDuration: 100,
        }}>
            {/* Header */}
            <ScreenHeader title="智能生视频" />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <ScrollView
                    className="flex-1 px-5 pt-2"
                    // contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Card */}
                    <View
                        className="w-full rounded-2xl p-6 border border-border"
                        style={{ minHeight: 420 }}
                    >
                        {/* Upload Area */}
                        <Uploader files={files} onChange={setFiles} maxFiles={1} />


                        {/* Input */}
                        <TextInput
                            multiline
                            placeholder="描述你想要的视频画面。例如：主角公美短猫是一只直立行走的拟人化猫，它穿着工装裤..."
                            placeholderTextColor={colors['muted-foreground'] + '80'}
                            style={{
                                color: colors.foreground,
                                fontSize: 16,
                                lineHeight: 26,
                                minHeight: 180,
                                textAlignVertical: 'top',
                                marginBottom: 20
                            }}
                            value={prompt}
                            onChangeText={setPrompt}
                        />

                        {/* Spacer */}
                        <View className="flex-1" />

                        {/* Actions */}
                        <View className="flex-row items-center justify-between mt-auto pt-4">
                            <View className="flex-row gap-3">
                                {/* <TouchableOpacity
                                    className="flex-row items-center px-4 py-2.5 rounded-full bg-muted/50"
                                    activeOpacity={0.7}
                                    style={{ backgroundColor: colors.muted }}
                                >
                                    <Ionicons name="musical-notes" size={14} color={colors.foreground} />
                                    <Text className="text-xs font-bold ml-1.5" style={{ color: colors.foreground }}>复刻视频</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-row items-center px-4 py-2.5 rounded-full bg-muted/50"
                                    activeOpacity={0.7}
                                    style={{ backgroundColor: colors.muted }}
                                >
                                    <Feather name="sliders" size={14} color={colors.foreground} />
                                    <Text className="text-xs font-bold ml-1.5" style={{ color: colors.foreground }}>设置</Text>
                                </TouchableOpacity> */}
                            </View>

                            {/* Send */}
                            <TouchableOpacity
                                onPress={handleCreate}
                                activeOpacity={0.8}
                                disabled={isUploading || isPending}
                                className="w-12 h-12 rounded-full items-center justify-center"
                                style={{ backgroundColor: colors.foreground }}
                            >
                                {(isUploading || isPending) ? (
                                    <ActivityIndicator color={colors.background} />
                                ) : (
                                    <Ionicons name="arrow-up" size={24} color={colors.background} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer Info */}
                    {/* <Text className="text-center text-xs mt-6 opacity-40 px-4 leading-5" style={{ color: colors.foreground }}>
                        视频每秒消耗1积分，实际消耗与最终输出的视频时长相关
                    </Text> */}
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}
