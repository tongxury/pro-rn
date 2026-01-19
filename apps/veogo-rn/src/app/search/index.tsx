import {Text, TextInput, TouchableOpacity, View} from "react-native"
import {router} from "expo-router";
import React, {useState} from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import Octicons from "@expo/vector-icons/Octicons";
import {useTranslation} from "@/i18n/translation";
import History from './History'
import {useStorageState} from "@/hooks/common/useStorageState";
import Result from "./Result";
import Ionicons from '@expo/vector-icons/Ionicons';
import {Feather} from "@expo/vector-icons";


const Search = () => {

    const {colors} = useTailwindVars()
    const {t} = useTranslation()

    const [values, setValues] = useStorageState<string[]>('search.history')
    const [keyword, setKeyword] = useState<string>()
    const [inputKeyword, setInputKeyword] = useState<string>()

    const onSearch = async () => {
        if (!inputKeyword) return

        search(inputKeyword)
        // setKeyword(inputKeyword)

        // void setValues((prevValue) => [inputKeyword, ...(prevValue || [])])
    }

    const search = (keyword: string) => {
        setKeyword(keyword)
        setInputKeyword(keyword)

        // void setValues((prevValue) => [keyword, ...(prevValue || [])])
    }


    return (
        <View className='flex-1 bg-background'>
            <View className={'flex-row gap-3 px-5 py-3 items-center'}>
                <Feather
                    onPress={() => {
                        router.back();
                    }}
                    name="arrow-left"
                    size={24}
                    color={colors.grey0}
                />
                <View
                    className={'flex-1 flex-row gap-2 items-center justify-between bg-background1 rounded-full px-5 py-3'}>
                    <Octicons name="search" color={colors.grey3} size={17}/>
                    <TextInput value={inputKeyword}
                               onChangeText={text => setInputKeyword(text)} autoFocus maxLength={20}
                               className={'text-white flex-1'} placeholder={t("leaderboard.search")}/>

                    {
                        inputKeyword && <Ionicons onPress={() => setInputKeyword('')} name="close-circle" size={16}
                                                  color={colors.grey3}/>
                    }
                </View>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onSearch}>
                    <Text className={'text-white text-md'}>{t('search.name')}</Text>
                </TouchableOpacity>
            </View>

            {keyword ?
                <Result keyword={keyword}/> :
                <History data={[...new Set(values)]} onChange={setValues} onItemClick={item => search(item)}/>
            }
        </View>
    )
}

export default Search
