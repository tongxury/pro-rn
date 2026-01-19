// components/SearchHistory.tsx
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import AntDesign from '@expo/vector-icons/AntDesign';
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";


const History = ({ data, onItemClick, onChange }: {
    data?: string[],
    onItemClick: (item: string) => void,
    onChange: (values: string[]) => void
}) => {

    const { colors } = useTailwindVars()

    const { t } = useTranslation()

    if (!data?.length) {
        return null
    }

    return (
        <View className="px-5 gap-2">
            <View className="flex-row justify-between items-center mb-2 mt-2">
                <Text className="text-sm">{t('search.history')}</Text>
                <AntDesign onPress={() => onChange([])} name="delete" size={14} color={colors['muted-foreground']} />
            </View>
            <View className={'flex-row items-center flex-wrap gap-2'}>
                {data?.map((item, index) => {
                    return <TouchableOpacity activeOpacity={0.9}
                        key={index}
                        onPress={() => onItemClick(item)}
                        className="bg-muted rounded-full px-3 py-1"
                    >
                        <Text className="">{item}</Text>
                    </TouchableOpacity>
                })
                }
            </View>
        </View>
    );
};

export default History;
