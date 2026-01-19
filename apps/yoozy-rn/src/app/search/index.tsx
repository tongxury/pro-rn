import InspirationList from "@/app/inspiration/list";
import TemplateList from "@/app/template/list";
import ScreenContainer from "@/components/ScreenContainer";
import { useStorageState } from "@/hooks/common/useStorageState";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import { Feather } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import History from './History';

type TabType = "video" | "inspiration";
const tabList: { id: number; name: string; value: TabType }[] = [
    {
        id: 0,
        name: "视频库",
        value: "video",
    },
    {
        id: 1,
        name: "灵感库",
        value: "inspiration",
    },
];

const Search = () => {

    const { colors } = useTailwindVars()
    const { t } = useTranslation()

    const [values, setValues] = useStorageState<string[]>('search.history')
    const [keyword, setKeyword] = useState<string>()
    const [inputKeyword, setInputKeyword] = useState<string>()
    const [activeTab, setActiveTab] = useState<TabType>(tabList[0].value);

    const onSearch = async () => {
        if (!inputKeyword) return

        search(inputKeyword)
        // setKeyword(inputKeyword)

        void setValues((prevValue) => [inputKeyword, ...(prevValue || [])])
    }

    const search = (keyword: string) => {
        setKeyword(keyword)
        setInputKeyword(keyword)

        void setValues((prevValue) => [keyword, ...(prevValue || [])])
    }


    return (
        <ScreenContainer stackScreenProps={{
            animation: "fade",
            animationDuration: 1,
        }}>
            <View className={'flex-row gap-3 px-5 py-3 items-center'}>
                <Feather
                    onPress={() => {
                        router.back();
                    }}
                    name="arrow-left"
                    size={24}
                    color={colors.foreground}
                />
                <View
                    className={'flex-1 flex-row gap-2 items-center justify-between bg-muted rounded-full px-5 py-3'}>
                    <Octicons name="search" color={colors['muted-foreground']} size={17} />
                    <TextInput value={inputKeyword}
                        onChangeText={text => setInputKeyword(text)} autoFocus maxLength={20}
                        onSubmitEditing={onSearch}
                        className={'flex-1'} placeholder={activeTab === 'video' ? "搜索模版" : "搜索灵感"} />

                    {
                        inputKeyword && <Ionicons onPress={() => { setInputKeyword(''); setKeyword(undefined); }} name="close-circle" size={16}
                            color={colors['muted-foreground']} />
                    }
                </View>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onSearch}>
                    <Text className={'text-md'}>{t('search.name')}</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row items-center justify-center gap-8 py-2 border-b border-white/5 mb-2">
                {tabList.map((item) => {
                    const isActive = activeTab === item.value;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setActiveTab(item.value)}
                            className="pb-2 relative"
                            activeOpacity={0.8}
                        >
                            <Text
                                className={`text-sm tracking-wide ${isActive ? "font-bold text-primary" : "text-muted-foreground font-medium"}`}
                                style={{ fontSize: isActive ? 16 : 14 }}
                            >
                                {item.name}
                            </Text>
                            {isActive && (
                                <View
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-sm"
                                    style={{
                                        shadowColor: colors.primary,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.5,
                                        shadowRadius: 4,
                                    }}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View className="flex-1">
                {keyword ? (
                    activeTab === "video" ? (
                        <TemplateList query={keyword} />
                    ) : (
                        <InspirationList query={keyword} />
                    )
                ) : (
                    <History data={[...new Set(values)]} onChange={setValues} onItemClick={item => search(item)} />
                )}
            </View>
        </ScreenContainer>
    )
}

export default Search
