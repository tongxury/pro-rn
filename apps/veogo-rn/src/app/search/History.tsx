// components/SearchHistory.tsx
import React from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {useTranslation} from "@/i18n/translation";
import AntDesign from '@expo/vector-icons/AntDesign';
import useTailwindVars from "@/hooks/useTailwindVars";


const History = ({data, onItemClick, onChange}: {
    data?: string[],
    onItemClick: (item: string) => void,
    onChange: (values: string[]) => void
}) => {

    const {colors} = useTailwindVars()

    const {t} = useTranslation()

    if (!data?.length) {
        return null
    }

    return (
        <View className="px-5 gap-2">
            <View className="flex-row justify-between items-center mb-2 mt-2">
                <Text className="text-white text-sm">{t('search.history')}</Text>
                <AntDesign onPress={() => onChange([])} name="delete" size={14} color={colors.grey3}/>
            </View>
            <View className={'flex-row items-center flex-wrap gap-2'}>
                {data?.map((item, index) => {
                    return <TouchableOpacity activeOpacity={0.9}
                                             key={index}
                                             onPress={() => onItemClick(item)}
                                             className="bg-background2 rounded-full px-3 py-1"
                    >
                        <Text className="text-white">{item}</Text>
                    </TouchableOpacity>
                })
                }
            </View>
        </View>
    );
};

export default History;
