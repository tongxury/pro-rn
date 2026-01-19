import {Modal, Text, View, ActivityIndicator, Platform, TouchableOpacity} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "@/i18n/translation";
import {useColors} from "@/hooks/uesColors";

const ProcessingModal = ({loading,}: { loading?: boolean, }) => {

    const {t} = useTranslation();

    const colors = useColors()

    return (
        <Modal visible={loading} transparent animationType="fade">
            {/* 半透明背景蒙层 */}
            <View className="flex-1 bg-[#000000bf] justify-center items-center px-8">
                {/* 内容卡片 */}
                <View
                    className="bg-cardBg rounded-2xl p-8 items-center"
                    style={{
                        ...Platform.select({
                            ios: {
                                shadowColor: "#000",
                                shadowOffset: {width: 0, height: 4},
                                shadowOpacity: 0.1,
                                shadowRadius: 12,
                            },
                            android: {
                                elevation: 8,
                            },
                        }),
                    }}
                >
                    {/* 加载动画 */}
                    <ActivityIndicator size="large" color={colors.primary}/>

                    {/* 主标题 */}
                    <Text className="text-xl font-bold text-grey0 mt-6">
                        {t("payment.paying")}
                    </Text>

                    {/* 辅助提示文案 */}
                    <Text className="text-base text-grey2 mt-2 text-center">
                        {t("payment.payingTip")}
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

export default ProcessingModal;
