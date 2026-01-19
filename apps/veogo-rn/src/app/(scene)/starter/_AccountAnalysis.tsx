import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useColors} from '@/hooks/uesColors';
import {useTranslation} from '@/i18n/translation';
import {packPersonalAccountResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {useAccounts} from "@/hooks/useAccounts";
import AccountInfo from "@/components/account/AccountInfo";
import {router} from "expo-router";
import {Feather} from "@expo/vector-icons";

function Component({
                       scene,
                       sessionId,
                   }: {
    scene: string;
    sessionId: string;
}) {
    const colors = useColors();
    const {t} = useTranslation();

    const promptId = "accountAnalysis"
    const {defaultAccount} = useAccounts();

    return (
        <View className={'flex-1 px-5'}>
            <Text
                className="text-lg text-center text-primary mb-[30px] bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                {t("scene.accountAnalysisTitle")}
            </Text>
            <TouchableOpacity activeOpacity={0.9}
                              onPress={() => router.navigate({pathname: '/account/list'})}
                              className={'flex-1'}
            >
                {
                    defaultAccount ?
                        <AccountInfo account={defaultAccount}/>
                        :
                        <View
                            className="h-[150px] rounded-lg flex-row items-center p-5 gap-2 justify-center border-dashed border border-grey0 overflow-hidden"
                        >
                            <Feather name={'link'} style={{color: colors.grey2}}></Feather>
                            <Text className={'text-md text-grey2'}>
                                {t("scene.accountAnalysisTitleBind")}
                            </Text>
                        </View>
                }
            </TouchableOpacity>

            <Submitter
                scene={scene}
                sessionId={sessionId}
                promptId={promptId}
                resources={defaultAccount ? [packPersonalAccountResource(defaultAccount)] : []}
                onComplete={() => {
                }}
                accountRequired
            ></Submitter>
        </View>
    );
};

export default Component;
