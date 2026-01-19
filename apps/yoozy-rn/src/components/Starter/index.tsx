import CommodityInput from "@/components/CommodityInput";
import Modal from "@/components/ui/Modal";
import { useTranslation } from "@/i18n/translation";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export default function Starter(
    {
        visible,
        onClose,
    }: {
        visible?: boolean;
        onClose?: () => void;
    }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;


    const { t } = useTranslation();

    // 添加淡入动画
    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);


    const onConfirm = async (params: { url: string, target: string, images: string[] }) => {
        console.log("onConfirm", params);

        // createSession({url: params.url, images: params.images}).then((res) => {
        //     router.navigate(`/session/${res?.data?.data?._id!}`);
        // })
        //

        // const session = await createSession({url: params.url, images: params.images})
        // const question = await createQuestion({url: params.url, images: params.images})

        router.navigate("/session/68f9e7e52d0fcf1f344ca418")
        // router.navigate("/user/me")
    }


    return (
        <Modal
            visible={visible}
            onClose={onClose}
            position="bottom"
        >
            <View className="mb-6 px-[20px]">
                <Text className="text-2xl font-bold text-white mb-2">{'输入商品信息'}</Text>
                <Text className="text-sm text-white/60">{t("selectSceneSubtitle")}</Text>
            </View>

            <CommodityInput onConfirm={onConfirm} />
        </Modal>
    );
}
