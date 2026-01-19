import { createSession } from "@/api/session";
import CommoditySelector from "@/components/commodity/Selector";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "react-native-toast-notifications";

const Starter = () => {
    const { colors } = useTailwindVars();
    const [confirmItem, setConfirmItem] = useState<any>(null);

    const handleConfirm = async () => {
        if (!confirmItem?._id) return;

        const item = confirmItem;
        setConfirmItem(null);

        try {
            const payload: any = {
                commodityId: item._id,
            };

            const session = await createSession(payload);
            if (session?.data?.data?._id) {
                // router.replace(`/session/${session.data.data._id}`);
            } else {
                Toast.show("创建会话失败");
            }
        } catch (error) {
            console.error(error);
            Toast.show("创建会话失败，请重试");
        }
    };

    return (
        <ScreenContainer
            stackScreenProps={{
                animation: "fade",
                animationDuration: 1,
            }}
        >
            {/* Header - Dynamic Colors */}
            <ScreenHeader title="复刻灵感" />
            {/* Main Content Area - White Rounded Panel */}
            <View
                className="flex-1 rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: colors.background
                }}
            >
                <CommoditySelector
                    value={confirmItem}
                    onChange={(item) => setConfirmItem(item)}
                />
            </View>

            {/* Note Text */}
            <Text
                style={{
                    fontSize: 12,
                    color: colors['muted-foreground'],
                    textAlign: "center",
                }}
            >
                视频每秒消耗1积分, 实际消耗与最终输出的视频时长相关
            </Text>

            {/* Confirmation Modal */}
            <Modal
                transparent
                visible={!!confirmItem}
                animationType="fade"
                onRequestClose={() => setConfirmItem(null)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPress={() => setConfirmItem(null)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            width: '80%',
                            backgroundColor: colors.background,
                            borderRadius: 20,
                            padding: 24,
                            alignItems: 'center',
                        }}
                    >
                        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>开启创作</Text>

                        <Text className="text-center text-sm leading-6 mb-6" style={{ color: colors['muted-foreground'] }}>
                            是否使用商品
                            <Text className="font-bold" style={{ color: colors.foreground }}>{`【${confirmItem?.title || "未命名商品"}】`}</Text>
                            {"\n"}开启视频创作？
                        </Text>

                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity
                                className="flex-1 py-3 rounded-xl items-center justify-center"
                                style={{ backgroundColor: colors.muted }}
                                onPress={() => setConfirmItem(null)}
                            >
                                <Text className="font-bold" style={{ color: colors['muted-foreground'] }}>取消</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 py-3 rounded-xl items-center justify-center"
                                style={{ backgroundColor: colors.primary }}
                                onPress={handleConfirm}
                            >
                                <Text className="font-bold text-[white]">确认</Text>
                            </TouchableOpacity>
                        </View>

                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ScreenContainer>
    );
};

export default Starter;
