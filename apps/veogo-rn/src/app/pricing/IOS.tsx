import React, {useEffect, useState, useCallback} from "react";
import {Alert, InteractionManager, View, Text} from "react-native";
import Meta from "@/app/pricing/MetaSub";
import {callbackApple} from "@/api/payment";
import {useTranslation} from "@/i18n/translation";
import {useRouter} from "expo-router";
import {useIAP} from 'expo-iap';
import ProcessingModal from "@/app/pricing/ProcessingModal";
import usePricing from "@/hooks/usePricing";

const IOS = () => {
    const {
        connected,
        products,
        subscriptions,
        currentPurchase,
        currentPurchaseError,
        getProducts,
        getSubscriptions,
        requestPurchase,
        finishTransaction,
        validateReceipt,
    } = useIAP();

    const {t} = useTranslation();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {plans, packages} = usePricing()

    // 初始化商品和订阅
    useEffect(() => {
        if (!connected) return;

        const initializeIAP = async () => {
            try {
                await getProducts(packages.map(x => x.iosAlias));
                await getSubscriptions(plans.map(x => x.iosAlias));
                setIsReady(true);
            } catch (error) {
                console.error('Error initializing IAP:', error);
            }
        };

        void initializeIAP();
    }, [connected, getProducts, getSubscriptions]);

    // 处理购买流程
    const handlePurchaseUpdate = async (purchase: any, isConsumable: boolean) => {
        try {
            setIsLoading(true);
            // const productId = purchase.id;

            // // 校验收据
            // const validationResult = await handleValidateReceipt(productId);
            //
            // if (validationResult.isValid) {
            // 完成交易
            const ok = await finishTransaction({
                purchase,
                isConsumable, // 你的商品如果是一次性消耗品可设为true
            });


            if (ok) {
                // 通知后端
                await callbackApple({
                    // productId: productId.replace("com_veogo_", "").replace("_", "-"),
                    productId: '',
                    transactionId: purchase.transactionId,
                    transactionReceipt: purchase.transactionReceipt,
                    purchaseToken: purchase.purchaseToken,
                });

                // 成功提示
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert('购买成功', '您的购买已完成！');
                    router.back();
                });

            } else {
                InteractionManager.runAfterInteractions(() => {
                    Alert.alert('购买失败', '请重试');
                });

            }

            // } else {
            //     Alert.alert('验证失败', '购买未通过验证，请联系客服。');
            //     setPayStart(0);
            // }
        } catch (error) {
            console.error('Error handling purchase:', error);
            Alert.alert('错误', '处理购买时出错。');
        } finally {
            setIsLoading(false);
        }
    };

    // 发起购买
    const onPay = async (selectedPackage: any) => {
        if (!connected || !isReady || !products || products.length === 0) {
            Alert.alert('错误', '内购服务未就绪，请稍后重试。');
            return;
        }

        // const sku = "com_veogo_" + selectedPackage.id.replaceAll("-", "_");

        // console.log(sku);

        try {
            setIsLoading(true);

            const currentPurchase = await requestPurchase({
                // request: {ios: {sku}},
                request: {sku: selectedPackage.iosAlias},
                type: selectedPackage?.recurring ? 'subs' : 'inapp'
            });

            void handlePurchaseUpdate(currentPurchase, !selectedPackage?.recurring);

        } catch (error) {
            setIsLoading(false);
            Alert.alert('购买失败', '购买请求失败，请重试。');
            console.error('Purchase request failed:', error);
        }
    };

    return (
        <>
            <Meta onSubmit={onPay}
                  disabled={!connected || !isReady || !products || products.length === 0}/>
            <ProcessingModal loading={isLoading}/>
        </>
    );
};

export default IOS;
