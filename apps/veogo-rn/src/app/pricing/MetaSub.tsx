import React, {useCallback, useMemo, useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {useTranslation} from "@/i18n/translation";
import Button from "@/components/ui/Button";
import {FlashIcon} from "@/constants/scene_icons";
import {useColors} from "@/hooks/uesColors";
import {useQuery} from "@tanstack/react-query";
import {fetchCreditState, fetchPaymentState} from "@/api/payment";
import {router, useFocusEffect} from "expo-router";
import {Grid} from "@/components/ui/Grid";
import useDateFormatter from "@/hooks/useDateFormatter";
import {LinearGradient} from 'expo-linear-gradient';
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import usePricing from "@/hooks/usePricing";
import Extra from "@/app/pricing/Extra";

const MetaSub = ({onSubmit, disabled}: {
    onSubmit: (plan: any) => void,
    disabled?: boolean
}) => {

    const {plans, packages} = usePricing()

    const [current, setCurrent] = useState<any>(plans[1]);
    const {t} = useTranslation();
    const {formatFromNow} = useDateFormatter()
    const [isAgreed, setIsAgreed] = useState(false);

    const colors = useColors()

    const {data: pr, isLoading: creditStateLoading, refetch: refetchCreditState} = useQuery({
        queryKey: ["creditState"],
        queryFn: fetchCreditState,
        // staleTime: 60 * 60 * 1000,
    });

    const {data: ps, isLoading: paymentStateLoading, refetch: refetchPaymentState} = useQuery({
        queryKey: ["paymentState"],
        queryFn: fetchPaymentState,
        // staleTime: 60 * 60 * 1000,
    });

    useFocusEffect(useCallback(() => {
        void refetchCreditState()
        void refetchPaymentState()
    }, []))

    const state = useMemo(() => pr?.data?.data, [pr])
    const paymentState = useMemo(() => ps?.data?.data, [ps])

    const submit = () => {
        onSubmit(current,)
    }

    if (creditStateLoading || paymentStateLoading) {

        return (
            <View style={{flex: 1, paddingHorizontal: 16, paddingVertical: 24, backgroundColor: '#000'}}>
                {/* 顶部余额信息区域 */}
                <View style={{alignItems: 'center', marginBottom: 32}}>
                    {/* 闪电图标 */}
                    <SkeletonLoader circle width={60} height={60} style={{marginBottom: 16}}/>
                    {/* 余额标签 */}
                    <SkeletonLoader width={80} height={20} style={{marginBottom: 8}}/>
                    {/* 余额数字 */}
                    <SkeletonLoader width={120} height={40} style={{marginBottom: 8}}/>

                </View>
                {/* 充值选项网格 */}
                <Grid data={[1, 1, 1, 1]} spacing={15} renderItem={item => (
                    <SkeletonLoader width={'100%'} height={100} style={{marginRight: 8}}/>
                )}/>
            </View>
        );
    }

    return (
        <>
            <LinearGradient
                colors={[colors.background, colors.background, colors.background,]} // 最后一个颜色设为透明
                style={{
                    flex: 1,
                }}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 0.5}}
            >
                <View className="flex-1 px-4 py-6">
                    <View className={'flex-1'}>
                        {/* 余额展示区域 */}
                        <View className="items-center mb-8">
                            <View
                                className="w-20 h-20 mb-4 rounded-full bg-background1 shadow-lg justify-center items-center">
                                <FlashIcon size={35} color={colors.primary}/>
                            </View>

                            <Text className="text-grey2 text-base mb-2">
                                {t('payment.balance')}
                            </Text>

                            <Text className="text-white text-5xl font-bold mb-2">
                                {state?.remaining || 0}
                            </Text>

                            {
                                state?.expireAt &&
                                <View className="bg-background1 px-4 py-2 rounded-full flex-row items-center">
                                    <Text className="text-grey2 text-sm">
                                        {t("payment.expireAt")}{formatFromNow(state?.expireAt)}
                                    </Text>
                                </View>
                            }

                            {
                                state?.show &&
                                <Text className="text-primary bg-primary/10 text-xl p-4 rounded-lg font-bold mb-2">
                                    付款后24小时内无条件全额退款，添加客服微信即可申请
                                </Text>
                            }
                        </View>

                        {
                            paymentState?.subscribingPlanId ?
                                <View className="gap-2 flex-1">
                                    <View className="bg-background1 rounded-2xl p-6 ">
                                        <View className="flex-row items-center justify-between mb-4">
                                            <Text className="text-white text-lg font-semibold">
                                                {t('payment.currentSubscription')}
                                            </Text>
                                            <View className="bg-primary/20 px-3 py-1 rounded-full">
                                                <Text className="text-primary text-sm font-medium">
                                                    {t('payment.active')}
                                                </Text>
                                            </View>
                                        </View>

                                        {(() => {
                                            const currentPlan = plans?.find(x => x.id === paymentState?.subscribingPlanId);
                                            return <View className="flex-row items-center">
                                                <View
                                                    className="w-12 h-12 bg-primary/20 rounded-xl items-center justify-center mr-4">
                                                    <FlashIcon size={24} color={colors.primary}/>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-white text-xl font-bold mb-1">
                                                        {currentPlan?.title}
                                                    </Text>
                                                    <Text className="text-grey2 text-sm">
                                                        ¥{currentPlan?.amount}/{t('payment.month')}
                                                    </Text>
                                                    {paymentState?.nextRenewalDate && (
                                                        <Text className="text-grey2 text-xs mt-1">
                                                            {t('payment.nextRenewal')}: {formatFromNow(paymentState.nextRenewalDate)}
                                                        </Text>
                                                    )}
                                                </View>

                                            </View>

                                        })()}

                                    </View>
                                    <Text className="text-white text-md font-bold mt-6">
                                        {t('payment.selectQuota')}
                                    </Text>
                                    <Extra onSubmit={onSubmit} disabled={disabled} style={{flex: 1}}/>
                                </View>
                                :
                                <View className={'flex-1'}>
                                    <View className={'flex-1'}>
                                        <Text className="text-white text-xl font-bold mb-6">
                                            {t('payment.selectSubQuota')}
                                        </Text>

                                        <Grid data={plans} spacing={15}
                                              renderItem={(option: any, index) => {
                                                  return (
                                                      <TouchableOpacity
                                                          key={option.id}
                                                          activeOpacity={0.8}
                                                          onPress={() => setCurrent(option)}
                                                          className={`p-2 pt-9 rounded-xl border-2 items-center relative ${
                                                              option.id === current?.id
                                                                  ? "border-primary bg-background1"
                                                                  : "border-grey4 bg-background1"
                                                          }`}
                                                      >
                                                          {option.tag && (
                                                              <View
                                                                  className="absolute top-1 right-1 bg-red-500 px-3 py-1 rounded-full">
                                                                  <Text className="text-white text-xs font-bold">
                                                                      {t(`payment.${option.tag}`)}
                                                                  </Text>
                                                              </View>
                                                          )}

                                                          <View className="flex-row items-center mb-3 gap-0.5">
                                                              {/*<FlashIcon size={20} color={colors.primary}/>*/}
                                                              <Text
                                                                  className="text-grey1 text-md">{option.title}</Text>
                                                          </View>

                                                          <Text
                                                              className="text-white text-3xl mb-2  font-bold">¥ {option.amount}</Text>

                                                      </TouchableOpacity>
                                                  )
                                              }}/>

                                    </View>
                                    <Button
                                        disabled={disabled || !isAgreed}
                                        text={t('payment.confirm')}
                                        onPress={submit}
                                    />
                                    {/* 服务条款 */}
                                    <View className="flex-row items-center mt-3 pr-5">
                                        <TouchableOpacity
                                            onPress={() => setIsAgreed(!isAgreed)}
                                            className="w-4 h-4 border border-[#666] rounded-full mr-2 items-center justify-center"
                                        >
                                            {isAgreed && (
                                                <View
                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                        isAgreed ? "bg-primary" : "bg-transparent"
                                                    }`}
                                                />
                                            )}
                                        </TouchableOpacity>
                                        <Text className="text-grey3 text-xs">
                                            {t("agreeTerms")}
                                            <Text className="text-primary"
                                                  onPress={() => router.push('/sub_terms')}>《Veogo付费协议》(含自动付费条款)，</Text>
                                            您可在购买后在 App Store中的“账户设置”功能来关闭自动续费。
                                            <Text className="text-primary"
                                                  onPress={() => router.push('/terms')}>{t("terms")}</Text>
                                            {t("and")}
                                            <Text className="text-primary"
                                                  onPress={() => router.push('/privacy')}>{t("privacy")}</Text>
                                        </Text>
                                    </View>
                                </View>

                        }

                    </View>

                </View>
            </LinearGradient>
        </>
    );
};

export default MetaSub;
