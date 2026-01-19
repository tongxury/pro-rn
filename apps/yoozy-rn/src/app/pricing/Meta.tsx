import React, {useCallback, useMemo, useState} from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import {Text, TouchableOpacity, View} from "react-native";
import {useTranslation} from "@/i18n/translation";
import Button from "@/components/ui/Button";
import usePricing from "@/hooks/usePricing";
import {FlashIcon} from "@/constants/scene_icons";

import {useQuery} from "@tanstack/react-query";
import {fetchCreditState} from "@/api/payment";
import {useFocusEffect} from "expo-router";
import {Grid} from "@/components/ui/Grid";
import useDateFormatter from "@/hooks/useDateFormatter";
import {LinearGradient} from 'expo-linear-gradient';

const Meta = ({onSubmit, disabled}: {
    onSubmit: (plan: any) => void,
    disabled?: boolean
}) => {
    const {packages: plans} = usePricing()
    const [current, setCurrent] = useState<any>(plans[1]);
    const {t} = useTranslation();
    const {formatFromNow} = useDateFormatter()

    const { colors } = useTailwindVars();

    const {data: pr, isLoading, refetch} = useQuery({
        queryKey: ["creditState"],
        queryFn: fetchCreditState,
        staleTime: 60 * 60 * 1000,
    });

    useFocusEffect(useCallback(() => {
        void refetch()
    }, []))

    const state = useMemo(() => pr?.data?.data, [pr])

    const submit = () => {
        onSubmit(current,)
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
                        <View className="items-center mb-8">
                            <View
                                className="w-20 h-20 mb-6 rounded-full bg-muted shadow-lg justify-center items-center">
                                <FlashIcon
                                    size={35}
                                    color={colors.primary}
                                />
                            </View>

                            <Text className="text-white text-lg mb-2.5">
                                {t('payment.balance')}
                            </Text>

                            <Text className="text-white text-6xl font-bold mb-2">
                                {state?.remaining || 0}
                            </Text>

                            {
                                state?.expireAt &&
                                <View className="bg-muted px-4 py-2 rounded-full flex-row items-center">
                                    <Text className="text-muted-foreground text-sm">
                                        {t("payment.expireAt")}{formatFromNow(state?.expireAt)}
                                    </Text>
                                </View>
                            }

                        </View>

                        <View className={'rounded-lg  bg-card'}>
                            <Text className="text-white m-[15px] text-xl font-bold mb-6">
                                {t('payment.selectQuota')}
                            </Text>

                            <Grid data={plans} spacing={15} containerStyle={{padding: 15}}
                                  renderItem={(option, index) => {
                                      return (
                                          <TouchableOpacity
                                              key={option.id}
                                              activeOpacity={0.8}
                                              onPress={() => setCurrent(option)}
                                              className={`p-4 rounded-xl border-2 items-center relative ${
                                                  option.id === current?.id
                                                      ? "border-primary bg-muted"
                                                      : "border-border bg-muted"
                                              }`}
                                          >
                                              {option.tag && (
                                                  <View
                                                      className="absolute -top-2 -right-2 bg-red-500 px-3 py-1 rounded-full">
                                                      <Text className="text-white text-xs font-bold">
                                                          {t(`payment.${option.tag}`)}
                                                      </Text>
                                                  </View>
                                              )}

                                              <View className="flex-row items-center mb-3 gap-0.5">
                                                  <FlashIcon size={20} color={colors.primary}/>
                                                  <Text
                                                      className="text-muted-foreground text-lg">{option.title}</Text>
                                              </View>

                                              <Text
                                                  className="text-white text-3xl mb-3  font-bold">¥ {option.amount}</Text>

                                              <Text
                                                  className="text-muted-foreground text-sm">{t(`payment.periodOfValidity`, {months: option.months})}</Text>
                                          </TouchableOpacity>
                                      )
                                  }}/>

                        </View>

                    </View>
                    <Button
                        disabled={disabled}
                        text={disabled ? '加载中...' : t('payment.confirm')}
                        onPress={submit}
                    />
                </View>
            </LinearGradient>
        </>
    );
};

export default Meta;
