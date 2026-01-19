import React from 'react';
import {StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {router} from 'expo-router';
import SocialIcon from '@/assets/svgs';
import {HStack} from 'react-native-flex-layout';
import {useAccounts} from '@/hooks/useAccounts';
import {Feather} from "@expo/vector-icons";

const DefaultAccount = ({refresh, style}: {
    refresh?: boolean,
    style?: StyleProp<ViewStyle>;
}) => {

    const {defaultAccount} = useAccounts();

    if (!defaultAccount) return null;

    return (
        <TouchableOpacity
            className="bg-background px-3 h-[43px] rounded-lg shadow-sm border border-gray-200 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push('/account/list')}
            style={style}
        >
            <HStack items={'center'} spacing={8}>
                {/* @ts-ignore 图标容器 */}
                <SocialIcon name={defaultAccount?.platform} size={28}/>

                {/* 昵称 */}
                <Text className="text-[15px] font-semibold text-white ml-2">
                    {/* @ts-ignore 图标容器 */}
                    {defaultAccount?.nickname}
                </Text>

                {/* 右箭头 - 使用真实的 icon */}
                <Feather
                    name="chevron-right"
                    size={18}
                    color="#6B7280"
                />
            </HStack>
        </TouchableOpacity>
    );
};

export default DefaultAccount;
