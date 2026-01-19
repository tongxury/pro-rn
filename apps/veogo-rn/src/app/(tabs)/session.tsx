import {Text, View} from "react-native";
import {useTranslation} from "@/i18n/translation";
import React from "react";
import AdvancedSessionList from "@/components/session/AdvancedList";
import OngoingQuestionList from "@/components/question/LatestList";
import {useColors} from "@/hooks/uesColors";

export default function Screen() {

    const {t} = useTranslation();
    const {background} = useColors()

    return (

        <View className={'bg-background h-full'}>
            <OngoingQuestionList/>
            {/*<Text className={'px-[15px] text-md text-grey2 mt-[15px]'}>{t('allHistory')}</Text>*/}
            <AdvancedSessionList/>
        </View>
    )
}
