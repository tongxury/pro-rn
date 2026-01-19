import { createCommodities } from "@/api/commodity";
import SpinningIcon from "@/components/loading";
import Picker from "@/components/PickerV2";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { upload } from "@/utils/upload/tos";
import { extractLinks, getImageName } from "@/utils/upload/utils";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-notifications";

export default function CreateCommodityScreen() {
    const { colors } = useTailwindVars();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    const [files, setFiles] = useState<any[]>([]);
    const [text, setText] = useState("");

    const isDisabled = !files.length && !(extractLinks(text).length > 0);

    const { mutate: createCommodity, isPending } = useMutation({
        mutationFn: createCommodities,
        onSuccess: (res) => {
            if (res.data?.code) {
                Toast.show(res.data.message || "创建失败");
                return;
            }
            Toast.show("商品创建成功");
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
        try {
            const medias = [];
            if (files?.length) {
                for (let file of files) {
                    const url = await upload(file);
                    if (url) {
                        medias.push({
                            mimeType: file.type || "image/jpeg",
                            name: getImageName(file.uri),
                            url: url,
                        });
                    }
                }
            }

            const urls = extractLinks(text);

            createCommodity({
                url: urls[0],
                medias: medias?.length ? medias : undefined,
                // description: text // Optional: send full text as description? Or just rely on URL
            });

        } catch (e) {
            console.error(e);
            Toast.show("上传资源失败");
        }
    };

    return (
        <ScreenContainer edges={['top']}>
            <ScreenHeader title="创建商品" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="gap-8">
                        {/* Media Section */}
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2 px-1">
                                <View className="w-1 h-4 bg-primary rounded-full" />
                                <Text className="text-base font-bold text-foreground">上传素材</Text>
                                <Text className="text-xs text-muted-foreground ml-auto">支持图片/视频</Text>
                            </View>
                            <View className="bg-card rounded-[24px] p-5 border border-border/50 shadow-sm shadow-black/5">
                                <Picker files={files} onFilesChange={setFiles} />
                            </View>
                        </View>

                        {/* Link/Text Section */}
                        <View className="gap-3">
                            <View className="flex-row items-center gap-2 px-1">
                                <View className="w-1 h-4 bg-primary rounded-full" />
                                <Text className="text-base font-bold text-foreground">商品信息</Text>
                            </View>
                            <View className="bg-card rounded-[24px] overflow-hidden border border-border/50 shadow-sm shadow-black/5">
                                <TextInput
                                    value={text}
                                    onChangeText={setText}
                                    placeholder="粘贴商品链接，系统将自动抓取；或直接输入详细的商品描述、卖点信息..."
                                    placeholderTextColor={colors['muted-foreground']}
                                    multiline
                                    className="text-base text-foreground leading-7 min-h-[160px] px-5 py-5"
                                    textAlignVertical="top"
                                    style={{ color: colors.foreground }}
                                />
                            </View>
                            {/* <View className="flex-row items-start gap-2 px-2 opacity-60">
                                <Feather name="info" size={14} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                                <Text className="flex-1 text-xs text-muted-foreground leading-5">
                                    我们将自动分析您提供的图片、视频或商品链接，智能提取特征并为您生成专属的营销短视频。
                                </Text>
                            </View> */}
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>

            {/* Bottom Action Bar */}
            <View
                className="px-5 absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/5"
                style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 16 }}
            >
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={isDisabled || isPending}
                    className="w-full h-[52px] rounded-full flex-row items-center justify-center gap-2 shadow-lg"
                    style={{
                        backgroundColor: isDisabled ? colors.muted : colors.primary,
                        shadowColor: isDisabled ? 'transparent' : colors.primary,
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 }
                    }}
                    activeOpacity={0.85}
                >
                    {isPending ? (
                        <SpinningIcon name="circle-notch" size={20} color={isDisabled ? colors['muted-foreground'] : 'white'} />
                    ) : (
                        <>
                            <Feather name="plus" size={20} color={isDisabled ? colors['muted-foreground'] : 'white'} />
                            <Text
                                className="text-lg font-bold"
                                style={{ color: isDisabled ? colors['muted-foreground'] : 'white' }}
                            >
                                立即创建
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}
